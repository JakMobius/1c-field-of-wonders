import * as http from "http";

export interface WordGeneratorConfig {
    useWebGenerator: boolean,
    localWords: string[]
}

export class WordGenerator {
    config: WordGeneratorConfig

    constructor(config: WordGeneratorConfig) {
        this.config = config
    }

    generate(): Promise<string> {
        if(!this.config.useWebGenerator) {
            return this.randomLocalWord();
        }
        return this.fetchWordFromWeb().catch((error) => {
            console.error(error);
            console.error("Failed to fetch word from web, fallback to local word list")
            return this.randomLocalWord();
        });
    }

    randomLocalWord(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if(!this.config.localWords || !this.config.localWords.length) {
                reject(new Error("No local words available"));
            }

            resolve(this.config.localWords[Math.floor(Math.random() * this.config.localWords.length)])
        });
    }

    fetchWordFromWeb(): Promise<string> {
        return new Promise((resolve, reject) => {

            const requestOptions = {
                hostname: "free-generator.ru",
                method: 'GET',
                path: "/generator.php?action=word&type=1"
            }

            const request = http.request(requestOptions, result => {

                if(result.statusCode != 200) {
                    reject(new Error("Unsuccessful status code: " + result.statusCode));
                    return;
                }

                let data = "";

                result.on('data', chunk => { data += chunk; })
                result.on("end", () => {
                    try {
                        let json = JSON.parse(data);
                        if(!json || !json.word || !json.word.word) {
                            reject(new Error("Server returned malformed data"))
                        }
                        resolve(json.word.word);
                    } catch(error) {
                        reject(error)
                    }
                });
            })

            request.on('error', reject);
            request.end()
        });
    }
}