import { Permutation, PathSolver } from '../util/Permutation';
import { Voicing } from '../harmony/Voicing';
import { Interval } from 'tonal';

test('binomial', () => {
  expect(Permutation.binomial([1, 2, 3, 4], 3)).toEqual([
    [1, 2, 3],
    [1, 2, 4],
    [1, 3, 4],
    [2, 3, 4]
  ]);
  expect(Permutation.binomial([1, 2, 3], 2)).toEqual([[1, 2], [1, 3], [2, 3]]);
});

test('Permutation.permutateArray', () => {
  expect(Permutation.permutateArray([1, 2])).toEqual([[1, 2], [2, 1]]);
  expect(Permutation.permutateArray([1, 2, 3])).toEqual([
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1]
  ]);
  expect(Permutation.permutateArray(['C', 'E', 'G', 'B']).length).toBe(24);
  expect(Permutation.permutateArray(['C', 'E', 'G', 'B', 'D']).length).toBe(
    120
  );
});

// c(n) = c(n-1) * n + n
test('Permutation.permutationComplexity', () => {
  expect(
    Permutation.permutationComplexity(
      ['C', 'E', 'G'],
      Voicing.voicingValidator()
    )
  ).toBe(12);
  expect(
    Permutation.permutationComplexity(
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#'],
      Voicing.voicingValidator()
    )
  ).toBe(372);
  expect(
    Permutation.permutationComplexity(
      ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      Voicing.voicingValidator()
    )
  ).toBe(1187);
  expect(
    Permutation.permutationComplexity(
      ['C', 'Eb', 'Gb', 'A'],
      Voicing.voicingValidator()
    )
  ).toBe(44);
  expect(
    Permutation.permutationComplexity(
      ['C', 'D', 'F', 'G'],
      Voicing.voicingValidator()
    )
  ).toBe(29);
  expect(
    Permutation.permutationComplexity(
      ['C', 'Eb', 'G', 'Bb'],
      Voicing.voicingValidator()
    )
  ).toBe(33);
  expect(
    Permutation.permutationComplexity(
      ['C', 'E', 'G', 'B', 'D'],
      Voicing.voicingValidator()
    )
  ).toBe(86);
  expect(
    Permutation.permutationComplexity(
      ['C', 'D', 'E', 'F'],
      Voicing.voicingValidator()
    )
  ).toBe(23);
});

test('lotto', () => {

  const lottoNumbers = Array(49)
    .fill(0)
    .map((_, i) => i + 1);

  expect(Permutation.urn(lottoNumbers, 6, true, true, 1)).toEqual([
    [1, 2, 3, 4, 5, 6]
  ]);
});

test('validate', () => {
  const names = ['Clementine', 'Max', 'Camilla', 'Tom', 'Cleo'];
  function min(characters) {
    return name => name.length >= characters;
  }
  function startsWith(character) {
    return name => name[0] === character;
  }
  const longNamesWithC = names.filter(
    Permutation.validate([min(5), startsWith('C')])
  );
  expect(longNamesWithC).toEqual(['Clementine', 'Camilla']);
})
test('urn', () => {

  const balls = [1, 2, 3];
  expect(Permutation.urn(balls)).toEqual([
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1],
  ]);

  expect(Permutation.urn(balls, 2)).toEqual([
    [1, 2],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 2],
  ]);

  expect(Permutation.isEqual([1, 2, 3], [3, 2, 1])).toEqual(true);
  expect(Permutation.isEqual([1, 3], [2, 1])).toEqual(false);

  expect(Permutation.urn(balls, 2, false)).toEqual([
    [1, 2],
    [1, 3],
    [2, 3],
  ]);

  expect(Permutation.urn(balls, 2, false, false)).toEqual([
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 2],
    [2, 3],
    [3, 3],
  ]);

  expect(Permutation.urn(balls, 2, false, false, 3)).toEqual([
    [1, 1],
    [1, 2],
    [1, 3],
  ]);
});

test('Voicing.search', () => {
  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 4, minNotes: 4, unique: false/* , bottomNotes: ['D'] */ })
  ).toEqual([
    ['D', 'F', 'A', 'D'],
    ['F', 'A', 'D', 'F'],
    ['A', 'D', 'F', 'A']
  ]
  );

  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 2, minNotes: 2, unique: true })
  ).toEqual([
    ['D', 'F'],
    ['F', 'A'],
    ['A', 'D'],
  ]
  );

  expect(
    Voicing.search(['D', 'F', 'A'], { maxDistance: 7, maxNotes: 2, minNotes: 2, unique: true })
  ).toEqual([
    ['D', 'F'],
    ['D', 'A'],
    ['F', 'A'],
    ['A', 'D'],
  ]
  );
})

