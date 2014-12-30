/*jslint node: true*/

"use strict";

var scraper = require("./lib/scraper");

scraper.
    createRecipesPage().
    getRecipeUrls().
    then(function (urls) {
        return scraper.
            createRecipePage(urls[0]).
            getRecipe();
    }).
    then(function (recipe) {
        console.log(recipe);
    }).
    done();
