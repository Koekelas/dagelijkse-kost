/*jslint node: true*/

"use strict";

var url = require("url"),
    cheerio = require("cheerio");

module.exports = function page(spec) {
    var doc,

        getUrl = function getUrl() {
            return spec.url;
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
                html.
                then(function (html) {
                    var d = cheerio.load(html),
                        resolveUrl = function resolveUrl(attribName) {
                            return function () {
                                var elem = cheerio(this);
                                elem.attr(
                                    attribName,
                                    url.resolve(spec.url, elem.attr(attribName))
                                );
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
