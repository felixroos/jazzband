# Grooves

This document tries to find a format to express grooves for different musical styles.

## Format

A groove is expressed in rhythmic "Tidal" Notation, e.g.:

```json
"[[1 5] 8 / /]"
```

- The above would be two eigths no notes followed by a half note with a dot (three beats long).
- The numbers, in this case for a bassline, tell which degree of the current chord/scale is played (see patterns for more on that)

### Problems

- How to express simultaneous notes? => use st  rings and ',' like Tidal?

### Multiple bar patterns

A groove could also be longer than a bar:

```json
"[
  [1 3 4 [0 1]]
  [[0 5] [0 b5] 4 0]
]"
```

The above groove (Smoke on the Water) has a length of two bars.

### randomness

A groove could also be passed as a generator function:

```js
() => [1, randomElement(3,5), 5, randomElement(3,5)]
```

The function could then be called, each time the groove is generated.

#### random chains

Shuffling could be effective to avoid doubling notes / omitting others:

```js
() => {
  const n = shuffle([1,3,5],[1]); // possible combinations 351 531 513 315
  return [1, n[0], n[1], n[2]]
}
```

syntax:

```js
shuffle(array, notFirst?, notLast?)
```

instead of notFirst/notLast, a filter function could be used for maximal freedom.


## Interpretation

The format can then be interpreted to be rendered to actual notes. The important questions to be answered are:

1. When should the groove be inserted?
2. Which scale should be used?

## Information

The following information could be given as a basis of interpretation:

### chords

The chords are given as an Array of SequenceEvents. Each event has a certain time when it occurs and a chord symbol. The time could act as a starting point (1) and the chord as root note for a scale (2).
Additionally, each event could contain a proposed scale that should be used.

### options

The options define how the groove should behave:

- loop: boolean. if true, the groove will loop as long as the next start triggers.
- loopStart: path where the loop begins, defaults to 0
- loopEnd: path where the loop ends (default: next 1 == length of groove)
- retrigger: boolean. if true, the groove will be triggered each time a chord starts
- lazy: boolean. if true, the retrigger will only occur when the chord has changed since the last trigger

## Example 1

Lets start with a simple bass groove:

- groove: ```[[1,3], 5, 8, '/']```
- chords: ['C^7', 'C^7', ['D-7', 'G7']]


### Setting 1

- options: ```{ loop:true, retrigger: true }```

```
[
  [['C2', 'E2'], 'G2', 'C3', '/'],
  [['C2', 'E2'], 'G2', 'C3', '/'],
  [[['D2', 'F2'], 'A2', ['G2', 'B2'] 'D3'],
```

- keeps melodic structure
- alters groove pace

### Setting 2

The same with options ```{ loop:true, retrigger: false }```
loopEnd defaults to path 1, as the groove is one bar long:

```
[
  ['C2', 'G2', 'C3', '/'],
  ['C2', 'G2', 'C3', '/'],
  ['D2', 'A2', 'G3', '/'],
```

- keeps groove pace
- alters melodic structure

### Problems

- How to handle retrigger: false when notes "lean over" the chord change? 
  - e.g. groove ```[1,5]``` (half notes) with chords ```['C6','A7','D-7','G7']``` (quarters)
  - => result ```['C','A']```. As soon as the A7 arrives, the C no longer fits, nor does the A on the G.
