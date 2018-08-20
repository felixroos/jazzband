import { Pulse } from './Pulse';
import { Musician } from './musicians/Musician';

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
    constructor({ context, musicians }: any = {}) {
        this.context = context || new AudioContext();
        this.musicians = musicians || [];
    }

    ready(): Promise<any[]> {
        return Promise.all([this.resume()].concat(this.musicians.map(m => m.ready)));
    }

    resume() { // https://goo.gl/7K7WLu
        return this.context.resume().then(() => this.context);
    }

    comp(measures, settings) {
        if (this.pulse) {
            this.pulse.stop();
        }
        settings = Object.assign(this.defaults, settings, { context: this.context });
        measures = measures.map(m => !Array.isArray(m) ? [m] : m);
        this.play(measures, settings);
    }

    play(measures, settings) {
        this.ready().then(() => {
            this.pulse = settings.pulse || new Pulse(settings);
            this.musicians.forEach(musician => musician.play({ pulse: this.pulse, measures, settings }));
            this.pulse.start();
        });
    }
}
