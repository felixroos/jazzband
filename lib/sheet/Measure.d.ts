import { JumpSign, SheetState } from './Sheet';
import { SequenceOptions } from '../player/Sequence';
import { NestedRhythm } from './Rhythm';
export declare type MeasureOrBody<T> = Measure<T> | T[] | T;
export declare type Measures<T> = Array<MeasureOrBody<T>>;
export interface RenderedMeasure<T> extends Measure<T> {
    index: number;
    form?: number;
    totalForms?: number;
}
export declare class Measure<T> {
    body?: T | NestedRhythm<T>;
    signs?: string[];
    comments?: string[];
    house?: number | number[];
    times?: number;
    section?: string;
    idle?: true;
    options?: SequenceOptions;
    static from<T>(measure: MeasureOrBody<T>): Measure<T>;
    static render<T>(state: SheetState<T>): RenderedMeasure<T>;
    static hasSign<T>(sign: string, measure: MeasureOrBody<T>): boolean;
    static hasHouse<T>(measure: MeasureOrBody<T>, number?: number): boolean;
    static getJumpSign<T>(measure: MeasureOrBody<T>): JumpSign<T>;
    static hasJumpSign<T>(measure: MeasureOrBody<T>): boolean;
}
