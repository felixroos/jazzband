
import { randomElement, resolveChords, getTonalChord } from './util';
import { Musician } from './Musician';
import { Chord, Interval, Distance } from 'tonal';

export default class Bassist extends Musician {
    styles: { [key: string]: any };
    defaults = { style: 'Medium Swing' }

    constructor(props: any = {}) {
        super(props);
        this.styles = {
            'Funk': [{
                pattern: () =>
                    randomElement([
                        [[1, 0, 0, 5], [0, 1], 3, [0, 5]]]
                    )
            }],
            'Medium Swing': [{
                pattern: () =>
                    randomElement([
                        [1, randomElement([3, 5]), 1, randomElement([3, 5])],
                        /* [1, 2, 3, 4] */
                    ])
            }],
        };
    }

    play({ measures, pulse, settings }) {
        const style = this.styles[settings.style] || this.styles[this.defaults.style];
        style.forEach(track => {
            measures = measures
                .map(measure => track.pattern({ measure, settings, pulse }).slice(0, Math.floor(settings.cycle)))
                .map((pattern, i) => resolveChords(pattern, measures, [i]));
            pulse.tickArray(measures, (current) => {
                this.playBass(current, measures);
            });
        });
    }

    getStep(step, chord, octave = 2) {

        const tokens = Chord.tokenize(getTonalChord(chord));
        const interval = Chord.intervals(tokens[1]).find(i => parseInt(i[0]) === step);
        return Distance.transpose(tokens[0] + octave, interval);
    }

    playBass({ value, cycle, path, deadline, interval }, measures) {
        let note;
        const octave = 2;
        if (value.value === 1 && value.chord.split('/').length > 1) {
            note = value.chord.split('/')[1] + octave;
        } else {
            note = this.getStep(value.value, getTonalChord(value.chord), octave);
        }

        this.instrument.playNotes([note], { deadline, interval, gain: 0.7 });
    }
}