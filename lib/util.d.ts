import { Synthesizer } from './instruments/Synthesizer';
export declare function randomNumber(n: any): number;
export declare function arraySum(array: any): any;
export declare function randomElement(array: any, weighted?: any): any;
export declare function getTonalChord(chord: any): any;
export declare function getMidi(note: any, offset: any): number;
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
/** inverts the interval if it does not go to the desired direction */
export declare function forceDirection(interval: any, direction: intervalDirection): any;
export declare function minInterval(interval: any, direction?: intervalDirection, force?: any): any;
export declare function mapMinInterval(direction?: intervalDirection, force?: any): (interval: any) => any;
export declare function sortMinInterval(preferredDirection?: intervalDirection): (a: any, b: any) => number;
/** Returns the note with the least distance to "from" */
export declare function getNearestNote(from: any, to: any, direction?: intervalDirection, force?: boolean): any;
/** Returns the note with the least distance to "from" */
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
export declare function getStep(step: any): string;
export declare function getIntervalFromStep(step: any): string;
export declare function getChordScales(chord: any, group?: string): any;
export declare function pickChordScale(chord: any, group?: string): any;
export declare function findDegree(degree: any, intervals: any): any;
export declare function hasDegree(degree: any, intervals: any): boolean;
export declare function hasAllDegrees(degrees: any, intervals: any): any;
export declare function getScaleDegree(degree: any, scale: any): any;
export declare function getScalePattern(pattern: any, scale: any): any;
export declare function renderIntervals(intervals: any, root: any): any;
export declare function renderSteps(steps: any, root: any): any;
export declare function permutateIntervals(intervals: any, pattern: any): any;
export declare function getPatternInChord(pattern: any, chord: any): any;
export declare function getDigitalPattern(chord: any): any;
export declare function getGuideTones(chord: any): any;
export {};
