import { Synthesizer } from './instruments/Synthesizer';
export declare function randomNumber(n: any): number;
export declare function arraySum(array: any): any;
export declare function randomElement(array: any, weighted?: any): any;
export declare function shuffleArray(a: any): any;
export declare function getTonalChord(chord: string): any;
export declare function getMidi(note: any, offset?: number): number;
/** Travels path along measures */
export declare function getPath(path: any, measures: any, traveled?: any[]): any;
export declare function getDuration(divisions: any, noteLength?: number, measureLength?: number): number;
export declare function resolveChords(pattern: any, measures: any, path: any, divisions?: any[]): any[] | 0 | {
    chord: any;
    pattern: any;
    path: any;
    divisions: any[];
    fraction: number;
};
export declare function hasOff(pattern: any, division?: number): boolean;
export declare function offbeatReducer(settings: any): (measures: any, bar: any, index: any) => any;
export declare function invertInterval(interval: any): any;
/** Transforms interval into one octave (octave+ get octaved down) */
export declare function simplifyInterval(interval: any): any;
declare type intervalDirection = 'up' | 'down';
declare type step = string | number;
/** inverts the interval if it does not go to the desired direction */
export declare function forceDirection(interval: any, direction: intervalDirection): any;
export declare function minInterval(interval: any, direction?: intervalDirection, force?: any): any;
export declare function mapMinInterval(direction?: intervalDirection, force?: any): (interval: any) => any;
export declare function sortMinInterval(preferredDirection?: intervalDirection): (a: any, b: any) => number;
/** Returns the note with the least distance to "from" */
export declare function getNearestNote(from: any, to: any, direction?: intervalDirection, force?: boolean): any;
/** Returns the note with the least distance to "from". TODO: add range */
export declare function getNearestTargets(from: any, targets: any, preferredDirection?: intervalDirection, force?: boolean, flip?: boolean): any;
export declare function intervalMatrix(from: any, to: any): any;
export declare function randomSynth(mix: any, allowed?: string[], settings?: {}): Synthesizer;
export interface ADSRParams {
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    gain?: number;
    duration?: number;
    endless?: boolean;
}
export declare function adsr({ attack, decay, sustain, release, gain, duration, endless }: ADSRParams, time: any, param: any): void;
export declare function randomDelay(maxMs: any): number;
export declare function isInRange(note: any, range: any): boolean;
export declare function transposeNotes(notes: any, interval: any): any;
export declare function transposeToRange(notes: any, range: any, times?: number): any;
export declare function getAverageMidi(notes: any, offset?: any): number;
export declare function getRangePosition(note: string | number, range: any): number;
export declare function getRangeDirection(note: any, range: any, defaultDirection?: intervalDirection, border?: number): {
    direction: intervalDirection;
    force: boolean;
};
export declare function getStep(step: step): string;
export declare function getIntervalFromStep(step: step): string;
export declare function getStepsFromDegree(degree: any): void;
export declare function getStepInChord(note: any, chord: any, group?: any): any;
export declare function getChordScales(chord: any, group?: string): string[];
export declare function pickChordScale(chord: any, group?: string): string;
export declare function findDegree(degreeOrStep: number | step, intervalsOrSteps: string[]): string;
export declare function hasDegree(degree: any, intervals: any): boolean;
export declare function hasAllDegrees(degrees: any, intervals: any): any;
export declare function getScaleDegree(degree: any, scale: any): string;
export declare function getScalePattern(pattern: any, scale: any): any;
export declare function renderIntervals(intervals: any, root: any): any;
export declare function renderSteps(steps: any, root: any): any;
export declare function permutateIntervals(intervals: any, pattern: any): any;
export declare function getStepFromInterval(interval: any): any;
export declare function getDegreeFromInterval(interval?: string): number;
export declare function getDegreeFromStep(step: step): number;
export declare function getDegreeInChord(degree: any, chord: any): any;
export declare function getPatternInChord(pattern: any, chord: any): any;
export declare function getDigitalPattern(chord: any): number[];
export declare function renderDigitalPattern(chord: any): any;
export declare function getGuideTones(chord: any): any;
export declare function isFirstInPath(path: any, index: any): boolean;
export declare function isBarStart(path: any): boolean;
export declare function isFormStart(path: any): boolean;
export declare function isOffbeat(path: any): boolean;
export declare function otherDirection(direction: any, defaultDirection?: any): any;
export declare function totalDiff(diff: any): any;
/** Reorders the given notes to contain the given step as close as possible */
export declare function sortByDegree(notes: any, degree: any): any;
/** Returns the given notes with octaves either moving bottom up or top down */
export declare function renderAbsoluteNotes(notes: any, octave?: number, direction?: intervalDirection): any;
export declare function getIntervals(notes: any): any;
export declare function isInterval(interval: any): boolean;
export declare function smallestInterval(intervals: any): any;
export declare function sortNotes(notes: any, direction?: intervalDirection): any;
export declare function analyzeVoicing(notes: any, root?: any): {
    notes: any;
    minInterval: any;
    maxInterval: any;
    intervals: any;
    spread: any;
};
export declare function analyzeVoiceLeading(voicings: any, min?: boolean): any;
export declare function minIntervals(chordA: any, chordB: any): any;
export declare function semitoneDifference(intervals: any): any;
export declare function semitoneMovement(intervals: any): any;
export declare function longestChild(array: any[][]): any[];
export declare function voicingIntervals(chordA: any, chordB: any, min?: boolean, direction?: intervalDirection): any;
export declare function voicingDifference(chordA: any, chordB: any, min?: boolean): any;
export declare function voicingMovement(chordA: any, chordB: any, min?: boolean, direction?: intervalDirection): any;
export declare function mapTree(tree: any, modifier?: any, simplify?: boolean, path?: any[], siblings?: any[], position?: number): any;
export declare function flattenTree(tree: any): any[];
export declare function expandTree(tree: any): void;
export declare function chordHasIntervals(chord: any, intervals: any): any;
export declare function isDominantChord(chord: any): any;
export declare function isMajorChord(chord: any): any;
export declare function isMinorChord(chord: any): any;
export declare function isMinorTonic(chord: any): any;
export declare function getChordType(chord: any): "minor" | "major" | "dominant" | "minor-tonic";
export declare function permutateArray(array: any): any;
export declare function permutateElements(array: any, validate?: any, path?: any[]): any;
export declare function permutationComplexity(array: any, validate?: any, path?: any[]): number;
export declare function validateInterval(validate: (interval: string, { path, next, array }: {
    path: any;
    next: any;
    array: any;
}) => boolean): (path: any, next: any, array: any) => boolean;
export declare function combineValidators(...validators: ((path: any, next: any, array: any) => boolean)[]): (path: any, next: any, array: any) => boolean;
export declare function voicingValidator(path: any, next: any, array: any): boolean;
export declare function getVoicingCombinations(notes: any, validator?: (path: any, next: any, array: any) => boolean): any;
export declare function bestCombination(notes: any, combinations: any): any;
export declare function sortCombinationsByMovement(notes: any, combinations: any, direction?: intervalDirection): any;
export declare function getChordNotes(chord: any, validate?: any): any;
export declare function validateWithoutRoot(note: any, { degree }: {
    degree: any;
}): boolean;
export declare function getVoicing(chord: any, { voices, previousVoicing, omitRoot, quartal }?: {
    previousVoicing?: string[];
    voices?: number;
    omitRoot?: boolean;
    quartal?: boolean;
}): any;
export declare function semitoneDistance(noteA: any, noteB: any): any;
export declare function getAllTensions(root: any): any[];
export declare function getAvailableTensions(chord: any): any;
export declare function getRequiredNotes(chord: any): any[];
export declare function getOptionalNotes(chord: any, required?: any): any;
export declare function getPossibleVoicings(chord: any, voices?: number): {
    required: any[];
    optional: any;
    tensions: any;
};
export declare function getVoices(chord: any, voices?: number, rootless?: boolean, tension?: number): any[];
export declare function getNextVoicing(chord: any, lastVoicing: any, range?: string[]): any;
export {};
