import { Chord, Distance, Interval, Note } from 'tonal';

export function randomNumber(n) {
    return Math.floor(Math.random() * n)
}

export function arraySum(array) {
    return array.reduce((s, i) => s + i, 0);
}

export function randomElement(array, weighted?) {
    if (!weighted) {
        return array[randomNumber(array.length)];
    }
    const r = randomNumber(arraySum(weighted)) + 1;
    const total = weighted
        .reduce((abs, w, i) => abs.concat(w + (abs.length ? abs[i - 1] : 0)), []);
    return array[total.indexOf(total.find((s, i) => s >= r))];
}

export function getTonalChord(chord) {
    chord = chord
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

export function getMidi(note, offset) {
    return Note.props(note).midi - offset;
}

/** Travels path along measures */
export function getPath(path, measures, traveled = []) {
    if (!Array.isArray(measures[path[0]]) || path.length === 1) {
        return measures[Math.min(path[0], measures.length - 1)];
    }
    return this.getPath(path.slice(1), measures[path[0]], traveled.concat(path[0]));
}

export function resolveChords(pattern, measures, path, divisions = []) {
    if (Array.isArray(pattern)) {
        // division: array of children lengths down the path (to calculate fraction)
        divisions = [].concat(divisions, [pattern.length]);
        return pattern.map((p, i) => this.resolveChords(p, measures, path.concat([i]), divisions));
    }
    if (pattern === 0) {
        return 0;
    }
    //const split = (pattern + '').split('.');
    //const gain = parseFloat('0.' + split[1]); //digit(s) after .
    //const fraction = (parseInt(split[0]) || 1) * divisions.reduce((f, d) => f / d, 1000); // fraction of one
    const fraction = pattern * divisions.reduce((f, d) => f / d, 1000); // fraction of one
    if (fraction === 0) {
        console.warn('fraction is 0', pattern);
    }
    return { chord: this.getPath(path, measures), pattern, /* gain, */ path, divisions, fraction };
}

export function hasOff(pattern, division = 3) {
    return Array.isArray(pattern) && pattern.length === division && pattern[division - 1] !== 0;
}

// replaces offs on last beat with next chord + erases next one
export function offbeatReducer(settings) {
    // TODO: find out why some offbeats sound sketchy
    return (measures, bar, index) => {
        const last = index > 0 ? measures[index - 1] : null;
        if (last && this.hasOff(last[settings.cycle - 1], settings.division)) {
            last[settings.cycle - 1][settings.division - 1] = bar[0];
            bar[0] = 0;
        }
        return measures.concat([bar]);
    };
}

export function invertInterval(interval) {
    if (Interval.semitones(interval) < 0) {
        return Interval.invert(interval.slice(1));
    }
    return '-' + Interval.invert(interval);
}

// use Interval.ic?
export function smallestInterval(interval) {
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

export function minInterval(a, b, preferRightMovement) {
    const semitones = [Math.abs(Interval.semitones(a)), Math.abs(Interval.semitones(b))];
    if (semitones[0] === semitones[1]) {
        if (preferRightMovement) {
            return semitones[0] < 0 ? -1 : 1;
        }
        return semitones[0] > 0 ? -1 : 1;
    }
    return semitones[0] < semitones[1] ? -1 : 1;
}

export function intervalMatrix(from, to) {
    return to.map(note => from
        .map(n => {
            return Distance.interval(n, note)
        })
        .map(d => this.smallestInterval(d))
        .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i)
    )
}