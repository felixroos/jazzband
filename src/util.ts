import { Chord, Distance, Interval, Note, PcSet, Scale } from 'tonal';
import { Synthesizer } from './instruments/Synthesizer';
import { scaleNames } from './symbols';
import * as JsDiff from 'diff';
import { unique } from 'tonal-array';

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
    interval = Interval.simplify(interval);/*  || '1P'; */

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
declare type step = string | number;

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
    let interval = minInterval(Distance.interval(Note.pc(from), Note.pc(to)), direction, force);
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
            i = minInterval(i, 'up', true);
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

export function getDegreeFromInterval(interval = '-1') {
    return parseInt(interval.match(/([1-9])+/)[0], 10);
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

function wrapPipes(string) {
    return `|${string}|`.replace(/\|+/g, '|');
}

export function formatChordSnippet(snippet, linebreaks = true) {
    // replaces url chars back
    let compact = minifyChordSnippet(snippet, false);
    compact = wrapPipes(compact);

    if (linebreaks) {
        // insert spaces before first chord
        let bars = compact.split('|').slice(1, -1);
        bars = bars.map((bar, index) => {
            if (!bar[0].match(/[1-9:]/)) {
                bar = '  ' + bar;
            } else if (bar[0] === ':') {
                bar = ': ' + bar.slice(1);
            }
            return bar;
        });
        // find out indices of first houses
        const houses = bars.reduce((offset, bar, index) => {
            if (bar[0] === '1') {
                offset.push(index);
            }
            return offset;
        }, []);
        // insert empty bars before additional houses
        bars = bars.reduce((bars, bar, index) => {
            if (bar[0].match(/[2-9]/)) {
                const offset = houses.filter(h => h < index).reverse()[0];
                bars = bars.concat(new Array(offset % 4).fill(''));
            }
            bars.push(bar);
            return bars;
        }, []);
        // find out the maximal number of chars per column
        const chars = bars.reduce((max, bar, index) => {
            max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
            return max;
        }, []);
        // fill up each bar with spaces
        compact = bars.map((bar, index) => {
            let diff = chars[index % 4] - bar.length + 2;
            if (diff > 0) {
                bar += new Array(diff).fill(' ').join('');
            }
            // move double dots to end of bar
            bar = bar.replace(/:(\s+)$/, '$1:');
            return bar;
        }).join('|');

        compact = wrapPipes(compact);
        // break string all 4 bars
        let pipeIndex = -1;
        compact = compact.split('').reduce((string, char, index) => {
            if (char === '|') {
                pipeIndex++;
            }
            if (char === '|' && pipeIndex % 4 === 0 && index > 0 && index < compact.length - 1) {
                char = "|\n|";
                pipeIndex = 0;
            }
            return string + char;
        }, '');
    } else {
        compact = compact.replace(/\n/g, '|');
    }
    return compact
        .replace(/\|+/g, '|')
        .replace(/\|( +)\|( +)/g, ' $1 $2') // remove spacer bar pipes
        .replace(/\|( +)\|([1-9])/g, ' $1|$2')
}

export function minifyChordSnippet(snippet, urlsafe = false) {
    let compact = (`|${snippet}|`)
        .replace(/\n+/g, '|') // replace line breaks with pipes
        .replace(/\s+/g, ' ') // no repeated pipes
        .replace(/\s?\|\s?/g, '|') // no pipes with spaces
        .replace(/\s?\:\s?/g, ':') // no repeat with spaces
        .replace(/\|+/g, '|') // no repeated pipes
    if (urlsafe) {
        // replaces url unfriendly chars
        compact = compact
            .replace(/\|+/g, 'I')
            .replace(/\s+/g, '_')
            .replace(/:/g, 'R')
            .replace(/\^/g, 'M')
            .replace(/\#/g, 'S')
            .replace(/\%/g, 'X')
    } else {
        // replaces url unfriendly chars
        compact = compact
            .replace(/\I+/g, '|')
            .replace(/\_+/g, ' ')
            .replace(/R/g, ':')
            .replace(/M/g, '^')
            .replace(/X/g, 'x')
            .replace(/S/g, '#')
    }
    return compact.slice(1, -1);
}

export function parseChordSnippet(snippet, simplify = true) {
    const formatted = formatChordSnippet(snippet, false);
    return formatted
        .split('|') // split into measures
        .map(measure => measure.split(' ')) // split measures by spaces
        .map(measure => measure.filter(chord => !!chord)) // kill empty chords
        .filter(measure => !measure || measure.length) // kill empty measures
        .map(measure => ({ symbols: measure, signs: [] }))
        // parse symbols to chords and signs
        .map((measure: { symbols, signs, house, chords }) => {
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

export function formatForDiff(snippet) {
    return minifyChordSnippet(snippet)
        .replace(/\|/g, ' | ').trim();
}

export function chordSnippetDiff(snippetA, snippetB) {
    const diffFormat = [formatForDiff(snippetA), formatForDiff(snippetB)];
    return JsDiff.diffWords(
        diffFormat[0], diffFormat[1]
    );
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
        interval = minInterval(interval, direction, true);
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

export function voicingIntervals(chordA, chordB, min = true, direction?: intervalDirection) {
    const intervals = chordA.map((n, i) => Distance.interval(n, chordB[i]));
    if (min) {
        return intervals.map(i => minInterval(i, direction, !!direction));
    }
    return intervals;
}

export function voicingDifference(chordA, chordB, min = true) {
    return semitoneDifference(voicingIntervals(chordA, chordB, min));
}

export function voicingMovement(chordA, chordB, min = true, direction?: intervalDirection) {
    return semitoneMovement(voicingIntervals(chordA, chordB, min, direction));
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


export function voicingValidator(path, next, array) {
    return combineValidators(
        validateInterval(interval => Interval.semitones(interval) <= 6),
        validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) > 2),
        validateInterval((interval, { array }) => path.length !== 1 || Interval.semitones(interval) > 2)
    )(path, next, array);
}

export function getVoicingCombinations(notes, validator = (path, next, array) => true) {
    return permutateElements(notes, combineValidators(validator, voicingValidator));
}

// finds best combination following the given notes, based on minimal movement
export function bestCombination(notes, combinations) {
    return combinations.reduce((best, current) => {
        const currentMovement = voicingDifference(notes, current);
        const bestMovement = voicingDifference(notes, best);
        if (Math.abs(currentMovement) < Math.abs(bestMovement)) {
            return current;
        }
        return best;
    });
}

export function sortCombinationsByMovement(notes, combinations, direction: intervalDirection = 'up') {
    const up = combinations.sort((a, b) => {
        return voicingMovement(notes, a) - voicingMovement(notes, b)
    });
    if (direction === 'down') {
        return up.reverse();
    }
    return up;
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
    chord = getTonalChord(chord);
    const intervals = Chord.intervals(chord);
    const tokens = Chord.tokenize(chord);
    const required = getRequiredNotes(chord);
    let optional = getOptionalNotes(chord, required);
    if (rootless && !hasDegree('b5', intervals)) {
        optional = optional.filter(note => note !== tokens[0]);
    }
    const options = required.length - tension;
    if (options > 0 && optional.length) {
        optional = optional.slice(0, options);
        /* console.log(chord, 'optional', optional); */
    }
    let tensions = [];
    tension = voices - (required.length + optional.length);
    if (tension > 0) {
        tensions = getAvailableTensions(chord).slice(0, tension);
        /* console.log(chord, 'tension', tensions); */
    }
    const notes = [
        ...required,
        ...optional,
        ...tensions
    ].slice(0, voices);
    if (notes.length < voices) {
        console.warn(`could not get ${voices} voices. Maybe set higher tension (${tension})?`);
    }
    return notes;
}

export function getNextVoicing(chord, lastVoicing, range = ['C3', 'D4']) {
    let bottomOctave = Note.oct(range[0]);
    let nextPitches;
    // make sure tonal can read the chord
    chord = getTonalChord(chord);
    // get chord notes
    /* const notes = Chord.notes(chord); */
    const notes = getVoices(chord, 4, false, 0);
    // find voicings
    const combinations = getVoicingCombinations(notes);
    if (!lastVoicing) {
        return renderAbsoluteNotes(combinations[0], bottomOctave);
    }
    const { direction, force } = getRangeDirection(lastVoicing[0], range);
    // get pitch classes of last voicing
    const lastPitches = lastVoicing.map(n => Note.pc(n));
    if (!force) {
        // find best next combination
        nextPitches = bestCombination(lastPitches, combinations/* , force ? direction : null */);
    } else {
        const movements = sortCombinationsByMovement(lastPitches, combinations, force ? direction : null).reverse();
        nextPitches = movements[0]; // this will use the combination with the most movement in the wrong direction
    }
    // get nearest first note
    const nearest = getNearestNote(lastVoicing[0], nextPitches[0], direction, force);
    bottomOctave = Note.oct(nearest);
    // render all notes, starting from the bottomOctave
    return renderAbsoluteNotes(nextPitches, bottomOctave);
}