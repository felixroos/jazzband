import { Musician } from './Musician';
import { swing } from '../grooves/swing';
import { randomDelay } from '../util';

export default class Drummer extends Musician {
    set = {
        kick: 0,
        snare: 1,
        hihat: 2,
        ride: 3,
        crash: 4,
        rimshot: 5
    }
    defaults = { groove: swing }

    constructor(instrument) {
        super(instrument);
    }

    play({ measures, pulse, settings }) {
        const groove = settings.groove || this.defaults.groove;
        Object.keys(groove)
            .filter(t => Object.keys(this.set).includes(t)) // only use drum set patterns
            .forEach(key => {
                const patterns = measures
                    .map((measure, index) => groove[key]({ measures, index, measure, settings, pulse })
                        .slice(0, Math.floor(settings.cycle)));
                pulse.tickArray(patterns, ({ deadline, value }) => {
                    deadline += randomDelay(5);
                    this.instrument.playKeys([this.set[key]], { deadline, gain: value });
                }, settings.deadline);
            });
    }
}