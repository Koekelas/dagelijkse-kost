/*jslint node: true*/

"use strict";

var util = require("util");

module.exports = function image(spec) {
    var getRefererUrl = function getRefererUrl() {
            return spec.refererUrl;
        },

        getResponse = function getResponse() {
            return spec.response;
        },

        getUrl = function getUrl() {
            return getResponse().then(function (response) {
                return response.url;
            });
        },

        toBuffer = function toBuffer() {
            return getResponse().then(function (response) {
                return {contentType: response.contentType, buffer: response.body};
            });
        },

        toDataUri = function toDataUri() {
            return getResponse().then(function (response) {
                return util.format(
                    "data:%s;base64,%s",
                    response.
                        contentType.
                        replace(/ /g, ""),
                    response.
                        body.
                        toString("base64")
                );
            });
        },

        initialise = function initialise() {
            return {
                getRefererUrl: getRefererUrl,
                getUrl: getUrl,
                toBuffer: toBuffer,
                toDataUri: toDataUri
            };
        };

    return initialise();
};
