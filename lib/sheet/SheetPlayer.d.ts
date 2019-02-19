export declare class SheetPlayer {
    static getSequence(sheet: any): {
        chord: string;
        path: number[];
        measure: import("./Measure").MeasureOrString;
    }[][];
    static play(sheet: any): void;
    static melody(sequence: any, { lead }: {
        lead: any;
    }): any;
    static comp(sheet: any, { bass, piano, maxVoices }: {
        bass: any;
        piano: any;
        maxVoices: any;
    }): any;
    static getBass(): any;
    static getPiano(): any;
    static getLead(): any;
}
