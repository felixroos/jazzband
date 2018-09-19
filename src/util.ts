import { Chord, Distance, Interval, Note } from 'tonal';
import { Synthesizer } from './instruments/Synthesizer';

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

export function getDuration(divisions, noteLength = 1, measureLength = 1) {
    return noteLength * divisions.reduce((f, d) => f / d, 1000) * measureLength; // fraction of one
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
    const fraction = getDuration(divisions, pattern);
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
    let smallest = Interval.simplify(interval);
    if (smallest === '0A') {
        smallest = '1P'; // TODO: issue for tonal-interval (0A does not support invert and is not simple)
    }
    let inversion = this.invertInterval(smallest);
    if (Math.abs(Interval.semitones(inversion)) < Math.abs(Interval.semitones(smallest))) {
        return inversion || interval;
    }
    return smallest || interval;
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

export function randomSynth(mix, allowed = ['sine', 'triangle', 'square', 'sawtooth'], settings = {}) {
    const gains = {
        sine: 0.9,
        triangle: 0.8,
        square: 0.2,
        sawtooth: 0.3
    }
    const wave = randomElement(allowed);
    return new Synthesizer(Object.assign({ gain: gains[wave], type: wave, mix }, settings));
}

export interface ADSRParams {
    attack?: number,
    decay?: number,
    sustain?: number,
    release?: number,
    gain?: number,
    duration?: number,
    endless?: boolean
}

export function adsr({ attack, decay, sustain, release, gain, duration, endless }: ADSRParams, time, param) {
    // console.log('adsr', attack, decay, sustain, release, gain, duration, time);
    param.linearRampToValueAtTime(gain, time + attack);
    param.setTargetAtTime(sustain * gain, time + Math.min(attack + decay, duration), decay);
    if (!endless) {
        param.setTargetAtTime(0, time + Math.max(duration - attack - decay, attack + decay, duration), release);
    }
}

export function randomDelay(maxMs) {
    return Math.random() * maxMs * 2 / 1000;
}

export function isInRange(note, range) {
    return Distance.semitones(note, range[0]) <= 0 && Distance.semitones(note, range[1]) >= 0;
}

export function transposeNotes(notes, interval) {
    return notes.map(note => Distance.transpose(note, interval));
}

export function transposeToRange(notes, range, times = 0) {
    if (times > 10) {
        return notes;
    }
    if (notes.find(note => Distance.semitones(note, range[0]) > 0)) {
        notes = notes.map(note => Distance.transpose(note, '8P'));
        return transposeToRange(notes, range, ++times);
    }
    if (notes.find(note => Distance.semitones(note, range[1]) < 0)) {
        notes = notes.map(note => Distance.transpose(note, '-8P'));
        return transposeToRange(notes, range, ++times);
    }
    return notes;
}