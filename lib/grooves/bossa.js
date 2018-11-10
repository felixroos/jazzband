"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bossa = {
    /* chords: () => randomElement([
        [[2, 0, 0, 1], 0, [0, .6], [0, 3.5, 0, 0]],
        [[1, 0, 0, 5], 0, [0, .6], [1, .5, 0, 0]],
        [[1, 0, 0, 5], 0, [0, .6], [.5, 0, 2, 0]],
        [[1, 0, 0, 5], 0, [0, .6], [0, 2, 0, 1]],
        [[3, 0, 0, 0], 0, 2, 0]
    ]),
    bass: () => randomElement(
        [
            [[2, 0, 0, 1], [0, 1], 1, [0, 1]],
            [[2, 0, 0, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]],
        ]
    ), */
    rimshot: function (_a) {
        var measure = _a.measure, settings = _a.settings;
        console.log('settings', settings);
        return [1, [0, 1], 0, 1]; /* , [0, 1, [0, 1], 0] */
    },
    /* kick: (t) => [[[1, .7], 0, [0, 1], 0]],
    snare: (t) => [0, 1, [0, .2, 0, 0], [1, 0, 0, .6]], */
    hihat: function (t) { return [0, 1, 0, 1]; }
};
