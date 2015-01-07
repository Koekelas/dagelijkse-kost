/*jslint node: true*/

"use strict";

var fixtureReader = require("./fixtureReader"),
    page = require("../../lib/scraper/page"),
    recipesPage = require("../../lib/scraper/recipesPage"),
    recipePage = require("../../lib/scraper/recipePage");

module.exports = (function resourceFactory() {
    var HOME_URL = "http://www.een.be/programmas/dagelijkse-kost",
        RECIPES_URL = "http://www.een.be/programmas/dagelijkse-kost/recepten",

        createPage = function createPage(url, refererUrl, fileName) {
            return page({
                url: url,
                refererUrl: refererUrl,
                html: fixtureReader.readFixture(fileName)
            });
        },

        createRecipesPage = function createRecipesPage(fileName) {
            return recipesPage({page: createPage(RECIPES_URL, HOME_URL, fileName)});
        },

        createRecipePage = function createRecipePage(url, fileName) {
            return recipePage({page: createPage(url, RECIPES_URL, fileName)});
        },

        initialise = function initialise() {
            return {createRecipesPage: createRecipesPage, createRecipePage: createRecipePage};
        };

    return initialise();
}());
