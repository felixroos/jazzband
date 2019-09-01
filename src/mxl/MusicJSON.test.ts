import { MusicJSON } from './MusicJSON';

test('getPitchPosition', () => {
  expect(MusicJSON.getPitchPosition({ step: 'C', octave: 1 })).toBe(7);
  expect(MusicJSON.getPitchPosition({ step: 'B', octave: 4 })).toBe(34);
  expect(MusicJSON.getPitchPosition({ step: 'D', octave: 3 })).toBe(22);
});

test('beams', () => {
  expect(MusicJSON.isRest({
    step: 'C'
  })).toBe(false);
  expect(MusicJSON.isRest({
  })).toBe(true);

  expect(MusicJSON.isBeamable(
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    })
  ).toBe(true);

  expect(MusicJSON.isBeamable(
    {
      step: 'C',
      octave: 3,
      duration: 'quarter',
      divisions: 2,
    })
  ).toBe(false);

  expect(MusicJSON.addBeams([
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    },
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    }
  ]).map(n => n.beam)).toEqual(['begin', 'end']);

  expect(MusicJSON.addBeams([
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    },
    {
      step: 'C',
      octave: 3,
      duration: 'quarter',
      divisions: 2,
    }
  ]).map(n => n.beam)).toEqual([undefined, undefined]);
  expect(MusicJSON.addBeams([
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    },
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    },
    {
      step: 'C',
      octave: 3,
      duration: 'eighth',
      divisions: 2,
    }
  ]).map(n => n.beam)).toEqual(['begin', 'continue', 'end']);
});