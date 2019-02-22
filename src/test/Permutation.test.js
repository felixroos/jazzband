"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Permutation_1 = require("../util/Permutation");
var Voicing_1 = require("../harmony/Voicing");
var tonal_1 = require("tonal");
test('binomial', function () {
    expect(Permutation_1.Permutation.binomial([1, 2, 3, 4], 3)).toEqual([
        [1, 2, 3],
        [1, 2, 4],
        [1, 3, 4],
        [2, 3, 4],
    ]);
    expect(Permutation_1.Permutation.binomial([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 3],
    ]);
});
test('Permutation.permutateArray', function () {
    expect(Permutation_1.Permutation.permutateArray([1, 2])).toEqual([
        [1, 2],
        [2, 1]
    ]);
    expect(Permutation_1.Permutation.permutateArray([1, 2, 3])).toEqual([[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]);
    expect(Permutation_1.Permutation.permutateArray(["C", "E", "G", "B"]).length).toBe(24);
    expect(Permutation_1.Permutation.permutateArray(["C", "E", "G", "B", "D"]).length).toBe(120);
});
// c(n) = c(n-1) * n + n
test('Permutation.permutationComplexity', function () {
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'E', 'G'], Voicing_1.Voicing.voicingValidator())).toBe(12);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#'], Voicing_1.Voicing.voicingValidator())).toBe(372);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'D', 'E', 'F', 'G', 'A', 'B'], Voicing_1.Voicing.voicingValidator())).toBe(1187);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'Eb', 'Gb', 'A'], Voicing_1.Voicing.voicingValidator())).toBe(44);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'D', 'F', 'G'], Voicing_1.Voicing.voicingValidator())).toBe(29);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'Eb', 'G', 'Bb'], Voicing_1.Voicing.voicingValidator())).toBe(33);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'E', 'G', 'B', 'D'], Voicing_1.Voicing.voicingValidator())).toBe(86);
    expect(Permutation_1.Permutation.permutationComplexity(['C', 'D', 'E', 'F'], Voicing_1.Voicing.voicingValidator())).toBe(23);
});
test('Permutation.permutateElements, getVoicingCombinations', function () {
    function validateRule7(path, next, array) {
        return Voicing_1.Voicing.validateInterval(function (interval) { return tonal_1.Interval.semitones(interval) <= 6; })(path, next, array);
    }
    expect(Permutation_1.Permutation.permutateElements(["C", "E", "G", "B"], validateRule7)).toEqual([["C", "E", "G", "B"], ["E", "G", "B", "C"], ["G", "B", "C", "E"], ["B", "C", "E", "G"], ["B", "E", "G", "C"]]);
    function validateRules75(path, next, array) {
        return Permutation_1.Permutation.combineValidators(Voicing_1.Voicing.validateInterval(function (interval) { return tonal_1.Interval.semitones(interval) <= 6; }), Voicing_1.Voicing.validateInterval(function (interval, _a) {
            var array = _a.array;
            return array.length !== 1 || tonal_1.Interval.semitones(interval) > 2;
        }))(path, next, array);
    }
    expect(Permutation_1.Permutation.permutateElements(["C", "E", "G", "B"], validateRules75)).toEqual([["C", "E", "G", "B"], ["G", "B", "C", "E"], ["B", "C", "E", "G"], ["B", "E", "G", "C"]]);
    expect(Permutation_1.Permutation.permutateElements(["C", "E", "G", "B"], Voicing_1.Voicing.voicingValidator())).toEqual([["C", "E", "G", "B"], ["G", "B", "C", "E"], ["B", "E", "G", "C"]]);
    expect(Permutation_1.Permutation.permutateElements(['D', 'F', 'A', 'C'], Voicing_1.Voicing.voicingValidator())).toEqual([["D", "F", "A", "C"], ["F", "A", "C", "D"], ["A", "C", "D", "F"], ["C", "F", "A", "D"]]);
    expect(Permutation_1.Permutation.permutationComplexity(['D', 'F', 'A', 'C'], Voicing_1.Voicing.voicingValidator())).toEqual(33);
});
