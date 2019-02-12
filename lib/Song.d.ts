
export declare type Measure = {
    chords?: string[];
    signs?: string[];
    comments?: string[];
    house?: number;
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
    sheet: Leadsheet;
};
export declare function getMeasure(measure: Measure | string[] | string): Measure;
export declare function getLatestMeasure(index: any, sheet: any): any;
export declare function renderSheet(sheet: Leadsheet, current?: any): any;
