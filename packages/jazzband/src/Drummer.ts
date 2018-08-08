
import { randomElement } from './util';
import { Musician } from './Musician';

export default class Drummer extends Musician {
    styles: { [key: string]: any };
    set = {
        kick: 0,
        snare: 1,
        hihat: 2,
        ride: 3
    }
    defaults = { style: 'Medium Swing' }

    constructor(props: any = {}) {
        super(props);
        this.styles = {
            'Funk': [
                {
                    index: this.set.kick,
                    pattern: (t) => [[[1, .7], 0, [0, 1], 0]]
                },
                {
                    index: this.set.snare,
                    pattern: (t) => [0, 1, [0, .2, 0, 0], [1, 0, 0, .6]]
                },
                {
                    index: this.set.hihat,
                    pattern: (t) => [[.5, .6], [.4, .7], [.3, .6], [.5, .7]]
                }
            ],
            'Medium Swing': [
                {
                    index: this.set.ride,
                    pattern: () => randomElement([
                        [.6, [.9, 0, 1], .6, [.9, 0, 1]],
                        [.6, [.4, 0, 1], .8, [0, 0, 1],],
                        [.6, .9, [.6, 0, 1], 1],
                        [.6, .9, .6, [.9, 0, 1]],
                    ], [3, 2, 1, 2])
                },
                {
                    index: this.set.hihat,
                    pattern: () => [0, .8, 0, 1]
                }
            ]
        };
    }

    play({ measures, pulse, settings }) {
        const style = this.styles[settings.style] || this.styles[this.defaults.style];
        style.forEach(track => {
            const patterns = measures.map(measure => track.pattern({ measure, settings, pulse })
                .slice(0, Math.floor(settings.cycle)));
            pulse.tickArray(patterns, ({ deadline, value }) => {
                this.instrument.playKeys([track.index], { deadline, gain: value });
            });
        });
    }
}