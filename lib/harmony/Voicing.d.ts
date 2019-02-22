import { intervalDirection } from './Harmony';
export declare type VoicingValidation = {
    maxDistance?: number;
    minBottomDistance?: number;
    minDistance?: number;
    minTopDistance?: number;
    topNotes?: string[];
    bottomNotes?: string[];
    validatePermutation?: (path: string[], next: string, array: string[]) => boolean;
    sortChoices?: (choiceA: any, choiceB: any) => number;
    filterChoices?: (choice: any) => boolean;
    noTopDrop?: boolean;
    noTopAdd?: boolean;
    noBottomDrop?: boolean;
    noBottomAdd?: boolean;
};
export declare interface VoiceLeadingOptions extends VoicingValidation {
    range?: string[];
    maxVoices?: number;
    forceDirection?: intervalDirection;
    rangeBorders?: number[];
    logging?: boolean;
}
export declare class Voicing {
    /** Returns the next voicing that should follow the previously played voicing.
    */
    static getNextVoicing(chord: any, previousVoicing: any, options?: VoiceLeadingOptions): any;
    /** Computes all valid voice permutations for a given chord and voice number.
     * Runs getVoicePermutations for each possible selection of notes.
     */
    static getAllVoicePermutations(chord: any, length: any, voicingOptions?: VoicingValidation): any;
    /** Get all permutations of the given notes that would make a good voicing. */
    static getVoicePermutations(notes: any, options?: VoicingValidation): any;
    /** Configurable Validator that sorts out note combinations with untasty intervals.  */
    static voicingValidator(options?: VoicingValidation): (path: any, next: any, array: any) => boolean;
    /** Validates the interval to the next note. You can write your own logic inside the validate fn. */
    static validateInterval(validate: (interval: string, { path, next, array }: {
        path: any;
        next: any;
        array: any;
    }) => boolean): (path: any, next: any, array: any) => boolean;
    /** Returns all possible combinations of required and optional notes for a given chord and desired length.
     * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */
    static getAllNoteSelections(chord: any, voices?: number): any;
    /** Get available tensions for a given chord. Omits tensions that kill the chord quality */
    static getAvailableTensions(chord: any): any;
    /** Returns all Tensions that could be in any chord */
    static getAllTensions(root: any): any[];
    /** Returns all notes that are required to outline a chord */
    static getRequiredNotes(chord: any): any[];
    /** Returns all notes that are not required */
    static getOptionalNotes(chord: any, required?: any): any;
    /** Returns all possible note choices for the given combinations.
     * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
     */
    static getAllChoices(combinations: any, previousVoicing: any, range?: any): any;
    /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */
    static voiceLeading(origin: any, targets: any): any;
    /** Analyzed the voice leading for the movement from > to.
     * Origin and targets needs to be passed if the voice transition over unequal lengths
     */
    static analyzeVoiceLeading(from: any, to: any, origin?: any, targets?: any): {
        from: any;
        to: any;
        origin: any;
        targets: any;
        intervals: any;
        difference: any;
        movement: any;
        bottomInterval: any;
        topInterval: any;
        topNotes: any[];
        bottomNotes: any[];
        similar: boolean;
        contrary: boolean;
        parallel: any;
        oblique: any;
        degrees: any;
        added: any[];
        dropped: any[];
    };
    /** Returns true if the given note is contained in the given voicing. */
    static containsNote(note: any, voicing: any, enharmonic?: boolean): any;
    /** Returns the intervals between the given chord voicings.
     * Can be passed pitch classes or absolute notes.
     * The two voicings should have the same length. */
    static voicingIntervals(chordA: any, chordB: any, min?: boolean, direction?: intervalDirection): any;
    /** Validates the current permutation to have a note at a certain position (array index) */
    static notesAtPositionValidator(notes: any[], position: any): (selected: any, note: any, remaining: any) => boolean;
    /** Returns true if the given voicing contains its root */
    static hasTonic(voicing: any, chord: any): any;
    /** Returns the best direction to move for a given voicing in a range.
     * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
     */
    static getDesiredDirection(voicing: any, range: any, thresholds?: number[]): "up" | "down";
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
