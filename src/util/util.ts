import { Chord, Distance, Interval, Note, PcSet, Scale } from 'tonal';
import { Synthesizer } from '../instruments/Synthesizer';
import { scaleNames } from '../symbols';
import { Harmony, step, intervalDirection } from '../harmony/Harmony';

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

/** OLD SHEET / RHYTHM STUFF */

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
    return notes.reduce((sum, note) => sum + Harmony.getMidi(note, offset), 0) / notes.length;
}

export function getRangePosition(note: string | number, range) {
    note = Harmony.getMidi(note);
    range = range.map(n => Harmony.getMidi(n));
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
            Chord.tokenize(Harmony.getTonalChord(chord))[0],
            Note.pc(note))
    );
}

export function getChordScales(chord, group = 'Diatonic') {
    const tokens = Chord.tokenize(Harmony.getTonalChord(chord));
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
            i = Harmony.minInterval(i, 'up');
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
    const fixed = Harmony.fixInterval(interval, simplify) || '';
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
    chord = Harmony.getTonalChord(chord);
    const intervals = Chord.intervals(chord);
    const tokens = Chord.tokenize(chord);
    return Distance.transpose(tokens[0], findDegree(degree, intervals));
}

export function getPatternInChord(pattern, chord) {
    chord = Harmony.getTonalChord(chord);
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
    chord = Harmony.getTonalChord(chord);
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
    chord = Harmony.getTonalChord(chord);
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
        interval = Harmony.minInterval(interval, direction);
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
    return notes.sort((a, b) => Harmony.getMidi(a) - Harmony.getMidi(b));
}

export function analyzeVoicing(notes, root?) {
    if (!notes || notes.length < 2) {
        throw new Error('Can only analyze Voicing with at least two notes');
    }
    notes = sortNotes(notes);
    root = root || notes[0]; // TODO: get degrees
    const intervals = getIntervals(notes);
    const sortedIntervals = intervals.sort(Harmony.sortMinInterval());
    return {
        notes,
        minInterval: sortedIntervals[0],
        maxInterval: sortedIntervals[sortedIntervals.length - 1],
        intervals,
        spread: Distance.interval(notes[0], notes[notes.length - 1])
    }
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
    chord = Harmony.getTonalChord(chord);
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

export function getChordNotes(chord, validate?) {
    chord = Harmony.getTonalChord(chord);
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
    chord = Harmony.getTonalChord(chord);
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

export function noteArray(range) {
    const slots = Interval.semitones(Distance.interval(range[0], range[1]));
    return new Array(slots + 1)
        .fill('')
        .map((v, i) => Distance.transpose(range[0], Interval.fromSemitones(i)))
        .map(n => Note.simplify(n))
}


export function factorial(n) {
    let value = 1;
    for (let i = 2; i <= n; ++i) {
        value *= i;
    }
    return value;
}



// finds best combination following the given notes, based on minimal movement
/* export function bestCombination(notes, combinations = []) {
    return combinations.reduce((best, current) => {
        const currentMovement = voicingDifference(notes, current);
        const bestMovement = voicingDifference(notes, best);
        if (Math.abs(currentMovement) < Math.abs(bestMovement)) {
            return current;
        }
        return best;
    });
} */

/* export function sortCombinationsByMovement(notes, combinations, direction: intervalDirection = 'up', min = true) {
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
 */