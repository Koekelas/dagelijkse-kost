/*jslint node: true*/

"use strict";

var url = require("url"),
    fixtures = require("./fixtures"),

    urlUtils = (function urlUtils() {
        var isAbsolute = function isAbsolute(u) {
                return url.
                    parse(u).
                    hostname !== undefined;
            },

            isSameResource = function isSameResource(parsedUrlLeft, parsedUrlRight) {
                return parsedUrlLeft.protocol === parsedUrlRight.protocol &&
                    parsedUrlLeft.hostname === parsedUrlRight.hostname &&
                    parsedUrlLeft.port === parsedUrlRight.port &&
                    parsedUrlLeft.pathname === parsedUrlRight.pathname;
            },

            oneUp = function oneUp(path) {
                if (path === "/") {
                    return path;
                }
                return path.substring(0, path.lastIndexOf("/"));
            },

            isOneDown = function isOneDown(fromUrl) {
                var parsedFromUrl = url.parse(fromUrl);
                return function (u) {
                    var parsedUrl = url.parse(u);
                    if (isSameResource(parsedUrl, parsedFromUrl)) {
                        return false;
                    }
                    parsedUrl.pathname = oneUp(parsedUrl.pathname);
                    return isSameResource(parsedUrl, parsedFromUrl);
                };
            },

            initialise = function initialise() {
                return {isAbsolute: isAbsolute, isOneDown: isOneDown};
            };

        return initialise();
    }());

module.exports = {
    getRecipeUrlsShouldReturnAbsolureUrls: function (test) {
        fixtures.
            recipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.ok(urls.every(urlUtils.isAbsolute));
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnRecipeUrls: function (test) {
        var recipesPage = fixtures.recipesPage;
        recipesPage.
            getRecipeUrls().
            then(function (urls) {
                var isOneDown = urlUtils.isOneDown(recipesPage.getUrl());
                test.ok(urls.every(isOneDown));
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnAllRecipeUrls: function (test) {
        fixtures.
            recipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.equal(urls.length, 992);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnZeroRecipeUrlsWhenRecipesPageIsInvalid: function (test) {
        fixtures.
            invalidRecipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.equal(urls.length, 0);
                test.done();
            }).
            done();
    }
};
