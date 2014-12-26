/*jslint node: true*/

"use strict";

var fixtures = require("./fixtures"),
    urlUtils = require("./utils/urlUtils");

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
                var isNumDownFromUrl = urlUtils.isNumDownFromUrl(recipesPage.getUrl(), 1);
                test.strictEqual(urls.every(isNumDownFromUrl), true);
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
                    urlUtils.isNumDownFromUrl(
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
