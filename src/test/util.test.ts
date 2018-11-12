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

test('renderDigitalPattern', () => {
    expect(util.renderDigitalPattern('7')).toEqual(['1P', '2M', '3M', '5P']);
    expect(util.renderDigitalPattern('-7')).toEqual(['1P', '3m', '4P', '5P']);
    expect(util.renderDigitalPattern('C-7')).toEqual(['C', 'Eb', 'F', 'G']);
    expect(util.renderDigitalPattern('F7')).toEqual(['F', 'G', 'A', 'C']);
    expect(util.renderDigitalPattern('F^7')).toEqual(['F', 'G', 'A', 'C']);
});

test('getGuideTones', () => {
    expect(util.getGuideTones('C7')).toEqual(['E', 'Bb']);
    expect(util.getGuideTones('D-7')).toEqual(['F', 'C']);
    expect(util.getGuideTones('Ab-7')).toEqual(['Cb', 'Gb']);
});

test('simplifyInterval', () => {
    expect(util.simplifyInterval('8P')).toBe('1P');
    expect(util.simplifyInterval('-8P')).toBe('1P');
    expect(util.simplifyInterval('1P')).toBe('1P');
    expect(util.simplifyInterval('0A')).toBe('1P');
    expect(util.simplifyInterval('-0A')).toBe('1P');
    expect(util.simplifyInterval('2A')).toBe('2A');
    expect(util.simplifyInterval('5A')).toBe('5A');
    expect(util.simplifyInterval('9M')).toBe('2M');
    expect(util.simplifyInterval('-9M')).toBe('-2M');
    expect(util.simplifyInterval('-2M')).toBe('-2M');
})
test('minInterval', () => {
    expect(util.minInterval('9M')).toBe('2M');
    expect(util.minInterval('8P')).toBe('1P');
    expect(util.minInterval('2m')).toBe('2m');
    expect(util.minInterval('-7M')).toBe('2m');
    expect(util.minInterval('-7M', 'up', true)).toBe('2m');
    expect(util.minInterval('-7M', 'down', true)).toBe('-7M');
    expect(util.minInterval('2m', 'down', true)).toBe('-7M');
    expect(util.minInterval('2m', 'up', true)).toBe('2m');
})

test('mapMinInterval', () => {
    expect(['2M', '2m', '7M', '4P']
        .map(util.mapMinInterval('up')))
        .toEqual(['2M', '2m', '-2m', '4P'])
});

test('sortMinIntervals', () => {
    expect(['2M', '2m', '-2m', '4P']
        .sort(util.sortMinInterval()))
        .toEqual(['2m', '-2m', '2M', '4P']);
});

test('invertInterval', () => {
    expect(util.invertInterval('1A')).toEqual('-8d');
    expect(util.invertInterval('-1A')).toEqual('8d');
});

test('forceDirection', () => {
    expect(util.forceDirection('-2M', 'up')).toEqual('7m');
    expect(util.forceDirection('-2M', 'down')).toEqual('-2M');
    expect(util.forceDirection('3M', 'up')).toEqual('3M');
    expect(util.forceDirection('3M', 'down')).toEqual('-6m');
    expect(util.forceDirection('-8A', 'down')).toEqual('-8A');
    expect(util.forceDirection('-8P', 'up')).toEqual('8P');
    expect(util.forceDirection('1A', 'down')).toEqual('-8d');
})

test('getNearestNote', () => {
    expect(util.getNearestNote('C4', 'G')).toBe('G3');
    expect(util.getNearestNote('C4', 'F')).toBe('F4');
    expect(util.getNearestNote('C4', 'F', 'down')).toBe('F3');
    expect(util.getNearestNote('C4', 'F', 'up')).toBe('F4');
    expect(util.getNearestNote('D5', 'Db')).toBe('Db5');
    expect(util.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
});

test('getNearestTargets', () => {
    expect(util.getNearestTargets('C4', ['F', 'G'])[0]).toBe('G3');
    expect(util.getNearestTargets('E5', ['G', 'D'])[0]).toBe('D5');
    expect(util.getNearestTargets('C4', ['F', 'G'], 'up')[0]).toBe('F4');
    expect(util.getNearestTargets('C4', ['F', 'G'], 'down')[0]).toBe('G3');
    expect(util.getNearestTargets('C4', ['F', 'Gb'], 'down')[0]).toBe('F4');
    expect(util.getNearestTargets('C4', ['F', 'F#'], 'down', true)[0]).toBe('F#3');
    expect(util.getNearestTargets('D5', ['Db', 'Ab'], 'down')[0]).toBe('Db5');
    expect(util.getNearestTargets('C4', ['D', 'E'], 'down', true)[0]).toBe('E3');
    expect(util.getNearestTargets('C4', ['D', 'Db'], 'down', true)[0]).toBe('D3');
    expect(util.getNearestTargets('C4', ['D', 'C#'], 'down', true)[0]).toBe('D3');
    expect(util.getNearestTargets('C4', ['Db', 'C#'], 'down', true)[0]).toBe('C#3');
    expect(util.getNearestTargets('B3', ['Bb', 'E'], 'down', true)[0]).toBe('Bb3');
});

test('getRangePosition', () => {
    expect(util.getRangePosition('C2', ['C3', 'C4'])).toBe(-1);
    expect(util.getRangePosition('C5', ['C3', 'C4'])).toBe(2);
    expect(util.getRangePosition('C3', ['C3', 'C4'])).toBe(0);
    expect(util.getRangePosition('F#', ['C3', 'C4'])).toBe(.5);
    expect(util.getRangePosition('C4', ['C3', 'C4'])).toBe(1);
    expect(util.getRangePosition('G#3', ['C3', 'C4'])).toBe(8 / 12);
    expect(util.getRangePosition('A3', ['C3', 'C4'])).toBe(9 / 12);
    expect(util.getRangePosition('D3', ['C3', 'C4'])).toBe(2 / 12);
})

test('isFirstInPath', () => {
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