test('permutate', () => {

  expect(Permutation.possibleHands([7, 8, 9, 10], 2))
    .toEqual([
      [7, 8],
      [7, 9],
      [7, 10],
      [8, 9],
      [8, 10],
      [9, 10],
    ]);

  const twoRooks = Permutation.rooks(2);
  expect(twoRooks.solutions)
    .toEqual([
      [0, 1],
      [1, 0],
    ]);
  expect(twoRooks.runs).toEqual(4);

  const threeRooks = Permutation.rooks(3);
  expect(threeRooks.solutions)
    .toEqual([
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ]);
  expect(threeRooks.runs).toEqual(15)

  /* const randomRook = Permutation.randomRook(3);
  expect(randomRook)
    .toEqual([]); */

  expect(
    Permutation.permutate(['C', 'E', 'G'],
      [
        Permutation.filter.max(2), Permutation.filter.noRepeat()
      ],
      [
        Permutation.validator.min(2)
      ])
  ).toEqual([
    ["C", "E",],
    ["C", "G",],
    ["E", "C",],
    ["E", "G",],
    ["G", "C",],
    ["G", "E",],
  ]);

  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 4, minNotes: 4, unique: false })
  ).toEqual([
    ['D', 'F', 'A', 'D'],
    ['F', 'A', 'D', 'F'],
    ['A', 'D', 'F', 'A']
  ]
  );

  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 4, minNotes: 3, unique: false })
  ).toEqual([
    ['D', 'F', 'A'],
    ['D', 'F', 'A', 'D'],
    ['F', 'A', 'D'],
    ['F', 'A', 'D', 'F'],
    ['A', 'D', 'F'],
    ['A', 'D', 'F', 'A']
  ]);

  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 4, minNotes: 3, unique: true })
  ).toEqual([
    ['D', 'F', 'A'],
    ['F', 'A', 'D'],
    ['A', 'D', 'F'],
  ]);

  expect(
    Permutation.permutate(['C', 'E', 'G'],
      [
        Permutation.filter.max(2),
        (path) => !path.length || path[0] === 'C'
      ],
      [
        Permutation.validator.min(2)
      ])
  ).toEqual([
    ["C", "C"],
    ["C", "E"],
    ["C", "G"],
  ]);

  expect(
    Permutation.permutate(['C', 'E', 'G'],
      [
        Permutation.filter.max(3),
        Permutation.filter.noRepeat(),
      ],
      [
        Permutation.validator.min(2)
      ])
  ).toEqual([
    ['C', 'E'],
    ['C', 'E', 'C'],
    ['C', 'E', 'G'],
    ['C', 'G'],
    ['C', 'G', 'C'],
    ['C', 'G', 'E'],
    ['E', 'C'],
    ['E', 'C', 'E'],
    ['E', 'C', 'G'],
    ['E', 'G'],
    ['E', 'G', 'C'],
    ['E', 'G', 'E'],
    ['G', 'C'],
    ['G', 'C', 'E'],
    ['G', 'C', 'G'],
    ['G', 'E'],
    ['G', 'E', 'C'],
    ['G', 'E', 'G']
  ]);
})

test('Permutation.permutateElements, getVoicingCombinations', () => {
  function validateRule7(path, next, array) {
    return Voicing.validateInterval(
      interval => Interval.semitones(interval) <= 6
    )(path, next, array);
  }

  /* expect(
    Permutation.permutateElements2(['C', 'E', 'G'], [maxItems(2), noRepeat])
  ).toEqual([
    ['C', 'E', 'G'],
    ['C', 'G', 'E'],
  ]); */

  expect(
    Permutation.permutateElements(['C', 'E', 'G', 'B'], validateRule7)
  ).toEqual([
    ['C', 'E', 'G', 'B'],
    ['E', 'G', 'B', 'C'],
    ['G', 'B', 'C', 'E'],
    ['B', 'C', 'E', 'G'],
    ['B', 'E', 'G', 'C']
  ]);

  function validateRules75(path, next, array) {
    return Permutation.combineValidators(
      Voicing.validateInterval(interval => Interval.semitones(interval) <= 6),
      Voicing.validateInterval(
        (interval, { array }) =>
          array.length !== 1 || Interval.semitones(interval) > 2
      )
    )(path, next, array);
  }

  expect(
    Permutation.permutateElements(['C', 'E', 'G', 'B'], validateRules75)
  ).toEqual([
    ['C', 'E', 'G', 'B'],
    ['G', 'B', 'C', 'E'],
    ['B', 'C', 'E', 'G'],
    ['B', 'E', 'G', 'C']
  ]);

  expect(
    Permutation.permutateElements(
      ['C', 'E', 'G', 'B'],
      Voicing.voicingValidator()
    )
  ).toEqual([['C', 'E', 'G', 'B'], ['G', 'B', 'C', 'E'], ['B', 'E', 'G', 'C']]);

  expect(
    Permutation.permutateElements(
      ['D', 'F', 'A', 'C'],
      Voicing.voicingValidator()
    )
  ).toEqual([
    ['D', 'F', 'A', 'C'],
    ['F', 'A', 'C', 'D'],
    ['A', 'C', 'D', 'F'],
    ['C', 'F', 'A', 'D']
  ]);

  expect(
    Permutation.permutationComplexity(
      ['D', 'F', 'A', 'C'],
      Voicing.voicingValidator()
    )
  ).toEqual(33);
});
