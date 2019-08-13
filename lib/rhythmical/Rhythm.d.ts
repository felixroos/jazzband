import { Fraction } from './Fractions';
export interface NestedRhythm<T> extends Array<T | NestedRhythm<T>> {
}
export declare type RhythmEvent<T> = {
    path: number[];
    divisions?: number[];
    value: T;
};
export declare type RhythmBrick = {
    body: NestedRhythm<number>;
    offset?: number;
};
export declare type EventPath = Fraction[];
export declare type FlatEvent<T> = {
    value: T;
    path: EventPath;
    length?: number;
};
export interface TimedEvent<T> extends FlatEvent<T> {
    time: number;
    duration: number;
}
export declare type EventMapFn<T> = (event: FlatEvent<T>) => TimedEvent<T>;
export declare class Rhythm {
    static from<T>(body: T | NestedRhythm<T>): NestedRhythm<T>;
    static duration(path: EventPath, whole?: number): number;
    static time(path: EventPath, whole?: number): number;
    static oldDuration(divisions: number[], whole?: number): number;
    static oldTime(divisions: number[], path: any, whole?: number): number;
    static addPaths(a: number[], b: number[], divisions?: number[]): number[];
    /** recalculates path inside given divisions */
    static overflow(path: number[], divisions: number[]): number[];
    static calculate<T>(totalLength?: number): EventMapFn<T>;
    static useValueAsDuration(event: TimedEvent<number>): TimedEvent<number>;
    static useValueAsLength(event: FlatEvent<number>): FlatEvent<number>;
    static render<T>(rhythm: NestedRhythm<T>, length?: number, useValueAsLength?: boolean): TimedEvent<T>[];
    static spm(bpm: any, pulse: any): number;
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
    static flatten<T>(tree: NestedRhythm<T>, path?: number[], divisions?: number[]): RhythmEvent<T>[];
    static isValid<T>(items: RhythmEvent<T>[]): boolean;
    static nest<T>(items: RhythmEvent<T>[], fill?: any): NestedRhythm<T>;
    /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten. */
    static expand<T>(items: RhythmEvent<T>[]): NestedRhythm<T>;
    static pathOf(value: any, tree: any): number[] | undefined;
    static simplePath(path: any): any;
    static haveSamePath(a: RhythmEvent<any>, b: RhythmEvent<any>): boolean;
    static haveSameSlot(a: RhythmEvent<any>, b: RhythmEvent<any>): boolean;
    static getPath<T>(tree: any, path: any, withPath?: boolean, flat?: RhythmEvent<T>[]): any | RhythmEvent<T>;
    static addPulse<T>(rhythm: NestedRhythm<T>, pulse: number, offset?: number): NestedRhythm<T>;
    static removePulse<T>(rhythm: NestedRhythm<T>): NestedRhythm<T>;
    static nextItem<T>(tree: any, path: any, move?: number, withPath?: boolean, flat?: RhythmEvent<T>[]): any | RhythmEvent<T>;
    static nextValue(tree: any, value: any, move?: number): any | undefined;
    static nextPath(tree: any, path?: any, move?: number): any | undefined;
    static getBlock(length: any, position: any, pulse?: number): NestedRhythm<number>;
    addGroove(items: string[], pulse?: number): {
        [item: string]: NestedRhythm<number>;
    };
    /**
     * NEW SYNTAX
     */
    static multiplyDivisions(divisions: number[], factor: number): number[];
    static multiplyPath(path: number[], divisions: number[], factor: number): number[];
    static multiplyEvents(rhythm: FlatEvent<number>[], factor: number): FlatEvent<number>[];
    static divideEvents(rhythm: FlatEvent<number>[], factor: number): FlatEvent<number>[];
    static multiply(rhythm: NestedRhythm<number>, factor: number): NestedRhythm<number>;
    static divide(rhythm: NestedRhythm<number>, divisor: number): NestedRhythm<number>;
    static maxArray(array: any): any;
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
    static flat<T>(rhythm: NestedRhythm<T>, path?: EventPath): Array<FlatEvent<T>>;
    static nested<T>(items: FlatEvent<T>[], fill?: any): NestedRhythm<T>;
    static align(...paths: EventPath[]): EventPath[];
    static carry(a: EventPath): number[][];
    static add(a: EventPath, b: EventPath, cancel?: boolean): EventPath;
    static fixTopLevel<T>(events: FlatEvent<T>[]): FlatEvent<T>[];
    static shiftEvents<T>(events: FlatEvent<T>[], path?: EventPath): FlatEvent<T>[];
    static shift<T>(rhythm: NestedRhythm<T>, path: EventPath): NestedRhythm<T>;
    static groupEvents<T>(events: FlatEvent<T>[], pulse: any, offset?: number): FlatEvent<T>[];
    static group<T>(rhythm: NestedRhythm<T>, pulse: number, offset?: number): NestedRhythm<T>;
    static ungroupEvents<T>(events: FlatEvent<T>[]): FlatEvent<T>[];
    static ungroup<T>(rhythm: NestedRhythm<T>): NestedRhythm<T>;
    static combine<T>(source: NestedRhythm<T>, target: NestedRhythm<T>): NestedRhythm<T>;
    static combineEvents<T>(a: FlatEvent<T>[], b: FlatEvent<T>[]): FlatEvent<T>[];
    static isEqualPath(a: EventPath, b: EventPath): boolean;
    static insertEvents<T>(sourceEvents: FlatEvent<T>[], targetEvents: FlatEvent<T>[], beat?: number): FlatEvent<T>[];
    static insert<T>(source: NestedRhythm<T>, target: NestedRhythm<T>, beat?: number): NestedRhythm<T>;
    static migratePath(divisions: number[], path?: number[]): number[][];
}
