/*jslint node: true*/

"use strict";

var site = require("./lib/scraper").site;

site.
    getRecipeUrls().
    then(function (recipeUrls) {
        return site.getRecipe(recipeUrls[0]);
    }).
    then(function (recipe) {
        console.log(JSON.stringify(recipe));
    }).
    done();
