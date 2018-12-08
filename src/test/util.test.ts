import * as util from '../util';
import { parseChordSnippet, minifyChordSnippet, formatChordSnippet } from '../util';
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
    expect(util.getChordScales('D7#11', 'Diatonic')).toEqual(
        ["lydian dominant"]
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

test('parseChords', () => {
    expect(parseChordSnippet('D-7')).toEqual(['D-7']);
    expect(parseChordSnippet('D-7 G7 C^7')).toEqual([['D-7', 'G7', 'C^7']]);
    expect(parseChordSnippet('D-7 | G7 | C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(parseChordSnippet('D-7 G7 | C^7')).toEqual([['D-7', 'G7'], 'C^7']);
    expect(parseChordSnippet(`
    C7  | F7 | C7 | C7
    F7  | F7 | C7 | A7
    D-7 | G7 | C7 | G7`))
        .toEqual([
            'C7', 'F7', 'C7', 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
    expect(parseChordSnippet(`
            | C7  | F7 | C7 | C7 |
            | F7  | F7 | C7 | A7 |
            | D-7 | G7 | C7 | G7 |`))
        .toEqual([
            'C7', 'F7', 'C7', 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
});

test('parseChords: houses', () => {
    expect(parseChordSnippet(`
            |: C7  | F7 |1 C7 | C7 :|
                        |2 C7 | C7  |
            | F7   | F7 |  C7 | A7  |
            | D-7  | G7 |  C7 | G7  |`))
        .toEqual([
            { chords: ['C7'], signs: ['{'] }, 'F7',
            { house: 1, chords: ['C7'] }, { chords: ['C7'], signs: ['}'] },
            { house: 2, chords: ['C7'] }, 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
});

test('parseChordSnippet: houses', () => {
    expect(parseChordSnippet(`
            |:C7:|`))
        .toEqual([
            { chords: ['C7'], signs: ['{', '}'] }
        ]);
});

test('minifyChordSnippet', () => {
    expect(minifyChordSnippet(`|C7|F7|`)).toEqual('C7|F7');
    expect(minifyChordSnippet(`   C7    |  F7`)).toEqual('C7|F7');
    expect(minifyChordSnippet(`RCIFSM7IX`)).toEqual(':C|F#^7|%');
    expect(minifyChordSnippet(':C|F#^7|%', true)).toEqual('RCIFSM7IX');
    expect(minifyChordSnippet(`C7
                                F7`)).toEqual('C7|F7');
    expect(minifyChordSnippet(`C7|||||F7`)).toEqual('C7|F7');
    const urlSafe = minifyChordSnippet(`
    |: E-7b5    | A7b9      | D-     | %          |
    |  G-7      | C7        | F^7    | E-7b5 A7b9 |
    
    |1 D-       | G-7       | Bb7    | A7b9       |
    |  D-       | G7#11     | E-7b5  | A7b9      :|
    
    |2 D-       | G-7       | Bb7    | A7b9       |
    |  D- B7    | Bb7#11 A7 | D-     | %          |
    `, true);

    expect(urlSafe).toBe(`RE-7b5IA7b9ID-IXIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7S11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7S11_A7ID-IX`)
    expect(new RegExp(/^[a-zA-Z0-9_-]*$/).test(urlSafe)).toBe(true)
});

test('formatChordSnippet', () => {
    const urlsafe = 'RE-7b5IA7b9ID-IXIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7S11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7S11_A7ID-IX';
    const formatted = formatChordSnippet(urlsafe);
    expect("\n" + formatted).toBe(
        `
|: E-7b5  |  A7b9       |  D-     |  %           |
|  G-7    |  C7         |  F^7    |  E-7b5 A7b9  |
|1 D-     |  G-7        |  Bb7    |  A7b9        |
|  D-     |  G7#11      |  E-7b5  |  A7b9       :|
|2 D-     |  G-7        |  Bb7    |  A7b9        |
|  D- B7  |  Bb7#11 A7  |  D-     |  %           |`);
    expect(minifyChordSnippet(formatted, true)).toBe(urlsafe);
})

test('minifyChordSnippet', () => {
    const fakeBlues = `
|: C7  |  F7  |  C7   |  C7   |
|1 A7  |  D7  |  D-7  |  G7  :|
|2 F7  |  F7  |  C7   |  G7   |`;
    const miniFakeBlues = minifyChordSnippet(fakeBlues);
    expect(miniFakeBlues).toBe(':C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7|F7|C7|G7');
})

test('formatChordSnippet with offset', () => {
    const withTwoBarOffset = formatChordSnippet(`RGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9I1_A7IA-7b5_D7b9RI2_A-7_D7IGM7ID-7IG7ICM7IXIF-7IBb7IEbM7IA-7_D7IGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9IA-7_D7IGM7_D7`);
    expect("\n" + withTwoBarOffset).toBe(`
|: G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |
|  C7   |  B-7b5 E7b9  |1 A7      |  A-7b5 D7b9  :|
                       |2 A-7 D7  |  G^7          |
|  D-7  |  G7          |  C^7     |  %            |
|  F-7  |  Bb7         |  Eb^7    |  A-7 D7       |
|  G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |
|  C7   |  B-7b5 E7b9  |  A-7 D7  |  G^7 D7       |`);

    const withThreeBarOffset = formatChordSnippet('RCM7ID-7_G7ICM7I1_G7RI2_E7IA-7ID7ID-7IG7');
    expect("\n" + withThreeBarOffset).toBe(`
|: C^7  |  D-7 G7  |  C^7  |1 G7  :|
                           |2 E7   |
|  A-7  |  D7      |  D-7  |  G7   |`);

    const withOneBarOffset = formatChordSnippet('RCM7I1_D-7_G7ICM7IG7RI2_B-7b5IE7IA7IA-7ID7ID-7IG7');
    expect("\n" + withOneBarOffset).toBe(`
|: C^7  |1 D-7 G7  |  C^7  |  G7  :|
        |2 B-7b5   |  E7   |  A7   |
|  A-7  |  D7      |  D-7  |  G7   |`);

    const withNoOffset = formatChordSnippet('|:C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7 |F7|C7|G7|');
    expect("\n" + withNoOffset).toBe(`
|: C7  |  F7  |  C7   |  C7   |
|1 A7  |  D7  |  D-7  |  G7  :|
|2 F7  |  F7  |  C7   |  G7   |`);
});

test('chordSnippetDiff', () => {
    const snippetA = `
    |: C7  |  F7  |  C7   |  C7   |
    |1 A7  |  D7  |  D-7  |  G7  :|
    |2 F7  |  F7  |  C7   |  G7   |`;
    const snippetB = `
    |: C7  |  %  |  C7   |  C7   |
    |1 A7  |  D7  |  D-7  |  G7  :|
    |2 F7  |  F7  |  C7   |  G7   |`;
    const diff = util.chordSnippetDiff(snippetA, snippetB);
    const total = util.totalDiff(diff);
    expect(total.balance).toBe(0);
    expect(total.added).toBe(1);
    expect(total.removed).toBe(1);
    expect(total.kept).toBe(52);
    expect(total.changes).toBe(2);
})