import { VoiceLeadingOptions } from '../harmony/Voicing';
import { SheetState, Leadsheet, Measures } from './Sheet';
import { RenderedMeasure } from './Measure';
export interface SequenceEvent {
    path: number[];
    value: any;
    chord?: string;
    divisions?: number[];
    fraction?: number;
    duration?: number;
    velocity?: number;
    time?: number;
    options?: SequenceOptions;
    measure?: RenderedMeasure;
}
export declare type EventModifier = (event: SequenceEvent, index: number, events: SequenceEvent[], options: SequenceOptions) => SequenceEvent;
export declare type EventMap = (options: SequenceOptions) => (event: SequenceEvent, index?: number, events?: SequenceEvent[]) => SequenceEvent;
export declare type EventReduce = (options?: SequenceOptions) => (events: SequenceEvent[], event: SequenceEvent, index?: number, originalEvents?: SequenceEvent[]) => SequenceEvent[];
export declare type EventFilter = (options?: SequenceOptions) => (event: SequenceEvent, index?: number, events?: SequenceEvent[]) => boolean;
export interface SequenceOptions extends SheetState {
    logging?: boolean;
    arpeggio?: boolean;
    bell?: boolean;
    pedal?: boolean;
    tightMelody?: boolean;
    real?: boolean;
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
    feel?: number;
    pulses?: number;
    bpm?: number;
    filterEvents?: (event: SequenceEvent, index: number) => boolean;
    mapEvents?: (event: SequenceEvent, index: number) => SequenceEvent;
}
export declare class Sequence {
    static fraction(divisions: number[], whole?: number): number;
    static time(divisions: number[], path: any, whole?: number): number;
    static simplePath(path: any): any;
    static haveSamePath(a: SequenceEvent, b: SequenceEvent): boolean;
    static getSignType(symbol: string): string;
    static getOptions(options: SequenceOptions): {
        logging?: boolean;
        arpeggio?: boolean;
        bell?: boolean;
        pedal?: boolean;
        tightMelody?: boolean;
        real?: boolean;
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
        feel?: number;
        pulses?: number;
        bpm: number;
        filterEvents?: (event: SequenceEvent, index: number) => boolean;
        mapEvents?: (event: SequenceEvent, index: number) => SequenceEvent;
        measures?: RenderedMeasure[];
        index?: number;
        sheet?: import("./Measure").MeasureOrString[];
        jumps?: {
            [key: number]: number;
        };
        visits?: {
            [key: number]: number;
        };
        nested?: boolean;
        fallbackToZero?: boolean;
        forms?: number;
        totalForms?: number;
        firstTime?: boolean;
        lastTime?: boolean;
        property?: string;
    };
    static testEvents: (props: string[]) => (event: any) => any;
    static addLatestOptions: EventReduce;
    static addTimeAndDuration: EventReduce;
    static prolongNotes: EventReduce;
    static renderVoicings: EventReduce;
    static addFermataToEnd: EventMap;
    static renderBass: EventReduce;
    static duckChordEvent: EventMap;
    static humanizeEvent: EventMap;
    static velocityFromIndex: EventMap;
    static velocityFromPitch: EventMap;
    static addDynamicVelocity: EventMap;
    static addSwing: EventReduce;
    static inOut: EventFilter;
    static removeDuplicates: EventFilter;
    static renderGrid(measures: Measures, options?: SequenceOptions): SequenceEvent[];
    static renderMeasures(measures: Measures, options?: SequenceOptions): SequenceEvent[];
    static renderEvents(events: SequenceEvent[], options?: SequenceOptions): SequenceEvent[];
    static render(sheet: Leadsheet): any[];
}
