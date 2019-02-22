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
function noteArray(range) {
    var slots = tonal_1.Interval.semitones(tonal_1.Distance.interval(range[0], range[1]));
    return new Array(slots + 1)
        .fill('')
        .map(function (v, i) { return tonal_1.Distance.transpose(range[0], tonal_1.Interval.fromSemitones(i)); })
        .map(function (n) { return tonal_1.Note.simplify(n); });
}
exports.noteArray = noteArray;
function factorial(n) {
    var value = 1;
    for (var i = 2; i <= n; ++i) {
        value *= i;
    }
    return value;
}
exports.factorial = factorial;
