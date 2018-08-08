import { Pulse } from './Pulse';
import { Musician } from './Musician';

export default class Band {
    props: any;
    pulse: Pulse;
    musicians: Musician[];
    defaults = {
        times: 1,
        cycle: 4,
        division: 3, // rhythm division (3=swing,2=binary)
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
        if (settings.times > 1) {
            measures = new Array(settings.times).fill(1).reduce((song) => {
                return song.concat(measures);
            }, []);
        }
        this.ready().then(() => {
            this.pulse = new Pulse(settings);
            this.musicians.forEach(musician => musician.play({ pulse: this.pulse, measures, settings }));
            this.pulse.start();
        });
    }
}
