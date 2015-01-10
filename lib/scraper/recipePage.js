/*jslint node: true*/

"use strict";

var cheerio = require("cheerio"),
    lodash = require("lodash"),
    q = require("q"),
    stringUtils = require("./stringUtils");

module.exports = function recipePage(spec) {
    var getPage = function getPage() {
            return spec.page;
        },

        getUrl = function getUrl() {
            return getPage().getUrl();
        },

        normaliseText = function normaliseText(text) {
            return stringUtils.normaliseWhiteSpace(text);
        },

        extractGroups = (function () {
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

            //nameFilter should match elements that are siblings of elements that match itemsFilter
            return function extractGroups(anchor, nameFilter, itemsFilter, itemsName) {
                return lodash.chain(anchor.
                    find(itemsFilter).
                    get()).
                    groupBy(function (elem) {
                        return extractName(cheerio(elem), nameFilter);
                    }).
                    map(function (items, name) {
                        var group = {};
                        if (name !== "") {
                            group.name = stringUtils.remove(/^(de|het) |:$/gi, name);
                        }
                        group[itemsName] = lodash.
                            chain(items).
                            map(function (elem) {
                                return extractItems(cheerio(elem));
                            }).
                            flatten().
                            valueOf();
                        return group;
                    }).
                    valueOf();
            };
        }()),

        getArticle = function getArticle() {
            return getPage().query("#e-bottomContainer .box-fullWidth-image-left");
        },

        getImageUrl = function getImageUrl() {
            return getPage().
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

        getIntroduction = (function () {
            var testText = function testText(text, pattern) {
                    return stringUtils.test(pattern, text);
                },
                createGroup = function createGroup(name, items) {
                    return {name: name, items: items || []};
                };

            return function getIntroduction() {
                return getArticle().then(function (article) {
                    var anchor = article.find(".recipe-description"),
                        videoElem = anchor.
                            find("p .jw-player"). //cheerio wraps the video div with the dangling p
                            parent(),
                        elems = anchor.
                            find("p, li").
                            not(videoElem);
                    return lodash.chain(elems.get()).
                        map(function (elem) {
                            return normaliseText(cheerio(elem).text());
                        }).
                        filter(function (text) {
                            return text !== "";
                        }).
                        reduce(function (groups, text) {
                            if (testText(text, /^extra materiaal:/i)) {
                                groups.push(createGroup("kitchenUtensils"));
                            }
                            if (testText(text, /^om erbij te serveren:/i)) {
                                groups.push(createGroup("sideDishes"));
                            }
                            if (testText(text, /^tip:/i)) {
                                groups.push(createGroup("tips"));
                            }
                            groups[groups.length - 1].
                                items.
                                push(text);
                            return groups;
                        }, [createGroup("introduction")]).
                        filter(function (group) {
                            return group.
                                    items.
                                    length !== 0;
                        }).
                        map(function (group) {
                            var name = group.name,
                                items = group.items,
                                text;
                            if (name === "introduction") {
                                return group;
                            }
                            if (items.length > 1) {
                                items = lodash.tail(items);
                            } else {
                                text = items[0];
                                items = [text.substr(text.search(": ") + 2)];
                            }
                            if (name === "kitchenUtensils") {
                                items = items.map(function (item) {
                                    return stringUtils.remove(/^een /i, item);
                                });
                            }
                            return createGroup(name, items);
                        }).
                        reduce(function (groups, group) {
                            groups[group.name] = group.items;
                            return groups;
                        }, {}).
                        valueOf();
                });
            };
        }()),

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
                        groups: extractGroups(
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
                return extractGroups(
                    article.find(".recipe-instructions"),
                    "h3",
                    "ul",
                    "instructions"
                );
            });
        },

        getRecipe = function getRecipe() {
            return q.
                all([
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
                    if (introduction.introduction) {
                        recipe.introduction = introduction.introduction;
                    }
                    if (introduction.kitchenUtensils) {
                        recipe.kitchenUtensils = introduction.kitchenUtensils;
                    }
                    if (introduction.sideDishes) {
                        recipe.sideDishes = introduction.sideDishes;
                    }
                    if (introduction.tips) {
                        recipe.tips = introduction.tips;
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
