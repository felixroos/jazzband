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
var Synthesizer_1 = require("./instruments/Synthesizer");
var symbols_1 = require("./symbols");
var Permutation_1 = require("./Permutation");
var Logger_1 = require("./Logger");
var steps = {
    '1P': ['1', '8'],
    '2m': ['b9', 'b2'],
    '2M': ['9', '2',],
    '2A': ['#9', '#2'],
    '3m': ['b3'],
    '3M': ['3'],
    '4P': ['11', '4'],
    '4A': ['#11', '#4'],
    '5d': ['b5'],
    '5P': ['5'],
    '5A': ['#5'],
    '6m': ['b13', 'b6'],
    '6M': ['13', '6'],
    '7m': ['b7'],
    '7M': ['7', '^7', 'maj7']
};
/*
Lower Interval Limits (just guidelines):
2m: E3-F3
2M: Eb3-F3
3m: C3-Eb3
3M: Bb2-D3
4P: Bb2-Eb3
5D: B2-F3
5P: Bb1-F2
6m: F2-Db3
6M: F2-D3
7m: F2-Eb3
7m: F2-E3
8P: -

more rough: top note should be D3 or higher.
taken from https://www.youtube.com/watch?v=iW6YeDJklhQ
*/
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
function isBlack(note) {
    return tonal_1.Note.props(note).acc !== '';
}
exports.isBlack = isBlack;
function isSameNote(noteA, noteB) {
    return tonal_1.Note.midi(noteA) === tonal_1.Note.midi(noteB);
}
exports.isSameNote = isSameNote;
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
    if (offset === void 0) { offset = 0; }
    return tonal_1.Note.midi(note) - offset;
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
    if (fraction === NaN) {
        console.warn('fraction NaN', divisions, pattern);
    }
    return { chord: this.getPath(path, measures), pattern: pattern, path: path, divisions: divisions, fraction: fraction };
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
function intervalComplement(interval) {
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
    return tonal_1.Interval.invert(interval);
}
exports.intervalComplement = intervalComplement;
function invertInterval(interval) {
    if (!interval) {
        return null;
    }
    var positive = interval.replace('-', '');
    var complement = intervalComplement(positive);
    var isNegative = interval.length > positive.length;
    return (isNegative ? '' : '-') + complement;
}
exports.invertInterval = invertInterval;
/** Transforms interval into one octave (octave+ get octaved down) */
function fixInterval(interval, simplify) {
    if (interval === void 0) { interval = ''; }
    if (simplify === void 0) { simplify = false; }
    var fix = {
        '0A': '1P',
        '-0A': '1P',
    };
    if (simplify) {
        fix = __assign({}, fix, { '8P': '1P', '-8P': '1P' });
        interval = tonal_1.Interval.simplify(interval);
    }
    if (Object.keys(fix).includes(interval)) {
        return fix[interval];
    }
    return interval;
}
exports.fixInterval = fixInterval;
/** inverts the interval if it does not go to the desired direction */
function forceDirection(interval, direction, noUnison) {
    if (noUnison === void 0) { noUnison = false; }
    var semitones = tonal_1.Interval.semitones(interval);
    if ((direction === 'up' && semitones < 0) ||
        (direction === 'down' && semitones > 0)) {
        return invertInterval(interval);
    }
    if (interval === '1P' && noUnison) {
        return (direction === 'down' ? '-' : '') + '8P';
    }
    return interval;
}
exports.forceDirection = forceDirection;
// use Interval.ic?
function minInterval(interval, direction, noUnison) {
    interval = fixInterval(interval, true);
    if (direction) {
        return forceDirection(interval, direction, noUnison);
    }
    var inversion = invertInterval(interval);
    if (Math.abs(tonal_1.Interval.semitones(inversion)) < Math.abs(tonal_1.Interval.semitones(interval))) {
        interval = inversion;
    }
    return interval;
}
exports.minInterval = minInterval;
function mapMinInterval(direction) {
    return function (interval) { return minInterval(interval, direction); };
}
exports.mapMinInterval = mapMinInterval;
// sort function
function sortMinInterval(preferredDirection, accessor) {
    if (preferredDirection === void 0) { preferredDirection = 'up'; }
    if (accessor === void 0) { accessor = (function (i) { return i; }); }
    return function (a, b) {
        var diff = Math.abs(tonal_1.Interval.semitones(accessor(a))) - Math.abs(tonal_1.Interval.semitones(accessor(b)));
        if (diff === 0) {
            return preferredDirection === 'up' ? -1 : 1;
        }
        return diff;
    };
}
exports.sortMinInterval = sortMinInterval;
/** Returns the note with the least distance to "from" */
function getNearestNote(from, to, direction) {
    var interval = minInterval(tonal_1.Distance.interval(tonal_1.Note.pc(from), tonal_1.Note.pc(to)), direction);
    return tonal_1.Distance.transpose(from, interval);
}
exports.getNearestNote = getNearestNote;
/** Returns the note with the least distance to "from". TODO: add range */
function getNearestTargets(from, targets, preferredDirection) {
    if (preferredDirection === void 0) { preferredDirection = 'down'; }
    var intervals = targets
        .map(function (target) { return tonal_1.Distance.interval(tonal_1.Note.pc(from), target); })
        .map(mapMinInterval(preferredDirection))
        .sort(sortMinInterval(preferredDirection));
    /* if (flip) {
        intervals = intervals.reverse();
    } */
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
        console.log('tp up');
        return transposeToRange(notes, range, ++times);
    }
    if (notes.find(function (note) { return tonal_1.Distance.semitones(note, range[1]) < 0; })) {
        console.log('tp down');
        notes = notes.map(function (note) { return tonal_1.Distance.transpose(note, '-8P'); });
        return transposeToRange(notes, range, ++times);
    }
    return notes;
}
exports.transposeToRange = transposeToRange;
function getAverageMidi(notes, offset) {
    return notes.reduce(function (sum, note) { return sum + getMidi(note, offset); }, 0) / notes.length;
}
exports.getAverageMidi = getAverageMidi;
function getRangePosition(note, range) {
    note = getMidi(note);
    range = range.map(function (n) { return getMidi(n); });
    var semitones = [note - range[0], range[1] - range[0]];
    return semitones[0] / semitones[1];
}
exports.getRangePosition = getRangePosition;
function getRangeDirection(note, range, defaultDirection, border) {
    if (defaultDirection === void 0) { defaultDirection = 'down'; }
    if (border === void 0) { border = 0; }
    var position = getRangePosition(note, range);
    if (position <= border) {
        return { direction: 'up', force: true };
    }
    if (position >= (1 - border)) {
        return { direction: 'down', force: true };
    }
    return {
        direction: defaultDirection, force: false
    };
}
exports.getRangeDirection = getRangeDirection;
// accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval
function getStep(step) {
    if (typeof step === 'number' && step < 0) {
        step = 'b' + (step * -1);
    }
    return step + ''; // to string
}
exports.getStep = getStep;
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
function getStepsFromDegree(degree) {
    return;
}
exports.getStepsFromDegree = getStepsFromDegree;
function getStepInChord(note, chord, group) {
    return getStepFromInterval(tonal_1.Distance.interval(tonal_1.Chord.tokenize(getTonalChord(chord))[0], tonal_1.Note.pc(note)));
}
exports.getStepInChord = getStepInChord;
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
function findDegree(degreeOrStep, intervalsOrSteps) {
    var intervals = intervalsOrSteps.map(function (i) { return isInterval(i) ? i : getIntervalFromStep(i); });
    if (typeof degreeOrStep === 'number') { // is degree
        var degree_1 = Math.abs(degreeOrStep);
        return intervals.find(function (i) {
            i = minInterval(i, 'up');
            if (!steps[i]) {
                console.error('interval', i, 'is not valid', intervals);
            }
            return !!(steps[i].find(function (step) { return getDegreeFromStep(step) === degree_1; }));
        });
    }
    // is step
    var step = getStep(degreeOrStep);
    return intervals.find(function (i) { return i.includes(step) ||
        i === getIntervalFromStep(step); });
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
function getStepFromInterval(interval) {
    return steps[interval] ? steps[interval][0] : 0;
}
exports.getStepFromInterval = getStepFromInterval;
function getDegreeFromInterval(interval, simplify) {
    if (interval === void 0) { interval = '-1'; }
    if (simplify === void 0) { simplify = false; }
    var fixed = fixInterval(interval, simplify) || '';
    var match = fixed.match(/[-]?([1-9])+/);
    if (!match) {
        return 0;
    }
    return Math.abs(parseInt(match[0], 10));
}
exports.getDegreeFromInterval = getDegreeFromInterval;
function getDegreeFromStep(step) {
    step = getStep(step);
    return parseInt(step.match(/([1-9])+/)[0], 10);
}
exports.getDegreeFromStep = getDegreeFromStep;
function getDegreeInChord(degree, chord) {
    chord = getTonalChord(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    var tokens = tonal_1.Chord.tokenize(chord);
    return tonal_1.Distance.transpose(tokens[0], findDegree(degree, intervals));
}
exports.getDegreeInChord = getDegreeInChord;
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
function totalDiff(diff) {
    var total = diff.reduce(function (weight, diff) {
        weight.added += diff.added ? diff.count : 0;
        weight.removed += diff.added ? diff.count : 0;
        weight.kept += (!diff.added && !diff.removed) ? diff.count : 0;
        return weight;
    }, { added: 0, removed: 0, kept: 0, balance: 0 });
    total.balance = total.added - total.removed;
    total.changes = total.added + total.removed;
    return total;
}
exports.totalDiff = totalDiff;
/** Reorders the given notes to contain the given step as close as possible */
function sortByDegree(notes, degree) {
    degree = Math.max(degree, (degree + 8) % 8);
    /* const semitones = Interval.semitones(interval); */
    var diffDegrees = function (a, b) { return Math.abs(getDegreeFromInterval(tonal_1.Distance.interval(a, b)) - degree); };
    /* const diffTones = (a, b) => Math.abs(Distance.interval(a, b) - semitones); */
    notes = notes.slice(1).reduce(function (chain, note) {
        var closest = notes
            .filter(function (n) { return !chain.includes(n); })
            .sort(function (a, b) { return diffDegrees(chain[0], a) < diffDegrees(chain[0], b) ? -1 : 1; });
        chain.unshift(closest[0]);
        return chain;
    }, [notes[0]]).reverse();
    return notes;
}
exports.sortByDegree = sortByDegree;
/** Returns the given notes with octaves either moving bottom up or top down */
function renderAbsoluteNotes(notes, octave, direction) {
    if (octave === void 0) { octave = 3; }
    if (direction === void 0) { direction = 'up'; }
    return notes.reduce(function (absolute, current, index, notes) {
        if (index === 0) {
            return [current + octave];
        }
        var interval = tonal_1.Distance.interval(notes[index - 1], current);
        interval = minInterval(interval, direction);
        if (interval === '1P') {
            interval = direction === 'down' ? '-8P' : '8P';
        }
        absolute.push(tonal_1.Distance.transpose(absolute[index - 1], interval));
        return absolute;
    }, []);
}
exports.renderAbsoluteNotes = renderAbsoluteNotes;
function getIntervals(notes) {
    return notes.reduce(function (intervals, note, index, notes) {
        if (index === 0) {
            return [];
        }
        intervals.push(tonal_1.Distance.interval(notes[index - 1], note));
        return intervals;
    }, []);
}
exports.getIntervals = getIntervals;
function isInterval(interval) {
    return typeof tonal_1.Interval.semitones(interval) === 'number';
}
exports.isInterval = isInterval;
function smallestInterval(intervals) {
    return intervals.reduce(function (min, current) {
        if (!min || tonal_1.Distance.semitones(current) < tonal_1.Distance.semitones(min)) {
            return current;
        }
        return min;
    });
}
exports.smallestInterval = smallestInterval;
function sortNotes(notes, direction) {
    if (direction === void 0) { direction = 'up'; }
    return notes.sort(function (a, b) { return getMidi(a) - getMidi(b); });
}
exports.sortNotes = sortNotes;
function analyzeVoicing(notes, root) {
    if (!notes || notes.length < 2) {
        throw new Error('Can only analyze Voicing with at least two notes');
    }
    notes = sortNotes(notes);
    root = root || notes[0]; // TODO: get degrees
    var intervals = getIntervals(notes);
    var sortedIntervals = intervals.sort(sortMinInterval());
    return {
        notes: notes,
        minInterval: sortedIntervals[0],
        maxInterval: sortedIntervals[sortedIntervals.length - 1],
        intervals: intervals,
        spread: tonal_1.Distance.interval(notes[0], notes[notes.length - 1])
    };
}
exports.analyzeVoicing = analyzeVoicing;
function analyzeVoiceLeading(voicings, min) {
    if (min === void 0) { min = true; }
    var len = voicings.length;
    if (len < 2) {
        throw new Error('cannot analyze voice leading with only one chord..');
    }
    var data = voicings.reduce(function (data, voicing, index) {
        if (!index) {
            return data;
        }
        return {
            movement: data.movement + voicingMovement(voicings[index - 1], voicing, min),
            difference: data.difference + voicingDifference(voicings[index - 1], voicing, min),
            voiceDifference: data.voiceDifference + voicingDifference(voicings[index - 1], voicing, min) / voicings[index - 1].length,
        };
    }, { movement: 0, difference: 0, voiceDifference: 0 });
    return __assign({}, data, { latestMovement: voicingMovement(voicings[len - 2], voicings[len - 1], false), latestDifference: voicingDifference(voicings[len - 2], voicings[len - 1], false), averageMovement: data.movement / voicings.length, averageDifference: data.difference / voicings.length, averageVoiceDifference: data.voiceDifference / voicings.length });
}
exports.analyzeVoiceLeading = analyzeVoiceLeading;
// returns array of intervals that lead the voices of chord A to chordB
function minIntervals(chordA, chordB) {
    return chordA.map(function (n, i) { return minInterval(tonal_1.Distance.interval(n, chordB[i])); });
}
exports.minIntervals = minIntervals;
function semitoneDifference(intervals) {
    return intervals.reduce(function (semitones, interval) {
        return semitones + Math.abs(tonal_1.Interval.semitones(interval));
    }, 0);
}
exports.semitoneDifference = semitoneDifference;
function semitoneMovement(intervals) {
    return intervals.reduce(function (semitones, interval) {
        return semitones + tonal_1.Interval.semitones(interval);
    }, 0);
}
exports.semitoneMovement = semitoneMovement;
function longestChild(array) {
    return array.reduce(function (max, current) { return (current.length > max.length ? current : max); }, array[0]);
}
exports.longestChild = longestChild;
function isPitchClass(note) {
    return tonal_1.Note.pc(note) === note;
}
exports.isPitchClass = isPitchClass;
function voicingIntervals(chordA, chordB, min, direction) {
    if (min === void 0) { min = true; }
    if (chordA.length !== chordB.length) {
        // console.log('voicingIntervals: not the same length..');
    }
    var intervals = chordA.map(function (n, i) {
        var interval = tonal_1.Distance.interval(n, chordB[i]);
        if (min === false) {
            return interval;
        }
        if (isPitchClass(n) && isPitchClass(chordB[i])) {
            return minInterval(interval, direction);
        }
        return interval;
    });
    return intervals;
}
exports.voicingIntervals = voicingIntervals;
function voicingDifference(chordA, chordB, min) {
    if (min === void 0) { min = true; }
    return semitoneDifference(voicingIntervals(chordA, chordB, min));
}
exports.voicingDifference = voicingDifference;
function voiceLeading(chordA, chordB) {
    var _a;
    var origin = [].concat(chordA);
    var targets = [].concat(chordB);
    var flare = chordA.length < chordB.length;
    _a = [chordA, chordB].sort(function (a, b) { return b.length - a.length; }), chordA = _a[0], chordB = _a[1];
    return Permutation_1.Permutation.binomial(chordA, chordB.length)
        .map(function (permutation) {
        var _a = flare ? [chordB, permutation] : [permutation, chordB], from = _a[0], to = _a[1];
        var intervals = voicingIntervals(from, to, false)
            .map(function (interval) { return fixInterval(interval, false); });
        var degrees = intervals.map(function (i) { return getDegreeFromInterval(i); });
        var oblique = origin.filter(function (n, i) { return targets.find(function (note) { return isSameNote(n, note); }); });
        var dropped = [], added = [];
        var difference = semitoneDifference(intervals);
        if (!flare) {
            dropped = origin.filter(function (n) { return !permutation.includes(n); });
        }
        else {
            added = targets.filter(function (n) { return !permutation.includes(n); });
        }
        var movement = semitoneMovement(intervals);
        var similar = Math.abs(movement) === Math.abs(difference);
        var parallel = difference > 0 && similar && degrees.reduce(function (match, degree, index) {
            return match && (index === 0 || degrees[index - 1] === degree);
        }, true);
        return {
            origin: origin,
            targets: targets,
            permutation: permutation,
            intervals: intervals,
            difference: difference,
            movement: movement,
            bottomInterval: intervals[0],
            topInterval: intervals[intervals.length - 1],
            similar: similar,
            contrary: !similar,
            parallel: parallel,
            oblique: oblique,
            dropped: dropped,
            added: added,
            degrees: degrees
        };
    });
}
exports.voiceLeading = voiceLeading;
function bestVoiceLeading(chordA, chordB, sortFn) {
    sortFn = sortFn || (function (a, b) { return a.difference - b.difference; });
    var voices = voiceLeading(chordA, chordB)
        .map(function (voicing) { return (__assign({}, voicing, { origin: chordA, notes: chordB })); })
        .sort(function (best, current) {
        return sortFn(best, current);
    }, null);
    return voices[0];
}
exports.bestVoiceLeading = bestVoiceLeading;
function minVoiceMovement(chordA, chordB) {
    var _a;
    _a = [chordA, chordB].sort(function (a, b) { return b.length - a.length; }), chordA = _a[0], chordB = _a[1];
    var picks = Permutation_1.Permutation.binomial(chordA, chordB.length);
    return picks.reduce(function (min, current) {
        var diff = voicingMovement(current, chordB, false);
        if (Math.abs(diff) < Math.abs(min)) {
            return diff;
        }
        return min;
    }, 100);
}
exports.minVoiceMovement = minVoiceMovement;
function voicingMovement(chordA, chordB, min, direction) {
    if (min === void 0) { min = true; }
    return semitoneMovement(voicingIntervals(chordA, chordB, min, direction));
}
exports.voicingMovement = voicingMovement;
function getVoiceLeadingCombinations(chordA, chordB) {
    var chords = [chordA, chordB].sort(function (c) { return c.length; });
    var diff = chords[1] - chords[0];
    if (diff === 0) {
        return;
    }
    // 4,4 > 1: 2 1111 (15)
    // 3,4 > 0111 (7), 1011 (11), 1101 (13), 1110 (14)
    // 2,4 > 1100 (12), 1010 (10), 1001 (9), 0110 (6), 0101 (5), 0011 (3)
    // 1,4 > 1000 (8), 0100 (4), 0010 (2), 0001 (1)
    // 3,3 > 111
    // 2,3 > 110, 101, 011
    // 1,3 > 100, 010, 001
}
exports.getVoiceLeadingCombinations = getVoiceLeadingCombinations;
function mapTree(tree, modifier, simplify, path, siblings, position) {
    if (simplify === void 0) { simplify = false; }
    if (path === void 0) { path = []; }
    if (siblings === void 0) { siblings = []; }
    if (position === void 0) { position = 0; }
    // skip current tree if only one child
    if (simplify && Array.isArray(tree) && tree.length === 1) {
        return mapTree(tree[0], modifier, simplify, path, siblings, position);
    }
    var fraction = siblings.reduce(function (f, d) { return f / d; }, 1);
    if (!Array.isArray(tree)) {
        return modifier ? modifier(tree, { path: path, siblings: siblings, fraction: fraction, position: position }) : tree;
    }
    if (Array.isArray(tree)) {
        siblings = siblings.concat([tree.length]);
        fraction = fraction / tree.length;
        return tree.map(function (subtree, index) {
            return mapTree(subtree, modifier, simplify, path.concat([index]), siblings, position + index * fraction);
        });
    }
}
exports.mapTree = mapTree;
function flattenTree(tree) {
    var flat = [];
    mapTree(tree, function (value, props) { return flat.push(Object.assign(props, { value: value })); });
    return flat;
}
exports.flattenTree = flattenTree;
function expandTree(tree) {
    // TODO
}
exports.expandTree = expandTree;
/* Returns true if the given intervals are all present in the chords interval structure
Intervals can be appendend with "?" to indicate that those degrees could also be omitted
(but when present they should match)
*/
function chordHasIntervals(chord, intervals) {
    chord = getTonalChord(chord);
    var has = tonal_1.Chord.intervals(chord);
    return intervals.reduce(function (match, current) {
        var isOptional = current.includes('?');
        var isForbidden = current.includes('!');
        if (isOptional) {
            current = current.replace('?', '');
            return (!hasDegree(getDegreeFromInterval(current), has) ||
                has.includes(current)) && match;
        }
        if (isForbidden) {
            current = current.replace('!', '');
            return !hasDegree(getDegreeFromInterval(current), has);
        }
        return has.includes(current) && match;
    }, true);
}
exports.chordHasIntervals = chordHasIntervals;
function isDominantChord(chord) {
    return chordHasIntervals(chord, ['3M', '7m']) || chordHasIntervals(chord, ['!3', '4P', '7m']);
}
exports.isDominantChord = isDominantChord;
function isMajorChord(chord) {
    return chordHasIntervals(chord, ['3M', '7M?']);
}
exports.isMajorChord = isMajorChord;
function isMinorChord(chord) {
    return chordHasIntervals(chord, ['3m']);
}
exports.isMinorChord = isMinorChord;
function isMinorTonic(chord) {
    return chordHasIntervals(chord, ['3m', '5P', '13M?', '7M?']);
}
exports.isMinorTonic = isMinorTonic;
function getChordType(chord) {
    if (isDominantChord(chord)) {
        return 'dominant';
    }
    if (isMajorChord(chord)) {
        return 'major';
    }
    if (isMinorTonic(chord)) {
        return 'minor-tonic';
    }
    if (isMinorChord(chord)) {
        return 'minor';
    }
}
exports.getChordType = getChordType;
function permutateArray(array) {
    if (array.length === 1) {
        return array;
    }
    return array.reduce(function (combinations, el) { return combinations.concat(permutateArray(array.filter(function (e) { return e !== el; }))
        .map(function (subcombinations) { return ([el].concat(subcombinations)); })); }, []);
}
exports.permutateArray = permutateArray;
function permutateElements(array, validate, path) {
    if (path === void 0) { path = []; }
    var isValid = function (next) { return !validate || validate(path, next, array); };
    if (array.length === 1) {
        return isValid(array[0]) ? array : [];
    }
    return array.filter(isValid).reduce(function (combinations, el) { return combinations.concat(permutateElements(array.filter(function (e) { return e !== el; }), validate, path.concat([el])).map(function (subcombinations) { return [
        el
    ].concat(subcombinations); })); }, []);
}
exports.permutateElements = permutateElements;
function permutationComplexity(array, validate, path) {
    if (path === void 0) { path = []; }
    var validations = 0;
    permutateElements(array, function (path, next, array) {
        ++validations;
        return !validate || validate(path, next, array);
    }, path);
    return validations;
}
exports.permutationComplexity = permutationComplexity;
function validateInterval(validate) {
    return function (path, next, array) {
        if (!path.length) {
            return true;
        }
        var interval = tonal_1.Distance.interval(path[path.length - 1], next);
        return validate(interval, { path: path, next: next, array: array });
    };
}
exports.validateInterval = validateInterval;
// combine multiple validators
function combineValidators() {
    var validators = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        validators[_i] = arguments[_i];
    }
    return function (path, next, array) { return validators
        .reduce(function (result, validator) { return result && validator(path, next, array); }, true); };
}
exports.combineValidators = combineValidators;
function notesAtPositionValidator(notes, position) {
    if (notes === void 0) { notes = []; }
    return function (selected, note, remaining) {
        return !notes.length || selected.length !== position || notes.includes(note);
    };
}
exports.notesAtPositionValidator = notesAtPositionValidator;
function voicingValidator(options) {
    options = __assign({ maxDistance: 6, minBottomDistance: 3, minTopDistance: 3 }, options);
    return function (path, next, array) {
        return combineValidators(notesAtPositionValidator(options.topNotes, path.length + array.length - 1), notesAtPositionValidator(options.bottomNotes, 0), validateInterval(function (interval) { return tonal_1.Interval.semitones(interval) <= options.maxDistance; }), validateInterval(function (interval, _a) {
            var array = _a.array;
            return array.length !== 1 || tonal_1.Interval.semitones(interval) >= options.minTopDistance;
        }), validateInterval(function (interval, _a) {
            var path = _a.path;
            return path.length !== 1 || tonal_1.Interval.semitones(interval) >= options.minBottomDistance;
        }))(path, next, array);
    };
}
exports.voicingValidator = voicingValidator;
function getVoicingCombinations(notes, options, validator) {
    if (options === void 0) { options = {}; }
    if (validator === void 0) { validator = function (path, next, array) { return true; }; }
    return permutateElements(notes, combineValidators(validator, voicingValidator(options)));
}
exports.getVoicingCombinations = getVoicingCombinations;
// finds best combination following the given notes, based on minimal movement
function bestCombination(notes, combinations) {
    if (combinations === void 0) { combinations = []; }
    return combinations.reduce(function (best, current) {
        var currentMovement = voicingDifference(notes, current);
        var bestMovement = voicingDifference(notes, best);
        if (Math.abs(currentMovement) < Math.abs(bestMovement)) {
            return current;
        }
        return best;
    });
}
exports.bestCombination = bestCombination;
function sortCombinationsByMovement(notes, combinations, direction, min) {
    if (direction === void 0) { direction = 'up'; }
    if (min === void 0) { min = true; }
    var movements = combinations.map(function (combination) { return ({
        movement: voicingMovement(notes, combination, min),
        combination: combination
    }); });
    var right = movements.filter(function (move) { return direction === 'up' ? move >= 0 : move <= 0; });
    if (!right.length) {
        right = movements;
    }
    var sorted = right.sort(function (a, b) { return a.movement - b.movement; });
    if (direction === 'down') {
        sorted = sorted.reverse();
    }
    return sorted.map(function (movement) { return movement.combination; });
}
exports.sortCombinationsByMovement = sortCombinationsByMovement;
function getChordNotes(chord, validate) {
    chord = getTonalChord(chord);
    var tokens = tonal_1.Chord.tokenize(chord);
    var notes = tonal_1.Chord.notes(chord);
    return notes.filter(function (note) {
        var interval = tonal_1.Distance.interval(tokens[0], note);
        return !validate || validate(note, {
            root: tokens[0],
            symbol: tokens[1],
            interval: interval,
            step: getStepFromInterval(interval),
            degree: getDegreeFromInterval(interval)
        });
    });
}
exports.getChordNotes = getChordNotes;
function validateWithoutRoot(note, _a) {
    var degree = _a.degree;
    return degree !== 1;
}
exports.validateWithoutRoot = validateWithoutRoot;
// OLD...
function getVoicing(chord, _a) {
    var _b = _a === void 0 ? {} : _a, voices = _b.voices, previousVoicing = _b.previousVoicing, omitRoot = _b.omitRoot, quartal = _b.quartal;
    chord = getTonalChord(chord);
    var tokens = tonal_1.Chord.tokenize(chord);
    var notes = tonal_1.Chord.notes(chord);
    if (omitRoot) {
        notes = notes.filter(function (n) { return n !== tokens[0]; });
    }
    if (quartal) {
    }
    if (previousVoicing) {
    }
    return notes;
}
exports.getVoicing = getVoicing;
function semitoneDistance(noteA, noteB) {
    return tonal_1.Interval.semitones(tonal_1.Distance.interval(noteA, noteB));
}
exports.semitoneDistance = semitoneDistance;
function getAllTensions(root) {
    return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
        .map(function (step) { return getIntervalFromStep(step); })
        .map(function (interval) { return tonal_1.Distance.transpose(root, interval); });
}
exports.getAllTensions = getAllTensions;
function getAvailableTensions(chord) {
    chord = getTonalChord(chord);
    var notes = tonal_1.Chord.notes(chord);
    if (isDominantChord(chord)) {
        return getAllTensions(notes[0])
            // filter out tensions that are part of the chord
            .filter(function (note) { return !notes.find(function (n) { return semitoneDistance(notes[0], note) === semitoneDistance(notes[0], n); }); })
            // filter out tensions that are a semitone above the 3 (if exists)
            .filter(function (note) { return chordHasIntervals(chord, ['3!']) || semitoneDistance(getDegreeInChord(3, chord), note) > 1; })
            // filter out tensions that are a semitone above the 4 (if exists => sus)
            .filter(function (note) { return !chordHasIntervals(chord, ['4P']) || semitoneDistance(getDegreeInChord(4, chord), note) > 1; })
            // filter out tensions that are a semitone above the 7
            .filter(function (note) { return semitoneDistance(getDegreeInChord(7, chord), note) > 1; });
    }
    return notes.slice(0, 4)
        // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
        .filter(function (note) { return note === notes[0] || semitoneDistance(note, notes[0]) > 2; })
        // all tensions are a major second above a chord note
        .map(function (note) { return tonal_1.Distance.transpose(note, '2M'); })
        // tensions 2 semiontes below root are flat 7 => changes chord quality
        .filter(function (note) { return semitoneDistance(note, notes[0]) !== 2; });
    // omit tensions that end up on a chord note again?
}
exports.getAvailableTensions = getAvailableTensions;
// Returns all notes required for a shell chord
function getRequiredNotes(chord) {
    chord = getTonalChord(chord);
    var notes = tonal_1.Chord.notes(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    var required = [3, 4, 'b5', 7].reduce(function (required, degree) {
        if (hasDegree(degree, intervals)) {
            required.push(getDegreeInChord(degree, chord));
        }
        return required;
    }, []);
    // is a flat 5 required?
    if (notes.length > 3 && !required.includes(notes[notes.length - 1])) {
        required.push(notes[notes.length - 1]); // could check if is 5 than dont push
    }
    return required;
}
exports.getRequiredNotes = getRequiredNotes;
function getOptionalNotes(chord, required) {
    chord = getTonalChord(chord);
    var notes = tonal_1.Chord.notes(chord);
    required = required || getRequiredNotes(chord);
    return notes.filter(function (note) { return !required.includes(note); });
}
exports.getOptionalNotes = getOptionalNotes;
function getPossibleVoicings(chord, voices) {
    if (voices === void 0) { voices = 4; }
    var required = getRequiredNotes(chord);
    var optional = getOptionalNotes(chord);
    var tensions = getAvailableTensions(chord);
    return { required: required, optional: optional, tensions: tensions };
}
exports.getPossibleVoicings = getPossibleVoicings;
function getVoices(chord, voices, rootless, tension) {
    if (voices === void 0) { voices = 4; }
    if (rootless === void 0) { rootless = false; }
    if (tension === void 0) { tension = 1; }
    // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
    chord = getTonalChord(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    var tokens = tonal_1.Chord.tokenize(chord);
    var required = getRequiredNotes(chord);
    var optional = getOptionalNotes(chord, required);
    var choices = [].concat(required);
    var remaining = function () { return voices - choices.length; };
    if (tension > 0) {
        choices = choices.concat(getAvailableTensions(chord).slice(0, tension));
        /* console.log(chord, 'tension', tensions); */
    }
    if (remaining() > 0) {
        choices = choices.concat(optional);
    }
    if (remaining() < 0 && rootless) {
        choices = choices.filter(function (n) { return n !== tokens[0]; });
    }
    if (remaining() > 0) {
        // console.warn(`${remaining} notes must be doubled!!!`);
        choices = choices.concat(required, optional).slice(0, voices);
    }
    return choices.slice(0, voices);
}
exports.getVoices = getVoices;
function noteArray(range) {
    var slots = tonal_1.Interval.semitones(tonal_1.Distance.interval(range[0], range[1]));
    return new Array(slots + 1)
        .fill('')
        .map(function (v, i) { return tonal_1.Distance.transpose(range[0], tonal_1.Interval.fromSemitones(i)); })
        .map(function (n) { return tonal_1.Note.simplify(n); });
}
exports.noteArray = noteArray;
function getAllChoices(combinations, lastVoicing) {
    var lastPitches = lastVoicing.map(function (note) { return tonal_1.Note.pc(note); });
    return combinations.map(function (combination) { return ({
        combination: combination,
        bottomInterval: tonal_1.Distance.interval(lastPitches[0], combination[0]),
    }); }).map(function (_a) {
        var combination = _a.combination, bottomInterval = _a.bottomInterval;
        return {
            combination: combination,
            bottomNotes: [
                tonal_1.Distance.transpose(lastVoicing[0], minInterval(bottomInterval, 'down')),
                tonal_1.Distance.transpose(lastVoicing[0], minInterval(bottomInterval, 'up')),
            ]
        };
    }).reduce(function (all, _a) {
        var combination = _a.combination, bottomNotes = _a.bottomNotes;
        return all.concat([
            renderAbsoluteNotes(combination, tonal_1.Note.oct(bottomNotes[0])),
            renderAbsoluteNotes(combination, tonal_1.Note.oct(bottomNotes[1])),
        ]);
    }, []).map(function (notes) {
        return bestVoiceLeading(lastVoicing, notes, function (a, b) {
            /* return Math.abs(Interval.semitones(a.topInterval)) - Math.abs(Interval.semitones(b.topInterval)) */
            return Math.abs(a.movement) - Math.abs(b.movement);
            /* return a.difference - b.difference; */
        });
    });
}
exports.getAllChoices = getAllChoices;
function factorial(n) {
    var value = 1;
    for (var i = 2; i <= n; ++i) {
        value *= i;
    }
    return value;
}
exports.factorial = factorial;
function getNextVoicing(chord, lastVoicing, range, maxVoices) {
    if (range === void 0) { range = ['C3', 'C5']; }
    if (maxVoices === void 0) { maxVoices = 4; }
    // make sure tonal can read the chord
    chord = getTonalChord(chord);
    if (chord === 'r') {
        return null;
    }
    // get chord notes
    // const notes = getVoices(chord, 5, false, 0);
    var notes = getVoices(chord, maxVoices, false, 0);
    // find valid combinations
    var combinations = permutateElements(notes, voicingValidator({
        maxDistance: 7
    }));
    if (!combinations.length) {
        console.log('no combinations found chord', chord, notes, lastVoicing);
        return [];
    }
    if (!lastVoicing || !lastVoicing.length) { // no previous chord
        // get lowest possible bottom note
        var firstPick = randomElement(combinations);
        var firstNoteInRange = getNearestNote(range[0], firstPick[0], 'up');
        var pick_1 = renderAbsoluteNotes(firstPick, tonal_1.Note.oct(firstNoteInRange));
        Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick_1 });
        return pick_1;
    }
    var choices = getAllChoices(combinations, lastVoicing)
        .sort(function (a, b) {
        /* return Math.abs(a.movement) - Math.abs(b.movement) */
        return Math.abs(a.difference) - Math.abs(b.difference);
    });
    var rangeDirection = getRangeDirection(lastVoicing[0], range, 'down', 0.1);
    if (!rangeDirection.force) {
        rangeDirection = getRangeDirection(lastVoicing[lastVoicing.length - 1], range, 'down', 0.1);
    }
    var bestPick = choices[0].notes, choice;
    var direction = rangeDirection.direction, force = rangeDirection.force;
    if (!force) {
        var pick_2 = bestPick;
        choice = choices[0];
        Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick_2, direction: direction, bestPick: bestPick, force: force, choice: choice, choices: choices });
        return pick_2;
    }
    // sort after movement
    choices = choices.sort(function (a, b) {
        return Math.abs(a.movement) - Math.abs(b.movement);
    });
    choice = choices.find(function (choice) {
        if (direction === 'up') {
            return choice.movement > 0;
        }
        return choice.movement < 0;
    });
    if (!choice) {
        choice = choices[0];
    }
    var pick = choice.notes;
    Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick, direction: direction, bestPick: bestPick, force: force, choice: choice, choices: choices });
    return pick;
}
exports.getNextVoicing = getNextVoicing;
