import { SequenceOptions } from './Sequence';
import { Measures } from '../sheet/Measure';
export declare class Leadsheet {
    name?: string;
    composer?: string;
    style?: string;
    bpm?: number;
    repeats?: number;
    key?: string;
    chords?: Measures<string>;
    melody?: Measures<string>;
    options?: SequenceOptions;
    constructor(sheet: Leadsheet);
    static from(sheet: Leadsheet): Leadsheet;
}
