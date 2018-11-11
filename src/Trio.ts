import { randomSynth } from './util';
import Band from './Band';
import Pianist from './musicians/Pianist';
import Bassist from './musicians/Bassist';
import Drummer from './musicians/Drummer';
import { PlasticDrums } from './instruments/PlasticDrums';
import { Metronome } from './Metronome';
import { Pulse } from './Pulse';
import Permutator from './musicians/Permutator';
import Guide from './musicians/Guide';

export class Trio extends Band {
    pianist: Pianist;
    bassist: Bassist;
    drummer: Drummer;
    soloist: Permutator;
    mix: any;
    instruments: { piano: any; bass: any; drums: any; };
    metronome: Metronome;

    constructor({ context, piano, bass, drums, onMeasure, solo }: { context, [key: string]: any }) {
        super({ context, onMeasure });
        this.mix = this.setupMix(this.context);
        const instruments = this.setupInstruments({ piano, bass, drums })
        this.pianist = new Pianist(instruments.piano);
        this.bassist = new Bassist(instruments.bass);
        this.drummer = new Drummer(instruments.drums);
        this.musicians = [this.pianist, this.bassist, this.drummer];
        if (solo) {
            // this.soloist = new Permutator(instruments.piano);
            this.soloist = new Guide(instruments.piano);
            this.musicians.push(this.soloist);
        }
        this.metronome = new Metronome(this.mix);
    }

    setupMix(context) {
        const mix = context.createGain();
        mix.gain.value = 0.9;
        mix.connect(context.destination);
        return mix;
    }

    setupInstruments({ piano, bass, drums }) {
        bass = bass || randomSynth(this.mix);
        piano = piano || randomSynth(this.mix);
        drums = drums || new PlasticDrums({ mix: this.mix });
        return { piano, bass, drums };
    }

    play(measures, settings) {
        this.pulse = settings.pulse || new Pulse(settings);
        return this.count(this.pulse, settings.metronome ? null : 0).then((tick) => {
            settings.deadline = tick.deadline;
            // settings.delay = deadline - this.context.currentTime;
            super.play(measures, settings);
        })
    }

    count(pulse, bars = 1) {
        if (pulse.getMeasureLength() < 1.5) {
            bars *= 2; //double countin bars when countin would be shorter than 1.5s
        }
        return this.metronome.count(pulse, bars);
    }
}
