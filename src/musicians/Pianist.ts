import { Distance } from 'tonal';
import { Chord } from 'tonal';
import { getTonalChord, offbeatReducer, resolveChords, intervalMatrix, minInterval, randomDelay, transposeToRange } from '../util';
import { Musician } from './Musician';
import { Instrument } from '../instruments/Instrument';
import { swing } from '../grooves/swing';

export default class Pianist extends Musician {
    playedNotes = [];
    playedPatterns = [];
    playedChords = [];
    defaults = { intelligentVoicings: true, groove: swing, noTonic: true };
    min = Math.min;
    rollFactor = 3; // how much keyroll effect? controls interval between notes
    props: any;
    range = ['C3', 'G5'];
    instrument: Instrument;
    constructor(instrument, props = {}) {
        super(instrument);
        this.props = Object.assign({}, this.defaults, props || {});
    }

    play({ pulse, measures, settings }) {
        const groove = settings.groove || this.defaults.groove;
        const grooveKey = 'chords';
        // if no groove or groove without chords, or exact, play whats there
        if (settings.exact || !groove || !groove[grooveKey]) {
            if (!groove[grooveKey]) {
                console.warn('Groove has no chords, Pianist will play exact.', groove);
            }
            /* walkMeasures(measures, (measure, path) => {
                console.log('walk measure', measure, path);
            }); */
            //TODO: fix timing (exact mode)
            return pulse.tickArray(measures, (t) => {
                const measureLength = pulse.getMeasureLength();
                this.playChord(t.value, { deadline: t.deadline, duration: measureLength * t.fraction, pulse });
            });
        }
        // else, play groovy
        const pattern = groove[grooveKey];
        measures = measures
            // generate random patterns
            .map(measure => pattern({ measures, pulse, measure, settings }).slice(0, Math.floor(settings.cycle)))
            // fill in chords
            .map((pattern, i) => resolveChords(pattern, measures, [i]))
            // fix chords at last offbeat
            .reduce(offbeatReducer(settings), []);
        pulse.tickArray(measures, ({ path, value, deadline }) => {
            const measureLength = pulse.getMeasureLength();
            const humanFactor = settings.bpm / (this.rollFactor || 1);
            let interval = settings.arpeggio ? measureLength / settings.cycle : Math.random() / (humanFactor * 20);
            if (path[0] % 2 === 0 && !path[1] && !path[2]) {
                interval = Math.random() / humanFactor;
            }
            const duration = settings.arpeggio ? interval : value.fraction * measureLength;
            const slice = settings.arpeggio ? Math.ceil(value.fraction / 1000 * 4) : null;
            const gain = value.gain || this.instrument.gain;
            this.playChord(value.chord, { deadline, gain, duration, interval, slice, pulse });
        }, settings.deadline);
    }

    getLastVoicing() {
        return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
    }

    getVoicing(scorenotes, before, tonic?) {
        if (!before) {
            return scorenotes;
        }
        const near = intervalMatrix(before, scorenotes)
            .map((intervals, index) => {
                const smallest = [].concat(intervals)
                    .sort((a, b) => minInterval(a, b, false))[0];
                if (!Distance.transpose(before[intervals.indexOf(smallest)], smallest)) {
                    console.warn('ALARM', before[intervals.indexOf(smallest)], smallest, intervals);
                }
                return Distance.transpose(before[intervals.indexOf(smallest)], smallest);
            }).filter(n => !!n);
        return near && near.length ? near : scorenotes;
    }


    // plays the given notes at the given interval
    playNotes(scorenotes, { tonic, deadline, interval, gain, duration, pulse }) {
        if (this.props.intelligentVoicings && this.getLastVoicing()) {
            scorenotes = this.getVoicing(scorenotes, this.getLastVoicing(), tonic);
        }
        scorenotes = transposeToRange(scorenotes, this.range);
        this.playedNotes.push([].concat(scorenotes));
        this.instrument.playNotes(scorenotes, { deadline, interval, gain, duration, pulse });
    }

    playChord(chord, settings) {
        if (chord === 'x') { // repeat
            chord = this.playedChords[this.playedChords.length - 1];
        }
        if (!chord || chord === '0') {
            this.playedChords.push('')
            return;
        }
        this.playedChords.push(chord);
        chord = Chord.tokenize(getTonalChord(chord));

        let notes = Chord.intervals(chord[1])
            .map(i => i.replace('13', '6')) // TODO: better control over octave
            .map(root => Distance.transpose(chord[0] + '3', root));
        if (notes.length > 3 && settings.noTonic) {
            notes = notes.slice(this.props.noTonic ? 1 : 0);
        }
        if (settings.slice) {
            notes = notes.slice(0, settings.slice ? settings.slice : notes.length);
        }
        settings.deadline += 0.02 + randomDelay(5);
        this.playNotes(notes, settings);
    }
}
