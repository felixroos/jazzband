import { VoicingValidation } from '../harmony/Voicing';
export declare class SheetPlayer {
    static getSequence(sheet: any): {
        chord: string;
        path: number[];
        measure: import("./Measure").MeasureOrString;
    }[][];
    static play(sheet: any, options?: VoicingValidation): void;
    static melody(sequence: any): any;
    static comp(sheet: any, options?: VoicingValidation): any;
    static getBass(): any;
    static getPiano(voices?: number): any;
    static getLead(): any;
}
