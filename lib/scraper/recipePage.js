/*jslint node: true*/

"use strict";

var cheerio = require("cheerio"),
    lodash = require("lodash"),
    q = require("q"),
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

        getName = function getName() {
            return getArticle().then(function (article) {
                return stringUtils.normaliseWhiteSpace(article.
                    find(".articleTitlebox a").
                    text());
            });
        },

        getTags = function getTags() {
            return getArticle().then(function (article) {
                return article.
                    find(".articleTags a").
                    map(function () {
                        return stringUtils.normaliseWhiteSpace(cheerio(this).text());
                    }).
                    get().
                    filter(function (tag) {
                        return tag.search(/dagelijkse kost|euro/i) === -1;
                    });
            });
        },

        getIngredients = (function () {
            var cleanName = lodash.compose(
                    stringUtils.remove(/^(de|het) |:$/gi),
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
                    return {
                        servings: extractServings(article.find(".recipe-servings strong")),
                        categories: article.
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
                            get()
                    };
                });
            };
        }()),

        getRecipe = function getRecipe() {
            return q.all([getName(), getTags(), getIngredients()]).
                spread(function (name, tags, ingredients) {
                    return {name: name, tags: tags, ingredients: ingredients};
                });
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
