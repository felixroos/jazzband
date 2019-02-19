import * as util from '../util';
import {
    permutateArray,
    permutateElements,
    validateInterval,
    combineValidators,
    permutationComplexity,
    voicingValidator,
    getVoicingCombinations,
    getChordNotes,
    validateWithoutRoot,
    bestCombination,
    getNextVoicing,
    analyzeVoiceLeading,
    semitoneDifference,
    getMidi,
    getAverageMidi,
    getAvailableTensions,
    getRequiredNotes,
    getOptionalNotes,
    getVoices
} from '../util';
import { Scale } from 'tonal';
import { Chord } from 'tonal';
import { Distance } from 'tonal';
import { Interval } from 'tonal';
import { Note } from 'tonal';

test('getIntervalFromStep: undefined', () => {
    expect(util.getIntervalFromStep('d3g2g3')).toEqual(undefined);
});

test('isBlack', () => {
    expect(util.isBlack('B3')).toEqual(false);
    expect(util.isBlack('Ab3')).toEqual(true);
    expect(util.isBlack('Bb3')).toEqual(true);
    expect(util.isBlack('C3')).toEqual(false);
});
test('isSame', () => {
    expect(util.isSameNote('Bb3', 'A#3')).toEqual(true);
    expect(util.isSameNote('Cb3', 'B2')).toEqual(true);
    expect(util.isSameNote('A3', 'A2')).toEqual(false);
    expect(util.isSameNote('A3', 'B2')).toEqual(false);
    expect(util.isSameNote('A3', 'A2')).toEqual(false);
});

/* 
test('voiceLeading', () => {
    expect(util.voiceLeading(['C', 'E', 'G', 'B'], ['E', 'G', 'B'])).toEqual([
        { note: 'C', interval: null },
        { note: 'E', interval: '1P' },
        { note: 'G', interval: '1P' },
        { note: 'B', interval: '1P' },
    ]);

    expect(util.voiceLeading(['E', 'G', 'B'], ['C', 'E', 'G', 'B'])).toEqual([
        { note: 'C', interval: null },
        { note: 'E', interval: '1P' },
        { note: 'G', interval: '1P' },
        { note: 'B', interval: '1P' },
    ]);

    expect(util.voiceLeading(['C', 'E', 'G', 'A'], ['E', 'G', 'B'])).toEqual([
        { note: 'C', interval: null },
        { note: 'E', interval: '1P' },
        { note: 'G', interval: '1P' },
        { note: 'A', interval: '2M' },
    ]);
    expect(util.voiceLeading(['E', 'G', 'B'], ['C', 'E', 'G', 'A'])).toEqual([
        { note: 'C', interval: null },
        { note: 'E', interval: '1P' },
        { note: 'G', interval: '1P' },
        { note: 'A', interval: '-2M' },
    ]);

}); */

/* test('minVoiceDifference', () => {
    expect(util.minVoiceDifference(['C', 'E', 'G', 'B'], ['E', 'G', 'B'])).toEqual(0);
    expect(util.minVoiceDifference(['E', 'G', 'B'], ['C', 'E', 'G', 'B'])).toEqual(0);
    expect(util.minVoiceDifference(['C', 'E', 'G', 'B'], ['E', 'G', 'C'])).toEqual(1);
    expect(util.minVoiceDifference(['E', 'G', 'C'], ['C', 'E', 'G', 'B'])).toEqual(1);
    expect(util.minVoiceMovement(['C', 'E', 'G', 'B'], ['E', 'G', 'B'])).toEqual(0);
    expect(util.minVoiceMovement(['E', 'G', 'B'], ['C', 'E', 'G', 'B'])).toEqual(0);
    expect(util.minVoiceMovement(['C', 'E', 'G', 'B'], ['E', 'G', 'Bb'])).toEqual(-1);
    expect(util.minVoiceMovement(['C', 'E', 'G', 'B'], ['E', 'G', 'C'])).toEqual(1);
}); */

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

test('getMidi', () => {
    expect(getMidi('A4')).toBe(69);
    expect(Note.midi('A4')).toBe(69);
    expect(Note.midi(69)).toBe(69);
    expect(getMidi(69)).toBe(69);
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
    expect(util.getChordScales('D7#11', 'Diatonic')).toEqual(
        ["lydian dominant"]
    );
});

