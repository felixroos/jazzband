import { Instrument } from './Instrument';
export declare class Synthesizer extends Instrument {
    duration: number;
    type: string;
    gain: number;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    constructor(props: any);
    init(context: any): void;
    getVoice(type?: string, gain?: number, frequency?: number): {
        oscNode: any;
        gainNode: any;
    };
    lowestGain(a: any, b: any): 0 | -1;
    playKeys(keys: number[], settings?: any): void;
}
