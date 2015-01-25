/*jslint node: true*/

"use strict";

var fs = require("fs"),
    dnscache = require("dnscache"),
    Pouchdb = require("pouchdb"),
    q = require("q"),
    archiver = require("./lib/archiver"),

    app = (function app() {
        var ONE_SECOND = 1,
            CONFIG_PATH = "./config.json",
            DEFAULT_CONFIG = {couchdbUrl: "http://localhost:5984/dagelijkse-kost"},
            TAB_SIZE = 2,

            readConfig = (function () {
                var readFile = q.denodeify(fs.readFile),
                    writeFile = q.denodeify(fs.writeFile);

                return function readConfig() {
                    return readFile(CONFIG_PATH, {encoding: "utf8"}).then(
                        function onSuccess(config) {
                            return JSON.parse(config);
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
                    then(function (config) {
                        var db = new Pouchdb(config.couchdbUrl),
                            a = archiver({db: db});
                        return a.archiveRecipes();
                    }).
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
