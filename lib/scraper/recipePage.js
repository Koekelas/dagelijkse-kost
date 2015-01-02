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

        getCookingTime = function getCookingTime() {
            return getArticle().then(function (article) {
                var cookingTime = stringUtils.normaliseWhiteSpace(article.
                    find(".recipe-quick-summary").
                    text());
                return cookingTime.substring(
                    cookingTime.search(/: /) + 2,
                    cookingTime.search(/ \|/)
                );
            });
        },

        getIntroduction = function getIntroduction() {
            return getArticle().then(function (article) {
                return article.
                    find(".recipe-description p:first-child").
                    nextAll("p").
                    map(function () {
                        return stringUtils.normaliseWhiteSpace(cheerio(this).text());
                    }).
                    get().
                    filter(function (text) {
                        return text !== "" &&
                            text.search(/^(extra materiaal|om erbij te serveren|tip):/i) === -1;
                    });
            });
        },

        getPrice = function getPrice() {
            return getArticle().then(function (article) {
                var price = stringUtils.normaliseWhiteSpace(article.
                    find(".recipe-price").
                    text());
                return parseFloat(price.
                    substr(price.search(/€/) + 1).
                    replace(/,/g, ".")) || undefined;
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
                                    category = {ingredients: extractIngredients(anchor)};
                                if (name !== undefined) {
                                    category.name = name;
                                }
                                return category;
                            }).
                            get()
                    };
                });
            };
        }()),

        getRecipe = function getRecipe() {
            return q.all([
                getName(),
                getTags(),
                getCookingTime(),
                getIntroduction(),
                getPrice(),
                getIngredients()
            ]).
                spread(function (name, tags, cookingTime, introduction, price, ingredients) {
                    var recipe = {
                        name: name,
                        tags: tags,
                        cookingTime: cookingTime,
                        ingredients: ingredients
                    };
                    if (introduction.length !== 0) {
                        recipe.introduction = introduction;
                    }
                    if (price !== undefined) {
                        recipe.price = price;
                    }
                    return recipe;
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
