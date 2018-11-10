import { Instrument } from "../instruments/Instrument";

export class Musician {
    ready: Promise<any>;
    gain = 1;
    instrument: Instrument;
    constructor(instrument) {
        if (!instrument) {
            console.warn('musician has no instrument', this);
        }
        this.instrument = instrument;
        this.ready = this.instrument ? this.instrument.ready : Promise.resolve();
    }
    play({ pulse, measures, settings }) {
        console.log('play..', pulse, measures, settings);
    }

    getGain(value = 1) {
        return value * this.gain * this.instrument.gain;
    }
}