import { resolveChords, getDigitalPattern, randomDelay, randomElement, getGuideTones, getPatternInChord, renderDigitalPattern } from '../util';
import { Musician } from './Musician';
import { Chord, Distance } from 'tonal';
import { swing } from '../grooves/swing';

export default class Permutator extends Musician {
    styles: { [key: string]: any };
    defaults = { groove: swing }
    playedChords: string[] = [];

    constructor(instrument) {
        super(instrument);
    }

    play({ measures, pulse, settings }) {
        const groove = settings.groove || this.defaults.groove;

        const pattern = groove['solo'] || ((m) => {
            return m.measure.map(c => [1, 1, 1, 1]);
        }); // dont changes anything

        measures = measures
            .map(measure => pattern({ measures, measure, settings, pulse }).slice(0, Math.floor(settings.cycle)))
            .map((pattern, i) => resolveChords(pattern, measures, [i]));
        pulse.tickArray(measures, (tick) => {
            this.playPermutations(tick, measures, pulse);
        }, settings.deadline);
    }

    playPermutations({ value, cycle, path, deadline, interval }, measures, pulse) {
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

        // digital patterns
        const notes = renderDigitalPattern(chord);
        const note = randomElement(notes) + '5';

        // all scale notes with different chances
        /* const notes = getPatternInChord([1, 2, 3, 4, 5, 6, 7], chord);
        const note = randomElement(notes, [4, 3, 6, 1, 3, 4, 6]) + '5'; */

        /* console.log('beat (starting from zero)', path[1]); */
        const duration = value.fraction * pulse.getMeasureLength();

        /* deadline += randomDelay(10); */
        this.instrument.playNotes([note], { deadline, interval, gain: 1, duration, pulse });
    }
}