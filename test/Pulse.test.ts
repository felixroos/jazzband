import { Pulse, randomSynth } from "../dist";

test('inits with default values', () => {
    const pulse = new Pulse();
    expect(pulse.props.bpm).toBe(120);
    expect(pulse.props.cycle).toBe(4);
});

test('inits with default values', () => {
    const pulse = new Pulse();
    const synth = randomSynth(pulse.context)
    pulse.tickArray([1, 1, 1, 1], () => {
        console.log('t');
    });
});