declare type ExitCase = (value: number, sequence: number[]) => boolean;
declare type NumericOptions = {
  exitCase?: ExitCase;
  initialValues?: number[];
  plotRange?: number[];
  quantization?: number;
  plotFunction?: PlotFunction;
  sequenceFunction?: SequenceFunction;
};

declare type PlotFunction = (x: number) => number;
declare type SequenceFunction = (sequence: number[], index: number) => number;
declare type SequencePoint = (sequence: number[], index: number) => number;

declare type NumericApi = {
  sequence: (f: SequencePoint) => number[];
  plot: (f: PlotFunction) => number[];
  init: (initialValues: number[]) => NumericApi;
  range: (a: number, b: number) => NumericApi;
};

export class Numeric {
  // calculates number sequence f inside range
  static sequence(f, options: NumericOptions = {}) {
    let value;
    let { exitCase } = {
      exitCase: (value?, numbers?) => numbers.includes(value),
      ...options
    };
    const numbers = [].concat(options.initialValues || []);
    while (true) {
      value = f(numbers, numbers.length - 1);
      if (exitCase(value, numbers)) {
        break;
      }
      numbers.push(value);
    }
    return numbers;
  }

  static minMax(...values) {
    return values.sort();
  }

  static api(options: NumericOptions) {
    const defaultApi = {
      init: values =>
        this.api({
          ...options,
          ...this.init(values)
        }),
      range: (a: number, b: number) =>
        this.api({
          ...options,
          ...this.range(a, b)
        }),
      fixed: (length: number) =>
        this.api({
          ...options,
          ...this.fixed(length)
        }),
      sequence: (f: SequencePoint) => this.sequence(f, options),
      /* plot: (f: PlotPoint) =>
        this.plot(f, options.plotRange, options.quantization) */
      plot: (f: PlotFunction) =>
        this.api({
          ...options,
          plotFunction: f
        }),
      render: () => {
        if (options.plotFunction) {
          return this.plotArray(
            options.plotFunction,
            options.plotRange,
            options.quantization
          );
        }
        if (options.sequenceFunction) {
          return this.sequence(options.sequenceFunction, options);
        }
      }
    };
    return {
      inititialValues: [],
      plotRange: [-3, 3],
      quantization: 10000,
      ...options,
      ...defaultApi
    };
  }

  static init(initialValues: number[] | number) {
    if (typeof initialValues === 'number') {
      initialValues = [initialValues];
    }
    return this.api({
      initialValues
    });
  }

  static range(a: number, b: number, grain = 1) {
    const [min, max] = this.minMax(a, b);
    return this.api({
      exitCase: (value, numbers) => {
        return value > max || value < min;
      },
      initialValues: [a],
      plotRange: [a, b, grain]
    });
  }

  static fixed(length: number) {
    return this.api({
      exitCase: (value, numbers) => {
        return numbers.length > length - 1;
      }
    });
  }
  // calculates number sequence f inside range
  static rangeSequence(f, [a, b], initialValues = [a]) {
    const [min, max] = [Math.min(a, b), Math.max(a, b)];
    const exitCase = value => value > max || value < min;
    return this.sequence(f, { exitCase, initialValues });
  }

  static fixedSequence(f, length, initialValues = []) {
    const exitCase = (value, numbers) => numbers.length > length - 1;
    return this.sequence(f, { exitCase, initialValues });
  }

  static uniqueSequence(f, initialValues = []) {
    const exitCase = (value, numbers) => numbers.includes(value);
    return this.sequence(f, { exitCase, initialValues });
  }

  // recursive fibonacci function
  static fibonacci(n) {
    if (n < 1) {
      return 0;
    }
    if (n < 3) {
      return 1;
    }
    return this.fibonacci(n - 2) + this.fibonacci(n - 1);
  }

  static modRange(number, [min, max]) {
    const value = ((number - min) % max) + min;
    if (value < min) {
      return max + value;
    }
    return value;
  }

  static saw(range: number[] | number, step = 1): SequencePoint {
    if (typeof range === 'number') {
      range = step >= 0 ? [1, range] : [range, 1];
    }
    let [min, max] = this.minMax(...range);
    return (s, i) => {
      const value = !s.length
        ? range[0]
        : this.modRange(s[i] + step, [min, max]);
      // const value = !s.length ? range[0] : ((s[i] + step - min) % max) + min;
      if (value < min) {
        return max + value;
      }
      return value;
    };
  }

  static triangle([min, max], step = 1) {
    [min, max] = this.minMax(min, max);
    const init = step > 0 ? min : max;
    return (s, i) => {
      let direction = step / Math.abs(step); // inital direction
      if (!s.length) {
        return init;
      }
      if (s.length > 1) {
        direction = s[i] > s[i - 1] ? 1 : -1;
      }
      // are we going up or down?
      let value = s[i] + direction * Math.abs(step);
      // is the next value in that direction invalid?
      if (value < min || value > max) {
        return s[i] + direction * -1 * Math.abs(step);
      }
      return value;
    };
  }

  static square([min, max]) {
    return (s, i) => {
      if (!s.length) {
        return min;
      }
      return s[i] === min ? max : min;
    };
  }

  static plot(f: PlotFunction /*  | string */) {
    /* if (typeof f === 'string') {
      f = this.plotFunctions[f];
    } */
    return this.api({
      plotFunction: f
    });
  }

  // calculates the values of f(x) inside range with given precision
  static plotArray(f, range, quantization = 1000) {
    const values = [];
    let x = range[0];
    const grain = range[2] || 1;
    while (x <= range[1]) {
      let value = Math.round(quantization * f(x)) / quantization;
      if (value === -0) {
        value = 0;
      }
      values.push(value);
      x += grain;
    }
    return values;
  }

  // calculates line points within a modulo
  static plotSaw([m, b, mod], firstY = 0, length = mod) {
    const saw = (m, b, mod) => x => {
      const y = ((m * x) % (mod - b)) + b;
      return y < b ? mod + y - b : y; // subtract values outside of [b,mod] from mod
    };
    const start = (firstY - b) / m; // get x value of firstY
    return this.plotArray(saw(m, b, mod), [start, start + length - 1]);
  }

  // calculates linear steps of given length within a number range
  static plotPenrose(
    [min, max],
    start = min,
    step = 1,
    length = max - min + 1
  ) {
    return this.plotSaw([step, min, max + 1], start, length);
  }
}
