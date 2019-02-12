import {
    parseChordSnippet,
    minifyChordSnippet,
    formatChordSnippet,
    chordSnippetDiff,
    renderChordSnippet,
    getChordSnippet,
    expandSnippet,
    hasSign,
    renderSheet,
    shouldRepeat,
    hasHouse,
    getBracePair,
    testFormat,
    getRepeatTimes,
    getRelatedHouse,
    canVisitHouse,
    getNextHouseIndex,
    getMeasure,
} from "../Sheet";
import { totalDiff } from '../util';

test('repeat one bar', () => {
    expect(renderSheet([{ chords: ['A'], signs: ['{', '}'] }]).map(m => m.chords))
        .toEqual([['A'], ['A']]);
});

test('repeat more than one bar', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['}'] }
    ]).map(m => m.chords))
        .toEqual([['A'], ['B'], ['A'], ['B']]);
});

/* test('repeat one bar in the middle', () => {
    expect(renderSheet(['A', { chords: ['B'], signs: ['{', '}'] }, 'C']).map(m => m && m.chords ? m.chords : m))
        .toEqual(['A', ['B'], ['B'], 'C']);
}); */


test('sequential repeats', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{', '}'] },
        { chords: ['B'], signs: ['{', '}'] }
    ]).map(m => m.chords))
        .toEqual([['A'], ['A'], ['B'], ['B']]);
});

test('one nested repeat', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], signs: ['}'] }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'],
            ['A'], ['B'], ['B'], ['C']
        ]);
});


test('two nested repeats', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], signs: ['{', '}'] },
        { chords: ['D'], signs: ['}'] }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'], ['C'], ['D'],
            ['A'], ['B'], ['B'], ['C'], ['C'], ['D']
        ]);
});

test('double nested repeats', () => {
    expect(renderSheet([

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{'] },
        { chords: ['C'], signs: ['{', '}'] },
        { chords: ['D'], signs: ['}'] },
        { chords: ['E'], signs: ['}'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['C'], ['C'], ['D'], ['B'], ['C'], ['C'], ['D'], ['E'],
            ['A'], ['B'], ['C'], ['C'], ['D'], ['B'], ['C'], ['C'], ['D'], ['E']
        ]);
});

test('repeat with two houses', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('repeat with two houses in the moutains', () => {
    expect(testFormat(renderSheet([
        ['mountain'],
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },
        ['mountain'],
    ]))).toEqual(
        'mountain A B A C mountain'
    );
});

test('repeat with three houses', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2, signs: ['}'] },
        { chords: ['D'], house: 3 }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'], ['A'], ['D']
        ]);
});

test('repeat with two houses with different length', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1 },
        { chords: ['C'], signs: ['}'] },
        { chords: ['D', 'E'], house: 2 },
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['C'], ['A'], ['D', 'E']
        ]);
});

test('repeat with two houses plus nested repeat', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], house: 1, signs: ['}'] },
        { chords: ['D'], house: 2 }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'],
            ['A'], ['B'], ['B'], ['D'],
        ]);
});

test('repeat two houseblocks', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },

        { chords: ['D'], signs: ['{'] },
        { chords: ['E'], house: 1, signs: ['}'] },
        { chords: ['F'], house: 2 },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['D'], ['E'], ['D'], ['F'],
        ]);
});


test('repeat houseblock', () => {
    expect(testFormat(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2 },

        { chords: ['B'], signs: ['}'] },
    ]))).toEqual(
        'A 1 2 1 3 B ' +
        '1 2 1 3 B' // ireal + musescore do same
    );
});



test('nested houseblocks', () => {
    expect(testFormat(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2 },

        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },

    ]))).toEqual(
        // muse: 'A 1 2 1 3 C'
        // ireal: 
        'A 1 2 1 3 B ' +
        '1 C'
    );
});

test('nested houseblocks pt2', () => {
    expect(testFormat(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2 },

        { chords: ['B'], house: 1, signs: ['{', '}'] },
        { chords: ['C'], house: 2 },

    ]))).toEqual(
        // muse: 'A 1 2 1 3 C'
        // ireal: 
        'A 1 2 1 3 B C'
    );
});

