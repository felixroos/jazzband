import { Leadsheet } from './Sheet';
import * as Tone from 'tone';
import { SequenceOptions, SequenceEvent } from './Sequence';
export declare type noteTrigger = (time: any, duration?: any) => any;
declare interface Tone {
    [key: string]: any;
}
export declare class SheetPlayer {
    static parts: any[];
    static instruments: any[];
    static realPiano: any;
    static realDrums: any;
    static getSequence(sheet: any, options?: SequenceOptions): {
        chord: string;
        path: number[];
        measure: import("./Measure").RenderedMeasure;
    }[][];
    static play(sheet: any): Promise<any[]>;
    static playParts(parts: any): any[];
    static stop(): void;
    static playMelody(sheet: any): Promise<Tone.Sequence>;
    static playDrums(sheet: any, options?: SequenceOptions): Promise<Tone.Sequence[]>;
    static renderSheetPart(sheet: Leadsheet): Promise<Tone.Part>;
    static getPart(events: SequenceEvent[], callback: (time: number, event: SequenceEvent) => void): Tone.Part;
    static playSheet(sheet: Leadsheet): Promise<Tone.Part>;
    static playChords(sheet: any): Promise<Tone.Sequence>;
    static playBass(sheet: any): Promise<Tone.Sequence>;
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
