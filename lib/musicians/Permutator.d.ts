import { Musician } from './Musician';
export default class Permutator extends Musician {
    styles: {
        [key: string]: any;
    };
    defaults: {
        groove: {
            chords: ({ measure, settings }: {
                measure: any;
                settings: any;
            }) => any;
            eights: () => number[][];
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
    playedChords: string[];
    constructor(instrument: any);
    play({ measures, pulse, settings }: {
        measures: any;
        pulse: any;
        settings: any;
    }): void;
    getStep(step: any, chord: any, octave?: number): any;
    getSteps(steps: any, chord: any): void;
    playPermutations({ value, cycle, path, deadline, interval }: {
        value: any;
        cycle: any;
        path: any;
        deadline: any;
        interval: any;
    }, measures: any, pulse: any): void;
}
