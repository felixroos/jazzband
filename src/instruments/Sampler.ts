import { Instrument } from './Instrument';
import { adsr } from '../util';

export class Sampler extends Instrument {
    buffers = {};
    context: AudioContext;
    overlap: any;
    samples: Promise<any[]>;
    sources: any;
    gainNode: GainNode;
    duration = 10000;
    type = 'sine';
    gain = 1;
    attack = 0;
    decay = 0;
    sustain = 1;
    release = .2;

    constructor(options: any = {}) {
        super(options);
        this.gain = options.gain || this.gain;
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.duration = options.duration || this.duration;
        // this.overlap = options.overlap;
        if (options.samples) {
            this.sources = options.samples;
            this.ready = this.loadSources(options.samples)
        }
    }

    // returns buffer from buffer cache or loads buffer data from source
    getBuffer(src, context = this.context) {
        if (this.buffers[src] && this.buffers[src].context === context) {
            // console.log('buffer already present');
            return Promise.resolve(this.buffers[src].buffer);
        }
        return fetch(src)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                return new Promise((resolve, reject) => {
                    context.decodeAudioData(buffer, (decodedData) => {
                        this.buffers[src] = { buffer: decodedData, context };
                        resolve(decodedData);
                    });
                })
            });
    }

    getSource(buffer, connect?) {
        const source = this.context.createBufferSource();
        connect = connect || this.gainNode;
        source.buffer = buffer;
        source.connect(connect);
        return source;
    }

    getSources(sources, context = this.context) {
        if (!this.hasLoaded(sources)) {
            console.error('not all sources loaded!!!');
            return [];
        }
        return sources.map(source => this.getSource(this.buffers[source].buffer));
    }

    // loads a sound file into the context
    loadSource(src, context = this.context) {
        return this.getBuffer(src, context)
            .then(decodedData => this.getSource(decodedData));
    }

    // loads multiple sources into the context
    loadSources(sources, context = this.context) {
        sources.forEach((source, i) => {
            if (!source) {
                console.warn(`note at index ${i} cannot be played!`);
            }
        })
        return Promise.all(sources.filter(source => !!source).map(source => this.loadSource(source, context)));
    }

    hasLoaded(sources, context = this.context) {
        return sources.reduce((allLoaded, src) => {
            return allLoaded && this.buffers[src] && this.buffers[src].context === context
        }, true);
    }

    playSounds(sounds, deadline = 0, interval = 0) {
        sounds.forEach((sound, i) => sound.start(deadline + interval * i))
    }

    playSource(source, settings) {
        const gainNode = this.context.createGain();
        if (!this.buffers[source]) {
            console.warn('no buffer found for source', source);
            return;
        }
        const sound = this.getSource(this.buffers[source].buffer, gainNode);
        const [attack, decay, sustain, release, duration, gain] =
            [
                settings.attack || this.attack,
                settings.decay || this.decay,
                settings.sustain || this.sustain,
                settings.release || this.release,
                (settings.duration || this.duration) / 1000,
                (settings.gain || 1) * this.gain
            ]
        const time = settings.deadline || this.context.currentTime;
        //gainNode.gain.value = typeof settings.gain === 'number' ? settings.gain : this.gain;
        gainNode.connect(this.mix);
        adsr({ attack, decay, sustain, release, gain, duration, }, time, gainNode.gain);
        this.playSounds([sound], settings.deadline || 0, 0)
    }

    /* playSources(sources, deadline = 0, interval = 0) {
        if (this.hasLoaded(sources, this.context)) {
            this.playSounds(this.getSources(sources, this.context), deadline, interval)
        } else {
            console.warn('need to load');
            this.loadSources(sources, this.context)
                .then(sounds => this.playSounds(sounds, deadline, interval));
        }
    } */

    playKeys(keys: number[], settings) {
        super.playKeys(keys, settings);
        keys.map(key => {
            this.playSource(this.sources[key], settings);
        });
    }
}