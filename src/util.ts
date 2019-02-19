import { Chord, Distance, Interval, Note, PcSet, Scale } from 'tonal';
import { Synthesizer } from './instruments/Synthesizer';
import { scaleNames } from './symbols';
import { Snippet } from './sheet/Snippet';
import { Permutation } from './Permutation';
import { interval } from 'tonal-distance';
import { note } from 'tonal';
import { Logger } from './Logger';

const steps = {
    '1P': ['1', '8'],
    '2m': ['b9', 'b2'],
    '2M': ['9', '2',],
    '2A': ['#9', '#2'],
    '3m': ['b3'],
    '3M': ['3'],
    '4P': ['11', '4'],
    '4A': ['#11', '#4'],
    '5d': ['b5'],
    '5P': ['5'],
    '5A': ['#5'],
    '6m': ['b13', 'b6'],
    '6M': ['13', '6'],
    '7m': ['b7'],
    '7M': ['7', '^7', 'maj7']
};

/*
Lower Interval Limits (just guidelines):
2m: E3-F3
2M: Eb3-F3
3m: C3-Eb3
3M: Bb2-D3
4P: Bb2-Eb3
5D: B2-F3
5P: Bb1-F2
6m: F2-Db3
6M: F2-D3
7m: F2-Eb3
7m: F2-E3
8P: -

more rough: top note should be D3 or higher.
taken from https://www.youtube.com/watch?v=iW6YeDJklhQ
*/

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

export function isBlack(note) {
    return Note.props(note).acc !== '';
}

export function isSameNote(noteA, noteB) {
    return Note.midi(noteA) === Note.midi(noteB);
}

