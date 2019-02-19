import { swing } from "../grooves/swing";
import { Note } from 'tonal';
import { getPatternInChord, randomElement, transposeToRange, getDigitalPattern, getRangePosition, otherDirection, getStepInChord } from "../util/util";
import { Improvisation } from "./Improvisation";
import { Harmony } from '../harmony/Harmony';

export const permutator = new Improvisation({
    groove: swing,
    groovePattern: ({ groove }) => groove()['solo'] || ((m) => {
        return m.measure.map(() => [1]);
    }),
    octave: 4,
    reach: 1,
    lineBreaks: false,
    direction: null,
    force: false,
    flip: false, // if true, the voice leading will be stretched out
    playedNotes: [],
    fixRange: true,
    startRandom: false,
    range: ['Bb3', 'Bb5'],
    /* chanceCurve: () => (distance, length) => (length - distance) * 10, */
    firstNoteInPattern: ({ pattern, chord }) => getPatternInChord([pattern()[0]], chord()),
    firstNote: ({ randomNote, firstNoteInPattern, startRandom, octave }) => {
        return startRandom() ? randomNote() : firstNoteInPattern() + octave();
    },
    lastNote: ({ playedNotes }) => playedNotes().length ? playedNotes()[0] : null,
    material: ({ pattern, chord }) => getPatternInChord(pattern(), chord()),
    randomNote: ({ material, octave }) => randomElement(material()) + octave(),
    nextNotes: ({ fixRange, firstNote, chord, reach, lineBreaks, lastNote, range, material, direction, force, flip }) => {
        let note;
        if (!lastNote() || lineBreaks()) {
            note = firstNote();
        } else {
            const choices = material();
            if (!choices.length) {
                console.warn('no choice..')
                return;
            }
            let targets = Harmony.getNearestTargets(lastNote(), material(), direction(), flip());
            targets = targets.slice(0, reach());
            note = randomElement(targets);
            note = Note.simplify(note, true);
        }
        if (fixRange()) {
            note = transposeToRange([note], range())[0];
        }
        const step = getStepInChord(note, chord());
        /* console.log(`${step} in ${chord()} = ${note}`); */
        return [note];
    }
});

/** MODIFIERS */

const getStraightBar = (notes, cycle = 4) => {
    return new Array(cycle).fill(
        new Array(Math.ceil(notes / cycle)).fill(1)
    )
}

const straightNotes = (n, cycle = 4) => ({
    groove: null,
    groovePattern: () => ((m) =>
        getStraightBar(n, cycle)
    ),
});

const fixedNotesPerChord = (n, cycle = 4) => ({
    groove: null,
    groovePattern: () => ((m) => m.measure.map(() =>
        getStraightBar(n, cycle)
    )),
});

const pendulum = (defaultDirection = 'up', softForce = false, comfort = .4) => ({
    exclude: 1, // only last note cannot be picked again
    force: !softForce ? true : ({ lastNote, range }) => {
        const position = getRangePosition(lastNote(), range());
        return position < 0 || position > 1; // only force if out of range..    
    }, // force the current direction
    fixRange: false, // do not transpose automatically to range (direction will do that)
    direction: ({ lastNote, range, direction, barNumber, isBarStart }) => {
        const position = getRangePosition(lastNote(), range());
        const comfortSwitchBars = 1; // switch direction each x bars when in comfort zone
        const isComfortZone = (position > comfort && position < 1 - comfort);
        if (
            (position <= 0 && direction() === 'down') ||
            (position >= 1 && direction() === 'up') ||
            (isComfortZone && isBarStart() && barNumber() % comfortSwitchBars === 0)
        ) {
            /* console.log('change direction', otherDirection(direction(), defaultDirection)); */
            return otherDirection(direction(), defaultDirection);
        }
        return direction() || defaultDirection;
    }
});

const beatPattern = ({ pattern, on, off, barStart }:
    { pattern?, on?, off?, barStart?}) => ({
        beatPattern: ({ isBarStart, isOffbeat }) => {
            if (isBarStart()) {
                return barStart || on || pattern;
            } else if (!isOffbeat()) {
                return on || pattern;
            }
            return off || pattern;
        },
        pattern: ({ beatPattern }) => beatPattern(),
    });

const notesPerChord = (n) => ({
    ...fixedNotesPerChord(1, n)
});

const patternPractise = (direction = 'up', notes = 4, lineBreaks = false) => ({
    ...straightNotes(notes),
    firstNoteInPattern: ({ pattern, chord }) =>
        getPatternInChord(
            direction === 'up' ? [pattern()[0]] : pattern().slice(-1)
            , chord()
        ),
    direction,
    force: true,
    fixRange: false,
    lineBreaks: ({ isBarStart }) => lineBreaks ? isBarStart() : false,
    exclude: 1,
    reach: 1,
});

/** FORMULAS */


