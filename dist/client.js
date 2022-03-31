(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({0:[function(require,module,exports){
"use strict";

var fs = _interopRequireWildcard(require("fs"));

var _client = require("./client");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const config = JSON.parse(fs.readFileSync("./client-config.json", 'utf-8'));
const client = new _client.Client(config);
client.on("error", () => process.exit(-1));
client.on("game-over", () => process.exit(0));
client.connect();

},{"./client":1,"fs":"fs"}],1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;

var _websocket = require("websocket");

var _stdio = require("../stdio");

var _events = require("events");

class Client extends _events.EventEmitter {
  constructor(config) {
    super();
    this.config = void 0;
    this.client = void 0;
    this.connection = void 0;
    this.config = config;
  }

  connect() {
    this.client = new _websocket.client();
    this.client.connect(this.config.url, 'echo-protocol');
    this.client.on('connectFailed', error => {
      console.log('Connect Error: ' + error.toString());
      this.client = null;
      this.emit("error");
    });
    this.client.on('connect', connection => {
      console.log('Connected to server');
      this.connection = connection;
      this.connection.on('error', error => {
        console.log("Failed to connect to server: " + error.toString());
        this.emit("error");
      });
      this.connection.on('close', () => {
        console.log("Connection closed");
        this.client.abort();
        this.connection = null;
        this.client = null;
        this.emit("game-over");
      });
      this.connection.on('message', message => {
        if (message.type === 'utf8') {
          try {
            this.handleMessage(JSON.parse(message.utf8Data));
          } catch (e) {
            console.error("Malformed server message received: " + e);
          }
        }
      });
    });
  }

  sendMessage(message) {
    this.connection.send(JSON.stringify(message));
  }

  sendWordGuess(guess) {
    this.sendMessage({
      type: "guess",
      word: guess
    });
  }

  handleMessage(message) {
    if (message.type == "word") {
      console.log("Your word: " + message.word + ", you have " + message.attempts + " attempts left");

      _stdio.stdio.question("Guess a word: ", word => {
        this.sendWordGuess(word);
      });
    }

    if (message.type == "message") {
      console.log("[Server]: " + message.message);
    }
  }

}

exports.Client = Client;

},{"../stdio":2,"events":"events","websocket":"websocket"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stdio = void 0;

var readline = _interopRequireWildcard(require("readline"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const stdio = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
exports.stdio = stdio;

},{"readline":"readline"}]},{},[0])
//# sourceMappingURL=client.js.map
