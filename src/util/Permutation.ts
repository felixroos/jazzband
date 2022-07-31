import { sort } from 'shelljs';

export declare type ConstraintFilter<T> = (path: T[], candidate?: T) => boolean;
export declare type PathValidator<T> = (path: T[], solution?) => boolean;
export declare type PathSolver<T> = (path: T[], candidate: T) => T[][];
export declare type RoadFinder<T> = (path: T[]) => T[];


export class Permutation {
  static permutateElements(array, validate?, path = []) {
    const isValid = next => !validate || validate(path, next, array);
    if (array.length === 1) {
      return isValid(array[0]) ? array : [];
    }
    return array
      .filter(isValid)
      .reduce(
        (combinations, el) => [
          ...combinations,
          ...Permutation.permutateElements(
            array.filter(e => e !== el),
            validate,
            path.concat([el])
          ).map(subcombinations => [el, ...subcombinations])
        ],
        []
      );
  }

  static filter: { [key: string]: (...args) => ConstraintFilter<any> } = {
    max: (max) => (path, next) => {
      return path.length < max;
    },
    unique: () => (path, next) => {
      return !path.includes(next);
    },
    noRepeat: () => (path, next) => {
      return path[path.length - 1] !== next;
    }
  }

  static collector = {
    maxItems: (n) => (items) => (collected, solutions) => {
      n = n || items.length;
      return collected.length >= n ? [] : items
    },
    unique: (active = true) => (items) => (collected, solutions) => {
      return active ? items.filter(item => !collected.includes(item)) : items
    },
    maxSolutions: (number?) => (items) => (collected, solutions) => {
      return number !== undefined && solutions.length >= number ? [] : items;
    },
    validate: (validators: ((...args) => boolean)[]) => (items) => (collected, solutions) => {
      return items.filter(Permutation.validate(validators))
    }
  }

  static validator: { [key: string]: (...args) => PathValidator<any> } = {
    min: (min) => (path) => {
      return path.length >= min;
    },
    sample: (number) => (path) => {
      return path.length === number;
    },
    strictOrder: (active = true, equalityFn = Permutation.isEqual) => {
      return (path, solutions) =>
        active || !solutions.find(solution => equalityFn(path, solution));
    }
  }

  static validate(filters: ((...args) => boolean)[]) {
    return (...args) => filters.reduce(
      (result, filter) => result && filter(...args), true
    );
  }

  static isEqual(collectionA, collectionB) {
    return collectionA.sort().join('-') === collectionB.sort().join('-');
  }

  static collect<T>(items, collectors: ((items: T[]) => (collected, solutions) => T[])[]) {
    return (path, solutions) => {
      return collectors.reduce((filtered, collector) => collector(filtered)(path, solutions), items)
    }
  }

  static urn(items, number = items.length, strictOrder = true, unique = true, maxSolutions?) {
    return Permutation.search(
      Permutation.collect(items,
        [
          Permutation.collector.maxSolutions(maxSolutions),
          Permutation.collector.maxItems(number),
          Permutation.collector.unique(unique),
        ]),
      Permutation.validate([
        Permutation.validator.sample(number),
        Permutation.validator.strictOrder(strictOrder)
      ])
    )
  }


  static permutate_old<T>(
    items: T[],
    constraints: ConstraintFilter<T>[] = [
      Permutation.filter.max(items.length),
      Permutation.filter.unique(),
    ],
    validators: PathValidator<T>[] = [
      Permutation.validator.min(items.length)
    ],
    concatFn = (_path: T[], _candidate: T): T[] => [..._path, _candidate],
    path: T[] = []
  ): T[][] {
    const candidates = constraints.reduce((filtered, constraint) =>
      filtered.filter((candidate) => constraint(path, candidate))
      , [...items]);
    if (!candidates.length) {
      return [path];
    }
    return candidates.reduce((solutions, candidate) => [
      ...solutions,
      path,
      ...Permutation.permutate_old(items, constraints, validators, concatFn, concatFn(path, candidate))
    ], []).filter(
      (permutation, index, permutations) => validators.reduce(
        (valid, validator) => valid && validator(permutation), true
      )
    )
  }


  static search<T>(
    collector: (path: T[], solutions: T[][]) => T[],
    validator: (path: T[], solutions: T[][]) => boolean,
    concatFn = (_path: T[], _candidate: T): T[] => [..._path, _candidate],
    path: T[] = [],
    solutions: T[][] = []
  ): T[][] {
    // get candidates for current path
    let candidates = collector(path, solutions);
    // runs current path through validator to either get a new solution or nothing
    if (validator(path, solutions)) {
      solutions.push(path);
    }
    // if no candidates found, we cannot go deeper => either solution or dead end
    if (!candidates.length) {
      return solutions;
    }
    let c = -1;
    while (++c < candidates.length) {
      solutions = Permutation.search(collector, validator, concatFn, concatFn(path, candidates[c]), solutions);
      candidates = collector(path, solutions);
    }
    return solutions;
    // go deeper
    //return candidates.reduce((_, candidate) => Permutation.search(collector, validator, concatFn, concatFn(path, candidate), solutions), []);
  }

  static possibleHands(stash: number[], cards: number) {
    return Permutation.search<number>(
      (picked) => stash.filter(card => !picked.includes(card)),
      (hand, hands) => hand.length === cards && !hands.find((h) => h.join('+') === hand.join('+')),
      (hand, card) => [...hand, card].sort((a, b) => a - b)
    )
  }

