import Band from './Band';
import Pianist from './musicians/Pianist';
import Bassist from './musicians/Bassist';
import Drummer from './musicians/Drummer';
import { Metronome } from './Metronome';
import Improvisor from './musicians/Improvisor';
export declare class Trio extends Band {
    pianist: Pianist;
    bassist: Bassist;
    drummer: Drummer;
    soloist: Improvisor;
    mix: any;
    instruments: {
        piano: any;
        bass: any;
        drums: any;
    };
    metronome: Metronome;
    constructor({ context, piano, bass, drums, onMeasure, solo }: {
        context: any;
        [key: string]: any;
    });
    setupMix(context: any): any;
    setupInstruments({ piano, bass, drums }: {
        piano: any;
        bass: any;
        drums: any;
    }): {
        piano: any;
        bass: any;
        drums: any;
    };
    play(measures: any, settings: any): any;
    count(pulse: any, bars?: number): any;
}
