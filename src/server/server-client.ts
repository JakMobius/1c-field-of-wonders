import {connection as WebSocketConnection} from "websocket";
import {Message} from "../message";

export class ServerClient {
    word: string
    guessed: boolean[]
    connection: WebSocketConnection
    attempts: number

    constructor(connection: WebSocketConnection, attempts: number) {
        this.connection = connection
        this.attempts = attempts
    }

    setWord(word: string) {
        if(word.length > this.attempts) {
            this.attempts = word.length;
        }
        this.word = word
        this.guessed = Array(word.length).fill(false)
    }

    getGuessedWord() {
        return this.guessed.map((value, index) => value ? this.word[index] : "*").join("")
    }

    send(data: Message) {
        this.connection.send(JSON.stringify(data))
    }

    sendMessage(message: string) {
        this.send({
            type: "message",
            message: message
        })
    }

    loseAttempt() {
        this.attempts--;
        if(this.attempts == 0) {
            this.sendMessage("You've failed to guess the word within your given attempts. Game over.")
            this.sendMessage("The word puzzlled was " + this.word);
            this.disconnect();
        } else {
            this.sendWord();
        }
    }

    disconnect() {
        this.connection.close();
    }

    sendWord() {
        this.send({
            type: "word",
            word: this.getGuessedWord(),
            attempts: this.attempts
        })
    }

    allGuessed(): boolean {
        for(let guess of this.guessed) {
            if(!guess) return false
        }
        return true
    }

    sendWin() {
        this.sendMessage("You've guessed the word '" + this.word + "', congratulations!")
        this.disconnect();
    }

    checkGuessedLetter(letter: string) {
        let index = this.word.indexOf(letter)
        if(index == -1) {
            this.sendMessage("There is no '" + letter + "' letter in the word.")
            this.loseAttempt();
        } else if(this.guessed[index]) {
            this.sendMessage("You've already guessed this letter.")
            this.sendWord();
        } else {
            this.sendMessage("You've guessed letter '" + letter + "'.")
            while(index != -1) {
                this.guessed[index] = true;
                index = this.word.indexOf(letter, index + 1)
            }
            if(this.allGuessed()) {
                this.sendWin();
            } else {
                this.loseAttempt();
            }
        }
    }

    checkGuessedWord(word: string) {
        if(this.word == word) {
            this.sendWin();
        } else {
            this.sendMessage("'" + word + "' is not the word.")
            this.loseAttempt();
        }
    }
}