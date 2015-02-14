/*jslint node: true*/

"use strict";

var express = require("express"),
    internalServerError = require("./internalServerError"),
    notFound = require("./notFound");

module.exports = function httpServer(config) {
    var CLIENT_PATH = "./client/dist",

        initialise = function initialise() {
            var server = express();
            server.use(express.static(CLIENT_PATH));
            server.use(notFound);
            server.use(internalServerError);
            server.listen(config.port, config.hostname);
        };

    initialise();
};
