import { Numeric } from '../util/Numeric';

test('sequence', () => {
  const fibonacci = (s, i) => {
    if (i < 1) {
      return i + 1;
    }
    return s[i - 1] + s[i];
  };

  const linear = step => (s, i) => {
    return s[i] + step;
  };
  // emits numbers between zero and 8
  expect(Numeric.range(0, 8).sequence(fibonacci)).toEqual([
    0,
    1,
    1,
    2,
    3,
    5,
    8
  ]);

  // emits numbers between zero and 8
  expect(Numeric.range(0, 8).sequence(fibonacci)).toEqual([
    0,
    1,
    1,
    2,
    3,
    5,
    8
  ]);
  // emits 9 numbers of the sequence
  expect(Numeric.fixed(9).sequence(fibonacci)).toEqual([
    0,
    1,
    1,
    2,
    3,
    5,
    8,
    13,
    21
  ]);

  expect(Numeric.range(1, 4).sequence(linear(1))).toEqual([1, 2, 3, 4]);
  expect(Numeric.range(2, 4).sequence(linear(1))).toEqual([2, 3, 4]);
  expect(Numeric.range(1, 8).sequence(linear(2))).toEqual([1, 3, 5, 7]);
  expect(Numeric.range(1, 8).sequence(linear(3))).toEqual([1, 4, 7]);
  expect(Numeric.range(4, 1).sequence(linear(-1))).toEqual([4, 3, 2, 1]);

  const fix4 = Numeric.init(1).fixed(4);

  expect(fix4.sequence(linear(1))).toEqual([1, 2, 3, 4]);
  expect(fix4.sequence(linear(2))).toEqual([1, 3, 5, 7]);
  expect(fix4.sequence(linear(3))).toEqual([1, 4, 7, 10]);
});

test('modRange', () => {
  expect(Numeric.modRange(1, [1, 3])).toBe(1);
  expect(Numeric.modRange(2, [1, 3])).toBe(2);
  expect(Numeric.modRange(3, [1, 3])).toBe(3);
  expect(Numeric.modRange(4, [1, 3])).toBe(1);
  expect(Numeric.modRange(5, [1, 3])).toBe(2);
  expect(Numeric.modRange(6, [1, 3])).toBe(3);
  expect(Numeric.modRange(0, [1, 3])).toBe(3);
  expect(Numeric.modRange(-1, [1, 3])).toBe(2);
  expect(Numeric.modRange(-2, [1, 3])).toBe(1);
  expect(Numeric.modRange(-3, [1, 3])).toBe(3);
  expect(Numeric.modRange(-4, [1, 3])).toBe(2);
});

