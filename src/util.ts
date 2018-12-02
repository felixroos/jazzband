import { Chord, Distance, Interval, Note, PcSet, Scale } from 'tonal';
import { Synthesizer } from './instruments/Synthesizer';
import { scaleNames } from './symbols';

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

export function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
    const fix = {
        '1A': '-8d',
        '-1A': '8d',
    }
    if (fix[interval]) {
        return fix[interval];
    }
    if (Interval.semitones(interval) < 0) {
        return Interval.invert(interval.slice(1));
    }
    return '-' + Interval.invert(interval);
}

/** Transforms interval into one octave (octave+ get octaved down) */
export function simplifyInterval(interval) {
    interval = Interval.simplify(interval) || '1P';

    const fix = {
        '8P': '1P',
        '-8P': '1P',
        '0A': '1P',
        '-0A': '1P',
        '8d': '-1A',
        '-8d': '1A',
    }

    if (fix[interval]) {
        return fix[interval];
    }
    return interval;
}

declare type intervalDirection = 'up' | 'down';

/** inverts the interval if it does not go to the desired direction */
export function forceDirection(interval, direction: intervalDirection) {
    if (
        (direction === 'up' && Interval.semitones(interval) < 0) ||
        (direction === 'down' && Interval.semitones(interval) > 0)
    ) {
        return invertInterval(interval);
    }
    return interval;
}

// use Interval.ic?
export function minInterval(interval, direction: intervalDirection = 'up', force?) {
    interval = simplifyInterval(interval);
    if (!force) {
        let inversion = invertInterval(interval);
        if (Math.abs(Interval.semitones(inversion)) < Math.abs(Interval.semitones(interval))) {
            interval = inversion;
        }
    }
    if (direction && force) {
        return forceDirection(interval, direction)
    }
    return interval;
}

export function mapMinInterval(direction: intervalDirection = 'up', force?) {
    return (interval) => minInterval(interval, direction, force);
}

// sort function
export function sortMinInterval(preferredDirection: intervalDirection = 'up') {
    return (a, b) => {
        const diff = Math.abs(Interval.semitones(a)) - Math.abs(Interval.semitones(b));
        if (diff === 0) {
            return preferredDirection === 'up' ? -1 : 1;
        }
        return diff;
    }
}

/** Returns the note with the least distance to "from" */
export function getNearestNote(from, to, direction?: intervalDirection, force = !!direction) {
    let interval = minInterval(Distance.interval(Note.pc(from), to), direction, force);
    return Distance.transpose(from, interval);
}

/** Returns the note with the least distance to "from". TODO: add range */
export function getNearestTargets(from, targets, preferredDirection: intervalDirection = 'down', force = false, flip = false) {
    let intervals = targets
        .map((target) => Distance.interval(Note.pc(from), target))
        .map(mapMinInterval(preferredDirection, force))
        .sort(sortMinInterval(preferredDirection))
    if (flip) {
        intervals = intervals.reverse();
    }
    return intervals.map(i => Distance.transpose(from, i));
}

