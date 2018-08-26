import { getMidi } from "../util";

export interface NoteEvent {
    note: string;
    gain?: number;
    off?: number;
}

export class Instrument {
    midiOffset = 0;
    onTrigger: (events: { on: NoteEvent[], off: NoteEvent[], active: NoteEvent[] }) => any;
    ready: Promise<any>;
    gain = 1;

    activeEvents = [];
    context: any;
    mix: any;
    constructor({ context, gain, mix, onTrigger, midiOffset }: any = {}) {
        this.onTrigger = onTrigger;
        this.midiOffset = midiOffset || this.midiOffset;
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
        const midi = notes.map(note => getMidi(note, this.midiOffset));
        this.playKeys(midi, settings);
        const noteOff = settings.deadline + settings.duration / 1000;

        const notesOn = notes.map(note => ({ note, gain: settings.gain, noteOff }));
        this.activeEvents = this.activeEvents.concat(notesOn);

        if (this.onTrigger) {
            this.onTrigger({ on: notesOn, off: [], active: this.activeEvents });
        }
        if (settings.duration) {
            settings.pulse.clock.callbackAtTime((deadline) => {
                // find out which notes need to be deactivated
                const notesOff = notes
                    .filter(note => !this.activeEvents
                        .find(event => {
                            const keep = note === event.note && event.noteOff > deadline;
                            if (keep) {
                                console.log('keep', note);
                            }
                            return keep;
                        })).map(note => this.activeEvents.find(e => e.note === note));

                this.activeEvents = this.activeEvents
                    .filter(e => !notesOff.includes(e));

                if (this.onTrigger) {
                    this.onTrigger({ on: [], off: notesOff, active: this.activeEvents });
                }
            }, noteOff);

        }
    }

    playKeys(keys: number[], settings?) {
        // TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
    }
}