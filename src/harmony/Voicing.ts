import { Permutation } from '../util/Permutation';
import { Logger } from '../util/Logger';
import { Chord } from 'tonal';
import { Note } from 'tonal';
import { Distance } from 'tonal';
import { Interval } from 'tonal';
import {
    renderAbsoluteNotes,
    isDominantChord,
    getIntervalFromStep,
    hasDegree,
    getDegreeInChord,
    semitoneDistance,
    chordHasIntervals,
    semitoneMovement,
    semitoneDifference,
    isPitchClass,
    getDegreeFromInterval,
    isInRange,
    getDistancesToRangeEnds,
} from '../util/util';

import { Harmony, intervalDirection } from './Harmony';

export declare type VoicingValidation = {
    maxDistance?: number;
    minBottomDistance?: number;
    minDistance?: number;
    minTopDistance?: number;
    topNotes?: string[]; // accepted top notes
    bottomNotes?: string[]; // accepted top notes
};

export declare interface VoiceLeadingOptions extends VoicingValidation {
    range?: string[];
    maxVoices?: number;
    forceDirection?: intervalDirection;
    // the lower and upper distance to the range end that is tolerated before forcing a direction
    rangeBorders?: number[];
}



export class Voicing {
    static getNextVoicing(chord, lastVoicing, options: VoiceLeadingOptions = {}) {
        let { maxVoices, range, forceDirection, rangeBorders }: VoiceLeadingOptions = {
            range: ['C3', 'C5'],
            rangeBorders: [3, 3],
            maxVoices: 4,
            forceDirection: null,
            maxDistance: 7,
            minBottomDistance: 3, // min semitones between the two bottom notes
            minTopDistance: 2, // min semitones between the two top notes
            ...options
        };
        // make sure tonal can read the chord
        chord = Harmony.getTonalChord(chord);
        if (chord === 'r') {
            return null;
        }

        let combinations = Voicing.getVoicePermutations(chord, maxVoices, options);
        // find valid combinations
        /* let combinations = Voicing.getVoicingCombinations(notes, {
            maxDistance: 7
        }); */
        const exit = () => {
            const pick = [];
            Logger.logVoicing({ chord, lastVoicing, range, combinations, pick });
            return pick;
        }

        if (!combinations.length) {
            return exit();
        }

        if (!lastVoicing || !lastVoicing.length) { // no previous chord

            // filter out combinations that are out of range
            combinations = combinations.filter(combination => {
                const firstNote = Harmony.getNearestNote(range[0], combination[0], 'up');
                const pick = renderAbsoluteNotes(combination, Note.oct(firstNote));
                return isInRange(pick[0], range) && isInRange(pick[pick.length - 1], range);
            });

            const firstPick = combinations[0];
            const firstNoteInRange = Harmony.getNearestNote(range[0], firstPick[0], 'up');

            const pick = renderAbsoluteNotes(firstPick, Note.oct(firstNoteInRange));
            Logger.logVoicing({ chord, lastVoicing, range, combinations, pick });
            return pick;
        }

        let choices = Voicing.getAllChoices(combinations, lastVoicing, range);
        if (!choices.length) {
            return exit();
        }
        let bestPick = choices[0].targets, choice;
        const direction = Voicing.getDesiredDirection(lastVoicing, range, rangeBorders) || forceDirection;

        if (!direction) {
            const pick = bestPick;
            choice = choices[0];
            Logger.logVoicing({ chord, lastVoicing, range, combinations, pick, direction, bestPick, choice, choices });
            return pick;
        }
        // sort after movement instead of difference
        choice = choices.sort((a, b) => {
            return Math.abs(a.movement) - Math.abs(b.movement)
        }).find(choice => {
            if (direction === 'up') {
                return choice.movement >= 0
            }
            return choice.movement <= 0;
        });
        if (!choice) { // keep hanging in the corner of the range..
            choice = choices[0];
        }
        const pick = choice.targets;
        Logger.logVoicing({ chord, lastVoicing, range, combinations, pick, direction, bestPick, choice, choices });
        return pick;
    }

    static getDesiredDirection(voicing, range, thresholds = [3, 3]) {
        let distances = getDistancesToRangeEnds([voicing[0], voicing[voicing.length - 1]], range);
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
    }

    static hasTonic(voicing, chord) {
        const tokens = Chord.tokenize(Harmony.getTonalChord(chord));
        return voicing.map(n => Note.pc(n)).includes(tokens[0]);
    }

    static getNoteCombinations(chord, length = 2) {
        const required = Voicing.getRequiredNotes(chord);
        const fill = length - required.length;
        if (length === 1) {
            return required.map(note => [note]);
        }
        if (fill === 0) {
            return [required];
        }
        if (fill < 0) { // required notes are enough
            return Permutation.binomial(required, length);
        }
        let optional = Voicing.getOptionalNotes(chord, required);
        if (fill >= optional.length) {
            return [required.concat(optional)];
        }
        return Permutation.binomial(optional, fill)
            .map(selection => required.concat(selection))
    }

