import Band from './Band';
import Pianist from './musicians/Pianist';
import Bassist from './musicians/Bassist';
import Drummer from './musicians/Drummer';
import Improvisor from './musicians/Improvisor';
export declare class Trio extends Band {
    pianist: Pianist;
    bassist: Bassist;
    drummer: Drummer;
    soloist: Improvisor;
    instruments: {
        piano: any;
        bass: any;
        drums: any;
    };
    constructor({ context, piano, bass, drums, onMeasure, solo }: {
        context: any;
        [key: string]: any;
    });
    setupInstruments({ piano, bass, drums }: {
        piano: any;
        bass: any;
        drums: any;
    }): {
        piano: any;
        bass: any;
        drums: any;
    };
}
