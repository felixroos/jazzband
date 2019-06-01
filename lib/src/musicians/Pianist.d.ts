import { Musician } from './Musician';
import { Instrument } from '../instruments/Instrument';
import { VoiceLeadingOptions } from '../harmony/Voicing';
export default class Pianist extends Musician {
    name: string;
    playedNotes: any[];
    playedChords: any[];
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
    min: (...values: number[]) => number;
    rollFactor: number;
    props: any;
    voicingOptions: VoiceLeadingOptions;
    instrument: Instrument;
    constructor(instrument: any, props?: {});
    play({ pulse, measures, settings }: {
        pulse: any;
        measures: any;
        settings: any;
    }): any;
    getLastVoicing(): any;
    playNotes(scorenotes: any, { deadline, interval, gain, duration, pulse }: {
        deadline: any;
        interval: any;
        gain: any;
        duration: any;
        pulse: any;
    }): void;
    playChord(chord: any, settings: any): void;
}
