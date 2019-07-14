export declare class Permutation {
    static permutateElements(array: any, validate?: any, path?: any[]): any;
    static permutationComplexity(array: any, validate?: any, path?: any[]): number;
    static permutateArray(array: any): any;
    static combineValidators(...validators: ((path: any, next: any, array: any) => boolean)[]): (path: any, next: any, array: any) => boolean;
    static combinations(array: any): any[];
    static binomial(set: any, k: any): Array<any[]>;
    static bjorklund(steps: any, pulses: any): any[];
}
