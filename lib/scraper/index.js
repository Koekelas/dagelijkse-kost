/*jslint node: true*/

"use strict";

var urlReader = require("./urlReader"),
    page = require("./page"),
    recipesPage = require("./recipesPage");

module.exports = (function pageFactory() {
    var HOME_URL = "http://www.een.be/programmas/dagelijkse-kost",
        RECIPES_URL = "http://www.een.be/programmas/dagelijkse-kost/recepten",

        createPage = function createPage(url, refererUrl) {
            return page({
                url: url,
                refererUrl: refererUrl,
                html: urlReader.readUrlAsText(url, refererUrl)
            });
        },

        createRecipesPage = function createRecipesPage() {
            return recipesPage({page: createPage(RECIPES_URL, HOME_URL)});
        },

        initialise = function initialise() {
            return {createRecipesPage: createRecipesPage};
        };

    return initialise();
}());
