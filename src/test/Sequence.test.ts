import { Sequence } from '../sheet/Sequence';
import { Sheet } from '../sheet/Sheet';
import { Measure } from '../sheet/Measure';

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
  const events = Sheet.flatten([['C', '/'], ['F', '/', '/', 'Bb']], true);
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
  const events = Sheet.flatten([['C', 'F']], true);
  expect(
    events
      .map(e => ({ ...e, chord: e.value }))
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
  const events = Sheet.flatten([['C', 'F']], true);
  expect(
    events
      .map(e => ({ ...e, chord: e.value }))
      .reduce(Sequence.addTimeAndDuration(), [])
      .map(Sequence.addFermataToEnd({ fermataLength: 4 }))
      .map(Sequence.testEvents(['duration']))
  ).toEqual([
    { duration: 1 },
    { duration: 4 },
  ])
});

test('Sequence.addLatestOptions', () => {
  const events = Sheet.flatten([
    { chords: ['C-'], options: { pulses: 4 } }, // needs to be set to be not undefined..
    'F',
    { chords: ['Bb'], options: { pulses: 3 } },
    'Bb7'
  ], true);
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

/* test.only('Sequence.isPathBefore', () => {
  expect(Sequence.isPathBefore([1], [1, 0, 1])).toBe(true);
  expect(Sequence.isPathBefore([1, 0, 1], [1])).toBe(false);
  expect(Sequence.isPathBefore([1, 0, 1], [1, 0, 2])).toBe(true);
  expect(Sequence.isPathBefore([1, 0, 2], [1, 0, 1])).toBe(false);
}); */
