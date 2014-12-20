/*jslint node: true*/

"use strict";

var fs = require("fs"),
    path = require("path"),
    q = require("q"),
    page = require("../../lib/scraper/page"),
    recipesPage = require("../../lib/scraper/recipesPage"),

    fixtureReader = (function fixtureReader() {
        var readFile = q.denodeify(fs.readFile),

            readFixture = function readFixture(fileName) {
                return readFile(
                    path.join(__dirname, fileName),
                    {encoding: "utf8"}
                );
            },

            initialise = function initialise() {
                return {readFixture: readFixture};
            };

        return initialise();
    }()),

    pageFactory = (function pageFactory() {
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

            initialise = function initialise() {
                return {createRecipesPage: createRecipesPage};
            };

        return initialise();
    }());

module.exports = {
    recipesPage: pageFactory.createRecipesPage("recipes.html"),
    invalidRecipesPage: pageFactory.createRecipesPage("random.html")
};
