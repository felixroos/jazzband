import { resolveChords, randomElement, getNearestTargets, transposeToRange, getPatternInChord } from '../util';
import { Musician } from './Musician';
import { Note } from 'tonal';
import { swing } from '../grooves/swing';

export default class Guide extends Musician {
    styles: { [key: string]: any };
    defaults = { groove: swing }
    playedChords: string[] = [];
    playedNotes: string[] = [];
    range = ['C3', 'C6'];

    constructor(instrument) {
        super(instrument);
    }

    play({ measures, pulse, settings }) {
        const groove = settings.groove || this.defaults.groove;
        const pattern = groove['solo'] || ((m) => {
            return m.measure.map(c => [1]);
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
        // only guide tones
        //const notes = getGuideTones(chord);
        const pattern = [1, 3, 5, 7];
        let notes = getPatternInChord([1, 3, 5, 7], chord);
        let note;
        const octave = 5;
        const variance = .5; // how many near notes can be jumped over ?
        const variety = .5; // how vertical should the solo be?
        const drill = .5; // how persistent should the current direction be followed?
        const flip = false; // if true, the voice leading will be stretched out
        if (!this.playedNotes.length) {
            note = randomElement(notes) + octave;
        } else {
            const excludeNotes = this.playedNotes
                .slice(0, Math.floor(variety * pattern.length - 1))
                .map(n => Note.pc(n));
            notes = notes.filter(n => !excludeNotes.includes(n));

            const direction = drill > 0 ? 'up' : 'down';
            note = randomElement(
                getNearestTargets(this.playedNotes[0], notes, direction,
                    Math.random() * Math.abs(drill) > .5, flip)
                    .slice(0, ((variance * pattern.length + 1) % pattern.length))
            );

            note = Note.simplify(note, true);
        }
        note = transposeToRange([note], this.range)[0];
        this.playedNotes.unshift(note);

        const duration = value.fraction * pulse.getMeasureLength();

        // this.instrument.playNotes(notes.map(n => n + '5'), { deadline, interval, gain: 1, duration, pulse });
        this.instrument.playNotes([note], { deadline, interval, gain: 1, duration, pulse });
    }
}