    static getVoicePermutations(chord, length, voicingOptions?: VoicingValidation) {
        return Voicing.getNoteCombinations(chord, length)
            .reduce((combinations, combination) => {
                return combinations.concat(
                    Voicing.getVoicingCombinations(combination, voicingOptions))
            }, []);
    }


    static getVoices(chord, voices = 4, rootless = false, tension = 1) {
        // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
        chord = Harmony.getTonalChord(chord);
        /* const intervals = Chord.intervals(chord); */
        const tokens = Chord.tokenize(chord);
        const required = Voicing.getRequiredNotes(chord);
        let optional = Voicing.getOptionalNotes(chord, required);
        let choices = [].concat(required);
        const remaining = () => voices - choices.length;
        if (tension > 0) {
            choices = choices.concat(Voicing.getAvailableTensions(chord).slice(0, tension));
            /* console.log(chord, 'tension', tensions); */
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

    static getAvailableTensions(chord) {
        chord = Harmony.getTonalChord(chord);
        const notes = Chord.notes(chord);
        if (isDominantChord(chord)) {
            return Voicing.getAllTensions(notes[0])
                // filter out tensions that are part of the chord
                .filter(note => !notes.find(n => semitoneDistance(notes[0], note) === semitoneDistance(notes[0], n)))
                // filter out tensions that are a semitone above the 3 (if exists)
                .filter(note => chordHasIntervals(chord, ['3!']) || semitoneDistance(getDegreeInChord(3, chord), note) > 1)
                // filter out tensions that are a semitone above the 4 (if exists => sus)
                .filter(note => !chordHasIntervals(chord, ['4P']) || semitoneDistance(getDegreeInChord(4, chord), note) > 1)
                // filter out tensions that are a semitone above the 7
                .filter(note => semitoneDistance(getDegreeInChord(7, chord), note) > 1)
        }
        return notes.slice(0, 4)
            // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
            .filter(note => note === notes[0] || semitoneDistance(note, notes[0]) > 2)
            // all tensions are a major second above a chord note
            .map(note => Distance.transpose(note, '2M'))
            // tensions 2 semiontes below root are flat 7 => changes chord quality
            .filter(note => semitoneDistance(note, notes[0]) !== 2)
        // omit tensions that end up on a chord note again?
    }

    static getAllTensions(root) {
        return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
            .map(step => getIntervalFromStep(step))
            .map(interval => Distance.transpose(root, interval));
    }


    // Returns all notes required for a shell chord
    static getRequiredNotes(chord) {
        chord = Harmony.getTonalChord(chord);
        const notes = Chord.notes(chord);
        const intervals = Chord.intervals(chord);
        let requiredSteps = [3, 7, 'b5', 6];
        if (!hasDegree(3, intervals)) {
            requiredSteps.push(4); // fixes m6 chords
        }
        let required = requiredSteps.reduce((req, degree) => {
            if (hasDegree(degree, intervals)) {
                req.push(getDegreeInChord(degree, chord));
            }
            return req;
        }, []);
        // is a flat 5 required? 
        // WHY 3??
        if (notes.length > 3 && !required.includes(notes[notes.length - 1])) {
            required.push(notes[notes.length - 1]); // could check if is 5 than dont push
        }
        return required;
    }

    static getOptionalNotes(chord, required?) {
        chord = Harmony.getTonalChord(chord);
        const notes = Chord.notes(chord);
        required = required || Voicing.getRequiredNotes(chord);
        return notes.filter(note => !required.includes(note));
    }

    /* static getPossibleVoicings(chord, voices = 4) {
        const required = getRequiredNotes(chord);
        const optional = getOptionalNotes(chord);
        const tensions = getAvailableTensions(chord);
        return { required, optional, tensions };
    } */

    static getAllChoices(combinations, lastVoicing, range?) {
        const lastPitches = lastVoicing.map(note => Note.pc(note));
        return combinations
            .map((combination) => {
                const bottomInterval = Distance.interval(lastPitches[0], combination[0]);
                let bottomNotes = [
                    Distance.transpose(lastVoicing[0], Harmony.minInterval(bottomInterval, 'down')),
                    Distance.transpose(lastVoicing[0], Harmony.minInterval(bottomInterval, 'up')),
                ];
                if (bottomNotes[0] === bottomNotes[1]) {
                    bottomNotes = [bottomNotes[0]];
                }
                return { combination, bottomNotes }
            })
            .reduce((all, { combination, bottomNotes }) => all.concat(
                bottomNotes.map(bottomNote => renderAbsoluteNotes(combination, Note.oct(bottomNote)))
            ), [])
            .filter((targets) => {
                return !range ||
                    isInRange(targets[0], range) &&
                    isInRange(targets[targets.length - 1], range)
            })
            .reduce((all, notes) => {
                const leads = Voicing.voiceLeading(lastVoicing, notes)
                return all.concat(leads);
            }, [])
            .sort((a, b) => {
                /* return Math.abs(a.movement) - Math.abs(b.movement) */
                return Math.abs(a.difference) - Math.abs(b.difference)
                /* return Math.abs(Interval.semitones(a.topInterval)) - Math.abs(Interval.semitones(b.topInterval)) */
            });
    }

    static validateInterval(validate: (interval: string, { path, next, array }) => boolean) {
        return (path, next, array) => {
            if (!path.length) { return true }
            const interval = Distance.interval(path[path.length - 1], next);
            return validate(interval, { path, next, array });
        }
    }
    static notesAtPositionValidator(notes = [], position) {
        return (selected, note, remaining) => {
            return !notes.length || selected.length !== position || notes.includes(note);
        }
    }

    static voicingValidator(options?: VoicingValidation) {
        options = {
            maxDistance: 6, // max semitones between any two sequential notes
            minDistance: 1, // min semitones between two notes
            minBottomDistance: 3, // min semitones between the two bottom notes
            minTopDistance: 2, // min semitones between the two top notes
            ...options,
        }
        return (path, next, array) => {
            return Permutation.combineValidators(
                Voicing.notesAtPositionValidator(options.topNotes, path.length + array.length - 1),
                Voicing.notesAtPositionValidator(options.bottomNotes, 0),
                Voicing.validateInterval(interval => Interval.semitones(interval) <= options.maxDistance),
                Voicing.validateInterval(interval => Interval.semitones(interval) >= options.minDistance),
                Voicing.validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) >= options.minTopDistance),
                Voicing.validateInterval((interval, { path }) => path.length !== 1 || Interval.semitones(interval) >= options.minBottomDistance)
            )(path, next, array);
        }
    }

