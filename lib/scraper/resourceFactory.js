/*jslint node: true*/

"use strict";

var urlReader = require("./urlReader"),
    page = require("./page"),
    recipesPage = require("./recipesPage"),
    recipePage = require("./recipePage"),
    image = require("./image");

module.exports = (function resourceFactory() {
    var HOME_URL = "http://www.een.be/programmas/dagelijkse-kost",
        RECIPES_URL = "http://www.een.be/programmas/dagelijkse-kost/recepten",

        createPage = function createPage(url, refererUrl) {
            return page({
                refererUrl: refererUrl,
                response: urlReader.readUrlAsString(url, refererUrl)
            });
        },

        createRecipesPage = function createRecipesPage() {
            return recipesPage({page: createPage(RECIPES_URL, HOME_URL)});
        },

        createRecipePage = function createRecipePage(url, refererUrl) {
            return recipePage({page: createPage(url, refererUrl)});
        },

        createImage = function createImage(url, refererUrl) {
            return image({
                refererUrl: refererUrl,
                response: urlReader.readUrlAsBuffer(url, refererUrl)
            });
        },

        initialise = function initialise() {
            return {
                createRecipesPage: createRecipesPage,
                createRecipePage: createRecipePage,
                createImage: createImage
            };
        };

    return initialise();
}());
