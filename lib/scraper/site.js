/*jslint node: true*/

"use strict";

var q = require("q"),
    resourceFactory = require("./resourceFactory");

module.exports = (function site() {
    var cache,

        getRecipeUrls = function getRecipeUrls() {
            cache.recipesPage = resourceFactory.createRecipesPage();
            return cache.
                recipesPage.
                getRecipeUrls();
        },

        getRecipe = function getRecipe(url) {
            return cache.
                recipesPage.
                getUrl().
                then(function (recipesUrl) {
                    return resourceFactory.createRecipePage(url, recipesUrl);
                }).
                then(function (recipePage) {
                    return q.
                        all([
                            recipePage.getUrl(),
                            recipePage.getRecipeVariationUrls(),
                            recipePage.getImageUrl()
                        ]).
                        spread(function (recipeUrl, recipeVariationUrls, imageUrl) {
                            return [
                                recipePage,
                                recipeVariationUrls.map(function (recipeVariationUrl) {
                                    return resourceFactory.createRecipePage(recipeVariationUrl, recipeUrl);
                                }),
                                resourceFactory.createImage(imageUrl, recipeUrl)
                            ];
                        });
                }).
                spread(function (recipePage, recipeVariationPages, image) {
                    return q.all([
                        recipePage.getRecipe(),
                        q.all(recipeVariationPages.map(function (recipeVariationPage) {
                            return recipeVariationPage.getIngredients();
                        })),
                        image.stringify()
                    ]);
                }).
                spread(function (recipe, ingredientVariations, image) {
                    recipe.ingredients = [recipe.ingredients].
                        concat(ingredientVariations).
                        sort(function (left, right) {
                            return left.servings - right.servings;
                        });
                    recipe.image = image;
                    return recipe;
                });
        },

        initialise = function initialise() {
            cache = {};
            return {getRecipeUrls: getRecipeUrls, getRecipe: getRecipe};
        };

    return initialise();
}());
