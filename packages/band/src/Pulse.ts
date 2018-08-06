import WAAClock from 'waaclock';

export class Pulse {
    defaultProps = {
        bpm: 90,
        cycle: 4
    }
    props: any;
    context: any;
    clock: any;
    constructor(
        props
    ) {
        this.props = Object.assign({}, this.defaultProps, props);
        this.context = this.props.context || new AudioContext();
        this.clock = this.props.clock || new WAAClock(this.context, { toleranceEarly: 0.1, toleranceLate: 0.1 });
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
            };
            item['timeout'] = this.clock.setTimeout((event) =>
                callback(Object.assign(item, { event, deadline: event.deadline })), start);
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
        this.clock.start();
    }

    stop() {
        this.clock.stop();
    }
}