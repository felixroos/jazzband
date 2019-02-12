export declare type Measure = {
    chords?: string[];
    signs?: string[];
    comments?: string[];
    house?: number | number[];
    times?: number;
    section?: string;
    idle?: true;
};
export declare type MeasureOrString = Measure | string[] | string;
export declare type Sheet = Array<MeasureOrString>;
export declare type Song = {
    name: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    sheet: Sheet;
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
    sheet?: Sheet;
    jumps?: {
        [key: number]: number;
    };
    visits?: {
        [key: number]: number;
    };
    nested?: boolean;
    fallbackToZero?: boolean;
};
export declare function getMeasure(measure: MeasureOrString): Measure;
/** renderSheet2 */
export declare function hasSign(sign: any, measure: any): boolean;
export declare function hasHouse(measure: any, number?: any): boolean;
/** Starts at a given index, stops when the pair functions returned equally often */
export declare function findPair(sheet: any, index: number, pairs: Array<(measure?: Measure, options?: {
    sheet?: Sheet;
    index?: number;
}) => boolean>, move?: number, stack?: number): number;
export declare function getJumpSign(measure: any): JumpSign;
export declare function getJumpDestination(state: SheetState): number;
export declare function getBracePair({ sheet, index, fallbackToZero }: {
    sheet: Sheet;
    index: number;
    fallbackToZero?: boolean;
}): number;
export declare function canVisitHouse({ sheet, index, visits }: {
    sheet: any;
    index: any;
    visits: any;
}): boolean;
export declare function getNextHouseIndex({ sheet, index, visits }: {
    sheet: any;
    index: any;
    visits: any;
}, move?: number): number;
export declare function visitHouses({ sheet, index, visits }: {
    sheet: any;
    index: any;
    visits: any;
}): SheetState;
export declare function wipeKeys(numberMap: any, range: any): {
    [key: number]: number;
};
export declare function nextIndex(state: any): SheetState;
export declare function getRelatedHouse({ sheet, index }: {
    sheet: any;
    index: any;
}): number;
export declare function isFirstHouse({ sheet, index }: {
    sheet: any;
    index: any;
}): boolean;
export declare function getAllowedJumps({ sheet, index }: {
    sheet: any;
    index: any;
}): number;
export declare function readyForFineOrCoda({ sheet, index, jumps }: {
    sheet: any;
    index: any;
    jumps: any;
}): boolean;
export declare const jumpSigns: {
    [sign: string]: JumpSign;
};
export declare function hasJumpSign(measure: MeasureOrString): boolean;
export declare function shouldJump({ sheet, index, jumps }: SheetState): boolean;
export declare function nextMeasure(state: any): SheetState;
export declare function renderSheet(sheet: any, options?: {}): Sheet;
