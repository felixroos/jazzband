export declare type Measure = {
    chords?: string[];
    signs?: string[];
    comments?: string[];
    house?: number | number[];
    times?: number;
    section?: string;
    idle?: true;
};
export declare type Sheet = Array<Measure | string[] | string>;
export declare type Song = {
    name: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    sheet: Sheet;
};
export declare function getMeasure(measure: Measure | string[] | string): Measure;
/** renderSheet2 */
export declare function hasSign(sign: any, measure: any): any;
export declare function hasHouse(measure: any, number?: any): any;
/** Starts at a given index, stops when the pair functions returned equally often */
export declare function findPair(sheet: any, index: number, pairs: Array<(measure?: Measure, options?: {
    sheet?: Sheet;
    index?: number;
}) => boolean>, move?: number, stack?: number): number;
export declare function getBracePair(sheet: any, index: any, fallbackToZero?: boolean): number;
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
}): {
    visits?: undefined;
    index?: undefined;
} | {
    visits: any;
    index: number;
};
export declare function wipeKeys(numberMap: any, range: any): {};
export declare function nextIndex({ sheet, index, repeated }: {
    sheet: any;
    index: any;
    repeated: any;
}): {
    index: any;
    repeated?: undefined;
} | {
    index: any;
    repeated: any;
};
export declare function getRelatedHouse({ sheet, index }: {
    sheet: any;
    index: any;
}): number;
export declare function isFirstHouse({ sheet, index }: {
    sheet: any;
    index: any;
}): number;
export declare function getRepeatTimes({ sheet, index }: {
    sheet: any;
    index: any;
}): number;
export declare function shouldRepeat({ sheet, index, repeated }: {
    sheet: any;
    index: any;
    repeated: any;
}): boolean;
export declare function nextMeasure(state: any): any;
export declare function renderSheet(sheet: any): any[];
export declare function renderChordSnippet(snippet: any): any[];
export declare function formatForDiff(snippet: any): string;
export declare function formatChordSnippet(snippet: any, linebreaks?: boolean): string;
export declare function minifyChordSnippet(snippet: any, urlsafe?: boolean): string;
export declare function parseChordSnippet(snippet: any, simplify?: boolean): any[];
export declare function testFormat(sheet: any): any;
export declare function getChordSnippet(sheet: any, format?: boolean): string;
export declare function expandSnippet(snippet: any): string;
export declare function chordSnippetDiff(snippetA: any, snippetB: any): any;
/** renderSheet1 */
