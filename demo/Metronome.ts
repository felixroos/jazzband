import { metronome } from './samples/metronome';
import jazz from '../dist';

export class Metronome {
    sampler: any;
    ready: Promise<any[]>;

    constructor(context) {
        this.sampler = new jazz.Sampler({ samples: [metronome], context });
        console.log('sampler', this.sampler);
        this.ready = this.sampler.ready;
    }
    count(pulse, bars = 1) {
        const count = new Array(bars).fill(
            [new Array(pulse.props.cycle).fill(1)]
        ).concat([1]);
        console.log('count', count);
        return new Promise((resolve, reject) => {
            pulse.tickArray(count, ({ path, deadline }) => {
                if (path[0] === bars) {
                    resolve();
                    return;
                }
                this.sampler.playSource(metronome, { deadline, gain: 1 });
            });
        })
    }
}