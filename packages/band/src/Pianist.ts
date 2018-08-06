import * as Note from 'tonal-note';
import { sounds } from './samples/piano.js';
import { Soundbank } from './Soundbank';
import { Interval } from 'tonal';
import { Distance } from 'tonal';
import { Chord } from 'tonal';
import { getTonalChord, randomElement, getOne } from './util';
export default class Pianist {
    style = 'Medium Swing';
    midiOffset = 36;
    playedNotes = [];
    playedPatterns = [];
    defaults = { bpm: 200, intelligentVoicings: true };
    min = Math.min;
    styles = {
        'Funk': [{ pattern: (p, n) => [[0, 1], 0, [0, 1], 1] }],
        'Medium Swing': [{
            pattern: (p, n) => {
                const latest = this.playedPatterns[this.playedPatterns.length - 1];
                const off = (n) => randomElement([0, [0, 0, n]], [3, 1]);
                const one = () => getOne(latest);
                const t = `${p.cycle}/${n}`;
                const o = one();
                const no = !o ? 1 : 0;
                if (t === '4/1') {
                    return randomElement([
                        [o, 0, 0, off(2)],
                        [o, 0, no, off(2)],
                        [o, [0, 0, 1], 0, off(2)],
                    ]);//, [2, 1, 1]
                }
                if (t === '4/2') {
                    return randomElement([
                        [o, 0, 2, off(3)],
                        [o, [0, 0, 2], 0, off(3)],
                    ], [2, 1]);
                }

                if (t === '4/3') {
                    console.log('three..');
                    return [o, 2, 3];
                }
                if ('4/4') {
                    return randomElement([
                        [o, 2, 3, 4],
                        [[o, 0, 2], [0, 0, 3], 0, 4]
                    ]);
                }

            }
        }]
    };
    soundbank: Soundbank;
    props: any;
    ready: Promise<any[]>;
    constructor(props: any = {}) {
        this.props = Object.assign({}, this.defaults, props || {});
        this.soundbank = new Soundbank({
            context: props.context,
            preload: sounds,
            onTrigger: (indices) => {
                if (this.props.onTrigger) {
                    const notes = this.getLastVoicing();
                    this.props.onTrigger(notes);
                }
            }, onStop: (indices) => {
                if (this.props.onStop) {
                    this.props.onStop(indices);
                }
            }
        });
        this.ready = this.soundbank.preload;
    }

    bar(tick, measures) {
        const current = measures[tick.path[0]];
        const next = current.concat(measures[(tick.path[0] + 1) % measures.length]);

        this.styles[this.style].forEach(track => {
            const pattern = track.pattern(tick, current.length).slice(0, Math.floor(tick.cycle));
            this.playedPatterns.push(pattern);
            tick.pulse.tickArray(pattern, (t) => {
                const chord = next[Math.min(t.value, next.length) - 1];
                this.playChord(chord, t.deadline);
            }, tick.length);
        });
    }

    invertInterval(interval) {
        if (Interval.semitones(interval) < 0) {
            return Interval.invert(interval.slice(1));
        }
        return '-' + Interval.invert(interval);
    }

    smallestInterval(interval) {
        interval = Interval.simplify(interval);
        if (interval === '0A') {
            interval = '1P'; // TODO: issue for tonal-interval (0A does not support invert and is not simple)
        }
        let inversion = this.invertInterval(interval);
        if (Math.abs(Interval.semitones(inversion)) < Math.abs(Interval.semitones(interval))) {
            return inversion;
        }
        return interval || '';
    }

    minInterval(a, b, preferRightMovement) {
        const semitones = [Math.abs(Interval.semitones(a)), Math.abs(Interval.semitones(b))];
        if (semitones[0] === semitones[1]) {
            if (preferRightMovement) {
                return semitones[0] < 0 ? -1 : 1;
            }
            return semitones[0] > 0 ? -1 : 1;
        }
        return semitones[0] < semitones[1] ? -1 : 1;
    }

    intervalMatrix(from, to) {
        return to.map(note => from
            .map(n => {
                return Distance.interval(n, note)
            })
            .map(d => this.smallestInterval(d))
            .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i)
        )
    }

    getLastVoicing() {
        return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
    }

    getMidi(note) {
        return Note.props(note).midi - this.midiOffset;
    }

    getVoicing(scorenotes, before, tonic?) {
        if (!before) {
            return scorenotes;
        }
        // songs that dont work with current method:
        /**
         * Countdown (Coltrane): D-7 second line (second run)
         */

        const near = this.intervalMatrix(before, scorenotes)
            .map((intervals, index) => {
                const smallest = [].concat(intervals)
                    .sort((a, b) => this.minInterval(a, b, false))[0];
                if (!Distance.transpose(before[intervals.indexOf(smallest)], smallest)) {
                    console.log('ALARM', before[intervals.indexOf(smallest)], smallest);
                }
                return Distance.transpose(before[intervals.indexOf(smallest)], smallest);
            });
        return near;
    }

    // plays the given notes at the given interval
    playNotes(scorenotes, deadline = 0, interval = 0, tonic?) {
        if (!scorenotes || !scorenotes.length) {
            return;
        }
        if (this.props.intelligentVoicings && this.getLastVoicing()) {
            scorenotes = this.getVoicing(scorenotes, this.getLastVoicing(), tonic);
        }
        this.playedNotes.push([].concat(scorenotes));
        // scorenotes[0] = Distance.transpose(scorenotes[0], '-P8');
        // console.log('play', scorenotes);

        const sources = scorenotes.map(note => sounds[this.getMidi(note)]);
        this.soundbank.playSources(sources, deadline, interval);
    }

    playChord(chord, deadline?, noTonic?) {
        chord = Chord.tokenize(getTonalChord(chord));
        const notes = Chord.intervals(chord[1])
            .map(i => i.replace('13', '6'))
            .map(root => Distance.transpose(chord[0] + '3', root));
        /* .slice(noTonic ? 1 : 0); */
        this.playNotes(notes, deadline);
    }
}
