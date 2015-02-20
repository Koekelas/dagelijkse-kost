/*jslint node: true*/

"use strict";

var util = require("util"),
    mergeTrees = require("broccoli-merge-trees"),
    copyFiles = require("broccoli-static-compiler"),
    replaceStrings = require("broccoli-replace"),
    bundleScripts = require("broccoli-watchify"),
    minifyScripts = require("broccoli-uglify-js"),

    ENV = process.
            env.
            NODE_ENV || "development",
    PUBLIC_TREE = "./public",
    BOWER_TREE = "./bower_components",
    PATHS = {
        DEVELOPMENT: {
            BOOTSTRAP_CSS: "./vendor/bootstrap/css/bootstrap.css",
            JQUERY_JS: "./vendor/jquery/jquery.js",
            EMBER_JS: "./vendor/ember/ember.debug.js",
            EMBER_DATA_JS: "./vendor/ember-data/ember-data.js",
            POUCHDB_JS: "./vendor/pouchdb/pouchdb.js",
            RELATIONAL_POUCH_JS: "./vendor/relational-pouch/pouchdb.relational-pouch.js",
            EMBER_POUCH_JS: "./vendor/ember-pouch/main.js"
        },
        PRODUCTION: {
            BOOTSTRAP_CSS: "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.2/css/bootstrap.min.css",
            JQUERY_JS: "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js",
            EMBER_JS: "//cdnjs.cloudflare.com/ajax/libs/ember.js/1.10.0/ember.min.js",
            EMBER_DATA_JS: "//cdnjs.cloudflare.com/ajax/libs/ember-data.js/1.0.0-beta.15.1/" +
                "ember-data.min.js",
            POUCHDB_JS: "//cdnjs.cloudflare.com/ajax/libs/pouchdb/3.3.1/pouchdb.min.js",
            RELATIONAL_POUCH_JS: "./vendor/relational-pouch/pouchdb.relational-pouch.min.js",
            EMBER_POUCH_JS: "./vendor/ember-pouch/main.js"
        }
    }[ENV.toUpperCase()],

    createPublicTree = function createPublicTree() {
        var tree = copyFiles(PUBLIC_TREE, {srcDir: ".", files: ["./images", "./index.html"], destDir: "."});
        tree = replaceStrings(
            tree,
            {
                //files: ["./index.html"], //doesn't work, don't know why
                files: ["index.html"],
                patterns: Object.
                    keys(PATHS).
                    map(function (pathName) {
                        return {
                            match: new RegExp(util.format("%s_PATH", pathName)),
                            replacement: PATHS[pathName]
                        };
                    })
            }
        );
        return tree;
    },

    createScriptBundleTree = function createScriptBundleTree() {
        var tree = bundleScripts(
            PUBLIC_TREE,
            {
                browserify : {entries: ["./app.js"], debug: ENV === "development"},
                outputFile: "./bundle.js"
            }
        );
        switch (ENV) {
        case "development":
            tree = mergeTrees([
                tree,
                copyFiles(PUBLIC_TREE, {srcDir: ".", files: ["./app.js"], destDir: "."})
            ]);
            break;
        case "production":
            tree = minifyScripts(tree);
            break;
        }
        return tree;
    },

    createVendorTree = function createVendorTree() {
        var trees = [
            copyFiles(BOWER_TREE, {srcDir: "./relational-pouch/dist", destDir: "./vendor/relational-pouch"}),
            copyFiles(BOWER_TREE, {srcDir: "./ember-pouch/dist/globals", destDir: "./vendor/ember-pouch"})
        ];
        switch (ENV) {
        case "development":
            trees = trees.concat(
                copyFiles(BOWER_TREE, {srcDir: "./bootstrap/dist", destDir: "./vendor/bootstrap"}),
                copyFiles(BOWER_TREE, {srcDir: "./jquery/dist", destDir: "./vendor/jquery"}),
                copyFiles(BOWER_TREE, {srcDir: "./ember", destDir: "./vendor/ember"}),
                copyFiles(BOWER_TREE, {srcDir: "./ember-data", destDir: "./vendor/ember-data"}),
                copyFiles(BOWER_TREE, {srcDir: "./pouchdb/dist", destDir: "./vendor/pouchdb"})
            );
            break;
        }
        return mergeTrees(trees);
    };

module.exports = mergeTrees([createPublicTree(), createScriptBundleTree(), createVendorTree()]);
