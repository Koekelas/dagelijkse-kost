/*jslint node: true*/

"use strict";

var pouchdb = require("pouchdb");

module.exports = function db(spec) {
    var getConfig = function getConfig() {
            return spec.config;
        },

        initialise = function initialise() {
            var config = getConfig(),
                localDb = pouchdb(config.db),
                replicator = localDb.
                    replicate.
                    from(config.connectionString);
            replicator.on("error", function (error) {
                console.log({
                    name: "replication error",
                    message: "expected to be able to replicate from remote database",
                    originalError: error
                });
            });
            return localDb;
        };

    return initialise();
};
