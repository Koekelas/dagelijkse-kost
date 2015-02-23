/*jslint node: true*/

"use strict";

var url = require("url"),
    lodash = require("lodash"),
    db = require("./lib/db"),
    emberApp = require("./lib/emberApp"),

    app = (function app() {
        var readConfig = function readConfig() {
                var config = require("./config.json"),
                    dbConfig = config.dbServer;
                return lodash.merge(
                    config,
                    {
                        dbServer: {
                            connectionString: url.format({
                                protocol: dbConfig.https ? "https" : "http",
                                hostname: dbConfig.hostname,
                                port: dbConfig.port,
                                pathname: dbConfig.db
                            })
                        }
                    }
                );
            },

            run = function run() {
                emberApp({db: db({config: readConfig().dbServer})});
            },

            initialise = function initialise() {
                return {run: run};
            };

        return initialise();
    }());

app.run();
