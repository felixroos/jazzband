import Pianist from './Pianist';
import { Pulse } from './Pulse';
import { Metronome } from './Metronome';
import { Drummer } from './Drummer';

export default class Band {
    props: any;
    defaultStyle: string;
    pulse: Pulse;
    metronome: Metronome;
    drummer: Drummer;
    pianist: Pianist;
    constructor(props: any = {}) {
        this.props = Object.assign({
            context: props.context || new AudioContext()
        }, props);
        const context = this.props.context;

        this.defaultStyle = 'Medium Swing';
        this.pulse = new Pulse({ context, bpm: 130 });
        this.metronome = new Metronome({ context });
        this.drummer = new Drummer({ context });
        this.pianist = new Pianist({ context, itelligentVoicings: false });
    }

    ready() {
        return Promise.all([this.resume(), this.pianist.ready, this.drummer.ready, this.metronome.ready]);
    }

    resume() { // https://goo.gl/7K7WLu
        return this.props.context.resume().then(() => this.props.context);
    }

    playChordAtPosition(position) {
        const chord = this.props.measures[position[0]][position[1]];
        this.pianist.playChord(chord);
    }

    /* applyStyle(styleName) {
        const style = this.styles[styleName] || this.styles[this.defaultStyle];
        this.pulse.props = Object.assign(style);
    } */

    compBars(measures = this.props.measures, times = 1, position = this.props.position || [0, 0]) {
        measures = measures.map(m => !Array.isArray(m) ? [m] : m);
        if (times > 1) {
            measures = new Array(times).fill(1).reduce((song) => {
                return song.concat(measures);
            }, []);
        }
        this.pulse.tickArray(measures.map(m => 1), (tick) => {
            this.drummer.bar(tick);
            this.pianist.bar(tick, measures);
        });
        this.pulse.start();
    }

    getNextPosition(position = this.props.position, measures = this.props.measures) {
        let barIndex = position[0];
        let chordIndex = position[1] + 1;
        if (chordIndex > measures[barIndex].length - 1) {
            chordIndex = 0;
            barIndex = (barIndex + 1) % measures.length;
        }
        return [barIndex, chordIndex];
    }

    playNextChord(measures = this.props.measures, bpm = 220, beatsPerMeasure = 4, forms = 2) {
        const position = !this.props.position ? [0, 0] : this.getNextPosition();
        this.playChordAtPosition(position);
    }
}
