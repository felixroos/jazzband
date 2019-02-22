"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util = __importStar(require("../util/util"));
var util_1 = require("../util/util");
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var tonal_3 = require("tonal");
var tonal_4 = require("tonal");
var Harmony_1 = require("../harmony/Harmony");
test('getIntervalFromStep: undefined', function () {
    expect(util.getIntervalFromStep('d3g2g3')).toEqual(undefined);
});
test('getIntervalFromStep: numbers', function () {
    expect(util.getIntervalFromStep(1)).toEqual('1P');
    expect(util.getIntervalFromStep(2)).toEqual('2M');
    expect(util.getIntervalFromStep(-2)).toEqual('2m');
    expect(util.getIntervalFromStep(3)).toEqual('3M');
    expect(util.getIntervalFromStep(-3)).toEqual('3m');
    expect(util.getIntervalFromStep(4)).toEqual('4P');
    expect(util.getIntervalFromStep(5)).toEqual('5P');
    expect(util.getIntervalFromStep(6)).toEqual('6M');
    expect(util.getIntervalFromStep(7)).toEqual('7M');
});
test('getIntervalFromStep: strings', function () {
    expect(util.getIntervalFromStep('1')).toEqual('1P');
    expect(util.getIntervalFromStep('b2')).toEqual('2m');
    expect(util.getIntervalFromStep('b3')).toEqual('3m');
});
test('getChordScales', function () {
    expect(util.getChordScales('D-')).toEqual(["dorian",
        "phrygian",
        "aeolian",
        "harmonic minor",
        "dorian #4",
        "melodic minor",
        "melodic minor second mode"]);
    expect(util.getChordScales('D-', 'Basic')).toEqual(["minor pentatonic",
        "minor blues",
        "dorian",
        "phrygian",
        "aeolian"]);
    expect(util.getChordScales('D7#11', 'Diatonic')).toEqual(["lydian dominant"]);
});
test('getDegreeFromStep', function () {
    var fn = util.getDegreeFromStep;
    expect(fn('b3')).toBe(3);
    expect(fn('#9')).toBe(9);
    expect(fn('b9')).toBe(9);
    expect(fn('b2')).toBe(2);
    expect(fn('^7')).toBe(7);
});
test('findDegree', function () {
    expect(util.findDegree(1, tonal_1.Scale.intervals('major'))).toBe('1P');
    expect(util.findDegree(9, tonal_1.Scale.intervals('major'))).toBe('2M');
    expect(util.findDegree(2, tonal_1.Scale.intervals('phrygian'))).toBe('2m');
    expect(util.findDegree(9, tonal_1.Scale.intervals('phrygian'))).toBe('2m');
    expect(util.findDegree(9, tonal_1.Scale.intervals('locrian'))).toBe('2m');
    expect(util.findDegree(3, tonal_1.Scale.intervals('major'))).toBe('3M');
    expect(util.findDegree(3, tonal_1.Scale.intervals('minor'))).toBe('3m');
    expect(util.findDegree('3', tonal_1.Scale.intervals('minor'))).toBe('3m');
    expect(util.findDegree('b3', tonal_1.Scale.intervals('minor'))).toBe('3m');
    expect(util.findDegree('b3', tonal_1.Scale.intervals('major'))).toBe(undefined);
});
test('hasDegree', function () {
    expect(util.hasDegree(3, ['1', 'b3', '5'])).toBe(true);
    expect(util.hasDegree(2, ['1', 'b3', '5'])).toBe(false);
    expect(util.hasDegree(9, ['1', '2M', 'b3', '5'])).toBe(true);
    expect(util.hasDegree(9, ['1', 'b3', '5'])).toBe(false);
});
test('hasAllDegrees', function () {
    expect(util.hasAllDegrees([1, 5, 3], ['1', 'b3', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 5, 2], ['1', 'b3', '5'])).toBe(false);
    expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 'b2'], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 'b9'], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 'b9'], ['1', 'b2', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 9], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 9], ['1', 'b2', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 2], ['1', 'b2', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(true);
});
test('getScaleDegree', function () {
    expect(util.getScaleDegree(1, 'major')).toBe('1P');
    expect(util.getScaleDegree(2, 'major')).toBe('2M');
    expect(util.getScaleDegree(2, 'phrygian')).toBe('2m');
    expect(util.getScaleDegree(3, 'major')).toBe('3M');
    expect(util.getScaleDegree(3, 'minor')).toBe('3m');
    expect(util.getScaleDegree('3', 'minor')).toBe('3m');
    expect(util.getScaleDegree('b3', 'minor')).toBe('3m');
    expect(util.getScaleDegree('b3', 'major')).toBe(undefined);
});
test('getScalePattern', function () {
    expect(util.getScalePattern([1, 2, 3, 5], 'major')).toEqual(['1P', '2M', '3M', '5P']);
    expect(util.getScalePattern([1, 3, 4, 5], 'minor')).toEqual(['1P', '3m', '4P', '5P']);
});
test('permutateIntervals', function () {
    expect(util.permutateIntervals(tonal_1.Scale.intervals('major'), [1, 5, 3, 7])).toEqual(['1P', '5P', '3M', '7M']);
    expect(util.permutateIntervals(tonal_1.Scale.intervals('minor'), [1, 5, 3, 7])).toEqual(['1P', '5P', '3m', '7m']);
});
test('getPatternInChord', function () {
    expect(util.getPatternInChord([1, 5, 3, 7], '7')).toEqual(['1P', '5P', '3M', '7m']);
    expect(util.getPatternInChord([1, 5, 3, 7], '-7')).toEqual(['1P', '5P', '3m', '7m']);
    expect(util.getPatternInChord([1, 9, 3, 7], '-7')).toEqual(['1P', '2M', '3m', '7m']);
    expect(util.getPatternInChord([7, 9, 3, 5], '-7b5')).toEqual(['7m', '2m', '3m', '5d']);
    expect(util.getPatternInChord([7, 9, 3, 5], 'D-7b5')).toEqual(['C', 'Eb', 'F', 'Ab']);
    expect(util.getPatternInChord([3, 5, 7, 9], '-7b5')).toEqual(['3m', '5d', '7m', '2m']);
    expect(util.getPatternInChord([3, 5, 7, 9], 'D-7b5')).toEqual(['F', 'Ab', 'C', 'Eb']);
});
test('renderIntervals', function () {
    expect(util.renderIntervals(['1P', '3m', '7m'], 'C')).toEqual(['C', 'Eb', 'Bb']);
});
test('renderSteps', function () {
    expect(util.renderSteps(['1', 'b3', 'b7'], 'C')).toEqual(['C', 'Eb', 'Bb']);
});
test('renderDigitalPattern', function () {
    expect(util.renderDigitalPattern('7')).toEqual(['1P', '2M', '3M', '5P']);
    expect(util.renderDigitalPattern('-7')).toEqual(['1P', '3m', '4P', '5P']);
    expect(util.renderDigitalPattern('C-7')).toEqual(['C', 'Eb', 'F', 'G']);
    expect(util.renderDigitalPattern('F7')).toEqual(['F', 'G', 'A', 'C']);
    expect(util.renderDigitalPattern('F^7')).toEqual(['F', 'G', 'A', 'C']);
});
test('getGuideTones', function () {
    expect(util.getGuideTones('C7')).toEqual(['E', 'Bb']);
    expect(util.getGuideTones('D-7')).toEqual(['F', 'C']);
    expect(util.getGuideTones('Ab-7')).toEqual(['Cb', 'Gb']);
});
test('fixInterval', function () {
    expect(Harmony_1.Harmony.fixInterval('8P')).toBe('8P');
    expect(Harmony_1.Harmony.fixInterval('8P', true)).toBe('1P');
    expect(Harmony_1.Harmony.fixInterval('-8P')).toBe('-8P');
    expect(Harmony_1.Harmony.fixInterval('-8P', true)).toBe('1P');
    expect(Harmony_1.Harmony.fixInterval('1P')).toBe('1P');
    expect(Harmony_1.Harmony.fixInterval('0A')).toBe('1P');
    expect(Harmony_1.Harmony.fixInterval('-0A')).toBe('1P');
    expect(Harmony_1.Harmony.fixInterval('2A')).toBe('2A');
    expect(Harmony_1.Harmony.fixInterval('5A')).toBe('5A');
    expect(Harmony_1.Harmony.fixInterval('9M', true)).toBe('2M');
    expect(Harmony_1.Harmony.fixInterval('-9M', true)).toBe('-2M');
    expect(Harmony_1.Harmony.fixInterval('-2M')).toBe('-2M');
});
test('minInterval', function () {
    expect(Harmony_1.Harmony.minInterval('9M')).toBe('2M');
    expect(Harmony_1.Harmony.minInterval('9M')).toBe('2M');
    expect(Harmony_1.Harmony.minInterval('8P')).toBe('1P');
    expect(Harmony_1.Harmony.minInterval('2m')).toBe('2m');
    expect(Harmony_1.Harmony.minInterval('-7M')).toBe('2m');
    expect(Harmony_1.Harmony.minInterval('-7M', 'up')).toBe('2m');
    expect(Harmony_1.Harmony.minInterval('-7M', 'down')).toBe('-7M');
    expect(Harmony_1.Harmony.minInterval('2m', 'down')).toBe('-7M');
    expect(Harmony_1.Harmony.minInterval('2m', 'up')).toBe('2m');
    expect(Harmony_1.Harmony.minInterval('13M', 'up')).toBe('6M');
    expect(Harmony_1.Harmony.minInterval('1P')).toBe('1P');
    expect(Harmony_1.Harmony.minInterval('1P', 'down')).toBe('1P');
    expect(Harmony_1.Harmony.minInterval('1P', 'up')).toBe('1P');
    expect(Harmony_1.Harmony.minInterval('1P', 'up', true)).toBe('8P');
    expect(Harmony_1.Harmony.minInterval('1P', 'down', true)).toBe('-8P');
    expect(tonal_3.Interval.simplify('3')).toBe(null);
    expect(Harmony_1.Harmony.minInterval('3')).toBe(null);
});
test('isInterval', function () {
    expect(util.isInterval('XY')).toBe(false);
    expect(util.isInterval('6M')).toBe(true);
    expect(util.isInterval('3')).toBe(false);
    expect(util.isInterval('2m')).toBe(true);
    expect(util.isInterval('3m')).toBe(true);
    expect(util.isInterval('3')).toBe(false);
    expect(util.isInterval('13M')).toBe(true);
    expect(util.isInterval('-13m')).toBe(true);
});
test('mapMinInterval', function () {
    expect(['2M', '2m', '7M', '4P']
        .map(Harmony_1.Harmony.mapMinInterval('up')))
        .toEqual(['2M', '2m', '7M', '4P']);
    expect(['2M', '2m', '7M', '4P']
        .map(Harmony_1.Harmony.mapMinInterval('down')))
        .toEqual(['-7m', '-7M', '-2m', '-5P']);
    expect(Harmony_1.Harmony.minInterval('7M')).toBe('-2m');
    expect(['2M', '2m', '7M', '4P']
        .map(Harmony_1.Harmony.mapMinInterval()))
        .toEqual(['2M', '2m', '-2m', '4P']);
});
test('sortMinIntervals', function () {
    expect(['2M', '2m', '-2m', '4P']
        .sort(Harmony_1.Harmony.sortMinInterval()))
        .toEqual(['2m', '-2m', '2M', '4P']);
});
test('invertInterval', function () {
    expect(Harmony_1.Harmony.invertInterval('1A')).toEqual('-8d');
    expect(Harmony_1.Harmony.invertInterval('-1A')).toEqual('8d');
});
test('forceDirection', function () {
    expect(Harmony_1.Harmony.forceDirection('-2M', 'up')).toEqual('7m');
    expect(Harmony_1.Harmony.forceDirection('-2M', 'down')).toEqual('-2M');
    expect(Harmony_1.Harmony.forceDirection('3M', 'up')).toEqual('3M');
    expect(Harmony_1.Harmony.forceDirection('3M', 'down')).toEqual('-6m');
    expect(Harmony_1.Harmony.forceDirection('-8A', 'down')).toEqual('-8A');
    expect(Harmony_1.Harmony.forceDirection('-8P', 'up')).toEqual('1P');
    /* expect(Harmony.forceDirection('-8P', 'up',true)).toEqual('8P'); */
    expect(Harmony_1.Harmony.forceDirection('1A', 'down')).toEqual('-8d');
});
test('getNearestNote', function () {
    expect(tonal_2.Distance.interval('C', 'G')).toBe('5P');
    expect(Harmony_1.Harmony.intervalComplement('5P')).toBe('4P');
    expect(Harmony_1.Harmony.invertInterval('5P')).toBe('-4P');
    expect(Harmony_1.Harmony.minInterval('5P')).toBe('-4P');
    expect(Harmony_1.Harmony.getNearestNote('C4', 'G')).toBe('G3');
    expect(Harmony_1.Harmony.getNearestNote('C4', 'G2')).toBe('G3');
    expect(Harmony_1.Harmony.getNearestNote('C4', 'F')).toBe('F4');
    expect(Harmony_1.Harmony.getNearestNote('C4', 'F', 'down')).toBe('F3');
    expect(Harmony_1.Harmony.getNearestNote('C4', 'F', 'up')).toBe('F4');
    expect(Harmony_1.Harmony.intervalComplement('8P')).toBe('1P');
    expect(Harmony_1.Harmony.intervalComplement('8A')).toBe('1d');
    expect(Harmony_1.Harmony.intervalComplement('8d')).toBe('1A');
    expect(tonal_3.Interval.invert('7m')).toBe('2M');
    expect(Harmony_1.Harmony.invertInterval('8d')).toBe('-1A');
    expect(Harmony_1.Harmony.minInterval('8d')).toBe('-1A');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'Db')).toBe('Db5');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'Db', 'up')).toBe('Db6');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'D#')).toBe('D#5');
    expect(tonal_2.Distance.interval('D', 'D#')).toBe('1A');
    expect(Harmony_1.Harmony.minInterval('1A')).toBe('1A');
    expect(Harmony_1.Harmony.intervalComplement('1A')).toBe('8d');
    expect(Harmony_1.Harmony.invertInterval('1A')).toBe('-8d');
    expect(Harmony_1.Harmony.intervalComplement('5A')).toBe('4d');
    expect(Harmony_1.Harmony.intervalComplement('5d')).toBe('4A');
    expect(Harmony_1.Harmony.intervalComplement('4d')).toBe('5A');
    expect(Harmony_1.Harmony.intervalComplement('4A')).toBe('5d');
    expect(Harmony_1.Harmony.minInterval('1A', 'down')).toBe('-8d');
    expect(Harmony_1.Harmony.minInterval('5d')).toBe('5d');
    expect(Harmony_1.Harmony.minInterval('5d', 'down')).toBe('-4A');
    expect(Harmony_1.Harmony.minInterval('5d', 'up')).toBe('5d');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'D#', 'down')).toBe('D#4');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'Db')).toBe('Db5');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'Db', 'up')).toBe('Db6');
    expect(Harmony_1.Harmony.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
});
test('getNearestTargets', function () {
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['F', 'G'])[0]).toBe('G3');
    expect(Harmony_1.Harmony.getNearestTargets('E5', ['G', 'D'])[0]).toBe('D5');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['F', 'G'], 'up')[0]).toBe('F4');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['F', 'G'], 'down')[0]).toBe('G3');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['F', 'Gb'], 'down')[0]).toBe('Gb3');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['F', 'F#'], 'down')[0]).toBe('F#3');
    expect(Harmony_1.Harmony.getNearestTargets('D5', ['Db', 'Ab'], 'down')[0]).toBe('Db5');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['D', 'E'], 'down')[0]).toBe('E3');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['D', 'Db'], 'down')[0]).toBe('D3');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['D', 'C#'], 'down')[0]).toBe('D3');
    expect(Harmony_1.Harmony.getNearestTargets('C4', ['Db', 'C#'], 'down')[0]).toBe('C#3');
    expect(Harmony_1.Harmony.getNearestTargets('B3', ['Bb', 'E'], 'down')[0]).toBe('Bb3');
});
test('getAverageMidi', function () {
    expect(util_1.getAverageMidi(['C3', 'C4'])).toBe(tonal_4.Note.midi('F#3'));
    expect(util_1.getAverageMidi(['C3', 'B3'])).toBe(tonal_4.Note.midi('F#3') - .5);
});
test('getRangePosition', function () {
    expect(util.getRangePosition('C2', ['C3', 'C4'])).toBe(-1);
    expect(util.getRangePosition('C5', ['C3', 'C4'])).toBe(2);
    expect(util.getRangePosition('C3', ['C3', 'C4'])).toBe(0);
    expect(util.getRangePosition('F#3', ['C3', 'C4'])).toBe(.5);
    expect(util.getRangePosition('C4', ['C3', 'C4'])).toBe(1);
    expect(util.getRangePosition('G#3', ['C3', 'C4'])).toBe(8 / 12);
    expect(util.getRangePosition('A3', ['C3', 'C4'])).toBe(9 / 12);
    expect(util.getRangePosition('D3', ['C3', 'C4'])).toBe(2 / 12);
    var range = ['C3', 'C4'];
    expect(util.getRangePosition(util_1.getAverageMidi(range), range)).toBe(.5);
});
test('getRangeDirection', function () {
    var fn = util.getRangeDirection;
    expect(fn('C2', ['C3', 'C4']).direction).toBe('up');
    expect(fn(tonal_4.Note.midi('C2'), ['C3', 'C4']).direction).toBe('up');
    expect(fn('C2', ['C3', 'C4']).force).toBe(true);
    expect(fn('C5', ['C3', 'C4']).direction).toBe('down');
    expect(fn('C3', ['C3', 'C4']).direction).toBe('up');
    expect(fn('C3', ['C3', 'C4']).force).toBe(true);
    expect(fn('F#3', ['C3', 'C4']).direction).toBe('down');
    expect(fn('F#3', ['C3', 'C4']).force).toBe(false);
    expect(fn('C4', ['C3', 'C4']).direction).toBe('down');
    expect(fn('G#3', ['C3', 'C4']).direction).toBe('down');
    expect(fn('A3', ['C3', 'C4']).direction).toBe('down');
    expect(fn('D3', ['C3', 'C4']).direction).toBe('down');
});
test('isFirstInPath', function () {
    expect(util.isFirstInPath([0, 0, 0], 1)).toBe(true);
    expect(util.isFirstInPath([0, 1, 0], 1)).toBe(false);
    expect(util.isFirstInPath([0, 0, 1], 1)).toBe(false);
    expect(util.isFirstInPath([0, 1, 1], 1)).toBe(false);
    expect(util.isFirstInPath([0, 0, 0], 2)).toBe(true);
    expect(util.isFirstInPath([0, 0, 1], 2)).toBe(false);
    expect(util.isFirstInPath([0, 1, 0], 2)).toBe(true);
    expect(util.isFirstInPath([1, 1, 0], 2)).toBe(true);
    expect(util.isFirstInPath([1, 0, 0, 0, 0], 0)).toBe(false);
    expect(util.isFirstInPath([1, 0, 0, 0, 0], 1)).toBe(true);
    expect(util.isFirstInPath([1, 0, 0, 0, 0], 2)).toBe(true);
    expect(util.isFirstInPath([1, 0, 0, 0, 0], 3)).toBe(true);
    expect(util.isFirstInPath([1, 0, 0, 0, 0], 4)).toBe(true);
});
test('getVoicing', function () {
    expect(util.getVoicing('C7#5')).toEqual(['C', 'E', 'G#', 'Bb']);
});
test('getDegreeFromInterval', function () {
    expect(util.getDegreeFromInterval(tonal_2.Distance.interval('C', 'C'))).toBe(1);
    expect(util.getDegreeFromInterval(tonal_2.Distance.interval('C', 'E'))).toBe(3);
    expect(util.getDegreeFromInterval(tonal_2.Distance.interval('C', 'Eb'))).toBe(3);
    expect(util.getDegreeFromInterval(tonal_2.Distance.interval('C', 'F'))).toBe(4);
    expect(util.getDegreeFromInterval(tonal_2.Distance.interval('C', 'G'))).toBe(5);
    expect(util.getDegreeFromInterval(tonal_2.Distance.interval('D', 'C'))).toBe(7);
    expect(util.getDegreeFromInterval('13M')).toBe(13);
    expect(util.getDegreeFromInterval('6M')).toBe(6);
});
test('sortByDegree', function () {
    var cmaj = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    expect(util.sortByDegree(cmaj, 1))
        .toEqual(cmaj);
    expect(util.sortByDegree(cmaj, 2))
        .toEqual(cmaj);
    expect(util.sortByDegree(cmaj, 3))
        .toEqual(['C', 'E', 'G', 'B', 'D', 'F', 'A']);
    expect(util.sortByDegree(cmaj, 4))
        .toEqual(['C', 'F', 'B', 'E', 'A', 'D', 'G']);
    expect(util.sortByDegree(cmaj, 5))
        .toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F']);
    expect(util.sortByDegree(cmaj, 6))
        .toEqual(['C', 'A', 'F', 'D', 'B', 'G', 'E']);
    expect(util.sortByDegree(cmaj, 7))
        .toEqual(['C', 'B', 'A', 'G', 'F', 'E', 'D']);
    expect(util.sortByDegree(cmaj, -1))
        .toEqual(['C', 'B', 'A', 'G', 'F', 'E', 'D']);
    expect(util.sortByDegree(['B', 'C', 'D', 'E', 'F', 'G', 'A'], 4))
        .toEqual(['B', 'E', 'A', 'D', 'G', 'C', 'F']);
    expect(util.sortByDegree(['D', 'F', 'A', 'C'], 4))
        .toEqual(['D', 'A', 'C', 'F']);
    expect(util.sortByDegree(['C', 'D', 'F', 'A'], 4))
        .toEqual(['C', 'F', 'A', 'D']);
    expect(util.sortByDegree(['E', 'G', 'A', 'B', 'D'], 4))
        .toEqual(['E', 'A', 'D', 'G', 'B']);
});
test('renderAbsoluteNotes', function () {
    expect(util.renderAbsoluteNotes(['D', 'F', 'G', 'Bb'], 3)).toEqual(['D3', 'F3', 'G3', 'Bb3']);
    expect(util.renderAbsoluteNotes(['C', 'F', 'D', 'C'])).toEqual(['C3', 'F3', 'D4', 'C5']);
    expect(util.renderAbsoluteNotes(['C', 'F', 'D', 'C'], 4, 'down')).toEqual(['C4', 'F3', 'D3', 'C3']);
    expect(util.renderAbsoluteNotes(['C', 'C', 'C'])).toEqual(['C3', 'C4', 'C5']);
    expect(util.renderAbsoluteNotes(['C', 'C', 'C'], 5, 'down')).toEqual(['C5', 'C4', 'C3']);
    expect(util.renderAbsoluteNotes(['F', 'A', 'C', 'E'].reverse(), 4, 'down').reverse()).toEqual(['F3', 'A3', 'C4', 'E4']);
});
test('getIntervals', function () {
    expect(util.getIntervals(['C3', 'D3', 'F3', 'C4'])).toEqual(['2M', '3m', '5P']);
});
test('smallestInterval', function () {
    expect(util.smallestInterval(util.getIntervals(['C3', 'D3', 'F3', 'C4']))).toEqual('2M');
});
test('sortNotes', function () {
    expect(util.sortNotes(['C3', 'C2', 'F3', 'F1'])).toEqual(['F1', 'C2', 'C3', 'F3']);
    expect(util.sortNotes(['C3', 'C2', 'C6', 'C1'])).toEqual(['C1', 'C2', 'C3', 'C6']);
});
test('analyzeVoicing', function () {
    var analyzed = util.analyzeVoicing(['D3', 'F3', 'A3', 'C4']);
    expect(analyzed.spread).toBe('7m');
    expect(analyzed.minInterval).toBe('3m');
    expect(analyzed.maxInterval).toBe('3M');
});
test('minIntervals', function () {
    expect(Harmony_1.Harmony.minIntervals(['C', 'E', 'G'], ['C', 'E', 'G'])).toEqual(['1P', '1P', '1P']);
    expect(Harmony_1.Harmony.minIntervals(['C', 'E', 'G'], ['C', 'F', 'G'])).toEqual(['1P', '2m', '1P']);
    expect(Harmony_1.Harmony.minIntervals(['C', 'F', 'G'], ['C', 'E', 'G'])).toEqual(['1P', '-2m', '1P']);
});
test('semitoneDifference', function () {
    expect(util.semitoneDifference(['1P', '1P'])).toBe(0);
    expect(util.semitoneDifference(['2M', '2m'])).toBe(3);
    expect(util.semitoneDifference(['-2M', '4A'])).toBe(8);
    expect(util_1.semitoneDifference(['1P', '-1A', '1P', null])).toBe(1); // uper interval is ignored
});
test('semitoneMovement', function () {
    expect(util.semitoneMovement(['1P', '1P'])).toBe(0);
    expect(util.semitoneMovement(['2M', '2m'])).toBe(3);
    expect(util.semitoneMovement(['2M', '-2m'])).toBe(1);
    expect(util.semitoneMovement(['-2M', '4A'])).toBe(4);
});
test('chordHasIntervals', function () {
    expect(util.chordHasIntervals('C^7', ['3M', '7M'])).toBe(true);
    expect(util.chordHasIntervals('C', ['3M', '7M'])).toBe(false);
    expect(util.chordHasIntervals('C', ['3M', '7M?'])).toBe(true);
    expect(util.chordHasIntervals('C^7', ['3m'])).toBe(false);
    expect(util.chordHasIntervals('C^7', ['3M', '7m'])).toBe(false);
    expect(util.chordHasIntervals('C7sus4', ['3M!', '4P', '7m'])).toBe(true);
    expect(util.chordHasIntervals('C-7', ['3!', '7m'])).toBe(false);
    expect(util.chordHasIntervals('C7sus', ['4P'])).toBe(true);
    expect(util.chordHasIntervals('C7sus', ['4'])).toBe(false);
    expect(util.chordHasIntervals('C7', ['3!'])).toBe(false);
});
test('isDominantChord', function () {
    expect(util.isDominantChord('C^7')).toBe(false);
    expect(util.isDominantChord('C7')).toBe(true);
    expect(util.isDominantChord('C7#5')).toBe(true);
    expect(util.isDominantChord('C7sus')).toBe(true);
    expect(util.isDominantChord('C13')).toBe(true);
    expect(util.isDominantChord('C')).toBe(false);
    expect(util.isDominantChord('G7b9b13')).toBe(true);
    expect(util.isDominantChord('Eb-7')).toBe(false);
    expect(util.isDominantChord('F69')).toBe(false);
});
test('isMajorChord', function () {
    expect(util.isMajorChord('D^7')).toBe(true);
    expect(util.isMajorChord('D7')).toBe(false);
    expect(util.isMajorChord('D')).toBe(true);
    expect(util.isMajorChord('Eb-7')).toBe(false);
    expect(util.isMajorChord('F69')).toBe(true);
});
test('isMinorChord', function () {
    expect(util.isMinorChord('D^7')).toBe(false);
    expect(util.isMinorChord('D7')).toBe(false);
    expect(util.isMinorChord('D')).toBe(false);
    expect(util.isMinorChord('Eb-7')).toBe(true);
    expect(util.isMinorChord('Eb-')).toBe(true);
    expect(util.isMinorChord('Eb-^7')).toBe(true);
    expect(util.isMinorChord('Eb-7b5')).toBe(true);
    expect(util.isMinorChord('F69')).toBe(false);
});
test('isMinorChord', function () {
    expect(util.isMinorChord('D^7')).toBe(false);
    expect(util.isMinorChord('D7')).toBe(false);
    expect(util.isMinorChord('D')).toBe(false);
    expect(util.isMinorChord('Eb-7')).toBe(true);
    expect(util.isMinorChord('Eb-')).toBe(true);
    expect(util.isMinorChord('Eb-^7')).toBe(true);
    expect(util.isMinorChord('Eb-7b5')).toBe(true);
    expect(util.isMinorChord('F69')).toBe(false);
});
test('isMinorTonic', function () {
    expect(util.isMinorTonic('D^7')).toBe(false);
    expect(util.isMinorTonic('D7')).toBe(false);
    expect(util.isMinorTonic('D')).toBe(false);
    expect(util.isMinorTonic('Eb-7')).toBe(false);
    expect(util.isMinorTonic('Eb-')).toBe(true);
    expect(util.isMinorTonic('Eb-^7')).toBe(true);
    expect(util.isMinorTonic('Eb-7b5')).toBe(false);
    expect(util.isMinorTonic('Eb-6')).toBe(true);
});
test('getChordType', function () {
    var fn = util.getChordType;
    expect(fn('C7')).toBe('dominant');
    expect(fn('C-7')).toBe('minor');
    expect(fn('C^7')).toBe('major');
    expect(fn('F69')).toBe('major');
    expect(fn('C-6')).toBe('minor-tonic');
});
// render sheet to array of {chord,index}
// each el that isMajorChord => add possible roots to element
//      => either root of chord or fifth (e.g. F^7 is in F or C)
// now start at each major chord and walk to the left and right adding the possible roots until another major chord is hit
//      => e.g. | D-7 G7 | C^7    | C-7 F7          | Bb^7    |
//              | C or G | C or G | C or G, Bb or F | Bb or F |
// render function + type of each chord in the possible roots
//      => e.g. D-7 = {root:'C',function: 'II-7',type:'diatonic'},{root:'G',function:'II/IV',type:'secondary'}
// each function type has a priorization
// - diatonic = 1, secondary = 2, substitute = 3
// calculate sum of priorizations
//      =>    D-7       + G7        + C^7      + C-7        + F7
//      => C: diationic + diatonic  + diatonic + substitute + substitute = 9
//      => G: secondary + secondary + diatonic + substitute + substitute = 11
// accept smaller sum as more likely (F or Bb is similar):
//      => e.g. | D-7 G7 | C^7    | C-7 F7          | Bb^7    |
//              | C      | C      | C or Bb         | Bb      |
// the chords that still have two possibilities are regared as pivot transitions
// possible problems: are there sheets that have no major chords?
// what about minor modes?
// outlook: 
// - can now decide which scale is best (based on function to scale mappings)
// - can now color correctly based on root
// -- use gradients on pivots!!!!!
test('getChordNotes', function () {
    expect(util_1.getChordNotes('C#-7')).toEqual(['C#', 'E', 'G#', 'B']);
    expect(util_1.getChordNotes('C#-7', function (note, _a) {
        var degree = _a.degree;
        return degree !== 1;
    })).toEqual(['E', 'G#', 'B']);
    expect(util_1.getChordNotes('C#-7', util_1.validateWithoutRoot)).toEqual(['E', 'G#', 'B']);
});
