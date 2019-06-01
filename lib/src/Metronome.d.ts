import { Synthesizer } from './instruments/Synthesizer';
export declare class Metronome {
    sampler: any;
    ready: Promise<any[]>;
    synth: Synthesizer;
    constructor(mix: any);
    count(pulse: any, bars?: number): any;
}
