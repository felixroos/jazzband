import { Snippet } from "../sheet/Snippet";
import { totalDiff } from '../util/util';
import { Measure } from '../sheet/Measure';

test('Snippet.parse2', () => {
    expect(Snippet.nest(`f . a c . e`)).toEqual(['f', ['a', 'c'], 'e']);
    expect(Snippet.nest('D-7')).toEqual('D-7');
    expect(Snippet.nest('D-7 G7 C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet.parse2('| f . a c . e | d e f a |')).toEqual([['f', ['a', 'c'], 'e'], ['d', 'e', 'f', 'a']]);
    /* .toEqual([['f'], ['a', 'c'], ['e']]) */
});

test('Snippet.parse2 Blues for Alice', () => {
    const alice = Snippet.parse2(`
    f+ . c+ a . e+ . c+ a |
    d+ e+ b d+ db+ bb g ab |
    a . f d . g a . f e |`);
    expect(alice).toEqual([
        ['f+', ['c+', 'a'], 'e+', ['c+', 'a']],
        ['d+', 'e+', 'b', 'd+', 'db+', 'bb', 'g', 'ab'],
        ['a', ['f', 'd'], ['g', 'a'], ['f', 'e']]
    ]);
});

test('Snippet.parse2', () => {
    expect(Snippet.parse2('D-7')).toEqual(['D-7']);
    expect(Snippet.parse2('D-7 G7 C^7')).toEqual([['D-7', 'G7', 'C^7']]);
    expect(Snippet.parse2('D-7 | G7 | C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet.parse2('D-7 G7 | C^7')).toEqual([['D-7', 'G7'], 'C^7']);
    expect(Snippet.parse2(`
    C7  | F7 | C7 | C7
    F7  | F7 | C7 | A7
    D-7 | G7 | C7 | G7`))
        .toEqual([
            'C7', 'F7', 'C7', 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
    expect(Snippet.parse2(`
            | C7  | F7 | C7 | C7 |
            | F7  | F7 | C7 | A7 |
            | D-7 | G7 | C7 | G7 |`))
        .toEqual([
            'C7', 'F7', 'C7', 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
});

test('Snippet.parse2 control flow', () => {
    expect(Snippet.parse2(`| A (DC) | B |`))
        .toEqual([{ chords: ['A'], signs: ['DC'] }, 'B']);
    expect(Snippet.parse2(`| A (Fine) | B (DC) |`))
        .toEqual([{ chords: ['A'], signs: ['Fine'] }, { chords: ['B'], signs: ['DC'] }]);
    expect(Snippet.parse2(`| A (F) | B (DC) |`))
        .toEqual([{ chords: ['A'], signs: ['Fine'] }, { chords: ['B'], signs: ['DC'] }]);
    expect(Snippet.parse2(`| A (ToCoda) | B (DC) | (Coda) C |`))
        .toEqual([{ chords: ['A'], signs: ['ToCoda'] }, { chords: ['B'], signs: ['DC'] }, { chords: ['C'], signs: ['Coda'] }]);
    expect(Snippet.parse2(`| A (2Q) | B (DC) | (Q) C |`))
        .toEqual([{ chords: ['A'], signs: ['ToCoda'] }, { chords: ['B'], signs: ['DC'] }, { chords: ['C'], signs: ['Coda'] }]);
})


test('Snippet.parse', () => {
    expect(Snippet.parse('D-7')).toEqual(['D-7']);
    expect(Snippet.parse('D-7 G7 C^7')).toEqual([['D-7', 'G7', 'C^7']]);
    expect(Snippet.parse('D-7 | G7 | C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet.parse('D-7 G7 | C^7')).toEqual([['D-7', 'G7'], 'C^7']);
    expect(Snippet.parse(`
    C7  | F7 | C7 | C7
    F7  | F7 | C7 | A7
    D-7 | G7 | C7 | G7`))
        .toEqual([
            'C7', 'F7', 'C7', 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
    expect(Snippet.parse(`
            | C7  | F7 | C7 | C7 |
            | F7  | F7 | C7 | A7 |
            | D-7 | G7 | C7 | G7 |`))
        .toEqual([
            'C7', 'F7', 'C7', 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7']);
});

test('Snippet.parse: houses', () => {
    expect(Snippet.parse(`
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

test('Snippet.parse: houses', () => {
    expect(Snippet.parse(`
            |:C7:|`))
        .toEqual([
            { chords: ['C7'], signs: ['{', '}'] }
        ]);
});

test('Snippet.minify', () => {
    expect(Snippet.minify(`|C7|F7|`)).toEqual('C7|F7');
    expect(Snippet.minify(`   C7    |  F7`)).toEqual('C7|F7');
    expect(Snippet.minify(`RCIFYM7IX`)).toEqual(':C|F#^7|x');
    expect(Snippet.minify(':C|F#^7|%', true)).toEqual('RCIFYM7IX');
    expect(Snippet.minify(`C7
                                F7`)).toEqual('C7|F7');
    expect(Snippet.minify(`C7|||||F7`)).toEqual('C7|F7');
    const urlSafe = Snippet.minify(`
    |: E-7b5    | A7b9      | D-     | x          |
    |  G-7      | C7        | F^7    | E-7b5 A7b9 |
    
    |1 D-       | G-7       | Bb7    | A7b9       |
    |  D-       | G7#11     | E-7b5  | A7b9      :|
    
    |2 D-       | G-7       | Bb7    | A7b9       |
    |  D- B7    | Bb7#11 A7 | D-     | x          |
    `, true);

    expect(urlSafe).toBe(`RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7Y11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7Y11_A7ID-Ix`)
    expect(new RegExp(/^[a-zA-Z0-9_-]*$/).test(urlSafe)).toBe(true)
});

test('Snippet.format', () => {
    const urlsafe = 'RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7Y11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7Y11_A7ID-Ix';
    const formatted = Snippet.format(urlsafe);
    expect("\n" + formatted).toBe(
        `
|: E-7b5  |  A7b9       |  D-     |  x           |
|  G-7    |  C7         |  F^7    |  E-7b5 A7b9  |
|1 D-     |  G-7        |  Bb7    |  A7b9        |
|  D-     |  G7#11      |  E-7b5  |  A7b9       :|
|2 D-     |  G-7        |  Bb7    |  A7b9        |
|  D- B7  |  Bb7#11 A7  |  D-     |  x           |`);
    expect(Snippet.minify(formatted, true)).toBe(urlsafe);
})

test('Snippet.minify', () => {
    const fakeBlues = `
|: C7  |  F7  |  C7   |  C7   |
|1 A7  |  D7  |  D-7  |  G7  :|
|2 F7  |  F7  |  C7   |  G7   |`;
    const miniFakeBlues = Snippet.minify(fakeBlues);
    expect(miniFakeBlues).toBe(':C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7|F7|C7|G7');
})

test('Snippet.format with offset', () => {
    const withTwoBarOffset = Snippet.format(`RGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9I1_A7IA-7b5_D7b9RI2_A-7_D7IGM7ID-7IG7ICM7IXIF-7IBb7IEbM7IA-7_D7IGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9IA-7_D7IGM7_D7`);
    expect("\n" + withTwoBarOffset).toBe(`
|: G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |
|  C7   |  B-7b5 E7b9  |1 A7      |  A-7b5 D7b9  :|
                       |2 A-7 D7  |  G^7          |
|  D-7  |  G7          |  C^7     |  x            |
|  F-7  |  Bb7         |  Eb^7    |  A-7 D7       |
|  G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |
|  C7   |  B-7b5 E7b9  |  A-7 D7  |  G^7 D7       |`);

    const withThreeBarOffset = Snippet.format('RCM7ID-7_G7ICM7I1_G7RI2_E7IA-7ID7ID-7IG7');
    expect("\n" + withThreeBarOffset).toBe(`
|: C^7  |  D-7 G7  |  C^7  |1 G7  :|
                           |2 E7   |
|  A-7  |  D7      |  D-7  |  G7   |`);

    /* const lessThan4 = `|: A | 1 B :| 2 C |`;
    expect(Snippet.format("\n" + lessThan4)).toBe(`
|  A  |1 B  :|2 C  |`); */

    const withOneBarOffset = Snippet.format('RCM7I1_D-7_G7ICM7IG7RI2_B-7b5IE7IA7IA-7ID7ID-7IG7');
    expect("\n" + withOneBarOffset).toBe(`
|: C^7  |1 D-7 G7  |  C^7  |  G7  :|
        |2 B-7b5   |  E7   |  A7   |
|  A-7  |  D7      |  D-7  |  G7   |`);

    const withNoOffset = Snippet.format('|:C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7 |F7|C7|G7|');
    expect("\n" + withNoOffset).toBe(`
|: C7  |  F7  |  C7   |  C7   |
|1 A7  |  D7  |  D-7  |  G7  :|
|2 F7  |  F7  |  C7   |  G7   |`);
});

test('Snippet.diff', () => {
    const snippetA = `
    |: C7  |  F7  |  C7   |  C7   |
    |1 A7  |  D7  |  D-7  |  G7  :|
    |2 F7  |  F7  |  C7   |  G7   |`;
    const snippetB = `
    |: C7  |  x  |  C7   |  C7   |
    |1 A7  |  D7  |  D-7  |  G7  :|
    |2 F7  |  F7  |  C7   |  G7   |`;
    const diff = Snippet.diff(snippetA, snippetB);
    const total = totalDiff(diff);
    expect(total.balance).toBe(0);
    expect(total.added).toBe(1);
    expect(total.removed).toBe(1);
    expect(total.kept).toBe(52);
    expect(total.changes).toBe(2);
});

test('Snippet.render', () => {
    expect(Snippet.render(`
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

test('Snippet.from', () => {
    expect(
        Snippet.from([
            { chords: ['C7'], signs: ['{'] }, 'F7',
            { house: 1, chords: ['C7'] }, { chords: ['C7'], signs: ['}'] },
            { house: 2, chords: ['C7'] }, 'C7',
            'F7', 'F7', 'C7', 'A7',
            'D-7', 'G7', 'C7', 'G7'
        ])).toBe(Snippet.format(`
|: C7   |  F7  |1 C7  |  C7  :|
                   |2 C7  |  C7   |
    |  F7   |  F7  |  C7  |  A7   |
    |  D-7  |  G7  |  C7  |  G7   |`));



expect(
    Snippet.from([
        'A',
        { chords: ['B'], signs: ['Segno', 'Fine'] },
        { chords: ['C'], signs: ['DS'] }
    ])).toBe(Snippet.format(`| A | (S) B (F) | C (DS) |`));
});

test('Repeats', () => {
    expect(Snippet.expand(`|: A | B :| `))
        .toBe(Snippet.format(`| A | B | A | B | `))

    expect(Snippet.expand(`| A | B :| `))
        .toBe(Snippet.format(`| A | B | A | B | `))
});

test('Houses', () => {
    // Inside repeat signs. Play one house at a time, step forward sequentially each repeat:
    expect(Snippet.expand(`|: A | 1 B :| 2 C | `))
        .toBe(Snippet.format(`| A | B | A | C | `))
});

test('getControlSigns', () => {
    expect(Snippet.getControlSigns(['(DC)', 'C7', 'Q']).map(c => c.short)).toEqual(['DC', 'Q']);
});

test('DC = Da Capo', () => {
    // Jump back to beginning:
    expect(Snippet.expand(`| A (DC) | B | `))
        .toBe(Snippet.format(`| A | A | B | `))
});

test('DC + Fine = Da Capo al Fine', () => {
    // Finishes the piece, only when a DS/DC has been hit before.
    expect(Snippet.expand(`| A (Fine) | B (DC) | `))
        .toBe(Snippet.format(`| A | B | A | `));

    expect(Snippet.expand(`| A (F) | B (DC) | `))
        .toBe(Snippet.format(`| A | B | A | `))
});

test('DC + Coda = Da Capo al Coda', () => {
    // Finishes the piece, only when a DS/DC has been hit before.
    expect(Snippet.expand(`| A (ToCoda) | B (DC) | (Coda) C | `))
        .toBe(Snippet.format(`| A | B | A | C | `))

    expect(Snippet.expand(`| A (2Q) | B (DC) | (Q) C | `))
        .toBe(Snippet.format(`| A | B | A | C | `))
});

test('DS = Dal Segno', () => {
    // Jump back to Segno (S).
    expect(Snippet.expand(`| A | (Segno) B (DS) | C | `))
        .toBe(Snippet.format(`| A | B | B | C | `))

    expect(Snippet.expand(`| A | (S) B (DS) | C | `))
        .toBe(Snippet.format(`| A | B | B | C | `))
});

test('DS + Fine = Dal Segno al Fine', () => {
    // Jump back to Segno. Stop playing when hitting Fine:
    expect(Snippet.expand(`| A | (Segno) B (Fine) | C (DS) | `))
        .toBe(Snippet.format(`| A | B | C | B | `))

    expect(Snippet.expand(`| A | (S) B (F) | C (DS) | `))
        .toBe(Snippet.format(`| A | B | C | B | `))
});

test('DS + Coda = Dal Segno al Coda', () => {
    // Jump back to Segno. When hitting ToCoda sign, jump to the Bar with the Coda sign.
    expect(Snippet.expand(`| A | (S) B (ToCoda) | C (DS) | (Coda) D | `))
        .toBe(Snippet.format(`| A | B | C | B | D | `))

    expect(Snippet.expand(`| A | (S) B (2Q) | C (DS) | (Q) D | `))
        .toBe(Snippet.format(`| A | B | C | B | D | `))
});

test('Beautiful Love', () => {
    expect(Snippet.expand(`
|: E-7b5    | A7b9      | D-     | %          |
|  G-7      | C7        | F^7    | E-7b5 A7b9 |
|1 D-       | G-7       | Bb7    | A7b9       |
|  D-       | G7#11     | E-7b5  | A7b9      :|
|2 D-       | G-7       | Bb7    | A7b9       |
|  D- B7    | Bb7#11 A7 | D-     | %          |
`)).toEqual(Snippet.format(`
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
    expect(Snippet.expand(`
|  Bb^7  |  Bo    |  C-7      |  F7     |
|: Bb^7  |  Bb^7  |  Bb^7 G7  |  C7     |
|  F7    |  F7    |  F7       |  Bb^7  :|
|  D-7   |  G7    |  G-7      |  A7     |
|  D-7   |  G7    |  C7       |  F7     |
|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7     |
|  F7    |  F7    |  F7       |  Bb^7   |
`)).toEqual(Snippet.format(`
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
    expect(Snippet.expand(`
|: F6      |  Abo7     |  G-7          |  C7 C7#5      |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6    |
|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |1 F^7 G-7 C7  :|
                                       |2 F^7 F7       |
|  Bb^7    |  Eb7      |  A7b9#5 D7b9  |  D7b9 D7      |
|  B-7b5   |  E7b9     |  Ah7 D7b9     |  G-7 C7b9     |
|  F^7     |  Abo7     |  G-7          |  C7 C7#5      |
|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6    |
|  A-7 D7  |  Gh7 G-7  |  C7 C7#5      |  F^7          |
`)).toEqual(Snippet.format(`
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