/*jslint node: true*/

"use strict";

var cheerio = require("cheerio"),
    lodash = require("lodash"),
    stringUtils = require("./stringUtils");

module.exports = function recipePage(spec) {
    var getUrl = function getUrl() {
            return spec.
                page.
                getUrl();
        },

        getArticle = function getArticle() {
            return spec.
                page.
                query("#e-bottomContainer .box-fullWidth-image-left");
        },

        getImageUrl = function getImageUrl() {
            return spec.
                page.
                query("meta[property=\"og:image\"]").
                then(function (elem) {
                    return elem.attr("content");
                });
        },

        getRecipeVariationUrls = function getRecipeVariationUrls() {
            return getArticle().then(function (article) {
                return article.
                    find(".recipe-servings a[href*=\"/recepten/\"]:not(.active)").
                    map(function () {
                        return cheerio(this).attr("href");
                    }).
                    get();
            });
        },

        getIngredients = (function () {
            var cleanName = lodash.compose(
                    stringUtils.remove(/^(de|het) |:$/g),
                    stringUtils.normaliseWhiteSpace
                ),
                extractServings = function extractServings(anchor) {
                    return parseInt(anchor.text(), 10) || undefined;
                },
                extractName = function extractName(anchor) {
                    var name = cleanName(anchor.
                        prev().
                        text());
                    return name !== "" ? name : undefined;
                },
                extractIngredients = function extractIngredients(anchor) {
                    return anchor.
                        find("li").
                        map(function () {
                            return stringUtils.normaliseWhiteSpace(cheerio(this).text());
                        }).
                        get();
                };

            return function getIngredients() {
                return getArticle().then(function (article) {
                    var servings = extractServings(article.find(".recipe-servings strong")),
                        categories = article.
                            find(".recipe-ingredients .item-list").
                            map(function () {
                                var anchor = cheerio(this),
                                    name = extractName(anchor),
                                    ingredients = extractIngredients(anchor),
                                    category = {};
                                if (name !== undefined) {
                                    category.name = name;
                                }
                                category.ingredients = ingredients;
                                return category;
                            }).
                            get(),
                        ingredients = {};
                    if (servings !== undefined) {
                        ingredients.servings = servings;
                    }
                    ingredients.categories = categories;
                    return ingredients;
                });
            };
        }()),

        getRecipe = function getRecipe() {
            return getIngredients();
        },

        initialise = function initialise() {
            return {
                getUrl: getUrl,
                getImageUrl: getImageUrl,
                getRecipeVariationUrls: getRecipeVariationUrls,
                getIngredients: getIngredients,
                getRecipe: getRecipe
            };
        };

    return initialise();
};
