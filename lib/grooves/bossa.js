"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var off = function () { return util_1.randomElement([0, [0, 1]], [6, 1]); };
var eightFour = function () { return util_1.randomElement([[1, 1], 1], [2, 1]); };
var eightOff = function () { return util_1.randomElement([[1, 1], [0, 1]], [2, 1]); };
var halfTriplet = function () { return util_1.randomElement([[2, 0], [[2, 0, 2], [0, 2, 0]]], [2, 1]); };
var one = function (v) {
    if (v === void 0) { v = 1; }
    return util_1.randomElement([0, v]);
};
exports.bossa = {
    chords: function (_a) {
        var measure = _a.measure, settings = _a.settings;
        return util_1.randomElement([
            /* [1, 1, [0, 1], [0, 3]] */
            [1, [0, 1], 0, [0, 3]],
            [one(), [0, 3], 0, [0, 1]],
            [one(), [0, 1], [0, 3], 0],
            [one(), [0, 3], [0, 1], 0]
        ]);
    },
    bass: function () {
        return [1, [0, 3], 0, util_1.randomElement([0, 1])];
    },
    rimshot: function (_a) {
        var measure = _a.measure, settings = _a.settings;
        return [0, .8, 0, 0];
    },
    ride: function (_a) {
        var measures = _a.measures, index = _a.index;
        return util_1.randomElement([
            [[one(.6), .9, [.4, .5], [0, .8]]],
            [[0, .9, [.4, .5], [one(.6), .8]]],
        ]);
    },
    hihat: function () { return [0, .8, 0, 1]; },
    solo: function () { return util_1.randomElement([
        [eightFour(), eightFour(), eightFour(), eightFour()],
        [eightFour(), 2, 0, eightFour()],
        [0, 0, eightFour(), eightOff()],
        [[1, 4], 0, eightFour(), eightFour()],
        [4, 0, 0, 0],
        halfTriplet().concat(halfTriplet()),
        [eightOff(), eightOff(), eightOff(), eightOff()],
    ]); }
};
