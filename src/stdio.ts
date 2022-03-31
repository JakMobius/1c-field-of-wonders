import * as readline from "readline";

export const stdio = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});