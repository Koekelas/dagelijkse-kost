/*jslint node: true*/

"use strict";

var fs = require("fs"),
    url = require("url"),
    util = require("util"),
    dnscache = require("dnscache"),
    lodash = require("lodash"),
    q = require("q"),
    scheduler = require("node-schedule"),
    archiver = require("./lib/archiver"),
    db = require("./lib/db"),

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
                    writeFile = q.denodeify(fs.writeFile);

                return function readConfig() {
                    return readFile(CONFIG_PATH, {encoding: "utf8"}).then(
                        function onSuccess(config) {
                            var c = JSON.parse(config),
                                dbConfig = c.dbServer;
                            return lodash.merge(
                                c,
                                {
                                    httpServer: {
                                        hostname: process.
                                            env.
                                            OPENSHIFT_NODEJS_IP,
                                        port: process.
                                            env.
                                            OPENSHIFT_NODEJS_PORT
                                    },
                                    dbServer: {
                                        connectionString: url.format({
                                            protocol: dbConfig.https ? "https" : "http",
                                            hostname: dbConfig.hostname,
                                            port: dbConfig.port,
                                            auth: util.format("%s:%s", dbConfig.user, dbConfig.pass),
                                            pathname: dbConfig.db
                                        })
                                    }
                                }
                            );
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
                        (function () {
                            var archiveRecipes = function archiveRecipes(d) {
                                var a = archiver({db: d});
                                return function () {
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
                                };
                            };

                            return function onSuccess(config) {
                                scheduler.scheduleJob(
                                    config.
                                        scheduler.
                                        archiver,
                                    archiveRecipes(db(config.dbServer))
                                );
                            };
                        }()),
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
