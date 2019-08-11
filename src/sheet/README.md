# leadsheet

This package contains the Sheet module which can be used to handle musical leadsheets (and other control flows) in json and text format.

- Snippet: text format, usable for quick and easy input and storage of sheets
- Sheet/Measure: JSON Format, usable for parsing / rendering / playing sheets
- Rhythm: JSON Format, usable for quick and easy rhythm notation
- RealParser: Parses ireal pro format => access to thousands of songs
- TBD: abc parser
- TBD: musicXML parser

## Design Goals

- Keep it functional: inputs and outputs can be transformed using function chaining
- Keep it immutable: arrays/objects never change
- Keep it static: no class instances => outputs are primitives, objects or arrays
- strictly typed: typescript first
- Influenced by Tonal, Tidal Cycles and Impro-Visor

## Snippets

A Snippet is a textual representation of a leadsheet.

### Example

```ts
const snippet = `
|: E-7b5    | A7b9      | D-     | %          |
|  G-7      | C7        | F^7    | E-7b5 A7b9 |
|1 D-       | G-7       | Bb7    | A7b9       |
|  D-       | G7#11     | E-7b5  | A7b9      :|
|2 D-       | G-7       | Bb7    | A7b9       |
|  D- B7    | Bb7#11 A7 | D-     | %          |
`;
```

- Measures are seperated by "|"
- The measure body is seperated by spaces
- ":" signs repeat a section
- 1/2.. represent houses
- actual content is arbitrary

  - could be chords or melody or anything
  - the example uses ireal style chords
  - parsing is done by tonal in the jazzband package

#### All Supported Signs

