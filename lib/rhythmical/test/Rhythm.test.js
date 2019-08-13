"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rhythm_1 = require("../Rhythm");
test('Rhythm.duration', function () {
    expect(Rhythm_1.Rhythm.duration([2, 2].map(function (d) { return ([0, d]); }))).toEqual(0.25);
    expect(Rhythm_1.Rhythm.duration([1, 4].map(function (d) { return ([0, d]); }))).toEqual(0.25);
    expect(Rhythm_1.Rhythm.duration([1, 1].map(function (d) { return ([0, d]); }))).toEqual(1);
    expect(Rhythm_1.Rhythm.duration([4, 2].map(function (d) { return ([0, d]); }), 4)).toEqual(0.5);
    expect(Rhythm_1.Rhythm.duration([4, 3].map(function (d) { return ([0, d]); }), 4)).toEqual(1 / 3);
});
test('Rhythm.time', function () {
    expect(Rhythm_1.Rhythm.time([[0, 2], [1, 2]])).toEqual(0.25);
    expect(Rhythm_1.Rhythm.time([[1, 2], [0, 2]])).toEqual(0.5);
    expect(Rhythm_1.Rhythm.time([[0, 1], [3, 4]])).toEqual(0.75);
    expect(Rhythm_1.Rhythm.time([[0, 1], [0, 1]])).toEqual(0);
    // expect(Rhythm.time([[0,1], [1]])).toEqual(NaN); // bad
    expect(Rhythm_1.Rhythm.time([[1, 4], [0, 3]], 4)).toEqual(1);
});
test('Rhythm.calculate', function () {
    var calculated = Rhythm_1.Rhythm.flat([1, [0, 3], 0, 1]).map(Rhythm_1.Rhythm.calculate(4));
    expect(calculated
        .map(function (_a) {
        var value = _a.value, time = _a.time, duration = _a.duration;
        return ({ value: value, time: time, duration: duration });
    })).toEqual([
        { value: 1, time: 0, duration: 1 },
        { value: 0, time: 1, duration: 0 },
        { value: 3, time: 1.5, duration: 1.5 },
        { value: 0, time: 2, duration: 0 },
        { value: 1, time: 3, duration: 1 }
    ]);
    expect(Rhythm_1.Rhythm.render(['C7', 'F7'], 4)
        .map(function (e) { return e.duration; })).toEqual([2, 2]);
});
test('render', function () {
    expect(Rhythm_1.Rhythm.render([0, 1, 0, 1], 4)).toEqual([
        { value: 1, path: [[1, 4]], time: 1, duration: 1 },
        { value: 1, path: [[3, 4]], time: 3, duration: 1 }
    ]);
});
test('Rhythm.simplePath', function () {
    expect(Rhythm_1.Rhythm.simplePath([1, 0])).toEqual('1');
    expect(Rhythm_1.Rhythm.simplePath([0, 1])).toEqual('0.1');
    expect(Rhythm_1.Rhythm.simplePath([1, 0, 1])).toEqual('1.0.1');
    expect(Rhythm_1.Rhythm.simplePath([1, 0, 0, 1])).toEqual('1.0.0.1');
    expect(Rhythm_1.Rhythm.simplePath([0, 0, 0, 1])).toEqual('0.0.0.1');
    expect(Rhythm_1.Rhythm.simplePath([0, 0, 1])).toEqual('0.0.1');
    expect(Rhythm_1.Rhythm.simplePath([0])).toEqual('0');
    expect(Rhythm_1.Rhythm.simplePath([20])).toEqual('20');
    expect(Rhythm_1.Rhythm.simplePath([20, 0])).toEqual('20');
});
test('Rhythm.getPath', function () {
    expect(Rhythm_1.Rhythm.getPath(['C'], 0)).toBe('C');
    expect(Rhythm_1.Rhythm.getPath([['C']], 0)).toEqual('C');
    expect(Rhythm_1.Rhythm.getPath(['C', 'D', 'E'], 1)).toBe('D');
    expect(Rhythm_1.Rhythm.getPath(['C', ['D1', 'D2'], 'E'], 1)).toEqual('D1');
    expect(Rhythm_1.Rhythm.getPath(['C', ['D1', 'D2'], 'E'], [1, 1])).toEqual('D2');
    expect(Rhythm_1.Rhythm.getPath(['C', ['D1', 'D2'], 'E'], [1, 1, 0])).toEqual('D2');
});
test('nest', function () {
    expect(Rhythm_1.Rhythm.nest([
        { value: 2, divisions: [4, 4], path: [0, 0] },
        { value: 2, divisions: [4, 4], path: [0, 2] },
        { value: 2, divisions: [4, 4], path: [1, 0] },
        { value: 2, divisions: [4, 4], path: [1, 2] },
        { value: 2, divisions: [4], path: [2] }
    ], 0)).toEqual([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0]);
    expect(Rhythm_1.Rhythm.nest([
        { value: 'C', path: [0], divisions: [2] },
        { value: 'D', path: [1, 0], divisions: [2, 1] }
    ], '')).toEqual(['C', ['D']]);
    expect(Rhythm_1.Rhythm.nest([
        { value: 'C', path: [0], divisions: [2] },
        { value: 'D', path: [1, 0], divisions: [2, 2] },
        { value: 'E', path: [1, 1], divisions: [2, 2] }
    ], '')).toEqual(['C', ['D', 'E']]);
    expect(Rhythm_1.Rhythm.nest([
        { value: 'C', path: [0], divisions: [3] },
        { value: 'D', path: [1, 0], divisions: [3, 2] },
        { value: 'E', path: [1, 1], divisions: [3, 2] },
        { value: 'F', path: [2], divisions: [3] }
    ], '')).toEqual(['C', ['D', 'E'], 'F']);
    expect(Rhythm_1.Rhythm.nest([
        { value: 'C', path: [0], divisions: [3] },
        { value: 'D', path: [1, 0], divisions: [3, 3] },
        { value: 'D1', path: [1, 1, 0], divisions: [3, 3, 2] },
        { value: 'D2', path: [1, 1, 1], divisions: [3, 3, 2] },
        { value: 'E', path: [1, 2], divisions: [3, 3] },
        { value: 'F', path: [2], divisions: [3] }
    ], '')).toEqual(['C', ['D', ['D1', 'D2'], 'E'], 'F']);
    expect(Rhythm_1.Rhythm.nest([
        { value: 'C', path: [1], divisions: [3] },
        { value: 'D', path: [2, 0], divisions: [3, 1] }
    ], '-')).toEqual(['-', 'C', ['D']]);
    expect(Rhythm_1.Rhythm.nest([
        { value: 'C', path: [1], divisions: [4] },
        { value: 'D', path: [3, 1], divisions: [4, 2] }
    ], '/')).toEqual(['/', 'C', '/', ['/', 'D']]);
    expect(Rhythm_1.Rhythm.nest([{ value: 2, divisions: [4, 3], path: [0, 0] },
        { value: 2, divisions: [4, 3], path: [0, 2] },
        { value: 2, divisions: [4, 3], path: [1, 1] },
        { value: 2, divisions: [4], path: [2] }])).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
    expect(Rhythm_1.Rhythm.nest([{ value: 2, divisions: [4, 3], path: [0, 0] },
        { value: 2, divisions: [4, 3], path: [0, 2] },
        { value: 2, divisions: [4, 3], path: [1, 1] },
        { value: 2, divisions: [4], path: [2] }])).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
    expect(Rhythm_1.Rhythm.nest([
        { path: [0, 0], divisions: [2, 1], value: 1 },
        { path: [1, 0], divisions: [2, 1], value: 2 },
    ])).toEqual([[1], [2]]);
    expect(Rhythm_1.Rhythm.nest([
        { path: [1, 0], divisions: [2, 1], value: 2 },
        { path: [0, 0], divisions: [2, 1], value: 1 },
    ])).toEqual([[1], [2]]);
});
test('pathOf', function () {
    expect(Rhythm_1.Rhythm.pathOf('C', ['A', ['B', 'C']])).toEqual([1, 1]);
    expect(Rhythm_1.Rhythm.pathOf('D', ['A', ['B', 'C']])).toEqual(undefined);
    expect(Rhythm_1.Rhythm.nextValue(['A', ['B', 'C']], 'A')).toEqual('B');
    expect(Rhythm_1.Rhythm.nextValue(['A', ['B', 'C']], 'B')).toEqual('C');
    expect(Rhythm_1.Rhythm.nextValue(['A', ['B', 'C']], 'C')).toEqual('A');
    // expect(Rhythm.nextValue(['A', ['B', 'C']], 'C', false)).toEqual(undefined);
    expect(Rhythm_1.Rhythm.nextPath(['A', ['B', 'C']])).toEqual([0]);
    expect(Rhythm_1.Rhythm.nextPath(['A', ['B', 'C']], [0])).toEqual([1, 0]);
    expect(Rhythm_1.Rhythm.nextPath(['A', ['B', 'C']], [1, 0])).toEqual([1, 1]);
    expect(Rhythm_1.Rhythm.nextPath(['A', ['B', 'C']], [1, 1])).toEqual([0]);
    // expect(Rhythm.nextPath(['A', ['B', 'C']], [1, 1], false)).toEqual(undefined);
});
test('multiply', function () {
    /* console.log(JSON.stringify(Rhythm.multiply(
      [[[1.5, [0, 1]], [0, 1]], [[0, 1], 1]]
      , 2))) */
    //[[[3,0],[0,[2,0]]],[0,[2,0]],[0,[2,0]],[2,0]]
    //[[[3,0],[0,[2,0]]],[0,[2,0]],[0,[2,0]],[2,0]]
    /* expect(Rhythm.multiply([[[1.5, [0, 1]], [0, 1]], [[0, 1], 1]], 2)).toEqual(
      [[[3, 0], [0, [2, 0]]], [0, [2, 0]], [0, [2, 0]], [2, 0]]
    ) */
    expect(Rhythm_1.Rhythm.multiplyPath([0, 0], [4, 2], 2)).toEqual([0, 0]);
    /* expect(Rhythm.multiply([1, [1, 1]])).toEqual([2, 0, [1], [1]]) */
    expect(Rhythm_1.Rhythm.multiplyDivisions([2, 2], 2)).toEqual([4, 2]);
    expect(Rhythm_1.Rhythm.multiplyPath([0, 0], [4, 2], 2)).toEqual([0, 0]);
    expect(Rhythm_1.Rhythm.multiplyPath([0, 1], [4, 2], 2)).toEqual([1, 0]);
    expect(Rhythm_1.Rhythm.multiplyPath([1, 0], [4, 2], 2)).toEqual([2, 0]);
    expect(Rhythm_1.Rhythm.multiplyPath([1, 1], [4, 2], 2)).toEqual([3, 0]);
    expect(Rhythm_1.Rhythm.multiply([0, 1], 2)).toEqual([0, 0, 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([1, 1, 1], 2)).toEqual([2, 0, 2, 0, 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1]], 2)).toEqual([[2, 0], [2, 0]]);
    expect(Rhythm_1.Rhythm.multiply([1, [1, 1]], 2)).toEqual([2, 0, [2, 0], [2, 0]]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1], 1], 2)).toEqual([[2, 0], [2, 0], 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1], 1, 1], 2)).toEqual([[2, 0], [2, 0], 2, 0, 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1, 1, 1], 1], 2)).toEqual([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1, 1, 1], 1, 1], 2)).toEqual([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0, 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([1, [1, 1, 1, 1]], 2)).toEqual([2, 0, [2, 0, 2, 0], [2, 0, 2, 0]]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1], [1, 1]], 2)).toEqual([[2, 0], [2, 0], [2, 0], [2, 0]]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1, 1], 1], 2)).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([[1, 1, 1], 1, 1], 2)).toEqual([[2, 0, 2], [0, 2, 0], 2, 0, 2, 0]);
    expect(Rhythm_1.Rhythm.multiply([1], 3)).toEqual([3, 0, 0]);
    expect(Rhythm_1.Rhythm.multiply([[1], 1], 2)).toEqual([[2], 0, 2, 0]);
});
/* test('divide', () => {
  expect(Rhythm.divide([[2], 0, 2, 0], 2)).toEqual([[1], 1]);
  expect(Rhythm.divide([2, 0, 2, 0], 2)).toEqual([1, 1]);
  expect(Rhythm.divide([0, 0, 2, 0], 2)).toEqual([0, 1]);
  expect(Rhythm.divide([2, 0, 2, 0, 2, 0], 2)).toEqual([1, 1, 1]);
}); */
describe('addPaths', function () {
    test('same length', function () {
        expect(Rhythm_1.Rhythm.addPaths([1, 0], [0, 1])).toEqual([1, 1]);
        expect(Rhythm_1.Rhythm.addPaths([1, 1], [0, 1])).toEqual([1, 2]);
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [0, 1])).toEqual([0, 1]);
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [1, 0])).toEqual([1, 0]);
    });
    test('different lengh', function () {
        expect(Rhythm_1.Rhythm.addPaths([0], [0, 1])).toEqual([0, 1]);
        expect(Rhythm_1.Rhythm.addPaths([0, 1], [1])).toEqual([1, 1]);
        expect(Rhythm_1.Rhythm.addPaths([1], [1, 1])).toEqual([2, 1]);
    });
    test('with divisions (overflow)', function () {
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [0, 3], [2, 4])).toEqual([0, 3]);
        expect(Rhythm_1.Rhythm.addPaths([0, 1], [0, 3], [2, 4])).toEqual([1, 0]);
        expect(Rhythm_1.Rhythm.addPaths([0, 2], [0, 3], [2, 4])).toEqual([1, 1]);
        expect(Rhythm_1.Rhythm.addPaths([0, 3], [0, 3], [2, 4])).toEqual([1, 2]);
        expect(Rhythm_1.Rhythm.addPaths([0, 4], [0, 3], [2, 4])).toEqual([1, 3]);
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [0, 1], [2, 1])).toEqual([1, 0]);
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [0, 1], [2, 2])).toEqual([0, 1]);
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [1, 0], [2, 1])).toEqual([1, 0]);
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [0, 1], [1, 1])).toEqual([1, 0]); // <- 1 forbidden in div 1
        expect(Rhythm_1.Rhythm.addPaths([0, 0], [1, 0], [1, 1])).toEqual([1, 0]); // <- 1 is forbidden in div 1
        // expect(Rhythm.addPaths([0, 0], [1, 0], [1, 1])).toEqual([1, 0, 0]); // <-- would be correct
        // expect(Rhythm.addPaths([0, 0], [0, 1], [1, 1])).toEqual([1, 0, 0]);
        // alternative addEvents that updates outermost division to expand
    });
});
describe('addPulse', function () {
    test('simple', function () {
        expect(Rhythm_1.Rhythm.addPulse([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8]]);
        expect(Rhythm_1.Rhythm.addPulse([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 0]]);
        expect(Rhythm_1.Rhythm.addPulse([1, 2, 3, 4, 5, 6, 7, 8], 2)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8]]);
        expect(Rhythm_1.Rhythm.addPulse([1, 2, 3, 4, 5, 6, 7, 8], 5)).toEqual([[1, 2, 3, 4, 5], [6, 7, 8, 0, 0]]);
        expect(Rhythm_1.Rhythm.addPulse([1], 4)).toEqual([[1, 0, 0, 0]]);
        expect(Rhythm_1.Rhythm.addPulse([1], 3)).toEqual([[1, 0, 0]]);
    });
    test('nesting', function () {
        expect(Rhythm_1.Rhythm.addPulse([1, [1, 1], 3, 4], 2)).toEqual([[1, [1, 1]], [3, 4]]);
    });
    test('simple offset', function () {
        expect(Rhythm_1.Rhythm.addPulse([4, 1, 2, 3, 4], 4, 3)).toEqual([[0, 0, 0, 4], [1, 2, 3, 4]]);
        expect(Rhythm_1.Rhythm.addPulse([3, 1, 2, 3], 3, 2)).toEqual([[0, 0, 3], [1, 2, 3]]);
        expect(Rhythm_1.Rhythm.addPulse([[0, 1], 1, 2, 3, 4], 4, 3)).toEqual([[0, 0, 0, [0, 1]], [1, 2, 3, 4]]);
    });
});
test('removePulse', function () {
    expect(Rhythm_1.Rhythm.removePulse([[1, 2, 3, 4], [5, 6, 7, 8]])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(Rhythm_1.Rhythm.removePulse([[1, 2, [3, 3], 4], [5, 6, 7, 8]])).toEqual([1, 2, [3, 3], 4, 5, 6, 7, 8]);
    expect(Rhythm_1.Rhythm.removePulse([[1, 2, 3], [4, 5, 6], [7, 8, 0]])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    expect(Rhythm_1.Rhythm.removePulse([[1, [1, 1]], [3, 4]])).toEqual([1, [1, 1], 3, 4]);
    expect(Rhythm_1.Rhythm.removePulse([[0, 0, 0, 4], [1, 2, 3, 4]])).toEqual([0, 0, 0, 4, 1, 2, 3, 4]);
});
describe('new syntax', function () {
    test('flat', function () {
        expect(Rhythm_1.Rhythm.flat(['C'])).toEqual([{ value: 'C', path: [[0, 1]] }]);
        expect(Rhythm_1.Rhythm.flat([{ body: ['C'], section: 'A' }, { body: ['F'] }])).toEqual([
            { path: [[0, 2]], value: { body: ['C'], section: 'A' } },
            { path: [[1, 2]], value: { body: ['F'] } }
        ]);
        expect(Rhythm_1.Rhythm.flat(['C'])).toEqual([
            { value: 'C', path: [[0, 1]] }
        ]);
        expect(Rhythm_1.Rhythm.flat(['C', 'D'])).toEqual([
            { value: 'C', path: [[0, 2]] },
            { value: 'D', path: [[1, 2]] }
        ]);
        expect(Rhythm_1.Rhythm.flat(['C', ['D']]).map(function (e) { return e.value; })).toEqual(['C', 'D']);
        expect(Rhythm_1.Rhythm.flat(['C', ['D', 'E'], 'F']).map(function (e) { return e.value; })).toEqual(['C', 'D', 'E', 'F']);
        expect(Rhythm_1.Rhythm.flat(['C', ['D', ['E', 'F']], 'G']).map(function (e) { return e.value; })).toEqual([
            'C',
            'D',
            'E',
            'F',
            'G'
        ]);
        expect(Rhythm_1.Rhythm.flat(['C', ['D']])).toEqual([
            { value: 'C', path: [[0, 2]] },
            { value: 'D', path: [[1, 2], [0, 1]] }
        ]);
        expect(Rhythm_1.Rhythm.flat(['C', ['D', 0]])).toEqual([
            { value: 'C', path: [[0, 2]] },
            { value: 'D', path: [[1, 2], [0, 2]] },
            { value: 0, path: [[1, 2], [1, 2]] }
        ]);
        expect(Rhythm_1.Rhythm.flat(['C', ['D', ['E', ['F', 'G']]], 'A', 'B'])).toEqual([
            { value: 'C', path: [[0, 4]] },
            { value: 'D', path: [[1, 4], [0, 2]] },
            { value: 'E', path: [[1, 4], [1, 2], [0, 2]] },
            { value: 'F', path: [[1, 4], [1, 2], [1, 2], [0, 2]] },
            { value: 'G', path: [[1, 4], [1, 2], [1, 2], [1, 2]] },
            { value: 'A', path: [[2, 4]] },
            { value: 'B', path: [[3, 4]] }
        ]);
    });
    test('nested', function () {
        expect(Rhythm_1.Rhythm.nested([
            { value: 2, path: [[0, 4], [0, 4]] },
            { value: 2, path: [[0, 4], [2, 4]] },
            { value: 2, path: [[1, 4], [0, 4]] },
            { value: 2, path: [[1, 4], [2, 4]] },
            { value: 2, path: [[2, 4]] }
        ], 0)).toEqual([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0]);
        expect(Rhythm_1.Rhythm.nested([
            { value: 'C', path: [[0, 2]] },
            { value: 'D', path: [[1, 2], [0, 1]] }
        ])).toEqual(['C', ['D']]);
        expect(Rhythm_1.Rhythm.nested([
            { value: 'C', path: [[0, 2]] },
            { value: 'D', path: [[1, 2], [0, 2]] },
            { value: 'E', path: [[1, 2], [1, 2]] }
        ], '')).toEqual(['C', ['D', 'E']]);
        expect(Rhythm_1.Rhythm.nested([
            { value: 'C', path: [[0, 3]] },
            { value: 'D', path: [[1, 3], [0, 2]] },
            { value: 'E', path: [[1, 3], [1, 2]] },
            { value: 'F', path: [[2, 3]] }
        ], '')).toEqual(['C', ['D', 'E'], 'F']);
        expect(Rhythm_1.Rhythm.nested([
            { value: 'C', path: [[0, 3]] },
            { value: 'D', path: [[1, 3], [0, 3]] },
            { value: 'D1', path: [[1, 3], [1, 3], [0, 2]] },
            { value: 'D2', path: [[1, 3], [1, 3], [1, 2]] },
            { value: 'E', path: [[1, 3], [2, 3]] },
            { value: 'F', path: [[2, 3]] }
        ], '')).toEqual(['C', ['D', ['D1', 'D2'], 'E'], 'F']);
        expect(Rhythm_1.Rhythm.nested([
            { value: 'C', path: [[1, 3]] },
            { value: 'D', path: [[2, 3], [0, 1]] }
        ], '-')).toEqual(['-', 'C', ['D']]);
        expect(Rhythm_1.Rhythm.nested([
            { value: 'C', path: [[1, 4]] },
            { value: 'D', path: [[3, 4], [1, 2]] }
        ], '/')).toEqual(['/', 'C', '/', ['/', 'D']]);
        expect(Rhythm_1.Rhythm.nested([{ value: 2, path: [[0, 4], [0, 3]] },
            { value: 2, path: [[0, 4], [2, 3]] },
            { value: 2, path: [[1, 4], [1, 3]] },
            { value: 2, path: [[2, 4]] }])).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
        expect(Rhythm_1.Rhythm.nested([{ value: 2, path: [[0, 4], [0, 3]] },
            { value: 2, path: [[0, 4], [2, 3]] },
            { value: 2, path: [[1, 4], [1, 3]] },
            { value: 2, path: [[2, 4]] }])).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
        expect(Rhythm_1.Rhythm.nested([
            { path: [[0, 2], [0, 1]], value: 1 },
            { path: [[1, 2], [0, 1]], value: 2 },
        ])).toEqual([[1], [2]]);
        expect(Rhythm_1.Rhythm.nested([
            { path: [[1, 2], [0, 1]], value: 2 },
            { path: [[0, 2], [0, 1]], value: 1 },
        ])).toEqual([[1], [2]]);
    });
    test('align', function () {
        expect(Rhythm_1.Rhythm.align([[0, 4]], [[0, 4], [1, 2]])).toEqual([[[0, 4], [0, 1]], [[0, 4], [1, 2]]]);
        expect(Rhythm_1.Rhythm.align([[0, 4]], [[0, 4], [1, 2]])).toEqual([[[0, 4], [0, 1]], [[0, 4], [1, 2]]]);
    });
    test('add', function () {
        expect(Rhythm_1.Rhythm.add([[0, 4]], [[0, 4], [1, 2]])).toEqual([[0, 4], [1, 2]]);
        expect(Rhythm_1.Rhythm.add([[0, 4]], [[1, 8]])).toEqual([[1, 8]]);
        expect(Rhythm_1.Rhythm.add([[0, 4]], [[1, 4]])).toEqual([[1, 4]]);
        expect(Rhythm_1.Rhythm.add([[1, 4]], [[1, 4]])).toEqual([[2, 4]]);
        expect(Rhythm_1.Rhythm.add([[0, 4]], [[4, 4]])).toEqual([[4, 5]]);
        expect(Rhythm_1.Rhythm.add([[0, 4]], [[0, 4], [3, 2]])).toEqual([[1, 4], [1, 2]]);
        expect(Rhythm_1.Rhythm.add([[0, 4], [0, 2]], [[0, 4], [1, 2]])).toEqual([[0, 4], [1, 2]]);
        expect(Rhythm_1.Rhythm.add([[0, 4], [0, 4]], [[0, 4], [1, 2]])).toEqual([[0, 4], [2, 4]]);
        expect(Rhythm_1.Rhythm.add([[0, 4], [1, 4]], [[0, 4], [1, 2]])).toEqual([[0, 4], [3, 4]]);
        expect(Rhythm_1.Rhythm.add([[0, 4], [1, 4]], [[0, 4], [3, 4]])).toEqual([[1, 4], [0, 4]]);
    });
    test('carry', function () {
        expect(Rhythm_1.Rhythm.carry([[3, 3]])).toEqual([[3, 4]]);
        expect(Rhythm_1.Rhythm.carry([[2, 3], [2, 2]])).toEqual([[3, 4], [0, 2]]);
    });
    test('shift', function () {
        expect(Rhythm_1.Rhythm.shift([1, 0, 1, 0], [[1, 4]])).toEqual([0, 1, 0, 1, 0]);
        expect(Rhythm_1.Rhythm.shift([1, 0, 1, 0], [[1, 8]])).toEqual([0, 1, 0, 0, 0, 1, 0, 0]);
        expect(Rhythm_1.Rhythm.shift([1, 0, 1, 0], [[0, 4], [1, 2]])).toEqual([[0, 1], 0, [0, 1], 0]);
        expect(Rhythm_1.Rhythm.shift([[1, 0, 1, 0]], [[1, 2]])).toEqual([0, [1, 0, 1, 0]]);
        expect(Rhythm_1.Rhythm.shift([[1, 0, 1, 0]], [[2, 3]])).toEqual([0, 0, [1, 0, 1, 0]]);
        expect(Rhythm_1.Rhythm.shift([[1, 0, 1, 0]], [[2, 4]])).toEqual([0, 0, [1, 0, 1, 0], 0]);
        expect(Rhythm_1.Rhythm.shift([[1, 0, 1, 0]], [[0, 4]])).toEqual([[1, 0, 1, 0], 0, 0, 0]);
        expect(Rhythm_1.Rhythm.shift([1], [[0, 4]])).toEqual([1, 0, 0, 0]);
        expect(Rhythm_1.Rhythm.shift([[0, 0, 0, 1], [2, 3, 4, 0]], [[0, 1], [1, 4]])).toEqual([0, [1, 2, 3, 4], 0]);
        expect(Rhythm_1.Rhythm.shift([[0]], [[0, 4]])).toEqual([]);
        expect(Rhythm_1.Rhythm.shift([[1, 0, 1, 0]], [[0, 1], [1, 4]])).toEqual([[0, 1, 0, 1], 0]);
    });
    describe('wrap', function () {
        test('simple', function () {
            expect(Rhythm_1.Rhythm.group([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8]]);
            expect(Rhythm_1.Rhythm.group([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8]]);
            expect(Rhythm_1.Rhythm.group([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 0]]);
            expect(Rhythm_1.Rhythm.group([1, 2, 3, 4, 5, 6, 7, 8], 2)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8]]);
            expect(Rhythm_1.Rhythm.group([1, 2, 3, 4, 5, 6, 7, 8], 5)).toEqual([[1, 2, 3, 4, 5], [6, 7, 8, 0, 0]]);
            expect(Rhythm_1.Rhythm.group([1], 4)).toEqual([[1, 0, 0, 0]]);
            expect(Rhythm_1.Rhythm.group([1], 3)).toEqual([[1, 0, 0]]);
        });
        test('nesting', function () {
            expect(Rhythm_1.Rhythm.group([1, 2, [0, 3], 4, 5, [0, 6], 7, 8], 4)).toEqual([[1, 2, [0, 3], 4], [5, [0, 6], 7, 8]]);
            expect(Rhythm_1.Rhythm.group([1, [1, 1], 3, 4], 2)).toEqual([[1, [1, 1]], [3, 4]]);
        });
        test('simple offset', function () {
            expect(Rhythm_1.Rhythm.group([4, 1, 2, 3, 4], 4, 3)).toEqual([[0, 0, 0, 4], [1, 2, 3, 4]]);
            expect(Rhythm_1.Rhythm.group([3, 1, 2, 3], 3, 2)).toEqual([[0, 0, 3], [1, 2, 3]]);
            expect(Rhythm_1.Rhythm.group([[0, 1], 1, 2, 3, 4], 4, 3)).toEqual([[0, 0, 0, [0, 1]], [1, 2, 3, 4]]);
            expect(Rhythm_1.Rhythm.group([3, 4, 1, 2], 4, 2)).toEqual([[0, 0, 3, 4], [1, 2, 0, 0]]);
        });
    });
    test('unwrap', function () {
        var son4 = [
            [1.5, [0, 1], 0, 1],
            [0, 1, 1, 0] // bar 2
        ]; /*
        const son2 = [
          [[1.5, [0, 1]], [0, 1]], // bar 1
          [[0, 1], [1, 0]] // bar 2
        ]; */
        var son0 = Rhythm_1.Rhythm.ungroup(son4);
        expect(son0).toEqual([1.5, [0, 1], 0, 1, 0, 1, 1, 0]);
        var son2half = Rhythm_1.Rhythm.group(son0, 2);
        expect(son2half).toEqual([[1.5, [0, 1]], [0, 1], [0, 1], [1, 0]]);
        var son2 = Rhythm_1.Rhythm.group(son2half, 2);
        expect(son2).toEqual([[[1.5, [0, 1]], [0, 1]], [[0, 1], [1, 0]]]);
        var afrobell4 = [[2, 0, 2], [0, 1, 2], [0, 2, 0], [2, 0, 1]];
        var afrobell0 = Rhythm_1.Rhythm.ungroup(afrobell4);
        expect(afrobell0).toEqual([2, 0, 2, 0, 1, 2, 0, 2, 0, 2, 0, 1]);
        var afrobell3 = Rhythm_1.Rhythm.group(afrobell0, 4);
        expect(afrobell3).toEqual([[2, 0, 2, 0], [1, 2, 0, 2], [0, 2, 0, 1]]);
        expect(Rhythm_1.Rhythm.ungroup([[1, 2, 3, 4], [5, 6, 7, 8]])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(Rhythm_1.Rhythm.ungroup([[1, 2, [3, 3], 4], [5, 6, 7, 8]])).toEqual([1, 2, [3, 3], 4, 5, 6, 7, 8]);
        expect(Rhythm_1.Rhythm.ungroup([[1, 2, 3], [4, 5, 6], [7, 8, 0]])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
        expect(Rhythm_1.Rhythm.ungroup([[1, [1, 1]], [3, 4]])).toEqual([1, [1, 1], 3, 4]);
        expect(Rhythm_1.Rhythm.ungroup([[0, 0, 0, 4], [1, 2, 3, 4]])).toEqual([0, 0, 0, 4, 1, 2, 3, 4]);
    });
    describe('combine', function () {
        test('without collisions', function () {
            expect(Rhythm_1.Rhythm.combine([1], [0])).toEqual([1]);
            expect(Rhythm_1.Rhythm.combine([0], [1])).toEqual([1]);
            expect(Rhythm_1.Rhythm.combine([1], [0, 1])).toEqual([1, 1]);
            expect(Rhythm_1.Rhythm.combine([1, 0], [0, 1])).toEqual([1, 1]);
            expect(Rhythm_1.Rhythm.combine([1], [0, 0, 0, 1])).toEqual([1, 0, 0, 1]);
            expect(Rhythm_1.Rhythm.combine([[1, 1]], [0, 0, 0, 1])).toEqual([[1, 1], 0, 0, 1]);
            expect(Rhythm_1.Rhythm.combine([[0, 1]], [[1, 1], 0, 0, 1])).toEqual([[1, 1], 0, 0, 1]);
            expect(Rhythm_1.Rhythm.combine([[0, 1]], [[1, 0], 0, 0, 1])).toEqual([[1, 1], 0, 0, 1]);
            expect(Rhythm_1.Rhythm.combine([1], [0, 0, 0, 0])).toEqual([1, 0, 0, 0]);
            // expect(Rhythm.combine<number>([[1, 1], [1, 1]], [0, 0, 0, 0], [1])).toEqual([0, [1, 1], [1, 1], 0]);
        });
    });
    test('isEqualPath', function () {
        expect(Rhythm_1.Rhythm.isEqualPath([[0, 1], [2, 4]], [[0, 1], [2, 4]])).toEqual(true);
        expect(Rhythm_1.Rhythm.isEqualPath([[0, 1], [2, 4]], [[0, 1], [3, 4]])).toEqual(false);
    });
    describe('insert', function () {
        test('default', function () {
            expect(Rhythm_1.Rhythm.insert([1, 2, 3, 4], [[0, 0]], 0)).toEqual([[1, 2], [3, 4]]);
            expect(Rhythm_1.Rhythm.insert([0, 2, 3, 4], [[3, 0]], 0)).toEqual([[3, 2], [3, 4]]);
            expect(Rhythm_1.Rhythm.insert([0, 2, 3, 4], [[3, 4]], 0)).toEqual([[3, 2], [3, 4]]);
            expect(Rhythm_1.Rhythm.insert([0, 4, 3, 4], [[3, 2]], 0)).toEqual([[3, 4], [3, 4]]);
            expect(Rhythm_1.Rhythm.insert([3, 4, 5, 6], [[1, 2, 0]], 2)).toEqual([[1, 2, 3], [4, 5, 6]]);
            expect(Rhythm_1.Rhythm.insert([3, 4, 5, 6, 7, 8], [[1, 2, 0, 0]], 2)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8]]);
        });
        test('negative offset', function () {
            var swingCymbal = [
                1,
                [2, 0, 1],
                1,
                [2, 0, 1] // four with "swing" off
            ];
            expect(Rhythm_1.Rhythm.insert([3, 4], [[1, 2, 0, 0]], 2)).toEqual([[1, 2, 3, 4]]); // from left
            expect(Rhythm_1.Rhythm.insert([3, 4], [[1, 2, 0, 0]], -2)).toEqual([[1, 2, 3, 4]]); // from right
            var smoke = [[1, 1, 1.5, [0, 1]], [[0, 1], [0, 1], 2, 0]];
            var smokeOn = Rhythm_1.Rhythm.insert([[0, 7], 0, 0, 0], smoke.concat([smoke[0]]));
            expect(smokeOn).toEqual([
                [1, 1, 1.5, [0, 1]], [[0, 1], [0, 1], 2, 0],
                [1, 1, 1.5, [0, 1]], [[0, 7], 0, 0, 0],
            ]);
            var bars = Rhythm_1.Rhythm.insert([1.5, [0, 1], [1, 1], 1, [1, 1], 0], [[1, 1, 1, 1], [1, 1, 1, 1]], -2);
            expect(bars).toEqual([[1, 1, 1, 1], [1, 1, 1.5, [0, 1]], [[1, 1], 1, [1, 1], 0]]);
            /* expect(Rhythm.insert([4, 1, 2, 3, 4], [[1, 2, 3, 0]], 3)).toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]); */
        });
        /* test('at path', () => {
          expect(Rhythm.combine([1], [0, 0, 0, 0], [0])).toEqual([1, 0, 0, 0]);
          expect(Rhythm.combine([1], [0, 0, 0, 0], [1])).toEqual([0, 1, 0, 0]);
          expect(Rhythm.combine([1], [0, 0, 0, 0], [2])).toEqual([0, 0, 1, 0]);
          expect(Rhythm.combine([1], [0, 0, 0, 0], [3])).toEqual([0, 0, 0, 1]);
        }); */
        /*
          test('with collisions', () => {
        
            expect(Rhythm.combine<number>([[0, 1], 1], [1, 0, 1, 0], [2])).toEqual([1, 0, [0, 1], 1]);
            expect(Rhythm.combine<number>([[0, 1]], [1])).toEqual([[0, 1]]);
            expect(Rhythm.combine<number>([[0, 1], 1], [1, 0, 1, 0], [2])).toEqual([1, 0, [0, 1], 1]);
        
          });
          test('overflow', () => {
            expect(Rhythm.combine<number>([1], [0], [1])).toEqual([0, 1]);
            expect(Rhythm.combine([1], [0, 0, 0, 0], [4])).toEqual([0, 0, 0, 0, 1]);
            expect(Rhythm.combine<number>([[1]], [[0]], [1])).toEqual([[0], [1]]);
        
            expect(Rhythm.combine<number>(
              [[1, 1, 1, 1]],
              [[0, 0, 0, 0]],
              [1])).toEqual([[0, 0, 0, 0], [1, 1, 1, 1]]);
        
            expect(Rhythm.combine<number>([[0, 1]], [[1]], [1])).toEqual([[1], [0, 1]]);
            expect(Rhythm.combine<number>([[2], [3]], [[1]], [1])).toEqual([[1], [2], [3]]);
        
            expect(Rhythm.combine<number>([[0, 1], 1, 2, 3, 4], [1, 2, 3, 4], [3]))
              .toEqual([1, 2, 3, [0, 1], 1, 2, 3, 4]);
          });
        
          test('nested overflow', () => {
            expect(Rhythm.combine<number>([[0, 0, 0, 4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0]))
              .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
            expect(Rhythm.combine<number>([[0, 0, 0, 4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0]))
              .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
            // expect(Rhythm.combine<number>([[4, 1, 2, 3, 4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0]))
            //   .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
        
            // expect(Rhythm.combine<number>([[4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0, 3]))
            //   .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
          }) */
    });
});
/* test('normalize', () => {
  expect(Rhythm.normalize({ path: [0], divisions: [1], value: 1 }, 2))
    .toEqual({ path: [0, 0], divisions: [1, 1], value: 1 });

  expect(Rhythm.normalize({ path: [0], divisions: [1], value: 1 }, 3))
    .toEqual({ path: [0, 0, 0], divisions: [1, 1, 1], value: 1 });

  expect(Rhythm.normalize({ path: [0, 0], divisions: [1, 1], value: 1 }, 1))
    .toEqual({ path: [0], divisions: [1], value: 1 });
}); */
/*

describe('merge', () => {
  test('without collisions', () => {
    expect(Rhythm.merge([1], [0])).toEqual([1]);
    expect(Rhythm.merge([0], [1])).toEqual([1]);
    expect(Rhythm.merge([1], [0, 1])).toEqual([1, 1]);
    expect(Rhythm.merge([1, 0], [0, 1])).toEqual([1, 1]);
    expect(Rhythm.merge([1], [0, 0, 0, 1])).toEqual([1, 0, 0, 1]);
    expect(Rhythm.merge<number>([[1, 1]], [0, 0, 0, 1])).toEqual([[1, 1], 0, 0, 1]);
    expect(Rhythm.merge<number>([[0, 1]], [[1, 1], 0, 0, 1])).toEqual([[1, 1], 0, 0, 1]);
    expect(Rhythm.merge<number>([[0, 1]], [[1, 0], 0, 0, 1])).toEqual([[1, 1], 0, 0, 1]);
    expect(Rhythm.merge([1], [0, 0, 0, 0])).toEqual([1, 0, 0, 0]);
    expect(Rhythm.merge<number>([[1, 1], [1, 1]], [0, 0, 0, 0], [1])).toEqual([0, [1, 1], [1, 1], 0]);
  });

  test('at path', () => {
    expect(Rhythm.merge([1], [0, 0, 0, 0], [0])).toEqual([1, 0, 0, 0]);
    expect(Rhythm.merge([1], [0, 0, 0, 0], [1])).toEqual([0, 1, 0, 0]);
    expect(Rhythm.merge([1], [0, 0, 0, 0], [2])).toEqual([0, 0, 1, 0]);
    expect(Rhythm.merge([1], [0, 0, 0, 0], [3])).toEqual([0, 0, 0, 1]);
  });

  test('with collisions', () => {

    expect(Rhythm.merge<number>([[0, 1], 1], [1, 0, 1, 0], [2])).toEqual([1, 0, [0, 1], 1]);
    expect(Rhythm.merge<number>([[0, 1]], [1])).toEqual([[0, 1]]);
    expect(Rhythm.merge<number>([[0, 1], 1], [1, 0, 1, 0], [2])).toEqual([1, 0, [0, 1], 1]);

  });
  test('overflow', () => {
    expect(Rhythm.merge<number>([1], [0], [1])).toEqual([0, 1]);
    expect(Rhythm.merge([1], [0, 0, 0, 0], [4])).toEqual([0, 0, 0, 0, 1]);
    expect(Rhythm.merge<number>([[1]], [[0]], [1])).toEqual([[0], [1]]);

    expect(Rhythm.merge<number>(
      [[1, 1, 1, 1]],
      [[0, 0, 0, 0]],
      [1])).toEqual([[0, 0, 0, 0], [1, 1, 1, 1]]);

    expect(Rhythm.merge<number>([[0, 1]], [[1]], [1])).toEqual([[1], [0, 1]]);
    expect(Rhythm.merge<number>([[2], [3]], [[1]], [1])).toEqual([[1], [2], [3]]);

    expect(Rhythm.merge<number>([[0, 1], 1, 2, 3, 4], [1, 2, 3, 4], [3]))
      .toEqual([1, 2, 3, [0, 1], 1, 2, 3, 4]);
  });

  test('nested overflow', () => {
    expect(Rhythm.merge<number>([[0, 0, 0, 4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0]))
      .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
    expect(Rhythm.merge<number>([[0, 0, 0, 4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0]))
      .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
    // expect(Rhythm.merge<number>([[4, 1, 2, 3, 4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0]))
    //   .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);

    // expect(Rhythm.merge<number>([[4], [1, 2, 3, 4]], [[1, 2, 3, 0]], [0, 3]))
    //   .toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
  })

});

describe('insert', () => {
  test('default', () => {
    expect(Rhythm.insert([1, 2, 3, 4], [[0, 0]])).toEqual([[1, 2], [3, 4]]);
    expect(Rhythm.insert([3, 4, 5, 6], [[1, 2, 0]], 2)).toEqual([[1, 2, 3], [4, 5, 6]]);
  })
  test('nested overflow', () => {
    expect(Rhythm.insert([4, 1, 2, 3, 4], [[1, 2, 3, 0]], 3)).toEqual([[1, 2, 3, 4], [1, 2, 3, 4]]);
  })
}); */ 
