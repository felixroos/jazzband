import { Sheet } from "../sheet/Sheet";
import { testFormat } from '../sheet/Snippet';
import { Measure } from '../sheet/Measure';

// rules as described in paper "formal semantics for music notation control flow"
test('rule 1: repeat end without start', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'] },
        { chords: ['B'], signs: ['}'] },
    ]))).toEqual('A B A B');
});

test('rule 2: repeat end with start', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['}'] },
    ]))).toEqual('A B A B');
});

test('rule 3: houses', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['}'], house: 1 },
        { chords: ['C'], house: 2 },
    ]))).toEqual('A B A C');
});

test('rule 4: DC', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['DC'] },
        { chords: ['B'] },
    ]))).toEqual('A A B');
});

test('rule 5: DS', () => {

    expect(testFormat(Sheet.render([
        { chords: ['A'], },
        { chords: ['B'], signs: ['Segno', 'DS'] },
        { chords: ['C'], },
    ]))).toEqual('A B B C');
});

test('rule 6: DC al Coda', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['ToCoda'] },
        { chords: ['B'], signs: ['DC.Coda'] },
        { chords: ['C'], signs: ['Coda'] },
    ]))).toEqual('A B A C');
});


test('rule 7: DS al Coda', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'] },
        { chords: ['B'], signs: ['Segno', 'ToCoda'] },
        { chords: ['C'], signs: ['DS.Coda'] },
        { chords: ['D'], signs: ['Coda'] },
    ]))).toEqual('A B C B D');
});

test('rule 8: DC:F', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['Fine'] },
        { chords: ['B'], signs: ['DC.Fine'] },
    ]))).toEqual('A B A');
});


test('rule 9: DS:F', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], },
        { chords: ['B'], signs: ['Segno', 'Fine'] },
        { chords: ['C'], signs: ['DS.Fine'] },
    ]))).toEqual('A B C B'); // wrong in paper???
});

/* test('extra: al nth ending', () => {
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['}'], house: 1 },
        { chords: ['C'], house: 2 },
        { chords: ['D'], signs: ['DC.House2'] }
    ]))).toEqual('A B A C D A C');
}); */

/* rules to avoid ambiguity:
- no control flow symbols are allowed within the blank staff in rules 1-3
- there can only be at most one type of DC/DS symbols in the entire staff
- left and right repeats can be used within the blank staff in rules 4-9
*/


test('repeat one bar', () => {
    expect(Sheet.render([{ chords: ['A'], signs: ['{', '}'] }])
        .map(m => Measure.from(m).chords))
        .toEqual([['A'], ['A']]);
});

test('repeat more than one bar', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['}'] }
    ]).map(m => Measure.from(m).chords))
        .toEqual([['A'], ['B'], ['A'], ['B']]);
});

test('repeat one bar in the middle', () => {
    expect(testFormat(Sheet.render(
        ['A', { chords: ['B'], signs: ['{', '}'] }, 'C']
    ))).toEqual('A B B C');
});

test('sequential repeats', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{', '}'] },
        { chords: ['B'], signs: ['{', '}'] }
    ]).map(m => Measure.from(m).chords))
        .toEqual([['A'], ['A'], ['B'], ['B']]);
});

test('Measure.getJumpSign', () => {
    expect(Measure.getJumpSign({ signs: ['}'] }).pair).toBe('{');
    expect(Measure.getJumpSign({ signs: ['DC'] }).pair).toBe(undefined);
    expect(Measure.getJumpSign({ signs: ['DS'] }).pair).toBe('Segno');
});

test('one nested repeat', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], signs: ['}'] }
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'],
            ['A'], ['B'], ['B'], ['C']
        ]);
    // with nested: false
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], signs: ['}'] }
    ], { nested: false }).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'],
            ['B'], ['B'], ['C']
        ]);
});


test('two nested repeats', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], signs: ['{', '}'] },
        { chords: ['D'], signs: ['}'] }
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'], ['C'], ['D'],
            ['A'], ['B'], ['B'], ['C'], ['C'], ['D']
        ]);
});

test('double nested repeats', () => {
    expect(Sheet.render([

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{'] },
        { chords: ['C'], signs: ['{', '}'] },
        { chords: ['D'], signs: ['}'] },
        { chords: ['E'], signs: ['}'] },

    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['C'], ['C'], ['D'], ['B'], ['C'], ['C'], ['D'], ['E'],
            ['A'], ['B'], ['C'], ['C'], ['D'], ['B'], ['C'], ['C'], ['D'], ['E']
        ]);
});

test('repeat with two houses', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 }
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('repeat with two houses in the moutains', () => {
    expect(testFormat(Sheet.render([
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
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2, signs: ['}'] },
        { chords: ['D'], house: 3 }
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'], ['A'], ['D']
        ]);
});

test('repeat with two houses with different length', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1 },
        { chords: ['C'], signs: ['}'] },
        { chords: ['D', 'E'], house: 2 },
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['C'], ['A'], ['D', 'E']
        ]);
});

