import { Synthesizer } from './instruments/Synthesizer';

export class Metronome {
  sampler: any;
  ready: Promise<any[]>;
  synth: Synthesizer;

  constructor(mix) {
    this.synth = new Synthesizer({ type: 'sine', gain: 1, mix });
    this.ready = this.synth.ready;
  }
  count(pulse, bars = 1) {
    const count = new Array(bars).fill(
      [new Array(pulse.props.cycle).fill(1)]
    );
    return pulse.tickArray(count, ({ path, deadline }) => {
      this.synth.playKeys([path[2] === 0 ? 90 : 78], { deadline, duration: 0.01, attack: .01, release: .01, decay: .01, sustain: 1 });
    });
  }
}