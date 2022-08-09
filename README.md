# This lib has been archived!

I stopped working on this lib, as I moved to developing [strudel](https://github.com/tidalcycles/strudel).

---

# jazzband

This package contains a jazz band that is able to accompany your playing!

[🎹Demo](https://felixroos.github.io/jazzband/)

## Key Features

- _Grooves_ that reflect different playing styles

- _Instruments_ such as Synthesizer or Sampler

- _Musicians_: Pianist, Bassist and Drummer

- _Band_ with _Metronome_ countin

- _iReal_ parser

- _Modular_ by design

- Uses _tonal_ and _WAAClock_

## Installation

```shell
npm install jazzband --save
```

## Quick Start

### Hello 251

_index.js_

```js
import { Trio } from 'jazzband';
const context = new AudioContext();
const band = new Trio({ context });
const playButton = document.getElementById('play');
playButton.addEventListener('click', () => {
  band.comp({ chords: ['D-7', 'G7', 'C^7', 'C^7'] }, { bpm: 120 });
});
```

_index.html_

```html
<button id="play">PLAY</button>
<script src="index.js"></script>
```

The above snippet will setup the default Trio which is a Robot Rhythm Section playing only Synthesizers 🤖 🎹.

Note: The above code will need to be bundled, as imports are 

### Sampler

If you want better sound, try the Sampler Instrument:

```ts
import { piano } from 'jazzband/samples/piano';
import { drumset } from 'jazzband/samples/drumset';
// create keys from piano samples with correct offset
const keys = new jazz.Sampler({
  samples: piano,
  midiOffset: 24,
  gain: 1,
  context
});
// create drums from drum samples
const drums = new jazz.Sampler({ samples: drumset, context, gain: 0.7 });
// pass samplers to trio as instruments
const band = new Trio({ context, piano, bass: piano, drums });
band.comp(['D-7', 'G7', 'C^7', 'C^7'], { bpm: 120 });
```

## Rhythm

The first argument of the comp method accepts an array of measures. If you want multiple chords per measure, you can just use arrays:

```ts
band.comp([['D-7', 'G7'], ['C^7']]);
// comps two bars
```

## Util

util contains many functions that extend the tonal library by some handy harmony functions.

### Intervals

- `invertInterval(interval)`: inverts interval, e.g. 2M yields -7m
- `forceDirection(interval,direction)`: yields interval that goes in the given direction, e.g. forceDirection('-7M','up') returns '2m' (The target note is the same but the direction is forced)
- `minInterval`: Returns the smallest and simplest interval.
- `renderIntervals(intervals,root)`: Render all intervals on the given root

### Notes

- `getNearestNote(from,to,direction?)`: returns the nearest note (with octave).
- `getTonalChord(chord)` throw in non tonal chords (like -7) => get tonal readable chord

### Range

A Range is an array with the lowest note and highest note that can be played.

- `isInRange(note,range)`: returns true if the note is inside the given range (array with min max)
- `transposeToRange(notes, range)`: will transpose the given notes inside the given range
- `getRangePosition(note, range)`: Depends on where the note is inside the given range. e.g. returns 0 for first note 0.5 for middle note and 1 for top note.

### Steps

Extend intervals with widely used steps/degrees. The interval to step mapping is:

```js
{
    '1P': ['1', '8'],
    '2m': ['b9', 'b2'],
    '2M': ['9', '2',],
    '2A': ['#9', '#2'],
    '3m': ['b3'],
    '3M': ['3'],
    '4P': ['11', '4'],
    '4A': ['#11', '#4'],
    '5D': ['b5'],
    '5P': ['5'],
    '6m': ['b13', 'b6'],
    '6M': ['13', '6'],
    '7m': ['b7'],
    '7M': ['7', '^7', 'maj7']
};
```

The first being the more common name.

- `getStep(step)`: Returns unified step string. You can pass a number that will be flattened if negative e.g. -2 will output 'b9'.
- `getIntervalFromStep(step)`: Returns the interval that leads to the given step.
- `getStepInChord(note,chord,group?)`: e.g. getStepInChord('F#','C') yields #11
- `renderSteps(steps, root)`: Renders all steps on the given root.

### Degrees

A Degree is just a number describing a rough step (no matter if flat/sharp/augmented/diminished).
This concept can be helpful to e.g. generate patterns over all kinds of chords (See Patterns).

- `findDegree(degree, intervals)`: Returns the given degrees step. e.g `findDegree(2,['1P','2m','3M'])` is '2m'
- `hasDegree(degree, intervals)`: Returns true if the given degree is represented by the intervals.

### Symbols

Symbols collect all tonal symbols (chords and scales) to map additional information to them:

- short: the chord symbol that should be shown (e.g. △ for M)
- long: long name, like humans say it.
- groups: groups that the symbol is member of. The groups are provided for all kinds of classification.

- `scaleNames(group)`: Returns all scale names that have the given group
- `chordNames(group)`: Returns all chord names that have the given group
- `groupNames()`: Returns all group names

### Scales

- `getChordScales(chord,group)`: Returns all scales that contain the given chord (can be filtered by a Symbol group)

### Patterns

- `getPatternInChord`
- `getDigitalPattern`
- `renderDigitalPattern`
- `getGuideTones`

### Sheets

- `formatChordSnippet`
- `minifyChordSnippet`
- `parseChordSnippet`
