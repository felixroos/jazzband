export interface NoteEvent {
    note: string;
    gain?: number;
    off?: number;
}
export declare class Instrument {
    midiOffset: number;
    onTrigger: (events: {
        on: NoteEvent[];
        off: NoteEvent[];
        active: NoteEvent[];
    }) => any;
    ready: Promise<any>;
    gain: number;
    activeEvents: any[];
    context: any;
    mix: any;
    constructor({ context, gain, mix, onTrigger, midiOffset }?: any);
    init({ context, mix }: {
        context: any;
        mix: any;
    }): void;
    playNotes(notes: string[], settings: any): void;
    playKeys(keys: number[], settings?: any): void;
}
