/*jslint node: true*/

"use strict";

var util = require("util");

module.exports = function image(spec) {
    var getUrl = function getUrl() {
            return spec.
                response.
                then(function (response) {
                    return response.url;
                });
        },

        getRefererUrl = function getRefererUrl() {
            return spec.refererUrl;
        },

        getContentType = function getContentType() {
            return spec.
                response.
                then(function (response) {
                    return response.contentType;
                });
        },

        toBuffer = function toBuffer() {
            return spec.
                response.
                then(function (response) {
                    return response.body;
                });
        },

        toDataUri = function toDataUri() {
            return spec.
                response.
                then(function (response) {
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
                getUrl: getUrl,
                getRefererUrl: getRefererUrl,
                getContentType: getContentType,
                toBuffer: toBuffer,
                toDataUri: toDataUri
            };
        };

    return initialise();
};
