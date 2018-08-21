export declare class Instrument {
    midiOffset: number;
    onPlay: (keys: number[]) => any;
    onStop: (keys: number[]) => any;
    ready: Promise<any>;
    gain: number;
    context: any;
    mix: any;
    constructor({ context, gain, mix, onPlay, onStop, midiOffset }?: any);
    init({ context, mix }: {
        context: any;
        mix: any;
    }): void;
    playNotes(notes: string[], settings: any): void;
    playKeys(keys: number[], settings?: any): any;
}
