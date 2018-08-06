import { Soundbank } from './Soundbank';
import { metronomeUp } from './samples/metronome.js';

export class Metronome {
    soundbank: Soundbank;
    ready: Promise<[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]>;
    constructor(props: any = {}) {
        this.soundbank = new Soundbank({ preload: [metronomeUp], context: props.context });
        this.ready = this.soundbank.preload;
    }
    bar(tick) {
        tick.pulse.tickArray([1, 1, 1, 1].slice(0, Math.floor(tick.cycle)), (t) => {
            this.soundbank.playSources([metronomeUp], t.deadline);
        }, tick.length);
    }
}