import { Instrument } from './Instrument';
import { Note } from 'tonal';
import { adsr } from '../util/util';

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

    getVoice(type = 'sine', gain = 0, key) {
        const frequency = Note.freq(key);
        const oscNode = this.context.createOscillator();
        oscNode.type = type;
        const gainNode = this.context.createGain();
        oscNode.connect(gainNode);
        gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
        gainNode.connect(this.mix);
        oscNode.frequency.value = frequency;
        return { oscNode, gainNode, key, frequency };
    }

    lowestGain(a, b) {
        return a.gain.gain.value < b.gain.gain.value ? -1 : 0;
    }

    startKeys(keys: number[], settings: any = {}) {

    }

    playKeys(keys: number[], settings: any = {}) {
        super.playKeys(keys, settings); // fires callback   
        //const time = this.context.currentTime + settings.deadline / 1000;
        const time = settings.deadline || this.context.currentTime;
        const interval = settings.interval || 0;
        return keys.map((key, i) => {
            const delay = i * interval;
            const [endless, attack, decay, sustain, release, duration, gain] =
                [
                    settings.endless,
                    settings.attack || this.attack,
                    settings.decay || this.decay,
                    settings.sustain || this.sustain,
                    settings.release || this.release,
                    (settings.duration || this.duration) / 1000,
                    (settings.gain || 1) * this.gain
                ]
            const voice = this.getVoice(this.type, 0, key);
            adsr({ attack, decay, sustain, release, gain, duration, endless }, time + delay, voice.gainNode.gain);
            voice.oscNode.start(settings.deadline + delay);
            return voice;
        });
    }

    stopVoice(voice, settings: any = {}) {
        if (!voice) {
            return;
        }
        const time = settings.deadline || this.context.currentTime;
        voice.gainNode.gain.setTargetAtTime(0, time, settings.release || this.release);
        //voice.oscNode.stop()
    }

    stopVoices(voices, settings) {
        voices.forEach(voice => {
            this.stopVoice(voice, settings);
        });
    }
}