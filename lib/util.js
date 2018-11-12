"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tonal_1 = require("tonal");
var Synthesizer_1 = require("./instruments/Synthesizer");
var symbols_1 = require("./symbols");
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
function shuffleArray(a) {
    var _a;
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
    }
    return a;
}
exports.shuffleArray = shuffleArray;
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
    var fix = {
        '1A': '-8d',
        '-1A': '8d',
    };
    if (fix[interval]) {
        return fix[interval];
    }
    if (tonal_1.Interval.semitones(interval) < 0) {
        return tonal_1.Interval.invert(interval.slice(1));
    }
    return '-' + tonal_1.Interval.invert(interval);
}
exports.invertInterval = invertInterval;
/** Transforms interval into one octave (octave+ get octaved down) */
function simplifyInterval(interval) {
    interval = tonal_1.Interval.simplify(interval) || '1P';
    var fix = {
        '8P': '1P',
        '-8P': '1P',
        '0A': '1P',
        '-0A': '1P',
        '8d': '-1A',
        '-8d': '1A',
    };
    if (fix[interval]) {
        return fix[interval];
    }
    return interval;
}
exports.simplifyInterval = simplifyInterval;
/** inverts the interval if it does not go to the desired direction */
function forceDirection(interval, direction) {
    if ((direction === 'up' && tonal_1.Interval.semitones(interval) < 0) ||
        (direction === 'down' && tonal_1.Interval.semitones(interval) > 0)) {
        return invertInterval(interval);
    }
    return interval;
}
exports.forceDirection = forceDirection;
// use Interval.ic?
function minInterval(interval, direction, force) {
    if (direction === void 0) { direction = 'up'; }
    interval = simplifyInterval(interval);
    if (!force) {
        var inversion = invertInterval(interval);
        if (Math.abs(tonal_1.Interval.semitones(inversion)) < Math.abs(tonal_1.Interval.semitones(interval))) {
            interval = inversion;
        }
    }
    if (direction && force) {
        return forceDirection(interval, direction);
    }
    return interval;
}
exports.minInterval = minInterval;
function mapMinInterval(direction, force) {
    if (direction === void 0) { direction = 'up'; }
    return function (interval) { return minInterval(interval, direction, force); };
}
exports.mapMinInterval = mapMinInterval;
// sort function
function sortMinInterval(preferredDirection) {
    if (preferredDirection === void 0) { preferredDirection = 'up'; }
    return function (a, b) {
        var diff = Math.abs(tonal_1.Interval.semitones(a)) - Math.abs(tonal_1.Interval.semitones(b));
        if (diff === 0) {
            return preferredDirection === 'up' ? -1 : 1;
        }
        return diff;
    };
}
exports.sortMinInterval = sortMinInterval;
/** Returns the note with the least distance to "from" */
function getNearestNote(from, to, direction, force) {
    if (force === void 0) { force = !!direction; }
    var interval = minInterval(tonal_1.Distance.interval(tonal_1.Note.pc(from), to), direction, force);
    return tonal_1.Distance.transpose(from, interval);
}
exports.getNearestNote = getNearestNote;
/** Returns the note with the least distance to "from". TODO: add range */
function getNearestTargets(from, targets, preferredDirection, force, flip) {
    if (preferredDirection === void 0) { preferredDirection = 'down'; }
    if (force === void 0) { force = false; }
    if (flip === void 0) { flip = false; }
    var intervals = targets
        .map(function (target) { return tonal_1.Distance.interval(tonal_1.Note.pc(from), target); })
        .map(mapMinInterval(preferredDirection, force))
        .sort(sortMinInterval(preferredDirection));
    if (flip) {
        intervals = intervals.reverse();
    }
    return intervals.map(function (i) { return tonal_1.Distance.transpose(from, i); });
}
exports.getNearestTargets = getNearestTargets;
function intervalMatrix(from, to) {
    return to.map(function (note) { return from
        .map(function (n) {
        return tonal_1.Distance.interval(n, note);
    })
        .map(function (d) { return minInterval(d); }); }
    /* .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i) */
    );
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
// accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval
function getStep(step) {
    if (typeof step === 'number' && step < 0) {
        step = 'b' + (step * -1);
    }
    return step + ''; // to string
}
exports.getStep = getStep;
var steps = {
    '1P': ['1', '8'],
    '2m': ['b9', 'b2'],
    '2M': ['9', '2',],
    '2A': ['#9', '#2'],
    '3m': ['b3'],
    '3M': ['3'],
    '4P': ['11', '4'],
    '4A': ['#11', '#4'],
    '5D': ['b5'],
    '5P': ['5'],
    '6m': ['b13', 'b6'],
    '6M': ['13', '6'],
    '7m': ['b7'],
    '7M': ['7', '^7', 'maj7']
};
function getIntervalFromStep(step) {
    step = getStep(step);
    var interval = Object.keys(steps)
        .find(function (i) { return steps[i].includes(step); });
    if (!interval) {
        // console.warn(`step ${step} has no defined inteval`);
    }
    return interval;
}
exports.getIntervalFromStep = getIntervalFromStep;
function getChordScales(chord, group) {
    if (group === void 0) { group = 'Diatonic'; }
    var tokens = tonal_1.Chord.tokenize(getTonalChord(chord));
    var isSuperset = tonal_1.PcSet.isSupersetOf(tonal_1.Chord.intervals(tokens[1]));
    return symbols_1.scaleNames(group).filter(function (name) { return isSuperset(tonal_1.Scale.intervals(name)); });
}
exports.getChordScales = getChordScales;
function pickChordScale(chord, group) {
    if (group === void 0) { group = 'Diatonic'; }
    var scales = getChordScales(chord);
    if (!scales.length) {
        console.warn("cannot pick chord scale: no scales found for chord " + chord + " in group " + group);
        return;
    }
    return scales[0];
}
exports.pickChordScale = pickChordScale;
function findDegree(degree, intervals) {
    return intervals
        .find(function (i) { return i.includes(getStep(degree)) ||
        i === getIntervalFromStep(degree); });
}
exports.findDegree = findDegree;
function hasDegree(degree, intervals) {
    return !!findDegree(degree, intervals);
}
exports.hasDegree = hasDegree;
function hasAllDegrees(degrees, intervals) {
    return degrees.reduce(function (res, d) { return res && hasDegree(d, intervals); }, true);
}
exports.hasAllDegrees = hasAllDegrees;
function getScaleDegree(degree, scale) {
    return findDegree(degree, tonal_1.Scale.intervals(scale));
}
exports.getScaleDegree = getScaleDegree;
function getScalePattern(pattern, scale) {
    return pattern.map(function (degree) { return getScaleDegree(degree, scale); });
}
exports.getScalePattern = getScalePattern;
function renderIntervals(intervals, root) {
    return intervals.map(function (i) { return tonal_1.Distance.transpose(root, i); });
}
exports.renderIntervals = renderIntervals;
function renderSteps(steps, root) {
    return renderIntervals(steps.map(function (step) { return getIntervalFromStep(step); }), root);
}
exports.renderSteps = renderSteps;
function permutateIntervals(intervals, pattern) {
    return pattern.map(function (d) { return findDegree(d, intervals); });
}
exports.permutateIntervals = permutateIntervals;
function getPatternInChord(pattern, chord) {
    chord = getTonalChord(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    var tokens = tonal_1.Chord.tokenize(chord);
    var permutation;
    if (hasAllDegrees(pattern, intervals)) {
        permutation = permutateIntervals(intervals, pattern);
    }
    else {
        // not all degrees of the pattern are in the chord > get scale
        var scale = pickChordScale(chord);
        permutation = permutateIntervals(tonal_1.Scale.intervals(scale), pattern);
    }
    if (tokens[0]) {
        return renderIntervals(permutation, tokens[0]);
    }
    return permutation;
}
exports.getPatternInChord = getPatternInChord;
// TODO: other way around: find fixed interval pattern in a scale
// TODO: motives aka start pattern from same note in different scale
// TODO: motives aka start pattern from different note in same scale
// TODO: motives aka start pattern from different note in different scale
function getDigitalPattern(chord) {
    chord = getTonalChord(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    if (intervals.includes('3m')) {
        return [1, 3, 4, 5];
    }
    else if (intervals.includes('3M')) {
        return [1, 2, 3, 5];
    }
    else {
        return [1, 1, 1, 1];
    }
}
exports.getDigitalPattern = getDigitalPattern;
function renderDigitalPattern(chord) {
    return getPatternInChord(getDigitalPattern(chord), chord);
}
exports.renderDigitalPattern = renderDigitalPattern;
function getGuideTones(chord) {
    chord = getTonalChord(chord);
    return getPatternInChord([3, 7], chord);
}
exports.getGuideTones = getGuideTones;
function getRangePosition(note, range) {
    var semitones = [tonal_1.Distance.semitones(range[0], note), tonal_1.Distance.semitones(range[0], range[1])];
    return semitones[0] / semitones[1];
}
exports.getRangePosition = getRangePosition;
function isFirstInPath(path, index) {
    return path.slice(index)
        .reduce(function (sum, value) { return sum + value; }, 0) === 0;
}
exports.isFirstInPath = isFirstInPath;
function isBarStart(path) {
    return isFirstInPath(path, 1);
}
exports.isBarStart = isBarStart;
function isFormStart(path) {
    return isFirstInPath(path, 0);
}
exports.isFormStart = isFormStart;
function isOffbeat(path) {
    return path[2] !== 0;
}
exports.isOffbeat = isOffbeat;
function getDegreeFromInterval(interval) {
    return steps[interval] ? steps[interval][0] : 0;
}
exports.getDegreeFromInterval = getDegreeFromInterval;
function getDegreeInChord(note, chord, group) {
    return getDegreeFromInterval(tonal_1.Distance.interval(tonal_1.Chord.tokenize(getTonalChord(chord))[0], tonal_1.Note.pc(note)));
}
exports.getDegreeInChord = getDegreeInChord;
function otherDirection(direction, defaultDirection) {
    if (direction === 'up') {
        return 'down';
    }
    else if (direction === 'down') {
        return 'up';
    }
    return defaultDirection;
}
exports.otherDirection = otherDirection;
