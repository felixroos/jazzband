import { Sequence } from '../player/Sequence';
import { Sheet } from '../sheet/Sheet';

test('Sequence.fraction', () => {
  expect(Sequence.fraction([2, 2])).toEqual(0.25)
  expect(Sequence.fraction([1, 4])).toEqual(0.25)
  expect(Sequence.fraction([1, 1])).toEqual(1)
});

test('Sequence.time', () => {
  expect(Sequence.time([2, 2], [0, 1])).toEqual(0.25)
  expect(Sequence.time([2, 2], [1, 0])).toEqual(0.5)
  expect(Sequence.time([1, 4], [0, 3])).toEqual(0.75)
  expect(Sequence.time([1, 1], [0, 0])).toEqual(0);
  expect(Sequence.time([1, 1], [0])).toEqual(NaN); // bad 
});

test('Sequence.simplePath', () => {
  expect(Sequence.simplePath([1, 0])).toEqual('1');
  expect(Sequence.simplePath([0, 1])).toEqual('0.1');
  expect(Sequence.simplePath([1, 0, 1])).toEqual('1.0.1');
  expect(Sequence.simplePath([1, 0, 0, 1])).toEqual('1.0.0.1');
  expect(Sequence.simplePath([0, 0, 0, 1])).toEqual('0.0.0.1');
  expect(Sequence.simplePath([0, 0, 1])).toEqual('0.0.1');
  expect(Sequence.simplePath([0])).toEqual('0');
  expect(Sequence.simplePath([20])).toEqual('20');
  expect(Sequence.simplePath([20, 0])).toEqual('20');
});

test('Sequence.getSignType', () => {
  expect(Sequence.getSignType('/')).toBe('prolong');
  expect(Sequence.getSignType('e5')).toBe(undefined);
});

test('Sequence.getOptions', () => {
  expect(Sequence.getOptions({})).toEqual({ bpm: 120 });
  expect(Sequence.getOptions({ bpm: 80 })).toEqual({ bpm: 80 });
});

test('Sequence.prolongNotes', () => {
  const events = Sheet.flatEvents([['C', '/'], ['F', '/', '/', 'Bb']]);
  const withTime = events.reduce(Sequence.addTimeAndDuration(), []);
  expect(withTime
    .map(Sequence.testEvents(['duration', 'time', 'value']))
  ).toEqual(
    [
      { time: 0, duration: 1, value: 'C', },
      { time: 1, duration: 1, value: '/', },
      { time: 2, duration: 0.5, value: 'F', },
      { time: 2.5, duration: 0.5, value: '/', },
      { time: 3, duration: 0.5, value: '/', },
      { time: 3.5, duration: 0.5, value: 'Bb', },
    ]
  );
  expect(
    withTime
      .reduce(Sequence.prolongNotes(), [])
      .map(Sequence.testEvents(['duration', 'time', 'value']))
  ).toEqual(
    [
      { time: 0, duration: 2, value: 'C', },
      { time: 2, duration: 1.5, value: 'F', },
      { time: 3.5, duration: 0.5, value: 'Bb', },
    ]
  );
});

test('Sequence.renderVoicings', () => {
  const events = Sheet.flatEvents([['C', 'F']]);
  expect(
    events
      .map(e => ({ ...e, type: 'chord' }))
      .reduce(Sequence.addLatestOptions(), [])
      .reduce(Sequence.addTimeAndDuration(), [])
      .reduce(Sequence.renderVoicings({ voicings: { range: ['C3', 'C5'] } }), [])
      .map(Sequence.testEvents(['value', 'time']))
  ).toEqual([
    { value: 'E3', time: 0 },
    { value: 'G3', time: 0 },
    { value: 'C4', time: 0 },
    { value: 'F3', time: 1 },
    { value: 'A3', time: 1 },
    { value: 'C4', time: 1 },
  ])
});

test('Sequence.addFermataToEnd', () => {
  const events = Sheet.flatEvents(['C', 'F']);
  expect(
    events
      .map(e => ({ ...e, chord: e.value }))
      .reduce(Sequence.addTimeAndDuration(), [])
      .map(Sequence.addFermataToEnd({ fermataLength: 2 }))
      .map(Sequence.testEvents(['duration']))
  ).toEqual([
    { duration: 2 },
    { duration: 4 },
  ])
});

