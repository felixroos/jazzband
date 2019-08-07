import { Measures } from '../sheet/Sheet';
import { SequenceOptions } from './Sequence';
export declare class Leadsheet {
    name?: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    measures?: Measures;
    chords?: Measures;
    melody?: Measures;
    options?: SequenceOptions;
    constructor(sheet: Leadsheet);
    static from(sheet: Leadsheet): Leadsheet;
}
