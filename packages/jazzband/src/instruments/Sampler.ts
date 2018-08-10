import { Instrument } from './Instrument';

export class Sampler extends Instrument {
    buffers = {};
    context: AudioContext;
    overlap: any;
    samples: Promise<any[]>;
    sources: any;
    gain: GainNode;
    constructor(options: any = {}) {
        super(options);
        this.gain = this.context.createGain();
        this.gain.connect(this.context.destination);
        // this.overlap = options.overlap;
        if (options.samples) {
            this.sources = options.samples;
            this.ready = this.loadSources(options.samples)
        }
    }

    setGain(value) {
        this.gain.gain.value = value;
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
        connect = connect || this.gain;
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

    playSource(source, { deadline, interval, gain }) {
        const gainNode = this.context.createGain();
        const sound = this.getSource(this.buffers[source].buffer, gainNode);
        gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
        gainNode.connect(this.mix);
        this.playSounds([sound], deadline, interval)
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