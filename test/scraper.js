/*jslint node: true*/

"use strict";

var q = require("q"),
    fixtures = require("./fixtures"),
    urlUtils = require("./utils/urlUtils"),
    recipes = require("./recipes.json");

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
        q.
            all([recipesPage.getUrl(), recipesPage.getRecipeUrls()]).
            spread(function (recipesUrl, recipeUrls) {
                var isNumDownFrom = urlUtils.isNumDownFrom(recipesUrl, 1);
                test.strictEqual(recipeUrls.every(isNumDownFrom), true);
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
                    urlUtils.isNumDownFrom(
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
    },
    getRecipeVariationUrlsShouldReturnAbsolureUrls: function (test) {
        fixtures.
            balletjesRecipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.every(urlUtils.isAbsolute), true);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnRecipeVariationUrls: function (test) {
        var recipePage = fixtures.balletjesRecipePage;
        q.
            all([recipePage.getUrl(), recipePage.getRecipeVariationUrls()]).
            spread(function (recipeUrl, variationUrls) {
                test.strictEqual(variationUrls.every(function (variationUrl) {
                    return variationUrl !== recipeUrl && urlUtils.isSimilar(variationUrl, recipeUrl);
                }), true);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnAllRecipeVariationUrls: function (test) {
        fixtures.
            balletjesRecipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 4);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnZeroRecipeVariationUrlsWhenRecipePageIsInvalid: function (test) {
        fixtures.
            invalidRecipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 0);
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe1: function (test) {
        fixtures.
            balletjesRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, recipes.balletjes);
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe2: function (test) {
        fixtures.
            caesardressingRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, recipes.caesardressing);
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe3: function (test) {
        fixtures.
            cupcakesRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, recipes.cupcakes);
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe4: function (test) {
        fixtures.
            toastRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, recipes.toast);
                test.done();
            }).
            done();
    }
};
