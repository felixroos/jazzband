"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disco = {
    name: 'Disco',
    tempo: 120,
    chords: function () { return [0, [.3, .3], 0, 1]; },
    bass: function () { return [[.5, .5, .5, .5], [.5, .5, .5, .5], [.5, .5, .5, .5], [.5, .5, .5, .5]]; },
    kick: function () { return [1, 1, 1, 1]; },
    snare: function () { return [0, [1, 0, 0, Math.random() > .5 ? [.4, .3] : 0], 0, 1]; },
    hihat: function () { return [[0, .8], [0, .7], [0, [.9, .8]], [0, [.8, .4, .2]]]; },
};
