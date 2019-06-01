import { Measure, MeasureOrString } from './Measure';
import { VoiceLeadingOptions } from '../harmony/Voicing';
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
    position?: number[];
};
export declare type JumpSign = {
    pair?: string;
    move?: number;
    fine?: boolean;
    validator?: (state: any) => boolean;
};
export declare type SheetState = {
    measures?: [];
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
    firstTime?: boolean;
    lastTime?: boolean;
};
export interface ItemWithPath {
    path: number[];
    value: any;
    divisions?: number[];
    fraction?: number;
    position?: number;
}
export interface SequencOptions extends VoiceLeadingOptions {
    arpeggio?: boolean;
    bell?: boolean;
    pedal?: boolean;
}
export declare class Sheet {
    static jumpSigns: {
        [sign: string]: JumpSign;
    };
    static render(sheet: any, options?: {}, clear?: boolean): Measures;
    static nextMeasure(state: any): SheetState;
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
    static fraction(divisions: any, whole?: number): any;
    static position(divisions: any, path: any, whole?: number): any;
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * If withPath is set to true, the values are turned to objects containing the nested path (ItemWithPath).
     * You can then turn ItemWithPath[] back to the original nested array with Measure.expand. */
    static flatten(tree: any[] | any, withPath?: boolean, path?: number[], divisions?: number[]): ItemWithPath[];
    /** Turns a flat ItemWithPath array to a (possibly) nested Array of its values. Reverts Measure.flatten (using withPath=true). */
    static expand(items: ItemWithPath[]): any[];
    static pathOf(value: any, tree: any): number[] | undefined;
    static getPath(tree: any, path: any, withPath?: boolean, flat?: ItemWithPath[]): any | ItemWithPath;
    static nextItem(tree: any, path: any, move?: number, withPath?: boolean, flat?: ItemWithPath[]): any | ItemWithPath;
    static nextValue(tree: any, value: any, move?: number): any | undefined;
    static nextPath(tree: any, path?: any, move?: number): any | undefined;
    static randomItem(tree: any): any;
    static stringify(measures: MeasureOrString[], property?: string): string | any[];
    static obfuscate(measures: Measures, keepFirst?: boolean): Measure[];
    static getSequence({ melody, chords }: Leadsheet, settings?: SequencOptions): any[];
}
