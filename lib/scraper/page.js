/*jslint node: true*/

"use strict";

var url = require("url"),
    cheerio = require("cheerio");

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
            doc = getResponse().then(function (response) {
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
            return {getRefererUrl: getRefererUrl, getUrl: getUrl, query: query};
        };

    return initialise();
};
