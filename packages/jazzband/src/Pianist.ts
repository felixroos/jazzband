import * as Note from 'tonal-note';
import { Interval } from 'tonal';
import { Distance } from 'tonal';
import { Chord } from 'tonal';
import { getTonalChord, randomElement, offbeatReducer, resolveChords, intervalMatrix, minInterval, getMidi } from './util';
import { Musician } from './Musician';
import { Instrument } from './Instrument';

export default class Pianist extends Musician {
    playedNotes = [];
    playedPatterns = [];
    defaults = { intelligentVoicings: true, style: 'Medium Swing', noTonic: true };
    min = Math.min;
    styles = {
        'Funk': [{ pattern: () => [[1, 0, 0, .7], 0, [0, .6], [0, .5, 0, 0]] }],
        'Medium Swing': [{
            pattern: ({ measure, settings }) => {
                const off = () => randomElement([0, [0, 0, .8]], [4, 1]);
                const r = Math.random() > 0.5 ? .6 : 0;
                const t = `${settings.cycle}/${measure.length}`;
                if (t === '4/1') {
                    return randomElement([
                        [1, 0, 0, 0],
                        [.9, 0, r, off()],
                        [[0, 0, .8], 0, r, 0],
                        [.6, [0, 0, .7], 0, off()],
                    ]);//, [2, 1, 1]
                }
                if (t === '4/2') {
                    return randomElement([
                        [1, 0, .7, off()],
                        [1, [0, 0, .8], 0, off()],
                    ], [1, 2]);
                }

                if (t === '4/3') {
                    return [1, [0, 0, .8], [0, 0, 1], 0];
                }
                if ('4/4') {
                    return randomElement([
                        [1, .7, 1, .8],
                        [[1, 0, .6], [0, 0, .7], 0, .8]
                    ]);
                }

            }
        }]
    };
    props: any;
    instrument: Instrument;
    constructor(props: any = {}) {
        super(props);
        this.props = Object.assign({}, this.defaults, props || {});
    }

    play({ pulse, measures, settings }) {
        const style = this.styles[settings.style] || this.styles[this.defaults.style];
        if (settings.exact) {
            return pulse.tickArray(measures, (t) => {
                this.playChord(t.value, { deadline: t.deadline });
            });
        }
        style.forEach(track => {
            measures = measures
                // generate random patterns
                .map(measure => track.pattern({ pulse, measure, settings }).slice(0, Math.floor(settings.cycle)))
                // fill in chords
                .map((pattern, i) => resolveChords(pattern, measures, [i]))
                // fix chords at last offbeat
                .reduce(offbeatReducer(settings), []);

            pulse.tickArray(measures, ({ tick, value, deadline }) => {
                this.playChord(value.chord, { deadline, gain: value.value });
            });
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
    playNotes(scorenotes, { tonic, deadline, interval, gain }) {
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
        this.instrument.playNotes(scorenotes, { deadline, interval, gain });
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