- (DC)
- (DS) with (Segno) or (S)
- (Fine) or (Fi)
- (ToCoda) or (2Q)
- (Coda) or (Q)
- see Snippet.test for more examples
- implemented according to [formal semantics for music notation control flow](https://www.cs.cmu.edu/~music/mat/thesis/Formal_Semantics_for_Music_Notation_Control_Flow.pdf) page 6

### Snippet.expand

```js
Snippet.expand(snippet);
```

yields

```
|  E-7b5   | A7b9      | D-     | %          |
|  G-7     | C7        | F^7    | E-7b5 A7b9 |
|  D-      | G-7       | Bb7    | A7b9       |
|  D-      | G7#11     | E-7b5  | A7b9       |
|  E-7b5   | A7b9      | D-     | %          |
|  G-7     | C7        | F^7    | E-7b5 A7b9 |
|  D-      | G-7       | Bb7    | A7b9       |
|  D- B7   | Bb7#11 A7 | D-     | %          |
```

### Snippet.minify (uglify)

Uglifies a snippet to a compact string:

```js
Snippet.minify(
  `
      |: E-7b5    | A7b9      | D-     | x          |
      |  G-7      | C7        | F^7    | E-7b5 A7b9 |
      |1 D-       | G-7       | Bb7    | A7b9       |
      |  D-       | G7#11     | E-7b5  | A7b9      :|
      |2 D-       | G-7       | Bb7    | A7b9       |
      |  D- B7    | Bb7#11 A7 | D-     | x          |
      `,
  true // => url safe flag
);
```

yields

```
RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7Y11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7Y11_A7ID-Ix
```

This string only contains url safe chars and has no information loss. Without using the flag, the minifed version looks like this:

```
:E-7b5|A7b9|D-|x|G-7|C7|F^7|E-7b5 A7b9|1 D-|G-7|Bb7|A7b9|D-|G7#11|E-7b5|A7b9:|2 D-|G-7|Bb7|A7b9|D- B7|Bb7#11 A7|D-|x
```

### Snippet.format (beautify)

Beautifies a snippet to 4 cells per line with equal spacing. Works both with url safe and non url safe snippets:

```ts
Snippet.format(
  'RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7Y11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7Y11_A7ID-Ix'
);
// or
Snippet.format(
  ':E-7b5|A7b9|D-|x|G-7|C7|F^7|E-7b5 A7b9|1 D-|G-7|Bb7|A7b9|D-|G7#11|E-7b5|A7b9:|2 D-|G-7|Bb7|A7b9|D- B7|Bb7#11 A7|D-|x'
);
```

both yield

```
|: E-7b5    | A7b9      | D-     | x          |
|  G-7      | C7        | F^7    | E-7b5 A7b9 |
|1 D-       | G-7       | Bb7    | A7b9       |
|  D-       | G7#11     | E-7b5  | A7b9      :|
|2 D-       | G-7       | Bb7    | A7b9       |
|  D- B7    | Bb7#11 A7 | D-     | x          |
```

- no information is lost

### Snippet.parse

Converts a text snippet to JSON which is typed `Measure<string>[]`

```ts
Snippet.parse('D-7 G7 | C^7');
```

yields

```js
[['D-7', 'G7'], 'C^7'];
```

- note that the first bar is an array

When using signs:

```js
const parsed = Snippet.parse(`
|: C7  | F7 |1 C7 | C7 :|
            |2 C7 | C7  |
| F7   | F7 |  C7 | A7  |
| D-7  | G7 |  C7 | G7  |
`);
```

yields

```js
[
  { body: ['C7'], signs: ['{'] },
  'F7',
  { house: 1, body: ['C7'] },
  { body: ['C7'], signs: ['}'] },
  { house: 2, body: ['C7'] },
  'C7',
  'F7',
  'F7',
  'C7',
  'A7',
  'D-7',
  'G7',
  'C7',
  'G7'
];
```

All measures without signs remain strings. If you want the format unified, you can use Measure.from:

```js
parsed.map(measure => Measure.from(measure));
```

yields

```json
[
  { "signs": ["{"], "body": ["C7"] },
  { "body": ["F7"] },
  { "house": 1, "body": ["C7"] },
  { "signs": ["}"], "body": ["C7"] },
  { "house": 2, "body": ["C7"] },
  { "body": ["C7"] },
  { "body": ["F7"] },
  { "body": ["F7"] },
  { "body": ["C7"] },
  { "body": ["A7"] },
  { "body": ["D-7"] },
  { "body": ["G7"] },
  { "body": ["C7"] },
  { "body": ["G7"] }
]
```

This brings us seamlessly to the Measure Format:

## Measures

A Measure is an object representing one measure of a leadsheet.

Properties:

- body: contains a primitive (like a string) or a NestedRhythm (see below)
- signs: control signs like "{" or "DC"
- house: house number
- times: number of repeats (not supported by snippet yet)
- section: section name (not supported by snippet yet)
- See Measure.ts for all possible properties.

To render multiple Measures, you can use the Sheet namespace:

### Sheet.render()

Resolves all control signs/repeats/houses and outputs the rendered measures typed as `RenderedMeasure<string>[]`. The array elements can either be of type Measure or just primitives:

### Simple example:

```js
const measures = ['A', 'B', { body: ['C'], signs: ['Coda'] }];
// equals this snippet: "| A | B | (Coda) C |"
Sheet.render(measures, { forms: 3 });
```

generates

```js
[
  { body: ['A'], form: 0, index: 0, totalForms: 3 },
  { body: ['B'], form: 0, index: 1, totalForms: 3 },
  { body: ['A'], form: 1, index: 0, totalForms: 3 },
  { body: ['B'], form: 1, index: 1, totalForms: 3 },
  { body: ['A'], form: 2, index: 0, totalForms: 3 },
  { body: ['B'], form: 2, index: 1, totalForms: 3 },
  { body: ['C'], form: 2, index: 2, totalForms: 3 }
];
```

As you see, the measures are repeated three times due to the forms option. The last form jumps into the coda.

- body: content of measure
- form: current form
- index: original measure index
- total number of forms rendered

_Side Note_: Although you can use short signs like "(Q)" in a snippet, a measure will only accept "Coda" (see Snippet>controlSigns).

## Rhythm

### NestedRhythm

A NestedRhythm is an easy way to notate rhythms:

```js
const fourToTheFlour = ['A', 'C', 'E', 'G'];
const waltz = ['C', ['E', 'E'], ['G', 'G']];
const swingCymbal = [1, [2, 0, 1], 1, [2, 0, 1]];
const swingHihat = [0, 1, 0, 1];
```

- By using just nested arrays, you can express any musical rhythm
- The notation is very similar to normal musical notation
- Similar concept also used by TidalCycles (or see Tone#Sequence)
- The actual content can be any type

### Rhythm.flatten

Converts a NestedRhythm to a one dimensional Array of RhythmEvent:

```js
const swingCymbal = [1, [2, 0, 1], 1, [2, 0, 1]];
const cymbalEvents = Rhythm.flatten(swingCymbal);
```

outputs

```js
[
  { path: [0], divisions: [4], value: 1 },
  { path: [1, 0], divisions: [4, 3], value: 2 },
  { path: [1, 1], divisions: [4, 3], value: 0 },
  { path: [1, 2], divisions: [4, 3], value: 1 },
  { path: [2], divisions: [4], value: 1 },
  { path: [3, 0], divisions: [4, 3], value: 2 },
  { path: [3, 1], divisions: [4, 3], value: 0 },
  { path: [3, 2], divisions: [4, 3], value: 1 }
];
```

- now each element is on the same array level
- the nesting information moved to path/divisions

### RhythmEvent

A RhythmEvent consists of

- path: path of indices where the element was in the original nested array
- divisions: divisions in the original nested array
- value: the original value

Using the division/ path values, we can now calculate the time and duration of an event.

### Rhythm.time

Calculates time of a divisions / path pair:

```js
  Rhythm.time([4, 3], [1, 0]); // yields 0.25
  Rhythm.time([4, 3], [1, 0], 4); // beat 2 => yields 1
  Rhythm.time([4, 3], [1, 2], 4)); // third triplet on the 2, yields 1.666 = 1+2/3
```

- the third argument is the time of the whole sequence. If the unit is seconds, we would have a 4s measure, with 4 beats in the bar => 60bpm.

### Rhythm.duration

Calculates the duration of given divisions:

```js
Rhythm.duration([4, 3], 4)); // yields 1/3
Rhythm.duration([4, 2], 4)); // yields 1/2
```

- This method can be used to determine the length of a note
- the first one is the length of a triplet in 60bpm
- the second one is the length of an eights in 60bpm

### Rhythm.calculate

Calculates time and duration from a RhythmEvent.

```js
const calculated = Rhythm.flatten([1, [0, 3], 0, 1])
  .map(Rhythm.calculate(4))
  .map(({ time, duration }) => ({ value, time, duration }));
```

yields

```json
[
  { "value": 1, "time": 0, "duration": 1 },
  { "value": 0, "time": 1, "duration": 0.5 },
  { "value": 3, "time": 1.5, "duration": 0.5 },
  { "value": 0, "time": 2, "duration": 1 },
  { "value": 1, "time": 3, "duration": 1 }
]
```

- the time value is now the absolute time inside the defined 4s
- the duration is the length of the note inside the subdivision
- the numbers we passed in are currently not used, to interpret them as subdivision length, we can just map that:

```js
calculated.map(({ time, duration, value }) => ({
  time,
  duration: value * duration
});
```

which yields:

```json
[
  { "time": 0, "duration": 1 },
  { "time": 1, "duration": 0 },
  { "time": 1.5, "duration": 1.5 },
  { "time": 2, "duration": 0 },
  { "time": 3, "duration": 1 }
]
```

This mapping is so common that you can just use:

```js
calculated.map(Rhythm.useValueAsDuration);
```

This format can be used easily to schedule playback, e.g. using Tone.js.

### Rhythm.render

This function combines flatten and calculate into a handy helper:

```js
Rhythm.render([1, [0, 3], 0, 1], 4);
```

This yields the same result as shown above.

### Example: Bolero

As an example, lets examine the famous bolero rhythm:

```js
const bolero = [
  [
    [1, [1, 1, 1]], // bar 1 beat 1
    [1, [1, 1, 1]], // 1.2
    [1, 1] // 1.3
  ],
  [
    [1, [1, 1, 1]], // 2.1
    [1, [1, 1, 1]], // 2.2
    [[1, 1, 1], [1, 1, 1]] // 2.3
  ]
];
```

Compared that with the standard rhythm notation:

![bolero](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bolero_dance_pattern.png/1600px-Bolero_dance_pattern.png)

- As you see, it is a direct representation in array format
- you could even see the inner brackets as beams

We can now render it and play it back with Tone.js:

```js
const events = Rhythm.render(bolero, 3).map(e => ({ ...e, value: 'A3' }));

var synth = new Tone.MembraneSynth().toMaster();
const part = new Tone.Part(
  (time, event) => synth.triggerAttackRelease('C2', event.duration, time),
  events // <- flattens the nested array + adds time and duration
).start(0);
part.loop = true;
part.loopEnd = 6;
Tone.Transport.start('+1');
```

### Playback

The following function could be used to play notes with Tone.js:

```js
function playNotes(notes, cycle, synth) {
  const events = Rhythm.render(notes, cycle);
  const part = new Tone.Part((time, event) => {
    synth.triggerAttackRelease(event.value, event.duration, time);
  }, events).start(0);
  part.loop = true;
  part.loopEnd = cycle;
  Tone.Transport.start('+1');
}

var pluck = new Tone.PluckSynth().toMaster();
playNotes(['C3', 'D3', ['E3', 'G3']], 2, pluck);
```

### Polyrythms

Polyrhythm = different pulse, same duration

```js
playNotes(['C3', 'E3', 'G3'], 2, synth);
playNotes(['C2', 0, 'G2', 0], 2, synth2);
```

- The two Rhythms will be played in the same amount of time.
- Having two different pulses (3 and 4), this will create a polyrhythm

### Polymeter

Polymeter = same pulse, different length

```js
playNotes(['C3', 'E3', 'G3'], 3, synth);
playNotes(['C2', 0, 'G2', 0], 4, synth2);
```

- The two Rhythms will be played in the same amount of time.
- Having two different pulses (3 and 4), this will create a polyrhythm

### Rhythm.spm()

A little helper function to get the seconds per measure:

```js
// polymeter
playNotes(['C3', 'E3', 'G3'], Rhythm.spm(120, 3), synth);
playNotes(['C2', 0, 'G2', 0], Rhythm.spm(120, 4), synth2);
// polyrhythm
playNotes(['C3', 'E3', 'G3'], Rhythm.spm(120, 4), synth);
playNotes(['C2', 0, 'G2', 0], Rhythm.spm(120, 4), synth2);
```

### Rhythm.combine

addGroove(string[]): {[chord: string]: number[]}

```js
addGroove(['C7', 'F7']);
```

yields

```json
{
  "C7": [2, 0],
  "F7": [0, 2]
}
```

where each chord is mapped to its personal "track". Playing all the tracks at the same time should return a a seamless rhythm.


// https://mattwarnockguitar.com/jazz-rhythms/
// https://blog.zzounds.com/2018/03/02/machine-rhythms-roland-cr-78-compurhythm/