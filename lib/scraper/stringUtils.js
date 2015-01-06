/*jslint node: true*/

"use strict";

var lodash = require("lodash");

module.exports = (function stringUtils() {
    var normaliseWhiteSpace = function normaliseWhiteSpace(str) {
            return str.
                replace(/\s/g, " ").
                replace(/^ +| +$/g, "").
                replace(/ {2,}/g, " ");
        },

        test = lodash.curry(function (pattern, str) {
            return str.search(pattern) >= 0;
        }),

        replace = lodash.curry(function (newStr, pattern, str) {
            return str.replace(pattern, newStr);
        }),

        remove = lodash.curry(function (pattern, str) {
            return str.replace(pattern, "");
        }),

        initialise = function initialise() {
            return {
                normaliseWhiteSpace: normaliseWhiteSpace,
                test: test,
                replace: replace,
                remove: remove
            };
        };

    return initialise();
}());
