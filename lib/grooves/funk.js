"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
exports.funk = {
    chords: function () { return util_1.randomElement([
        [[2, 0, 0, 1], 0, [0, .6], [0, 3.5, 0, 0]],
        [[1, 0, 0, 5], 0, [0, .6], [1, .5, 0, 0]],
        [[1, 0, 0, 5], 0, [0, .6], [.5, 0, 2, 0]],
        [[1, 0, 0, 5], 0, [0, .6], [0, 2, 0, 1]],
        [[3, 0, 0, 0], 0, 2, 0]
    ]); },
    bass: function () { return util_1.randomElement([
        [[2, 0, 0, 1], [0, 1], 1, [0, 1]],
        [[2, 0, 0, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]],
    ]); },
    kick: function (t) { return [[[1, .7], 0, [0, 1], 0]]; },
    snare: function (t) { return [0, 1, [0, .2, 0, 0], [1, 0, 0, .6]]; },
    hihat: function (t) { return [[.5, .6], [.4, .7], [.3, .6], [.5, .7]]; }
};
