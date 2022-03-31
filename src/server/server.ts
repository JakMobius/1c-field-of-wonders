import {server as WebSocketServer} from 'websocket'
import * as http from "http";
import {WordGenerator} from "./word-generator";
import {ServerClient} from "./server-client";
import {Message} from "../message";

export interface ServerConfig {
    port: number,
    localWords: string[],
    useWebGenerator: boolean,
    attempts: number
}

export class Server {
    config?: ServerConfig
    wsServer?: WebSocketServer;
    httpServer?: http.Server;
    wordGenerator?: WordGenerator

    constructor(config: ServerConfig) {
        this.config = config

        this.wordGenerator = new WordGenerator({
            localWords: config.localWords,
            useWebGenerator: config.useWebGenerator
        });
    }

    run() {
        this.httpServer = http.createServer();

        this.httpServer.listen(this.config.port)

        console.log("Server is listening on port " + this.config.port)

        this.wsServer = new WebSocketServer({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });

        this.listen();
    }

    destroy() {
        this.wsServer.shutDown()
        this.httpServer.close()

        this.wsServer = null
        this.httpServer = null
    }

    private listen() {
        this.wsServer.on('request', (request) => {
            this.wordGenerator.generate().then((word) => {
                const connection = request.accept('echo-protocol', request.origin);
                const client = new ServerClient(connection, this.config.attempts)
                client.setWord(word)
                this.setupClient(client);
            }).catch((error) => {
                console.error(error)
                console.error("Failed to generate word, disconnecting client")
                request.reject(500, "Failed to initialize your session")
            })

        });
    }

    private setupClient(client: ServerClient) {
        client.connection.on('message', (message) => {
            if (message.type === 'utf8') {
                try {
                    this.onClientMessage(client, JSON.parse(message.utf8Data) as any as Message)
                } catch(e) {
                    console.error("Malformed client message: " + e);
                }
            }
        });

        client.sendWord();
        console.log("New client connected, its puzzled word is '" + client.word + "'");
    }

    private onClientMessage(client: ServerClient, message: Message) {
        if(message.type == "guess") {
            let word = (message.word as string).toLowerCase()
            if (word.length == 1) {
                client.checkGuessedLetter(word);
            } else if (word.length == client.word.length) {
                client.checkGuessedWord(word);
            } else {
                client.sendMessage("Please, either send a one word or an entire word as your guess.")
                client.sendWord();
            }
        }
    }
}
