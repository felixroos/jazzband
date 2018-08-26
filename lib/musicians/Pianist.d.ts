import { Musician } from './Musician';
import { Instrument } from '../instruments/Instrument';
export default class Pianist extends Musician {
    playedNotes: any[];
    playedPatterns: any[];
    playedChords: any[];
    defaults: {
        intelligentVoicings: boolean;
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
        noTonic: boolean;
    };
    min: (...values: number[]) => number;
    rollFactor: number;
    props: any;
    instrument: Instrument;
    constructor(instrument: any, props?: {});
    play({ pulse, measures, settings }: {
        pulse: any;
        measures: any;
        settings: any;
    }): any;
    getLastVoicing(): any;
    getVoicing(scorenotes: any, before: any, tonic?: any): any;
    playNotes(scorenotes: any, { tonic, deadline, interval, gain, duration, pulse }: {
        tonic: any;
        deadline: any;
        interval: any;
        gain: any;
        duration: any;
        pulse: any;
    }): void;
    playChord(chord: any, settings: any): void;
}
