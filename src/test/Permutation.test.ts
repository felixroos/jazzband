import { Permutation } from '../util/Permutation';
import { Voicing } from '../harmony/Voicing';
import { Interval } from 'tonal';

test('binomial', () => {
    expect(Permutation.binomial([1, 2, 3, 4], 3)).toEqual([
        [1, 2, 3],
        [1, 2, 4],
        [1, 3, 4],
        [2, 3, 4],
    ]);
    expect(Permutation.binomial([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 3],
    ]);
});


test('Permutation.permutateArray', () => {
    expect(Permutation.permutateArray([1, 2])).toEqual([
        [1, 2],
        [2, 1]
    ]);
    expect(Permutation.permutateArray([1, 2, 3])).toEqual(
        [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
    );
    expect(Permutation.permutateArray(["C", "E", "G", "B"]).length).toBe(24);
    expect(Permutation.permutateArray(["C", "E", "G", "B", "D"]).length).toBe(120);
});

// c(n) = c(n-1) * n + n
test('Permutation.permutationComplexity', () => {
    expect(Permutation.permutationComplexity(['C', 'E', 'G'], Voicing.voicingValidator())).toBe(12);
    expect(Permutation.permutationComplexity(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#'], Voicing.voicingValidator())).toBe(372);
    expect(Permutation.permutationComplexity(['C', 'D', 'E', 'F', 'G', 'A', 'B'], Voicing.voicingValidator())).toBe(1187);
    expect(Permutation.permutationComplexity(['C', 'Eb', 'Gb', 'A'], Voicing.voicingValidator())).toBe(44);
    expect(Permutation.permutationComplexity(['C', 'D', 'F', 'G'], Voicing.voicingValidator())).toBe(29);
    expect(Permutation.permutationComplexity(['C', 'Eb', 'G', 'Bb'], Voicing.voicingValidator())).toBe(33);
    expect(Permutation.permutationComplexity(['C', 'E', 'G', 'B', 'D'], Voicing.voicingValidator())).toBe(86);
    expect(Permutation.permutationComplexity(['C', 'D', 'E', 'F'], Voicing.voicingValidator())).toBe(23);
});

test('Permutation.permutateElements, getVoicingCombinations', () => {

    function validateRule7(path, next, array) {
        return Voicing.validateInterval(interval => Interval.semitones(interval) <= 6)(path, next, array)
    }

    expect(Permutation.permutateElements(["C", "E", "G", "B"], validateRule7)).toEqual(
        [["C", "E", "G", "B"], ["E", "G", "B", "C"], ["G", "B", "C", "E"], ["B", "C", "E", "G"], ["B", "E", "G", "C"]]
    );

    function validateRules75(path, next, array) {
        return Permutation.combineValidators(
            Voicing.validateInterval(interval => Interval.semitones(interval) <= 6),
            Voicing.validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) > 2)
        )(path, next, array)
    }

    expect(Permutation.permutateElements(["C", "E", "G", "B"], validateRules75)).toEqual(
        [["C", "E", "G", "B"], ["G", "B", "C", "E"], ["B", "C", "E", "G"], ["B", "E", "G", "C"]]
    );

    expect(Permutation.permutateElements(["C", "E", "G", "B"], Voicing.voicingValidator())).toEqual(
        [["C", "E", "G", "B"], ["G", "B", "C", "E"], ["B", "E", "G", "C"]]
    );

    expect(Permutation.permutateElements(['D', 'F', 'A', 'C'], Voicing.voicingValidator())).toEqual(
        [["D", "F", "A", "C"], ["F", "A", "C", "D"], ["A", "C", "D", "F"], ["C", "F", "A", "D"]]
    );

    expect(Permutation.permutationComplexity(['D', 'F', 'A', 'C'], Voicing.voicingValidator())).toEqual(33);
});