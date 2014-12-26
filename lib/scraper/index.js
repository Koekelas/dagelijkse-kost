/*jslint node: true*/

"use strict";

var urlReader = require("./urlReader"),
    page = require("./page"),
    recipesPage = require("./recipesPage"),
    recipePage = require("./recipePage"),
    image = require("./image");

module.exports = (function pageFactory() {
    var HOME_URL = "http://www.een.be/programmas/dagelijkse-kost",
        RECIPES_URL = "http://www.een.be/programmas/dagelijkse-kost/recepten",

        createPage = function createPage(url, refererUrl) {
            return page({
                url: url,
                refererUrl: refererUrl,
                html: urlReader.readUrlAsHtml(url, refererUrl)
            });
        },

        createImage = function createImage(url, refererUrl) {
            return image({
                url: url,
                refererUrl: refererUrl,
                dataUri: urlReader.readUrlAsDataUri(url, refererUrl)
            });
        },

        createRecipesPage = function createRecipesPage() {
            return recipesPage({page: createPage(RECIPES_URL, HOME_URL)});
        },

        createRecipePage = function createRecipePage(url) {
            return recipePage({page: createPage(url, RECIPES_URL)});
        },

        createRecipeVariationPage = function createRecipeVariationPage(url, refererUrl) {
            return recipePage({page: createPage(url, refererUrl)});
        },

        initialise = function initialise() {
            return {
                createImage: createImage,
                createRecipesPage: createRecipesPage,
                createRecipePage: createRecipePage,
                createRecipeVariationPage: createRecipeVariationPage
            };
        };

    return initialise();
}());
