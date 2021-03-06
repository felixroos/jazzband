import { Pulse } from './Pulse';
import { Musician } from './musicians/Musician';
import { Leadsheet } from './sheet/Sheet';
import { Metronome } from './Metronome';
/** Band */
export default class Band {
    props: any;
    pulse: Pulse;
    mix: any;
    musicians: Musician[];
    defaults: {
        cycle: number;
        division: number;
        transpose: number;
        style: string;
    };
    context: AudioContext;
    onMeasure: (measure: any, tick?: any) => {};
    metronome: Metronome;
    constructor({ context, musicians, onMeasure }?: any);
    setupMix(context: any): any;
    addMember(musician: any): void;
    ready(): Promise<any[]>;
    resume(): Promise<AudioContext>;
    comp(sheet: Leadsheet, settings: any): void;
    play(measures: any, settings: any): void;
    count(pulse: any, bars?: number): any;
}
