import * as fs from "fs";
import {Server, ServerConfig} from "./server";

const config = JSON.parse(fs.readFileSync("server-config.json", 'utf-8'))

new Server(config as any as ServerConfig).run()