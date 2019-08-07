import { Sequence } from '../src/player/Sequence';
import { randomElement, randomNumberInRange } from '../src/util/util';
import { compingCombos, walkingFour } from './swing';

export const maidens = {
  melody: sequence => sequence.filter(e => e.type === 'melody'),
  bass: (sequence, options) =>
    Sequence.insertGrooves(
      [[[1, 5], 8, '/', '/'], [[1, 5], 8, '/', '/']],
      sequence.filter(e => e.type === 'bass'),
      Sequence.melodyGroove(),
      options
    ),
  chord: (sequence, options) =>
    Sequence.insertGrooves(
      [[0, 3, 0, 0]],
      sequence.filter(e => e.type === 'chord'),
      Sequence.chordGroove(),
      options
    ).reduce(Sequence.renderVoicings(options), [])
};

export const green = {
  melody: sequence => sequence.filter(e => e.type === 'melody'),
  bass: (sequence, options) =>
    Sequence.insertGrooves(
      [[1, 5, 3, 5]],
      sequence.filter(e => e.type === 'bass'),
      Sequence.melodyGroove(),
      options
    ),
  chord: (sequence, options) =>
    Sequence.insertGrooves(
      [[2, 0, 2, 0]],
      sequence.filter(e => e.type === 'chord'),
      Sequence.chordGroove(),
      options
    ).reduce(Sequence.renderVoicings(options), [])
};
export const bossa = {
  melody: sequence => sequence.filter(e => e.type === 'melody'),
  bass: (sequence, options) =>
    Sequence.insertGrooves(
      [[1, ['/', 5], 5, ['/', 1]]],
      sequence.filter(e => e.type === 'bass'),
      Sequence.melodyGroove(),
      { ...options, offsPlayNext: true }
    ),
  chord: (sequence, options) => {
    return Sequence.fillGrooves(
      [[1, 1, [0, 1], [0, 1]], [0, [0, 1], [0, 2], 0]],
      sequence.filter(e => e.type === 'chord'),
      Sequence.chordGroove(),
      { ...options, offsPlayNext: true }
    )
      .reduce(Sequence.renderVoicings(options), [])
      .concat(sequence.filter(e => e.type === 'chord'));
  }
};

export const swing = {
  melody: sequence => sequence.filter(e => e.type === 'melody'),
  bass: (sequence, options) =>
    Sequence.insertGrooves(
      source => {
        return [randomElement(walkingFour)];
      },
      sequence.filter(e => e.type === 'bass'),
      Sequence.melodyGroove(),
      options
    ),
  chord: (sequence, options) => {
    return Sequence.fillGrooves(
      () => randomElement(compingCombos),
      sequence.filter(e => e.type === 'chord'),
      Sequence.chordGroove(),
      { ...options, offsPlayNext: true }
    )
      .reduce(Sequence.renderVoicings(options), [])
      .concat(sequence.filter(e => e.type === 'chord'));
  }
};

/**
 *
 * OLD CODE TRYING TO TIMESHIFT
 */

/* .map((event, index) => {
        const timeshifts = [-0.5 + swing, 0.5 + swing];
        const timeshift = randomElement(timeshifts);

        const displace = {
          chance: 0.5,
          time: timeshift,
          duration: -timeshift,
          grid: 0.5
        };

        let { time, color, duration } = event;

        // duration shift
        if (Math.random() < displace.chance) {
          const step = (displace.grid * 60) / bpm; // one step in the grid
          const steps = duration / step; // event steps
          duration = randomNumberInRange(Math.max(2, steps - 2), steps) * step;
        }

        // timeshift
        if (index && Math.random() < displace.chance) {
          const shift = (displace.time * 60) / bpm;
          time += shift;
          duration -= shift;
          color = 'darkgreen';
        }
        return {
          ...event,
          color,
          duration,
          time
        };
      }) */
/* .map(Sequence.fixOverlappingEvents(options)) */

/* return Sequence.insertGrooves(
      () =>
        randomElement([
          [[2, 0, 2, 0]],
          [[0, 2, 0, 1]],
          [[1, [0, 3], 0, 0]],
          [[0, 0, 2, 0]]
        ]),
      sequence,
      Sequence.chordGroove(),
      { bpm: options.bpm }
    ); */
