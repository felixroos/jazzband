import { JumpSign, SheetState } from './Sheet';
export declare type MeasureOrString = Measure | string[] | string;
export interface RenderedMeasure {
    chords: string[];
    index: number;
    measure?: Measure;
    form?: number;
    totalForms?: number;
    lastTime?: boolean;
    firstTime?: boolean;
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
}
export declare class Measure implements Measure {
    static from(measure: MeasureOrString, property?: string): Measure;
    static render(state: SheetState): RenderedMeasure;
    static hasSign(sign: string, measure: MeasureOrString): boolean;
    static hasHouse(measure: MeasureOrString, number?: number): boolean;
    static getJumpSign(measure: any): JumpSign;
    static hasJumpSign(measure: MeasureOrString): boolean;
}
