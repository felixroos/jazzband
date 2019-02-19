import { mapTree, flattenTree } from "../util/util";

const addDot = (string) => string + '.';

test('mapTree edge cases', () => {
    expect(mapTree([])).toEqual([]);
    expect(mapTree(1)).toEqual(1);
    expect(mapTree([1])).toEqual([1]);
    expect(mapTree([[1]])).toEqual([[1]]);
    expect(mapTree(['A'])).toEqual(['A']);
    expect(mapTree(null)).toEqual(null);
});

test('mapTree paths', () => {
    expect(mapTree(['A', 'B', 'C'], ((b, { path }) => path))).toEqual([[0], [1], [2]]);
    expect(mapTree(['A', ['B', 'C'], 'D'], ((b, { path }) => path))).toEqual([[0], [[1, 0], [1, 1]], [2]]);
});

test('mapTree fractions', () => {
    expect(mapTree(['A', 'B', 'C', 'D'], ((b, { fraction }) => fraction * 4))).toEqual([1, 1, 1, 1]);
    expect(mapTree(['A', 'B', ['C1', 'C2'], 'D'], ((b, { fraction }) => fraction * 4))).toEqual([1, 1, [.5, .5], 1]);
    expect(mapTree(['A', 'B', ['C1', ['C2', 'C3']], 'D'], ((b, { fraction, siblings }) => fraction * 4)))
        .toEqual([1, 1, [.5, [.25, .25]], 1]);
});

test('mapTree positions', () => {
    //expect(mapTree(['A', 'B', 'C', 'D'], ((b, { position }) => position))).toEqual([0, 1, 2, 3]);
    expect(mapTree(['A', ['B', 'B2'], 'C', 'D'], ((b, { position }) => position * 4)))
        .toEqual([0, [1, 1.5], 2, 3]);
});

test('mapTree siblings', () => {
    expect(mapTree(['A', 'B', 'C'], ((b, { siblings }) => siblings))).toEqual([[3], [3], [3]]);
    expect(mapTree(['A', ['B', 'C'], 'D'], ((b, { siblings }) => siblings))).toEqual([[3], [[3, 2], [3, 2]], [3]]);
});

test('mapTree simplify', () => {
    expect(mapTree(1, (b) => b, true)).toEqual(1);
    expect(mapTree([1], (b) => b, true)).toEqual(1);
    expect(mapTree([[1]], (b) => b, true)).toEqual(1);
    expect(mapTree([[[1]]], (b) => b, true)).toEqual(1);
    expect(mapTree([[0], 1], b => b, true)).toEqual([0, 1]);
    expect(mapTree([[0], [1, 0]], b => b, true)).toEqual([0, [1, 0]]);
    expect(mapTree([[0], 1], (b, { path }) => path, true)).toEqual([[0], [1]]);
});


test('mapTree no modifier', () => {
    expect(mapTree(['A'])).toEqual(['A']);
    expect(mapTree(['A'])).toEqual(['A']);
    expect(mapTree(['A', 'B', 'C'])).toEqual(['A', 'B', 'C']);
    expect(mapTree(['A', ['B1', 'B2'], 'C'])).toEqual(['A', ['B1', 'B2'], 'C']);
});

test('mapTree with modifier', () => {
    expect(mapTree(['A'], addDot)).toEqual(['A.']);
    expect(mapTree(['A', 'B', 'C'], addDot)).toEqual(['A.', 'B.', 'C.']);
    expect(mapTree(['A', ['B1', 'B2'], 'C'], addDot)).toEqual(['A.', ['B1.', 'B2.'], 'C.']);
});

test('flattenTree', () => {
    expect(flattenTree(['A', ['B', 'C']]).map(item => item.value)).toEqual(['A', 'B', 'C']);
    expect(flattenTree(['A', ['B', 'C']]).map(item => item.fraction * 2)).toEqual([1, .5, .5]);
    expect(flattenTree(['A', ['B', 'C']]).map(item => item.position * 2)).toEqual([0, 1, 1.5]);
})