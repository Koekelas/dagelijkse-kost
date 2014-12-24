/*jslint node: true*/

"use strict";

var url = require("url"),
    lodash = require("lodash"),
    fixtures = require("./fixtures"),

    urlUtils = (function urlUtils() {
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

            isDown = lodash.curry(function (fromUrl, num, u) {
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
                return {isAbsolute: isAbsolute, isDown: isDown};
            };

        return initialise();
    }());

module.exports = {
    getRecipeUrlsShouldReturnAbsolureUrls: function (test) {
        fixtures.
            recipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.strictEqual(urls.every(urlUtils.isAbsolute), true);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnRecipeUrls: function (test) {
        var recipesPage = fixtures.recipesPage;
        recipesPage.
            getRecipeUrls().
            then(function (urls) {
                var isDown = urlUtils.isDown(recipesPage.getUrl(), 1);
                test.strictEqual(urls.every(isDown), true);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnAllRecipeUrls: function (test) {
        fixtures.
            recipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 992);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnZeroRecipeUrlsWhenRecipesPageIsInvalid: function (test) {
        fixtures.
            invalidRecipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 0);
                test.done();
            }).
            done();
    },
    getImageUrlShouldReturnAnAbsoluteUrl: function (test) {
        fixtures.
            balletjesRecipePage.
            getImageUrl().
            then(function (url) {
                test.strictEqual(urlUtils.isAbsolute(url), true);
                test.done();
            }).
            done();
    },
    getImageUrlShouldReturnAnImageUrl: function (test) {
        fixtures.
            balletjesRecipePage.
            getImageUrl().
            then(function (url) {
                test.strictEqual(
                    urlUtils.isDown(
                        "http://www.een.be/files/een.be/imagecache/video_image/images/programmas/" +
                            "dagelijkse_kost",
                        2,
                        url
                    ),
                    true
                );
                test.done();
            }).
            done();
    },
    getImageUrlShouldReturnUndefinedWhenRecipePageIsInvalid: function (test) {
        fixtures.
            invalidRecipePage.
            getImageUrl().
            then(function (url) {
                test.strictEqual(url, undefined);
                test.done();
            }).
            done();
    }
};
