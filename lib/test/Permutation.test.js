"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Permutation_1 = require("../Permutation");
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
