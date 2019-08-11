
import { Rhythm, RhythmEvent, TimedEvent } from '../Rhythm';


test('Rhythm.duration', () => {
  expect(Rhythm.duration([2, 2])).toEqual(0.25)
  expect(Rhythm.duration([1, 4])).toEqual(0.25)
  expect(Rhythm.duration([1, 1])).toEqual(1);
  expect(Rhythm.duration([4, 2], 4)).toEqual(0.5);
  expect(Rhythm.duration([4, 3], 4)).toEqual(1 / 3);
});

test('Rhythm.time', () => {
  expect(Rhythm.time([2, 2], [0, 1])).toEqual(0.25)
  expect(Rhythm.time([2, 2], [1, 0])).toEqual(0.5)
  expect(Rhythm.time([1, 4], [0, 3])).toEqual(0.75)
  expect(Rhythm.time([1, 1], [0, 0])).toEqual(0);
  expect(Rhythm.time([1, 1], [0])).toEqual(NaN); // bad
  expect(Rhythm.time([4, 3], [1, 0], 4)).toEqual(1);
});

test('Rythm.calculate', () => {
  const calculated =
    Rhythm.flatten([1, [0, 3], 0, 1]).map(Rhythm.calculate(4));
  expect(
    calculated
      .map(({ value, time, duration }) => ({ value, time, duration }))
  ).toEqual(
    [
      { value: 1, time: 0, duration: 1 },
      { value: 0, time: 1, duration: 0.5 },
      { value: 3, time: 1.5, duration: 0.5 },
      { value: 0, time: 2, duration: 1 },
      { value: 1, time: 3, duration: 1 }
    ]
  );
  const withDuration = [
    { time: 0, duration: 1 },
    { time: 1, duration: 0 },
    { time: 1.5, duration: 1.5 },
    { time: 2, duration: 0 },
    { time: 3, duration: 1 }
  ];
  expect(calculated.map(({ time, duration, value }: TimedEvent<number>) => ({
    time,
    duration: value * duration
  }))).toEqual(withDuration)

  expect(calculated.map(Rhythm.useValueAsDuration)
    .map(({ time, duration }) => ({ time, duration })))
    .toEqual(withDuration)

  expect(Rhythm.render(['C7', 'F7'], 4)
    .map(e => e.duration)).toEqual([2, 2]);
})


test('Rhythm.simplePath', () => {
  expect(Rhythm.simplePath([1, 0])).toEqual('1');
  expect(Rhythm.simplePath([0, 1])).toEqual('0.1');
  expect(Rhythm.simplePath([1, 0, 1])).toEqual('1.0.1');
  expect(Rhythm.simplePath([1, 0, 0, 1])).toEqual('1.0.0.1');
  expect(Rhythm.simplePath([0, 0, 0, 1])).toEqual('0.0.0.1');
  expect(Rhythm.simplePath([0, 0, 1])).toEqual('0.0.1');
  expect(Rhythm.simplePath([0])).toEqual('0');
  expect(Rhythm.simplePath([20])).toEqual('20');
  expect(Rhythm.simplePath([20, 0])).toEqual('20');
});


test('addPaths', () => {
  expect(Rhythm.addPaths([1, 0], [0, 1])).toEqual([1, 1]);
  expect(Rhythm.addPaths([1, 1], [0, 1])).toEqual([1, 2]);
  expect(Rhythm.addPaths([0, 0], [0, 1])).toEqual([0, 1]);
  expect(Rhythm.addPaths([0], [0, 1])).toEqual([0, 1]);
  expect(Rhythm.addPaths([0, 1], [1])).toEqual([1, 1]);
  expect(Rhythm.addPaths([1], [1, 1])).toEqual([2, 1]);
})

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

test('Rhythm.getPath', () => {
  expect(Rhythm.getPath(['C'], 0)).toBe('C');
  expect(Rhythm.getPath([['C']], 0)).toEqual('C');
  expect(Rhythm.getPath(['C', 'D', 'E'], 1)).toBe('D');
  expect(Rhythm.getPath(['C', ['D1', 'D2'], 'E'], 1)).toEqual('D1');
  expect(Rhythm.getPath(['C', ['D1', 'D2'], 'E'], [1, 1])).toEqual('D2');
  expect(Rhythm.getPath(['C', ['D1', 'D2'], 'E'], [1, 1, 0])).toEqual('D2');
});

