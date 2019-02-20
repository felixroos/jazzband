import { VoiceLeadingOptions } from '../harmony/Voicing';
export declare interface SheetPlayerOptions extends VoiceLeadingOptions {
    /** If true, a new voicing will not attack notes that stayed since the last voicing */
    pedal?: boolean;
    /** If true, "real" instruments will be used */
    real?: boolean;
}
export declare class SheetPlayer {
    static parts: any[];
    static instruments: any[];
    static realPiano: any;
    static getSequence(sheet: any): {
        chord: string;
        path: number[];
        measure: import("./Measure").MeasureOrString;
    }[][];
    static play(sheet: any, options?: SheetPlayerOptions): Promise<void>;
    static stop(): void;
    static melody(sequence: any): any;
    static comp(sheet: any, options?: SheetPlayerOptions): Promise<any>;
    static attackAll(notes: any, instrument: any, time?: number): void;
    static releaseAll(notes: any, instrument: any, time?: number): void;
    static getAttackRelease(newNotes?: any[], oldNotes?: any[], pedal?: boolean): {
        attack: any[];
        release: any[];
    };
    static getBass(real?: boolean): any;
    static getPiano(voices?: number, real?: boolean): any;
    static getRealPiano(): any;
    static getLead(): any;
}
