"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Harmony_1 = require("../harmony/Harmony");
var tonal_1 = require("tonal");
test('isBlack', function () {
    expect(Harmony_1.Harmony.isBlack('B3')).toEqual(false);
    expect(Harmony_1.Harmony.isBlack('Ab3')).toEqual(true);
    expect(Harmony_1.Harmony.isBlack('Bb3')).toEqual(true);
    expect(Harmony_1.Harmony.isBlack('C3')).toEqual(false);
});
test('isSame', function () {
    expect(Harmony_1.Harmony.isSameNote('Bb3', 'A#3')).toEqual(true);
    expect(Harmony_1.Harmony.isSameNote('Cb3', 'B2')).toEqual(true);
    expect(Harmony_1.Harmony.isSameNote('A3', 'A2')).toEqual(false);
    expect(Harmony_1.Harmony.isSameNote('A3', 'B2')).toEqual(false);
    expect(Harmony_1.Harmony.isSameNote('A3', 'A2')).toEqual(false);
});
test('getMidi', function () {
    expect(Harmony_1.Harmony.getMidi('A4')).toBe(69);
    expect(tonal_1.Note.midi('A4')).toBe(69);
    expect(tonal_1.Note.midi(69)).toBe(69);
    expect(Harmony_1.Harmony.getMidi(69)).toBe(69);
});
