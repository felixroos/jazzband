import { Measure, MeasureOrString, RenderedMeasure } from './Measure';
import { SequenceOptions, SequenceEvent } from './Sequence';
export declare type Measures = Array<MeasureOrString>;
export declare type Leadsheet = {
    name?: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    measures?: Measures;
    chords?: Measures;
    melody?: Measures;
    renderedChords?: SequenceEvent[];
    renderedMelody?: SequenceEvent[];
    options?: SequenceOptions;
};
export declare type JumpSign = {
    pair?: string;
    move?: number;
    fine?: boolean;
    validator?: (state: any) => boolean;
};
export declare type SheetState = {
    measures?: RenderedMeasure[];
    index?: number;
    sheet?: Measures;
    jumps?: {
        [key: number]: number;
    };
    visits?: {
        [key: number]: number;
    };
    nested?: boolean;
    fallbackToZero?: boolean;
    forms?: number;
    totalForms?: number;
    firstTime?: boolean;
    lastTime?: boolean;
    property?: string;
};
export declare class Sheet implements Leadsheet {
    name?: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    measures?: Measures;
    chords?: Measures;
    melody?: Measures;
    options?: SequenceOptions;
    static jumpSigns: {
        [sign: string]: JumpSign;
    };
    static sequenceSigns: {
        rest: string[];
        prolong: string[];
        repeat: string[];
    };
    constructor(sheet: Leadsheet);
    static from(sheet: Leadsheet): {
        options: {
            humanize: {
                velocity: number;
                time: number;
                duration: number;
            };
            voicings: {
                range: string[];
                maxVoices: number;
                forceDirection?: import("../harmony/Harmony").intervalDirection;
                forceBestPick?: boolean;
                rangeBorders: number[];
                logging: boolean;
                idleChance: number;
                logIdle?: boolean;
                maxDistance: number;
                minBottomDistance: number;
                minDistance?: number;
                minTopDistance: number;
                topNotes?: string[];
                topDegrees?: number[];
                bottomNotes?: string[];
                bottomDegrees?: number[];
                omitNotes?: string[];
                validatePermutation?: (path: string[], next: string, array: string[]) => boolean;
                sortChoices?: (choiceA: any, choiceB: any) => number;
                filterChoices?: (choice: any) => boolean;
                noTopDrop?: boolean;
                noTopAdd?: boolean;
                noBottomDrop?: boolean;
                noBottomAdd?: boolean;
                root?: string;
            };
            logging?: boolean;
            arpeggio: boolean;
            bell: boolean;
            pedal: boolean;
            tightMelody: boolean;
            real: boolean;
            fermataLength: number;
            duckMeasures: number;
            start?: number;
            swing: number;
            swingSubdivision?: string;
            dynamicVelocityRange?: number[];
            dynamicVelocity?: import("./Sequence").EventModifier;
            phantomMelody?: boolean;
            feel: number;
            pulses: number;
            bpm: number;
            filterEvents?: (event: SequenceEvent, index: number) => boolean;
            mapEvents?: (event: SequenceEvent, index: number) => SequenceEvent;
            measures?: RenderedMeasure[];
            index?: number;
            sheet?: MeasureOrString[];
            jumps?: {
                [key: number]: number;
            };
            visits?: {
                [key: number]: number;
            };
            nested?: boolean;
            fallbackToZero?: boolean;
            forms: number;
            totalForms?: number;
            firstTime?: boolean;
            lastTime?: boolean;
            property?: string;
        };
        name?: string;
        composer?: string;
        style?: string;
        bpm?: number;
        repeats?: number;
        key?: string;
        measures?: MeasureOrString[];
        chords?: MeasureOrString[];
        melody?: MeasureOrString[];
        renderedChords?: SequenceEvent[];
        renderedMelody?: SequenceEvent[];
    };
    static render(sheet: MeasureOrString[], options?: SheetState): RenderedMeasure[];
    static nextMeasure(state: SheetState): SheetState;
    static nextIndex(state: any): SheetState;
    static newForm(state: any): SheetState;
    static nextForm(state: any, force?: boolean): SheetState;
    static nextSection(state: SheetState): SheetState;
    /** Starts at a given index, stops when the pair functions returned equally often */
    static findPair(sheet: any, index: number, pairs: Array<(measure?: Measure, options?: {
        sheet?: Measures;
        index?: number;
    }) => boolean>, move?: number, stack?: number): number;
    static findMatch(sheet: any, index: number, find: (measure?: Measure, options?: {
        sheet?: Measures;
        index?: number;
    }) => boolean, move?: number): number;
    static getJumpDestination(state: SheetState): number;
    static getBracePair({ sheet, index, fallbackToZero }: {
        sheet: Measures;
        index: number;
        fallbackToZero?: boolean;
    }): number;
    static canVisitHouse({ sheet, index, visits }: {
        sheet: any;
        index: any;
        visits: any;
    }): boolean;
    static getNextHouseIndex({ sheet, index, visits }: {
        sheet: any;
        index: any;
        visits: any;
    }, move?: number): number;
    static getNextSectionIndex({ sheet, index }: {
        sheet: any;
        index: any;
    }, move?: number): number;
    static wipeKeys(numberMap: any, range: any): {
        [key: number]: number;
    };
    static getRelatedHouse({ sheet, index }: {
        sheet: any;
        index: any;
    }): number;
    static isFirstHouse({ sheet, index }: {
        sheet: any;
        index: any;
    }): boolean;
    static getAllowedJumps({ sheet, index }: {
        sheet: any;
        index: any;
    }): number;
    static readyForFineOrCoda({ sheet, index, jumps, lastTime }: SheetState, move?: number): boolean;
    static shouldJump({ sheet, index, jumps, lastTime }: SheetState): boolean;
    static transpose(sheet: Leadsheet, interval: any): Leadsheet;
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * If withPath is set to true, the values are turned to objects containing the nested path (FlatEvent).
     * You can then turn FlatEvent[] back to the original nested array with Measure.expand. */
    static flatten(tree: any[] | any, withPath?: boolean, path?: number[], divisions?: number[]): SequenceEvent[];
    /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten (using withPath=true). */
    static expand(items: SequenceEvent[]): any[];
    static pathOf(value: any, tree: any): number[] | undefined;
    static getPath(tree: any, path: any, withPath?: boolean, flat?: SequenceEvent[]): any | SequenceEvent;
    static nextItem(tree: any, path: any, move?: number, withPath?: boolean, flat?: SequenceEvent[]): any | SequenceEvent;
    static nextValue(tree: any, value: any, move?: number): any | undefined;
    static nextPath(tree: any, path?: any, move?: number): any | undefined;
    static randomItem(tree: any): any;
    static stringify(measures: MeasureOrString[], property?: string): string | any[];
    static obfuscate(measures: Measures, keepFirst?: boolean): Measure[];
}