test('saw', () => {
  // array spelled
  expect(Numeric.fixed(4).sequence(Numeric.saw([1, 2], 1))).toEqual([
    1,
    2,
    1,
    2
  ]);
  // simplified number notation
  expect(Numeric.fixed(4).sequence(Numeric.saw(2, 1))).toEqual([1, 2, 1, 2]);
  // simplified number notation going down
  expect(Numeric.fixed(4).sequence(Numeric.saw(2, -1))).toEqual([2, 1, 2, 1]);
  expect(Numeric.fixed(6).sequence(Numeric.saw([1, 3], 1))).toEqual([
    1,
    2,
    3,
    1,
    2,
    3
  ]);
  expect(
    Numeric.fixed(6)
      .init([2])
      .sequence(Numeric.saw(3, 1))
  ).toEqual([2, 3, 1, 2, 3, 1]);
  expect(Numeric.fixed(6).sequence(Numeric.saw(3, 2))).toEqual([
    1,
    3,
    2,
    1,
    3,
    2
  ]);
  expect(Numeric.fixed(8).sequence(Numeric.saw(7, 3))).toEqual([
    1,
    4,
    7,
    3,
    6,
    2,
    5,
    1
  ]);
  expect(Numeric.fixed(8).sequence(Numeric.saw(7, 3))).toEqual([
    1,
    4,
    7,
    3,
    6,
    2,
    5,
    1
  ]);
  expect(Numeric.fixed(8).sequence(Numeric.saw(7, 3))).toEqual([
    1,
    4,
    7,
    3,
    6,
    2,
    5,
    1
  ]);
  expect(Numeric.fixed(8).sequence(Numeric.saw(8, -1))).toEqual([
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1
  ]);
  expect(Numeric.fixed(4).sequence(Numeric.saw(8, -2))).toEqual([8, 6, 4, 2]);
  expect(Numeric.fixed(8).sequence(Numeric.saw(8, -2))).toEqual([
    8,
    6,
    4,
    2,
    8,
    6,
    4,
    2
  ]);
  const saw8 = Numeric.fixed(8);
  expect(saw8.init(7).sequence(Numeric.saw(8, -2))).toEqual([
    7,
    5,
    3,
    1,
    7,
    5,
    3,
    1
  ]);
  expect(saw8.sequence(Numeric.saw(8, 2))).toEqual([1, 3, 5, 7, 1, 3, 5, 7]);
  expect(saw8.init(8).sequence(Numeric.saw([1, 7], -2))).toEqual([
    8,
    6,
    4,
    2,
    7,
    5,
    3,
    1
  ]);
  expect(saw8.init(8).sequence(Numeric.saw(7, -2))).toEqual([
    8,
    6,
    4,
    2,
    7,
    5,
    3,
    1
  ]); // start with number outside set!
  expect(Numeric.sequence(Numeric.saw(8, 2))).toEqual([1, 3, 5, 7]);
  expect(Numeric.sequence(Numeric.saw(8, 4))).toEqual([1, 5]);
  expect(Numeric.sequence(Numeric.saw(7, 3))).toEqual([1, 4, 7, 3, 6, 2, 5]);
});

test('triangle', () => {
  const fix8 = Numeric.fixed(8);
  expect(fix8.sequence(Numeric.triangle([1, 5], 1))).toEqual([
    1,
    2,
    3,
    4,
    5,
    4,
    3,
    2
  ]);
  expect(fix8.init(1).sequence(Numeric.triangle([1, 5]))).toEqual([
    1,
    2,
    3,
    4,
    5,
    4,
    3,
    2
  ]);
  expect(fix8.fixed(5).sequence(Numeric.triangle([1, 3]))).toEqual([
    1,
    2,
    3,
    2,
    1
  ]);
  expect(
    Numeric.fixed(5)
      .init(3)
      .sequence(Numeric.triangle([1, 3]))
  ).toEqual([3, 2, 1, 2, 3]);
  expect(
    Numeric.fixed(5)
      .init(2)
      .sequence(Numeric.triangle([1, 3], -1))
  ).toEqual([2, 1, 2, 3, 2]);
  expect(
    Numeric.fixed(5)
      .init(2)
      .sequence(Numeric.triangle([1, 3], 1))
  ).toEqual([2, 3, 2, 1, 2]);
});

test('square', () => {
  expect(Numeric.fixed(4).sequence(Numeric.square([0, 1]))).toEqual([
    0,
    1,
    0,
    1
  ]);
  expect(Numeric.fixed(4).sequence(Numeric.square([1, -7]))).toEqual([
    1,
    -7,
    1,
    -7
  ]);
});

/* test('getRange', () => {
  expect(Numeric.getRange([1, 8])).toEqual([1, 8]);
  expect(Numeric.getRange([1, 8])).toEqual([1, 8]);
  expect(Numeric.getRange([8, 1])).toEqual([1, 8]);
  expect(Numeric.getRange([18, 21])).toEqual([18, 21]);
  expect(Numeric.getRange([21, 18])).toEqual([18, 21]);
  expect(Numeric.getRange(8, -1)).toEqual([8, 1]);
  expect(Numeric.getRange(8, 1)).toEqual([1, 8]);
}); */

