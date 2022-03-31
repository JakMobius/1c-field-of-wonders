import * as fs from "fs";
import {Client} from "./client";

const config = JSON.parse(fs.readFileSync("./client-config.json", 'utf-8'))

const client = new Client(config)
client.on("error", () => process.exit(-1))
client.on("game-over", () => process.exit(0))
client.connect()