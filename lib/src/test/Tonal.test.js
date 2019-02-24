"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
test('Tonal.Interval', function () {
    expect(tonal_1.Distance.interval('D', 'C')).toBe('7m');
    expect(tonal_1.Distance.interval('C', 'D')).toBe('2M');
    expect(tonal_1.Distance.interval('D', 'Db')).toBe('8d');
    expect(tonal_1.Distance.interval('D#', 'D')).toBe('8d');
    expect(tonal_1.Distance.interval('Db', 'D')).toBe('1A');
    expect(tonal_1.Distance.interval('D', 'D#')).toBe('1A');
    expect(tonal_1.Distance.interval('D2', 'Db2')).toBe('-1A');
    expect(tonal_1.Distance.interval('D2', 'D#2')).toBe('1A');
    expect(tonal_1.Distance.interval('D2', 'Db3')).toBe('8d');
    expect(tonal_1.Distance.interval('D2', 'D#3')).toBe('8A');
    expect(tonal_1.Distance.interval('D2', 'D#1')).toBe('-8d');
    expect(tonal_1.Distance.interval('D2', 'Db1')).toBe('-8A');
    /* expect(Interval.invert('1A')).toBe('8d'); // fails
    expect(Interval.invert('1d')).toBe('8A');
    expect(Interval.invert('1P')).toBe('8P');
    expect(Interval.invert('8P')).toBe('1P');
    expect(Interval.invert('8d')).toBe('1A'); */
});
test('Tonal.chord', function () {
    expect(tonal_2.Chord.notes('FM69')).toEqual(['F', 'A', 'C', 'D', 'G']);
    /* expect(Chord.notes('Fm6')).toEqual(['F', 'Ab', 'C', 'D']); */ // fails
});
