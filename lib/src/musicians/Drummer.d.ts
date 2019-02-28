import { Musician } from './Musician';
export default class Drummer extends Musician {
    name: string;
    set: {
        kick: number;
        snare: number;
        hihat: number;
        ride: number;
        crash: number;
        rimshot: number;
    };
    defaults: {
        groove: {
            name: string;
            tempo: number;
            chords: ({ measure, settings }: {
                measure: any;
                settings: any;
            }) => any;
            bass: () => any;
            crash: ({ measures, index }: {
                measures: any;
                index: any;
            }) => number[];
            ride: ({ measures, index }: {
                measures: any;
                index: any;
            }) => any;
            hihat: () => number[];
            solo: () => any;
        };
    };
    constructor(instrument: any);
    play({ measures, pulse, settings }: {
        measures: any;
        pulse: any;
        settings: any;
    }): void;
}
