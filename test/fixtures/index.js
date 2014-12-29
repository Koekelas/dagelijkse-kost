/*jslint node: true*/

"use strict";

var fs = require("fs"),
    path = require("path"),
    q = require("q"),
    page = require("../../lib/scraper/page"),
    recipesPage = require("../../lib/scraper/recipesPage"),
    recipePage = require("../../lib/scraper/recipePage"),

    fixtureReader = (function fixtureReader() {
        var readFixture = (function () {
                var readFile = q.denodeify(fs.readFile);

                return function readFixture(fileName) {
                    return readFile(
                        path.join(__dirname, fileName),
                        {encoding: "utf8"}
                    );
                };
            }()),

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

            createRecipePage = function createRecipePage(url, fileName) {
                return recipePage({page: createPage(url, RECIPES_URL, fileName)});
            },

            initialise = function initialise() {
                return {createRecipesPage: createRecipesPage, createRecipePage: createRecipePage};
            };

        return initialise();
    }());

module.exports = {
    recipesPage: pageFactory.createRecipesPage("recipes.html"),
    invalidRecipesPage: pageFactory.createRecipesPage("random.html"),
    balletjesRecipePage: pageFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/balletjes-in-tomatensaus",
        "balletjesInTomatensausRecipe.html"
    ),
    caesardressingRecipePage: pageFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/caesardressing",
        "caesardressingRecipe.html"
    ),
    cupcakesRecipePage: pageFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/aardappel-cupcakes",
        "aardappelCupcakesRecipe.html"
    ),
    toastRecipePage: pageFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/" +
            "zuiderse-toast-champignon-met-limoen-ricotta-en-rucola",
        "zuiderseToastChampignonMetLimoenRicottaEnRucolaRecipe.html"
    ),
    invalidRecipePage: pageFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/random",
        "random.html"
    )
};
