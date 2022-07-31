export type Fraction = number[];

export class Fractions {
  static add(a: Fraction, b: Fraction, cancel = true): Fraction {
    const lcm = Fractions.lcm(a[1], b[1]);
    [a, b] = [a, b].map(f => Fractions.setDivisor(f, lcm));
    const sum: Fraction = [a[0] + b[0], lcm];
    if (cancel) {
      return Fractions.cancel(sum);
    }
    return sum;
  }

  static cancel(a: Fraction): Fraction {
    return Fractions.setDivisor(a, a[1] / Fractions.gcd(a[0], a[1]));
  }

  static setDivisor(a: Fraction, divisor: number): Fraction {
    return [a[0] * divisor / a[1], divisor];
  }

  static lcm(x: number, y: number) {
    return (!x || !y) ? 0 : Math.abs((x * y) / Fractions.gcd(x, y));
  }

  static gcd(x: number, y: number): number {
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }
} 