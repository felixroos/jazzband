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
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var tonal_3 = require("tonal");
var tonal_4 = require("tonal");
var util_1 = require("../util/util");
var Harmony = /** @class */ (function () {
    function Harmony() {
    }
    Harmony.isBlack = function (note) {
        return tonal_1.Note.props(note)['acc'] !== '';
    };
    Harmony.hasSamePitch = function (noteA, noteB, ignoreOctave) {
        if (ignoreOctave === void 0) { ignoreOctave = false; }
        if (ignoreOctave || util_1.isPitchClass(noteA) || util_1.isPitchClass(noteB)) {
            return tonal_1.Note.props(noteA).chroma === tonal_1.Note.props(noteB).chroma;
        }
        return tonal_1.Note.midi(noteA) === tonal_1.Note.midi(noteB);
    };
    Harmony.getTonalChord = function (chord) {
        if (!chord) {
            return null;
        }
        chord = chord
            .replace(/([A-G][b|#]?)(69)/, '$1M69')
            .replace('-', 'm')
            .replace('^', 'M')
            .replace('h7', 'm7b5')
            .replace('h', 'dim');
        /**
         * Chords that dont work:
         * slash cords are ignored
         * 7b9b5 does not work
         *
         */
        var tokens = tonal_2.Chord.tokenize(chord);
        var s = tokens[1].split('/');
        return tokens[0] + (s[0] || 'M');
    };
    Harmony.getBassNote = function (chord, ignoreSlash) {
        if (ignoreSlash === void 0) { ignoreSlash = false; }
        if (!chord) {
            return null;
        }
        if (!ignoreSlash && chord.includes('/')) {
            return chord.split('/')[1];
        }
        return chord.match((/[A-G][b|#]?/))[0];
    };
    Harmony.getMidi = function (note, offset) {
        if (offset === void 0) { offset = 0; }
        return tonal_1.Note.midi(note) - offset;
    };
    Harmony.intervalComplement = function (interval) {
        var fix = {
            '8P': '1P',
            '8d': '1A',
            '8A': '1d',
            '1A': '8d',
            '1d': '8A',
        };
        var fixIndex = Object.keys(fix).find(function (key) { return interval.match(key); });
        if (fixIndex) {
            return fix[fixIndex];
        }
        return tonal_3.Interval.invert(interval);
    };
    Harmony.invertInterval = function (interval) {
        if (!interval) {
            return null;
        }
        var positive = interval.replace('-', '');
        var complement = Harmony.intervalComplement(positive);
        var isNegative = interval.length > positive.length;
        return (isNegative ? '' : '-') + complement;
    };
    /** Transforms interval into one octave (octave+ get octaved down) */
    Harmony.fixInterval = function (interval, simplify) {
        if (interval === void 0) { interval = ''; }
        if (simplify === void 0) { simplify = false; }
        var fix = {
            '0A': '1P',
            '-0A': '1P',
        };
        if (simplify) {
            fix = __assign({}, fix, { '8P': '1P', '-8P': '1P' });
            interval = tonal_3.Interval.simplify(interval);
        }
        if (Object.keys(fix).includes(interval)) {
            return fix[interval];
        }
        return interval;
    };
    /** inverts the interval if it does not go to the desired direction */
    Harmony.forceDirection = function (interval, direction, noUnison) {
        if (noUnison === void 0) { noUnison = false; }
        var semitones = tonal_3.Interval.semitones(interval);
        if ((direction === 'up' && semitones < 0) ||
            (direction === 'down' && semitones > 0)) {
            return Harmony.invertInterval(interval);
        }
        if (interval === '1P' && noUnison) {
            return (direction === 'down' ? '-' : '') + '8P';
        }
        return interval;
    };
    // use Interval.ic?
    Harmony.minInterval = function (interval, direction, noUnison) {
        interval = Harmony.fixInterval(interval, true);
        if (direction) {
            return Harmony.forceDirection(interval, direction, noUnison);
        }
        var inversion = Harmony.invertInterval(interval);
        if (Math.abs(tonal_3.Interval.semitones(inversion)) < Math.abs(tonal_3.Interval.semitones(interval))) {
            interval = inversion;
        }
        return interval;
    };
    // returns array of intervals that lead the voices of chord A to chordB
    Harmony.minIntervals = function (chordA, chordB) {
        return chordA.map(function (n, i) { return Harmony.minInterval(tonal_4.Distance.interval(n, chordB[i])); });
    };
    Harmony.mapMinInterval = function (direction) {
        return function (interval) { return Harmony.minInterval(interval, direction); };
    };
    // sort function
    Harmony.sortMinInterval = function (preferredDirection, accessor) {
        if (preferredDirection === void 0) { preferredDirection = 'up'; }
        if (accessor === void 0) { accessor = (function (i) { return i; }); }
        return function (a, b) {
            var diff = Math.abs(tonal_3.Interval.semitones(accessor(a))) - Math.abs(tonal_3.Interval.semitones(accessor(b)));
            if (diff === 0) {
                return preferredDirection === 'up' ? -1 : 1;
            }
            return diff;
        };
    };
    /** Returns the note with the least distance to "from" */
    Harmony.getNearestNote = function (from, to, direction) {
        var interval = Harmony.minInterval(tonal_4.Distance.interval(tonal_1.Note.pc(from), tonal_1.Note.pc(to)), direction);
        return tonal_4.Distance.transpose(from, interval) + '';
    };
    /** Returns the note with the least distance to "from". TODO: add range */
    Harmony.getNearestTargets = function (from, targets, preferredDirection, flip) {
        if (preferredDirection === void 0) { preferredDirection = 'down'; }
        if (flip === void 0) { flip = false; }
        var intervals = targets
            .map(function (target) { return tonal_4.Distance.interval(tonal_1.Note.pc(from), target); })
            .map(Harmony.mapMinInterval(preferredDirection))
            .sort(Harmony.sortMinInterval(preferredDirection));
        /* if (flip) {
            intervals = intervals.reverse();
        } */
        return intervals.map(function (i) { return tonal_4.Distance.transpose(from, i); });
    };
    Harmony.intervalMatrix = function (from, to) {
        return to.map(function (note) { return from
            .map(function (n) {
            return tonal_4.Distance.interval(n, note);
        })
            .map(function (d) { return Harmony.minInterval(d); }); }
        /* .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i) */
        );
    };
    return Harmony;
}());
exports.Harmony = Harmony;
