/*jslint node: true*/

"use strict";

var fs = require("fs"),
    path = require("path"),
    q = require("q");

module.exports = (function fixtureReader() {
    var readFixture = (function () {
            var readFile = q.denodeify(fs.readFile);

            return function readFixture(fileName) {
                return readFile(path.join(__dirname, fileName), {encoding: "utf8"});
            };
        }()),

        initialise = function initialise() {
            return {readFixture: readFixture};
        };

    return initialise();
}());
