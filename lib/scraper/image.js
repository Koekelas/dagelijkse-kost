/*jslint node: true*/

"use strict";

module.exports = function image(spec) {
    var getUrl = function getUrl() {
            return spec.url;
        },

        getRefererUrl = function getRefererUrl() {
            return spec.refererUrl;
        },

        stringify = function stringify() {
            return spec.dataUri;
        },

        initialise = function initialise() {
            return {getUrl: getUrl, getRefererUrl: getRefererUrl, stringify: stringify};
        };

    return initialise();
};
