import { Harmony } from '../harmony/Harmony';
import { Note } from 'tonal';

test('isBlack', () => {
    expect(Harmony.isBlack('B3')).toEqual(false);
    expect(Harmony.isBlack('Ab3')).toEqual(true);
    expect(Harmony.isBlack('Bb3')).toEqual(true);
    expect(Harmony.isBlack('C3')).toEqual(false);
});
test('isSame', () => {
    expect(Harmony.isSameNote('Bb3', 'A#3')).toEqual(true);
    expect(Harmony.isSameNote('Cb3', 'B2')).toEqual(true);
    expect(Harmony.isSameNote('A3', 'A2')).toEqual(false);
    expect(Harmony.isSameNote('A3', 'B2')).toEqual(false);
    expect(Harmony.isSameNote('A3', 'A2')).toEqual(false);
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
})
