import {client as WebSocketClient, connection as WebSocketConnection} from "websocket";
import {Message} from "../message";
import {stdio} from "../stdio";
import { EventEmitter } from "events";

export interface ClientConfig {
    url?: string
}

export class Client extends EventEmitter {
    config: ClientConfig
    client?: WebSocketClient
    connection?: WebSocketConnection

    constructor(config: ClientConfig) {
        super()
        this.config = config;
    }

    connect() {
        this.client = new WebSocketClient();
        this.client.connect(this.config.url, 'echo-protocol');

        this.client.on('connectFailed', (error) => {
            console.log('Connect Error: ' + error.toString());
            this.client = null;
            this.emit("error")
        });

        this.client.on('connect', (connection) => {

            console.log('Connected to server');
            this.connection = connection;

            this.connection.on('error', (error) => {
                console.log("Failed to connect to server: " + error.toString());
                this.emit("error")
            });

            this.connection.on('close', () => {
                console.log("Connection closed");
                this.client.abort();
                this.connection = null;
                this.client = null;
                this.emit("game-over")
            });

            this.connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    try {
                        this.handleMessage(JSON.parse(message.utf8Data) as any as Message);
                    } catch(e) {
                        console.error("Malformed server message received: " + e)
                    }
                }
            });
        });
    }

    sendMessage(message: Message) {
        this.connection.send(JSON.stringify(message));
    }

    sendWordGuess(guess: string) {
        this.sendMessage({
            type: "guess",
            word: guess
        });
    }

    handleMessage(message: Message) {
        if(message.type == "word") {
            console.log("Your word: " + message.word + ", you have " + message.attempts + " attempts left");
            stdio.question("Guess a word: ", (word) => {
                this.sendWordGuess(word)
            });
        }
        if(message.type == "message") {
            console.log("[Server]: " + message.message);
        }
    }
}