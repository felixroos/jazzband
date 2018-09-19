import { Instrument } from './Instrument';
import { Note } from 'tonal';

export class MidiOut extends Instrument {
    gain = 0.9;
    midi;
    output = 'Scarlett 6i6 USB';

    constructor(props: any) {
        super(props);
        this.gain = props.gain || this.gain;
        if (!navigator['requestMIDIAccess']) {
            console.warn('This browser does not support WebMIDI!');
            return;
        }
        navigator['requestMIDIAccess']().then((midi) => this.midiInit(midi), this.midiFail);
    }

    midiInit(midi) {
        console.log('midi init', midi);
        console.log(midi.outputs.size, 'outputs');
        console.log(midi.inputs.size, 'inputs');
        this.midi = midi;
        midi.outputs.forEach(output => {
            console.log('ouput', output);
        });
        midi.inputs.forEach(input => {
            console.log('input', input);
            input.onmidimessage = this.getMidiMessage;
        });
        this.onTrigger = ({ on, off }) => {
            on.forEach(({ midi, gain, deadline }) => {
                this.noteOn(midi, Math.round(gain * 127), deadline);
            });
            off.forEach(event => {
                this.noteOff(event.midi, Math.round(event.gain * 127));
            });
        }
    }

    midiFail() {
        console.warn('could not get midi access!');
    }

    getMidiMessage(message) {
        console.log('midi data', message.data, 'message', message);
    }

    send(message, deadline) {
        if (!this.midi) {
            console.warn('tried to play keys but midi was not ready');
            return;
        }
        console.log('send', message, deadline);

        this.midi.outputs.forEach(output => {
            if (true || output.name === this.output) {
                output.send(message);
            }
        });
    }

    noteOn(key, velocity = 127, deadline = 0) {
        this.send([144, key, 0x7f], deadline); //velocity
    }
    noteOff(key, velocity = 127, deadline = 0) {
        this.send([144, key, 0], deadline);//velocity
    }

    playKeys(keys: number[], settings: any = {}) {
        /* if (!this.midi) {
            console.warn('tried to play keys but midi was not ready');
            return;
        }
        this.midi.outputs.forEach(output => {
            console.log(keys, 'send to', output);
            keys.forEach(key => {
                output.send([144, key, 9]);
            })
        });
    } */
    }
}