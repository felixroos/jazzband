import { Instrument } from "../instruments/Instrument";
export declare class Musician {
    ready: Promise<any>;
    instrument: Instrument;
    constructor(instrument: any);
    play({ pulse, measures, settings }: {
        pulse: any;
        measures: any;
        settings: any;
    }): void;
}
