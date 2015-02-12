/*jslint node: true*/

"use strict";

var pouchdb = require("pouchdb");

module.exports = function db(config) {
    var initialise = function initialise() {
        return pouchdb(config.connectionString);
    };

    return initialise();
};
