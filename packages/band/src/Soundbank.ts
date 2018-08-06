import WAAClock from 'waaclock';

export class Soundbank {
    buffers = {};
    onStop: any;
    context: AudioContext;
    overlap: any;
    clock: any;
    preload: Promise<[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]>;
    onTrigger: any;
    constructor(options: any = {}) {
        this.onTrigger = options.onTrigger || (() => { });
        this.onStop = options.onStop || (() => { });
        this.context = options.context || new AudioContext();
        this.overlap = options.overlap;
        this.clock = new WAAClock(this.context, { toleranceEarly: 0.1, toleranceLate: 0.1 });
        if (options.preload) {
            this.preload = this.loadSources(options.preload)
        }
    }

    trigger(indices) {
        this.onTrigger(indices); // TODO: fix
    }

    stop(indices) {
        this.onStop(indices); // TODO: fix
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

    getSource(buffer, context = this.context) {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        return source;
    }

    getSources(sources, context = this.context) {
        if (!this.hasLoaded(sources)) {
            console.error('not all sources loaded!!!');
            return [];
        }
        return sources.map(source => this.getSource(this.buffers[source].buffer, context));
    }

    // loads a sound file into the context
    loadSource(src, context = this.context) {
        return this.getBuffer(src, context)
            .then(decodedData => this.getSource(decodedData, context));
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
        if (!this.overlap) {
            //this.clock.stop();
        }
        if (!this.clock._started) {
            this.clock.start();
        }

        if (interval === 0) {
            this.trigger(sounds.map((s, i) => i));
        }
        sounds.forEach((sound, i) => {
            if (interval === 0) {
                sound.start(deadline);
            } else {
                this.clock.setTimeout((event) => {
                    this.trigger([i]);
                    sound.start(event.deadline);
                }, interval * i);
            }
            this.clock.setTimeout(() => {
                this.stop([i]);
            }, (interval * i) + sound.buffer.duration);
        })
    }

    playSources(sources, deadline = 0, interval = 0) {
        if (this.hasLoaded(sources, this.context)) {
            this.playSounds(this.getSources(sources, this.context), deadline, interval)
        } else {
            console.warn('need to load');
            this.loadSources(sources, this.context)
                .then(sounds => this.playSounds(sounds, deadline, interval));
        }
    }
}