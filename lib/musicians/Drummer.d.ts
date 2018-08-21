import { Musician } from './Musician';
export default class Drummer extends Musician {
    set: {
        kick: number;
        snare: number;
        hihat: number;
        ride: number;
        crash: number;
    };
    defaults: {
        groove: {
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
        };
    };
    constructor(instrument: any);
    play({ measures, pulse, settings }: {
        measures: any;
        pulse: any;
        settings: any;
    }): void;
}
