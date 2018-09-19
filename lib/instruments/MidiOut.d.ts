import { Instrument } from './Instrument';
export declare class MidiOut extends Instrument {
    gain: number;
    midi: any;
    output: string;
    constructor(props: any);
    midiInit(midi: any): void;
    midiFail(): void;
    getMidiMessage(message: any): void;
    send(message: any, deadline: any): void;
    noteOn(key: any, velocity?: number, deadline?: number): void;
    noteOff(key: any, velocity?: number, deadline?: number): void;
    playKeys(keys: number[], settings?: any): void;
}
