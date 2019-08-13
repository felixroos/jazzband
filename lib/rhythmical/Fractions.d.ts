export declare type Fraction = number[];
export declare class Fractions {
    static add(a: Fraction, b: Fraction, cancel?: boolean): Fraction;
    static cancel(a: Fraction): Fraction;
    static setDivisor(a: Fraction, divisor: number): Fraction;
    static lcm(x: number, y: number): number;
    static gcd(x: number, y: number): number;
}
