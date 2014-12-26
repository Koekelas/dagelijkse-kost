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

        moveOneUp = function moveOneUp(path) {
            if (path === "/") {
                throw {name: "unexpected path", message: "expected path to be different from root"};
            }
            return path.substring(0, path.lastIndexOf("/"));
        },

        isSimilar = function isSimilar(urlLeft, urlRight) {
            if (!lodash.isPlainObject(urlLeft)) {
                urlLeft = url.parse(urlLeft);
            }
            if (!lodash.isPlainObject(urlRight)) {
                urlRight = url.parse(urlRight);
            }
            return urlLeft.protocol === urlRight.protocol &&
                urlLeft.hostname === urlRight.hostname &&
                urlLeft.port === urlRight.port &&
                urlLeft.pathname === urlRight.pathname;
        },

        isNumDownFrom = lodash.curry(function (fromUrl, num, u) {
            var parsedUrl = url.parse(u);
            try {
                parsedUrl.pathname = lodash.
                    range(num).
                    reduce(function (path) {
                        return moveOneUp(path);
                    }, parsedUrl.pathname);
            } catch (exception) {
                return false;
            }
            return isSimilar(parsedUrl, url.parse(fromUrl));
        }),

        initialise = function initialise() {
            return {isAbsolute: isAbsolute, isSimilar: isSimilar, isNumDownFrom: isNumDownFrom};
        };

    return initialise();
}());
