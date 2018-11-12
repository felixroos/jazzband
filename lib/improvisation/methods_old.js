"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var swing_1 = require("../grooves/swing");
var tonal_1 = require("tonal");
var util_1 = require("../util");
var Improvisation_1 = require("./Improvisation");
exports.permutator = new Improvisation_1.Improvisation({
    groove: swing_1.swing,
    groovePattern: function (_a) {
        var groove = _a.groove;
        return groove()['solo'] || (function (m) {
            return m.measure.map(function () { return [1]; });
        });
    },
    octave: 5,
    direction: null,
    otherDirection: function (_a) {
        var direction = _a.direction;
        if (direction() === 'up') {
            return 'down';
        }
        else if (direction() === 'down') {
            return 'up';
        }
        return direction();
    },
    force: false,
    flip: false,
    playedNotes: [],
    fixRange: true,
    startRandom: false,
    firstNote: function (_a) {
        var randomNote = _a.randomNote, startRandom = _a.startRandom, pattern = _a.pattern, chord = _a.chord;
        console.log('first');
        if (startRandom()) {
            return randomNote();
        }
        var firstNote = util_1.getPatternInChord([pattern()[0]], chord());
        return firstNote;
    },
    lastNote: function (_a) {
        var playedNotes = _a.playedNotes;
        return playedNotes().length ? playedNotes()[0] : null;
    },
    material: function (_a) {
        var pattern = _a.pattern, chord = _a.chord;
        return util_1.getPatternInChord(pattern(), chord());
    },
    randomNote: function (_a) {
        var material = _a.material, octave = _a.octave;
        return util_1.randomElement(material()) + octave();
    },
    note: function (_a) {
        var fixRange = _a.fixRange, lastNote = _a.lastNote, range = _a.range, randomNote = _a.randomNote, material = _a.material, direction = _a.direction, force = _a.force, flip = _a.flip;
        var note;
        if (!lastNote()) {
            note = randomNote();
        }
        else {
            note = util_1.getNearestTargets(lastNote(), material(), direction(), force(), flip())[0];
            note = tonal_1.Note.simplify(note, true);
        }
        if (fixRange()) {
            note = util_1.transposeToRange([note], range())[0];
        }
        return note;
    }
});
exports.guideTones = exports.permutator.enhance({
    groove: null,
    direction: 'down',
    pattern: [3, 7]
});
exports.guideTonesFlipped = exports.guideTones.enhance({
    flip: true
});
exports.advancedPermutator = exports.permutator.enhance({
    variance: .5,
    drill: .5,
    direction: function (_a) {
        var drill = _a.drill;
        return drill() > 0 ? 'up' : 'down';
    },
    force: function (_a) {
        var drill = _a.drill;
        return Math.random() * Math.abs(drill()) > .5;
    },
    targets: function (_a) {
        var variance = _a.variance, pattern = _a.pattern;
        return ((variance() * pattern().length + 1) % pattern().length);
    },
    exclude: 1,
    material: function (_a) {
        var pattern = _a.pattern, chord = _a.chord, playedNotes = _a.playedNotes, exclude = _a.exclude;
        var all = util_1.getPatternInChord(pattern(), chord());
        if (!playedNotes().length) {
            return all;
        }
        var excludeNotes = playedNotes()
            .slice(0, exclude())
            .map(function (n) { return tonal_1.Note.pc(n); });
        return all.filter(function (n) { return !excludeNotes.includes(n); });
    }
});
exports.chordTones = exports.advancedPermutator.enhance({
    pattern: [1, 3, 5, 7],
    variance: .75,
    drill: .75,
    direction: function (_a) {
        var drill = _a.drill;
        return drill() > 0 ? 'up' : 'down';
    },
});
var pendulum = {
    variance: .5,
    exclude: 1,
    force: true,
    fixRange: false,
    direction: function (_a) {
        var lastNote = _a.lastNote, range = _a.range, direction = _a.direction, otherDirection = _a.otherDirection;
        var position = util_1.getRangePosition(lastNote(), range());
        if (position < 0) {
            return 'up';
        }
        else if (position > 1) {
            return 'down';
        }
        return direction() || 'up';
    }
};
exports.digitalPattern = exports.advancedPermutator.enhance(__assign({ pattern: function (_a) {
        var chord = _a.chord;
        return util_1.getDigitalPattern(chord());
    }, groove: null, groovePattern: function () { return (function (m) {
        return m.measure.map(function () { return [1, 1, 1, 1]; });
    }); } }, pendulum));
