import { Distance } from 'tonal';
import { Chord } from 'tonal';
import { getTonalChord, offbeatReducer, resolveChords, intervalMatrix, minInterval } from '../util';
import { Musician } from '../Musician';
import { Instrument } from '../Instrument';
import { funk } from '../grooves/funk';
import { swing } from '../grooves/swing';

export default class Pianist extends Musician {
    playedNotes = [];
    playedPatterns = [];
    defaults = { intelligentVoicings: true, style: 'Medium Swing', noTonic: true };
    min = Math.min;
    styles = {
        'Funk': funk.chords,
        'Medium Swing': swing.chords
    };
    props: any;
    instrument: Instrument;
    constructor(props: any = {}) {
        super(props);
        this.props = Object.assign({}, this.defaults, props || {});
    }

    play({ pulse, measures, settings }) {
        const pattern = this.styles[settings.style] || this.styles[this.defaults.style];
        if (settings.exact) {
            return pulse.tickArray(measures, (t) => {
                this.playChord(t.value, { deadline: t.deadline });
            });
        }
        measures = measures
            // generate random patterns
            .map(measure => pattern({ pulse, measure, settings }).slice(0, Math.floor(settings.cycle)))
            // fill in chords
            .map((pattern, i) => resolveChords(pattern, measures, [i]))
            // fix chords at last offbeat
            .reduce(offbeatReducer(settings), []);
        pulse.tickArray(measures, ({ tick, value, deadline }) => {
            const duration = value.fraction * pulse.getMeasureLength();
            const gain = value.gain || 0.7;
            this.playChord(value.chord, { deadline, gain, duration });
        });
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
                    console.log('ALARM', before[intervals.indexOf(smallest)], smallest);
                }
                return Distance.transpose(before[intervals.indexOf(smallest)], smallest);
            });
        return near;
    }

    // plays the given notes at the given interval
    playNotes(scorenotes, { tonic, deadline, interval, gain, duration }) {
        if (!scorenotes || !scorenotes.length) {
            return;
        }
        if (this.props.intelligentVoicings && this.getLastVoicing()) {
            scorenotes = this.getVoicing(scorenotes, this.getLastVoicing(), tonic);
        }
        this.playedNotes.push([].concat(scorenotes));
        // scorenotes[0] = Distance.transpose(scorenotes[0], '-P8');
        if (!this.instrument) {
            console.warn('Pianist has no instrument...');
            return;
        }
        this.instrument.playNotes(scorenotes, { deadline, interval, gain, duration });
    }

    playChord(chord, settings) {
        chord = Chord.tokenize(getTonalChord(chord));
        const notes = Chord.intervals(chord[1])
            .map(i => i.replace('13', '6'))
            .map(root => Distance.transpose(chord[0] + '3', root))
            .slice(this.props.noTonic ? 1 : 0);
        this.playNotes(notes, settings);
    }
}
