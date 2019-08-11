import { Measure, RenderedMeasure, Measures } from './Measure';
export declare type JumpSign<T> = {
    pair?: string;
    move?: number;
    fine?: boolean;
    validator?: (state: SheetState<T>) => boolean;
};
export declare type SheetState<T> = {
    measures?: RenderedMeasure<T>[];
    index?: number;
    sheet?: Measures<T>;
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
};
export declare class Sheet {
    static jumpSigns: {
        [sign: string]: JumpSign<any>;
    };
    static sequenceSigns: {
        rest: string[];
        prolong: string[];
        repeat: string[];
    };
    static render<T>(sheet: Measures<T>, options?: SheetState<T>): RenderedMeasure<T>[];
    static nextMeasure<T>(state: SheetState<T>): SheetState<T>;
    static nextIndex<T>(state: any): SheetState<T>;
    static newForm<T>(state: any): SheetState<T>;
    static nextForm<T>(state: any, force?: boolean): SheetState<T>;
    static nextSection<T>(state: SheetState<T>): SheetState<T>;
    /** Starts at a given index, stops when the pair functions returned equally often */
    static findPair<T>(sheet: any, index: number, pairs: Array<(measure?: Measure<T>, options?: {
        sheet?: Measures<T>;
        index?: number;
    }) => boolean>, move?: number, stack?: number): number;
    static findMatch<T>(sheet: any, index: number, find: (measure?: Measure<T>, options?: {
        sheet?: Measures<T>;
        index?: number;
    }) => boolean, move?: number): number;
    static getJumpDestination<T>(state: SheetState<T>): number;
    static getBracePair<T>({ sheet, index, fallbackToZero }: {
        sheet: Measures<T>;
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
    static readyForFineOrCoda<T>({ sheet, index, jumps, lastTime }: SheetState<T>, move?: number): boolean;
    static shouldJump<T>({ sheet, index, jumps, lastTime }: SheetState<T>): boolean;
    static stringify<T>(measures: Measures<T>): string | any[];
    static obfuscate(measures: Measures<string>, keepFirst?: boolean): Measure<string>[];
}
