import {
    chordSnippetDiff,
    expandSnippet,
    formatChordSnippet,
    getChordSnippet,
    minifyChordSnippet,
    parseChordSnippet,
    renderChordSnippet
} from "../sheet/Snippet";
import { totalDiff } from '../util';
import { Measure } from '../sheet/Measure';

test('parseChordSnippet', () => {
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

test('parseChordSnippet: houses', () => {
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
    expect(minifyChordSnippet(`RCIFSM7IX`)).toEqual(':C|F#^7|x');
    expect(minifyChordSnippet(':C|F#^7|%', true)).toEqual('RCIFSM7IX');
    expect(minifyChordSnippet(`C7
                                F7`)).toEqual('C7|F7');
    expect(minifyChordSnippet(`C7|||||F7`)).toEqual('C7|F7');
    const urlSafe = minifyChordSnippet(`
    |: E-7b5    | A7b9      | D-     | x          |
    |  G-7      | C7        | F^7    | E-7b5 A7b9 |
    
    |1 D-       | G-7       | Bb7    | A7b9       |
    |  D-       | G7#11     | E-7b5  | A7b9      :|
    
    |2 D-       | G-7       | Bb7    | A7b9       |
    |  D- B7    | Bb7#11 A7 | D-     | x          |
    `, true);

    expect(urlSafe).toBe(`RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7S11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7S11_A7ID-Ix`)
    expect(new RegExp(/^[a-zA-Z0-9_-]*$/).test(urlSafe)).toBe(true)
});

test('formatChordSnippet', () => {
    const urlsafe = 'RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7S11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7S11_A7ID-Ix';
    const formatted = formatChordSnippet(urlsafe);
    expect("\n" + formatted).toBe(
        `
|: E-7b5  |  A7b9       |  D-     |  x           |
|  G-7    |  C7         |  F^7    |  E-7b5 A7b9  |
|1 D-     |  G-7        |  Bb7    |  A7b9        |
|  D-     |  G7#11      |  E-7b5  |  A7b9       :|
|2 D-     |  G-7        |  Bb7    |  A7b9        |
|  D- B7  |  Bb7#11 A7  |  D-     |  x           |`);
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
|  D-7  |  G7          |  C^7     |  x            |
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
    |: C7  |  x  |  C7   |  C7   |
    |1 A7  |  D7  |  D-7  |  G7  :|
    |2 F7  |  F7  |  C7   |  G7   |`;
    const diff = chordSnippetDiff(snippetA, snippetB);
    const total = totalDiff(diff);
    expect(total.balance).toBe(0);
    expect(total.added).toBe(1);
    expect(total.removed).toBe(1);
    expect(total.kept).toBe(52);
    expect(total.changes).toBe(2);
});

test('renderChordSnippet', () => {
    expect(renderChordSnippet(`
|: C7  | F7 |1 C7 | G7 :|
            |2 C7 | C7  |
| F7   | F7 |  C7 | A7  |
| D-7  | G7 |  C7 | G7  |`)
        .map(m => Measure.from(m).chords))
        .toEqual(
            [["C7"], ["F7"], ["C7"], ["G7"],
            ["C7"], ["F7"], ["C7"], ["C7"],
            ["F7"], ["F7"], ["C7"], ["A7"],
            ["D-7"], ["G7"], ["C7"], ["G7"]]
        );
});

test('getChordSnippet', () => {
    expect(
        getChordSnippet([
            { chords: ['C7'], signs: ['{'] }, 'F7',
            { house: 1, chords: ['C7'] }, { chords: ['C7'], signs: ['}'] },
            { house: 2, chords: ['C7'] }, 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7'
        ])).toBe(formatChordSnippet(`
|: C7   | F7 |1 C7 | C7 :|
             |2 C7 | C7  |
| F7    | F7 |  C7 | A7  |
| D-7   | G7 |  C7 | G7  |`));
});

test('Beautiful Love', () => {
    expect(expandSnippet(`
|: E-7b5    | A7b9      | D-     | %          |
|  G-7      | C7        | F^7    | E-7b5 A7b9 |
|1 D-       | G-7       | Bb7    | A7b9       |
|  D-       | G7#11     | E-7b5  | A7b9      :|
|2 D-       | G-7       | Bb7    | A7b9       |
|  D- B7    | Bb7#11 A7 | D-     | %          |
`)).toEqual(formatChordSnippet(`
| E-7b5    | A7b9      | D-     | %          |
|  G-7     | C7        | F^7    | E-7b5 A7b9 |
|  D-      | G-7       | Bb7    | A7b9       |
|  D-      | G7#11     | E-7b5  | A7b9       |
| E-7b5    | A7b9      | D-     | %          |
|  G-7     | C7        | F^7    | E-7b5 A7b9 |
|  D-      | G-7       | Bb7    | A7b9       |
|  D- B7   | Bb7#11 A7 | D-     | %          |
`));
});


test('Ahlert-Turk - Walkin My Baby Back Home', () => {
    expect(expandSnippet(`
|  Bb^7  |  Bo    |  C-7      |  F7     |
|: Bb^7  |  Bb^7  |  Bb^7 G7  |  C7     |
|  F7    |  F7    |  F7       |  Bb^7  :|
|  D-7   |  G7    |  G-7      |  A7     |
|  D-7   |  G7    |  C7       |  F7     |
|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7     |
|  F7    |  F7    |  F7       |  Bb^7   |
`)).toEqual(formatChordSnippet(`
|  Bb^7  |  Bo    |  C-7      |  F7    |
|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7    |
|  F7    |  F7    |  F7       |  Bb^7  |
|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7    |
|  F7    |  F7    |  F7       |  Bb^7  |
|  D-7   |  G7    |  G-7      |  A7    |
|  D-7   |  G7    |  C7       |  F7    |
|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7    |
|  F7    |  F7    |  F7       |  Bb^7  |
`));
});

test('Miller-Parish - Moonlight Serenade', () => {
    expect(expandSnippet(`
|: F6      |  Abo7     |  G-7          |  C7 C7#5      |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6    |
|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |1 F^7 G-7 C7  :|
                                       |2 F^7 F7       |
|  Bb^7    |  Eb7      |  A7b9#5 D7b9  |  D7b9 D7      |
|  B-7b5   |  E7b9     |  Ah7 D7b9     |  G-7 C7b9     |
|  F^7     |  Abo7     |  G-7          |  C7 C7#5      |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6    |
|  A-7 D7  |  Gh7 G-7  |  C7 C7#5      |  F^7          |
`)).toEqual(formatChordSnippet(`
|  F6      |  Abo7     |  G-7          |  C7 C7#5     |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6   |
|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |  F^7 G-7 C7  |
|  F6      |  Abo7     |  G-7          |  C7 C7#5     |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6   |
|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |  F^7 F7      |
|  Bb^7    |  Eb7      |  A7b9#5 D7b9  |  D7b9 D7     |
|  B-7b5   |  E7b9     |  Ah7 D7b9     |  G-7 C7b9    |
|  F^7     |  Abo7     |  G-7          |  C7 C7#5     |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6   |
|  A-7 D7  |  Gh7 G-7  |  C7 C7#5      |  F^7         |
`));
});
