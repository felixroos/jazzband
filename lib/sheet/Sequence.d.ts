import { VoiceLeadingOptions } from '../harmony/Voicing';
import { SheetState, Leadsheet, Measures } from './Sheet';
export interface SequenceEvent {
    path: number[];
    value: any;
    chord?: string;
    divisions?: number[];
    fraction?: number;
    duration?: number;
    velocity?: number;
    time?: number;
    voicings?: VoiceLeadingOptions;
}
export declare type EventModifier = (event: SequenceEvent, index: number, events: SequenceEvent[], options: SequenceOptions) => SequenceEvent;
export declare type EventMap = (options: SequenceOptions) => (event: SequenceEvent, index?: number, events?: SequenceEvent[]) => SequenceEvent;
export declare type EventReduce = (options: SequenceOptions) => (events: SequenceEvent[], event: SequenceEvent, index?: number, originalEvents?: SequenceEvent[]) => SequenceEvent[];
export declare type EventFilter = (options: SequenceOptions) => (event: SequenceEvent, index?: number, events?: SequenceEvent[]) => boolean;
export interface SequenceOptions extends VoiceLeadingOptions, SheetState {
    arpeggio?: boolean;
    bell?: boolean;
    pedal?: boolean;
    tightMelody?: boolean;
    real?: boolean;
    bpm?: number;
    fermataLength?: number;
    duckMeasures?: number;
    start?: number;
    swing?: number;
    swingSubdivision?: string;
    dynamicVelocityRange?: number[];
    dynamicVelocity?: EventModifier;
    phantomMelody?: boolean;
    humanize?: {
        velocity?: number;
        time?: number;
        duration?: number;
    };
    voicings?: VoiceLeadingOptions;
}
export declare class Sequence {
    static fraction(divisions: number[], whole?: number): number;
    static time(divisions: number[], path: any, whole?: number): number;
    static simplePath(path: any): any;
    static haveSamePath(a: SequenceEvent, b: SequenceEvent): boolean;
    static getSignType(symbol: string): string;
    static getEvents(events: SequenceEvent[], whole?: number): {
        velocity: number;
        duration: number;
        time: number;
        path: number[];
        value: any;
        chord?: string;
        divisions?: number[];
        fraction?: number;
        voicings?: VoiceLeadingOptions;
    }[];
    static renderEvents(measures: Measures, options: SequenceOptions, inOut?: boolean): SequenceEvent[];
    static prolongNotes: EventReduce;
    static renderVoicings: EventReduce;
    static duckChordEvent: EventMap;
    static humanizeEvent: EventMap;
    static velocityFromIndex: EventMap;
    static velocityFromPitch: EventMap;
    static addDynamicVelocity: EventMap;
    static addSwing: EventReduce;
    static removeDuplicates: EventFilter;
    static render(sheet: Leadsheet): any[];
}
