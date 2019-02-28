export declare type intervalDirection = 'up' | 'down';
export declare type step = string | number;
export declare class Harmony {
    static isBlack(note: any): boolean;
    static hasSamePitch(noteA: any, noteB: any, ignoreOctave?: boolean): boolean;
    static getTonalChord(chord: string): any;
    static getBassNote(chord: string, ignoreSlash?: boolean): string;
    static getMidi(note: any, offset?: number): number;
    static intervalComplement(interval: any): any;
    static invertInterval(interval: any): string;
    /** Transforms interval into one octave (octave+ get octaved down) */
    static fixInterval(interval?: string, simplify?: boolean): string;
    /** inverts the interval if it does not go to the desired direction */
    static forceDirection(interval: any, direction: intervalDirection, noUnison?: boolean): any;
    static minInterval(interval: any, direction?: intervalDirection, noUnison?: any): any;
    static minIntervals(chordA: any, chordB: any): any;
    static mapMinInterval(direction?: intervalDirection): (interval: any) => any;
    static sortMinInterval(preferredDirection?: intervalDirection, accessor?: (i: any) => any): (a: any, b: any) => number;
    /** Returns the note with the least distance to "from" */
    static getNearestNote(from: any, to: any, direction?: intervalDirection): string;
    /** Returns the note with the least distance to "from". TODO: add range */
    static getNearestTargets(from: any, targets: any, preferredDirection?: intervalDirection, flip?: boolean): any;
    static intervalMatrix(from: any, to: any): any;
}
