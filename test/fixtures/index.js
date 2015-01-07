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
                    return readFile(path.join(__dirname, fileName), {encoding: "utf8"});
                };
            }()),

            initialise = function initialise() {
                return {readFixture: readFixture};
            };

        return initialise();
    }()),

    resourceFactory = (function resourceFactory() {
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
    recipesPage: resourceFactory.createRecipesPage("recipes.html"),
    invalidRecipesPage: resourceFactory.createRecipesPage("random.html"),
    balletjesRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/balletjes-in-tomatensaus",
        "balletjesInTomatensausRecipe.html"
    ),
    caesardressingRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/caesardressing",
        "caesardressingRecipe.html"
    ),
    cupcakesRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/aardappel-cupcakes",
        "aardappelCupcakesRecipe.html"
    ),
    toastRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/" +
            "zuiderse-toast-champignon-met-limoen-ricotta-en-rucola",
        "zuiderseToastChampignonMetLimoenRicottaEnRucolaRecipe.html"
    ),
    invalidRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/random",
        "random.html"
    )
};
