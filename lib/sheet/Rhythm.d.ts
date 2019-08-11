export interface NestedRhythm<T> extends Array<T | NestedRhythm<T>> {
}
export declare type RhythmEvent<T> = {
    path: number[];
    divisions?: number[];
    value: T;
};
export interface TimedEvent<T> extends RhythmEvent<T> {
    time: number;
    duration: number;
}
export declare type EventMapFn<T> = (event: RhythmEvent<T>) => TimedEvent<T>;
export declare class Rhythm {
    static from<T>(body: T | NestedRhythm<T>): NestedRhythm<T>;
    static duration(divisions: number[], whole?: number): number;
    static time(divisions: number[], path: any, whole?: number): number;
    static calculate(whole?: number): EventMapFn<number>;
    static render(rhythm: NestedRhythm<number>, whole?: number): TimedEvent<number>[];
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
    static flatten<T>(tree: NestedRhythm<T>, path?: number[], divisions?: number[]): RhythmEvent<T>[];
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * If withPath is set to true, the values are turned to objects containing the nested path (FlatEvent).
     * You can then turn FlatEvent[] back to the original nested array with Measure.expand. */
    /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten (using withPath=true). */
    static expand<T>(items: RhythmEvent<T>[]): any[];
    static pathOf(value: any, tree: any): number[] | undefined;
    static simplePath(path: any): any;
    static haveSamePath(a: RhythmEvent<any>, b: RhythmEvent<any>): boolean;
    static getPath<T>(tree: any, path: any, withPath?: boolean, flat?: RhythmEvent<T>[]): any | RhythmEvent<T>;
    static nextItem<T>(tree: any, path: any, move?: number, withPath?: boolean, flat?: RhythmEvent<T>[]): any | RhythmEvent<T>;
    static nextValue(tree: any, value: any, move?: number): any | undefined;
    static nextPath(tree: any, path?: any, move?: number): any | undefined;
}
