import { Instrument } from "./Instrument";
import { Kick } from "./Kick";
import { Snare } from "./Snare";
export declare class PlasticDrums extends Instrument {
    kick: Kick;
    snare: Snare;
    keys: any[];
    constructor(options: any);
    playKeys(keys: any, { deadline, gain, value }: {
        deadline: any;
        gain: any;
        value: any;
    }): void;
}
