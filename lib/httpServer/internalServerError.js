/*jslint node: true*/

"use strict";

var HTTP_STATUSES = require("../httpStatuses");

module.exports = function internalServerError(error, request, response, next) {
    console.log({
        name: "unexpected error",
        message: "expected to be able to handle request",
        originalError: error
    });
    response.
        status(HTTP_STATUSES.INTERNAL_SERVER_ERROR).
        send(HTTP_STATUSES[HTTP_STATUSES.INTERNAL_SERVER_ERROR]);
};
