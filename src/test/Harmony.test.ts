import { Harmony } from '../harmony/Harmony';
import { Note, Chord } from 'tonal';

test('isBlack', () => {
    expect(Harmony.isBlack('B3')).toEqual(false);
    expect(Harmony.isBlack('Ab3')).toEqual(true);
    expect(Harmony.isBlack('Bb3')).toEqual(true);
    expect(Harmony.isBlack('C3')).toEqual(false);
});
test('hasSamePitch', () => {
    expect(Harmony.hasSamePitch('Bb3', 'A#3')).toEqual(true);
    expect(Harmony.hasSamePitch('Cb3', 'B2')).toEqual(true);
    expect(Harmony.hasSamePitch('A3', 'A2')).toEqual(false);
    expect(Harmony.hasSamePitch('A3', 'B2')).toEqual(false);
    expect(Harmony.hasSamePitch('A3', 'A2')).toEqual(false);
    expect(Harmony.hasSamePitch('C', 'G')).toBe(false);
    expect(Harmony.hasSamePitch('C', 'C')).toBe(true);
    expect(Harmony.hasSamePitch('C', 'B#')).toBe(true);
    expect(Harmony.hasSamePitch('C2', 'C3')).toBe(false);
    expect(Harmony.hasSamePitch('C2', 'C3', true)).toBe(true);
});

test('getMidi', () => {
    expect(Harmony.getMidi('A4')).toBe(69);
    expect(Note.midi('A4')).toBe(69);
    expect(Note.midi(69)).toBe(69);
    expect(Harmony.getMidi(69)).toBe(69);
});

test('getBassNote', () => {
    expect(Harmony.getBassNote('C7')).toBe('C');
    expect(Harmony.getBassNote('C7/Bb')).toBe('Bb');
    expect(Harmony.getBassNote('F#^7')).toBe('F#');
    expect(Harmony.getBassNote('Gb-7b5')).toBe('Gb');
    expect(Harmony.getBassNote('Gb-7b5/Db')).toBe('Db');
    expect(Harmony.getBassNote('')).toBe(null);
});

test('getTonalChord', () => {
    expect(Harmony.getBassNote('C')).toBe('C');
    expect(Harmony.getBassNote('^7')).toBe('');
    expect(Harmony.getBassNote('C', true)).toBe('C');
    expect(Harmony.getBassNote('C7')).toBe('C');
    expect(Harmony.getBassNote('F#7#11')).toBe('F#');
    expect(Harmony.getBassNote('Db7#11/C')).toBe('C');
    expect(Harmony.getBassNote('Db7#11/C', true)).toBe('Db');
    expect(Harmony.getBassNote('W/C')).toBe('C');
    expect(Harmony.getBassNote('W/C', true)).toBe('');
    expect(Harmony.getTonalChord('C')).toBe('C');
    expect(Harmony.getTonalChord('C7')).toBe('C7');
    expect(Harmony.getTonalChord('C^7')).toBe('CM7');
    expect(Harmony.getTonalChord('C-7')).toBe('Cm7');
    expect(Harmony.getTonalChord('Ch7')).toBe('Cm7b5');
    expect(Harmony.getTonalChord('C7b9b5')).toBe('C7b5b9');
    expect(Harmony.getTonalChord('C7b9#5')).toBe('C7#5b9');
    expect(Harmony.getTonalChord('C7#9#5')).toBe('C7#5#9');
    expect(Harmony.getTonalChord('C-9')).toBe('Cm9');
    expect(Harmony.getTonalChord('C7+')).toBe('C7#5');
    expect(Harmony.getTonalChord('C7b13sus')).toBe(null);
    expect(Harmony.getTonalChord('7')).toBe('7');
    expect(Harmony.getTonalChord('-7')).toBe('m7');
    expect(Harmony.getTonalChord('^7')).toBe('M7');
    expect(Harmony.getTonalChord('M7')).toBe('M7');
    expect(Harmony.getTonalChord('m7')).toBe('m7');
});

test('isValidNote',()=>{
    expect(Harmony.isValidNote('C')).toBe(true);
    expect(Harmony.isValidNote('c')).toBe(true);
    expect(Harmony.isValidNote('c#')).toBe(true);
    expect(Harmony.isValidNote('cb')).toBe(true);
    expect(Harmony.isValidNote('cbb')).toBe(true);
    expect(Harmony.isValidNote('c##')).toBe(true);
    expect(Harmony.isValidNote('c#b')).toBe(true);
    expect(Harmony.isValidNote('c3')).toBe(true);
    expect(Harmony.isValidNote('c#3')).toBe(true);
    expect(Harmony.isValidNote('cb3')).toBe(true);
    expect(Harmony.isValidNote('cb33')).toBe(false);
    expect(Harmony.isValidNote('/')).toBe(false);
})
// 7b13 'C', 'E', 'Bb', 'Ab' <= ohne G
// 7#11 'C', 'E', 'G', 'Bb', 'F#' <= mit G
// 11 hat keine terz?!
// -b6 C Eb G# > warum nicht Ab, warum keine quinte?
// C2 C2 E2 G2 ??! 
// C5 C5 E5 G5 ??!