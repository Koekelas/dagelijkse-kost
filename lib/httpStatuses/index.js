/*jslint node: true*/

"use strict";

var STATUS_CODES = require("http").STATUS_CODES,
    util = require("util"),

    keyify = function keyify(sentence) {
        var words = sentence.match(/[a-z]+/gi);
        return words.
            slice(1).
            reduce(function (key, word) {
                return util.format("%s_%s", key, word.toUpperCase());
            }, words[0].toUpperCase());
    };

module.exports = Object.
    keys(STATUS_CODES).
    reduce(function (httpStatuses, code) {
        code = parseInt(code, 10);
        var description = STATUS_CODES[code];
        httpStatuses[code] = description;
        httpStatuses[keyify(description)] = code;
        return httpStatuses;
    }, {});
