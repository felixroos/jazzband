import { Instrument } from './Instrument';
export declare class Sampler extends Instrument {
    buffers: {};
    context: AudioContext;
    overlap: any;
    samples: Promise<any[]>;
    sources: any;
    gainNode: GainNode;
    duration: number;
    type: string;
    gain: number;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    constructor(options?: any);
    getBuffer(src: any, context?: AudioContext): Promise<any>;
    getSource(buffer: any, connect?: any): AudioBufferSourceNode;
    getSources(sources: any, context?: AudioContext): any;
    loadSource(src: any, context?: AudioContext): Promise<AudioBufferSourceNode>;
    loadSources(sources: any, context?: AudioContext): Promise<[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]>;
    hasLoaded(sources: any, context?: AudioContext): any;
    playSounds(sounds: any, deadline?: number, interval?: number): void;
    playSource(source: any, settings: any): void;
    playKeys(keys: number[], settings: any): void;
}
