/*jslint node: true*/

"use strict";

var url = require("url"),
    lodash = require("lodash"),
    q = require("q"),
    site = require("../scraper").site;

module.exports = (function archiver() {
    var archiveRecipes = (function () {
            var idify = function idify(recipeUrl) {
                    var path = url.
                        parse(recipeUrl).
                        pathname.
                        replace(/\/$/, "");
                    if (path.length === 0) {
                        return undefined;
                    }
                    return path.substr(path.lastIndexOf("/") + 1);
                },
                getRecipeIds = function getRecipeIds(db) {
                    return q(db.
                        allDocs().
                        then(function (result) {
                            return result.
                                rows.
                                map(function (row) {
                                    return row.id;
                                });
                        }));
                },
                putRecipe = function putRecipe(db, id, recipe, image) {
                    return q(db.
                        put(recipe, id).
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
                createQueue = function createQueue(db) {
                    var recipesPage = site.createRecipesPage();
                    return q.
                        all([recipesPage.getRecipeUrls(), getRecipeIds(db)]).
                        spread(function (recipeUrls, archivedRecipeIds) {
                            return recipeUrls.filter(function (recipeUrl) {
                                return !lodash.contains(archivedRecipeIds, idify(recipeUrl));
                            });
                        }).
                        then(function (recipeUrls) {
                            return recipeUrls.map(function (recipeUrl) {
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
                                            return putRecipe(
                                                db,
                                                idify(recipeUrl),
                                                recipe,
                                                image
                                            );
                                        });
                                };
                            });
                        });
                };

            return function archiveRecipes(db) {
                return createQueue(db).then(function (queue) {
                    //tmp
                    var func = queue.shift();
                    return func();
                });
            };
        }()),

        initialise = function initialise() {
            return {archiveRecipes: archiveRecipes};
        };

    return initialise();
}());
