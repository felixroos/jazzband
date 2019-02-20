import { intervalDirection } from './Harmony';
export declare type VoicingValidation = {
    maxDistance?: number;
    minBottomDistance?: number;
    minDistance?: number;
    minTopDistance?: number;
    topNotes?: string[];
    bottomNotes?: string[];
};
export declare interface VoiceLeadingOptions extends VoicingValidation {
    range?: string[];
    maxVoices?: number;
    forceDirection?: intervalDirection;
    rangeBorders?: number[];
}
export declare class Voicing {
    static getNextVoicing(chord: any, lastVoicing: any, options?: VoiceLeadingOptions): any;
    static getDesiredDirection(voicing: any, range: any, thresholds?: number[]): "up" | "down";
    static hasTonic(voicing: any, chord: any): any;
    static getNoteCombinations(chord: any, length?: number): any;
    static getVoicePermutations(chord: any, length: any, voicingOptions?: VoicingValidation): any;
    static getVoices(chord: any, voices?: number, rootless?: boolean, tension?: number): any[];
    static getAvailableTensions(chord: any): any;
    static getAllTensions(root: any): any[];
    static getRequiredNotes(chord: any): any[];
    static getOptionalNotes(chord: any, required?: any): any;
    static getAllChoices(combinations: any, lastVoicing: any, range?: any): any;
    static validateInterval(validate: (interval: string, { path, next, array }: {
        path: any;
        next: any;
        array: any;
    }) => boolean): (path: any, next: any, array: any) => boolean;
    static notesAtPositionValidator(notes: any[], position: any): (selected: any, note: any, remaining: any) => boolean;
    static voicingValidator(options?: VoicingValidation): (path: any, next: any, array: any) => boolean;
    static getVoicingCombinations(notes: any, options?: VoicingValidation, validator?: (path: any, next: any, array: any) => boolean): any;
    static voiceLeading(chordA: any, chordB: any): any;
    static bestVoiceLeading(chordA: any, chordB: any, sortFn?: any): any;
    static voicingIntervals(chordA: any, chordB: any, min?: boolean, direction?: intervalDirection): any;
    static voicingDifference(chordA: any, chordB: any, min?: boolean): any;
    static minVoiceMovement(chordA: any, chordB: any): any;
    static voicingMovement(chordA: any, chordB: any, min?: boolean, direction?: intervalDirection): any;
}