test('Sequence.addLatestOptions', () => {
  const events = Sheet.flatEvents([
    { chords: ['C-'], options: { pulses: 4 } }, // needs to be set to be not undefined..
    'F',
    { chords: ['Bb'], options: { pulses: 3 } },
    'Bb7'
  ]);
  expect(
    events
      .reduce(Sequence.addTimeAndDuration(), [])
      .reduce(Sequence.addLatestOptions(), [])
      .map(Sequence.testEvents(['options']))
      .map(({ options }) => options.pulses)
  ).toEqual([4, 4, 3, 3])
})

test('Sequence.renderMeasures', () => {
  expect(
    Sequence.renderMeasures([['A', 'B'], ['C']]).map(e =>
      Sequence.simplePath(e.path)
    )
  ).toEqual(['0', '0.1', '1']);
});


test('Sequence.isOverlapping', () => {
  const abcd = { time: 0, duration: 4, path: [], value: '' };
  const a = { time: 0, duration: 1, path: [], value: '' };
  const b = { time: 1, duration: 1, path: [], value: '' };
  const d = { time: 3, duration: 1, path: [], value: '' };
  const ab = { time: 0, duration: 2, path: [], value: '' };
  const bd = { time: 1, duration: 3, path: [], value: '' };
  const bc = { time: 1, duration: 2, path: [], value: '' };
  const cd = { time: 2, duration: 2, path: [], value: '' };

  expect(Sequence.isBefore(a, b)).toBe(true);
  expect(Sequence.isBefore(b, a)).toBe(false);
  expect(Sequence.isAfter(b, a)).toBe(true);
  expect(Sequence.isAfter(a, b)).toBe(false);

  expect(Sequence.isOverlapping(ab, bc)).toBe(true);
  expect(Sequence.isOverlapping(a, d)).toBe(false);
  expect(Sequence.isOverlapping(ab, cd)).toBe(false);
  expect(Sequence.isOverlapping(cd, bc)).toBe(true);
  expect(Sequence.isOverlapping(abcd, bc)).toBe(true);

  expect(Sequence.isInside(bd, abcd)).toBe(true);
  expect(Sequence.isInside(a, cd)).toBe(false);
  expect(Sequence.isInside(cd, bc)).toBe(false);


});

test('addPaths', () => {
  expect(Sequence.addPaths([1, 0], [0, 1])).toEqual([1, 1]);
  expect(Sequence.addPaths([1, 1], [0, 1])).toEqual([1, 2]);
  expect(Sequence.addPaths([0, 0], [0, 1])).toEqual([0, 1]);
  expect(Sequence.addPaths([0], [0, 1])).toEqual([0, 1]);
  expect(Sequence.addPaths([0, 1], [1])).toEqual([1, 1]);
  expect(Sequence.addPaths([1], [1, 1])).toEqual([2, 1]);
})

test('insertGroove', () => {
  const events = Sequence.renderMeasures([['A'], ['B', 'C']]);
  const oneTwo = Sequence.insertGrooves([[1, 2]], events, ({ target, source }) => {
    return {
      ...target,
      value: source.value + '-' + target.value
    }
  });
  expect(
    oneTwo.map(Sequence.testEvents(['value'])).map(e => e.value)
  ).toEqual(['A-1', 'A-2', 'B-1', 'C-1']);
  expect(
    oneTwo.map(Sequence.testEvents(['path'])).map(e => Sequence.simplePath(e.path))
  ).toEqual(['0', '0.1', '1', '1.1']);
})
/* test.only('Sequence.isPathBefore', () => {
  expect(Sequence.isPathBefore([1], [1, 0, 1])).toBe(true);
  expect(Sequence.isPathBefore([1, 0, 1], [1])).toBe(false);
  expect(Sequence.isPathBefore([1, 0, 1], [1, 0, 2])).toBe(true);
  expect(Sequence.isPathBefore([1, 0, 2], [1, 0, 1])).toBe(false);
}); */
