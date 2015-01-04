/*jslint node: true*/

"use strict";

var util = require("util"),
    cheerio = require("cheerio"),
    q = require("q"),
    stringUtils = require("./stringUtils");

module.exports = function recipePage(spec) {
    var getUrl = function getUrl() {
            return spec.
                page.
                getUrl();
        },

        extractConsecutiveLists = (function () {
            var extractName = function extractName(anchor) {
                    return stringUtils.normaliseWhiteSpace(anchor.text());
                },
                extractList = function extractList(anchor) {
                    return anchor.
                        find("li").
                        map(function () {
                            return stringUtils.normaliseWhiteSpace(cheerio(this).text());
                        }).
                        get();
                };

            return function extractConsecutiveLists(anchor, nameSelector) {
                return anchor.
                    find(util.format("%s, ul", nameSelector)).
                    get().
                    reduce(function (categories, elem) {
                        elem = cheerio(elem);
                        if (elem.is(nameSelector)) {
                            categories.push({name: extractName(elem)});
                        } else {
                            var category = categories[categories.length - 1],
                                list = category.list;
                            if (!list) {
                                list = [];
                            }
                            category.list = list.concat(extractList(elem));
                        }
                        return categories;
                    }, [{}]).
                    filter(function (category) {
                        return !!category.list;
                    });
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
            var extractServings = function extractServings(anchor) {
                return parseInt(anchor.text(), 10) || undefined;
            };

            return function getIngredients() {
                return getArticle().then(function (article) {
                    return {
                        servings: extractServings(article.find(".recipe-servings strong")),
                        categories: extractConsecutiveLists(article.find(".recipe-ingredients"), "h3").
                            map(function (category) {
                                var name = category.name,
                                    c = {ingredients: category.list};
                                if (name) {
                                    c.name = stringUtils.remove(/^(de|het) |:$/gi, name);
                                }
                                return c;
                            })
                    };
                });
            };
        }()),

        getInstructions = function getInstructions() {
            return getArticle().then(function (article) {
                return extractConsecutiveLists(article.find(".recipe-instructions"), "h3").
                    map(function (category) {
                        var name = category.name,
                            c = {instructions: category.list};
                        if (name) {
                            c.name = stringUtils.remove(/^(de|het) |:$/gi, name);
                        }
                        return c;
                    });
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
                    var recipe = {
                        name: name,
                        tags: tags,
                        cookingTime: cookingTime,
                        ingredients: ingredients,
                        instructions: instructions
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
