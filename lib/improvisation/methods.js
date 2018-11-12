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
    octave: 4,
    reach: 1,
    lineBreaks: false,
    direction: null,
    force: false,
    flip: false,
    playedNotes: [],
    fixRange: true,
    startRandom: false,
    /* chanceCurve: () => (distance, length) => (length - distance) * 10, */
    firstNoteInPattern: function (_a) {
        var pattern = _a.pattern, chord = _a.chord;
        return util_1.getPatternInChord([pattern()[0]], chord());
    },
    firstNote: function (_a) {
        var randomNote = _a.randomNote, firstNoteInPattern = _a.firstNoteInPattern, startRandom = _a.startRandom, octave = _a.octave;
        return startRandom() ? randomNote() : firstNoteInPattern() + octave();
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
    nextNotes: function (_a) {
        var fixRange = _a.fixRange, firstNote = _a.firstNote, chord = _a.chord, reach = _a.reach, lineBreaks = _a.lineBreaks, lastNote = _a.lastNote, range = _a.range, material = _a.material, direction = _a.direction, force = _a.force, flip = _a.flip;
        var note;
        if (!lastNote() || lineBreaks()) {
            note = firstNote();
        }
        else {
            var choices = material();
            if (!choices.length) {
                console.warn('no choice..');
                return;
            }
            var targets = util_1.getNearestTargets(lastNote(), material(), direction(), force(), flip());
            targets = targets.slice(0, reach());
            note = util_1.randomElement(targets);
            note = tonal_1.Note.simplify(note, true);
        }
        if (fixRange()) {
            note = util_1.transposeToRange([note], range())[0];
        }
        var step = util_1.getDegreeInChord(note, chord());
        console.log(step + " in " + chord() + " = " + note);
        return [note];
    }
});
/** MODIFIERS */
var getStraightBar = function (notes, cycle) {
    if (cycle === void 0) { cycle = 4; }
    return new Array(cycle).fill(new Array(Math.ceil(notes / cycle)).fill(1));
};
var straightNotes = function (n, cycle) {
    if (cycle === void 0) { cycle = 4; }
    return ({
        groove: null,
        groovePattern: function () { return (function (m) {
            return getStraightBar(n, cycle);
        }); },
    });
};
var fixedNotesPerChord = function (n, cycle) {
    if (cycle === void 0) { cycle = 4; }
    return ({
        groove: null,
        groovePattern: function () { return (function (m) { return m.measure.map(function () {
            return getStraightBar(n, cycle);
        }); }); },
    });
};
var pendulum = function (defaultDirection, softForce, comfort) {
    if (defaultDirection === void 0) { defaultDirection = 'up'; }
    if (softForce === void 0) { softForce = false; }
    if (comfort === void 0) { comfort = .4; }
    return ({
        exclude: 1,
        force: !softForce ? true : function (_a) {
            var lastNote = _a.lastNote, range = _a.range;
            var position = util_1.getRangePosition(lastNote(), range());
            return position < 0 || position > 1; // only force if out of range..    
        },
        fixRange: false,
        direction: function (_a) {
            var lastNote = _a.lastNote, range = _a.range, direction = _a.direction, barNumber = _a.barNumber, isBarStart = _a.isBarStart;
            var position = util_1.getRangePosition(lastNote(), range());
            var comfortSwitchBars = 1; // switch direction each x bars when in comfort zone
            var isComfortZone = (position > comfort && position < 1 - comfort);
            if ((position < 0 && direction() === 'down') ||
                (position > 1 && direction() === 'up') ||
                (isComfortZone && isBarStart() && barNumber() % comfortSwitchBars === 0)) {
                console.log('change direction', util_1.otherDirection(direction(), defaultDirection));
                return util_1.otherDirection(direction(), defaultDirection);
            }
            return direction() || defaultDirection;
        }
    });
};
var beatPattern = function (_a) {
    var pattern = _a.pattern, on = _a.on, off = _a.off, barStart = _a.barStart;
    return ({
        beatPattern: function (f) {
            console.log('beat pattern', f.chord());
            if (f.isBarStart()) {
                return barStart || on || pattern(f);
            }
            else if (!f.isOffbeat()) {
                return on || pattern;
            }
            return off || pattern;
        },
        pattern: function (_a) {
            var beatPattern = _a.beatPattern;
            return beatPattern();
        },
    });
};
var notesPerChord = function (n) { return (__assign({}, fixedNotesPerChord(1, n))); };
var patternPractise = function (direction, notes, lineBreaks) {
    if (direction === void 0) { direction = 'up'; }
    if (notes === void 0) { notes = 4; }
    if (lineBreaks === void 0) { lineBreaks = false; }
    return (__assign({}, straightNotes(notes), { firstNoteInPattern: function (_a) {
            var pattern = _a.pattern, chord = _a.chord;
            return util_1.getPatternInChord(direction === 'up' ? [pattern()[0]] : pattern().slice(-1), chord());
        }, direction: direction, force: true, fixRange: false, lineBreaks: function (_a) {
            var isBarStart = _a.isBarStart;
            return lineBreaks ? isBarStart() : false;
        }, exclude: 1, reach: 1 }));
};
/** FORMULAS */
exports.advancedPermutator = exports.permutator.enhance({
    drill: .5,
    direction: function (_a) {
        var drill = _a.drill;
        return drill() > 0 ? 'up' : 'down';
    },
    force: function (_a) {
        var drill = _a.drill;
        return Math.random() * Math.abs(drill()) > .5;
    },
    exclude: 1,
    reach: 1,
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
exports.guideTones = exports.advancedPermutator.enhance(__assign({}, notesPerChord(1), pendulum('down', true), { pattern: [3, 7], exclude: 0 }));
exports.guideTonesFlipped = exports.guideTones.enhance({
    flip: true
});
exports.chordTones = exports.advancedPermutator.enhance({
    pattern: [1, 3, 5, 7],
    drill: .75,
    direction: function (_a) {
        var drill = _a.drill;
        return drill() > 0 ? 'up' : 'down';
    },
});
/* export const digitalPattern = advancedPermutator.enhance({
    pattern: ({ chord }) => getDigitalPattern(chord()),
    ...pendulum(),
    ...straightNotes(4)
}); */
exports.fullScale = exports.advancedPermutator.enhance(__assign({}, straightNotes(8), beatPattern({ on: [1, 3, 5, 7], off: [1, 2, 3, 4, 5, 6, 7] }), pendulum()));
exports.scalePendulum = exports.advancedPermutator.enhance(__assign({}, beatPattern({ on: [1, 3, 5, 7], off: [1, 2, 3, 4, 5, 6, 7] }), pendulum()));
exports.digitalPattern = exports.advancedPermutator.enhance(__assign({ pattern: function (_a) {
        var chord = _a.chord;
        return util_1.getDigitalPattern(chord());
    } }, pendulum('up', true, .2), { exclude: 2, reach: 3 }, straightNotes(4)));
exports.digitalPendulum = exports.advancedPermutator.enhance(__assign({ pattern: function (_a) {
        var chord = _a.chord;
        return util_1.getDigitalPattern(chord());
    } }, pendulum('up', false, 1), straightNotes(4), { lineBreaks: function (_a) {
        var isBarStart = _a.isBarStart;
        return isBarStart();
    }, range: ['Bb3', 'Bb5'], fixRange: false, exclude: 1, reach: 1 }));
exports.digitalPractise = exports.advancedPermutator.enhance(__assign({}, patternPractise('up', 8, true), { pattern: function (_a) {
        var chord = _a.chord;
        return util_1.getDigitalPattern(chord());
    }, 
    /* ...beatPattern({ pattern: ({ chord }) => getDigitalPattern(chord()), barStart: [1] }), */
    range: ['F3', 'F5'] }));
exports.heptatonicPractise = exports.advancedPermutator.enhance(__assign({}, patternPractise('up', 8, false), beatPattern({ barStart: [1], on: [3, 5, 7], off: [1, 2, 3, 4, 5, 6, 7] }), { range: ['F3', 'F5'] }));
exports.defaultMethod = exports.guideTones;
