/*jslint node: true*/

"use strict";

var cheerio = require("cheerio");

module.exports = function recipesPage(spec) {
    var getPage = function getPage() {
            return spec.page;
        },

        getUrl = function getUrl() {
            return getPage().getUrl();
        },

        getRecipeUrls = function getRecipeUrls() {
            return getPage().
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
