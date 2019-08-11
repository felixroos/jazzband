import { SequenceOptions } from './Sequence';
import { Measures } from '../sheet/Measure';

export class Leadsheet {
  name?: string;
  composer?: string;
  style?: string;
  bpm?: number;
  repeats?: number;
  key?: string;
  chords?: Measures<string>;
  melody?: Measures<string>;
  options?: SequenceOptions;

  constructor(sheet: Leadsheet) {
    Object.assign(this, Leadsheet.from(sheet));
  }

  static from(sheet: Leadsheet): Leadsheet {
    sheet.options = sheet.options || {};
    return {
      ...sheet,
      options: {
        forms: 1,
        pedal: false,
        real: true,
        tightMelody: true,
        bpm: 120,
        swing: 0,
        fermataLength: 4,
        feel: 4,
        pulses: 4,
        ...sheet.options,
        humanize: {
          velocity: 0.1,
          time: 0.002,
          duration: 0.002,
          ...(sheet.options.humanize || {})
        },
        voicings: {
          minBottomDistance: 3, // min semitones between the two bottom notes
          minTopDistance: 2, // min semitones between the two top notes
          logging: false,
          maxVoices: 4,
          range: ['C3', 'C6'],
          rangeBorders: [1, 1],
          maxDistance: 7,
          idleChance: 1,
          ...(sheet.options.voicings || {}),
        },
      },
    }
  }
}