test('nest', () => {
  expect(
    Rhythm.nest([
      { value: 2, divisions: [4, 4], path: [0, 0] },
      { value: 2, divisions: [4, 4], path: [0, 2] },
      { value: 2, divisions: [4, 4], path: [1, 0] },
      { value: 2, divisions: [4, 4], path: [1, 2] },
      { value: 2, divisions: [4], path: [2] }
    ], 0
    )).toEqual(
      [[2, 0, 2, 0], [2, 0, 2, 0], 2, 0]
    );

  expect(
    Rhythm.nest([
      { value: 'C', path: [0], divisions: [2] },
      { value: 'D', path: [1, 0], divisions: [2, 1] }]
      , '')
  ).toEqual(['C', ['D']]);
  expect(
    Rhythm.nest([
      { value: 'C', path: [0], divisions: [2] },
      { value: 'D', path: [1, 0], divisions: [2, 2] },
      { value: 'E', path: [1, 1], divisions: [2, 2] }
    ], '')
  ).toEqual(['C', ['D', 'E']]);
  expect(
    Rhythm.nest([
      { value: 'C', path: [0], divisions: [3] },
      { value: 'D', path: [1, 0], divisions: [3, 2] },
      { value: 'E', path: [1, 1], divisions: [3, 2] },
      { value: 'F', path: [2], divisions: [3] }
    ], '')
  ).toEqual(['C', ['D', 'E'], 'F']);

  expect(
    Rhythm.nest([
      { value: 'C', path: [0], divisions: [3] },
      { value: 'D', path: [1, 0], divisions: [3, 3] },
      { value: 'D1', path: [1, 1, 0], divisions: [3, 3, 2] },
      { value: 'D2', path: [1, 1, 1], divisions: [3, 3, 2] },
      { value: 'E', path: [1, 2], divisions: [3, 3] },
      { value: 'F', path: [2], divisions: [3] }
    ], '')
  ).toEqual(['C', ['D', ['D1', 'D2'], 'E'], 'F']);

  expect(
    Rhythm.nest([
      { value: 'C', path: [1], divisions: [3] },
      { value: 'D', path: [2, 0], divisions: [3, 1] }
    ], '-')
  ).toEqual(['-', 'C', ['D']]);

  expect(
    Rhythm.nest([
      { value: 'C', path: [1], divisions: [4] },
      { value: 'D', path: [3, 1], divisions: [4, 2] }
    ], '/')
  ).toEqual(['/', 'C', '/', ['/', 'D']]);

  expect(
    Rhythm.nest(
      [{ value: 2, divisions: [4, 3], path: [0, 0] },
      { value: 2, divisions: [4, 3], path: [0, 2] },
      { value: 2, divisions: [4, 3], path: [1, 1] },
      { value: 2, divisions: [4], path: [2] }]
    )
  ).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);

  expect(
    Rhythm.nest(
      [{ value: 2, divisions: [4, 3], path: [0, 0] },
      { value: 2, divisions: [4, 3], path: [0, 2] },
      { value: 2, divisions: [4, 3], path: [1, 1] },
      { value: 2, divisions: [4], path: [2] }]
    )
  ).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
})

test('pathOf', () => {
  expect(Rhythm.pathOf('C', ['A', ['B', 'C']])).toEqual([1, 1]);
  expect(Rhythm.pathOf('D', ['A', ['B', 'C']])).toEqual(undefined);
  expect(Rhythm.nextValue(['A', ['B', 'C']], 'A')).toEqual('B');
  expect(Rhythm.nextValue(['A', ['B', 'C']], 'B')).toEqual('C');
  expect(Rhythm.nextValue(['A', ['B', 'C']], 'C')).toEqual('A');
  // expect(Rhythm.nextValue(['A', ['B', 'C']], 'C', false)).toEqual(undefined);
  expect(Rhythm.nextPath(['A', ['B', 'C']])).toEqual([0]);
  expect(Rhythm.nextPath(['A', ['B', 'C']], [0])).toEqual([1, 0]);
  expect(Rhythm.nextPath(['A', ['B', 'C']], [1, 0])).toEqual([1, 1]);
  expect(Rhythm.nextPath(['A', ['B', 'C']], [1, 1])).toEqual([0]);
  // expect(Rhythm.nextPath(['A', ['B', 'C']], [1, 1], false)).toEqual(undefined);
});

