(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({0:[function(require,module,exports){
"use strict";

var fs = _interopRequireWildcard(require("fs"));

var _server = require("./server");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const config = JSON.parse(fs.readFileSync("server-config.json", 'utf-8'));
new _server.Server(config).run();

},{"./server":1,"fs":"fs"}],1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = void 0;

var _websocket = require("websocket");

var http = _interopRequireWildcard(require("http"));

var _wordGenerator = require("./word-generator");

var _serverClient = require("./server-client");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Server {
  constructor(config) {
    this.config = void 0;
    this.wsServer = void 0;
    this.httpServer = void 0;
    this.wordGenerator = void 0;
    this.config = config;
    this.wordGenerator = new _wordGenerator.WordGenerator({
      localWords: config.localWords,
      useWebGenerator: config.useWebGenerator
    });
  }

  run() {
    this.httpServer = http.createServer();
    this.httpServer.listen(this.config.port);
    console.log("Server is listening on port " + this.config.port);
    this.wsServer = new _websocket.server({
      httpServer: this.httpServer,
      autoAcceptConnections: false
    });
    this.listen();
  }

  destroy() {
    this.wsServer.shutDown();
    this.httpServer.close();
    this.wsServer = null;
    this.httpServer = null;
  }

  listen() {
    this.wsServer.on('request', request => {
      this.wordGenerator.generate().then(word => {
        const connection = request.accept('echo-protocol', request.origin);
        const client = new _serverClient.ServerClient(connection, this.config.attempts);
        client.setWord(word);
        this.setupClient(client);
      }).catch(error => {
        console.error(error);
        console.error("Failed to generate word, disconnecting client");
        request.reject(500, "Failed to initialize your session");
      });
    });
  }

  setupClient(client) {
    client.connection.on('message', message => {
      if (message.type === 'utf8') {
        try {
          this.onClientMessage(client, JSON.parse(message.utf8Data));
        } catch (e) {
          console.error("Malformed client message: " + e);
        }
      }
    });
    client.sendWord();
    console.log("New client connected, its puzzled word is '" + client.word + "'");
  }

  onClientMessage(client, message) {
    if (message.type == "guess") {
      let word = message.word.toLowerCase();

      if (word.length == 1) {
        client.checkGuessedLetter(word);
      } else if (word.length == client.word.length) {
        client.checkGuessedWord(word);
      } else {
        client.sendMessage("Please, either send a one word or an entire word as your guess.");
        client.sendWord();
      }
    }
  }

}

exports.Server = Server;

},{"./server-client":3,"./word-generator":2,"http":"http","websocket":"websocket"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WordGenerator = void 0;

var http = _interopRequireWildcard(require("http"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class WordGenerator {
  constructor(config) {
    this.config = void 0;
    this.config = config;
  }

  generate() {
    if (!this.config.useWebGenerator) {
      return this.randomLocalWord();
    }

    return this.fetchWordFromWeb().catch(error => {
      console.error(error);
      console.error("Failed to fetch word from web, fallback to local word list");
      return this.randomLocalWord();
    });
  }

  randomLocalWord() {
    return new Promise((resolve, reject) => {
      if (!this.config.localWords || !this.config.localWords.length) {
        reject(new Error("No local words available"));
      }

      resolve(this.config.localWords[Math.floor(Math.random() * this.config.localWords.length)]);
    });
  }

  fetchWordFromWeb() {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: "free-generator.ru",
        method: 'GET',
        path: "/generator.php?action=word&type=1"
      };
      const request = http.request(requestOptions, result => {
        if (result.statusCode != 200) {
          reject(new Error("Unsuccessful status code: " + result.statusCode));
          return;
        }

        let data = "";
        result.on('data', chunk => {
          data += chunk;
        });
        result.on("end", () => {
          try {
            let json = JSON.parse(data);

            if (!json || !json.word || !json.word.word) {
              reject(new Error("Server returned malformed data"));
            }

            resolve(json.word.word);
          } catch (error) {
            reject(error);
          }
        });
      });
      request.on('error', reject);
      request.end();
    });
  }

}

exports.WordGenerator = WordGenerator;

},{"http":"http"}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerClient = void 0;

class ServerClient {
  constructor(connection, attempts) {
    this.word = void 0;
    this.guessed = void 0;
    this.connection = void 0;
    this.attempts = void 0;
    this.connection = connection;
    this.attempts = attempts;
  }

  setWord(word) {
    if (word.length > this.attempts) {
      this.attempts = word.length;
    }

    this.word = word;
    this.guessed = Array(word.length).fill(false);
  }

  getGuessedWord() {
    return this.guessed.map((value, index) => value ? this.word[index] : "*").join("");
  }

  send(data) {
    this.connection.send(JSON.stringify(data));
  }

  sendMessage(message) {
    this.send({
      type: "message",
      message: message
    });
  }

  loseAttempt() {
    this.attempts--;

    if (this.attempts == 0) {
      this.sendMessage("You've failed to guess the word within your given attempts. Game over.");
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
    });
  }

  allGuessed() {
    for (let guess of this.guessed) {
      if (!guess) return false;
    }

    return true;
  }

  sendWin() {
    this.sendMessage("You've guessed the word '" + this.word + "', congratulations!");
    this.disconnect();
  }

  checkGuessedLetter(letter) {
    let index = this.word.indexOf(letter);

    if (index == -1) {
      this.sendMessage("There is no '" + letter + "' letter in the word.");
      this.loseAttempt();
    } else if (this.guessed[index]) {
      this.sendMessage("You've already guessed this letter.");
      this.sendWord();
    } else {
      this.sendMessage("You've guessed letter '" + letter + "'.");

      while (index != -1) {
        this.guessed[index] = true;
        index = this.word.indexOf(letter, index + 1);
      }

      if (this.allGuessed()) {
        this.sendWin();
      } else {
        this.loseAttempt();
      }
    }
  }

  checkGuessedWord(word) {
    if (this.word == word) {
      this.sendWin();
    } else {
      this.sendMessage("'" + word + "' is not the word.");
      this.loseAttempt();
    }
  }

}

exports.ServerClient = ServerClient;

},{}]},{},[0])
//# sourceMappingURL=server.js.map
