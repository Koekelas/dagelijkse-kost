/*jslint node: true*/

"use strict";

var lodash = require("lodash"),
    q = require("q"),

    timer = function timer(func, millis) {
        var t,

            start = function start() {
                if (t) {
                    return;
                }
                t = setTimeout(function () {
                    t = null;
                    func();
                }, millis);
            },

            isStopped = function isStopped() {
                return t === null;
            },

            initialise = function initialise() {
                t = null;
                return {start: start, isStopped: isStopped};
            };

        return initialise();
    };

module.exports = function limit(func, onceEveryMillis) {
    var queue,
        t,

        dequeue = function dequeue() {
            if (queue.length === 0) {
                return;
            }
            var f = queue.shift();
            f();
            t.start();
        },

        enqueue = function enqueue(f) {
            queue.push(f);
            if (t.isStopped()) {
                dequeue();
            }
        },

        createTask = function createTask() {
            var deferred = q.defer(),
                args = lodash.toArray(arguments);
            enqueue(function () {
                deferred.resolve(func.apply(null, args));
            });
            return deferred.promise;
        },

        initialise = function initialise() {
            queue = [];
            t = timer(dequeue, onceEveryMillis);
            return createTask;
        };

    return initialise();
};
