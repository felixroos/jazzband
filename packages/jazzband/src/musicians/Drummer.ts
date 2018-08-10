
import { randomElement } from '../util';
import { Musician } from './Musician';
import { funk } from '../grooves/funk';
import { swing } from '../grooves/swing';

export default class Drummer extends Musician {
    styles: { [key: string]: any };
    set = {
        kick: 0,
        snare: 1,
        hihat: 2,
        ride: 3,
        crash: 4
    }
    defaults = { style: 'Medium Swing' }

    constructor(instrument) {
        super(instrument);
        this.styles = {
            'Funk': { kick: funk.kick, snare: funk.snare, hihat: funk.hihat },
            'Medium Swing': { ride: swing.ride, hihat: swing.hihat }
        };
    }

    play({ measures, pulse, settings }) {
        const tracks = this.styles[settings.style] || this.styles[this.defaults.style];
        Object.keys(tracks).forEach(key => {
            const patterns = measures
                .map((measure, index) => tracks[key]({ measures, index, measure, settings, pulse })
                    .slice(0, Math.floor(settings.cycle)));
            pulse.tickArray(patterns, ({ deadline, value }) => {
                this.instrument.playKeys([this.set[key]], { deadline, gain: value });
            });
        });
    }
}