# leadsheet

This package contains the Sheet module which can be used to handle musical leadsheets (and other control flows) in json and text format.

- Snippet: text format, usable for quick and easy input and storage of sheets
- Sheet/Measure: JSON Format, usable for parsing / rendering / playing sheets
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

- body: contains any value
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
