/*jslint node: true*/

"use strict";

var HTTP_STATUSES = require("../httpStatuses");

module.exports = function notFound(request, response, next) {
    response.
        status(HTTP_STATUSES.NOT_FOUND).
        send(HTTP_STATUSES[HTTP_STATUSES.NOT_FOUND]);
};
