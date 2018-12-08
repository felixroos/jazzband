import { Instrument } from './Instrument';
export declare class WebAudioFont extends Instrument {
    player: any;
    preset: any;
    midiOffset: number;
    constructor(props: any);
    cacheInstrument(n?: number): void;
    playKeys(keys: number[], settings?: any): void;
}
