import { JumpSign, SheetState } from './Sheet';
import { SequenceOptions } from './Sequence';
export declare type MeasureOrString = Measure | string[] | string | number[] | number;
export interface Bar<T> {
    body?: T[];
    signs?: string[];
    comments?: string[];
    house?: number | number[];
    times?: number;
    section?: string;
    idle?: true;
    options?: SequenceOptions;
}
export interface Measure {
    chords?: string[];
    body?: string[];
    signs?: string[];
    comments?: string[];
    house?: number | number[];
    times?: number;
    section?: string;
    idle?: true;
    options?: SequenceOptions;
}
export interface RenderedMeasure extends Measure {
    chords?: string[];
    index: number;
    measure?: Measure;
    form?: number;
    totalForms?: number;
    lastTime?: boolean;
    firstTime?: boolean;
}
export declare class Measure implements Measure {
    static from(measure: MeasureOrString, property?: string): Measure;
    static render(state: SheetState): RenderedMeasure;
    static hasSign(sign: string, measure: MeasureOrString): boolean;
    static hasHouse(measure: MeasureOrString, number?: number): boolean;
    static getJumpSign(measure: any): JumpSign;
    static hasJumpSign(measure: MeasureOrString): boolean;
}
