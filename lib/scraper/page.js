/*jslint node: true*/

"use strict";

var url = require("url"),
    cheerio = require("cheerio"),
    lodash = require("lodash");

module.exports = function page(spec) {
    var doc,

        getRefererUrl = function getRefererUrl() {
            return spec.refererUrl;
        },

        getResponse = function getResponse() {
            return spec.response;
        },

        getUrl = function getUrl() {
            return getResponse().then(function (response) {
                return response.url;
            });
        },

        query = function query(selector) {
            return doc.then(function (d) {
                return d(selector);
            });
        },

        initialise = function initialise() {
            doc = getResponse().then((function () {
                var resolveUrl = lodash.curry(function resolveUrl(baseUrl, attrName) {
                    return function () {
                        var elem = cheerio(this);
                        elem.attr(attrName, url.resolve(baseUrl, elem.attr(attrName)));
                    };
                });

                return function (response) {
                    var d = cheerio.load(response.body),
                        r = resolveUrl(response.url);
                    d("[href]").each(r("href"));
                    d("[src]").each(r("src"));
                    return d;
                };
            }()));
            return {getRefererUrl: getRefererUrl, getUrl: getUrl, query: query};
        };

    return initialise();
};
