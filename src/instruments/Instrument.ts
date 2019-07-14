import { Pulse } from "../Pulse";
import { Harmony } from '../harmony/Harmony';

export interface NoteEvent {
  note: string;
  midi?: number;
  gain?: number;
  off?: number;
  deadline?: number;
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

  playNotes(notes: string[], settings: any = {}) {
    const deadline = (settings.deadline || this.context.currentTime);
    settings = Object.assign({
      duration: 2000,
      gain: 1,
    }, settings, { deadline });
    if (settings.interval) {
      // call recursively with single notes at interval
      return notes.map((note, index) => {
        this.playNotes([note], Object.assign({}, settings, {
          interval: 0,
          deadline: deadline + index * settings.interval
        }))
      });
    }
    const midi = notes.map(note => Harmony.getMidi(note, this.midiOffset));
    const noteOff = settings.deadline + settings.duration / 1000;

    const notesOn = notes.map((note, index) => ({
      note,
      midi: midi[index],
      gain: settings.gain,
      noteOff,
      deadline: settings.deadline
    }));

    if (settings.pulse && this.onTrigger) {
      settings.pulse.clock.callbackAtTime((deadline) => {
        this.activeEvents = this.activeEvents.concat(notesOn);
        this.onTrigger({ on: notesOn, off: [], active: this.activeEvents });
      }, settings.deadline);
    }
    if (settings.duration && settings.pulse) {
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
    return this.playKeys(midi, settings);
  }

  playKeys(keys: number[], settings?) {
    // TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
  }
}