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
var Permutation_1 = require("../util/Permutation");
var Logger_1 = require("../util/Logger");
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var tonal_3 = require("tonal");
var tonal_4 = require("tonal");
var util_1 = require("../util/util");
var Harmony_1 = require("./Harmony");
var Voicing = /** @class */ (function () {
    function Voicing() {
    }
    Voicing.getNextVoicing = function (chord, lastVoicing, range, maxVoices, rootless) {
        if (range === void 0) { range = ['C3', 'C5']; }
        if (maxVoices === void 0) { maxVoices = 4; }
        if (rootless === void 0) { rootless = false; }
        // make sure tonal can read the chord
        chord = Harmony_1.Harmony.getTonalChord(chord);
        if (chord === 'r') {
            return null;
        }
        // get chord notes
        // const notes = getVoices(chord, 5, false, 0);
        /* const notes = Voicing.getVoices(chord, maxVoices, false, 0); */
        var notes = Voicing.getVoices(chord, maxVoices, rootless, 0);
        // find valid combinations
        var combinations = Voicing.getVoicingCombinations(notes, {
            maxDistance: 7
        });
        /*
        let combinations = Permutation.permutateElements(notes,
            Voicing.voicingValidator({
                maxDistance: 7
            })); */
        if (!combinations.length) {
            console.log('no combinations found chord', chord, notes, lastVoicing);
            var pick_1 = [];
            Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick_1 });
            return pick_1;
        }
        if (!lastVoicing || !lastVoicing.length) { // no previous chord
            // get lowest possible bottom note
            // const firstPick = randomElement(combinations);
            var firstPick = combinations[0];
            var firstNoteInRange = Harmony_1.Harmony.getNearestNote(range[0], firstPick[0], 'up');
            var pick_2 = util_1.renderAbsoluteNotes(firstPick, tonal_2.Note.oct(firstNoteInRange));
            Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick_2 });
            return pick_2;
        }
        var choices = Voicing.getAllChoices(combinations, lastVoicing)
            .sort(function (a, b) {
            /* return Math.abs(a.movement) - Math.abs(b.movement) */
            return Math.abs(a.difference) - Math.abs(b.difference);
        });
        var rangeDirection = util_1.getRangeDirection(lastVoicing[0], range, 'down', 0.1);
        if (!rangeDirection.force) {
            rangeDirection = util_1.getRangeDirection(lastVoicing[lastVoicing.length - 1], range, 'down', 0.1);
        }
        var bestPick = choices[0].notes, choice;
        var direction = rangeDirection.direction, force = rangeDirection.force;
        if (!force) {
            var pick_3 = bestPick;
            choice = choices[0];
            Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick_3, direction: direction, bestPick: bestPick, force: force, choice: choice, choices: choices });
            return pick_3;
        }
        // sort after movement
        choices = choices.sort(function (a, b) {
            return Math.abs(a.movement) - Math.abs(b.movement);
        });
        choice = choices.find(function (choice) {
            if (direction === 'up') {
                return choice.movement >= 0;
            }
            return choice.movement <= 0;
        });
        if (!choice) {
            choice = choices[0];
        }
        var pick = choice.notes;
        Logger_1.Logger.logVoicing({ chord: chord, lastVoicing: lastVoicing, range: range, notes: notes, combinations: combinations, pick: pick, direction: direction, bestPick: bestPick, force: force, choice: choice, choices: choices });
        return pick;
    };
    Voicing.getVoices = function (chord, voices, rootless, tension) {
        if (voices === void 0) { voices = 4; }
        if (rootless === void 0) { rootless = false; }
        if (tension === void 0) { tension = 1; }
        // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var intervals = tonal_1.Chord.intervals(chord);
        var tokens = tonal_1.Chord.tokenize(chord);
        var required = Voicing.getRequiredNotes(chord);
        var optional = Voicing.getOptionalNotes(chord, required);
        var choices = [].concat(required);
        var remaining = function () { return voices - choices.length; };
        if (tension > 0) {
            choices = choices.concat(Voicing.getAvailableTensions(chord).slice(0, tension));
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
    };
    Voicing.getAvailableTensions = function (chord) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        if (util_1.isDominantChord(chord)) {
            return Voicing.getAllTensions(notes[0])
                // filter out tensions that are part of the chord
                .filter(function (note) { return !notes.find(function (n) { return util_1.semitoneDistance(notes[0], note) === util_1.semitoneDistance(notes[0], n); }); })
                // filter out tensions that are a semitone above the 3 (if exists)
                .filter(function (note) { return util_1.chordHasIntervals(chord, ['3!']) || util_1.semitoneDistance(util_1.getDegreeInChord(3, chord), note) > 1; })
                // filter out tensions that are a semitone above the 4 (if exists => sus)
                .filter(function (note) { return !util_1.chordHasIntervals(chord, ['4P']) || util_1.semitoneDistance(util_1.getDegreeInChord(4, chord), note) > 1; })
                // filter out tensions that are a semitone above the 7
                .filter(function (note) { return util_1.semitoneDistance(util_1.getDegreeInChord(7, chord), note) > 1; });
        }
        return notes.slice(0, 4)
            // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
            .filter(function (note) { return note === notes[0] || util_1.semitoneDistance(note, notes[0]) > 2; })
            // all tensions are a major second above a chord note
            .map(function (note) { return tonal_3.Distance.transpose(note, '2M'); })
            // tensions 2 semiontes below root are flat 7 => changes chord quality
            .filter(function (note) { return util_1.semitoneDistance(note, notes[0]) !== 2; });
        // omit tensions that end up on a chord note again?
    };
    Voicing.getAllTensions = function (root) {
        return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
            .map(function (step) { return util_1.getIntervalFromStep(step); })
            .map(function (interval) { return tonal_3.Distance.transpose(root, interval); });
    };
    // Returns all notes required for a shell chord
    Voicing.getRequiredNotes = function (chord) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        var intervals = tonal_1.Chord.intervals(chord);
        var required = [3, 7, 4, 'b5', 6].reduce(function (required, degree) {
            if (util_1.hasDegree(degree, intervals)) {
                required.push(util_1.getDegreeInChord(degree, chord));
            }
            return required;
        }, []);
        // is a flat 5 required?
        if (notes.length > 3 && !required.includes(notes[notes.length - 1])) {
            required.push(notes[notes.length - 1]); // could check if is 5 than dont push
        }
        return required;
    };
    Voicing.getOptionalNotes = function (chord, required) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        required = required || Voicing.getRequiredNotes(chord);
        return notes.filter(function (note) { return !required.includes(note); });
    };
    /* static getPossibleVoicings(chord, voices = 4) {
        const required = getRequiredNotes(chord);
        const optional = getOptionalNotes(chord);
        const tensions = getAvailableTensions(chord);
        return { required, optional, tensions };
    } */
    Voicing.getAllChoices = function (combinations, lastVoicing) {
        var lastPitches = lastVoicing.map(function (note) { return tonal_2.Note.pc(note); });
        return combinations.map(function (combination) { return ({
            combination: combination,
            bottomInterval: tonal_3.Distance.interval(lastPitches[0], combination[0]),
        }); }).map(function (_a) {
            var combination = _a.combination, bottomInterval = _a.bottomInterval;
            return {
                combination: combination,
                bottomNotes: [
                    tonal_3.Distance.transpose(lastVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'down')),
                    tonal_3.Distance.transpose(lastVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'up')),
                ]
            };
        }).reduce(function (all, _a) {
            var combination = _a.combination, bottomNotes = _a.bottomNotes;
            return all.concat([
                util_1.renderAbsoluteNotes(combination, tonal_2.Note.oct(bottomNotes[0])),
                util_1.renderAbsoluteNotes(combination, tonal_2.Note.oct(bottomNotes[1])),
            ]);
        }, []).map(function (notes) {
            return Voicing.bestVoiceLeading(lastVoicing, notes, function (a, b) {
                /* return Math.abs(Interval.semitones(a.topInterval)) - Math.abs(Interval.semitones(b.topInterval)) */
                return Math.abs(a.movement) - Math.abs(b.movement);
                /* return a.difference - b.difference; */
            });
        });
    };
    Voicing.validateInterval = function (validate) {
        return function (path, next, array) {
            if (!path.length) {
                return true;
            }
            var interval = tonal_3.Distance.interval(path[path.length - 1], next);
            return validate(interval, { path: path, next: next, array: array });
        };
    };
    Voicing.notesAtPositionValidator = function (notes, position) {
        if (notes === void 0) { notes = []; }
        return function (selected, note, remaining) {
            return !notes.length || selected.length !== position || notes.includes(note);
        };
    };
    Voicing.voicingValidator = function (options) {
        options = __assign({ maxDistance: 6, minBottomDistance: 3, minTopDistance: 2 }, options);
        return function (path, next, array) {
            return Permutation_1.Permutation.combineValidators(Voicing.notesAtPositionValidator(options.topNotes, path.length + array.length - 1), Voicing.notesAtPositionValidator(options.bottomNotes, 0), Voicing.validateInterval(function (interval) { return tonal_4.Interval.semitones(interval) <= options.maxDistance; }), Voicing.validateInterval(function (interval, _a) {
                var array = _a.array;
                return array.length !== 1 || tonal_4.Interval.semitones(interval) >= options.minTopDistance;
            }), Voicing.validateInterval(function (interval, _a) {
                var path = _a.path;
                return path.length !== 1 || tonal_4.Interval.semitones(interval) >= options.minBottomDistance;
            }))(path, next, array);
        };
    };
    Voicing.getVoicingCombinations = function (notes, options, validator) {
        if (options === void 0) { options = {}; }
        if (validator === void 0) { validator = function (path, next, array) { return true; }; }
        return Permutation_1.Permutation.permutateElements(notes, Permutation_1.Permutation.combineValidators(validator, Voicing.voicingValidator(options)));
    };
    Voicing.voiceLeading = function (chordA, chordB) {
        var _a;
        var origin = [].concat(chordA);
        var targets = [].concat(chordB);
        var flare = chordA.length < chordB.length;
        _a = [chordA, chordB].sort(function (a, b) { return b.length - a.length; }), chordA = _a[0], chordB = _a[1];
        return Permutation_1.Permutation.binomial(chordA, chordB.length)
            .map(function (permutation) {
            var _a = flare ? [chordB, permutation] : [permutation, chordB], from = _a[0], to = _a[1];
            var intervals = Voicing.voicingIntervals(from, to, false)
                .map(function (interval) { return Harmony_1.Harmony.fixInterval(interval, false); });
            var degrees = intervals.map(function (i) { return util_1.getDegreeFromInterval(i); });
            var oblique = origin.filter(function (n, i) { return targets.find(function (note) { return Harmony_1.Harmony.isSameNote(n, note); }); });
            var dropped = [], added = [];
            var difference = util_1.semitoneDifference(intervals);
            if (!flare) {
                dropped = origin.filter(function (n) { return !permutation.includes(n); });
            }
            else {
                added = targets.filter(function (n) { return !permutation.includes(n); });
            }
            var movement = util_1.semitoneMovement(intervals);
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
    };
    Voicing.bestVoiceLeading = function (chordA, chordB, sortFn) {
        sortFn = sortFn || (function (a, b) { return a.difference - b.difference; });
        var voices = Voicing.voiceLeading(chordA, chordB)
            .map(function (voicing) { return (__assign({}, voicing, { origin: chordA, notes: chordB })); })
            .sort(function (best, current) {
            return sortFn(best, current);
        }, null);
        return voices[0];
    };
    Voicing.voicingIntervals = function (chordA, chordB, min, direction) {
        if (min === void 0) { min = true; }
        if (chordA.length !== chordB.length) {
            // console.log('voicingIntervals: not the same length..');
        }
        var intervals = chordA.map(function (n, i) {
            var interval = tonal_3.Distance.interval(n, chordB[i]);
            if (min === false) {
                return interval;
            }
            if (util_1.isPitchClass(n) && util_1.isPitchClass(chordB[i])) {
                return Harmony_1.Harmony.minInterval(interval, direction);
            }
            return interval;
        });
        return intervals;
    };
    Voicing.voicingDifference = function (chordA, chordB, min) {
        if (min === void 0) { min = true; }
        return util_1.semitoneDifference(Voicing.voicingIntervals(chordA, chordB, min));
    };
    Voicing.minVoiceMovement = function (chordA, chordB) {
        var _a;
        _a = [chordA, chordB].sort(function (a, b) { return b.length - a.length; }), chordA = _a[0], chordB = _a[1];
        var picks = Permutation_1.Permutation.binomial(chordA, chordB.length);
        return picks.reduce(function (min, current) {
            var diff = Voicing.voicingMovement(current, chordB, false);
            if (Math.abs(diff) < Math.abs(min)) {
                return diff;
            }
            return min;
        }, 100);
    };
    Voicing.voicingMovement = function (chordA, chordB, min, direction) {
        if (min === void 0) { min = true; }
        return util_1.semitoneMovement(Voicing.voicingIntervals(chordA, chordB, min, direction));
    };
    return Voicing;
}());
exports.Voicing = Voicing;
