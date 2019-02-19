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
    static comp(sheet: any, { bass, piano, maxVoices, rootless }: {
        bass: any;
        piano: any;
        maxVoices: any;
        rootless: any;
    }): any;
    static getBass(): any;
    static getPiano(voices?: number): any;
    static getLead(): any;
}
