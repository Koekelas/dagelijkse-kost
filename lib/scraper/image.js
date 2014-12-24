/*jslint node: true*/

"use strict";

module.exports = function image(spec) {
    var getUrl = function getUrl() {
            return spec.url;
        },

        getRefererUrl = function getRefererUrl() {
            return spec.refererUrl;
        },

        toString = function toString() {
            return spec.dataUri;
        },

        initialise = function initialise() {
            return {getUrl: getUrl, getRefererUrl: getRefererUrl, toString: toString};
        };

    return initialise();
};
