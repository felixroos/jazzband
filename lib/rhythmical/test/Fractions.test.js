"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fractions_1 = require("../Fractions");
describe('Fractions', function () {
    test('gcd', function () {
        expect(Fractions_1.Fractions.gcd(12, 980)).toEqual(4);
        expect(Fractions_1.Fractions.gcd(2, 8)).toEqual(2);
        expect(Fractions_1.Fractions.gcd(3, 2)).toEqual(1);
    });
    test('lcm', function () {
        expect(Fractions_1.Fractions.lcm(3, 2)).toEqual(6);
        expect(Fractions_1.Fractions.lcm(2, 4)).toEqual(4);
        expect(Fractions_1.Fractions.lcm(4, 6)).toEqual(12);
    });
    test('setDivisor', function () {
        expect(Fractions_1.Fractions.setDivisor([1, 2], 4)).toEqual([2, 4]);
        expect(Fractions_1.Fractions.setDivisor([3, 4], 8)).toEqual([6, 8]);
    });
    test('add', function () {
        expect(Fractions_1.Fractions.add([0, 1], [1, 2])).toEqual([1, 2]);
        expect(Fractions_1.Fractions.add([1, 4], [1, 8])).toEqual([3, 8]);
        expect(Fractions_1.Fractions.add([1, 4], [2, 8])).toEqual([1, 2]);
        expect(Fractions_1.Fractions.add([1, 4], [2, 8], false)).toEqual([4, 8]);
        expect(Fractions_1.Fractions.add([3, 4], [1, 8])).toEqual([7, 8]);
        expect(Fractions_1.Fractions.add([1, 3], [1, 2])).toEqual([5, 6]);
    });
    test('cancel', function () {
        expect(Fractions_1.Fractions.cancel([2, 8])).toEqual([1, 4]);
        expect(Fractions_1.Fractions.cancel([12, 24])).toEqual([1, 2]);
    });
});