    static getVoicingCombinations(notes, options: VoicingValidation = {}, validator = (path, next, array) => true) {
        if (notes.length === 1) {
            return [notes];
        }
        return Permutation.permutateElements(notes,
            Permutation.combineValidators(
                validator,
                Voicing.voicingValidator(options)
            )
        );
    }


    static voiceLeading(chordA, chordB) {
        const origin = [].concat(chordA);
        const targets = [].concat(chordB);
        const flare = chordA.length < chordB.length;
        [chordA, chordB] = [chordA, chordB].sort((a, b) => b.length - a.length);
        return Permutation.binomial(chordA, chordB.length)
            .map(permutation => {
                const [from, to] = flare ? [chordB, permutation] : [permutation, chordB];
                let intervals = Voicing.voicingIntervals(from, to, false)
                    .map(interval => Harmony.fixInterval(interval, false));
                const degrees = intervals.map(i => getDegreeFromInterval(i));
                const oblique = origin.filter((n, i) => targets.find(note => Harmony.isSameNote(n, note)));
                let dropped = [], added = [];
                const difference = semitoneDifference(intervals);
                if (!flare) {
                    dropped = origin.filter(n => !permutation.includes(n));
                } else {
                    added = targets.filter(n => !permutation.includes(n));
                }
                const movement = semitoneMovement(intervals);
                const similar = Math.abs(movement) === Math.abs(difference);
                const parallel = difference > 0 && similar && degrees.reduce((match, degree, index) =>
                    match && (index === 0 || degrees[index - 1] === degree), true);
                return {
                    origin,
                    targets,
                    permutation,
                    intervals,
                    difference,
                    movement,
                    bottomInterval: intervals[0],
                    topInterval: intervals[intervals.length - 1],
                    similar, // same direction,
                    contrary: !similar, // different direction,
                    parallel, // same direction, same interval qualities,
                    oblique,
                    dropped,
                    added,
                    degrees
                }
            });
    }

    static bestVoiceLeading(chordA, chordB, sortFn?) {
        sortFn = sortFn || ((a, b) => a.difference - b.difference);
        const voices = Voicing.voiceLeading(chordA, chordB)
            .sort((best, current) => {
                return sortFn(best, current);
            }, null);
        return voices[0];
    }

    static voicingIntervals(chordA, chordB, min = true, direction?: intervalDirection) {
        if (chordA.length !== chordB.length) {
            // console.log('voicingIntervals: not the same length..');
        }
        const intervals = chordA.map((n, i) => {
            const interval = Distance.interval(n, chordB[i]);
            if (min === false) {
                return interval;
            }
            if (isPitchClass(n) && isPitchClass(chordB[i])) {
                return Harmony.minInterval(interval, direction);
            }
            return interval;
        });
        return intervals;
    }

    static voicingDifference(chordA, chordB, min = true) {
        return semitoneDifference(Voicing.voicingIntervals(chordA, chordB, min));
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

    static voicingMovement(chordA, chordB, min = true, direction?: intervalDirection) {
        return semitoneMovement(Voicing.voicingIntervals(chordA, chordB, min, direction));
    }
}