test('multiply', () => {
  /* expect(Rhythm.multiply([1, [1, 1]])).toEqual([2, 0, [1], [1]]) */
  expect(Rhythm.multiplyDivisions([2, 2], 2)).toEqual([4, 2]);
  expect(Rhythm.multiplyPath([0, 0], [4, 2], 2)).toEqual([0, 0]);
  expect(Rhythm.multiplyPath([0, 1], [4, 2], 2)).toEqual([1, 0]);
  expect(Rhythm.multiplyPath([1, 0], [4, 2], 2)).toEqual([2, 0]);
  expect(Rhythm.multiplyPath([1, 1], [4, 2], 2)).toEqual([3, 0]);


  expect(Rhythm.multiply([0, 1], 2)).toEqual([0, 0, 2, 0]);
  expect(Rhythm.multiply([1, 1, 1], 2)).toEqual([2, 0, 2, 0, 2, 0]);
  expect(Rhythm.multiply([[1, 1]], 2)).toEqual([[2, 0], [2, 0]]);
  expect(Rhythm.multiply([1, [1, 1]], 2)).toEqual([2, 0, [2, 0], [2, 0]]);
  expect(Rhythm.multiply([[1, 1], 1], 2)).toEqual([[2, 0], [2, 0], 2, 0]);
  expect(Rhythm.multiply([[1, 1], 1, 1], 2)).toEqual([[2, 0], [2, 0], 2, 0, 2, 0]);
  expect(Rhythm.multiply([[1, 1, 1, 1], 1], 2)).toEqual([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0]);
  expect(Rhythm.multiply([[1, 1, 1, 1], 1, 1], 2)).toEqual([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0, 2, 0]);
  expect(Rhythm.multiply([1, [1, 1, 1, 1]], 2)).toEqual([2, 0, [2, 0, 2, 0], [2, 0, 2, 0]]);

  expect(Rhythm.multiply([[1, 1], [1, 1]], 2)).toEqual([[2, 0], [2, 0], [2, 0], [2, 0]]);
  expect(Rhythm.multiply([[1, 1, 1], 1], 2)).toEqual([[2, 0, 2], [0, 2, 0], 2, 0]);
  expect(Rhythm.multiply([[1, 1, 1], 1, 1], 2)).toEqual([[2, 0, 2], [0, 2, 0], 2, 0, 2, 0]);
  expect(Rhythm.multiply([1], 3)).toEqual([3, 0, 0]);
  expect(Rhythm.multiply([[1], 1], 2)).toEqual([[2], 0, 2, 0]);

});

test('divide', () => {
  let rendered, divided;

  expect(Rhythm.divide([[2], 0, 2, 0], 2)).toEqual([[1], 1]);
  expect(Rhythm.divide([2, 0, 2, 0], 2)).toEqual([1, 1]);

  expect(Rhythm.divide([0, 0, 2, 0], 2)).toEqual([0, 1]);
  expect(Rhythm.divide([2, 0, 2, 0, 2, 0], 2)).toEqual([1, 1, 1]);

  /* rendered = Rhythm.render<number>([[2, 0], [2, 0]]);
  divided = Rhythm.divideEvents(rendered, 2);
  expect(divided).toEqual([]);

  expect(Rhythm.divide([[2, 0], [2, 0]], 2)).toEqual([[1, 1]]); */


  /* expect(Rhythm.divide([2, 0, [2, 0], [2, 0]], 2)).toEqual([1, [1, 1]]);
  expect(Rhythm.divide([[2, 0], [2, 0], 2, 0], 2)).toEqual([[1, 1], 1]);
  expect(Rhythm.divide([[2, 0], [2, 0], 2, 0, 2, 0], 2)).toEqual([[1, 1], 1, 1]);
  expect(Rhythm.divide([[2, 0, 2, 0], [2, 0, 2, 0], 2, 0], 2)).toEqual([[1, 1, 1, 1], 1]);

  rendered = Rhythm.render<number>([[2, 0, 2], [0, 2, 0], 2, 0, 2, 0]); */

  //  expect(Rhythm.divideEvents(rendered, 2)).toEqual([]);

  //expect(Rhythm.divide([[2, 0, 2], [0, 2, 0], 2, 0, 2, 0], 2)).toEqual([[1, 1, 1], 1, 1]);
})