test('getDegreeFromStep', () => {
    const fn = util.getDegreeFromStep;
    expect(fn('b3')).toBe(3);
    expect(fn('#9')).toBe(9);
    expect(fn('b9')).toBe(9);
    expect(fn('b2')).toBe(2);
    expect(fn('^7')).toBe(7);
});
test('findDegree', () => {
    expect(util.findDegree(1, Scale.intervals('major'))).toBe('1P');
    expect(util.findDegree(9, Scale.intervals('major'))).toBe('2M');
    expect(util.findDegree(2, Scale.intervals('phrygian'))).toBe('2m');
    expect(util.findDegree(9, Scale.intervals('phrygian'))).toBe('2m');
    expect(util.findDegree(9, Scale.intervals('locrian'))).toBe('2m');
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
    expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 'b2'], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 'b9'], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 'b9'], ['1', 'b2', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 9], ['1', 'b9', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 9], ['1', 'b2', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 2], ['1', 'b2', '5'])).toBe(true);
    expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(true);
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
    expect(util.getPatternInChord([7, 9, 3, 5], '-7b5')).toEqual(['7m', '2m', '3m', '5d']);
    expect(util.getPatternInChord([7, 9, 3, 5], 'D-7b5')).toEqual(['C', 'Eb', 'F', 'Ab']);
    expect(util.getPatternInChord([3, 5, 7, 9], '-7b5')).toEqual(['3m', '5d', '7m', '2m']);
    expect(util.getPatternInChord([3, 5, 7, 9], 'D-7b5')).toEqual(['F', 'Ab', 'C', 'Eb']);
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

test('fixInterval', () => {
    expect(util.fixInterval('8P')).toBe('8P');
    expect(util.fixInterval('8P', true)).toBe('1P');
    expect(util.fixInterval('-8P')).toBe('-8P');
    expect(util.fixInterval('-8P', true)).toBe('1P');
    expect(util.fixInterval('1P')).toBe('1P');
    expect(util.fixInterval('0A')).toBe('1P');
    expect(util.fixInterval('-0A')).toBe('1P');
    expect(util.fixInterval('2A')).toBe('2A');
    expect(util.fixInterval('5A')).toBe('5A');
    expect(util.fixInterval('9M', true)).toBe('2M');
    expect(util.fixInterval('-9M', true)).toBe('-2M');
    expect(util.fixInterval('-2M')).toBe('-2M');
});

test('minInterval', () => {
    expect(util.minInterval('9M')).toBe('2M');
    expect(util.minInterval('9M')).toBe('2M');
    expect(util.minInterval('8P')).toBe('1P');
    expect(util.minInterval('2m')).toBe('2m');
    expect(util.minInterval('-7M')).toBe('2m');
    expect(util.minInterval('-7M', 'up')).toBe('2m');
    expect(util.minInterval('-7M', 'down')).toBe('-7M');
    expect(util.minInterval('2m', 'down')).toBe('-7M');
    expect(util.minInterval('2m', 'up')).toBe('2m');
    expect(util.minInterval('13M', 'up')).toBe('6M');
    expect(util.minInterval('1P')).toBe('1P');
    expect(util.minInterval('1P', 'down')).toBe('1P');
    expect(util.minInterval('1P', 'up')).toBe('1P');
    expect(util.minInterval('1P', 'up', true)).toBe('8P');
    expect(util.minInterval('1P', 'down', true)).toBe('-8P');
    expect(Interval.simplify('3')).toBe(null);
    expect(util.minInterval('3')).toBe(null);
});


test('isInterval', () => {
    expect(util.isInterval('XY')).toBe(false);
    expect(util.isInterval('6M')).toBe(true);
    expect(util.isInterval('3')).toBe(false);
    expect(util.isInterval('2m')).toBe(true);
    expect(util.isInterval('3m')).toBe(true);
    expect(util.isInterval('3')).toBe(false);
    expect(util.isInterval('13M')).toBe(true);
    expect(util.isInterval('-13m')).toBe(true);
})

test('mapMinInterval', () => {
    expect(['2M', '2m', '7M', '4P']
        .map(util.mapMinInterval('up')))
        .toEqual(['2M', '2m', '7M', '4P']);
    expect(['2M', '2m', '7M', '4P']
        .map(util.mapMinInterval('down')))
        .toEqual(['-7m', '-7M', '-2m', '-5P']);

    expect(util.minInterval('7M')).toBe('-2m');

    expect(['2M', '2m', '7M', '4P']
        .map(util.mapMinInterval()))
        .toEqual(['2M', '2m', '-2m', '4P']);
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
    expect(util.forceDirection('-8P', 'up')).toEqual('1P');
    /* expect(util.forceDirection('-8P', 'up',true)).toEqual('8P'); */
    expect(util.forceDirection('1A', 'down')).toEqual('-8d');
});

