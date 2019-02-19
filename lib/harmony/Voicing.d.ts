import { intervalDirection } from '../util/util';
declare type VoicingValidation = {
    maxDistance?: number;
    minBottomDistance?: number;
    minTopDistance?: number;
    topNotes?: string[];
    bottomNotes?: string[];
};
export declare class Voicing {
    static getNextVoicing(chord: any, lastVoicing: any, range?: string[], maxVoices?: number): any;
    static getVoices(chord: any, voices?: number, rootless?: boolean, tension?: number): any[];
    static getAvailableTensions(chord: any): any;
    static getAllTensions(root: any): any[];
    static getRequiredNotes(chord: any): any[];
    static getOptionalNotes(chord: any, required?: any): any;
    static getAllChoices(combinations: any, lastVoicing: any): any;
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
export {};
