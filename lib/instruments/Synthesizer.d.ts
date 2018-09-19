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
    getVoice(type: string, gain: number, key: any): {
        oscNode: any;
        gainNode: any;
        key: any;
        frequency: any;
    };
    lowestGain(a: any, b: any): 0 | -1;
    startKeys(keys: number[], settings?: any): void;
    playKeys(keys: number[], settings?: any): {
        oscNode: any;
        gainNode: any;
        key: any;
        frequency: any;
    }[];
    stopVoice(voice: any, settings?: any): void;
    stopVoices(voices: any, settings: any): void;
}
