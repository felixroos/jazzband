import { Soundbank } from "./Soundbank";
import { getMidi } from "./util";

export class Instrument {
    midiOffset = 0;
    onPlay: (keys: number[]) => any;
    onStop: (keys: number[]) => any;
    soundbank: Soundbank;
    ready: Promise<any>;
    samples: string[]; // array of sources
    constructor({ samples, context, onPlay, onStop, midiOffset }: any = {}) {
        this.onPlay = onPlay;
        this.midiOffset = midiOffset || this.midiOffset;
        this.onStop = onStop;
        this.samples = samples;
        this.init(context);
    }

    init(context) {
        if (!context) {
            console.warn(`you should pass a context to a new Instrument. 
            You can also Call init with a context to setup the Instrument later`);
            return;
        }
        if (this.samples) {
            this.soundbank = new Soundbank({
                context,
                preload: this.samples,
                onTrigger: (indices) => {
                    if (this.onPlay) {
                        this.onPlay(indices);
                    }
                }, onStop: (indices) => {
                    if (this.onPlay) {
                        this.onStop(indices);
                    }
                }
            });
        }
    }

    playNotes(notes: string[], settings) {
        this.playKeys(notes.map(note => getMidi(note, this.midiOffset)), settings);
    }

    playKeys(keys: number[], settings) {
        if (this.onPlay) {
            return this.onPlay(keys);
        }
        if (this.soundbank) {
            keys.map(key => {
                this.soundbank.playSource(this.soundbank.sources[key], settings);
            });
        }
    }
}