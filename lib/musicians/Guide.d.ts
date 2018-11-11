import { Musician } from './Musician';
export default class Guide extends Musician {
    styles: {
        [key: string]: any;
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
            solo: () => any;
        };
    };
    playedChords: string[];
    playedNotes: string[];
    range: string[];
    constructor(instrument: any);
    play({ measures, pulse, settings }: {
        measures: any;
        pulse: any;
        settings: any;
    }): void;
    playPermutations({ value, cycle, path, deadline, interval }: {
        value: any;
        cycle: any;
        path: any;
        deadline: any;
        interval: any;
    }, measures: any, pulse: any): void;
}
