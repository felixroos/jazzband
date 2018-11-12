"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var off = function () { return util_1.randomElement([0, [0, 0, 2]], [6, 1]); };
var eightFour = function () { return util_1.randomElement([[1, 0, 1], 1, [0, 0, 1, 1]], [4, 2, 1]); };
var eightOff = function () { return util_1.randomElement([[1, 0, 1], [0, 0, 1]], [4, 1]); };
var halfTriplet = function () { return util_1.randomElement([
    [2, 0],
    [[2, 0, 2], [0, 2, 0]],
    [1, 1, 1, 1]
], [2, 1, 1]); };
exports.swing = {
    name: 'Swing',
    tempo: 130,
    chords: function (_a) {
        var measure = _a.measure, settings = _a.settings;
        var r = Math.random() > 0.5 ? .6 : 0;
        var t = settings.cycle + "/" + measure.length;
        if (t === '4/1') {
            return util_1.randomElement([
                [[1, 0], [0, 0, 7], 0, 0],
                [1, [0, 0, 2], 0, off()],
                [[0, 0, 1], 0, 2, 0],
                [[0, 0, 4], 0, 1, 0],
                [2, 0, 0, 0],
                [3, 0, 0, 0],
                [1, 0, r, off()],
                [[0, 0, 2], 0, r, 0],
                [1.5, [0, 0, 2], 0, off()],
            ]); //, [2, 1, 1]
        }
        if (t === '4/2') {
            return util_1.randomElement([
                [[1, 0], [0, 0, 7], 0, 0],
                [1, [0, 0, 3], 0, 0],
                [1, 0, 2, 0],
                [2, 0, 1, 0],
                [1, 0, .7, off()],
                [[1, 0, 0], 0, .7, off()],
                [[4, 0, 0], [0, 0, 2.8], 0, off()],
            ]);
        }
        if (t === '4/3') {
            return [1, [0, 0, 2], [0, 0, 4], 0];
        }
        if ('4/4') {
            return util_1.randomElement([
                [1, 1, 1, 1],
                [[1, 0, 2], [0, 0, 2], 0, 1]
            ]);
        }
    },
    bass: function () { return util_1.randomElement([
        [1, 1, 1, 1],
    ]); },
    crash: function (_a) {
        var measures = _a.measures, index = _a.index;
        var fill = index !== 0 && index % measures.length === 0;
        if (fill) {
            return [4, 0, 0, 0];
        }
        return [0, 0, 0, 0];
    },
    ride: function (_a) {
        var measures = _a.measures, index = _a.index;
        return util_1.randomElement([
            [.6, [.9, 0, 1], .6, [.9, 0, 1]],
            [.6, [.4, 0, 1], .8, [0, 0, 1],],
            [.6, .9, [.6, 0, 1], 1],
            [.6, .9, .6, [.9, 0, 1]],
        ], [3, 2, 1, 2]);
    },
    hihat: function () { return [0, .8, 0, 1]; },
    solo: function () { return util_1.randomElement([
        [eightFour(), eightFour(), eightFour(), eightFour()],
        [eightFour(), 2, 0, eightFour()],
        [0, 0, eightFour(), eightFour()],
        [[1, 0, 4], 0, eightFour(), eightFour()],
        [3, 0, 0, eightFour()],
        halfTriplet().concat(halfTriplet()),
        [eightOff(), eightOff(), eightOff(), eightOff()],
    ]); }
    /* solo: () => [1, 1, 0, 1] */
};
