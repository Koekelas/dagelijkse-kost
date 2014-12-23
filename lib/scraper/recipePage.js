/*jslint node: true*/

"use strict";

module.exports = function recipePage(spec) {
    var getUrl = function getUrl() {
            return spec.
                page.
                getUrl();
        },

        getImageUrl = function getImageUrl() {
            return spec.
                page.
                query("meta[property=\"og:image\"]").
                then(function (elem) {
                    return elem.attr("content");
                });
        },

        initialise = function initialise() {
            return {getUrl: getUrl, getImageUrl: getImageUrl};
        };

    return initialise();
};
