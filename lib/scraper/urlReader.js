/*jslint node: true*/

"use strict";

var util = require("util"),
    q = require("q"),
    request = require("request"),
    HTTP_STATUSES = require("./httpStatuses"),
    limit = require("./limit"),

    unexpectedStatus = function unexpectedStatus(url, expectedStatusCode, statusCode) {
        return {
            name: "unexpected status",
            message: util.format(
                "expected status to be %d (%s)",
                expectedStatusCode,
                HTTP_STATUSES[expectedStatusCode]
            ),
            url: url,
            expectedStatusCode: expectedStatusCode,
            expectedStatusDescription: HTTP_STATUSES[expectedStatusCode],
            statusCode: statusCode,
            statusDescription: HTTP_STATUSES[statusCode]
        };
    };

module.exports = (function urlReader() {
    var ONE_SECOND = 1000,

        readUrl = (function () {
            var httpGet = request.defaults({
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) " +
                        "Chrome/29.0.1547.72 Safari/537.36" //known to not support plugins
                },
                gzip: true,
                timeout: ONE_SECOND * 30,
                maxRedirects: 4
            });
            httpGet = q.denodeify(httpGet);
            httpGet = limit(httpGet, ONE_SECOND * 10);
            return function readUrl(url, refererUrl) {
                return httpGet({
                    url: url,
                    headers: {
                        "Referer": refererUrl
                    }
                }).
                    then(function (args) {
                        var response = args[0],
                            statusCode = response.statusCode,
                            body = args[1];
                        if (statusCode !== HTTP_STATUSES.OK) {
                            throw unexpectedStatus(url, HTTP_STATUSES.OK, statusCode);
                        }
                        return [body, response];
                    });
            };
        }()),

        readUrlAsText = function readUrlAsText(url, refererUrl) {
            return readUrl(url, refererUrl).then(function (args) {
                return args[0];
            });
        },

        initialise = function initialise() {
            return {readUrlAsText: readUrlAsText};
        };

    return initialise();
}());
