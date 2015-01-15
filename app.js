/*jslint node: true*/

"use strict";

var q = require("q"),
    site = require("./lib/scraper").site,

    recipesPage = site.createRecipesPage();

recipesPage.
    getRecipeUrls().
    then(function (recipeUrls) {
        return recipesPage.createRecipePage(recipeUrls[0]);
    }).
    then(function (recipePage) {
        return recipePage.
            createRecipeImage().
            then(function (recipeImage) {
                return q.all([recipePage.getSlug(), recipePage.getRecipe(), recipeImage.toDataUri()]);
            });
    }).
    spread(function (slug, recipe, image) {
        console.log(slug);
        console.log(JSON.stringify(recipe));
        console.log(image);
    }).
    done();
