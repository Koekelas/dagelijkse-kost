/*jslint node: true*/

"use strict";

var express = require("express"),
    internalServerError = require("./internalServerError"),
    notFound = require("./notFound");

module.exports = function httpServer(spec) {
    var CLIENT_PATH = "./client/dist",

        getConfig = function getConfig() {
            return spec.config;
        },

        initialise = function initialise() {
            var server = express(),
                config = getConfig();
            server.use(express.static(CLIENT_PATH));
            server.use(notFound);
            server.use(internalServerError);
            server.listen(config.port, config.hostname);
        };

    initialise();
};
