import WAAClock from 'waaclock';

export class Pulse {
    defaults = {
        bpm: 120,
        cycle: 4,
        delay: 0
    }
    props: any;
    context: any;
    clock: any;
    events = [];
    callbackAtTime: false;
    constructor(
        props
    ) {
        this.props = Object.assign({}, this.defaults, props);
        this.context = this.props.context || new AudioContext();
        this.clock = this.props.clock || new WAAClock(this.context, { toleranceEarly: 0.1, toleranceLate: 0 });
    }

    getMeasureLength(bpm = this.props.bpm, beatsPerMeasure = this.props.cycle) {
        return 60 / bpm * beatsPerMeasure;
    }

    arrayPulse(children, length = 1, path = [], start = 0, callback) {
        if (!Array.isArray(children)) {
            if (children === 0) {
                return 0;
            }
            const item = {
                value: children,
                length,
                path,
                start,
                pulse: this,
                cycle: this.props.cycle,
                timeout: null
            };
            start += this.props.delay;
            if (this.callbackAtTime) {
                start += this.context.currentTime;
                item.timeout = this.clock.callbackAtTime((event) =>
                    callback(Object.assign(item, { event, deadline: event.deadline })), start);
            } else {
                item.timeout = this.clock.setTimeout((event) =>
                    callback(Object.assign(item, { event, deadline: event.deadline })), start);
            }
            this.events.push(item.timeout);
            return item;
        }
        const childLength = length / children.length;
        return {
            length,
            children: children.map((el, i) =>
                this.arrayPulse(
                    el,
                    childLength,
                    path.concat([i]),
                    start + i * childLength,
                    callback
                )
            )
        };
    }

    tickArray(array, callback, length?) {
        const l = length || this.getMeasureLength() * array.length;
        this.clock.start();
        return this.arrayPulse(array, l, [], 0, callback);
    }


    start() {
        console.log('start with', this.events.length, 'events');
        const criticalEvents = 6000;
        if (this.events.length > criticalEvents) {
            console.warn('more than ', criticalEvents, 'events received. Consider using less "times" to keep the timing precies');
        }
        this.clock.start();
    }

    stop() {
        this.clock.stop();
    }

    changeTempo(newTempo, timeout = 0.2) {
        const factor = this.props.bpm / newTempo;
        this.props.bpm = newTempo;
        const events = this.events.filter(e => {
            return e.deadline - this.context.currentTime > timeout;
        });
        // TODO: stretch durations?!
        this.clock.timeStretch(this.context.currentTime, events, factor)
    }
}