test('repeat with two houses plus nested repeat', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], house: 1, signs: ['}'] },
        { chords: ['D'], house: 2 }
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'],
            ['A'], ['B'], ['B'], ['D'],
        ]);
});

test('repeat two houseblocks', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },

        { chords: ['D'], signs: ['{'] },
        { chords: ['E'], house: 1, signs: ['}'] },
        { chords: ['F'], house: 2 },

    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['D'], ['E'], ['D'], ['F'],
        ]);
});

test('repeat houseblock', () => {
    expect(testFormat(Sheet.render([
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
    expect(testFormat(Sheet.render([
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
    expect(testFormat(Sheet.render([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2 },

        { chords: ['B'], house: 1, signs: ['{', '}'] },
        { chords: ['C'], house: 2 },

    ]))).toEqual(
        // muse: 'A 1 2 1 3 C' // https://musescore.org/en/node/79371
        // ireal: 
        'A 1 2 1 3 B C'
    );
});

test('sequential houseblocks, same length', () => {
    expect(Sheet.render([
        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2 },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['1'], ['2'], ['1'], ['3'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('sequential houseblocks, different length, longer first', () => {
    expect(Sheet.render([
        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2, signs: ['}'] },
        { chords: ['4'], house: 3 },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },
    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['1'], ['2'], ['1'], ['3'], ['1'], ['4'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('sequential houseblocks, different length, shorter first', () => {
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2 },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], house: 1, signs: ['}'] },
        { chords: ['3'], house: 2, signs: ['}'] },
        { chords: ['4'], house: 3 },

    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['1'], ['2'], ['1'], ['3'], ['1'], ['4']
        ]);
});

test('abac with repeat at end', () => { // Little Dancer
    expect(Sheet.render([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], house: 1, signs: ['}'] },
        { chords: ['C'], house: 2, signs: ['}'] },

    ]).map(m => Measure.from(m).chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('Measure.hasSign', () => {
    expect(Measure.hasSign('{', 'X')).toBe(false);
    expect(Measure.hasSign('{', { signs: ['{'] })).toBe(true);
    expect(Measure.hasSign('{', { signs: ['}'] })).toBe(false);
    expect(Measure.hasSign('}', { signs: ['}'] })).toBe(true);
    expect(Measure.hasSign('DC', { signs: ['DC'] })).toBe(true);
});

test('Sheet.getBracePair', () => {
    expect(Sheet.getBracePair({
        sheet: [
            { signs: ['{'], chords: ['A'] },
            { signs: ['}'], house: 1, chords: ['B'] },
            { house: 2, chords: ['C'] },
        ], index: 1
    })).toEqual(0);

    expect(Sheet.getBracePair({
        sheet: [
            { signs: ['}'] },
        ], index: 0
    })).toBe(0);

    expect(Sheet.getBracePair({
        sheet: [
            { signs: ['{', '}'] },
        ], index: 0
    })).toBe(0);

    expect(Sheet.getBracePair({
        sheet: [
            { signs: ['{'] },
            '',
            { signs: ['}'] },
        ], index: 0
    })).toBe(2);

    expect(Sheet.getBracePair({
        sheet: [
            { signs: ['{'] },
            '',
            { signs: ['}'] },
        ], index: 2
    })).toBe(0);

    expect(Sheet.getBracePair({
        sheet: [
            {},
            { signs: ['{'] },
            '',
            { signs: ['}'] },
        ], index: 1
    })).toBe(3);
    expect(Sheet.getBracePair({
        sheet: [
            {},
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            {}
        ], index: 1
    })).toBe(3);

    expect(Sheet.getBracePair({
        sheet: [
            '',
            { signs: ['{'] },
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            { signs: ['}'] },
            ''
        ], index: 1
    })).toBe(5);

    expect(Sheet.getBracePair({
        sheet: [
            '',
            { signs: ['{'] },
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            { signs: ['}'] },
            ''
        ], index: 5
    })).toBe(1);

    expect(Sheet.getBracePair({
        sheet: [
            '',
            { signs: ['{'] },
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            { signs: ['}'] },
            ''
        ], index: 4
    })).toBe(2);

    expect(Sheet.getBracePair({
        sheet: [
            {},
            { signs: ['{'] },
            { house: 1, signs: ['}'] },
            { house: 2, signs: ['}'] },
            { signs: ['}'] },
        ], index: 4
    })).toBe(1);

    expect(Sheet.getBracePair({
        sheet: [
            { signs: ['{'] },
            { signs: ['{'] },
            { signs: ['}'] },
            { signs: ['}'] },
        ], index: 3
    })).toBe(0);
});

test('Sheet.getJumpDestination', () => {
    expect(Sheet.getJumpDestination({
        sheet: [
            { signs: ['{'] },
            { signs: ['}'] },
        ], index: 1
    })).toBe(0);

    expect(Sheet.getJumpDestination({
        sheet: [
            { signs: ['{'] },
            { signs: ['{'] },
            { signs: ['}'] },
            { signs: ['}'] },
        ], index: 3, nested: false
    })).toBe(1);
})

test('Sheet.shouldJump', () => {
    expect(Sheet.shouldJump({
        sheet: ['A'],
        index: 0,
        jumps: {}
    })).toBe(false);

    expect(Sheet.shouldJump({
        sheet: [{ signs: ['}'] }],
        index: 0,
        jumps: {}
    })).toBe(true);
    expect(!(Object.keys({ 0: 1 }).includes(0 + ''))).toBe(false);
    expect(Sheet.shouldJump({
        sheet: [{ signs: ['}'] }],
        index: 0,
        jumps: { 0: 1 }
    })).toBe(false);

    expect(Measure.hasJumpSign({
        signs: ['DC']
    })).toBe(true);

    expect(Sheet.shouldJump({
        sheet: [{ signs: ['DC'] }],
        index: 0,
        jumps: {}
    })).toBe(true);

    expect(Sheet.shouldJump({
        sheet: [{ signs: ['DC'] }],
        index: 0,
        jumps: { 0: 1 }
    })).toBe(false);
});


test('Sheet.render: repeat signs', () => {
    expect(Sheet.render(['A', 'B'])).toEqual([
        { chords: ['A'], index: 0 },
        { chords: ['B'], index: 1 }]);

    expect(Sheet.render(['A'])).toEqual([{ chords: ['A'], index: 0 }]);

    expect(Sheet.render([
        { signs: ['{', '}'], chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([['A'], ['A']]);


    expect(Sheet.render([
        { signs: ['{', '}'], chords: ['A'] },
        { signs: ['{', '}'], chords: ['B'] },
    ]).map(m => Measure.from(m).chords)).toEqual([['A'], ['A'], ['B'], ['B']]);

    expect(Sheet.render([
        { signs: ['{',], chords: ['A'] },
        { chords: ['B'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([
        ['A'], ['B'], ['A'],
        ['A'], ['B'], ['A']
    ]);

    expect(Sheet.render([
        { signs: ['{',], chords: ['A'] },
        { signs: ['{', '}'], chords: ['B'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([
        ['A'], ['B'], ['B'], ['A'],
        ['A'], ['B'], ['B'], ['A']
    ]);

    expect(Sheet.render([
        { signs: ['{',], chords: ['A'] },
        { chords: ['A'] },
        { signs: ['{',], chords: ['B'] },
        { signs: ['}'], chords: ['C'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
    ]);

    expect(Sheet.render([
        { signs: ['{',], chords: ['A'] },
        { chords: ['A'] },
        { signs: ['{',], chords: ['B'] },
        { signs: ['}'], chords: ['C'] },
        { signs: ['}'], chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
        ['A'], ['A'], ['B'], ['C'], ['B'], ['C'], ['A'],
    ]);
});

test('Sheet.render: repeat n times', () => {
    expect(Sheet.render([
        { signs: ['{', '}'], times: 0, chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([['A']]);

    expect(testFormat(Sheet.render([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 0, chords: ['B'] },
    ]))).toEqual('A B');

    expect(testFormat(Sheet.render([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 1, chords: ['B'] },
    ]))).toEqual('A B A B');

    expect(testFormat(Sheet.render([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], times: 2, chords: ['B'] },
    ]))).toEqual('A B A B A B');

    expect(Sheet.render([
        { signs: ['{', '}'], times: 2, chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([['A'], ['A'], ['A']]);

    expect(Sheet.render([
        { signs: ['{', '}'], times: 3, chords: ['A'] },
    ]).map(m => Measure.from(m).chords)).toEqual([['A'], ['A'], ['A'], ['A']]);

    expect(testFormat(Sheet.render([
        'X',
        { signs: ['{', '}'], times: 2, chords: ['A'] },
        'X'
    ]))).toEqual('X A A A X');

    expect(testFormat(Sheet.render([
        'X',
        { signs: ['{'], chords: 'O' },
        'Y',
        { signs: ['{', '}'], times: 2, chords: ['A'] },
        'Y',
        { signs: ['}'], times: 2, chords: 'O' },
        'X'
    ]))).toEqual('X O Y A A A Y O O Y A A A Y O O Y A A A Y O X');

})

test('Sheet.render: Measure.hasHouse', () => {
    expect(Measure.hasHouse({ house: 1 })).toBe(true);
    expect(Measure.hasHouse({})).toBe(false);
    expect(Measure.hasHouse({ house: 1 }, 1)).toBe(true);
    expect(Measure.hasHouse({ house: 2 }, 1)).toBe(false);
    expect(Measure.hasHouse({ house: [1, 2, 3] }, 2)).toBe(true);
    expect(Measure.hasHouse({ house: [2, 3] }, 1)).toBe(false);
    expect(Measure.hasHouse({}, 1)).toBe(false);
});

test('Sheet.getRelatedHouse', () => {
    expect(Sheet.getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1 },
            { signs: ['}'] }
        ],
        index: 2
    })).toBe(1);
    expect(Sheet.getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1, signs: '}' },
            { signs: ['}'] }
        ],
        index: 2
    })).toBe(-1);
    expect(Sheet.getRelatedHouse({
        sheet: [
            {},
            { house: 1, signs: ['}'] }
        ],
        index: 1
    })).toBe(1);
    expect(Sheet.getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1, signs: ['}'] },
            { house: 2, signs: ['}'] },
            { house: 3, },
        ],
        index: 2
    })).toBe(2);

    expect(Sheet.getRelatedHouse({
        sheet: [{ signs: ['}'] }],
        index: 0
    })).toBe(-1)
});

const withMultiHouse = [
    { signs: ['{'], chords: ['A'] },
    { signs: ['}'], times: 2, house: [1, 2], chords: ['B'] },
    { house: 3, chords: ['C'] },
];

test('Sheet.getAllowedJumps', () => {
    expect(Sheet.getAllowedJumps({ sheet: withMultiHouse, index: 1 })).toBe(2);
    expect(Sheet.getAllowedJumps({ sheet: [{ signs: '}' }], index: 0 })).toBe(1);
    expect(Sheet.getAllowedJumps({ sheet: withMultiHouse, index: 1 })).toBe(2);
});
test('Sheet.render: multi houses', () => {
    expect(testFormat(Sheet.render(withMultiHouse))).toEqual('A B A B A C');
});

test('Sheet.render: more than 2 houses', () => {
    expect(testFormat(Sheet.render([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { signs: ['}'], house: 2, chords: ['C'] },
        { house: 3, chords: ['D'] },
    ]))).toEqual('A B A C A D');

    expect(testFormat(Sheet.render([
        { signs: ['{'], chords: ['A'] },
        { signs: ['}'], house: 1, chords: ['B'] },
        { signs: ['}'], house: 2, chords: ['C'] },
        { signs: ['}'], house: 3, chords: ['D'] },
        { house: 4, chords: ['E'] },
    ]))).toEqual('A B A C A D A E');
});

test('repeated houseblock', () => {
    expect(testFormat(Sheet.render([
        { signs: ['{'], chords: ['A'] },
        { house: 1, signs: ['}'], chords: ['B'] },
        { house: 2, chords: ['C'] },
        { signs: ['}'], chords: ['D'] },
    ]))).toEqual('A B A C D A B A C D');
})

const ababac = [
    { signs: ['{'], chords: ['A'] },
    { signs: ['}'], house: [1, 2], chords: ['B'] },
    { house: 3, chords: ['C'] },
];

test('Sheet.canVisitHouse', () => {
    expect(Sheet.canVisitHouse({
        sheet: ababac, index: 1, visits: {}
    })).toEqual(true);

    expect(Sheet.canVisitHouse({
        sheet: ababac, index: 1, visits: { 1: 1 }
    })).toEqual(true);

    expect(Sheet.canVisitHouse({
        sheet: ababac, index: 1, visits: { 1: 2 }
    })).toEqual(false);
});

test('Sheet.getNextHouseIndex', () => {
    expect(Sheet.getNextHouseIndex({
        sheet: ababac, index: 1, visits: {}
    })).toEqual(1);

    expect(Sheet.getNextHouseIndex({
        sheet: ababac, index: 1, visits: { 1: 1 }
    })).toEqual(1);

    expect(Sheet.getNextHouseIndex({
        sheet: ababac, index: 1, visits: { 1: 2 }
    })).toEqual(2);
})
