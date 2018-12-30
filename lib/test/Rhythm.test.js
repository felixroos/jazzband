"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var addDot = function (string) { return string + '.'; };
test('mapTree edge cases', function () {
    expect(util_1.mapTree([])).toEqual([]);
    expect(util_1.mapTree(1)).toEqual(1);
    expect(util_1.mapTree([1])).toEqual([1]);
    expect(util_1.mapTree([[1]])).toEqual([[1]]);
    expect(util_1.mapTree(['A'])).toEqual(['A']);
    expect(util_1.mapTree(null)).toEqual(null);
});
test('mapTree paths', function () {
    expect(util_1.mapTree(['A', 'B', 'C'], (function (b, _a) {
        var path = _a.path;
        return path;
    }))).toEqual([[0], [1], [2]]);
    expect(util_1.mapTree(['A', ['B', 'C'], 'D'], (function (b, _a) {
        var path = _a.path;
        return path;
    }))).toEqual([[0], [[1, 0], [1, 1]], [2]]);
});
test('mapTree fractions', function () {
    expect(util_1.mapTree(['A', 'B', 'C', 'D'], (function (b, _a) {
        var fraction = _a.fraction;
        return fraction * 4;
    }))).toEqual([1, 1, 1, 1]);
    expect(util_1.mapTree(['A', 'B', ['C1', 'C2'], 'D'], (function (b, _a) {
        var fraction = _a.fraction;
        return fraction * 4;
    }))).toEqual([1, 1, [.5, .5], 1]);
    expect(util_1.mapTree(['A', 'B', ['C1', ['C2', 'C3']], 'D'], (function (b, _a) {
        var fraction = _a.fraction, siblings = _a.siblings;
        return fraction * 4;
    })))
        .toEqual([1, 1, [.5, [.25, .25]], 1]);
});
test('mapTree positions', function () {
    //expect(mapTree(['A', 'B', 'C', 'D'], ((b, { position }) => position))).toEqual([0, 1, 2, 3]);
    expect(util_1.mapTree(['A', ['B', 'B2'], 'C', 'D'], (function (b, _a) {
        var position = _a.position;
        return position * 4;
    })))
        .toEqual([0, [1, 1.5], 2, 3]);
});
test('mapTree siblings', function () {
    expect(util_1.mapTree(['A', 'B', 'C'], (function (b, _a) {
        var siblings = _a.siblings;
        return siblings;
    }))).toEqual([[3], [3], [3]]);
    expect(util_1.mapTree(['A', ['B', 'C'], 'D'], (function (b, _a) {
        var siblings = _a.siblings;
        return siblings;
    }))).toEqual([[3], [[3, 2], [3, 2]], [3]]);
});
test('mapTree simplify', function () {
    expect(util_1.mapTree(1, function (b) { return b; }, true)).toEqual(1);
    expect(util_1.mapTree([1], function (b) { return b; }, true)).toEqual(1);
    expect(util_1.mapTree([[1]], function (b) { return b; }, true)).toEqual(1);
    expect(util_1.mapTree([[[1]]], function (b) { return b; }, true)).toEqual(1);
    expect(util_1.mapTree([[0], 1], function (b) { return b; }, true)).toEqual([0, 1]);
    expect(util_1.mapTree([[0], [1, 0]], function (b) { return b; }, true)).toEqual([0, [1, 0]]);
    expect(util_1.mapTree([[0], 1], function (b, _a) {
        var path = _a.path;
        return path;
    }, true)).toEqual([[0], [1]]);
});
test('mapTree no modifier', function () {
    expect(util_1.mapTree(['A'])).toEqual(['A']);
    expect(util_1.mapTree(['A'])).toEqual(['A']);
    expect(util_1.mapTree(['A', 'B', 'C'])).toEqual(['A', 'B', 'C']);
    expect(util_1.mapTree(['A', ['B1', 'B2'], 'C'])).toEqual(['A', ['B1', 'B2'], 'C']);
});
test('mapTree with modifier', function () {
    expect(util_1.mapTree(['A'], addDot)).toEqual(['A.']);
    expect(util_1.mapTree(['A', 'B', 'C'], addDot)).toEqual(['A.', 'B.', 'C.']);
    expect(util_1.mapTree(['A', ['B1', 'B2'], 'C'], addDot)).toEqual(['A.', ['B1.', 'B2.'], 'C.']);
});
test('flattenTree', function () {
    expect(util_1.flattenTree(['A', ['B', 'C']]).map(function (item) { return item.value; })).toEqual(['A', 'B', 'C']);
    expect(util_1.flattenTree(['A', ['B', 'C']]).map(function (item) { return item.fraction * 2; })).toEqual([1, .5, .5]);
    expect(util_1.flattenTree(['A', ['B', 'C']]).map(function (item) { return item.position * 2; })).toEqual([0, 1, 1.5]);
});
