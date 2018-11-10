"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tonal_1 = require("tonal");
var Synthesizer_1 = require("./instruments/Synthesizer");
function randomNumber(n) {
    return Math.floor(Math.random() * n);
}
exports.randomNumber = randomNumber;
function arraySum(array) {
    return array.reduce(function (s, i) { return s + i; }, 0);
}
exports.arraySum = arraySum;
function randomElement(array, weighted) {
    if (!weighted) {
        return array[randomNumber(array.length)];
    }
    var r = randomNumber(arraySum(weighted)) + 1;
    var total = weighted
        .reduce(function (abs, w, i) { return abs.concat(w + (abs.length ? abs[i - 1] : 0)); }, []);
    return array[total.indexOf(total.find(function (s, i) { return s >= r; }))];
}
exports.randomElement = randomElement;
function getTonalChord(chord) {
    chord = chord
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
    var tokens = tonal_1.Chord.tokenize(chord);
    var s = tokens[1].split('/');
    return tokens[0] + (s[0] || 'M');
}
exports.getTonalChord = getTonalChord;
function getMidi(note, offset) {
    return tonal_1.Note.props(note).midi - offset;
}
exports.getMidi = getMidi;
/** Travels path along measures */
function getPath(path, measures, traveled) {
    if (traveled === void 0) { traveled = []; }
    if (!Array.isArray(measures[path[0]]) || path.length === 1) {
        return measures[Math.min(path[0], measures.length - 1)];
    }
    return this.getPath(path.slice(1), measures[path[0]], traveled.concat(path[0]));
}
exports.getPath = getPath;
function getDuration(divisions, noteLength, measureLength) {
    if (noteLength === void 0) { noteLength = 1; }
    if (measureLength === void 0) { measureLength = 1; }
    return noteLength * divisions.reduce(function (f, d) { return f / d; }, 1000) * measureLength; // fraction of one
}
exports.getDuration = getDuration;
function resolveChords(pattern, measures, path, divisions) {
    var _this = this;
    if (divisions === void 0) { divisions = []; }
    if (Array.isArray(pattern)) {
        // division: array of children lengths down the path (to calculate fraction)
        divisions = [].concat(divisions, [pattern.length]);
        return pattern.map(function (p, i) { return _this.resolveChords(p, measures, path.concat([i]), divisions); });
    }
    if (pattern === 0) {
        return 0;
    }
    var fraction = getDuration(divisions, pattern);
    if (fraction === 0) {
        console.warn('fraction is 0', pattern);
    }
    return { chord: this.getPath(path, measures), pattern: pattern, /* gain, */ path: path, divisions: divisions, fraction: fraction };
}
exports.resolveChords = resolveChords;
function hasOff(pattern, division) {
    if (division === void 0) { division = 3; }
    return Array.isArray(pattern) && pattern.length === division && pattern[division - 1] !== 0;
}
exports.hasOff = hasOff;
// replaces offs on last beat with next chord + erases next one
function offbeatReducer(settings) {
    var _this = this;
    // TODO: find out why some offbeats sound sketchy
    return function (measures, bar, index) {
        var last = index > 0 ? measures[index - 1] : null;
        if (last && _this.hasOff(last[settings.cycle - 1], settings.division)) {
            last[settings.cycle - 1][settings.division - 1] = bar[0];
            bar[0] = 0;
        }
        return measures.concat([bar]);
    };
}
exports.offbeatReducer = offbeatReducer;
function invertInterval(interval) {
    if (tonal_1.Interval.semitones(interval) < 0) {
        return tonal_1.Interval.invert(interval.slice(1));
    }
    return '-' + tonal_1.Interval.invert(interval);
}
exports.invertInterval = invertInterval;
// use Interval.ic?
function smallestInterval(interval) {
    var smallest = tonal_1.Interval.simplify(interval);
    if (smallest === '0A') {
        smallest = '1P'; // TODO: issue for tonal-interval (0A does not support invert and is not simple)
    }
    var inversion = this.invertInterval(smallest);
    if (Math.abs(tonal_1.Interval.semitones(inversion)) < Math.abs(tonal_1.Interval.semitones(smallest))) {
        return inversion || interval;
    }
    return smallest || interval;
}
exports.smallestInterval = smallestInterval;
function minInterval(a, b, preferRightMovement) {
    var semitones = [Math.abs(tonal_1.Interval.semitones(a)), Math.abs(tonal_1.Interval.semitones(b))];
    if (semitones[0] === semitones[1]) {
        if (preferRightMovement) {
            return semitones[0] < 0 ? -1 : 1;
        }
        return semitones[0] > 0 ? -1 : 1;
    }
    return semitones[0] < semitones[1] ? -1 : 1;
}
exports.minInterval = minInterval;
function intervalMatrix(from, to) {
    var _this = this;
    return to.map(function (note) { return from
        .map(function (n) {
        return tonal_1.Distance.interval(n, note);
    })
        .map(function (d) { return _this.smallestInterval(d); })
        .map(function (i) { return i.slice(0, 2) === '--' ? i.slice(1) : i; }); });
}
exports.intervalMatrix = intervalMatrix;
function randomSynth(mix, allowed, settings) {
    if (allowed === void 0) { allowed = ['sine', 'triangle', 'square', 'sawtooth']; }
    if (settings === void 0) { settings = {}; }
    var gains = {
        sine: 0.9,
        triangle: 0.8,
        square: 0.2,
        sawtooth: 0.3
    };
    var wave = randomElement(allowed);
    return new Synthesizer_1.Synthesizer(Object.assign({ gain: gains[wave], type: wave, mix: mix }, settings));
}
exports.randomSynth = randomSynth;
function adsr(_a, time, param) {
    var attack = _a.attack, decay = _a.decay, sustain = _a.sustain, release = _a.release, gain = _a.gain, duration = _a.duration, endless = _a.endless;
    // console.log('adsr', attack, decay, sustain, release, gain, duration, time);
    param.linearRampToValueAtTime(gain, time + attack);
    param.setTargetAtTime(sustain * gain, time + Math.min(attack + decay, duration), decay);
    if (!endless) {
        param.setTargetAtTime(0, time + Math.max(duration - attack - decay, attack + decay, duration), release);
    }
}
exports.adsr = adsr;
function randomDelay(maxMs) {
    return Math.random() * maxMs * 2 / 1000;
}
exports.randomDelay = randomDelay;
function isInRange(note, range) {
    return tonal_1.Distance.semitones(note, range[0]) <= 0 && tonal_1.Distance.semitones(note, range[1]) >= 0;
}
exports.isInRange = isInRange;
function transposeNotes(notes, interval) {
    return notes.map(function (note) { return tonal_1.Distance.transpose(note, interval); });
}
exports.transposeNotes = transposeNotes;
function transposeToRange(notes, range, times) {
    if (times === void 0) { times = 0; }
    if (times > 10) {
        return notes;
    }
    if (notes.find(function (note) { return tonal_1.Distance.semitones(note, range[0]) > 0; })) {
        notes = notes.map(function (note) { return tonal_1.Distance.transpose(note, '8P'); });
        return transposeToRange(notes, range, ++times);
    }
    if (notes.find(function (note) { return tonal_1.Distance.semitones(note, range[1]) < 0; })) {
        notes = notes.map(function (note) { return tonal_1.Distance.transpose(note, '-8P'); });
        return transposeToRange(notes, range, ++times);
    }
    return notes;
}
exports.transposeToRange = transposeToRange;
function getIntervalFromStep(step) {
    if (typeof step === 'number' && step < 0) {
        step = 'b' + (step * -1);
    }
    step = step + ''; // to string
    var steps = {
        '1P': ['1', '8'],
        '2m': ['b2', 'b9'],
        '2M': ['2', '9'],
        '2A': ['#9', '#2'],
        '3m': ['b3'],
        '3M': ['3'],
        '4P': ['4', '11'],
        '4A': ['#11', '#4'],
        '5D': ['b5'],
        '5P': ['5'],
        '6m': ['b13', 'b6'],
        '6M': ['13', '6'],
        '7m': ['b7'],
        '7M': ['7', '^7', 'maj7']
    };
    var interval = Object.keys(steps)
        .find(function (i) { return steps[i].includes(step); });
    if (!interval) {
        console.warn("step " + step + " has no defined inteval");
    }
    return interval;
}
exports.getIntervalFromStep = getIntervalFromStep;
function getChordScales(chord, occasion) {
    var props = tonal_1.Chord.props(getTonalChord(chord));
    console.log('props', props);
    return ['D dorian'];
}
exports.getChordScales = getChordScales;
