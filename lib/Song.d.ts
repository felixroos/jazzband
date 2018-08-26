export declare type Measure = {
    chords?: string[];
    signs?: string[];
    comments?: string[];
    house?: number;
    section?: string;
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
export declare function renderSheet(sheet: Sheet, unify?: boolean, current?: any): any;
