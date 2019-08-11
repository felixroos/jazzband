"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sheet_1 = require("../Sheet");
var Measure_1 = require("../Measure");
var Snippet_1 = require("../Snippet");
// rules as described in paper "formal semantics for music notation control flow"
/* test('playground', () => {
  expect(
    Sheet.render(['A', ['A', ['A', 'B']]])
  ).toEqual('A B C');
}); */
// rules as described in paper "formal semantics for music notation control flow"
test('rule 1: repeat end without start', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([{ body: ['A'] }, { body: ['B'], signs: ['}'] }]))).toEqual('A B A B');
});
test('rule 2: repeat end with start', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['}'] }
    ]))).toEqual('A B A B');
});
test('rule 3: houses', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['}'], house: 1 },
        { body: ['C'], house: 2 }
    ]))).toEqual('A B A C');
});
test('rule 4: DC', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([{ body: ['A'], signs: ['DC'] }, { body: ['B'] }]))).toEqual('A A B');
});
test('rule 5: DS', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'] },
        { body: ['B'], signs: ['Segno', 'DS'] },
        { body: ['C'] }
    ]))).toEqual('A B B C');
});
test('rule 6: DC al Coda', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['ToCoda'] },
        { body: ['B'], signs: ['DC.Coda'] },
        { body: ['C'], signs: ['Coda'] }
    ]))).toEqual('A B A C');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['ToCoda'] },
        { body: ['B'], signs: ['DC'] },
        { body: ['C'], signs: ['Coda'] }
    ]))).toEqual('A B A C');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'] },
        { body: ['B'] },
        { body: ['C'], signs: ['Coda'] }
    ], { forms: 2 }))).toEqual('A B A B C');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['ToCoda'] },
        { body: ['B'], signs: ['DC'] },
        { body: ['C'], signs: ['Coda'] }
    ], { forms: 2 }))).toEqual('A B A C A B A C');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'] },
        { body: ['B'], signs: ['ToCoda'] },
        { body: ['C'] },
        { body: ['D'], signs: ['Coda'] }
    ], { forms: 1 }))).toEqual('A B D');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'] },
        { body: ['B'], signs: ['ToCoda'] },
        { body: ['C'] },
        { body: ['D'], signs: ['Coda'] }
    ], { forms: 2 }))).toEqual('A B C A B D');
});
test('rule 7: DS al Coda', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'] },
        { body: ['B'], signs: ['Segno', 'ToCoda'] },
        { body: ['C'], signs: ['DS.Coda'] },
        { body: ['D'], signs: ['Coda'] }
    ]))).toEqual('A B C B D');
});
test('rule 8: DC:F', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['Fine'] },
        { body: ['B'], signs: ['DC.Fine'] }
    ]))).toEqual('A B A');
});
test('rule 9: DS:F', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'] },
        { body: ['B'], signs: ['Segno', 'Fine'] },
        { body: ['C'], signs: ['DS.Fine'] }
    ]))).toEqual('A B C B'); // wrong in paper???
});
/* test('extra: al nth ending', () => {
    expect(Snippet.testFormat(Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['}'], house: 1 },
        { body: ['C'], house: 2 },
        { body: ['D'], signs: ['DC.House2'] }
    ]))).toEqual('A B A C D A C');
}); */
/* rules to avoid ambiguity:
- no control flow symbols are allowed within the blank staff in rules 1-3
- there can only be at most one type of DC/DS symbols in the entire staff
- left and right repeats can be used within the blank staff in rules 4-9
*/
test('repeat one bar', function () {
    expect(Sheet_1.Sheet.render([{ body: ['A'], signs: ['{', '}'] }]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A']]);
});
test('two forms', function () {
    expect(Sheet_1.Sheet.render([{ body: ['A'] }], { forms: 2 }).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A']]);
});
test('two forms with repeat', function () {
    expect(Sheet_1.Sheet.render([{ body: ['A'], signs: ['{', '}'] }], { forms: 2 }).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A'], ['A'], ['A']]);
});
test('two forms with intro', function () {
    expect(Sheet_1.Sheet.render([{ body: ['I'], section: 'IN' }, { body: ['A'], section: 'A' }], { forms: 2 }).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['I'], ['A'], ['A']]);
});
test('three forms with coda', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['ToCoda'] },
        { body: ['B'], signs: ['Coda'] }
    ], { forms: 3 }).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A'], ['A'], ['B']]);
});
test('repeat more than one bar', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['}'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['A'], ['B']]);
});
test('repeat one bar in the middle', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render(['A', { body: ['B'], signs: ['{', '}'] }, 'C']))).toEqual('A B B C');
});
test('sequential repeats', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{', '}'] },
        { body: ['B'], signs: ['{', '}'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A'], ['B'], ['B']]);
});
test('Measure.getJumpSign', function () {
    expect(Measure_1.Measure.getJumpSign({ signs: ['}'] }).pair).toBe('{');
    expect(Measure_1.Measure.getJumpSign({ signs: ['DC'] }).pair).toBe(undefined);
    expect(Measure_1.Measure.getJumpSign({ signs: ['DS'] }).pair).toBe('Segno');
});
test('one nested repeat', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['{', '}'] },
        { body: ['C'], signs: ['}'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['B'], ['C'], ['A'], ['B'], ['B'], ['C']]);
    // with nested: false
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['{', '}'] },
        { body: ['C'], signs: ['}'] }
    ], { nested: false }).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['B'], ['C'], ['B'], ['B'], ['C']]);
});
test('two nested repeats', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['{', '}'] },
        { body: ['C'], signs: ['{', '}'] },
        { body: ['D'], signs: ['}'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([
        ['A'],
        ['B'],
        ['B'],
        ['C'],
        ['C'],
        ['D'],
        ['A'],
        ['B'],
        ['B'],
        ['C'],
        ['C'],
        ['D']
    ]);
});
test('double nested repeats', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['{'] },
        { body: ['C'], signs: ['{', '}'] },
        { body: ['D'], signs: ['}'] },
        { body: ['E'], signs: ['}'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([
        ['A'],
        ['B'],
        ['C'],
        ['C'],
        ['D'],
        ['B'],
        ['C'],
        ['C'],
        ['D'],
        ['E'],
        ['A'],
        ['B'],
        ['C'],
        ['C'],
        ['D'],
        ['B'],
        ['C'],
        ['C'],
        ['D'],
        ['E']
    ]);
});
test('repeat with two houses', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['A'], ['C']]);
});
test('repeat with two houses in the moutains', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        ['mountain'],
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 },
        ['mountain']
    ]))).toEqual('mountain A B A C mountain');
});
test('repeat with three houses', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2, signs: ['}'] },
        { body: ['D'], house: 3 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['A'], ['C'], ['A'], ['D']]);
});
test('repeat with two houses with different length', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1 },
        { body: ['C'], signs: ['}'] },
        { body: ['D', 'E'], house: 2 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['C'], ['A'], ['D', 'E']]);
});
test('repeat with two houses plus nested repeat', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], signs: ['{', '}'] },
        { body: ['C'], house: 1, signs: ['}'] },
        { body: ['D'], house: 2 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['B'], ['C'], ['A'], ['B'], ['B'], ['D']]);
});
test('repeat two houseblocks', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 },
        { body: ['D'], signs: ['{'] },
        { body: ['E'], house: 1, signs: ['}'] },
        { body: ['F'], house: 2 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['A'], ['C'], ['D'], ['E'], ['D'], ['F']]);
});
test('repeat houseblock', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['1'], signs: ['{'] },
        { body: ['2'], house: 1, signs: ['}'] },
        { body: ['3'], house: 2 },
        { body: ['B'], signs: ['}'] }
    ]))).toEqual('A 1 2 1 3 B ' + '1 2 1 3 B' // ireal + musescore do same
    );
});
test('nested houseblocks', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['1'], signs: ['{'] },
        { body: ['2'], house: 1, signs: ['}'] },
        { body: ['3'], house: 2 },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 }
    ]))).toEqual(
    // muse: 'A 1 2 1 3 C'
    // ireal:
    'A 1 2 1 3 B ' + '1 C');
});
test('nested houseblocks pt2', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['1'], signs: ['{'] },
        { body: ['2'], house: 1, signs: ['}'] },
        { body: ['3'], house: 2 },
        { body: ['B'], house: 1, signs: ['{', '}'] },
        { body: ['C'], house: 2 }
    ]))).toEqual(
    // muse: 'A 1 2 1 3 C' // https://musescore.org/en/node/79371
    // ireal:
    'A 1 2 1 3 B C');
});
test('sequential houseblocks, same length', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['1'], signs: ['{'] },
        { body: ['2'], house: 1, signs: ['}'] },
        { body: ['3'], house: 2 },
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['1'], ['2'], ['1'], ['3'], ['A'], ['B'], ['A'], ['C']]);
});
test('sequential houseblocks, different length, longer first', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['1'], signs: ['{'] },
        { body: ['2'], house: 1, signs: ['}'] },
        { body: ['3'], house: 2, signs: ['}'] },
        { body: ['4'], house: 3 },
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([
        ['1'],
        ['2'],
        ['1'],
        ['3'],
        ['1'],
        ['4'],
        ['A'],
        ['B'],
        ['A'],
        ['C']
    ]);
});
test('sequential houseblocks, different length, shorter first', function () {
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2 },
        { body: ['1'], signs: ['{'] },
        { body: ['2'], house: 1, signs: ['}'] },
        { body: ['3'], house: 2, signs: ['}'] },
        { body: ['4'], house: 3 }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([
        ['A'],
        ['B'],
        ['A'],
        ['C'],
        ['1'],
        ['2'],
        ['1'],
        ['3'],
        ['1'],
        ['4']
    ]);
});
test('abac with repeat at end', function () {
    // Little Dancer
    expect(Sheet_1.Sheet.render([
        { body: ['A'], signs: ['{'] },
        { body: ['B'], house: 1, signs: ['}'] },
        { body: ['C'], house: 2, signs: ['}'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['A'], ['C'], ['A'], ['B'], ['A'], ['C']]);
});
test('Measure.hasSign', function () {
    expect(Measure_1.Measure.hasSign('{', 'X')).toBe(false);
    expect(Measure_1.Measure.hasSign('{', { signs: ['{'] })).toBe(true);
    expect(Measure_1.Measure.hasSign('{', { signs: ['}'] })).toBe(false);
    expect(Measure_1.Measure.hasSign('}', { signs: ['}'] })).toBe(true);
    expect(Measure_1.Measure.hasSign('DC', { signs: ['DC'] })).toBe(true);
});
test('Sheet.getBracePair', function () {
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [
            { signs: ['{'], body: ['A'] },
            { signs: ['}'], house: 1, body: ['B'] },
            { house: 2, body: ['C'] }
        ],
        index: 1
    })).toEqual(0);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [{ signs: ['}'] }],
        index: 0
    })).toBe(0);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [{ signs: ['{', '}'] }],
        index: 0
    })).toBe(0);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [{ signs: ['{'] }, '', { signs: ['}'] }],
        index: 0
    })).toBe(2);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [{ signs: ['{'] }, '', { signs: ['}'] }],
        index: 2
    })).toBe(0);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [{}, { signs: ['{'] }, '', { signs: ['}'] }],
        index: 1
    })).toBe(3);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [{}, { signs: ['{'] }, '', { signs: ['}'] }, {}],
        index: 1
    })).toBe(3);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [
            '',
            { signs: ['{'] },
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            { signs: ['}'] },
            ''
        ],
        index: 1
    })).toBe(5);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [
            '',
            { signs: ['{'] },
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            { signs: ['}'] },
            ''
        ],
        index: 5
    })).toBe(1);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [
            '',
            { signs: ['{'] },
            { signs: ['{'] },
            '',
            { signs: ['}'] },
            { signs: ['}'] },
            ''
        ],
        index: 4
    })).toBe(2);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [
            {},
            { signs: ['{'] },
            { house: 1, signs: ['}'] },
            { house: 2, signs: ['}'] },
            { signs: ['}'] }
        ],
        index: 4
    })).toBe(1);
    expect(Sheet_1.Sheet.getBracePair({
        sheet: [
            { signs: ['{'] },
            { signs: ['{'] },
            { signs: ['}'] },
            { signs: ['}'] }
        ],
        index: 3
    })).toBe(0);
});
test('Sheet.getJumpDestination', function () {
    expect(Sheet_1.Sheet.getJumpDestination({
        sheet: [{ signs: ['{'] }, { signs: ['}'] }],
        index: 1
    })).toBe(0);
    expect(Sheet_1.Sheet.getJumpDestination({
        sheet: [
            { signs: ['{'] },
            { signs: ['{'] },
            { signs: ['}'] },
            { signs: ['}'] }
        ],
        index: 3,
        nested: false
    })).toBe(1);
});
test('Sheet.shouldJump', function () {
    expect(Sheet_1.Sheet.shouldJump({
        sheet: ['A'],
        index: 0,
        jumps: {}
    })).toBe(false);
    expect(Sheet_1.Sheet.shouldJump({
        sheet: [{ signs: ['}'] }],
        index: 0,
        jumps: {}
    })).toBe(true);
    expect(!Object.keys({ 0: 1 }).includes(0 + '')).toBe(false);
    expect(Sheet_1.Sheet.shouldJump({
        sheet: [{ signs: ['}'] }],
        index: 0,
        jumps: { 0: 1 }
    })).toBe(false);
    expect(Measure_1.Measure.hasJumpSign({
        signs: ['DC']
    })).toBe(true);
    expect(Sheet_1.Sheet.shouldJump({
        sheet: [{ signs: ['DC'] }],
        index: 0,
        jumps: {}
    })).toBe(true);
    expect(Sheet_1.Sheet.shouldJump({
        sheet: [{ signs: ['DC'] }],
        index: 0,
        jumps: { 0: 1 }
    })).toBe(false);
});
test('Sheet.render: repeat signs', function () {
    expect(Sheet_1.Sheet.render(['A', 'B']).map(function (_a) {
        var body = _a.body, index = _a.index;
        return ({ body: body, index: index });
    })).toEqual([{ body: ['A'], index: 0 }, { body: ['B'], index: 1 }]);
    expect(Sheet_1.Sheet.render(['A']).map(function (_a) {
        var body = _a.body, index = _a.index;
        return ({ body: body, index: index });
    })).toEqual([{ body: ['A'], index: 0 }]);
    expect(Sheet_1.Sheet.render([{ signs: ['{', '}'], body: ['A'] }]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A']]);
    expect(Sheet_1.Sheet.render([
        { signs: ['{', '}'], body: ['A'] },
        { signs: ['{', '}'], body: ['B'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A'], ['B'], ['B']]);
    expect(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { body: ['B'] },
        { signs: ['}'], body: ['A'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['A'], ['A'], ['B'], ['A']]);
    expect(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { signs: ['{', '}'], body: ['B'] },
        { signs: ['}'], body: ['A'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['B'], ['B'], ['A'], ['A'], ['B'], ['B'], ['A']]);
    expect(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { body: ['A'] },
        { signs: ['{'], body: ['B'] },
        { signs: ['}'], body: ['C'] },
        { signs: ['}'], body: ['A'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([
        ['A'],
        ['A'],
        ['B'],
        ['C'],
        ['B'],
        ['C'],
        ['A'],
        ['A'],
        ['A'],
        ['B'],
        ['C'],
        ['B'],
        ['C'],
        ['A']
    ]);
    expect(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { body: ['A'] },
        { signs: ['{'], body: ['B'] },
        { signs: ['}'], body: ['C'] },
        { signs: ['}'], body: ['A'] }
    ]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([
        ['A'],
        ['A'],
        ['B'],
        ['C'],
        ['B'],
        ['C'],
        ['A'],
        ['A'],
        ['A'],
        ['B'],
        ['C'],
        ['B'],
        ['C'],
        ['A']
    ]);
});
test('Sheet.render: repeat n times', function () {
    expect(Sheet_1.Sheet.render([{ signs: ['{', '}'], times: 0, body: ['A'] }]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A']]);
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { signs: ['}'], times: 0, body: ['B'] }
    ]))).toEqual('A B');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { signs: ['}'], times: 1, body: ['B'] }
    ]))).toEqual('A B A B');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { signs: ['}'], times: 2, body: ['B'] }
    ]))).toEqual('A B A B A B');
    expect(Sheet_1.Sheet.render([{ signs: ['{', '}'], times: 2, body: ['A'] }]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A'], ['A']]);
    expect(Sheet_1.Sheet.render([{ signs: ['{', '}'], times: 3, body: ['A'] }]).map(function (m) { return Measure_1.Measure.from(m).body; })).toEqual([['A'], ['A'], ['A'], ['A']]);
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render(['X', { signs: ['{', '}'], times: 2, body: ['A'] }, 'X']))).toEqual('X A A A X');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        'X',
        { signs: ['{'], body: ['O'] },
        'Y',
        { signs: ['{', '}'], times: 2, body: ['A'] },
        'Y',
        { signs: ['}'], times: 2, body: ['O'] },
        'X'
    ]))).toEqual('X O Y A A A Y O O Y A A A Y O O Y A A A Y O X');
});
test('Sheet.render: Measure.hasHouse', function () {
    expect(Measure_1.Measure.hasHouse({ house: 1 })).toBe(true);
    expect(Measure_1.Measure.hasHouse({})).toBe(false);
    expect(Measure_1.Measure.hasHouse({ house: 1 }, 1)).toBe(true);
    expect(Measure_1.Measure.hasHouse({ house: 2 }, 1)).toBe(false);
    expect(Measure_1.Measure.hasHouse({ house: [1, 2, 3] }, 2)).toBe(true);
    expect(Measure_1.Measure.hasHouse({ house: [2, 3] }, 1)).toBe(false);
    expect(Measure_1.Measure.hasHouse({}, 1)).toBe(false);
});
test('Sheet.getRelatedHouse', function () {
    expect(Sheet_1.Sheet.getRelatedHouse({
        sheet: [{ signs: ['{'] }, { house: 1 }, { signs: ['}'] }],
        index: 2
    })).toBe(1);
    expect(Sheet_1.Sheet.getRelatedHouse({
        sheet: [{ signs: ['{'] }, { house: 1, signs: '}' }, { signs: ['}'] }],
        index: 2
    })).toBe(-1);
    expect(Sheet_1.Sheet.getRelatedHouse({
        sheet: [{}, { house: 1, signs: ['}'] }],
        index: 1
    })).toBe(1);
    expect(Sheet_1.Sheet.getRelatedHouse({
        sheet: [
            { signs: ['{'] },
            { house: 1, signs: ['}'] },
            { house: 2, signs: ['}'] },
            { house: 3 }
        ],
        index: 2
    })).toBe(2);
    expect(Sheet_1.Sheet.getRelatedHouse({
        sheet: [{ signs: ['}'] }],
        index: 0
    })).toBe(-1);
});
var withMultiHouse = [
    { signs: ['{'], body: ['A'] },
    { signs: ['}'], times: 2, house: [1, 2], body: ['B'] },
    { house: 3, body: ['C'] }
];
test('Sheet.getAllowedJumps', function () {
    expect(Sheet_1.Sheet.getAllowedJumps({ sheet: withMultiHouse, index: 1 })).toBe(2);
    expect(Sheet_1.Sheet.getAllowedJumps({ sheet: [{ signs: '}' }], index: 0 })).toBe(1);
    expect(Sheet_1.Sheet.getAllowedJumps({ sheet: withMultiHouse, index: 1 })).toBe(2);
});
test('Sheet.render: multi houses', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render(withMultiHouse))).toEqual('A B A B A C');
});
test('Sheet.render: more than 2 houses', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { signs: ['}'], house: 1, body: ['B'] },
        { signs: ['}'], house: 2, body: ['C'] },
        { house: 3, body: ['D'] }
    ]))).toEqual('A B A C A D');
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { signs: ['}'], house: 1, body: ['B'] },
        { signs: ['}'], house: 2, body: ['C'] },
        { signs: ['}'], house: 3, body: ['D'] },
        { house: 4, body: ['E'] }
    ]))).toEqual('A B A C A D A E');
});
test('repeated houseblock', function () {
    expect(Snippet_1.Snippet.testFormat(Sheet_1.Sheet.render([
        { signs: ['{'], body: ['A'] },
        { house: 1, signs: ['}'], body: ['B'] },
        { house: 2, body: ['C'] },
        { signs: ['}'], body: ['D'] }
    ]))).toEqual('A B A C D A B A C D');
});
var ababac = [
    { signs: ['{'], body: ['A'] },
    { signs: ['}'], house: [1, 2], body: ['B'] },
    { house: 3, body: ['C'] }
];
test('Sheet.canVisitHouse', function () {
    expect(Sheet_1.Sheet.canVisitHouse({
        sheet: ababac,
        index: 1,
        visits: {}
    })).toEqual(true);
    expect(Sheet_1.Sheet.canVisitHouse({
        sheet: ababac,
        index: 1,
        visits: { 1: 1 }
    })).toEqual(true);
    expect(Sheet_1.Sheet.canVisitHouse({
        sheet: ababac,
        index: 1,
        visits: { 1: 2 }
    })).toEqual(false);
});
test('Sheet.getNextHouseIndex', function () {
    expect(Sheet_1.Sheet.getNextHouseIndex({
        sheet: ababac,
        index: 1,
        visits: {}
    })).toEqual(1);
    expect(Sheet_1.Sheet.getNextHouseIndex({
        sheet: ababac,
        index: 1,
        visits: { 1: 1 }
    })).toEqual(1);
    expect(Sheet_1.Sheet.getNextHouseIndex({
        sheet: ababac,
        index: 1,
        visits: { 1: 2 }
    })).toEqual(2);
});
test('Sheet.obfuscate', function () {
    expect(Sheet_1.Sheet.obfuscate(['C'])).toEqual([{ body: ['C'] }]);
    expect(Sheet_1.Sheet.obfuscate(['C'], false)).toEqual([{ body: ['?'] }]);
    expect(Sheet_1.Sheet.obfuscate([['C', 'Bb7']])).toEqual([{ body: ['C', '???'] }]);
    expect(Sheet_1.Sheet.obfuscate([['C', 'Bb7']], false)).toEqual([
        { body: ['?', '???'] }
    ]);
    expect(Sheet_1.Sheet.obfuscate(['C', 'Bb7'])).toEqual([
        { body: ['C'] },
        { body: ['???'] }
    ]);
    expect(Sheet_1.Sheet.obfuscate(['C', 'Bb7'], false)).toEqual([
        { body: ['?'] },
        { body: ['???'] }
    ]);
});
