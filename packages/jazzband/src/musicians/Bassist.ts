
import { resolveChords, getTonalChord, randomElement } from '../util';
import { Musician } from './Musician';
import { Chord, Distance } from 'tonal';
import { funk } from '../grooves/funk';
import { swing } from '../grooves/swing';

export default class Bassist extends Musician {
    styles: { [key: string]: any };
    defaults = { style: 'Medium Swing' }
    playedChords: string[] = [];

    constructor(instrument) {
        super(instrument);
        this.styles = {
            'Funk': funk.bass,
            'Medium Swing': swing.bass,
        };
    }

    play({ measures, pulse, settings }) {
        const track = this.styles[settings.style] || this.styles[this.defaults.style];
        measures = measures
            .map(measure => track({ measures, measure, settings, pulse }).slice(0, Math.floor(settings.cycle)))
            .map((pattern, i) => resolveChords(pattern, measures, [i]));
        pulse.tickArray(measures, (current) => {
            this.playBass(current, measures, pulse);
        });
    }

    getStep(step, chord, octave = 2) {
        const tokens = Chord.tokenize(getTonalChord(chord));
        const interval = Chord.intervals(tokens[1]).find(i => parseInt(i[0]) === step);
        return Distance.transpose(tokens[0] + octave, interval);
    }

    playBass({ value, cycle, path, deadline, interval }, measures, pulse) {
        let chord = value.chord;
        if (chord === 'N.C.') {
            return;
        }
        if (!chord || chord === 'x') { // repeat // TODO: support 'r' 
            chord = this.playedChords[this.playedChords.length - 1];
        }
        this.playedChords.push(chord);
        let note;
        const steps = [1, randomElement([3, 5]), 1, randomElement([3, 5])];
        const octave = 2;
        if (value.value === 1 && chord.split('/').length > 1) {
            note = chord.split('/')[1] + octave;
        } else {
            note = this.getStep(steps[path[1]], getTonalChord(chord), octave);
        }
        const duration = value.fraction * pulse.getMeasureLength();
        this.instrument.playNotes([note], { deadline, interval, gain: 0.7, duration });
    }
}