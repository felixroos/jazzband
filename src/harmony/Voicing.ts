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
    transposeNotes,
} from '../util/util';

import { Harmony, intervalDirection } from './Harmony';

export declare type VoicingValidation = {
    maxDistance?: number;
    minBottomDistance?: number;
    minDistance?: number;
    minTopDistance?: number;
    topNotes?: string[]; // accepted top notes
    topDegrees?: number[]; // accepted top degrees
    bottomNotes?: string[]; // accepted top notes
    bottomDegrees?: number[]; // accepted bottom degrees
    omitNotes?: string[];
    /* custom validator for permutation of notes */
    validatePermutation?: (path: string[], next: string, array: string[]) => boolean;
    /* Custom sort function for choices. Defaults to smaller difference. */
    sortChoices?: (choiceA, choiceB) => number;
    filterChoices?: (choice) => boolean;
    noTopDrop?: boolean;
    noTopAdd?: boolean;
    noBottomDrop?: boolean;
    noBottomAdd?: boolean;
    root?: string; // validate relative to that root
};

export declare interface VoiceLeadingOptions extends VoicingValidation {
    range?: string[];
    maxVoices?: number;
    forceDirection?: intervalDirection;
    forceBestPick?: boolean; // if true, the best pick will always be taken even if transposed an octave
    // the lower and upper distance to the range end that is tolerated before forcing a direction
    rangeBorders?: number[];
    logging?: boolean; // if true, all voice leading infos will be logged to the console
    idleChance?: number; // if true, next voicings cant use all the same notes again (difference !== 0)
    logIdle?: boolean; // if false, nothing will be logged if the notes stayed the same
}

export class Voicing {

