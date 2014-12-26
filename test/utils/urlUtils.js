/*jslint node: true*/

"use strict";

var url = require("url"),
    lodash = require("lodash");

module.exports = (function urlUtils() {
    var isAbsolute = function isAbsolute(u) {
            return url.
                parse(u).
                hostname !== undefined;
        },

        oneUp = function oneUp(path) {
            if (path === "/") {
                throw {name: "unexpected path", message: "expected path to be different from root"};
            }
            return path.substring(0, path.lastIndexOf("/"));
        },

        isSameResource = function isSameResource(parsedUrlLeft, parsedUrlRight) {
            return parsedUrlLeft.protocol === parsedUrlRight.protocol &&
                parsedUrlLeft.hostname === parsedUrlRight.hostname &&
                parsedUrlLeft.port === parsedUrlRight.port &&
                parsedUrlLeft.pathname === parsedUrlRight.pathname;
        },

        isNumDownFromUrl = lodash.curry(function (fromUrl, num, u) {
            var parsedUrl = url.parse(u);
            try {
                parsedUrl.pathname = lodash.
                    range(num).
                    reduce(function (path) {
                        return oneUp(path);
                    }, parsedUrl.pathname);
            } catch (exception) {
                return false;
            }
            return isSameResource(parsedUrl, url.parse(fromUrl));
        }),

        initialise = function initialise() {
            return {isAbsolute: isAbsolute, isNumDownFromUrl: isNumDownFromUrl};
        };

    return initialise();
}());
