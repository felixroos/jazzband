import { Note } from 'tonal';
import { Chord } from 'tonal';
import { Interval } from 'tonal';
import { Distance } from 'tonal';

export declare type intervalDirection = 'up' | 'down';
export declare type step = string | number;

export class Harmony {
    static isBlack(note) {
        return Note.props(note).acc !== '';
    }

    static isSameNote(noteA, noteB) {
        return Note.midi(noteA) === Note.midi(noteB);
    }

    static getTonalChord(chord: string) {
        if (!chord) {
            return null;
        }
        chord = chord
            .replace(/([A-G][b|#]?)(69)/, '$1M69')
            .replace('-', 'm')
            .replace('^', 'M')
            .replace('h7', 'm7b5')
            .replace('h', 'dim');
        /**
         * Chords that dont work:
         * slash cords are ignored
         * 7b9b5 does not work
         * 
         */
        const tokens = Chord.tokenize(chord);
        const s = tokens[1].split('/');
        return tokens[0] + (s[0] || 'M');
    }

    static getBassNote(chord: string) {
        if (!chord) {
            return null;
        }
        if (chord.includes('/')) {
            return chord.split('/')[1];
        }
        return chord.match((/[A-G][b|#]?/))[0];
    }


    static getMidi(note, offset = 0) {
        return Note.midi(note) - offset;
    }


    static intervalComplement(interval) {
        const fix = {
            '8P': '1P',
            '8d': '1A',
            '8A': '1d',
            '1A': '8d',
            '1d': '8A',
        }
        const fixIndex = Object.keys(fix).find(key => interval.match(key));
        if (fixIndex) {
            return fix[fixIndex];
        }

        return Interval.invert(interval);
    }

    static invertInterval(interval) {
        if (!interval) {
            return null;
        }
        const positive = interval.replace('-', '');
        const complement = Harmony.intervalComplement(positive);
        const isNegative = interval.length > positive.length;
        return (isNegative ? '' : '-') + complement;
    }

    /** Transforms interval into one octave (octave+ get octaved down) */
    static fixInterval(interval = '', simplify = false) {
        let fix: { [key: string]: string } = {
            '0A': '1P',
            '-0A': '1P',
            /*  */
        }
        if (simplify) {
            fix = {
                ...fix,
                '8P': '1P',
                '-8P': '1P',
                /* '-1A': '-2m',
                '1A': '2m',
                '8d': '7M',
                '-8d': '-7M', */
            }
            interval = Interval.simplify(interval);
        }
        if (Object.keys(fix).includes(interval)) {
            return fix[interval];
        }
        return interval;
    }

    /** inverts the interval if it does not go to the desired direction */
    static forceDirection(interval, direction: intervalDirection, noUnison = false) {
        const semitones = Interval.semitones(interval);
        if ((direction === 'up' && semitones < 0) ||
            (direction === 'down' && semitones > 0)) {
            return Harmony.invertInterval(interval);
        }
        if (interval === '1P' && noUnison) {
            return (direction === 'down' ? '-' : '') + '8P';
        }
        return interval;
    }

    // use Interval.ic?
    static minInterval(interval, direction?: intervalDirection, noUnison?) {
        interval = Harmony.fixInterval(interval, true);
        if (direction) {
            return Harmony.forceDirection(interval, direction, noUnison)
        }
        let inversion = Harmony.invertInterval(interval);
        if (Math.abs(Interval.semitones(inversion)) < Math.abs(Interval.semitones(interval))) {
            interval = inversion;
        }
        return interval;
    }

    // returns array of intervals that lead the voices of chord A to chordB
    static minIntervals(chordA, chordB) {
        return chordA.map((n, i) => Harmony.minInterval(Distance.interval(n, chordB[i])));
    }

    static mapMinInterval(direction?: intervalDirection) {
        return (interval) => Harmony.minInterval(interval, direction);
    }

    // sort function
    static sortMinInterval(preferredDirection: intervalDirection = 'up', accessor = (i => i)) {
        return (a, b) => {
            const diff = Math.abs(Interval.semitones(accessor(a))) - Math.abs(Interval.semitones(accessor(b)));
            if (diff === 0) {
                return preferredDirection === 'up' ? -1 : 1;
            }
            return diff;
        }
    }

    /** Returns the note with the least distance to "from" */
    static getNearestNote(from, to, direction?: intervalDirection) {
        let interval = Harmony.minInterval(Distance.interval(Note.pc(from), Note.pc(to)), direction);
        return Distance.transpose(from, interval);
    }

    /** Returns the note with the least distance to "from". TODO: add range */
    static getNearestTargets(from, targets, preferredDirection: intervalDirection = 'down', flip = false) {
        let intervals = targets
            .map((target) => Distance.interval(Note.pc(from), target))
            .map(Harmony.mapMinInterval(preferredDirection))
            .sort(Harmony.sortMinInterval(preferredDirection))
        /* if (flip) {
            intervals = intervals.reverse();
        } */
        return intervals.map(i => Distance.transpose(from, i));
    }

    static intervalMatrix(from, to) {
        return to.map(note => from
            .map(n => {
                return Distance.interval(n, note)
            })
            .map(d => Harmony.minInterval(d))
            /* .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i) */
        )
    }

}