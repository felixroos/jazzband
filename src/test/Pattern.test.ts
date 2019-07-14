import { Pattern } from '../util/Pattern';
import { Scale, Note } from 'tonal';

const nf = Pattern.testFormat;

test('scale', () => {
  expect(Pattern.scale('C major', [1, 3, 5])).toEqual(['C', 'E', 'G']);
  expect(Pattern.scale('C major', [1, 3, 5], ['C2', 'C3'])).toEqual([
    'C2',
    'E2',
    'G2'
  ]);
});

test('traverse', () => {
  expect(Pattern.traverse(3, 0)).toEqual([0]); // stops immediatly
  expect(Pattern.traverse(3, 1)).toEqual([0, 1, 2]); // default order => one by another
  expect(Pattern.traverse(3, 1, 1)).toEqual([1, 2, 0]); // default order, starting from index 1
  expect(Pattern.traverse(3, 2)).toEqual([0, 2, 1]); // skip every other index
  expect(Pattern.traverse(4, 2)).toEqual([0, 2]); // skip every other index with even number => not all numbers are represented
  expect(Pattern.traverse(4, 2, 1)).toEqual([1, 3]); // different start
  /* 
  expect(Pattern.traverse(3, 1, 0, 1)).toEqual([0]); // max 1
  expect(Pattern.traverse(3, 1, 0, 2)).toEqual([0, 1]); // max 2
  expect(Pattern.traverse(3, 1, 0, 3)).toEqual([0, 1, 2]); // max 3
  expect(Pattern.traverse(3, 1, 0, 4)).toEqual([0, 1, 2, 0]); // max 4 */
});

test('shuffleArray', () => {
  const a = ['A', 'B', 'C'];
  expect(Pattern.traverseArray(a, 0)).toEqual(['A']);
  expect(Pattern.traverseArray(a, 1)).toEqual(['A', 'B', 'C']);
  expect(Pattern.traverseArray(a, 2)).toEqual(['A', 'C', 'B']);
  expect(Pattern.traverseArray(a, 3)).toEqual(['A']);
  expect(Pattern.traverseArray(a, 2)).toEqual(['A', 'C', 'B']);
  expect(Pattern.traverseArray(a, 2, 1)).toEqual(['B', 'A', 'C']);
  expect(Pattern.traverseArray(a.concat(['D']), 3)).toEqual([
    'A',
    'D',
    'C',
    'B'
  ]);

  const chromatic = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B'
  ];
  const major = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const pentatonic = ['C', 'Eb', 'F', 'G', 'Bb'];
  expect(Pattern.traverseArray(chromatic, 2)).toEqual([
    'C',
    'D',
    'E',
    'Gb',
    'Ab',
    'Bb'
  ]); // GT / 2M stack
  expect(Pattern.traverseArray(chromatic, 3)).toEqual(['C', 'Eb', 'Gb', 'A']); // dim7 / 3m stack
  expect(Pattern.traverseArray(chromatic, 4)).toEqual(['C', 'E', 'Ab']); // aug / 3M stack))
  expect(Pattern.traverseArray(chromatic, 5)).toEqual([
    'C',
    'F',
    'Bb',
    'Eb',
    'Ab',
    'Db',
    'Gb',
    'B',
    'E',
    'A',
    'D',
    'G'
  ]); // circle of 4ths))
  expect(Pattern.traverseArray(chromatic, 6)).toEqual(['C', 'Gb']); // tritone)/
  expect(Pattern.traverseArray(chromatic, 7)).toEqual([
    'C',
    'G',
    'D',
    'A',
    'E',
    'B',
    'Gb',
    'Db',
    'Ab',
    'Eb',
    'Bb',
    'F'
  ]); // circle of 5ths))
  expect(Pattern.traverseArray(chromatic, 8)).toEqual(['C', 'Ab', 'E']); // aug down / 6m stack))
  expect(Pattern.traverseArray(chromatic, 9)).toEqual(['C', 'A', 'Gb', 'Eb']); // dim7 down / 6M stack))
  expect(Pattern.traverseArray(chromatic, 10)).toEqual([
    'C',
    'Bb',
    'Ab',
    'Gb',
    'E',
    'D'
  ]); // GT down / 7m stack))
  expect(Pattern.traverseArray(major, 2)).toEqual([
    'C',
    'E',
    'G',
    'B',
    'D',
    'F',
    'A'
  ]); // thirds
  expect(Pattern.traverseArray(major, 3)).toEqual([
    'C',
    'F',
    'B',
    'E',
    'A',
    'D',
    'G'
  ]); // fourths
  expect(Pattern.traverseArray(major, 4)).toEqual([
    'C',
    'G',
    'D',
    'A',
    'E',
    'B',
    'F'
  ]); // fifths
  expect(Pattern.traverseArray(major, 5)).toEqual([
    'C',
    'A',
    'F',
    'D',
    'B',
    'G',
    'E'
  ]); // sixths
  expect(Pattern.traverseArray(major, 6)).toEqual([
    'C',
    'B',
    'A',
    'G',
    'F',
    'E',
    'D'
  ]); // sevenths
  expect(Pattern.traverseArray(pentatonic, 2)).toEqual([
    'C',
    'F',
    'Bb',
    'Eb',
    'G'
  ]); // every second
  expect(Pattern.traverseArray(pentatonic, 3)).toEqual([
    'C',
    'G',
    'Eb',
    'Bb',
    'F'
  ]); // every third
  expect(Pattern.traverseArray(pentatonic, 4)).toEqual([
    'C',
    'Bb',
    'G',
    'F',
    'Eb'
  ]); // every fourth
});