test('sequential houseblocks, same length', () => {
    expect(renderSheet([
        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2 },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },
    ]).map(m => m.chords))
        .toEqual([
            ['1'], ['2'], ['1'], ['3'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('sequential houseblocks, different length, longer first', () => {
    expect(renderSheet([
        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2, signs: ['}'] },
        { chords: ['4'], house: 3 },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },
    ]).map(m => m.chords))
        .toEqual([
            ['1'], ['2'], ['1'], ['3'], ['1'], ['4'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('abac with repeat at end', () => { // Little Dancer
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2, signs: ['}'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

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
        .map(m => getMeasure(m).chords))
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
|: E-7b5    | A7b9      | D-     | %          |
|  G-7      | C7        | F^7    | E-7b5 A7b9 |
|1 D-       | G-7       | Bb7    | A7b9       |
|  D-       | G7#11     | E-7b5  | A7b9      :|
|: E-7b5    | A7b9      | D-     | %          |
|  G-7      | C7        | F^7    | E-7b5 A7b9 |
|2 D-       | G-7       | Bb7    | A7b9       |
|  D- B7    | Bb7#11 A7 | D-     | %          |
`));
});

test('hasSign', () => {
    expect(hasSign('{', 'X')).toBe(false);
    expect(hasSign('{', { signs: ['{'] })).toBe(true);
    expect(hasSign('{', { signs: ['}'] })).toBe(false);
    expect(hasSign('}', { signs: ['}'] })).toBe(true);
});

test('getBracePair', () => {
    expect(getBracePair([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { house: 2, chords: ['C'] },
    ], 1)).toEqual(0);

    expect(getBracePair([
        { signs: ['}'] },
    ], 0)).toBe(0);

    expect(getBracePair([
        { signs: ['{', '}'] },
    ], 0)).toBe(0);

    expect(getBracePair([
        { signs: ['{'] },
        '',
        { signs: ['}'] },
    ], 0)).toBe(2);

    expect(getBracePair([
        { signs: ['{'] },
        '',
        { signs: ['}'] },
    ], 2)).toBe(0);

    expect(getBracePair([
        {},
        { signs: ['{'] },
        '',
        { signs: ['}'] },
    ], 1)).toBe(3);
    expect(getBracePair([
        {},
        { signs: ['{'] },
        '',
        { signs: ['}'] },
        {}
    ], 1)).toBe(3);

    expect(getBracePair([
        '',
        { signs: ['{'] },
        { signs: ['{'] },
        '',
        { signs: ['}'] },
        { signs: ['}'] },
        ''
    ], 1)).toBe(5);

    expect(getBracePair([
        '',
        { signs: ['{'] },
        { signs: ['{'] },
        '',
        { signs: ['}'] },
        { signs: ['}'] },
        ''
    ], 5)).toBe(1);

    expect(getBracePair([
        '',
        { signs: ['{'] },
        { signs: ['{'] },
        '',
        { signs: ['}'] },
        { signs: ['}'] },
        ''
    ], 4)).toBe(2);

    expect(getBracePair([
        {},
        { signs: ['{'] },
        { house: 1, signs: ['}'] },
        { house: 2, signs: ['}'] },
        { signs: ['}'] },
    ], 4)).toBe(1);
});

test('shouldRepeat', () => {
    expect(shouldRepeat({
        sheet: ['A'],
        index: 0,
        repeated: {}
    })).toBe(false);

    expect(shouldRepeat({
        sheet: [{ signs: ['}'] }],
        index: 0,
        repeated: {}
    })).toBe(true);
    expect(!(Object.keys({ 0: 1 }).includes(0 + ''))).toBe(false);
    expect(shouldRepeat({
        sheet: [{ signs: ['}'] }],
        index: 0,
        repeated: { 0: 1 }
    })).toBe(false);
});

test('renderSheet: repeat signs', () => {
    expect(renderSheet(['A', 'B'])).toEqual(['A', 'B']);
    expect(renderSheet(['A'])).toEqual(['A']);

    expect(renderSheet([
        { signs: ['{', '}'], chords: ['A'] },
    ]).map(m => m.chords)).toEqual([['A'], ['A']]);


    expect(renderSheet([
        { signs: ['{', '}'], chords: ['A'] },
        { signs: ['{', '}'], chords: ['B'] },
    ]).map(m => m.chords)).toEqual([['A'], ['A'], ['B'], ['B']]);

    expect(renderSheet([
        { signs: ['{',], chords: ['A'] },
        { chords: ['B'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => m.chords)).toEqual([
        ['A'], ['B'], ['A'],
        ['A'], ['B'], ['A']
    ]);

    expect(renderSheet([
        { signs: ['{',], chords: ['A'] },
        { signs: ['{', '}'], chords: ['B'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => m.chords)).toEqual([
        ['A'], ['B'], ['B'], ['A'],
        ['A'], ['B'], ['B'], ['A']
    ]);

    expect(renderSheet([
        { signs: ['{',], chords: ['A'] },
        { chords: ['A'] },
        { signs: ['{',], chords: ['B'] },
        { signs: ['}'], chords: ['C'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => m.chords)).toEqual([
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
    ]);

    expect(renderSheet([
        { signs: ['{',], chords: ['A'] },
        { chords: ['A'] },
        { signs: ['{',], chords: ['B'] },
        { signs: ['}'], chords: ['C'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => m.chords)).toEqual([
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
    ]);
});

test('renderSheet: repeat n times', () => {
    expect(renderSheet([
        { signs: ['{', '}'], times: 0, chords: ['A'] },
    ]).map(m => m.chords)).toEqual([['A']]);

    expect(testFormat(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 0, chords: ['B'] },
    ]))).toEqual('A B');

    expect(testFormat(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 1, chords: ['B'] },
    ]))).toEqual('A B A B');

    expect(testFormat(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 2, chords: ['B'] },
    ]))).toEqual('A B A B A B');

    expect(renderSheet([
        { signs: ['{', '}'], times: 2, chords: ['A'] },
    ]).map(m => m.chords)).toEqual([['A'], ['A'], ['A']]);

    expect(renderSheet([
        { signs: ['{', '}'], times: 3, chords: ['A'] },
    ]).map(m => m.chords)).toEqual([['A'], ['A'], ['A'], ['A']]);

    expect(testFormat(renderSheet([
        'X',
        { signs: ['{', '}'], times: 2, chords: ['A'] },
        'X'
    ]))).toEqual('X A A A X');

    expect(testFormat(renderSheet([
        'X',
        { signs: ['{'], chords: 'O' },
        'Y',
        { signs: ['{', '}'], times: 2, chords: ['A'] },
        'Y',
        { signs: ['}'], times: 2, chords: 'O' },
        'X'
    ]))).toEqual('X O Y A A A Y O O Y A A A Y O O Y A A A Y O X');

})

test('renderSheet: hasHouse', () => {
    expect(hasHouse({ house: 1 })).toBe(true);
    expect(hasHouse({})).toBe(false);
    expect(hasHouse({ house: 1 }, 1)).toBe(true);
    expect(hasHouse({ house: 2 }, 1)).toBe(false);
    expect(hasHouse({ house: [1, 2, 3] }, 2)).toBe(true);
    expect(hasHouse({ house: [2, 3] }, 1)).toBe(false);
    expect(hasHouse({}, 1)).toBe(false);
});

test('getRelatedHouse', () => {
    expect(getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1 },
            { signs: ['}'] }
        ],
        index: 2
    })).toBe(1);

    expect(getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1, signs: '}' },
            { signs: ['}'] }
        ],
        index: 2
    })).toBe(-1);

    expect(getRelatedHouse({
        sheet: [
            {},
            { house: 1, signs: ['}'] }
        ],
        index: 1
    })).toBe(1);
    expect(getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1, signs: ['}'] },
            { house: 2, signs: ['}'] },
            { house: 3, },

        ],
        index: 2
    })).toBe(2);

    expect(getRelatedHouse({
        sheet: [{ signs: ['}'] }],
        index: 0
    })).toBe(-1)

});

test('renderSheet: houses', () => {
    const withMultiHouse = [
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 2, house: [1, 2], chords: ['B'] },
        { house: 3, chords: ['C'] },
    ];

    expect(getRepeatTimes({ sheet: withMultiHouse, index: 1 })).toBe(2);

    expect(getRepeatTimes({ sheet: [{ signs: '}' }], index: 0 })).toBe(1);

    expect(getRepeatTimes({ sheet: withMultiHouse, index: 1 })).toBe(2);

    expect(testFormat(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { house: 2, chords: ['C'] },
    ]))).toEqual('A B A C');

    expect(testFormat(renderSheet(withMultiHouse))).toEqual('A B A B A C');

    expect(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { signs: ['}'], house: 2, chords: ['C'] },
        { house: 3, chords: ['D'] },
    ]).map(m => m ? m.chords : 0).join(' ')).toEqual('A B A C A D');

    expect(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { signs: ['}'], house: 2, chords: ['C'] },
        { signs: ['}'], house: 3, chords: ['D'] },
        { house: 4, chords: ['E'] },
    ]).map(m => m ? m.chords : 0).join(' ')).toEqual('A B A C A D A E');

});

test('repeated houseblock', () => {
    expect(testFormat(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { house: 1, signs: ['}'], chords: ['B'] },
        { house: 2, chords: ['C'] },
        { signs: ['}'], chords: ['D'] },
    ]))).toEqual('A B A C D A B A C D');
})

test('visits', () => {
    const ababac = [
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: [1, 2], chords: ['B'] },
        { house: 3, chords: ['C'] },
    ];
    expect(canVisitHouse({
        sheet: ababac, index: 1, visits: {}
    })).toEqual(true);

    expect(canVisitHouse({
        sheet: ababac, index: 1, visits: { 1: 1 }
    })).toEqual(true);

    expect(canVisitHouse({
        sheet: ababac, index: 1, visits: { 1: 2 }
    })).toEqual(false);

    expect(getNextHouseIndex({
        sheet: ababac, index: 1, visits: {}
    })).toEqual(1);

    expect(getNextHouseIndex({
        sheet: ababac, index: 1, visits: { 1: 1 }
    })).toEqual(1);

    expect(getNextHouseIndex({
        sheet: ababac, index: 1, visits: { 1: 2 }
    })).toEqual(2);

    expect(testFormat(renderSheet([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { house: 2, chords: ['C'] },
    ]))).toEqual('A B A C');
})
