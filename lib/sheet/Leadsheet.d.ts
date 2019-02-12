import { Measure, MeasureOrString } from './Measure';
export declare type Sheet = Array<MeasureOrString>;
export declare type Song = {
    name: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    sheet: Leadsheet;
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
    sheet?: Leadsheet;
    jumps?: {
        [key: number]: number;
    };
    visits?: {
        [key: number]: number;
    };
    nested?: boolean;
    fallbackToZero?: boolean;
};
export declare class Leadsheet {
    static jumpSigns: {
        [sign: string]: JumpSign;
    };
    static render(sheet: any, options?: {}): Leadsheet;
    static nextMeasure(state: any): SheetState;
    static nextIndex(state: any): SheetState;
    static visitHouses({ sheet, index, visits }: {
        sheet: any;
        index: any;
        visits: any;
    }): SheetState;
    /** Starts at a given index, stops when the pair functions returned equally often */
    static findPair(sheet: any, index: number, pairs: Array<(measure?: Measure, options?: {
        sheet?: Leadsheet;
        index?: number;
    }) => boolean>, move?: number, stack?: number): number;
    static getJumpDestination(state: SheetState): number;
    static getBracePair({ sheet, index, fallbackToZero }: {
        sheet: Leadsheet;
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
    static readyForFineOrCoda({ sheet, index, jumps }: {
        sheet: any;
        index: any;
        jumps: any;
    }): boolean;
    static shouldJump({ sheet, index, jumps }: SheetState): boolean;
}
