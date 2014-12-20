/*jslint node: true*/

"use strict";

var util = require("util"),
    q = require("q"),
    request = require("request"),
    HTTP_STATUSES = require("./httpStatuses"),
    limit = require("./limit");

module.exports = (function urlReader() {
    var TIME = {ONE_SECOND: 1000},

        readUri = limit(
            q.denodeify(request),
            TIME.ONE_SECOND * 10
        ),

        readUrl = function readUrl(url, refererUrl) {
            return readUri({
                url: url,
                headers: {
                    "Referer": refererUrl,
                    //pretend to be something that doesn't support plugins
                    "User-Agent": "Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.72 Safari/537.36"
                },
                gzip: true,
                timeout: TIME.ONE_SECOND * 30,
                maxRedirects: 4
            }).
                then(function (args) {
                    var response = args[0],
                        statusCode = response.statusCode,
                        body = args[1];
                    if (statusCode !== HTTP_STATUSES.OK) {
                        throw {
                            name: "unexpected status",
                            message: util.format(
                                "expected status to be %d (%s)",
                                HTTP_STATUSES.OK,
                                HTTP_STATUSES[HTTP_STATUSES.OK]
                            ),
                            url: url,
                            expectedStatusCode: HTTP_STATUSES.OK,
                            expectedStatusDescription: HTTP_STATUSES[HTTP_STATUSES.OK],
                            statusCode: statusCode,
                            statusDescription: HTTP_STATUSES[statusCode]
                        };
                    }
                    return body;
                });
        },

        initialise = function initialise() {
            return {readUrl: readUrl};
        };

    return initialise();
}());