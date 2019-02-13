import { randomSynth } from './util';
import Band from './Band';
import Pianist from './musicians/Pianist';
import Bassist from './musicians/Bassist';
import Drummer from './musicians/Drummer';
import { PlasticDrums } from './instruments/PlasticDrums';
import Improvisor from './musicians/Improvisor';

export class Trio extends Band {
    pianist: Pianist;
    bassist: Bassist;
    drummer: Drummer;
    soloist: Improvisor;
    instruments: { piano: any; bass: any; drums: any; };

    constructor({ context, piano, bass, drums, onMeasure, solo }: { context, [key: string]: any }) {
        super({ context, onMeasure });
        const instruments = this.setupInstruments({ piano, bass, drums })
        this.pianist = new Pianist(instruments.piano);
        this.bassist = new Bassist(instruments.bass);
        this.drummer = new Drummer(instruments.drums);
        this.musicians = [this.pianist, this.bassist, this.drummer];
        if (solo) {
            // this.soloist = new Permutator(instruments.piano);
            this.soloist = new Improvisor(instruments.piano);
            this.musicians.push(this.soloist);
        }
    }

    setupInstruments({ piano, bass, drums }) {
        bass = bass || randomSynth(this.mix);
        piano = piano || randomSynth(this.mix);
        drums = drums || new PlasticDrums({ mix: this.mix });
        return { piano, bass, drums };
    }
}