test('flatArray', () => {
  expect(Pattern.flat([1, 2, 3])).toEqual([1, 2, 3]);
  expect(Pattern.flat([1, [2, 0], 3])).toEqual([1, 2, 0, 3]);
});

test('nestIndices', () => {
  expect(Pattern.nestIndices([0, 1, 2], [0, 2, 4])).toEqual([
    [0, 2, 4],
    [1, 3, 5],
    [2, 4, 6]
  ]);

  expect(Pattern.nestIndices([0, 1], [0, 1], [0, 1])).toEqual([
    [0, 1],
    [1, 2],
    [1, 2],
    [2, 3]
  ]);

  expect(Pattern.nestIndices([0, 1, 2], [0, 1, 2], [0, 1, 2])).toEqual([
    [0, 1, 2],
    [1, 2, 3],
    [2, 3, 4],
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
    [2, 3, 4],
    [3, 4, 5],
    [4, 5, 6]
  ]);
});

test('getNested', () => {
  expect(
    Pattern.getNested(Scale.notes('C major'), [1, 2, 3, 2], [5, 3])
  ).toEqual([['G', 'E'], ['A', 'F'], ['B', 'G'], ['A', 'F']]);
  expect(
    Pattern.getNested(Scale.notes('F mixolydian'), [1, 2, 3, 2], [5, 3])
  ).toEqual([['C', 'A'], ['D', 'Bb'], ['Eb', 'C'], ['D', 'Bb']]);

  expect(
    nf(Pattern.getNested(Scale.notes('C major'), [1, 3, 5], [1, 3, 5]))
  ).toEqual('C E G E G B G B D');
});

test('traverseNested', () => {
  const cMajor = Scale.notes('C major');
  const fMajor = Scale.notes('F major');
  const cMinorPenetatonic = Scale.notes('C minor pentatonic');
  const chromatic = Note.names(' b');
  expect(nf(Pattern.traverseNested(fMajor, [1]))).toEqual('F G A Bb C D E');
  expect(nf(Pattern.traverseNested(cMajor, [1, 3]))).toEqual(
    'C E D F E G F A G B A C B D'
  );
  expect(nf(Pattern.traverseNested(chromatic, [1, 5], 2))).toEqual(
    'C E D Gb E Ab Gb Bb Ab C Bb D'
  );
  expect(nf(Pattern.traverseNested(cMinorPenetatonic, [1, 3], 1))).toEqual(
    'C F Eb G F Bb G C Bb Eb'
  );
  expect(nf(Pattern.traverseNested(cMajor, [1, 3], 1))).toEqual(
    'C E D F E G F A G B A C B D'
  );
  expect(nf(Pattern.traverseNested(cMajor, [1, 3, 5], 0))).toEqual('C E G');
  expect(nf(Pattern.traverseNested(cMajor, [2, 4, 6], 0))).toEqual('D F A');
  expect(nf(Pattern.traverseNested(cMajor, [1, 3, 5], 0, 1))).toEqual('D F A');
  expect(nf(Pattern.traverseNested(cMajor, [1, 3, 5], 1))).toEqual(
    'C E G D F A E G B F A C G B D A C E B D F'
  );
  expect(nf(Pattern.traverseNested(cMajor, [1, 3, 5], 3))).toEqual(
    'C E G F A C B D F E G B A C E D F A G B D'
  );
  expect(nf(Pattern.traverseNested(cMajor, [1, 2, 3, 1], 1))).toEqual(
    'C D E C D E F D E F G E F G A F G A B G A B C A B C D B'
  );
});

/*

  /*
  const penrose = ([min, max], step = 1) => (s, i) => {
    return ((s[i] + step) % (max - min + 1)) + min;
  };

  const penroseSequence = ([min, max], step) => {
    return Pattern.rangeSequence(penrose([min, max], step), [min, max]);
  }; */

// with default values
// expect(penroseSequence([1, 8], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
// expect(penroseSequence([1, 8], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
// backwards
/* expect(penroseSequence(-1, 8), 8, -1, 8), [1, 8])).toEqual([
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1
  ]); */
// higher steps
/*  expect(Pattern.rangeSequence(penrose([1, 8], 1, 2), [1, 8])).toEqual([
    1,
    3,
    5,
    7,
    1,
    3,
    5,
    7
  ]);
  expect(Pattern.rangeSequence(penrose([1, 7], 1, 3, 8), [1, 8])).toEqual([
    1,
    4,
    7,
    3,
    6,
    2,
    5,
    1
  ]);
  // higher length than max => loops
  expect(Pattern.rangeSequence(penrose([1, 4], 1, 1, 8), [1, 8])).toEqual([
    1,
    2,
    3,
    4,
    1,
    2,
    3,
    4
  ]);
  // start from different positions
  expect(Pattern.rangeSequence(penrose([1, 4], 2, 1, 8), [1, 8])).toEqual([
    2,
    3,
    4,
    1,
    2,
    3,
    4,
    1
  ]);
  expect(Pattern.rangeSequence(penrose([1, 4], 4, 1, 8), [1, 8])).toEqual([
    4,
    1,
    2,
    3,
    4,
    1,
    2,
    3
  ]);
  // different ranges
  expect(Pattern.rangeSequence(penrose([0, 3], 1, 1, 8), [1, 8])).toEqual([
    1,
    2,
    3,
    0,
    1,
    2,
    3,
    0
  ]);
  expect(Pattern.rangeSequence(penrose([1, 2], 1, 1, 8), [1, 8])).toEqual([
    1,
    2,
    1,
    2,
    1,
    2,
    1,
    2
  ]); */