test('fibonacci', () => {
  expect(Numeric.fibonacci(0)).toBe(0);
  expect(Numeric.fibonacci(1)).toBe(1);
  expect(Numeric.fibonacci(2)).toBe(1);
  expect(Numeric.fibonacci(3)).toBe(2);
  expect(Numeric.fibonacci(4)).toBe(3);
  expect(Numeric.fibonacci(5)).toBe(5);
});

test('plot', () => {
  const sqr = (a = 1, b = 0, c = 0) => x => a * x * x + b * x + c;
  const lin = (m = 1, b = 0) => x => m * x + b;
  const sin = (precision = 1000) => x =>
    Math.round(Math.sin(x) * precision) / precision;
  const piRange = [0, 2 * Math.PI, Math.PI / 2];

  expect(
    Numeric.plot(lin(2))
      .range(0, 2)
      .render()
  ).toEqual([0, 2, 4]);
  expect(
    Numeric.range(-3, 3)
      .plot(sqr())
      .render()
  ).toEqual([9, 4, 1, 0, 1, 4, 9]);

  expect(Numeric.plotArray(sqr(), [-3, 3])).toEqual([9, 4, 1, 0, 1, 4, 9]);
  expect(Numeric.plotArray(sin(), piRange)).toEqual([0, 1, 0, -1, 0]);
});

