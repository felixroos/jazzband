# jazzband

This package contains a jazz band that is able to accompany your playing!

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

```ts
import * as jazz from 'jazzband';
const context = new AudioContext();
const band = new Trio({context});
band.comp(['D-7', 'G7', 'C^7', 'C^7'], { bpm: 120 });
```

The above snippet will setup the default Trio which is a Robot Rhythm Section playing only Synthesizers 🤖 🎹.

### Sampler
If you want better sound, try the Sampler Instrument:

```ts
import { piano } from 'jazzband/demo/samples/piano';
import { drumset } from 'jazzband/demo/samples/drumset';
// create keys from piano samples with correct offset
const keys = new jazz.Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
// TODO: also be able to add pitch range e.g. ['C1','C6']
// create drums from drum samples
const drums = new jazz.Sampler({ samples: drumset, context, gain: 0.7 });
// pass samplers to trio as instruments
const band = new Trio({context, piano, bass:piano,drums});
band.comp(['D-7', 'G7', 'C^7', 'C^7'], { bpm: 120 });
```

## Rhythm

The first argument of the comp method accepts an array of measures. If you want multiple chords per measure, you can just use arrays:

```ts
band.comp([['D-7','G7'],['C^7']]);
// comps two bars
// TODO: set exact to true if no groove given
```
