/*jslint node: true*/

"use strict";

var url = require("url"),
    lodash = require("lodash"),
    q = require("q"),
    site = require("../scraper").site;

module.exports = function archiver(spec) {
    var getDb = function getDb() {
            return spec.db;
        },

        getRecipeIds = function getRecipeIds() {
            return q(getDb().
                allDocs().
                then(function (result) {
                    return result.
                        rows.
                        map(function (row) {
                            return row.id;
                        });
                }));
        },

        putRecipe = function putRecipe(id, recipe, image) {
            var db = getDb();
            return q(db.
                put(lodash.merge({type: "recipe", retrieved: new Date()}, recipe), id).
                then(function (result) {
                    db.putAttachment(
                        result.id,
                        "image",
                        result.rev,
                        image.buffer,
                        image.contentType
                    );
                }));
        },

        idify = function idify(recipeUrl) {
            var path = url.
                parse(recipeUrl).
                pathname.
                replace(/\/$/, "");
            if (path.length === 0) {
                return undefined;
            }
            return path.substr(path.lastIndexOf("/") + 1);
        },

        createTask = function createTask(recipesPage, recipeUrl) {
            return function () {
                return recipesPage.
                    createRecipePage(recipeUrl).
                    then(function (recipePage) {
                        return recipePage.
                            createRecipeImage().
                            then(function (recipeImage) {
                                return [recipePage.getRecipe(), recipeImage.toBuffer()];
                            });
                    }).
                    spread(function (recipe, image) {
                        putRecipe(idify(recipeUrl), recipe, image);
                    });
            };
        },

        createQueue = function createQueue() {
            var recipesPage = site.createRecipesPage();
            return q.
                all([recipesPage.getRecipeUrls(), getRecipeIds()]).
                spread(function (recipeUrls, recipeIds) {
                    return recipeUrls.
                        filter(function (recipeUrl) {
                            return !lodash.contains(recipeIds, idify(recipeUrl));
                        }).
                        map(function (recipeUrl) {
                            return createTask(recipesPage, recipeUrl);
                        });
                });
        },

        processQueue = function processQueue(queue) {
            if (queue.length === 0) {
                return;
            }
            var func = queue.shift();
            return func().then(function () {
                return processQueue(queue);
            });
        },

        archiveRecipes = function archiveRecipes() {
            return createQueue().then(processQueue);
        },

        initialise = function initialise() {
            return {archiveRecipes: archiveRecipes};
        };

    return initialise();
};
