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
    var build = function(level) {
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