    /** Returns the next voicing that should follow the previously played voicing. 
    */
    static getNextVoicing(chord, previousVoicing, options: VoiceLeadingOptions = {}) {
        let { maxVoices,
            range,
            forceDirection,
            forceBestPick,
            rangeBorders,
            sortChoices,
            filterChoices,
            noTopDrop,
            noTopAdd,
            noBottomDrop,
            noBottomAdd,
            idleChance,
            logIdle,
            logging
        }: VoiceLeadingOptions = {
            range: ['C3', 'C5'],
            rangeBorders: [3, 3],
            maxVoices: 4,
            forceDirection: null,
            forceBestPick: false,
            maxDistance: 7,
            minBottomDistance: 3, // min semitones between the two bottom notes
            minTopDistance: 2, // min semitones between the two top notes
            noTopDrop: true,
            noTopAdd: true,
            noBottomDrop: false,
            noBottomAdd: false,
            idleChance: 1,
            logIdle: false,
            logging: true,
            ...options
        };
        // make sure tonal can read the chord
        chord = Harmony.getTonalChord(chord);
        if (chord === 'r') {
            return null;
        }

        let combinations = Voicing.getAllVoicePermutations(chord, maxVoices, options);

        const exit = () => {
            const pick = [];
            if (logging) {
                Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, logIdle });
            }
            return pick;
        }

        if (!combinations.length) {
            return exit();
        }

        if (!previousVoicing || !previousVoicing.length) { // no previous chord
            // filter out combinations that are out of range
            combinations = combinations.filter(combination => {
                const firstNote = Harmony.getNearestNote(range[0], combination[0], 'up');
                const pick = renderAbsoluteNotes(combination, Note.oct(firstNote));
                return isInRange(pick[0], range) && isInRange(pick[pick.length - 1], range);
            });
            const firstPick = combinations[0];
            const firstNoteInRange = Harmony.getNearestNote(range[0], firstPick[0], 'up');
            const pick = renderAbsoluteNotes(firstPick, Note.oct(firstNoteInRange));
            if (logging) {
                Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, logIdle });
            }
            return pick;
        }
        let choices = Voicing.getAllChoices(combinations, previousVoicing, range)
            .filter(choice => { // apply flag filters + filerChoices if any
                return (!noTopDrop || !choice.dropped.includes(choice.topNotes[0])) &&
                    (!noTopAdd || !choice.added.includes(choice.topNotes[1])) &&
                    (!noBottomDrop || !choice.dropped.includes(choice.bottomNotes[0])) &&
                    (!noBottomAdd || !choice.added.includes(choice.bottomNotes[1])) &&
                    (!filterChoices || filterChoices(choice)) &&
                    (choice.difference > 0 || Math.random() < idleChance)
            })
            .sort(sortChoices ?
                (a, b) => sortChoices(a, b) :
                (a, b) => a.difference - b.difference
            );

        if (!choices.length) {
            return exit();
        }
        let bestPick = choices[0].targets, choice;
        let direction = Voicing.getDesiredDirection(previousVoicing, range, rangeBorders) || forceDirection;

        if (direction && forceBestPick && (!isInRange(bestPick[0], range) || isInRange(bestPick[bestPick.length - 1], range))) {
            const octave = direction === 'up' ? '8P' : '-8P';
            bestPick = transposeNotes(bestPick, octave);
        }

        if (!direction || forceBestPick) {
            const pick = bestPick;
            choice = choices[0];
            if (logging) {
                Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, direction, bestPick, choice, choices, logIdle });
            }
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
        if (logging) {
            Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, direction, bestPick, choice, choices, logIdle });
        }
        return pick;
    }

    /** Computes all valid voice permutations for a given chord and voice number.
     * Runs getVoicePermutations for each possible selection of notes.
     */
    static getAllVoicePermutations(chord, length, voicingOptions: VoicingValidation = {}) {
        const root = Harmony.getBassNote(chord, true);
        const { omitNotes } = voicingOptions;
        return Voicing.getAllNoteSelections(chord, length, omitNotes)
            .reduce((combinations, combination) => {
                return combinations.concat(
                    Voicing.getVoicePermutations(combination, { ...voicingOptions, root }))
            }, []);
    }

    /** Get all permutations of the given notes that would make a good voicing. */
    static getVoicePermutations(notes, options: VoicingValidation = {}) {
        if (notes.length === 1) {
            return [notes];
        }
        const validator = options.validatePermutation || ((path, next, array) => true);
        return Permutation.permutateElements(notes,
            Permutation.combineValidators(
                validator,
                Voicing.voicingValidator(options)
            )
        );
    }

    /** Configurable Validator that sorts out note combinations with untasty intervals.  */
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
                Voicing.degreesAtPositionValidator(options.topDegrees, path.length + array.length - 1, options.root),
                Voicing.degreesAtPositionValidator(options.bottomDegrees, 0, options.root),
                Voicing.validateInterval(interval => Interval.semitones(interval) <= options.maxDistance),
                Voicing.validateInterval((interval, { path, array }) => array.length === 1 || path.length === 1 || Interval.semitones(interval) >= options.minDistance),
                Voicing.validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) >= options.minTopDistance),
                Voicing.validateInterval((interval, { path }) => path.length !== 1 || Interval.semitones(interval) >= options.minBottomDistance)
            )(path, next, array);
        }
    }

    /** Validates the interval to the next note. You can write your own logic inside the validate fn. */
    static validateInterval(validate: (interval: string, { path, next, array }) => boolean) {
        return (path, next, array) => {
            if (!path.length) { return true }
            const interval = Distance.interval(path[path.length - 1], next) + '';
            return validate(interval, { path, next, array });
        }
    }

    /** Returns all possible combinations of required and optional notes for a given chord and desired length. 
     * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */
    static getAllNoteSelections(chord, voices = 2, omitNotes = []) {
        let required = Voicing.getRequiredNotes(chord, voices);
        required = Voicing.withoutPitches(omitNotes, required);
        if (voices === 1) {
            return required.map(note => [note]);
        }
        const fill = voices - required.length;
        if (fill === 0) {
            return [required];
        }
        if (fill < 0) { // required notes are enough
            return Permutation.binomial(required, voices);
        }
        let optional = Voicing.getOptionalNotes(chord, voices, required);
        optional = Voicing.withoutPitches(omitNotes, optional);

        if (fill >= optional.length) {
            return [required.concat(optional)];
        }
        return Permutation.binomial(optional, fill)
            .map(selection => required.concat(selection))
    }

    static withoutPitches(pitches = [], voicing: string[]) {
        return voicing.filter(r => !pitches.find(o => Harmony.hasSamePitch(r, o)));
    }

    /** Get available tensions for a given chord. Omits tensions that kill the chord quality */
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

    /** Returns all Tensions that could be in any chord */
    static getAllTensions(root) {
        return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
            .map(step => getIntervalFromStep(step))
            .map(interval => Distance.transpose(root, interval));
    }


    /** Returns all notes that are required to outline a chord */
    static getRequiredNotes(chord, voices = 2) {
        chord = Harmony.getTonalChord(chord);
        const notes = Chord.notes(chord);
        const intervals = Chord.intervals(chord);
        let requiredSteps = [3, 7, 'b5', 6].slice(0, Math.max(voices, 2)); // order is important
        if (!hasDegree(3, intervals)) {
            requiredSteps.push(4); // fixes m6 chords
        }
        let required = requiredSteps.reduce((req, degree) => {
            if (hasDegree(degree, intervals)) {
                req.push(getDegreeInChord(degree, chord));
            }
            return req;
        }, []);
        if (voices > 3 && !required.includes(notes[notes.length - 1])) {
            required.push(notes[notes.length - 1]);
        }
        return required;
    }

    /** Returns all notes that are not required */
    static getOptionalNotes(chord, voices?, required?) {
        chord = Harmony.getTonalChord(chord);
        const notes = Chord.notes(chord);
        required = required || Voicing.getRequiredNotes(chord, voices);
        return notes.filter(note => !required.includes(note));
    }

    /** Returns all possible note choices for the given combinations.
     * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
     */
    static getAllChoices(combinations, previousVoicing, range?) {
        const lastPitches = previousVoicing.map(note => Note.pc(note));
        return combinations
            .map((combination) => {
                const bottomInterval = Distance.interval(lastPitches[0], combination[0]);
                let bottomNotes = [
                    Distance.transpose(previousVoicing[0], Harmony.minInterval(bottomInterval, 'down')),
                    Distance.transpose(previousVoicing[0], Harmony.minInterval(bottomInterval, 'up')),
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
            .reduce((all, targets) => {
                const leads = Voicing.voiceLeading(previousVoicing, targets);
                return all.concat(leads);
            }, [])
    }

    /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */
    static voiceLeading(origin, targets) {
        // if same length > dont permutate
        if (origin.length === targets.length) {
            return Voicing.analyzeVoiceLeading(origin, targets);
        }
        const [more, less] = [origin, targets].sort((a, b) => b.length - a.length);
        return Permutation.binomial(more, less.length)
            .map(selection => {
                let from, to;
                if (origin.length < targets.length) {
                    [from, to] = [origin, selection];
                } else {
                    [from, to] = [selection, targets];
                }
                return Voicing.analyzeVoiceLeading(from, to, origin, targets);
            });
    }

    /** Analyzed the voice leading for the movement from > to. 
     * Origin and targets needs to be passed if the voice transition over unequal lengths
     */
    static analyzeVoiceLeading(from, to, origin?, targets?) {
        [origin, targets] = [origin || from, targets || to];
        let intervals = Voicing.voicingIntervals(from, to, false)
            .map(interval => Harmony.fixInterval(interval, false));
        /** Interval qualities */
        const degrees = intervals.map(i => getDegreeFromInterval(i));
        /** Voices that did not move */
        const oblique = from.filter((n, i) => to.find(note => Harmony.hasSamePitch(n, note)));
        /** abs sum of semitones movements of voices */
        const difference = semitoneDifference(intervals);
        /** relative sum of semitone movements */
        const movement = semitoneMovement(intervals);
        /** voice differences did not cancel each other out > moved in same direction */
        const similar = Math.abs(movement) === Math.abs(difference);
        /** moves parallel if all interval qualities the same and in the same direction */
        const parallel = difference > 0 && similar && degrees.reduce((match, degree, index) =>
            match && (index === 0 || degrees[index - 1] === degree), true);
        // find out which notes have been dropped / added
        let dropped = [], added = [];
        if (origin.length < targets.length) {
            added = targets.filter(n => !to.includes(n));
        } else {
            dropped = origin.filter(n => !from.includes(n));
        }
        return {
            from,
            to,
            origin,
            targets,
            intervals,
            difference,
            movement,
            bottomInterval: intervals[0],
            topInterval: intervals[intervals.length - 1],
            topNotes: [origin[origin.length - 1], targets[targets.length - 1]],
            bottomNotes: [origin[0], targets[0]],
            similar,
            contrary: !similar,
            parallel,
            oblique,
            degrees,
            added,
            dropped,
        }
    }

    /** Returns true if the given note is contained in the given voicing. */
    static containsPitch(note, voicing, enharmonic = true) {
        if (!enharmonic) {
            return voicing.includes(note);
        }
        return !!voicing.find(n => Harmony.hasSamePitch(note, n));
    }

    /** Returns the intervals between the given chord voicings. 
     * Can be passed pitch classes or absolute notes.
     * The two voicings should have the same length. */
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

    /** Validates the current permutation to have a note at a certain position (array index) */
    static notesAtPositionValidator(notes = [], position) {
        return (selected, note, remaining) => {
            return !notes.length || selected.length !== position || Voicing.containsPitch(note, notes)/*  notes.includes(note) */;
        }
    }

    /** Validates the current permutation to have a note at a certain position (array index) */
    static degreesAtPositionValidator(degrees = [], position, root) {
        return (selected, note, remaining) => {
            if (!degrees.length || !root || selected.length !== position) {
                return true;
            }
            const degree = getDegreeFromInterval(Distance.interval(root, note));
            return degrees.includes(degree);
        }
    }

    /** Returns true if the given voicing contains its root */
    static hasTonic(voicing, chord) {
        const tokens = Chord.tokenize(Harmony.getTonalChord(chord));
        return voicing.map(n => Note.pc(n)).includes(tokens[0]);
    }

    /** Returns the best direction to move for a given voicing in a range.
     * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
     */
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
}

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