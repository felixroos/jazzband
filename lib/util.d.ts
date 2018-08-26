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
export declare function smallestInterval(interval: any): any;
export declare function minInterval(a: any, b: any, preferRightMovement: any): 1 | -1;
export declare function intervalMatrix(from: any, to: any): any;
export declare function randomSynth(mix: any, allowed?: string[]): Synthesizer;
export declare function adsr({ attack, decay, sustain, release, gain, duration }: {
    attack: any;
    decay: any;
    sustain: any;
    release: any;
    gain: any;
    duration: any;
}, time: any, param: any): void;
