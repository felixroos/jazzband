
import { Soundbank } from './Soundbank';
import { randomElement } from './util';
import { kick, snare, hihat, ride } from './samples/drumset.js';

export class Drummer {
    style: string;
    soundbank: Soundbank;
    ready: Promise<any[]>;
    styles: any;

    constructor(props: any = {}) {
        this.styles = {
            'Funk': [
                {
                    sounds: [kick],
                    pattern: (t) => [1, 0, [0, 1], 1]
                },
                {
                    sounds: [snare],
                    pattern: (t) => [0, 1, 0, 1]
                },
                {
                    sounds: [hihat],
                    pattern: (t) => [[0, 1], [0, 1], [0, 1], [0, 1]]
                }
            ],
            'Medium Swing': [
                {
                    sounds: [ride],
                    pattern: (t) => randomElement([
                        [1, [1, 0, 1], 1, [1, 0, 1]],
                        [1, [0, 0, 1], 1, [0, 0, 1],],
                        [1, 1, [1, 0, 1], 1],
                        [1, 1, 1, [1, 0, 1]],
                    ], [3, 2, 1, 2])
                },
                {
                    sounds: [hihat],
                    pattern: (t) => [0, 1, 0, 1]
                }
            ]
        };
        this.style = 'Medium Swing';
        this.soundbank = new Soundbank({ preload: [kick, snare, hihat, ride], context: props.context });
        this.ready = this.soundbank.preload;
    }
    bar(tick) {
        this.styles[this.style].forEach(track => {
            const pattern = track.pattern(tick).slice(0, Math.floor(tick.cycle));
            tick.pulse.tickArray(pattern, (t) => {
                this.soundbank.playSources(track.sounds, t.deadline);
            }, tick.length);
        });
    }

    /* bars(n,bpm) {
        this.styles[this.style].forEach(track => {
            const pattern = new Array(n).fill(0)
                .reduce((p, n) => p.concat(track.pattern(tick).slice(0, Math.floor(tick.cycle))), []);

            tick.pulse.tickArray(pattern, (t) => {
                this.soundbank.playSources(track.sounds, t.deadline);
            }, tick.length * n);
        });
    } */
}