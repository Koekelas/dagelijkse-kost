/*jslint node: true*/

"use strict";

var fs = require("fs"),
    url = require("url"),
    util = require("util"),
    dnscache = require("dnscache"),
    lodash = require("lodash"),
    Pouchdb = require("pouchdb"),
    q = require("q"),
    archiver = require("./lib/archiver"),

    app = (function app() {
        var ONE_SECOND = 1,
            CONFIG_PATH = "./config.json",
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
                    writeFile = q.denodeify(fs.writeFile),
                    constructDbString = function constructDbString(dbConfig) {
                        return url.format({
                            protocol: dbConfig.https ? "https" : "http",
                            hostname: dbConfig.hostname,
                            port: dbConfig.port,
                            auth: util.format("%s:%s", dbConfig.user, dbConfig.pass),
                            pathname: dbConfig.db
                        });
                    };

                return function readConfig() {
                    return readFile(CONFIG_PATH, {encoding: "utf8"}).then(
                        function onSuccess(config) {
                            var c = JSON.parse(config),
                                openshiftConfig = {
                                    hostname: process.
                                        env.
                                        OPENSHIFT_NODEJS_IP,
                                    port: process.
                                        env.
                                        OPENSHIFT_NODEJS_PORT
                                },
                                httpConfig = c.httpServer,
                                dbConfig = c.dbServer;
                            if (openshiftConfig.hostname) {
                                lodash.merge(httpConfig, openshiftConfig);
                            }
                            dbConfig.connectionString = constructDbString(dbConfig);
                            return c;
                        },
                        function onFailure() {
                            return writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, TAB_SIZE)).
                                then(readConfig);
                        }
                    );
                };
            }()),

            run = function run() {
                readConfig().
                    then(
                        function onSuccess(config) {
                            var db = new Pouchdb(config.
                                    dbServer.
                                    connectionString),
                                a = archiver({db: db});
                            a.
                                archiveRecipes().
                                fail(function (error) {
                                    console.log({
                                        name: "unexpected error",
                                        message: "expected to be able to archive recipes",
                                        originalError: error
                                    });
                                }).
                                done();
                        },
                        function onFailure(error) {
                            throw {
                                name: "unexpected error",
                                message: "expected to be able to read config",
                                originalError: error
                            };
                        }
                    ).
                    done();
            },

            initialise = function initialise() {
                dnscache({enable: true, ttl: ONE_SECOND * 60 * 10}); //dnscache modifies the standard dns
                                                                     //library
                return {run: run};
            };

        return initialise();
    }());

app.run();
