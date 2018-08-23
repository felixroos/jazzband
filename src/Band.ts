import { Pulse } from './Pulse';
import { Musician } from './musicians/Musician';
import { renderSheet } from './Song';

export default class Band {
    props: any;
    pulse: Pulse;
    musicians: Musician[];
    defaults = {
        cycle: 4,
        division: 3, // rhythm division (3=ternary,2=binary)
        transpose: 0,
        style: 'Medium Swing'
    }
    context: AudioContext;
    onMeasure = (measure, tick?) => { };

    constructor({ context, musicians }: any = {}, onMeasure?) {
        this.context = context || new AudioContext();
        this.onMeasure = onMeasure || this.onMeasure;
        this.musicians = musicians || [];
    }

    ready(): Promise<any[]> {
        return Promise.all([this.resume()].concat(this.musicians.map(m => m.ready)));
    }

    resume() { // https://goo.gl/7K7WLu
        return this.context.resume().then(() => this.context);
    }

    comp(sheet, settings) {
        if (this.pulse) {
            this.pulse.stop();
        }
        console.log('comp sheet', sheet);
        let measures = renderSheet(sheet);
        console.log('measures', measures);

        settings = Object.assign(this.defaults, settings, { context: this.context });
        this.play(measures, settings);
    }

    play(measures, settings) {
        this.ready().then(() => {
            this.pulse = settings.pulse || new Pulse(settings);
            this.pulse.tickArray(measures.map(measure => ({ measure })),
                (tick) => this.onMeasure(tick.value.measure, tick));
            measures = measures.map(m => m.chords);
            this.musicians.forEach(musician => musician.play({ pulse: this.pulse, measures, settings }));
            this.pulse.start();
        });
    }
}
