/*jslint node: true*/

"use strict";

var q = require("q"),
    resourceFactory = require("./resourceFactory"),

    recipePage = function recipePage(spec) {
        var page,

            getRecipe = function getRecipe() {
                return q.
                    all([page.getUrl(), page.getRecipeVariationUrls()]).
                    spread(function (recipeUrl, recipeVariationUrls) {
                        return recipeVariationUrls.map(function (recipeVariationUrl) {
                            return resourceFactory.createRecipePage(recipeVariationUrl, recipeUrl);
                        });
                    }).
                    then(function (recipeVariationPages) {
                        return q.all([
                            page.getRecipe(),
                            q.all(recipeVariationPages.map(function (recipeVariationPage) {
                                return recipeVariationPage.getIngredients();
                            }))
                        ]);
                    }).
                    spread(function (recipe, ingredientVariations) {
                        recipe.ingredients = [recipe.ingredients].
                            concat(ingredientVariations).
                            sort(function (left, right) {
                                return left.servings - right.servings;
                            });
                        return recipe;
                    });
            },

            initialise = function initialise() {
                page = resourceFactory.createRecipePage(spec.url, spec.refererUrl);
                return {getRecipe: getRecipe};
            };

        return initialise();
    },

    recipesPage = function recipesPage() {
        var page,

            getRecipeUrls = function getRecipeUrls() {
                return page.getRecipeUrls();
            },

            createRecipePage = function createRecipePage(url) {
                return page.
                    getUrl().
                    then(function (recipesUrl) {
                        return recipePage({url: url, refererUrl: recipesUrl});
                    });
            },

            initialise = function initialise() {
                page = resourceFactory.createRecipesPage();
                return {getRecipeUrls: getRecipeUrls, createRecipePage: createRecipePage};
            };

        return initialise();
    };

module.exports = (function site() {
    var createRecipesPage = function createRecipesPage() {
            return recipesPage();
        },

        initialise = function initialise() {
            return {createRecipesPage: createRecipesPage};
        };

    return initialise();
}());
