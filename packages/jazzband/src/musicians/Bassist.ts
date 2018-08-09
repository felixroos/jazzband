
import { resolveChords, getTonalChord } from '../util';
import { Musician } from '../Musician';
import { Chord, Interval, Distance } from 'tonal';
import { funk } from '../grooves/Funk';
import { swing } from '../grooves/swing';

export default class Bassist extends Musician {
    styles: { [key: string]: any };
    defaults = { style: 'Medium Swing' }

    constructor(props: any = {}) {
        super(props);
        this.styles = {
            'Funk': funk.bass,
            'Medium Swing': swing.bass,
        };
    }

    play({ measures, pulse, settings }) {
        const track = this.styles[settings.style] || this.styles[this.defaults.style];
        measures = measures
            .map(measure => track({ measure, settings, pulse }).slice(0, Math.floor(settings.cycle)))
            .map((pattern, i) => resolveChords(pattern, measures, [i]));
        pulse.tickArray(measures, (current) => {
            this.playBass(current, measures);
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
            note = this.getStep(value.pattern, getTonalChord(value.chord), octave);
        }
        this.instrument.playNotes([note], { deadline, interval, gain: 0.7 });
    }
}