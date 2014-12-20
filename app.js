/*jslint node: true*/

"use strict";

var scraper = require("./lib/scraper");

scraper.
    createRecipesPage().
    getRecipeUrls().
    then(function (urls) {
        console.log(urls);
    }).
    done();