test('plotSaw', () => {
  const saw = (m, b, modulo) => x => {
    const mod = modulo + 1;
    const y = ((m * x) % (mod - b)) + b;
    return y < b ? mod + y - b : y; // subtract values outside of [b,mod] from mod
  };

  const sawX = (range, m = 1, b?) => x => {
    if (typeof range === 'number') {
      range = m >= 0 ? [1, range] : [range, 1];
    }
    let [min, max] = Numeric.minMax(...range);
    b = b || range[0];
    // 4, -1 => range = [4, 1]
    const mod = max + 1;
    const y = (m * x + b) % (mod - min);
    return y < min ? mod + y - min : y; // subtract values outside of [b,mod] from mod
  };

  const sawY = ([min, max], t = 1) => x => {
    const d = max - min + 1;
    return ((t * x) / d - Math.floor((t * x) / d)) * d + min;
  };

  expect(
    Numeric.plot(sawY([0, 1]))
      .range(0, 5)
      .render()
  ).toEqual([0, 1, 0, 1, 0, 1]);

  expect(
    Numeric.plot(sawY([0, 4], 1))
      .range(0, 5)
      .render()
  ).toEqual([0, 1, 2, 3, 4, 0]); // OK!

  expect(
    Numeric.plot(sawY([0, 4], 0.5))
      .range(0, 10)
      .render()
  ).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 0]); // NOT OK!


  expect(
    Numeric.plot(sawY([1, 4], 2))
      .range(0, 5)
      .render()
  ).toEqual([1, 3, 1, 3, 1, 3]);

  expect(
    Numeric.plot(sawY([1, 4], 3))
      .range(0, 5)
      .render()
  ).toEqual([1, 4, 3, 2, 1, 4]);

  /* expect(
    Numeric.plot(sawY([0, 2], 2))
      .range(0, 5)
      .render()
  ).toEqual([0, 2, 4, 0, 2, 4]);

  expect(
    Numeric.plot(sawY([0, 2]))
      .range(0, 5)
      .render()
  ).toEqual([0, 1, 2, 0, 1, 2]);

  expect(
    Numeric.plot(sawY([1, 2]))
      .range(0, 5)
      .render()
  ).toEqual([1, 2, 1, 2, 1, 2]);

  expect(
    Numeric.plot(sawY([1, 3]))
      .range(0, 5)
      .render()
  ).toEqual([1, 2, 3, 1, 2, 3]);

  expect(
    Numeric.plot(sawY([2, 3]))
      .range(0, 5)
      .render()
  ).toEqual([2, 3, 2, 3, 2, 3]); */




  /*  expect(
    Numeric.plot(sawY(2))
      .range(0, 4)
      .render()
  ).toEqual([0, 1, 0, 1, 0]);

  expect(
    Numeric.plot(sawY(2, 1))
      .range(0, 2)
      .render()
  ).toEqual([1, 2, 1]);

  expect(
    Numeric.plot(sawY(2, 2))
      .range(0, 2)
      .render()
  ).toEqual([2, 3, 2]);

  expect(
    Numeric.plot(sawY(2))
      .range(0, 2)
      .render()
  ).toEqual([0, 1, 0]); */

  /* const saw = (m, mod, b) => x => {
    mod = mod - b + 1; // 0: mod+1, 1: mod, 2: mod -1
    return m * x + b - mod * Math.floor((m * x) / mod);
  }; */

  expect(saw(1, 0, 3)(0)).toBe(0);

  expect(saw(1, 0, 3)(1)).toBe(1);
  expect(saw(1, 0, 3)(2)).toBe(2);
  expect(saw(1, 0, 3)(3)).toBe(3);
  expect(saw(1, 0, 3)(4)).toBe(0);

  expect(saw(1, 1, 3)(0)).toBe(1);
  expect(saw(1, 1, 3)(1)).toBe(2);
  expect(saw(1, 1, 3)(2)).toBe(3);
  expect(saw(1, 1, 3)(3)).toBe(1);
  expect(saw(1, 1, 3)(4)).toBe(2);
  expect(saw(1, 1, 3)(-1)).toBe(3);

  expect(saw(1, 1, 3)(0)).toBe(1);
  expect(saw(1, 1, 4)(0)).toBe(1);
  expect(saw(1, 1, 4)(1)).toBe(2);
  expect(saw(1, 1, 4)(2)).toBe(3);
  expect(saw(1, 1, 4)(3)).toBe(4);
  expect(saw(1, 1, 4)(4)).toBe(1);
  expect(saw(1, 2, 4)(0)).toBe(2);
  expect(saw(1, 2, 4)(1)).toBe(3);
  expect(saw(1, 2, 4)(2)).toBe(4);
  expect(saw(1, 2, 4)(3)).toBe(2);
  expect(saw(1, 2, 4)(4)).toBe(3);
  expect(saw(1, 2, 4)(5)).toBe(4);
  expect(saw(1, 2, 4)(6)).toBe(2);
  expect(saw(1, 2, 5)(2)).toBe(4);

  /* expect(
    Numeric.plot(sawX(4))
      .range(0, 7)
      .render()
  ).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);

  expect(
    Numeric.plot(sawX(4, 1, 2))
      .range(0, 7)
      .render()
  ).toEqual([2, 3, 4, 1, 2, 3, 4, 1]);

  expect(
    Numeric.plot(sawX(4, 1, 3))
      .range(0, 7)
      .render()
  ).toEqual([3, 4, 1, 2, 3, 4, 1, 2]); */

  /* expect(
    Numeric.plot(sawX([2, 4], 1, 2))
      .range(0, 5)
      .render()
  ).toEqual([2, 3, 4, 2, 3, 4]);

  expect(
    Numeric.plot(sawX([2, 4], -1, 3))
      .range(0, 5)
      .render()
  ).toEqual([3, 2, 4, 3, 2, 4]); */

  /* expect(
    Numeric.plot(sawX(4, -1))
      .range(0, 7)
      .render()
  ).toEqual([4, 3, 2, 1, 4, 3, 2, 1]);

  expect(
    Numeric.plot(sawX(4, -2))
      .range(0, 7)
      .render()
  ).toEqual([4, 2, 4, 2, 4, 2, 4, 2]);

  expect(
    Numeric.plot(sawX(4, -2))
      .range(0, 7)
      .render()
  ).toEqual([4, 2, 4, 2, 4, 2, 4, 2]);

  expect(
    Numeric.plot(sawX(4, -2))
      .range(0, 7)
      .render()
  ).toEqual([4, 2, 4, 2, 4, 2, 4, 2]); */

  expect(
    Numeric.plot(saw(1, 1, 4))
      .range(0, 7)
      .render()
  ).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);

  expect(
    Numeric.plot(saw(1, 2, 5))
      .range(0, 7)
      .render()
  ).toEqual([2, 3, 4, 5, 2, 3, 4, 5]);

  expect(
    Numeric.plot(saw(1, 2, 5))
      .range(0, 7)
      .render()
  ).toEqual([2, 3, 4, 5, 2, 3, 4, 5]);

  expect(
    Numeric.plot(saw(3, 1, 7))
      .range(0, 7)
      .render()
  ).toEqual([1, 4, 7, 3, 6, 2, 5, 1]);

  expect(
    Numeric.plot(saw(1, 1, 7))
      .range(0, 7)
      .render()
  ).toEqual([1, 2, 3, 4, 5, 6, 7, 1]);

  /*   expect(
    Numeric.plot(saw(-1, 8, 8))
      .range(0, 3)
      .render()
  ).toEqual([8, 7, 6, 5]); */

  expect(Numeric.plotSaw([1, 1, 5], 1, 8)).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);

  /* expect(Numeric.plotSaw([1, 2, 6], 2, 8)).toEqual([2, 3, 4, 5, 2, 3, 4, 5]); */

  /* expect(Numeric.plotSaw([3, 1, 8], 1, 8)).toEqual([1, 4, 7, 3, 6, 2, 5, 1]); */

  /* expect(Numeric.plotSaw([1, 1, 8], 1, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 1]); */

  expect(Numeric.plotSaw([-1, 1, 9], 8, 4)).toEqual([8, 7, 6, 5]);
  expect(Numeric.plotSaw([-1, 1, 9], 4, 4)).toEqual([4, 3, 2, 1]);

  expect(Numeric.plotSaw([-1, 1, 5], 4, 8)).toEqual([4, 3, 2, 1, 4, 3, 2, 1]);

  expect(Numeric.plotSaw([-1, 0, 4], 3, 8)).toEqual([3, 2, 1, 0, 3, 2, 1, 0]);

  expect(Numeric.plotSaw([2, 0, 4], 0, 4)).toEqual([0, 2, 0, 2]);
  expect(Numeric.plotSaw([2, 0, 4], 2, 4)).toEqual([2, 0, 2, 0]);
  expect(Numeric.plotSaw([2, 0, 4], 2, 3)).toEqual([2, 0, 2]);
  expect(Numeric.plotSaw([2, 0, 4], 1, 4)).toEqual([1, 3, 1, 3]);
  expect(Numeric.plotSaw([2, 0, 4], 0.5, 4)).toEqual([0.5, 2.5, 0.5, 2.5]);
});

test('plotPenrose', () => {
  // with default values
  expect(Numeric.plotPenrose([1, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  // backwards
  expect(Numeric.plotPenrose([1, 8], 8, -1, 8)).toEqual([
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1
  ]);
  // higher steps
  expect(Numeric.plotPenrose([1, 8], 1, 2)).toEqual([1, 3, 5, 7, 1, 3, 5, 7]);
  expect(Numeric.plotPenrose([1, 7], 1, 3, 8)).toEqual([
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
  expect(Numeric.plotPenrose([1, 4], 1, 1, 8)).toEqual([
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
  expect(Numeric.plotPenrose([1, 4], 2, 1, 8)).toEqual([
    2,
    3,
    4,
    1,
    2,
    3,
    4,
    1
  ]);
  expect(Numeric.plotPenrose([1, 4], 4, 1, 8)).toEqual([
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
  expect(Numeric.plotPenrose([0, 3], 1, 1, 8)).toEqual([
    1,
    2,
    3,
    0,
    1,
    2,
    3,
    0
  ]);
  expect(Numeric.plotPenrose([1, 2], 1, 1, 8)).toEqual([
    1,
    2,
    1,
    2,
    1,
    2,
    1,
    2
  ]);
});
