/*jslint node: true*/

"use strict";

var site = require("./lib/scraper").site,

    recipesPage = site.createRecipesPage();

recipesPage.
    getRecipeUrls().
    then(function (recipeUrls) {
        return recipesPage.createRecipePage(recipeUrls[0]);
    }).
    then(function (recipePage) {
        return recipePage.getRecipe();
    }).
    then(function (recipe) {
        console.log(JSON.stringify(recipe));
    }).
    done();
