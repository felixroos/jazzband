import { Instrument } from "./Instrument";
import { Kick } from "./Kick";
import { Snare } from "./Snare";

export class PlasticDrums extends Instrument {
    kick: Kick;
    snare: Snare;
    keys: any[];

    constructor(options) {
        super(options);
        this.keys = [
            new Kick(this.context),
            new Snare(this.context)
        ];
    }

    playKeys(keys, { deadline, gain, value }) {
        const sounds = keys.filter(key => !!this.keys[key]).map(key => this.keys[key]);
        if (sounds.length < keys.length) {
            const missing = keys.filter(key => !this.keys[key]);
            console.warn('PlasticDrums missing keys:', missing);
        }
        sounds.forEach(sound => sound.trigger(deadline));
    }
}