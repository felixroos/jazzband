import { Instrument } from './Instrument';
import { Note } from 'tonal';

export class Synthesizer extends Instrument {
    duration = 200;
    type = 'sine';
    gain = 0.9;
    attack = .05;
    decay = .05;
    sustain = .4;
    release = .1;

    constructor(props: any) {
        super(props);
        this.duration = props.duration || this.duration;
        this.type = props.type || this.type;
        this.gain = props.gain || this.gain;
    }

    init(context) {
        super.init(context);
    }

    getVoice(type = 'sine', gain = 0, frequency = 440) {
        const oscNode = this.context.createOscillator();
        oscNode.type = type;
        const gainNode = this.context.createGain();
        oscNode.connect(gainNode);
        gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
        gainNode.connect(this.mix);
        oscNode.frequency.value = frequency;
        return { oscNode, gainNode };
    }

    lowestGain(a, b) {
        return a.gain.gain.value < b.gain.gain.value ? -1 : 0;
    }

    adsr({ attack, decay, sustain, release, gain, duration }, time, param) {
        param.linearRampToValueAtTime(gain, time + attack);
        param.setTargetAtTime(gain * sustain, time + Math.min(attack + decay, duration), decay);
        param.setTargetAtTime(0, time + Math.max(duration - attack - decay, attack + decay, duration), release);
    }

    playKeys(keys: number[], settings) {
        super.playKeys(keys, settings); // fires callback   
        const time = this.context.currentTime + settings.deadline / 1000;
        const interval = settings.interval || 0;
        keys.map((key, i) => {
            const delay = i * interval;
            const [attack, decay, sustain, release, duration, gain] =
                [
                    settings.attack || this.attack,
                    settings.decay || this.decay,
                    settings.sustain || this.sustain,
                    settings.release || this.release,
                    (settings.duration || this.duration) / 1000,
                    (settings.gain || 1) * this.gain
                ]
            const voice = this.getVoice(this.type, 0, Note.freq(key));
            this.adsr({ attack, decay, sustain, release, gain, duration, }, time + delay, voice.gainNode.gain);
            voice.oscNode.start(settings.deadline + delay);
        })
    }
}