export function getTonalChord(chord: string) {
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

export function getMidi(note, offset = 0) {
    return Note.midi(note) - offset;
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
    if (fraction === NaN) {
        console.warn('fraction NaN', divisions, pattern);
    }
    return { chord: this.getPath(path, measures), pattern, path, divisions, fraction };
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

export function intervalComplement(interval) {
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

export function invertInterval(interval) {
    if (!interval) {
        return null;
    }
    const positive = interval.replace('-', '');
    const complement = intervalComplement(positive);
    const isNegative = interval.length > positive.length;
    return (isNegative ? '' : '-') + complement;
}

/** Transforms interval into one octave (octave+ get octaved down) */
export function fixInterval(interval = '', simplify = false) {
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

declare type intervalDirection = 'up' | 'down';
declare type step = string | number;

/** inverts the interval if it does not go to the desired direction */
export function forceDirection(interval, direction: intervalDirection, noUnison = false) {
    const semitones = Interval.semitones(interval);
    if ((direction === 'up' && semitones < 0) ||
        (direction === 'down' && semitones > 0)) {
        return invertInterval(interval);
    }
    if (interval === '1P' && noUnison) {
        return (direction === 'down' ? '-' : '') + '8P';
    }
    return interval;
}

// use Interval.ic?
export function minInterval(interval, direction?: intervalDirection, noUnison?) {
    interval = fixInterval(interval, true);
    if (direction) {
        return forceDirection(interval, direction, noUnison)
    }
    let inversion = invertInterval(interval);
    if (Math.abs(Interval.semitones(inversion)) < Math.abs(Interval.semitones(interval))) {
        interval = inversion;
    }
    return interval;
}

export function mapMinInterval(direction?: intervalDirection) {
    return (interval) => minInterval(interval, direction);
}

// sort function
export function sortMinInterval(preferredDirection: intervalDirection = 'up', accessor = (i => i)) {
    return (a, b) => {
        const diff = Math.abs(Interval.semitones(accessor(a))) - Math.abs(Interval.semitones(accessor(b)));
        if (diff === 0) {
            return preferredDirection === 'up' ? -1 : 1;
        }
        return diff;
    }
}

/** Returns the note with the least distance to "from" */
export function getNearestNote(from, to, direction?: intervalDirection) {
    let interval = minInterval(Distance.interval(Note.pc(from), Note.pc(to)), direction);
    return Distance.transpose(from, interval);
}

/** Returns the note with the least distance to "from". TODO: add range */
export function getNearestTargets(from, targets, preferredDirection: intervalDirection = 'down',/*  flip = false */) {
    let intervals = targets
        .map((target) => Distance.interval(Note.pc(from), target))
        .map(mapMinInterval(preferredDirection))
        .sort(sortMinInterval(preferredDirection))
    /* if (flip) {
        intervals = intervals.reverse();
    } */
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
        console.log('tp up');
        return transposeToRange(notes, range, ++times);
    }
    if (notes.find(note => Distance.semitones(note, range[1]) < 0)) {
        console.log('tp down');
        notes = notes.map(note => Distance.transpose(note, '-8P'));
        return transposeToRange(notes, range, ++times);
    }
    return notes;
}

export function getAverageMidi(notes, offset?) {
    return notes.reduce((sum, note) => sum + getMidi(note, offset), 0) / notes.length;
}

export function getRangePosition(note: string | number, range) {
    note = getMidi(note);
    range = range.map(n => getMidi(n));
    const semitones = [note - range[0], range[1] - range[0]];
    return semitones[0] / semitones[1];
}

export function getRangeDirection(note, range, defaultDirection: intervalDirection = 'down', border = 0): { direction: intervalDirection, force: boolean } {
    const position = getRangePosition(note, range);
    if (position <= border) {
        return { direction: 'up', force: true }
    } if (position >= (1 - border)) {
        return { direction: 'down', force: true }
    }
    return {
        direction: defaultDirection, force: false
    }
}

// accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval
export function getStep(step: step) {
    if (typeof step === 'number' && step < 0) {
        step = 'b' + (step * -1);
    }
    return step + ''; // to string
}

export function getIntervalFromStep(step: step) {
    step = getStep(step);
    const interval = Object.keys(steps)
        .find(i => steps[i].includes(step));
    if (!interval) {
        // console.warn(`step ${step} has no defined inteval`);
    }
    return interval;
}

export function getStepsFromDegree(degree) {
    return
}

export function getStepInChord(note, chord, group?) {
    return getStepFromInterval(
        Distance.interval(
            Chord.tokenize(getTonalChord(chord))[0],
            Note.pc(note))
    );
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


export function findDegree(degreeOrStep: number | step, intervalsOrSteps: string[]) {
    const intervals = intervalsOrSteps.map(i => isInterval(i) ? i : getIntervalFromStep(i));
    if (typeof degreeOrStep === 'number') { // is degree
        const degree = Math.abs(degreeOrStep);
        return intervals.find(i => {
            i = minInterval(i, 'up');
            if (!steps[i]) {
                console.error('interval', i, 'is not valid', intervals);
            }
            return !!(steps[i].find(step => getDegreeFromStep(step) === degree));
        });
    }
    // is step
    const step = getStep(degreeOrStep);
    return intervals.find(i => i.includes(step) ||
        i === getIntervalFromStep(step));
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

export function getStepFromInterval(interval) {
    return steps[interval] ? steps[interval][0] : 0;
}

export function getDegreeFromInterval(interval = '-1', simplify = false) {
    const fixed = fixInterval(interval, simplify) || '';
    const match = fixed.match(/[-]?([1-9])+/);
    if (!match) {
        return 0;
    }
    return Math.abs(parseInt(match[0], 10));
}

export function getDegreeFromStep(step: step) {
    step = getStep(step);
    return parseInt(step.match(/([1-9])+/)[0], 10);
}

export function getDegreeInChord(degree, chord) {
    chord = getTonalChord(chord);
    const intervals = Chord.intervals(chord);
    const tokens = Chord.tokenize(chord);
    return Distance.transpose(tokens[0], findDegree(degree, intervals));
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



export function totalDiff(diff) {
    const total = diff.reduce((weight, diff) => {
        weight.added += diff.added ? diff.count : 0;
        weight.removed += diff.added ? diff.count : 0;
        weight.kept += (!diff.added && !diff.removed) ? diff.count : 0;
        return weight;
    }, { added: 0, removed: 0, kept: 0, balance: 0 });
    total.balance = total.added - total.removed;
    total.changes = total.added + total.removed;
    return total;
}

/** Reorders the given notes to contain the given step as close as possible */
export function sortByDegree(notes, degree) {
    degree = Math.max(degree, (degree + 8) % 8)
    /* const semitones = Interval.semitones(interval); */
    const diffDegrees = (a, b) => Math.abs(getDegreeFromInterval(Distance.interval(a, b)) - degree);
    /* const diffTones = (a, b) => Math.abs(Distance.interval(a, b) - semitones); */
    notes = notes.slice(1).reduce((chain, note) => {
        const closest = notes
            .filter(n => !chain.includes(n))
            .sort((a, b) => diffDegrees(chain[0], a) < diffDegrees(chain[0], b) ? -1 : 1);
        chain.unshift(closest[0]);
        return chain;
    }, [notes[0]]).reverse();

    return notes;
}

/** Returns the given notes with octaves either moving bottom up or top down */
export function renderAbsoluteNotes(notes, octave = 3, direction: intervalDirection = 'up') {
    return notes.reduce((absolute, current, index, notes) => {
        if (index === 0) {
            return [current + octave];
        }
        let interval = Distance.interval(notes[index - 1], current);
        interval = minInterval(interval, direction);
        if (interval === '1P') {
            interval = direction === 'down' ? '-8P' : '8P';
        }
        absolute.push(Distance.transpose(absolute[index - 1], interval));
        return absolute;
    }, []);
}

export function getIntervals(notes) {
    return notes.reduce((intervals, note, index, notes) => {
        if (index === 0) {
            return [];
        }
        intervals.push(Distance.interval(notes[index - 1], note));
        return intervals;
    }, []);
}

export function isInterval(interval) {
    return typeof Interval.semitones(interval) === 'number';
}

export function smallestInterval(intervals) {
    return intervals.reduce((min, current) => {
        if (!min || Distance.semitones(current) < Distance.semitones(min)) {
            return current;
        }
        return min;
    });
}

export function sortNotes(notes, direction: intervalDirection = 'up') {
    return notes.sort((a, b) => getMidi(a) - getMidi(b));
}

export function analyzeVoicing(notes, root?) {
    if (!notes || notes.length < 2) {
        throw new Error('Can only analyze Voicing with at least two notes');
    }
    notes = sortNotes(notes);
    root = root || notes[0]; // TODO: get degrees
    const intervals = getIntervals(notes);
    const sortedIntervals = intervals.sort(sortMinInterval());
    return {
        notes,
        minInterval: sortedIntervals[0],
        maxInterval: sortedIntervals[sortedIntervals.length - 1],
        intervals,
        spread: Distance.interval(notes[0], notes[notes.length - 1])
    }
}

export function analyzeVoiceLeading(voicings, min = true) {
    const len = voicings.length;
    if (len < 2) {
        throw new Error('cannot analyze voice leading with only one chord..');
    }
    const data = voicings.reduce((data, voicing, index) => {
        if (!index) {
            return data;
        }
        return {
            movement: data.movement + voicingMovement(voicings[index - 1], voicing, min),
            difference: data.difference + voicingDifference(voicings[index - 1], voicing, min),
            voiceDifference: data.voiceDifference + voicingDifference(voicings[index - 1], voicing, min) / voicings[index - 1].length,
        }
    }, { movement: 0, difference: 0, voiceDifference: 0 });
    return {
        ...data,
        latestMovement: voicingMovement(voicings[len - 2], voicings[len - 1], false),
        latestDifference: voicingDifference(voicings[len - 2], voicings[len - 1], false),
        averageMovement: data.movement / voicings.length,
        averageDifference: data.difference / voicings.length,
        averageVoiceDifference: data.voiceDifference / voicings.length,
    }
}

// returns array of intervals that lead the voices of chord A to chordB
export function minIntervals(chordA, chordB) {
    return chordA.map((n, i) => minInterval(Distance.interval(n, chordB[i])));
}

export function semitoneDifference(intervals) {
    return intervals.reduce((semitones, interval) => {
        return semitones + Math.abs(Interval.semitones(interval))
    }, 0);
}
export function semitoneMovement(intervals) {
    return intervals.reduce((semitones, interval) => {
        return semitones + Interval.semitones(interval)
    }, 0);
}

export function longestChild(array: any[][]) {
    return array.reduce((max, current) => (current.length > max.length ? current : max), array[0]);
}

export function isPitchClass(note) {
    return Note.pc(note) === note;
}

export function voicingIntervals(chordA, chordB, min = true, direction?: intervalDirection) {
    if (chordA.length !== chordB.length) {
        // console.log('voicingIntervals: not the same length..');
    }
    const intervals = chordA.map((n, i) => {
        const interval = Distance.interval(n, chordB[i]);
        if (min === false) {
            return interval;
        }
        if (isPitchClass(n) && isPitchClass(chordB[i])) {
            return minInterval(interval, direction);
        }
        return interval;
    });
    return intervals;
}

export function voicingDifference(chordA, chordB, min = true) {
    return semitoneDifference(voicingIntervals(chordA, chordB, min));
}

export function voiceLeading(chordA, chordB) {
    const origin = [].concat(chordA);
    const targets = [].concat(chordB);
    const flare = chordA.length < chordB.length;
    [chordA, chordB] = [chordA, chordB].sort((a, b) => b.length - a.length);
    return Permutation.binomial(chordA, chordB.length)
        .map(permutation => {
            const [from, to] = flare ? [chordB, permutation] : [permutation, chordB];
            let intervals = voicingIntervals(from, to, false)
                .map(interval => fixInterval(interval, false));
            const degrees = intervals.map(i => getDegreeFromInterval(i));
            const oblique = origin.filter((n, i) => targets.find(note => isSameNote(n, note)));
            let dropped = [], added = [];
            const difference = semitoneDifference(intervals);
            if (!flare) {
                dropped = origin.filter(n => !permutation.includes(n));
            } else {
                added = targets.filter(n => !permutation.includes(n));
            }
            const movement = semitoneMovement(intervals);
            const similar = Math.abs(movement) === Math.abs(difference);
            const parallel = difference > 0 && similar && degrees.reduce((match, degree, index) =>
                match && (index === 0 || degrees[index - 1] === degree), true);
            return {
                origin,
                targets,
                permutation,
                intervals,
                difference,
                movement,
                bottomInterval: intervals[0],
                topInterval: intervals[intervals.length - 1],
                similar, // same direction,
                contrary: !similar, // different direction,
                parallel, // same direction, same interval qualities,
                oblique,
                dropped,
                added,
                degrees
            }
        });
}

export function bestVoiceLeading(chordA, chordB, sortFn?) {
    sortFn = sortFn || ((a, b) => a.difference - b.difference);
    const voices = voiceLeading(chordA, chordB)
        .map(voicing => ({
            ...voicing,
            origin: chordA,
            notes: chordB
        }))
        .sort((best, current) => {
            return sortFn(best, current);
        }, null);
    return voices[0];
}

export function minVoiceMovement(chordA, chordB) {
    [chordA, chordB] = [chordA, chordB].sort((a, b) => b.length - a.length);
    const picks = Permutation.binomial(chordA, chordB.length);
    return picks.reduce((min, current) => {
        const diff = voicingMovement(current, chordB, false);
        if (Math.abs(diff) < Math.abs(min)) {
            return diff;
        }
        return min;
    }, 100);
}


export function voicingMovement(chordA, chordB, min = true, direction?: intervalDirection) {
    return semitoneMovement(voicingIntervals(chordA, chordB, min, direction));
}

export function getVoiceLeadingCombinations(chordA, chordB) {
    const chords = [chordA, chordB].sort(c => c.length);
    const diff = chords[1] - chords[0];
    if (diff === 0) {
        return
    }

    // 4,4 > 1: 2 1111 (15)
    // 3,4 > 0111 (7), 1011 (11), 1101 (13), 1110 (14)
    // 2,4 > 1100 (12), 1010 (10), 1001 (9), 0110 (6), 0101 (5), 0011 (3)
    // 1,4 > 1000 (8), 0100 (4), 0010 (2), 0001 (1)
    // 3,3 > 111
    // 2,3 > 110, 101, 011
    // 1,3 > 100, 010, 001



}

export function mapTree(
    tree,
    modifier?,
    simplify = false,
    path = [],
    siblings = [],
    position = 0) {
    // skip current tree if only one child
    if (simplify && Array.isArray(tree) && tree.length === 1) {
        return mapTree(
            tree[0], modifier, simplify,
            path, siblings, position
        );
    }

    let fraction = siblings.reduce((f, d) => f / d, 1);
    if (!Array.isArray(tree)) {
        return modifier ? modifier(tree, { path, siblings, fraction, position }) : tree;
    }
    if (Array.isArray(tree)) {
        siblings = siblings.concat([tree.length]);
        fraction = fraction / tree.length;
        return tree.map((subtree, index) =>
            mapTree(
                subtree, modifier, simplify,
                path.concat([index]),
                siblings,
                position + index * fraction
            )
        )
    }
}

export function flattenTree(tree) {
    const flat = []
    mapTree(tree, (value, props) => flat.push(Object.assign(props, { value })));
    return flat;
}

export function expandTree(tree) {
    // TODO
}

/* Returns true if the given intervals are all present in the chords interval structure
Intervals can be appendend with "?" to indicate that those degrees could also be omitted 
(but when present they should match)
*/
export function chordHasIntervals(chord, intervals) {
    chord = getTonalChord(chord);
    const has = Chord.intervals(chord);
    return intervals.reduce((match, current) => {
        const isOptional = current.includes('?');
        const isForbidden = current.includes('!');
        if (isOptional) {
            current = current.replace('?', '');
            return (!hasDegree(getDegreeFromInterval(current), has) ||
                has.includes(current)) && match;
        }
        if (isForbidden) {
            current = current.replace('!', '');
            return !hasDegree(getDegreeFromInterval(current), has);
        }
        return has.includes(current) && match;
    }, true);
}

export function isDominantChord(chord) {
    return chordHasIntervals(chord, ['3M', '7m']) || chordHasIntervals(chord, ['!3', '4P', '7m']);
}
export function isMajorChord(chord) {
    return chordHasIntervals(chord, ['3M', '7M?']);
}
export function isMinorChord(chord) {
    return chordHasIntervals(chord, ['3m']);
}
export function isMinorTonic(chord) {
    return chordHasIntervals(chord, ['3m', '5P', '13M?', '7M?']);
}

export function getChordType(chord) {
    if (isDominantChord(chord)) {
        return 'dominant';
    }
    if (isMajorChord(chord)) {
        return 'major';
    }
    if (isMinorTonic(chord)) {
        return 'minor-tonic';
    }
    if (isMinorChord(chord)) {
        return 'minor';
    }
}

export function permutateArray(array) {
    if (array.length === 1) { return array; }
    return array.reduce((combinations, el) => [
        ...combinations,
        ...permutateArray(array.filter(e => e !== el))
            .map(subcombinations => ([el, ...subcombinations]))
    ], []);
}

export function permutateElements(array, validate?, path = []) {
    const isValid = (next) => !validate || validate(path, next, array);
    if (array.length === 1) {
        return isValid(array[0]) ? array : []
    }
    return array.filter(isValid).reduce((combinations, el) => [
        ...combinations,
        ...permutateElements(
            array.filter(e => e !== el),
            validate,
            path.concat([el])
        ).map(subcombinations => [
            el,
            ...subcombinations
        ])
    ], []);
}

export function permutationComplexity(array, validate?, path = []) {
    let validations = 0;
    permutateElements(array, (path, next, array) => {
        ++validations;
        return !validate || validate(path, next, array)
    }, path);
    return validations;
}

export function validateInterval(validate: (interval: string, { path, next, array }) => boolean) {
    return (path, next, array) => {
        if (!path.length) { return true }
        const interval = Distance.interval(path[path.length - 1], next);
        return validate(interval, { path, next, array });
    }
}

// combine multiple validators
export function combineValidators(...validators: ((path, next, array) => boolean)[]) {
    return (path, next, array) => validators
        .reduce((result, validator) => result && validator(path, next, array), true);
}

export function notesAtPositionValidator(notes = [], position) {
    return (selected, note, remaining) => {
        return !notes.length || selected.length !== position || notes.includes(note);
    }
}

declare type VoicingValidation = {
    maxDistance?: number,
    minBottomDistance?: number,
    minTopDistance?: number,
    topNotes?: string[] // accepted top notes
    bottomNotes?: string[] // accepted top notes
};

export function voicingValidator(options?: VoicingValidation) {
    options = {
        maxDistance: 6, // max semitones between any two sequential notes
        minBottomDistance: 3, // min semitones between the two bottom notes
        minTopDistance: 3, // min semitones between the two top notes
        ...options,
    }
    return (path, next, array) => {
        return combineValidators(
            notesAtPositionValidator(options.topNotes, path.length + array.length - 1),
            notesAtPositionValidator(options.bottomNotes, 0),
            validateInterval(interval => Interval.semitones(interval) <= options.maxDistance),
            validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) >= options.minTopDistance),
            validateInterval((interval, { path }) => path.length !== 1 || Interval.semitones(interval) >= options.minBottomDistance)
        )(path, next, array);
    }
}

export function getVoicingCombinations(notes, options: VoicingValidation = {}, validator = (path, next, array) => true) {
    return permutateElements(notes, combineValidators(validator, voicingValidator(options)));
}

// finds best combination following the given notes, based on minimal movement
export function bestCombination(notes, combinations = []) {
    return combinations.reduce((best, current) => {
        const currentMovement = voicingDifference(notes, current);
        const bestMovement = voicingDifference(notes, best);
        if (Math.abs(currentMovement) < Math.abs(bestMovement)) {
            return current;
        }
        return best;
    });
}

export function sortCombinationsByMovement(notes, combinations, direction: intervalDirection = 'up', min = true) {
    const movements = combinations.map((combination) => ({
        movement: voicingMovement(notes, combination, min),
        combination
    }));
    let right = movements.filter(move => direction === 'up' ? move >= 0 : move <= 0);
    if (!right.length) {
        right = movements;
    }
    let sorted = right.sort((a, b) => a.movement - b.movement);
    if (direction === 'down') {
        sorted = sorted.reverse();
    }
    return sorted.map(movement => movement.combination);
}

export function getChordNotes(chord, validate?) {
    chord = getTonalChord(chord);
    const tokens = Chord.tokenize(chord);
    const notes = Chord.notes(chord);
    return notes.filter(note => {
        const interval = Distance.interval(tokens[0], note);
        return !validate || validate(note, {
            root: tokens[0],
            symbol: tokens[1],
            interval,
            step: getStepFromInterval(interval),
            degree: getDegreeFromInterval(interval)
        });
    });
}

export function validateWithoutRoot(note, { degree }) {
    return degree !== 1;
}

// OLD...
export function getVoicing(chord, { voices, previousVoicing, omitRoot, quartal }: {
    previousVoicing?: string[],
    voices?: number,
    omitRoot?: boolean,
    quartal?: boolean
} = {}) {
    chord = getTonalChord(chord);
    const tokens = Chord.tokenize(chord);
    let notes = Chord.notes(chord);
    if (omitRoot) {
        notes = notes.filter(n => n !== tokens[0]);
    }
    if (quartal) {
    }
    if (previousVoicing) {

    }
    return notes;
}

export function semitoneDistance(noteA, noteB) {
    return Interval.semitones(Distance.interval(noteA, noteB));
}

export function getAllTensions(root) {
    return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
        .map(step => getIntervalFromStep(step))
        .map(interval => Distance.transpose(root, interval));
}

export function getAvailableTensions(chord) {
    chord = getTonalChord(chord);
    const notes = Chord.notes(chord);
    if (isDominantChord(chord)) {
        return getAllTensions(notes[0])
            // filter out tensions that are part of the chord
            .filter(note => !notes.find(n => semitoneDistance(notes[0], note) === semitoneDistance(notes[0], n)))
            // filter out tensions that are a semitone above the 3 (if exists)
            .filter(note => chordHasIntervals(chord, ['3!']) || semitoneDistance(getDegreeInChord(3, chord), note) > 1)
            // filter out tensions that are a semitone above the 4 (if exists => sus)
            .filter(note => !chordHasIntervals(chord, ['4P']) || semitoneDistance(getDegreeInChord(4, chord), note) > 1)
            // filter out tensions that are a semitone above the 7
            .filter(note => semitoneDistance(getDegreeInChord(7, chord), note) > 1)
    }
    return notes.slice(0, 4)
        // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
        .filter(note => note === notes[0] || semitoneDistance(note, notes[0]) > 2)
        // all tensions are a major second above a chord note
        .map(note => Distance.transpose(note, '2M'))
        // tensions 2 semiontes below root are flat 7 => changes chord quality
        .filter(note => semitoneDistance(note, notes[0]) !== 2)
    // omit tensions that end up on a chord note again?
}

// Returns all notes required for a shell chord
export function getRequiredNotes(chord) {
    chord = getTonalChord(chord);
    const notes = Chord.notes(chord);
    const intervals = Chord.intervals(chord);

    let required = [3, 4, 'b5', 7].reduce((required, degree) => {
        if (hasDegree(degree, intervals)) {
            required.push(getDegreeInChord(degree, chord));
        }
        return required;
    }, []);
    // is a flat 5 required?
    if (notes.length > 3 && !required.includes(notes[notes.length - 1])) {
        required.push(notes[notes.length - 1]); // could check if is 5 than dont push
    }
    return required;
}

export function getOptionalNotes(chord, required?) {
    chord = getTonalChord(chord);
    const notes = Chord.notes(chord);
    required = required || getRequiredNotes(chord);
    return notes.filter(note => !required.includes(note));
}

export function getPossibleVoicings(chord, voices = 4) {
    const required = getRequiredNotes(chord);
    const optional = getOptionalNotes(chord);
    const tensions = getAvailableTensions(chord);
    return { required, optional, tensions };
}

export function getVoices(chord, voices = 4, rootless = false, tension = 1) {
    // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
    chord = getTonalChord(chord);
    const intervals = Chord.intervals(chord);
    const tokens = Chord.tokenize(chord);
    const required = getRequiredNotes(chord);
    let optional = getOptionalNotes(chord, required);
    let choices = [].concat(required);
    const remaining = () => voices - choices.length;
    if (tension > 0) {
        choices = choices.concat(getAvailableTensions(chord).slice(0, tension));
        /* console.log(chord, 'tension', tensions); */
    }
    if (remaining() > 0) {
        choices = choices.concat(optional);
    }
    if (remaining() < 0 && rootless) {
        choices = choices.filter(n => n !== tokens[0]);
    }
    if (remaining() > 0) {
        // console.warn(`${remaining} notes must be doubled!!!`);
        choices = choices.concat(required, optional).slice(0, voices);
    }
    return choices.slice(0, voices);
}
export function noteArray(range) {
    const slots = Interval.semitones(Distance.interval(range[0], range[1]));
    return new Array(slots + 1)
        .fill('')
        .map((v, i) => Distance.transpose(range[0], Interval.fromSemitones(i)))
        .map(n => Note.simplify(n))
}

export function getAllChoices(combinations, lastVoicing) {
    const lastPitches = lastVoicing.map(note => Note.pc(note));
    return combinations.map(combination => ({
        combination,
        bottomInterval: Distance.interval(lastPitches[0], combination[0]),
    })).map(({ combination, bottomInterval }) => {
        return {
            combination,
            bottomNotes: [
                Distance.transpose(lastVoicing[0], minInterval(bottomInterval, 'down')),
                Distance.transpose(lastVoicing[0], minInterval(bottomInterval, 'up')),
            ]
        }
    }).reduce((all, { combination, bottomNotes }) => {
        return all.concat([
            renderAbsoluteNotes(combination, Note.oct(bottomNotes[0])),
            renderAbsoluteNotes(combination, Note.oct(bottomNotes[1])),
        ])
    }, []).map(notes => {
        return bestVoiceLeading(lastVoicing, notes, (a, b) => {
            /* return Math.abs(Interval.semitones(a.topInterval)) - Math.abs(Interval.semitones(b.topInterval)) */
            return Math.abs(a.movement) - Math.abs(b.movement);
            /* return a.difference - b.difference; */
        });
    })
}

export function factorial(n) {
    let value = 1;
    for (let i = 2; i <= n; ++i) {
        value *= i;
    }
    return value;
}

export function getNextVoicing(chord, lastVoicing, range = ['C3', 'C5'], maxVoices = 4) {
    // make sure tonal can read the chord
    chord = getTonalChord(chord);
    if (chord === 'r') {
        return null;
    }
    // get chord notes
    // const notes = getVoices(chord, 5, false, 0);
    const notes = getVoices(chord, maxVoices, false, 0);
    // find valid combinations
    let combinations = permutateElements(notes,
        voicingValidator({
            maxDistance: 7
        }));
    if (!combinations.length) {
        console.log('no combinations found chord', chord, notes, lastVoicing);
        return [];
    }

    if (!lastVoicing || !lastVoicing.length) { // no previous chord
        // get lowest possible bottom note
        const firstPick = randomElement(combinations);
        const firstNoteInRange = getNearestNote(range[0], firstPick[0], 'up');
        const pick = renderAbsoluteNotes(firstPick, Note.oct(firstNoteInRange));
        Logger.logVoicing({ chord, lastVoicing, range, notes, combinations, pick });
        return pick;
    }

    let choices = getAllChoices(combinations, lastVoicing)
        .sort((a, b) => {
            /* return Math.abs(a.movement) - Math.abs(b.movement) */
            return Math.abs(a.difference) - Math.abs(b.difference)
        });

    let rangeDirection = getRangeDirection(lastVoicing[0], range, 'down', 0.1);
    if (!rangeDirection.force) {
        rangeDirection = getRangeDirection(lastVoicing[lastVoicing.length - 1], range, 'down', 0.1);
    }
    let bestPick = choices[0].notes, choice;
    let { direction, force } = rangeDirection;
    if (!force) {
        const pick = bestPick;
        choice = choices[0];
        Logger.logVoicing({ chord, lastVoicing, range, notes, combinations, pick, direction, bestPick, force, choice, choices });
        return pick;
    }
    // sort after movement
    choices = choices.sort((a, b) => {
        return Math.abs(a.movement) - Math.abs(b.movement)
    });
    choice = choices.find(choice => {
        if (direction === 'up') {
            return choice.movement > 0
        }
        return choice.movement < 0;
    });
    if (!choice) {
        choice = choices[0];
    }
    const pick = choice.notes;
    Logger.logVoicing({ chord, lastVoicing, range, notes, combinations, pick, direction, bestPick, force, choice, choices });
    return pick;
}