  static rooks(n) {
    const positions = Array(n).fill(0).map((_, i) => i);
    let runs = 0;
    const solutions = Permutation.search<number>(
      (picked) => positions.filter((i) => !picked.includes(i)),
      (hand, hands) => hand.length === n,
      (positions, position) => {
        runs += 1;
        return [...positions, position];
      }
    )
    return { solutions, runs };
  }

  static randomRook(n) {
    const positions = Array(n).fill(0).map((_, i) => i);
    return Permutation.search<number>(
      (picked, solutions) => solutions.length ? [] : positions.filter((i) => !picked.includes(i)),
      (hand, hands) => hand.length === n,
      (positions, position) => Math.random() > 0.5 ? [...positions, position] : [position, ...positions]
    )
  }

  static permutate<T>(
    items: T[],
    constraints: ConstraintFilter<T>[] = [
      Permutation.filter.max(items.length),
      Permutation.filter.unique(),
    ],
    validators: PathValidator<T>[] = [
      Permutation.validator.min(items.length)
    ],
    concatFn = (_path: T[], _candidate: T): T[] => [..._path, _candidate],
    path: T[] = []
  ) {
    return Permutation.search(
      (path: T[]) => items.filter(
        Permutation.validate(
          constraints.map(constraint => (candidate) => constraint(path, candidate))
        )
      ), Permutation.validate(validators)
    );
  }

  static permutationComplexity(array, validate?, path = []) {
    let validations = 0;
    Permutation.permutateElements(
      array,
      (path, next, array) => {
        ++validations;
        return !validate || validate(path, next, array);
      },
      path
    );
    return validations;
  }

  static permutateArray(array) {
    if (array.length === 1) {
      return array;
    }
    return array.reduce(
      (combinations, el) => [
        ...combinations,
        ...Permutation.permutateArray(array.filter(e => e !== el)).map(
          subcombinations => [el, ...subcombinations]
        )
      ],
      []
    );
  }

  // combine multiple validators
  static combineValidators(...validators: ((path, next, array) => boolean)[]) {
    return (path, next, array) =>
      validators.reduce(
        (result, validator) => result && validator(path, next, array),
        true
      );
  }

  //https://stackoverflow.com/questions/9960908/permutations-in-javascript
  static combinations(array) {
    var length = array.length,
      result = [array.slice()],
      c = new Array(length).fill(0),
      i = 1,
      k,
      p;

    while (i < length) {
      if (c[i] < i) {
        k = i % 2 && c[i];
        p = array[i];
        array[i] = array[k];
        array[k] = p;
        ++c[i];
        i = 1;
        result.push(array.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }
    return result;
  }

  // https://gist.github.com/axelpale/3118596
  static binomial(set, k): Array<any[]> {
    var i, j, combs, head, tailcombs;

    // There is no way to take e.g. sets of 5 elements from
    // a set of 4.
    if (k > set.length || k <= 0) {
      return [];
    }

    // K-sized set has only one K-sized subset.
    if (k == set.length) {
      return [set];
    }

    // There is N 1-sized subsets in a N-sized set.
    if (k == 1) {
      combs = [];
      for (i = 0; i < set.length; i++) {
        combs.push([set[i]]);
      }
      return combs;
    }

    // Assert {1 < k < set.length}

    // Algorithm description:
    // To get k-combinations of a set, we want to join each element
    // with all (k-1)-combinations of the other elements. The set of
    // these k-sized sets would be the desired result. However, as we
    // represent sets with lists, we need to take duplicates into
    // account. To avoid producing duplicates and also unnecessary
    // computing, we use the following approach: each element i
    // divides the list into three: the preceding elements, the
    // current element i, and the subsequent elements. For the first
    // element, the list of preceding elements is empty. For element i,
    // we compute the (k-1)-computations of the subsequent elements,
    // join each with the element i, and store the joined to the set of
    // computed k-combinations. We do not need to take the preceding
    // elements into account, because they have already been the i:th
    // element so they are already computed and stored. When the length
    // of the subsequent list drops below (k-1), we cannot find any
    // (k-1)-combs, hence the upper limit for the iteration:
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
      // head is a list that includes only our current element.
      head = set.slice(i, i + 1);
      // We take smaller combinations from the subsequent elements
      tailcombs = Permutation.binomial(set.slice(i + 1), k - 1);
      // For each (k-1)-combination we join it with the current
      // and store it to the set of k-combinations.
      for (j = 0; j < tailcombs.length; j++) {
        combs.push(head.concat(tailcombs[j]));
      }
    }
    return combs;
  }

  static bjorklund(steps, pulses) {
    steps = Math.round(steps);
    pulses = Math.round(pulses);

    if (pulses > steps || pulses == 0 || steps == 0) {
      return new Array();
    }

    const pattern = [];
    const counts = [];
    const remainders = [];
    let divisor = steps - pulses;
    let level = 0;
    remainders.push(pulses);

    while (true) {
      counts.push(Math.floor(divisor / remainders[level]));
      remainders.push(divisor % remainders[level]);
      divisor = remainders[level];
      level += 1;
      if (remainders[level] <= 1) {
        break;
      }
    }

    counts.push(divisor);

    var r = 0;
    var build = function (level) {
      r++;
      if (level > -1) {
        for (var i = 0; i < counts[level]; i++) {
          build(level - 1);
        }
        if (remainders[level] != 0) {
          build(level - 2);
        }
      } else if (level == -1) {
        pattern.push(0);
      } else if (level == -2) {
        pattern.push(1);
      }
    };

    build(level);
    return pattern.reverse();
  }
}
