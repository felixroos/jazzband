import { Pulse } from "..";
import { randomSynth } from "../util";

class AudioContext {
    constructor() {
        console.log('construct fake audio context');
    }
}

test('inits with default values', () => {
    const pulse = new Pulse({ context: new AudioContext() });
    expect(pulse.props.bpm).toBe(120);
    expect(pulse.props.cycle).toBe(4);
});

test('inits with default values', () => {
    const pulse = new Pulse({ context: new AudioContext() });
    const synth = randomSynth(pulse.context)
    /* pulse.tickArray([1, 1, 1, 1], () => {
        console.log('t');
    }); */
});