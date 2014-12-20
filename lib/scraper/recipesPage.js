/*jslint node: true*/

"use strict";

var cheerio = require("cheerio");

module.exports = function recipesPage(spec) {
    var getUrl = function getUrl() {
            return spec.
                page.
                getUrl();
        },

        getRecipeUrls = function getRecipeUrls() {
            return spec.
                page.
                query("#alphabeticallyContent a[href*=\"/recepten/\"]").
                then(function (elems) {
                    return elems.
                        map(function () {
                            return cheerio(this).attr("href");
                        }).
                        get();
                });
        },

        initialise = function initialise() {
            return {getUrl: getUrl, getRecipeUrls: getRecipeUrls};
        };

    return initialise();
};
