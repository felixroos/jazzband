/* import { Soundbank } from './Soundbank';
import { metronome } from './samples/metronome';

export class Metronome {
    soundbank: Soundbank;
    ready: Promise<any[]>;
    constructor(props: any = {}) {
        this.soundbank = new Soundbank({ preload: [metronome], context: props.context });
        this.ready = this.soundbank.preload;
    }
    bar(tick) {
        tick.pulse.tickArray([1, 1, 1, 1].slice(0, Math.floor(tick.cycle)), (t) => {
            this.soundbank.playSources([metronome], t.deadline);
        }, tick.length);
    }
} */