test('getNearestNote', () => {
    expect(Distance.interval('C', 'G')).toBe('5P');
    expect(util.intervalComplement('5P')).toBe('4P');
    expect(util.invertInterval('5P')).toBe('-4P');
    expect(util.minInterval('5P')).toBe('-4P');

    expect(util.getNearestNote('C4', 'G')).toBe('G3');
    expect(util.getNearestNote('C4', 'G2')).toBe('G3');
    expect(util.getNearestNote('C4', 'F')).toBe('F4');
    expect(util.getNearestNote('C4', 'F', 'down')).toBe('F3');
    expect(util.getNearestNote('C4', 'F', 'up')).toBe('F4');

    expect(util.intervalComplement('8P')).toBe('1P');
    expect(util.intervalComplement('8A')).toBe('1d');
    expect(util.intervalComplement('8d')).toBe('1A');

    expect(Interval.invert('7m')).toBe('2M');


    expect(util.invertInterval('8d')).toBe('-1A');
    expect(util.minInterval('8d')).toBe('-1A');

    expect(util.getNearestNote('D5', 'Db')).toBe('Db5');
    expect(util.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
    expect(util.getNearestNote('D5', 'Db', 'up')).toBe('Db6');

    expect(util.getNearestNote('D5', 'D#')).toBe('D#5');

    expect(Distance.interval('D', 'D#')).toBe('1A');

    expect(util.minInterval('1A')).toBe('1A');
    expect(util.intervalComplement('1A')).toBe('8d');
    expect(util.invertInterval('1A')).toBe('-8d');
    expect(util.intervalComplement('5A')).toBe('4d');
    expect(util.intervalComplement('5d')).toBe('4A');
    expect(util.intervalComplement('4d')).toBe('5A');
    expect(util.intervalComplement('4A')).toBe('5d');

    expect(util.minInterval('1A', 'down')).toBe('-8d');

    expect(util.minInterval('5d')).toBe('5d');
    expect(util.minInterval('5d', 'down')).toBe('-4A');
    expect(util.minInterval('5d', 'up')).toBe('5d');

    expect(util.getNearestNote('D5', 'D#', 'down')).toBe('D#4');

    expect(util.getNearestNote('D5', 'Db')).toBe('Db5');
    expect(util.getNearestNote('D5', 'Db', 'up')).toBe('Db6');
    expect(util.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
});

test('Tonal.Interval', () => {
    expect(Distance.interval('D', 'C')).toBe('7m');
    expect(Distance.interval('C', 'D')).toBe('2M');
    expect(Distance.interval('D', 'Db')).toBe('8d');
    expect(Distance.interval('D#', 'D')).toBe('8d');
    expect(Distance.interval('Db', 'D')).toBe('1A');
    expect(Distance.interval('D', 'D#')).toBe('1A');
    expect(Distance.interval('D2', 'Db2')).toBe('-1A');
    expect(Distance.interval('D2', 'D#2')).toBe('1A');
    expect(Distance.interval('D2', 'Db3')).toBe('8d');
    expect(Distance.interval('D2', 'D#3')).toBe('8A');
    expect(Distance.interval('D2', 'D#1')).toBe('-8d');
    expect(Distance.interval('D2', 'Db1')).toBe('-8A');

    expect(Interval.invert('1A')).toBe('8d');
    expect(Interval.invert('1d')).toBe('8A');
    expect(Interval.invert('1P')).toBe('8P');
    expect(Interval.invert('8P')).toBe('1P');
    expect(Interval.invert('8d')).toBe('1A');
})

test('getNearestTargets', () => {
    expect(util.getNearestTargets('C4', ['F', 'G'])[0]).toBe('G3');
    expect(util.getNearestTargets('E5', ['G', 'D'])[0]).toBe('D5');
    expect(util.getNearestTargets('C4', ['F', 'G'], 'up')[0]).toBe('F4');
    expect(util.getNearestTargets('C4', ['F', 'G'], 'down')[0]).toBe('G3');
    expect(util.getNearestTargets('C4', ['F', 'Gb'], 'down')[0]).toBe('Gb3');
    expect(util.getNearestTargets('C4', ['F', 'F#'], 'down')[0]).toBe('F#3');
    expect(util.getNearestTargets('D5', ['Db', 'Ab'], 'down')[0]).toBe('Db5');
    expect(util.getNearestTargets('C4', ['D', 'E'], 'down')[0]).toBe('E3');
    expect(util.getNearestTargets('C4', ['D', 'Db'], 'down')[0]).toBe('D3');
    expect(util.getNearestTargets('C4', ['D', 'C#'], 'down')[0]).toBe('D3');
    expect(util.getNearestTargets('C4', ['Db', 'C#'], 'down')[0]).toBe('C#3');
    expect(util.getNearestTargets('B3', ['Bb', 'E'], 'down')[0]).toBe('Bb3');
});

test('getAverageMidi', () => {
    expect(getAverageMidi(['C3', 'C4'])).toBe(Note.midi('F#3'));
    expect(getAverageMidi(['C3', 'B3'])).toBe(Note.midi('F#3') - .5);
})

test('getRangePosition', () => {
    expect(util.getRangePosition('C2', ['C3', 'C4'])).toBe(-1);
    expect(util.getRangePosition('C5', ['C3', 'C4'])).toBe(2);
    expect(util.getRangePosition('C3', ['C3', 'C4'])).toBe(0);
    expect(util.getRangePosition('F#3', ['C3', 'C4'])).toBe(.5);
    expect(util.getRangePosition('C4', ['C3', 'C4'])).toBe(1);
    expect(util.getRangePosition('G#3', ['C3', 'C4'])).toBe(8 / 12);
    expect(util.getRangePosition('A3', ['C3', 'C4'])).toBe(9 / 12);
    expect(util.getRangePosition('D3', ['C3', 'C4'])).toBe(2 / 12);
    const range = ['C3', 'C4'];
    expect(util.getRangePosition(getAverageMidi(range), range)).toBe(.5);
});

test('getAvailableTensions', () => {
    expect(getAvailableTensions('C')).toEqual(['D', 'F#', 'A']);
    expect(getAvailableTensions('C^7')).toEqual(['D', 'F#', 'A']);
    expect(getAvailableTensions('C^13')).toEqual(['D', 'F#', 'A']);
    expect(getAvailableTensions('C-7')).toEqual(['D', 'F', 'A']);
    expect(getAvailableTensions('D-7')).toEqual(['E', 'G', 'B']);
    expect(getAvailableTensions('C-11')).toEqual(['D', 'F', 'A']);
    expect(getAvailableTensions('C-7b5')).toEqual(['D', 'F', 'Ab']);
    expect(getAvailableTensions('C-^7')).toEqual(['D', 'F', 'A']);
    expect(getAvailableTensions('C^7#5')).toEqual(['D', 'F#']);
    expect(getAvailableTensions('Co7')).toEqual(['D', 'F', 'Ab', 'B']);
    expect(getAvailableTensions('C^7#5')).toEqual(['D', 'F#']);
    expect(getAvailableTensions('C7')).toEqual(['Db', 'D', 'D#', 'F#', 'Ab', 'A']);
    expect(util.isDominantChord('C7sus')).toBe(true);
    expect(util.getDegreeInChord(4, 'C7sus')).toBe('F');
    expect(Chord.notes('C7sus')).toEqual(['C', 'F', 'G', 'Bb']);
    expect(getAvailableTensions('C7sus4')).toEqual(['Db', 'D', 'D#', 'E', 'Ab', 'A']);
    expect(getAvailableTensions('C7#5')).toEqual(['Db', 'D', 'D#', 'F#', 'A']);
});

test('getRequiredNotes', () => {
    expect(getRequiredNotes('C^7')).toEqual(['E', 'B']);
    expect(getRequiredNotes('C7')).toEqual(['E', 'Bb']);
    expect(getRequiredNotes('C7sus')).toEqual(['F', 'Bb']);
    expect(getRequiredNotes('C')).toEqual(['E']);
    expect(getRequiredNotes('D-')).toEqual(['F']);
    expect(getRequiredNotes('D-7')).toEqual(['F', 'C']);
    expect(getRequiredNotes('D-11')).toEqual(['F', 'G', 'C']);
    expect(Chord.notes('C13')).toEqual(['C', 'E', 'G', 'Bb', 'D', 'A']);
    expect(getRequiredNotes('C13')).toEqual(['E', 'Bb', 'A']);
    expect(getRequiredNotes('C6')).toEqual(['E', 'A']);
    expect(getRequiredNotes('Ch7')).toEqual(['Eb', 'Gb', 'Bb']);
    expect(getRequiredNotes('Ebo')).toEqual(['Gb', 'Bbb']);
    expect(getRequiredNotes('G')).toEqual(['B']);
});

test('getOptionalNotes', () => {
    expect(getOptionalNotes('C^7')).toEqual(['C', 'G']);
    expect(getOptionalNotes('C7')).toEqual(['C', 'G']);
    expect(getOptionalNotes('C7sus')).toEqual(['C', 'G']);
    expect(getOptionalNotes('C')).toEqual(['C', 'G']);
    expect(getOptionalNotes('D-')).toEqual(['D', 'A']);
    expect(getOptionalNotes('G-')).toEqual(['G', 'D']);
    expect(getOptionalNotes('D-7')).toEqual(['D', 'A']);
    expect(getOptionalNotes('D-11')).toEqual(['D', 'A', 'E']);
    expect(Chord.notes('C13')).toEqual(['C', 'E', 'G', 'Bb', 'D', 'A']);
    expect(getOptionalNotes('C13')).toEqual(['C', 'G', 'D']);
    expect(getOptionalNotes('C6')).toEqual(['C', 'G']);
    expect(getOptionalNotes('Ch7')).toEqual(['C']);

    expect(getOptionalNotes('G')).toEqual(['G', 'D']);
});

test('getVoices', () => {
    expect(getVoices('D-7', 4, false, 0)).toEqual(['F', 'C', 'D', 'A']);
    expect(getVoices('D-7', 4, true, 1)).toEqual(['F', 'C', 'E', 'A']);
    expect(getVoices('C7', 4, false, 0)).toEqual(['E', 'Bb', 'C', 'G']);
    // TODO: make 13 be the first tension choice..
    expect(getVoices('C7', 4, false, 1)).toEqual(['E', 'Bb', 'Db', 'C']);
    expect(getVoices('C7', 4, true, 1)).toEqual(['E', 'Bb', 'Db', 'G']);
    expect(getVoices('C7', 4, true, 0)).toEqual(['E', 'Bb', 'C', 'G']);
    expect(getVoices('Dh7', 4, false, 1)).toEqual(['F', 'Ab', 'C', 'E']);
    expect(getVoices('Dh7', 4, true, 1)).toEqual(['F', 'Ab', 'C', 'E']); // root stays because b5 needs root!

    expect(getVoices('G', 4, false, 0)).toEqual(['B', 'G', 'D', 'B']);


    expect(getVoices('D-7', 3, false, 0)).toEqual(['F', 'C', 'D']);
    expect(getVoicingCombinations(['F', 'C', 'D'])).toEqual([]);

    // hat nur eine kombination...
    expect(getVoicingCombinations(['C', 'E', 'Bb', 'Db'])).toEqual([['C', 'E', 'Bb', 'Db']]);

    // B7b9b5
    // G69
    // A-9 ???
    // D7b9 hat nur eine kombination!? (Siehe "You Won't Forget Me")

})

test('getRangeDirection', () => {
    const fn = util.getRangeDirection;
    expect(fn('C2', ['C3', 'C4']).direction).toBe('up');
    expect(fn(Note.midi('C2'), ['C3', 'C4']).direction).toBe('up');
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


test('getVoicing', () => {
    expect(util.getVoicing('C7#5')).toEqual(['C', 'E', 'G#', 'Bb']);
});


test('getDegreeFromInterval', () => {
    expect(util.getDegreeFromInterval(Distance.interval('C', 'C'))).toBe(1);
    expect(util.getDegreeFromInterval(Distance.interval('C', 'E'))).toBe(3);
    expect(util.getDegreeFromInterval(Distance.interval('C', 'Eb'))).toBe(3);
    expect(util.getDegreeFromInterval(Distance.interval('C', 'F'))).toBe(4);
    expect(util.getDegreeFromInterval(Distance.interval('C', 'G'))).toBe(5);
    expect(util.getDegreeFromInterval(Distance.interval('D', 'C'))).toBe(7);
    expect(util.getDegreeFromInterval('13M')).toBe(13);
    expect(util.getDegreeFromInterval('6M')).toBe(6);
});

test('sortByDegree', () => {
    const cmaj = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
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

test('renderAbsoluteNotes', () => {
    expect(util.renderAbsoluteNotes(['D', 'F', 'G', 'Bb'], 3)).toEqual(['D3', 'F3', 'G3', 'Bb3']);
    expect(util.renderAbsoluteNotes(['C', 'F', 'D', 'C'])).toEqual(['C3', 'F3', 'D4', 'C5']);
    expect(util.renderAbsoluteNotes(['C', 'F', 'D', 'C'], 4, 'down')).toEqual(['C4', 'F3', 'D3', 'C3']);
    expect(util.renderAbsoluteNotes(['C', 'C', 'C'])).toEqual(['C3', 'C4', 'C5']);
    expect(util.renderAbsoluteNotes(['C', 'C', 'C'], 5, 'down')).toEqual(['C5', 'C4', 'C3']);
    expect(util.renderAbsoluteNotes(['F', 'A', 'C', 'E'].reverse(), 4, 'down').reverse()).toEqual(['F3', 'A3', 'C4', 'E4']);
});

test('getIntervals', () => {
    expect(util.getIntervals(['C3', 'D3', 'F3', 'C4'])).toEqual(['2M', '3m', '5P']);
});

test('smallestInterval', () => {
    expect(util.smallestInterval(util.getIntervals(['C3', 'D3', 'F3', 'C4']))).toEqual('2M');
});

test('sortNotes', () => {
    expect(util.sortNotes(['C3', 'C2', 'F3', 'F1'])).toEqual(['F1', 'C2', 'C3', 'F3']);
    expect(util.sortNotes(['C3', 'C2', 'C6', 'C1'])).toEqual(['C1', 'C2', 'C3', 'C6']);
});

test('analyzeVoicing', () => {
    const analyzed = util.analyzeVoicing(['D3', 'F3', 'A3', 'C4']);
    expect(analyzed.spread).toBe('7m');
    expect(analyzed.minInterval).toBe('3m');
    expect(analyzed.maxInterval).toBe('3M');
});


test('minIntervals', () => {
    expect(util.minIntervals(['C', 'E', 'G'], ['C', 'E', 'G'])).toEqual(['1P', '1P', '1P']);
    expect(util.minIntervals(['C', 'E', 'G'], ['C', 'F', 'G'])).toEqual(['1P', '2m', '1P']);
    expect(util.minIntervals(['C', 'F', 'G'], ['C', 'E', 'G'])).toEqual(['1P', '-2m', '1P']);
});

test('semitoneDifference', () => {
    expect(util.semitoneDifference(['1P', '1P'])).toBe(0);
    expect(util.semitoneDifference(['2M', '2m'])).toBe(3);
    expect(util.semitoneDifference(['-2M', '4A'])).toBe(8);
    expect(semitoneDifference(['1P', '-1A', '1P', null])).toBe(1); // uper interval is ignored
});
test('semitoneMovement', () => {
    expect(util.semitoneMovement(['1P', '1P'])).toBe(0);
    expect(util.semitoneMovement(['2M', '2m'])).toBe(3);
    expect(util.semitoneMovement(['2M', '-2m'])).toBe(1);
    expect(util.semitoneMovement(['-2M', '4A'])).toBe(4);
});

test('voicingIntervals', () => {
    expect(util.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toEqual(['1P', '-1A', '1P']);
    expect(util.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G'], false)).toEqual(['1P', '8d', '1P']);
    expect(util.voicingIntervals(['C', 'E3', 'G'], ['C', 'Eb3', 'G'])).toEqual(['1P', '-1A', '1P']);
    expect(util.voicingIntervals(['C', 'E3', 'G'], ['C', 'Eb2', 'G'])).toEqual(['1P', '-8A', '1P']);
    expect(util.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G', 'Bb'])).toEqual(['1P', '-1A', '1P']);
    /* expect(util.voicingIntervals(['C', 'E', 'G', 'B'], ['C', 'Eb', 'G'])).toEqual(['1P', '-2m', '1P', null]); */
});

test('voicingDifference', () => {
    expect(util.voicingDifference(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toBe(1);
    expect(util.voicingDifference(['C', 'E', 'G'], ['D', 'F#', 'A'])).toBe(6);
    expect(util.voicingDifference(['C', 'E', 'G'], ['E', 'G#', 'B'])).toBe(12);
    expect(util.voicingDifference(['C', 'E', 'G', 'B'], ['C', 'Eb', 'G'])).toEqual(1);
});

test('voicingMovement', () => {
    expect(util.voicingMovement(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toBe(-1);
    expect(util.voicingMovement(['C', 'E', 'G'], ['D', 'F#', 'A'])).toBe(6);
    expect(util.voicingMovement(['C', 'E', 'G'], ['B', 'E', 'G#'])).toBe(0);
    expect(util.voicingMovement(['F#', 'A#', 'C#'], ['C', 'E', 'G'])).toBe(18);
    expect(util.voicingMovement(['C', 'E', 'C'], ['E', 'C', 'C'])).toBe(0);
    expect(util.voicingMovement(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(-3);
    expect(util.voicingMovement(['C', 'E', 'F', 'A'], ['B', 'D', 'F', 'A'])).toBe(-3);
    expect(util.voicingMovement(['E', 'A', 'C', 'F'], ['A', 'D', 'F', 'B'])).toBe(21);
    expect(util.voicingMovement(['E', 'A', 'C', 'F'], ['B', 'F', 'A', 'D'])).toBe(-15);

    expect(util.voicingMovement(['D2', 'F2', 'A2'], ['D3', 'F3', 'A3'], false)).toBe(36);

});

test('analyzeVoiceLeading', () => {
    const { movement, difference, averageMovement, averageDifference } = analyzeVoiceLeading([['C', 'D'], ['D', 'E'], ['C', 'Eb'], ['D', 'E']]);
    expect(movement).toEqual(4);
    expect(difference).toEqual(10);
    expect(averageMovement).toEqual(1);
    expect(averageDifference).toEqual(2.5);
});

test('chordHasIntervals', () => {
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
test('isDominantChord', () => {
    expect(util.isDominantChord('C^7')).toBe(false);
    expect(util.isDominantChord('C7')).toBe(true);
    expect(util.isDominantChord('C7#5')).toBe(true);
    expect(util.isDominantChord('C7sus')).toBe(true);
    expect(util.isDominantChord('C13')).toBe(true);
    expect(util.isDominantChord('C')).toBe(false);
    expect(util.isDominantChord('G7b9b13')).toBe(true);
    expect(util.isDominantChord('Eb-7')).toBe(false);
});
test('isMajorChord', () => {
    expect(util.isMajorChord('D^7')).toBe(true);
    expect(util.isMajorChord('D7')).toBe(false);
    expect(util.isMajorChord('D')).toBe(true);
    expect(util.isMajorChord('Eb-7')).toBe(false);
});
test('isMinorChord', () => {
    expect(util.isMinorChord('D^7')).toBe(false);
    expect(util.isMinorChord('D7')).toBe(false);
    expect(util.isMinorChord('D')).toBe(false);
    expect(util.isMinorChord('Eb-7')).toBe(true);
    expect(util.isMinorChord('Eb-')).toBe(true);
    expect(util.isMinorChord('Eb-^7')).toBe(true);
    expect(util.isMinorChord('Eb-7b5')).toBe(true);
});
test('isMinorChord', () => {
    expect(util.isMinorChord('D^7')).toBe(false);
    expect(util.isMinorChord('D7')).toBe(false);
    expect(util.isMinorChord('D')).toBe(false);
    expect(util.isMinorChord('Eb-7')).toBe(true);
    expect(util.isMinorChord('Eb-')).toBe(true);
    expect(util.isMinorChord('Eb-^7')).toBe(true);
    expect(util.isMinorChord('Eb-7b5')).toBe(true);
});
test('isMinorTonic', () => {
    expect(util.isMinorTonic('D^7')).toBe(false);
    expect(util.isMinorTonic('D7')).toBe(false);
    expect(util.isMinorTonic('D')).toBe(false);
    expect(util.isMinorTonic('Eb-7')).toBe(false);
    expect(util.isMinorTonic('Eb-')).toBe(true);
    expect(util.isMinorTonic('Eb-^7')).toBe(true);
    expect(util.isMinorTonic('Eb-7b5')).toBe(false);
    expect(util.isMinorTonic('Eb-6')).toBe(true);
});

test('getChordType', () => {
    const fn = util.getChordType;
    expect(fn('C7')).toBe('dominant');
    expect(fn('C-7')).toBe('minor');
    expect(fn('C^7')).toBe('major');
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


test('permutateArray', () => {
    expect(permutateArray([1, 2])).toEqual([
        [1, 2],
        [2, 1]
    ]);
    expect(permutateArray([1, 2, 3])).toEqual(
        [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
    );
    expect(permutateArray(["C", "E", "G", "B"]).length).toBe(24);
    expect(permutateArray(["C", "E", "G", "B", "D"]).length).toBe(120);
});

// c(n) = c(n-1) * n + n
test('permutationComplexity', () => {
    expect(permutationComplexity(['C', 'E', 'G'], voicingValidator())).toBe(12);
    expect(permutationComplexity(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#'], voicingValidator())).toBe(372);
    expect(permutationComplexity(['C', 'D', 'E', 'F', 'G', 'A', 'B'], voicingValidator())).toBe(1187);
    expect(permutationComplexity(['C', 'Eb', 'Gb', 'A'], voicingValidator())).toBe(44);
    expect(permutationComplexity(['C', 'D', 'F', 'G'], voicingValidator())).toBe(29);
    expect(permutationComplexity(['C', 'Eb', 'G', 'Bb'], voicingValidator())).toBe(33);
    expect(permutationComplexity(['C', 'E', 'G', 'B', 'D'], voicingValidator())).toBe(86);
    expect(permutationComplexity(['C', 'D', 'E', 'F'], voicingValidator())).toBe(23);
});

test('permutateElements, getVoicingCombinations', () => {

    function validateRule7(path, next, array) {
        return validateInterval(interval => Interval.semitones(interval) <= 6)(path, next, array)
    }

    expect(permutateElements(["C", "E", "G", "B"], validateRule7)).toEqual(
        [["C", "E", "G", "B"], ["E", "G", "B", "C"], ["G", "B", "C", "E"], ["B", "C", "E", "G"], ["B", "E", "G", "C"]]
    );

    function validateRules75(path, next, array) {
        return combineValidators(
            validateInterval(interval => Interval.semitones(interval) <= 6),
            validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) > 2)
        )(path, next, array)
    }

    expect(permutateElements(["C", "E", "G", "B"], validateRules75)).toEqual(
        [["C", "E", "G", "B"], ["G", "B", "C", "E"], ["B", "C", "E", "G"], ["B", "E", "G", "C"]]
    );

    expect(permutateElements(["C", "E", "G", "B"], voicingValidator())).toEqual(
        [["C", "E", "G", "B"], ["G", "B", "C", "E"], ["B", "E", "G", "C"]]
    );

    expect(permutateElements(['D', 'F', 'A', 'C'], voicingValidator())).toEqual(
        [["D", "F", "A", "C"], ["A", "C", "D", "F"], ["C", "F", "A", "D"]]
    );

    expect(permutationComplexity(['D', 'F', 'A', 'C'], voicingValidator())).toEqual(33);
});

test('getVoicingCombinations', () => {

    // this is just sugar for permutationComplexity with voicing validator
    expect(getVoicingCombinations(['F', 'A', 'C', 'E'])).toEqual(
        [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A'], ['E', 'A', 'C', 'F']]
    );
    expect(getVoicingCombinations(['F', 'A', 'C', 'E'], { topNotes: ['A', 'E'] })).toEqual(
        [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A']]
    );
    expect(getVoicingCombinations(['F', 'A', 'C', 'E'], { bottomNotes: ['E'] }))
        .toEqual([['E', 'A', 'C', 'F']]);

    expect(getVoicingCombinations(['F', 'A', 'C', 'E'], { bottomNotes: ['A'], minTopDistance: 0 }))
        .toEqual([['A', 'C', 'E', 'F']]);

    expect(getVoicingCombinations(['B', 'D', 'F', 'A'])).toEqual(
        [['B', 'D', 'F', 'A'], ['B', 'F', 'A', 'D'], ['F', 'A', 'B', 'D'], ['A', 'D', 'F', 'B']]
    );

    expect(getVoicingCombinations(['E', 'G', 'C'])).toEqual(
        [['E', 'G', 'C'], ['G', 'C', 'E'], ['C', 'E', 'G']]
    );
    expect(permutateElements(['E', 'G', 'C'],
        voicingValidator({
            maxDistance: 6
        }))
    ).toEqual(
        [['E', 'G', 'C'], ['G', 'C', 'E'], ['C', 'E', 'G']]
    );
});

test('voicingMovement #2', () => {
    expect(util.voicingMovement(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(-3); // A -> E
    expect(util.voicingDifference(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(3);
    expect(util.voicingMovement(['C', 'E', 'F', 'A'], ['B', 'D', 'F', 'A'])).toBe(-3); // B -> D
    expect(util.voicingMovement(['E', 'A', 'C', 'F'], ['A', 'D', 'F', 'B'])).toBe(21);
    expect(util.voicingMovement(['E', 'A', 'C', 'F'], ['B', 'F', 'A', 'D'])).toBe(-15);
    expect(util.voicingMovement(['F', 'A', 'C', 'E'], ['B', 'F', 'A', 'D'])).toBe(-3);
    expect(util.voicingDifference(['F', 'A', 'C', 'E'], ['B', 'F', 'A', 'D'])).toBe(15);
});
test('bestCombination', () => {
    const c = [['C', 'E', 'G'], ['E', 'G', 'C'], ['G', 'C', 'E']];
    const g = [['G', 'B', 'D'], ['B', 'D', 'G'], ['D', 'G', 'B']];
    expect(getVoicingCombinations(['C', 'E', 'G'])).toEqual(c);
    expect(getVoicingCombinations(['G', 'B', 'D'])).toEqual(g);
    expect(bestCombination(c[0], g)).toEqual(g[1]);
    expect(bestCombination(c[1], g)).toEqual(g[2]);
    expect(bestCombination(c[2], g)).toEqual(g[0]);

    const dmin = [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A'], ['E', 'A', 'C', 'F']];
    const g7 = [['B', 'D', 'F', 'A'], ['B', 'F', 'A', 'D'], ['F', 'A', 'B', 'D'], ['A', 'D', 'F', 'B']]
    expect(getVoicingCombinations(['F', 'A', 'C', 'E'])).toEqual(dmin);
    expect(getVoicingCombinations(['B', 'D', 'F', 'A'])).toEqual(g7);

    expect(bestCombination(dmin[0], g7)).toEqual(['F', 'A', 'B', 'D']);
    expect(bestCombination(dmin[1], g7)).toEqual(['B', 'D', 'F', 'A']);
    expect(bestCombination(dmin[2], g7)).toEqual(['F', 'A', 'B', 'D']);

    expect(bestCombination(dmin[0], g7)).toEqual(['F', 'A', 'B', 'D']);
});

test('getChordNotes', () => {
    expect(getChordNotes('C#-7')).toEqual(['C#', 'E', 'G#', 'B']);
    expect(getChordNotes('C#-7', (note, { degree }) => degree !== 1)).toEqual(['E', 'G#', 'B']);
    expect(getChordNotes('C#-7', validateWithoutRoot)).toEqual(['E', 'G#', 'B']);
});

test('getNextVoicing', () => {
    /* expect(getNextVoicing('C-7', ['D4', 'F4', 'A4', 'C5'])).toEqual(['Bb3', 'Eb4', 'G4', 'C5']); */
    /* expect(getNextVoicing('C-7', ['A3', 'C4', 'D4', 'F4'])).toEqual(['G3', 'Bb3', 'C4', 'Eb4']); */
    expect(getNextVoicing('G', ['C4', 'E4', 'G4'])).toEqual(['B3', 'D4', 'G4']);

    /* let voicing;
    let times = 5;
    for (let i = 0; i < times; ++i) {
        Note.names(' ').concat(['C']).forEach(note => {
            voicing = getNextVoicing(note + '-7', voicing, ['F3', 'C5']);
        });
    }  */
});
