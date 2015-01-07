/*jslint node: true*/

"use strict";

var q = require("q"),
    scraper = require("./lib/scraper");

var recipesPage = scraper.createRecipesPage();
recipesPage.
    getRecipeUrls().
    then(function (recipeUrls) {
        var recipePage = scraper.createRecipePage(recipeUrls[0], recipesPage.getUrl());
        return q.all([
            recipePage.getRecipe(),
            recipePage.
                getImageUrl().
                then(function (imageUrl) {
                    return scraper.
                        createImage(imageUrl, recipePage.getUrl()).
                        stringify();
                }),
            recipePage.
                getRecipeVariationUrls().
                then(function (variationUrls) {
                    return q.all(variationUrls.map(function (variationUrl) {
                        return scraper.
                            createRecipePage(variationUrl, recipePage.getUrl()).
                            getIngredients();
                    }));
                })
        ]);
    }).
    spread(function (recipe, image, ingredientVariations) {
        recipe.image = image;
        recipe.ingredients = [recipe.ingredients].
            concat(ingredientVariations).
            sort(function (left, right) {
                return left.servings - right.servings;
            });
        return recipe;
    }).
    then(function (recipe) {
        console.log(JSON.stringify(recipe));
    }).
    done();
