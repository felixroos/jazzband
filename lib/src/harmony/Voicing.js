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
    /** Returns the next voicing that should follow the previously played voicing.
    */
    Voicing.getNextVoicing = function (chord, previousVoicing, options) {
        if (options === void 0) { options = {}; }
        var _a = __assign({ range: ['C3', 'C5'], rangeBorders: [3, 3], maxVoices: 4, forceDirection: null, maxDistance: 7, minBottomDistance: 3, minTopDistance: 2, noTopDrop: true, noTopAdd: true, noBottomDrop: false, noBottomAdd: false, logging: true }, options), maxVoices = _a.maxVoices, range = _a.range, forceDirection = _a.forceDirection, rangeBorders = _a.rangeBorders, sortChoices = _a.sortChoices, filterChoices = _a.filterChoices, noTopDrop = _a.noTopDrop, noTopAdd = _a.noTopAdd, noBottomDrop = _a.noBottomDrop, noBottomAdd = _a.noBottomAdd, logging = _a.logging;
        // make sure tonal can read the chord
        chord = Harmony_1.Harmony.getTonalChord(chord);
        if (chord === 'r') {
            return null;
        }
        var combinations = Voicing.getAllVoicePermutations(chord, maxVoices, options);
        var exit = function () {
            var pick = [];
            if (logging) {
                Logger_1.Logger.logVoicing({ chord: chord, previousVoicing: previousVoicing, range: range, combinations: combinations, pick: pick });
            }
            return pick;
        };
        if (!combinations.length) {
            return exit();
        }
        if (!previousVoicing || !previousVoicing.length) { // no previous chord
            // filter out combinations that are out of range
            combinations = combinations.filter(function (combination) {
                var firstNote = Harmony_1.Harmony.getNearestNote(range[0], combination[0], 'up');
                var pick = util_1.renderAbsoluteNotes(combination, tonal_2.Note.oct(firstNote));
                return util_1.isInRange(pick[0], range) && util_1.isInRange(pick[pick.length - 1], range);
            });
            var firstPick = combinations[0];
            var firstNoteInRange = Harmony_1.Harmony.getNearestNote(range[0], firstPick[0], 'up');
            var pick_1 = util_1.renderAbsoluteNotes(firstPick, tonal_2.Note.oct(firstNoteInRange));
            if (logging) {
                Logger_1.Logger.logVoicing({ chord: chord, previousVoicing: previousVoicing, range: range, combinations: combinations, pick: pick_1 });
            }
            return pick_1;
        }
        var choices = Voicing.getAllChoices(combinations, previousVoicing, range)
            .filter(function (choice) {
            return (!noTopDrop || !choice.dropped.includes(choice.topNotes[0])) &&
                (!noTopAdd || !choice.added.includes(choice.topNotes[1])) &&
                (!noBottomDrop || !choice.dropped.includes(choice.topNotes[0])) &&
                (!noBottomAdd || !choice.added.includes(choice.topNotes[1])) &&
                (!filterChoices || filterChoices(choice));
        })
            .sort(sortChoices ?
            function (a, b) { return sortChoices(a, b); } :
            function (a, b) { return a.difference - b.difference; });
        if (!choices.length) {
            return exit();
        }
        var bestPick = choices[0].targets, choice;
        var direction = Voicing.getDesiredDirection(previousVoicing, range, rangeBorders) || forceDirection;
        if (!direction) {
            var pick_2 = bestPick;
            choice = choices[0];
            if (logging) {
                Logger_1.Logger.logVoicing({ chord: chord, previousVoicing: previousVoicing, range: range, combinations: combinations, pick: pick_2, direction: direction, bestPick: bestPick, choice: choice, choices: choices });
            }
            return pick_2;
        }
        // sort after movement instead of difference
        choice = choices.sort(function (a, b) {
            return Math.abs(a.movement) - Math.abs(b.movement);
        }).find(function (choice) {
            if (direction === 'up') {
                return choice.movement >= 0;
            }
            return choice.movement <= 0;
        });
        if (!choice) { // keep hanging in the corner of the range..
            choice = choices[0];
        }
        var pick = choice.targets;
        if (logging) {
            Logger_1.Logger.logVoicing({ chord: chord, previousVoicing: previousVoicing, range: range, combinations: combinations, pick: pick, direction: direction, bestPick: bestPick, choice: choice, choices: choices });
        }
        return pick;
    };
    /** Computes all valid voice permutations for a given chord and voice number.
     * Runs getVoicePermutations for each possible selection of notes.
     */
    Voicing.getAllVoicePermutations = function (chord, length, voicingOptions) {
        return Voicing.getAllNoteSelections(chord, length)
            .reduce(function (combinations, combination) {
            return combinations.concat(Voicing.getVoicePermutations(combination, voicingOptions));
        }, []);
    };
    /** Get all permutations of the given notes that would make a good voicing. */
    Voicing.getVoicePermutations = function (notes, options) {
        if (options === void 0) { options = {}; }
        if (notes.length === 1) {
            return [notes];
        }
        var validator = options.validatePermutation || (function (path, next, array) { return true; });
        return Permutation_1.Permutation.permutateElements(notes, Permutation_1.Permutation.combineValidators(validator, Voicing.voicingValidator(options)));
    };
    /** Configurable Validator that sorts out note combinations with untasty intervals.  */
    Voicing.voicingValidator = function (options) {
        options = __assign({ maxDistance: 6, minDistance: 1, minBottomDistance: 3, minTopDistance: 2 }, options);
        return function (path, next, array) {
            return Permutation_1.Permutation.combineValidators(Voicing.notesAtPositionValidator(options.topNotes, path.length + array.length - 1), Voicing.notesAtPositionValidator(options.bottomNotes, 0), Voicing.validateInterval(function (interval) { return tonal_4.Interval.semitones(interval) <= options.maxDistance; }), Voicing.validateInterval(function (interval) { return tonal_4.Interval.semitones(interval) >= options.minDistance; }), Voicing.validateInterval(function (interval, _a) {
                var array = _a.array;
                return array.length !== 1 || tonal_4.Interval.semitones(interval) >= options.minTopDistance;
            }), Voicing.validateInterval(function (interval, _a) {
                var path = _a.path;
                return path.length !== 1 || tonal_4.Interval.semitones(interval) >= options.minBottomDistance;
            }))(path, next, array);
        };
    };
    /** Validates the interval to the next note. You can write your own logic inside the validate fn. */
    Voicing.validateInterval = function (validate) {
        return function (path, next, array) {
            if (!path.length) {
                return true;
            }
            var interval = tonal_3.Distance.interval(path[path.length - 1], next) + '';
            return validate(interval, { path: path, next: next, array: array });
        };
    };
    /** Returns all possible combinations of required and optional notes for a given chord and desired length.
     * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */
    Voicing.getAllNoteSelections = function (chord, voices) {
        if (voices === void 0) { voices = 2; }
        var required = Voicing.getRequiredNotes(chord);
        if (voices === 1) {
            return required.map(function (note) { return [note]; });
        }
        var fill = voices - required.length;
        if (fill === 0) {
            return [required];
        }
        if (fill < 0) { // required notes are enough
            return Permutation_1.Permutation.binomial(required, voices);
        }
        var optional = Voicing.getOptionalNotes(chord, required);
        if (fill >= optional.length) {
            return [required.concat(optional)];
        }
        return Permutation_1.Permutation.binomial(optional, fill)
            .map(function (selection) { return required.concat(selection); });
    };
    /** Get available tensions for a given chord. Omits tensions that kill the chord quality */
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
    /** Returns all Tensions that could be in any chord */
    Voicing.getAllTensions = function (root) {
        return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
            .map(function (step) { return util_1.getIntervalFromStep(step); })
            .map(function (interval) { return tonal_3.Distance.transpose(root, interval); });
    };
    /** Returns all notes that are required to outline a chord */
    Voicing.getRequiredNotes = function (chord) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        var intervals = tonal_1.Chord.intervals(chord);
        var requiredSteps = [3, 7, 'b5', 6]; // order is important
        if (!util_1.hasDegree(3, intervals)) {
            requiredSteps.push(4); // fixes m6 chords
        }
        var required = requiredSteps.reduce(function (req, degree) {
            if (util_1.hasDegree(degree, intervals)) {
                req.push(util_1.getDegreeInChord(degree, chord));
            }
            return req;
        }, []);
        // WHY 3??
        if (notes.length > 3 && !required.includes(notes[notes.length - 1])) {
            required.push(notes[notes.length - 1]); // could check if is 5 than dont push
        }
        return required;
    };
    /** Returns all notes that are not required */
    Voicing.getOptionalNotes = function (chord, required) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        required = required || Voicing.getRequiredNotes(chord);
        return notes.filter(function (note) { return !required.includes(note); });
    };
    /** Returns all possible note choices for the given combinations.
     * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
     */
    Voicing.getAllChoices = function (combinations, previousVoicing, range) {
        var lastPitches = previousVoicing.map(function (note) { return tonal_2.Note.pc(note); });
        return combinations
            .map(function (combination) {
            var bottomInterval = tonal_3.Distance.interval(lastPitches[0], combination[0]);
            var bottomNotes = [
                tonal_3.Distance.transpose(previousVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'down')),
                tonal_3.Distance.transpose(previousVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'up')),
            ];
            if (bottomNotes[0] === bottomNotes[1]) {
                bottomNotes = [bottomNotes[0]];
            }
            return { combination: combination, bottomNotes: bottomNotes };
        })
            .reduce(function (all, _a) {
            var combination = _a.combination, bottomNotes = _a.bottomNotes;
            return all.concat(bottomNotes.map(function (bottomNote) { return util_1.renderAbsoluteNotes(combination, tonal_2.Note.oct(bottomNote)); }));
        }, [])
            .filter(function (targets) {
            return !range ||
                util_1.isInRange(targets[0], range) &&
                    util_1.isInRange(targets[targets.length - 1], range);
        })
            .reduce(function (all, targets) {
            var leads = Voicing.voiceLeading(previousVoicing, targets);
            return all.concat(leads);
        }, []);
    };
    /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */
    Voicing.voiceLeading = function (origin, targets) {
        // if same length > dont permutate
        if (origin.length === targets.length) {
            return Voicing.analyzeVoiceLeading(origin, targets);
        }
        var _a = [origin, targets].sort(function (a, b) { return b.length - a.length; }), more = _a[0], less = _a[1];
        return Permutation_1.Permutation.binomial(more, less.length)
            .map(function (selection) {
            var _a, _b;
            var from, to;
            if (origin.length < targets.length) {
                _a = [origin, selection], from = _a[0], to = _a[1];
            }
            else {
                _b = [selection, targets], from = _b[0], to = _b[1];
            }
            return Voicing.analyzeVoiceLeading(from, to, origin, targets);
        });
    };
    /** Analyzed the voice leading for the movement from > to.
     * Origin and targets needs to be passed if the voice transition over unequal lengths
     */
    Voicing.analyzeVoiceLeading = function (from, to, origin, targets) {
        var _a;
        _a = [origin || from, targets || to], origin = _a[0], targets = _a[1];
        var intervals = Voicing.voicingIntervals(from, to, false)
            .map(function (interval) { return Harmony_1.Harmony.fixInterval(interval, false); });
        /** Interval qualities */
        var degrees = intervals.map(function (i) { return util_1.getDegreeFromInterval(i); });
        /** Voices that did not move */
        var oblique = from.filter(function (n, i) { return to.find(function (note) { return Harmony_1.Harmony.isSameNote(n, note); }); });
        /** abs sum of semitones movements of voices */
        var difference = util_1.semitoneDifference(intervals);
        /** relative sum of semitone movements */
        var movement = util_1.semitoneMovement(intervals);
        /** voice differences did not cancel each other out > moved in same direction */
        var similar = Math.abs(movement) === Math.abs(difference);
        /** moves parallel if all interval qualities the same and in the same direction */
        var parallel = difference > 0 && similar && degrees.reduce(function (match, degree, index) {
            return match && (index === 0 || degrees[index - 1] === degree);
        }, true);
        // find out which notes have been dropped / added
        var dropped = [], added = [];
        if (origin.length < targets.length) {
            added = targets.filter(function (n) { return !to.includes(n); });
        }
        else {
            dropped = origin.filter(function (n) { return !from.includes(n); });
        }
        return {
            from: from,
            to: to,
            origin: origin,
            targets: targets,
            intervals: intervals,
            difference: difference,
            movement: movement,
            bottomInterval: intervals[0],
            topInterval: intervals[intervals.length - 1],
            topNotes: [origin[origin.length - 1], targets[targets.length - 1]],
            bottomNotes: [origin[0], targets[0]],
            similar: similar,
            contrary: !similar,
            parallel: parallel,
            oblique: oblique,
            degrees: degrees,
            added: added,
            dropped: dropped,
        };
    };
    /** Returns true if the given note is contained in the given voicing. */
    Voicing.containsNote = function (note, voicing, enharmonic) {
        if (enharmonic === void 0) { enharmonic = true; }
        if (!enharmonic) {
            return voicing.includes(note);
        }
        return !!voicing.find(function (n) { return Harmony_1.Harmony.isSameNote(note, n); });
    };
    /** Returns the intervals between the given chord voicings.
     * Can be passed pitch classes or absolute notes.
     * The two voicings should have the same length. */
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
    /** Validates the current permutation to have a note at a certain position (array index) */
    Voicing.notesAtPositionValidator = function (notes, position) {
        if (notes === void 0) { notes = []; }
        return function (selected, note, remaining) {
            return !notes.length || selected.length !== position || notes.includes(note);
        };
    };
    /** Returns true if the given voicing contains its root */
    Voicing.hasTonic = function (voicing, chord) {
        var tokens = tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord));
        return voicing.map(function (n) { return tonal_2.Note.pc(n); }).includes(tokens[0]);
    };
    /** Returns the best direction to move for a given voicing in a range.
     * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
     */
    Voicing.getDesiredDirection = function (voicing, range, thresholds) {
        if (thresholds === void 0) { thresholds = [3, 3]; }
        var distances = util_1.getDistancesToRangeEnds([voicing[0], voicing[voicing.length - 1]], range);
        if (distances[0] < thresholds[0] && distances[1] < thresholds[1]) {
            console.error('range is too small to fit the comfy zone');
            return;
        }
        if (distances[0] < thresholds[0]) {
            return 'up';
        }
        if (distances[1] < thresholds[1]) {
            return 'down';
        }
    };
    return Voicing;
}());
exports.Voicing = Voicing;
/**
 *



    static getPossibleVoicings(chord, voices = 4) {
        const required = getRequiredNotes(chord);
        const optional = getOptionalNotes(chord);
        const tensions = getAvailableTensions(chord);
        return { required, optional, tensions };
    }
    static voicingDifference(chordA, chordB, min = true) {
        return semitoneDifference(Voicing.voicingIntervals(chordA, chordB, min));
    }

    static voicingMovement(chordA, chordB, min = true, direction?: intervalDirection) {
        return semitoneMovement(Voicing.voicingIntervals(chordA, chordB, min, direction));
    }

    static bestVoiceLeading(chordA, chordB, sortFn?) {
        sortFn = sortFn || ((a, b) => a.difference - b.difference);
        const voices = Voicing.voiceLeading(chordA, chordB)
            .sort((best, current) => {
                return sortFn(best, current);
            }, null);
        return voices[0];
    }

    static minVoiceMovement(chordA, chordB) {
        [chordA, chordB] = [chordA, chordB].sort((a, b) => b.length - a.length);
        const picks = Permutation.binomial(chordA, chordB.length);
        return picks.reduce((min, current) => {
            const diff = Voicing.voicingMovement(current, chordB, false);
            if (Math.abs(diff) < Math.abs(min)) {
                return diff;
            }
            return min;
        }, 100);
    }

    static getVoices(chord, voices = 4, rootless = false, tension = 1) {
        // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
        chord = Harmony.getTonalChord(chord);
        const tokens = Chord.tokenize(chord);
        const required = Voicing.getRequiredNotes(chord);
        let optional = Voicing.getOptionalNotes(chord, required);
        let choices = [].concat(required);
        const remaining = () => voices - choices.length;
        if (tension > 0) {
            choices = choices.concat(Voicing.getAvailableTensions(chord).slice(0, tension));
        }
        if (remaining() > 0) {
            choices = choices.concat(optional);
        }
        if (remaining() < 0 && rootless) {
            choices = choices.filter(n => n !== tokens[0]);
        }
        if (remaining() > 0) {
            // console.warn(`${remaining} notes must be doubled!!!`);
            choices = choices.concat(required, optional).slice(0, voices);
        }
        return choices.slice(0, voices);
    }
 */ 
