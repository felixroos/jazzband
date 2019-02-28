import { resolveChords, randomElement, randomDelay } from '../util/util';
import { Musician } from './Musician';
import { Chord, Distance } from 'tonal';
import { swing } from '../grooves/swing';
import { Harmony } from '../harmony/Harmony';

export default class Bassist extends Musician {
    name = 'Bassist';
    styles: { [key: string]: any };
    defaults = { groove: swing }
    playedChords: string[] = [];

    constructor(instrument) {
        super(instrument);
    }

    play({ measures, pulse, settings }) {
        const groove = settings.groove || this.defaults.groove;
        const pattern = groove['bass'];
        if (!pattern) {
            console.warn('no bass pattern found in groove', groove);
            return;
        }
        measures = measures
            .map(measure => {
                /* if (Array.isArray(measure)) {
                    return measure;
                } */
                return pattern({ measures, measure, settings, pulse }).slice(0, Math.floor(settings.cycle))
            })
            .map((pattern, i) => resolveChords(pattern, measures, [i]));
        pulse.tickArray(measures, (tick) => {
            this.playBass(tick, measures, pulse);
        }, settings.deadline);
    }

    getStep(step, chord, octave = 2) {
        const tokens = Chord.tokenize(Harmony.getTonalChord(chord));
        const interval = Chord.intervals(tokens[1]).find(i => parseInt(i[0]) === step);
        return Distance.transpose(tokens[0] + octave, interval);
    }

    playBass({ value, cycle, path, deadline, interval }, measures, pulse) {
        let chord = value.chord;
        if (chord === 'N.C.') {
            return;
        }
        if (chord === 'x') {
            chord = this.playedChords[this.playedChords.length - 1];
        }
        if (!chord || chord === '0') {
            this.playedChords.push('');
            return;
        }
        this.playedChords.push(chord);
        let note;
        /* const steps = [1, randomElement([3, 5]), 1, randomElement([3, 5])]; */
        const steps = [1, 5, 1, randomElement([3, 5])];
        const octave = 2;
        if (steps[path[1]] === 1) {
            note = Harmony.getBassNote(chord) + octave;
        } else {
            note = this.getStep(steps[path[1]], Harmony.getTonalChord(chord), octave);
        }
        const duration = value.fraction * pulse.getMeasureLength();

        deadline += randomDelay(10);
        this.instrument.playNotes([note], { deadline, interval, gain: this.getGain() * .7, duration, pulse });
    }
}