/*jslint node: true*/

"use strict";

var url = require("url"),
    util = require("util"),
    dnscache = require("dnscache"),
    lodash = require("lodash"),
    scheduler = require("node-schedule"),
    archiver = require("./lib/archiver"),
    db = require("./lib/db"),
    httpServer = require("./lib/httpServer"),

    app = (function app() {
        var ONE_SECOND = 1,

            readConfig = function readConfig() {
                var config = require("./config.json"),
                    dbConfig = config.dbServer;
                return lodash.merge(
                    config,
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

            run = (function () {
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

                return function run() {
                    var config = readConfig();
                    httpServer({config: config.httpServer});
                    scheduler.scheduleJob(
                        config.
                            scheduler.
                            archiver,
                        archiveRecipes(db({config: config.dbServer}))
                    );
                };
            }()),

            initialise = function initialise() {
                dnscache({enable: true, ttl: ONE_SECOND * 60 * 10}); //dnscache modifies the standard dns
                                                                     //library
                return {run: run};
            };

        return initialise();
    }());

app.run();
