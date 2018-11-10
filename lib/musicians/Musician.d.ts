import { Instrument } from "../instruments/Instrument";
export declare class Musician {
    ready: Promise<any>;
    gain: number;
    instrument: Instrument;
    constructor(instrument: any);
    play({ pulse, measures, settings }: {
        pulse: any;
        measures: any;
        settings: any;
    }): void;
    getGain(value?: number): number;
}
