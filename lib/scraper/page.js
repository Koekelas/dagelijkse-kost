/*jslint node: true*/

"use strict";

var url = require("url"),
    cheerio = require("cheerio");

module.exports = function page(spec) {
    var doc,

        getUrl = function getUrl() {
            return spec.
                response.
                then(function (response) {
                    return response.url;
                });
        },

        getRefererUrl = function getRefererUrl() {
            return spec.refererUrl;
        },

        query = function query(selector) {
            return doc.then(function (d) {
                return d(selector);
            });
        },

        initialise = function initialise() {
            doc = spec.
                response.
                then(function (response) {
                    var d = cheerio.load(response.body),
                        resolveUrl = function resolveUrl(attrName) {
                            return function () {
                                var elem = cheerio(this);
                                elem.attr(attrName, url.resolve(response.url, elem.attr(attrName)));
                            };
                        };
                    d("[href]").each(resolveUrl("href"));
                    d("[src]").each(resolveUrl("src"));
                    return d;
                });
            return {getUrl: getUrl, getRefererUrl: getRefererUrl, query: query};
        };

    return initialise();
};
