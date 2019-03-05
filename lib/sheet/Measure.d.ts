import { JumpSign } from './Sheet';
export declare type MeasureOrString = Measure | string[] | string;
export interface Measure {
    chords?: string[];
    signs?: string[];
    comments?: string[];
    house?: number | number[];
    times?: number;
    section?: string;
    idle?: true;
}
export declare class Measure implements Measure {
    static from(measure: MeasureOrString, property?: string): Measure;
    static hasSign(sign: string, measure: MeasureOrString): boolean;
    static hasHouse(measure: MeasureOrString, number?: number): boolean;
    static getJumpSign(measure: any): JumpSign;
    static hasJumpSign(measure: MeasureOrString): boolean;
}
