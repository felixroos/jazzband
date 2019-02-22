import * as Tone from 'tone';
import { VoiceLeadingOptions } from '../harmony/Voicing';
export declare type noteTrigger = (time: any, duration?: any) => any;
declare interface Tone {
    [key: string]: any;
}
export declare interface SheetPlayerOptions extends VoiceLeadingOptions {
    /** If true, a new voicing will not attack notes that stayed since the last voicing */
    pedal?: boolean;
    /** If true, "real" instruments will be used */
    real?: boolean;
    start?: number;
    swing?: number;
    swingSubdivision?: string;
}
export declare class SheetPlayer {
    static parts: any[];
    static instruments: any[];
    static realPiano: any;
    static realDrums: any;
    static getSequence(sheet: any): {
        chord: string;
        path: number[];
        measure: import("./Measure").MeasureOrString;
    }[][];
    static play(sheet: any, options?: SheetPlayerOptions): Promise<void>;
    static playParts(parts: any): void;
    static stop(): void;
    static playMelody(sequence: any, options?: SheetPlayerOptions): Promise<Tone.Sequence>;
    static playDrums(sheet: any, options?: SheetPlayerOptions): Promise<Tone.Sequence[]>;
    static playChords(sheet: any, options?: SheetPlayerOptions): Promise<Tone.Sequence>;
    static playBass(sheet: any, options?: SheetPlayerOptions): Promise<Tone.Sequence>;
    static attackAll(notes: any, instrument: any, time?: number): void;
    static releaseAll(notes: any, instrument: any, time?: number): void;
    static getAttackRelease(newNotes?: any[], oldNotes?: any[], pedal?: boolean): {
        attack: string[];
        release: string[];
    };
    static getBass(real?: boolean): Promise<Tone.Instrument>;
    static getDrums(real?: boolean): Promise<{
        [sound: string]: noteTrigger;
    }>;
    static ride(): Promise<any>;
    static hihat(): Promise<any>;
    static getPiano(voices?: number, real?: boolean): Promise<Tone.Instrument>;
    static getRealPiano(): Promise<Tone.Instrument>;
    static getRealDrums(): Promise<Tone.Instrument>;
    static getSampler(samples: any, options: any): Promise<Tone.Instrument>;
    static getLead(real?: any): Tone.Instrument;
}
export {};
