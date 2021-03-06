/*jslint node: true*/

"use strict";

var fs = require("fs"),
    q = require("q"),

    app = (function app() {
        var CONFIG_PATH = "./config.json",
            DEFAULT_CONFIG = {
                httpServer: {hostname: "localhost", port: 3000},
                dbServer: {
                    https: true,
                    hostname: "localhost",
                    port: 5984,
                    user: "user",
                    pass: "pass",
                    db: "dagelijkse-kost"
                },
                scheduler: {
                    archiver: {hour: 17, minute: 0}
                }
            },
            TAB_SIZE = 2,

            readConfig = (function () {
                var readFile = q.denodeify(fs.readFile),
                    writeFile = q.denodeify(fs.writeFile);

                return function readConfig() {
                    return readFile(CONFIG_PATH, {encoding: "utf8"}).fail(function () {
                        return writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, TAB_SIZE)).
                            then(readConfig);
                    });
                };
            }()),

            run = function run() {
                readConfig().
                    fail(function (error) {
                        throw {
                            name: "unexpected error",
                            message: "expected to be able to read config",
                            originalError: error
                        };
                    }).
                    done();
            },

            initialise = function initialise() {
                return {run: run};
            };

        return initialise();
    }());

app.run();
