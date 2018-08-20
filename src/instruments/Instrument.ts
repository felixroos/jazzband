import { getMidi } from "../util";

export class Instrument {
    midiOffset = 0;
    onPlay: (keys: number[]) => any;
    onStop: (keys: number[]) => any;
    ready: Promise<any>;
    gain = 1;

    context: any;
    mix: any;
    constructor({ context, gain, mix, onPlay, onStop, midiOffset }: any = {}) {
        this.onPlay = onPlay;
        this.midiOffset = midiOffset || this.midiOffset;
        this.onStop = onStop;
        this.gain = gain || this.gain;
        this.init({ context, mix });
    }

    init({ context, mix }) {
        if (!context && (!mix || !mix.context)) {
            console.warn(`you should pass a context or a mix (gainNode) to a new Instrument. 
            You can also Call init with {context,mix} to setup the Instrument later`);
            return;
        }
        this.context = context || mix.context;
        this.mix = mix || this.context.destination;
    }

    playNotes(notes: string[], settings) {
        this.playKeys(notes.map(note => getMidi(note, this.midiOffset)), settings);
    }

    playKeys(keys: number[], settings?) {
        if (this.onPlay) {
            return this.onPlay(keys);
        }
        // TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
    }
}