export function intervalMatrix(from, to) {
    return to.map(note => from
        .map(n => {
            return Distance.interval(n, note)
        })
        .map(d => minInterval(d))
        /* .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i) */
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

// accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval
export function getStep(step) {
    if (typeof step === 'number' && step < 0) {
        step = 'b' + (step * -1);
    }
    return step + ''; // to string
}

const steps = {
    '1P': ['1', '8'],
    '2m': ['b9', 'b2'],
    '2M': ['9', '2',],
    '2A': ['#9', '#2'],
    '3m': ['b3'],
    '3M': ['3'],
    '4P': ['11', '4'],
    '4A': ['#11', '#4'],
    '5D': ['b5'],
    '5P': ['5'],
    '6m': ['b13', 'b6'],
    '6M': ['13', '6'],
    '7m': ['b7'],
    '7M': ['7', '^7', 'maj7']
};

export function getIntervalFromStep(step) {
    step = getStep(step);
    const interval = Object.keys(steps)
        .find(i => steps[i].includes(step));
    if (!interval) {
        // console.warn(`step ${step} has no defined inteval`);
    }
    return interval;
}

export function getChordScales(chord, group = 'Diatonic') {
    const tokens = Chord.tokenize(getTonalChord(chord));
    const isSuperset = PcSet.isSupersetOf(Chord.intervals(tokens[1]));
    return scaleNames(group).filter(name => isSuperset(Scale.intervals(name)));
}

export function pickChordScale(chord, group = 'Diatonic') {
    const scales = getChordScales(chord);
    if (!scales.length) {
        console.warn(`cannot pick chord scale: no scales found for chord ${chord} in group ${group}`);
        return;
    }
    return scales[0];
}

export function findDegree(degree, intervals) {
    return intervals
        .find(i => i.includes(getStep(degree)) ||
            i === getIntervalFromStep(degree));
}

export function hasDegree(degree, intervals) {
    return !!findDegree(degree, intervals);
}

export function hasAllDegrees(degrees, intervals) {
    return degrees.reduce((res, d) => res && hasDegree(d, intervals), true);
}

export function getScaleDegree(degree, scale) {
    return findDegree(degree, Scale.intervals(scale));
}

export function getDegreeInChord(note, chord, group?) {
    return getDegreeFromInterval(
        Distance.interval(
            Chord.tokenize(getTonalChord(chord))[0],
            Note.pc(note))
    );
}

export function getScalePattern(pattern, scale) {
    return pattern.map(degree => getScaleDegree(degree, scale));
}

export function renderIntervals(intervals, root) {
    return intervals.map(i => Distance.transpose(root, i));
}

export function renderSteps(steps, root) {
    return renderIntervals(steps.map(step => getIntervalFromStep(step)), root);
}

export function permutateIntervals(intervals, pattern) {
    return pattern.map(d => findDegree(d, intervals));
}

export function getDegreeFromInterval(interval) {
    return steps[interval] ? steps[interval][0] : 0;
}

export function getPatternInChord(pattern, chord) {
    chord = getTonalChord(chord);
    const intervals = Chord.intervals(chord);
    const tokens = Chord.tokenize(chord);
    let permutation;
    if (hasAllDegrees(pattern, intervals)) {
        permutation = permutateIntervals(intervals, pattern);
    } else {
        // not all degrees of the pattern are in the chord > get scale
        const scale = pickChordScale(chord);
        permutation = permutateIntervals(Scale.intervals(scale), pattern);
    }
    if (tokens[0]) {
        return renderIntervals(permutation, tokens[0]);
    }
    return permutation;
}

// TODO: other way around: find fixed interval pattern in a scale
// TODO: motives aka start pattern from same note in different scale
// TODO: motives aka start pattern from different note in same scale
// TODO: motives aka start pattern from different note in different scale

export function getDigitalPattern(chord) {
    chord = getTonalChord(chord);
    const intervals = Chord.intervals(chord);
    if (intervals.includes('3m')) {
        return [1, 3, 4, 5];
    } else if (intervals.includes('3M')) {
        return [1, 2, 3, 5];
    } else {
        return [1, 1, 1, 1];
    }
}

export function renderDigitalPattern(chord) {
    return getPatternInChord(getDigitalPattern(chord), chord);
}

export function getGuideTones(chord) {
    chord = getTonalChord(chord);
    return getPatternInChord([3, 7], chord);
}

export function getRangePosition(note, range) {
    const semitones = [Distance.semitones(range[0], note), Distance.semitones(range[0], range[1])];
    return semitones[0] / semitones[1];

}

export function isFirstInPath(path, index) {
    return path.slice(index)
        .reduce((sum, value) => sum + value, 0) === 0;
}

export function isBarStart(path) {
    return isFirstInPath(path, 1);
}

export function isFormStart(path) {
    return isFirstInPath(path, 0);
}

export function isOffbeat(path) {
    return path[2] !== 0;
}


export function otherDirection(direction, defaultDirection?) {
    if (direction === 'up') {
        return 'down';
    } else if (direction === 'down') {
        return 'up'
    }
    return defaultDirection;
}

export function parseChords(chords, simplify = true) {
    return chords
        .replace(/\n/g, '|')
        .split('|') // split into measures
        .map(measure => measure.split(/\s/)) // split measures by spaces
        .map(measure => measure.filter(chord => !!chord)) // kill empty chords
        .filter(measure => !measure || measure.length) // kill empty measures
        .map(measure => ({ symbols: measure, signs: [] }))
        // parse symbols to chords and signs
        .map(measure => {
            // repeat start
            if (measure.symbols[0][0] === ':') {
                if (measure.symbols[0].length === 1) {
                    measure.symbols = measure.symbols.slice(1);
                }
                measure.signs.unshift('{');
            }
            const last = measure.symbols[measure.symbols.length - 1];
            // repeat end
            if (last[last.length - 1] === ':') {
                if (last.length === 1) {
                    measure.symbols.pop();
                }
                measure.signs.push('}');
            }
            measure.symbols = measure.symbols.map(s => s.replace(/:/g, ''));
            const house = measure.symbols.find(s => s.match(/^[1-9]$/));
            if (house) {
                measure.house = parseInt(house);
            }
            measure.symbols = measure.symbols.filter(s => !s.match(/^[1-9]$/))
            // houses
            measure.chords = [].concat(measure.symbols);
            delete measure.symbols;
            return measure;
        })
        .map(measure => {
            if (!simplify) {
                return measure;
            }
            if (measure.signs.length === 0) {
                delete measure.signs;
            }
            if (measure.chords.length === 0) {
                delete measure.chords;
            }
            return measure;
        })
        // kill empty measures
        .filter(measure => Object.keys(measure).length > 0)
        // simplify => measures with only chords will be arrays
        .map(measure => {
            if (!simplify) {
                return measure;
            }
            if (measure.chords && Object.keys(measure).length === 1) {
                return measure.chords.length === 1 ?
                    measure.chords[0] : // simplify one chord measures
                    measure.chords
            }
            return measure;
        });
}