/*jslint node: true*/

"use strict";

var ember = require("ember"),
    emberdata = require("emberdata"),
    emberpouch = require("emberpouch");

module.exports = function emberApp(spec) {
    var getDb = function getDb() {
            return spec.db;
        },

        initialise = function initialise() {
            var app = ember.Application.create();
            app.ApplicationAdapter = emberpouch.Adapter.extend({db: getDb()});
            app.Recipe = emberdata.Model.extend({
                rev: emberdata.attr("string"),
                name: emberdata.attr("string")
            });
        };

    initialise();
};
