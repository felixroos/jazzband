import { Pulse } from './Pulse';
import { Musician } from './musicians/Musician';
import { Sheet, Leadsheet } from './sheet/Sheet';
import { Metronome } from './Metronome';
import { Logger } from './util/Logger';
import { Snippet } from './sheet/Snippet';

/** Band */
export default class Band {
    props: any;
    pulse: Pulse;
    mix: any;
    musicians: Musician[];
    defaults = {
        cycle: 4,
        division: 3, // rhythm division (3=ternary,2=binary)
        transpose: 0,
        style: 'Medium Swing',
    }
    context: AudioContext;
    onMeasure: (measure, tick?) => {};
    metronome: Metronome;

    constructor({ context, musicians, onMeasure }: any = {}) {
        this.context = context || new AudioContext();
        this.onMeasure = onMeasure;
        this.musicians = musicians || [];
        this.mix = this.setupMix(this.context);
        this.metronome = new Metronome(this.mix);
    }

    setupMix(context) {
        const mix = context.createGain();
        mix.gain.value = 0.9;
        mix.connect(context.destination);
        return mix;
    }

    addMember(musician) {
        this.musicians = this.musicians.concat(musician);
    }

    ready(): Promise<any[]> {
        return Promise.all([this.resume()].concat(this.musicians.map(m => m.ready)));
    }

    resume() { // https://goo.gl/7K7WLu
        return this.context.resume ? this.context.resume().then(() => this.context) : Promise.resolve(this.context);
    }

    comp(sheet: Leadsheet, settings) {
        if (this.pulse) {
            this.pulse.stop();
        }
        Logger.logLegend();
        Logger.logSheet(sheet);
        if (settings.onMeasure) {
            this.onMeasure = settings.onMeasure;
        }
        console.log('sheet', sheet);
        let measures = Sheet.render(sheet.chords, settings.render);
        console.log(Snippet.from(measures));
        settings = Object.assign(this.defaults, settings, { context: this.context });
        this.play(measures, settings);
    }

    play(measures, settings) {
        this.ready().then(() => {
            this.pulse = settings.pulse || new Pulse(settings);
            return this.count(this.pulse, settings.metronome ? null : 0)
        }).then((tick) => {
            /* settings.deadline = tick.deadline; */
            if (this.onMeasure) {
                // TODO: add onChord for setting tonics + circle chroma etc
                this.pulse.tickArray(measures.map(measure => ({ measure })),
                    (tick) => this.onMeasure(tick.value.measure, tick));
            }
            measures = measures.map(m => m.chords ? m.chords : m);
            console.log('Band#play', settings);
            let musicians = (settings.musicians || this.musicians);
            if (settings.exact) {
                musicians = this.musicians.slice(0, 2);
            }
            musicians.forEach(musician => musician.play({ pulse: this.pulse, measures, settings }));
            this.pulse.start();
        });
    }

    count(pulse, bars = 1) {
        if (pulse.getMeasureLength() < 1.5) {
            bars *= 2; //double countin bars when countin would be shorter than 1.5s
        }
        return this.metronome.count(pulse, bars);
    }
}