export const advancedPermutator = permutator.enhance({
    drill: .5, // how persistent should the current direction be followed?
    direction: ({ drill }) => drill() > 0 ? 'up' : 'down',
    force: ({ drill }) => Math.random() * Math.abs(drill()) > .5,
    exclude: 1,
    reach: 1,
    material: ({ pattern, chord, playedNotes, exclude }) => {
        const all = getPatternInChord(pattern(), chord());
        if (!playedNotes().length) {
            return all;
        }
        const excludeNotes = playedNotes()
            .slice(0, exclude())
            .map(n => Note.pc(n));
        return all.filter(n => !excludeNotes.includes(n));
    }
});

export const guideTones = advancedPermutator.enhance({
    name: 'Guide Lines',
    ...notesPerChord(1),
    /* direction: 'down', */
    ...pendulum('down', true),
    pattern: [3, 7],
    exclude: 0, // 0 > can repeat notes
    // pattern: ({ isBarStart, barNumber }) => isBarStart() ? [1] : barNumber() % 2 === 0 ? [3] : [7]
});

export const guideTonesFlipped = guideTones.enhance({
    name: 'Distant Guide Tones',
    flip: true
});


export const chordTones = advancedPermutator.enhance({
    name: 'Only Chord Tones',
    pattern: [1, 3, 5, 7],
    drill: .75, // how persistent should the current direction be followed?
    direction: ({ drill }) => drill() > 0 ? 'up' : 'down',
});

/* export const digitalPattern = advancedPermutator.enhance({
    pattern: ({ chord }) => getDigitalPattern(chord()),
    ...pendulum(),
    ...straightNotes(4)
}); */


export const fullScale = advancedPermutator.enhance({
    name: 'Heptatonic',
    /* ...beatPattern({ off: [2, 3, 4, 5, 6, 7], on: [1, 3, 5, 7] }), */
    ...beatPattern({ on: [1, 3, 5, 7], off: [1, 2, 3, 4, 5, 6, 7] }),
    /* ...beatPattern({ on: [3, 7], off: [9, 11, 13] }), */
    /* ...beatPattern({ on: [9], off: [9, 11, 13] }), */
    /* ...beatPattern({ on: [1, 3, 7], off: [9, 11, 13] }), */
    ...pendulum(),
    /* exclude: Math.floor(Math.random() + .5), */
    /* exclude: 1,
    reach: 2, */
    /* reach: Math.round(Math.random() * 1 + 1) */
});

export const scalePendulum = advancedPermutator.enhance({
    name: 'Heptatonic Pendulum',
    /* ...straightNotes(8), */
    ...beatPattern({ pattern: [1, 2, 3, 4, 5, 6, 7] }),
    ...pendulum(),
    ...straightNotes(8),
});


export const digitalPattern = advancedPermutator.enhance({
    name: 'Digital Patterns',
    pattern: ({ chord }) => getDigitalPattern(chord()),
    ...pendulum('up', true, .2),
    exclude: 2,
    reach: 3,
});

export const digitalPendulum = advancedPermutator.enhance({
    name: 'Digital Pendulum',
    pattern: ({ chord }) => getDigitalPattern(chord()),
    ...pendulum('up', false, 1),
    ...straightNotes(8),
    /* lineBreaks: ({ isBarStart }) => isBarStart(), */
    exclude: 1,
    reach: 1,
});
export const digitalWalker = advancedPermutator.enhance({
    name: 'Digital Fourths',
    pattern: ({ chord }) => getDigitalPattern(chord()),
    ...pendulum('up', true, .4),
    ...straightNotes(4),
    lineBreaks: false,
    /* lineBreaks: ({ isBarStart }) => isBarStart(), */
    exclude: 2,
    reach: 2,
});

export const digitalPractiseUp = advancedPermutator.enhance({
    name: 'Digital Practise Up',
    ...patternPractise('up', 4, true),
    pattern: ({ chord }) => getDigitalPattern(chord()),
    /* ...beatPattern({ pattern: ({ chord }) => getDigitalPattern(chord()), barStart: [1] }), */
});

export const digitalPractiseDown = advancedPermutator.enhance({
    name: 'Digital Practise Down',
    ...patternPractise('down', 4, true),
    pattern: ({ chord }) => getDigitalPattern(chord()),
    /* ...beatPattern({ pattern: ({ chord }) => getDigitalPattern(chord()), barStart: [1] }), */
});

export const heptatonicPractise = advancedPermutator.enhance({
    name: 'Heptatonic Practise',
    ...patternPractise('up', 8, false),
    ...beatPattern({ barStart: [1], on: [3, 5, 7], off: [1, 2, 3, 4, 5, 6, 7] }),
});

export const defaultMethod = guideTones;

export const improvisationMethods = {
    guideTones,
    guideTonesFlipped,
    chordTones,
    digitalPattern,
    digitalPendulum,
    digitalWalker,
    fullScale,
    scalePendulum,
    digitalPractiseUp,
    digitalPractiseDown,
    /* heptatonicPractise, */
}