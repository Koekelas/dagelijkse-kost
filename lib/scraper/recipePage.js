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

        normaliseText = function normaliseText(text) {
            return stringUtils.normaliseWhiteSpace(text);
        },

        extractCategories = (function () {
            var extractName = function extractName(anchor, nameFilter) {
                    return normaliseText(anchor.
                        prevAll(nameFilter).
                        first().
                        text());
                },
                extractItems = function extractItems(anchor) {
                    return anchor.
                        find("li").
                        map(function () {
                            return normaliseText(cheerio(this).text());
                        }).
                        get();
                };

            return function extractCategories(anchor, nameFilter, itemsFilter, itemsName) {
                return lodash.chain(anchor.
                    find(itemsFilter).
                    get()).
                    groupBy(function (elem) {
                        return extractName(cheerio(elem), nameFilter);
                    }).
                    map(function (items, name) {
                        var category = {};
                        if (name !== "") {
                            category.name = stringUtils.remove(/^(de|het) |:$/gi, name);
                        }
                        category[itemsName] = lodash.
                            chain(items).
                            map(function (elem) {
                                return extractItems(cheerio(elem));
                            }).
                            flatten().
                            valueOf();
                        return category;
                    }).
                    valueOf();
            };
        }()),

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
                return normaliseText(article.
                    find(".articleTitlebox a").
                    text());
            });
        },

        getTags = function getTags() {
            return getArticle().then(function (article) {
                return article.
                    find(".articleTags a").
                    map(function () {
                        return normaliseText(cheerio(this).text());
                    }).
                    filter(function () {
                        return this.search(/dagelijkse kost|euro/i) === -1;
                    }).
                    get();
            });
        },

        getCookingTime = function getCookingTime() {
            return getArticle().then(function (article) {
                var cookingTime = normaliseText(article.
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
                        return normaliseText(cheerio(this).text());
                    }).
                    filter(function () {
                        return this !== "" &&
                            this.search(/^(extra materiaal|om erbij te serveren|tip):/i) === -1;
                    }).
                    get();
            });
        },

        getPrice = function getPrice() {
            return getArticle().then(function (article) {
                var price = normaliseText(article.
                    find(".recipe-price").
                    text());
                return parseFloat(price.
                    substr(price.search(/€/) + 1).
                    replace(/,/g, ".")) || undefined;
            });
        },

        getIngredients = (function () {
            var extractServings = function extractServings(anchor) {
                return parseInt(anchor.text(), 10) || undefined;
            };

            return function getIngredients() {
                return getArticle().then(function (article) {
                    return {
                        servings: extractServings(article.find(".recipe-servings strong")),
                        categories: extractCategories(
                            article.find(".recipe-ingredients"),
                            "h3",
                            ".item-list",
                            "ingredients"
                        )
                    };
                });
            };
        }()),

        getInstructions = function getInstructions() {
            return getArticle().then(function (article) {
                return extractCategories(
                    article.find(".recipe-instructions"),
                    "h3",
                    "ul",
                    "instructions"
                );
            });
        },

        getRecipe = function getRecipe() {
            return q.all([
                getName(),
                getTags(),
                getCookingTime(),
                getIntroduction(),
                getPrice(),
                getIngredients(),
                getInstructions()
            ]).
                spread(function (name, tags, cookingTime, introduction, price, ingredients, instructions) {
                    var recipe = {};
                    recipe.name = name;
                    recipe.tags = tags;
                    recipe.cookingTime = cookingTime;
                    if (introduction.length !== 0) {
                        recipe.introduction = introduction;
                    }
                    if (price !== undefined) {
                        recipe.price = price;
                    }
                    recipe.ingredients = ingredients;
                    recipe.instructions = instructions;
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
