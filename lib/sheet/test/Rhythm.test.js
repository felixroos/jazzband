"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rhythm_1 = require("../Rhythm");
test('Rhythm.duration', function () {
    expect(Rhythm_1.Rhythm.duration([2, 2])).toEqual(0.25);
    expect(Rhythm_1.Rhythm.duration([1, 4])).toEqual(0.25);
    expect(Rhythm_1.Rhythm.duration([1, 1])).toEqual(1);
    expect(Rhythm_1.Rhythm.duration([4, 2], 4)).toEqual(0.5);
    expect(Rhythm_1.Rhythm.duration([4, 3], 4)).toEqual(1 / 3);
});
test('Rhythm.time', function () {
    expect(Rhythm_1.Rhythm.time([2, 2], [0, 1])).toEqual(0.25);
    expect(Rhythm_1.Rhythm.time([2, 2], [1, 0])).toEqual(0.5);
    expect(Rhythm_1.Rhythm.time([1, 4], [0, 3])).toEqual(0.75);
    expect(Rhythm_1.Rhythm.time([1, 1], [0, 0])).toEqual(0);
    expect(Rhythm_1.Rhythm.time([1, 1], [0])).toEqual(NaN); // bad
    expect(Rhythm_1.Rhythm.time([4, 3], [1, 0], 4)).toEqual(1);
});
test('Rythm.calculate', function () {
    expect(Rhythm_1.Rhythm.flatten([1, [0, 3], 0, 1])
        .map(Rhythm_1.Rhythm.calculate(4))
        .map(function (_a) {
        var time = _a.time, duration = _a.duration;
        return ({ time: time, duration: duration });
    })).toEqual([
        { "time": 0, "duration": 1 },
        { "time": 1, "duration": 0 },
        { "time": 1.5, "duration": 1.5 },
        { "time": 2, "duration": 0 },
        { "time": 3, "duration": 1 }
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
/*
test('Rhythm.flatten', () => {

  expect(Rhythm.flatten(['C'])).toEqual(['C']);
  expect(
    Rhythm.flatten([{ body: ['C'], section: 'A' }, { body: ['F'] }])
  ).toEqual([{ body: ['C'], section: 'A' }, { body: ['F'] }]);
  expect(Rhythm.flatten(['C'], true)).toEqual([
    { value: 'C', path: [0], divisions: [1] } //fraction: 1, position: 0
  ]);
  expect(Rhythm.flatten(['C', 'D'], true)).toEqual([
    { value: 'C', path: [0], divisions: [2] }, //fraction: 0.5, position: 0
    { value: 'D', path: [1], divisions: [2] } //fraction: 0.5, position: 0.5
  ]);
  expect(Rhythm.flatten(['C', ['D']])).toEqual(['C', 'D']);
  expect(Rhythm.flatten(['C', ['D', 'E'], 'F'])).toEqual(['C', 'D', 'E', 'F']);
  expect(Rhythm.flatten(['C', ['D', ['E', 'F']], 'G'])).toEqual([
    'C',
    'D',
    'E',
    'F',
    'G'
  ]);
  expect(Rhythm.flatten(['C', ['D']], true)).toEqual([
    { value: 'C', path: [0], divisions: [2] }, //fraction: 0.5, position: 0
    { value: 'D', path: [1, 0], divisions: [2, 1] } //fraction: 0.5, position: 0.5
  ]);
  expect(Rhythm.flatten(['C', ['D', 0]], true)).toEqual([
    { value: 'C', path: [0], divisions: [2] }, //fraction: 0.5, position: 0
    { value: 'D', path: [1, 0], divisions: [2, 2] }, //fraction: 0.25, position: 0.5
    { value: 0, path: [1, 1], divisions: [2, 2] }
  ]); //fraction: 0.25, position: 0.75 }]

  expect(
    Rhythm.flatten(['C', ['D', ['E', ['F', 'G']]], 'A', 'B'], true)
  ).toEqual([
    { value: 'C', path: [0], divisions: [4] }, //fraction: 0.25, position: 0
    { value: 'D', path: [1, 0], divisions: [4, 2] }, //fraction: 1 / 4 / 2, position: 0.25
    { value: 'E', path: [1, 1, 0], divisions: [4, 2, 2] }, //fraction: 1 / 4 / 2 / 2, position: 0.375
    { value: 'F', path: [1, 1, 1, 0], divisions: [4, 2, 2, 2] }, //fraction: 1 / 4 / 2 / 2 / 2, position: 0.4375
    { value: 'G', path: [1, 1, 1, 1], divisions: [4, 2, 2, 2] }, //fraction: 1 / 4 / 2 / 2 / 2, position: 0.46875
    { value: 'A', path: [2], divisions: [4] }, //fraction: 0.25, position: 0.5
    { value: 'B', path: [3], divisions: [4] } //fraction: 0.25, position: 0.75
  ]);
}); */
test('Rhythm.getPath', function () {
    expect(Rhythm_1.Rhythm.getPath(['C'], 0)).toBe('C');
    expect(Rhythm_1.Rhythm.getPath([['C']], 0)).toEqual('C');
    expect(Rhythm_1.Rhythm.getPath(['C', 'D', 'E'], 1)).toBe('D');
    expect(Rhythm_1.Rhythm.getPath(['C', ['D1', 'D2'], 'E'], 1)).toEqual('D1');
    expect(Rhythm_1.Rhythm.getPath(['C', ['D1', 'D2'], 'E'], [1, 1])).toEqual('D2');
    expect(Rhythm_1.Rhythm.getPath(['C', ['D1', 'D2'], 'E'], [1, 1, 0])).toEqual('D2');
});
test('Rhythm.expand', function () {
    expect(Rhythm_1.Rhythm.expand([{ value: 'C', path: [0] }, { value: 'D', path: [1, 0] }])).toEqual(['C', ['D']]);
    expect(Rhythm_1.Rhythm.expand([
        { value: 'C', path: [0] },
        { value: 'D', path: [1, 0] },
        { value: 'E', path: [1, 1] }
    ])).toEqual(['C', ['D', 'E']]);
    expect(Rhythm_1.Rhythm.expand([
        { value: 'C', path: [0] },
        { value: 'D', path: [1, 0] },
        { value: 'E', path: [1, 1] },
        { value: 'F', path: [2] }
    ])).toEqual(['C', ['D', 'E'], 'F']);
    expect(Rhythm_1.Rhythm.expand([
        { value: 'C', path: [0] },
        { value: 'D', path: [1, 0] },
        { value: 'E', path: [1, 1] },
        { value: 'F', path: [2] }
    ])).toEqual(['C', ['D', 'E'], 'F']);
    expect(Rhythm_1.Rhythm.expand([
        { value: 'C', path: [0] },
        { value: 'D', path: [1, 0] },
        { value: 'D1', path: [1, 1, 0] },
        { value: 'D2', path: [1, 1, 1] },
        { value: 'E', path: [1, 2] },
        { value: 'F', path: [2] }
    ])).toEqual(['C', ['D', ['D1', 'D2'], 'E'], 'F']);
    expect(Rhythm_1.Rhythm.expand([{ value: 'C', path: [1] }, { value: 'D', path: [2, 0] }])).toEqual([undefined, 'C', ['D']]);
    expect(Rhythm_1.Rhythm.expand([{ value: 'C', path: [1] }, { value: 'D', path: [3, 1] }])).toEqual([undefined, 'C', undefined, [undefined, 'D']]);
    expect(Rhythm_1.Rhythm.expand([{ value: 'C', path: [1] }, { value: 'D', path: [3, 1] }])).toEqual([undefined, 'C', undefined, [undefined, 'D']]);
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
