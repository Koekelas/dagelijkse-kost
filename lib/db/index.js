/*jslint node: true*/

"use strict";

var pouchdb = require("pouchdb");

module.exports = function db(spec) {
    var getConfig = function getConfig() {
            return spec.config;
        },

        initialise = function initialise() {
            return pouchdb(getConfig().connectionString);
        };

    return initialise();
};
