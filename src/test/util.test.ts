import * as util from '../util';
import { Scale } from 'tonal';

test('getIntervalFromStep: undefined', () => {
    expect(util.getIntervalFromStep('d3g2g3')).toEqual(undefined);
});

test('getIntervalFromStep: numbers', () => {
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

test('getIntervalFromStep: strings', () => {
    expect(util.getIntervalFromStep('1')).toEqual('1P');
    expect(util.getIntervalFromStep('b2')).toEqual('2m');
    expect(util.getIntervalFromStep('b3')).toEqual('3m');
});

test('getChordScales', () => {
    expect(util.getChordScales('D-')).toEqual(
        ["dorian",
            "phrygian",
            "aeolian",
            "harmonic minor",
            "dorian #4",
            "melodic minor",
            "melodic minor second mode"]
    );
    expect(util.getChordScales('D-', 'Basic')).toEqual(
        ["minor pentatonic",
            "minor blues",
            "dorian",
            "phrygian",
            "aeolian"]
    );
});

test('findDegree', () => {
    expect(util.findDegree(1, Scale.intervals('major'))).toBe('1P');
    expect(util.findDegree(2, Scale.intervals('major'))).toBe('2M');
    expect(util.findDegree(2, Scale.intervals('phrygian'))).toBe('2m');
    expect(util.findDegree(3, Scale.intervals('major'))).toBe('3M');
    expect(util.findDegree(3, Scale.intervals('minor'))).toBe('3m');
    expect(util.findDegree('3', Scale.intervals('minor'))).toBe('3m');
    expect(util.findDegree('b3', Scale.intervals('minor'))).toBe('3m');
    expect(util.findDegree('b3', Scale.intervals('major'))).toBe(undefined);
});

test('hasDegree', () => {
    expect(util.hasDegree(3, ['1', 'b3', '5'])).toBe(true);
    expect(util.hasDegree(2, ['1', 'b3', '5'])).toBe(false);
    expect(util.hasDegree(9, ['1', '2M', 'b3', '5'])).toBe(true);
    expect(util.hasDegree(9, ['1', 'b3', '5'])).toBe(false);
});

test('hasAllDegrees', () => {
    expect(util.hasAllDegrees([1, 5, 3], ['1', 'b3', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 5, 2], ['1', 'b3', '5'])).toBe(false);
    expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(false);
});


test('getScaleDegree', () => {
    expect(util.getScaleDegree(1, 'major')).toBe('1P');
    expect(util.getScaleDegree(2, 'major')).toBe('2M');
    expect(util.getScaleDegree(2, 'phrygian')).toBe('2m');
    expect(util.getScaleDegree(3, 'major')).toBe('3M');
    expect(util.getScaleDegree(3, 'minor')).toBe('3m');
    expect(util.getScaleDegree('3', 'minor')).toBe('3m');
    expect(util.getScaleDegree('b3', 'minor')).toBe('3m');
    expect(util.getScaleDegree('b3', 'major')).toBe(undefined);
});

test('getScalePattern', () => {
    expect(util.getScalePattern([1, 2, 3, 5], 'major')).toEqual(['1P', '2M', '3M', '5P']);
    expect(util.getScalePattern([1, 3, 4, 5], 'minor')).toEqual(['1P', '3m', '4P', '5P']);
})

test('permutateIntervals', () => {
    expect(util.permutateIntervals(Scale.intervals('major'), [1, 5, 3, 7])).toEqual(['1P', '5P', '3M', '7M']);
    expect(util.permutateIntervals(Scale.intervals('minor'), [1, 5, 3, 7])).toEqual(['1P', '5P', '3m', '7m']);
})

test('getPatternInChord', () => {
    expect(util.getPatternInChord([1, 5, 3, 7], '7')).toEqual(['1P', '5P', '3M', '7m']);
    expect(util.getPatternInChord([1, 5, 3, 7], '-7')).toEqual(['1P', '5P', '3m', '7m']);
    expect(util.getPatternInChord([1, 9, 3, 7], '-7')).toEqual(['1P', '2M', '3m', '7m']);
});

test('renderIntervals', () => {
    expect(util.renderIntervals(['1P', '3m', '7m'], 'C')).toEqual(['C', 'Eb', 'Bb']);
});
test('renderSteps', () => {
    expect(util.renderSteps(['1', 'b3', 'b7'], 'C')).toEqual(['C', 'Eb', 'Bb']);
});

test('getDigitalPattern', () => {
    expect(util.getDigitalPattern('7')).toEqual(['1P', '2M', '3M', '5P']);
    expect(util.getDigitalPattern('-7')).toEqual(['1P', '3m', '4P', '5P']);
    expect(util.getDigitalPattern('C-7')).toEqual(['C', 'Eb', 'F', 'G']);
    expect(util.getDigitalPattern('F7')).toEqual(['F', 'G', 'A', 'C']);
    expect(util.getDigitalPattern('F^7')).toEqual(['F', 'G', 'A', 'C']);
});

test('getGuideTones', () => {
    expect(util.getGuideTones('C7')).toEqual(['E', 'Bb']);
    expect(util.getGuideTones('D-7')).toEqual(['F', 'C']);
    expect(util.getGuideTones('Ab-7')).toEqual(['Cb', 'Gb']);
});