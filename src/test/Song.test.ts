import { renderSheet } from "../Song";


test('string Measures', () => {
    expect(renderSheet(['A'])).toEqual(['A']);
    expect(renderSheet(['A', 'B', 'C'])).toEqual(['A', 'B', 'C']);
});

test('array Measures', () => {

    expect(renderSheet([['A']])).toEqual([['A']]);
    expect(renderSheet([['A'], ['B'], ['A', 'C']])).toEqual([['A'], ['B'], ['A', 'C']]);
})

// repeats

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

test('repeat one bar in the middle', () => {
    expect(renderSheet(['A', { chords: ['B'], signs: ['{', '}'] }, 'C']).map(m => m && m.chords ? m.chords : m))
        .toEqual(['A', ['B'], ['B'], 'C']);
});


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
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C']
        ]);
});


test('repeat with two houses in the moutains', () => {
    expect(renderSheet([
        ['mountain'],
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] },
        ['mountain'],
    ]).map(m => m.chords ? m.chords : m))
        .toEqual([
            ['mountain'], ['A'], ['B'], ['A'], ['C'], ['mountain']
        ]);
});

test('repeat with three houses', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2', '}'] },
        { chords: ['D'], signs: ['N3'] }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'], ['A'], ['D']
        ]);
});

test('repeat with two houses with different length', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1'] },
        { chords: ['C'], signs: ['}'] },
        { chords: ['D', 'E'], signs: ['N2'] },
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['C'], ['A'], ['D', 'E']
        ]);
});

test('repeat with two houses plus nested repeat', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['{', '}'] },
        { chords: ['C'], signs: ['N1', '}'] },
        { chords: ['D'], signs: ['N2'] }
    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['B'], ['C'],
            ['A'], ['B'], ['B'], ['D'],
        ]);
});

test('repeat two houseblocks', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] },

        { chords: ['D'], signs: ['{'] },
        { chords: ['E'], signs: ['N1', '}'] },
        { chords: ['F'], signs: ['N2'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['D'], ['E'], ['D'], ['F'],
        ]);
});


test('repeat houseblock', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2'] },

        { chords: ['B'], signs: ['}'] },



    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['1'], ['2'], ['1'], ['3'], ['B'],
            ['A'], ['1'], ['2'], ['1'], ['3'], ['B'],
        ]);
});



test('nested houseblocks', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2'] },

        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['1'], ['2'], ['1'], ['3'], ['B'],
            ['A'], ['1'], ['2'], ['1'], ['3'], ['C'],
        ]);
});

test('nested houseblocks repeated', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2'] },

        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2', '{', '}'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['1'], ['2'], ['1'], ['3'], ['B'],
            ['A'], ['1'], ['2'], ['1'], ['3'], ['C'], ['C'],
        ]);
});


test('nested houseblocks, different length, longer outside', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2'] },

        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2', '}'] },
        { chords: ['D'], signs: ['N3'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['1'], ['2'], ['1'], ['3'], ['B'],
            ['A'], ['1'], ['2'], ['1'], ['3'], ['C'],
            ['A'], ['1'], ['2'], ['1'], ['3'], ['D'],
        ]);
});


test('sequential houseblocks, same length', () => {
    expect(renderSheet([
        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2'] },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] },
    ]).map(m => m.chords))
        .toEqual([
            ['1'], ['2'], ['1'], ['3'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});

test('sequential houseblocks, different length, longer first', () => {
    expect(renderSheet([
        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2', '}'] },
        { chords: ['4'], signs: ['N3'] },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] },
    ]).map(m => m.chords))
        .toEqual([
            ['1'], ['2'], ['1'], ['3'], ['1'], ['4'],
            ['A'], ['B'], ['A'], ['C']
        ]);
});


/* test('nested houseblocks, different length, shorter outside', () => {
    expect(renderSheet([
        { chords: ['1'], signs: ['{'] },

        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2', '}'] },
        { chords: ['D'], signs: ['N3'] },

        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2'] },

    ]).map(m => m.chords))
        .toEqual([
            ['1'], ['A'], ['B'], ['A'], ['C'], ['A'], ['D'], ['2'],
            ['1'], ['A'], ['B'], ['A'], ['C'], ['A'], ['D'], ['3'],
        ]);
});


test('sequential houseblocks, different length, shorter first', () => {
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2'] },

        { chords: ['1'], signs: ['{'] },
        { chords: ['2'], signs: ['N1', '}'] },
        { chords: ['3'], signs: ['N2', '}'] },
        { chords: ['4'], signs: ['N3'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C']
            ['1'], ['2'], ['1'], ['3'], ['1'], ['4'],
        ]);
});

test('abac with repeat at end', () => { // Little Dancer
    expect(renderSheet([
        { chords: ['A'], signs: ['{'] },
        { chords: ['B'], signs: ['N1', '}'] },
        { chords: ['C'], signs: ['N2', '}'] },

    ]).map(m => m.chords))
        .toEqual([
            ['A'], ['B'], ['A'], ['C'],
            ['A'], ['B'], ['A'], ['C']
        ]);
}); */