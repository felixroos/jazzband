# Patterns

This document tries to find a way to generate melodic patterns.
Run ```npm run demo-patterns``` to get a playground to listen to them and to render them graphically.

## Definition

A Pattern is a small melodic fragment. It can be described by using positions within a scale:

- `1 2 3 5` within C major would be `C D E G`.
- `1 2 3 5` within G minor would be `G A Bb D`.
- `1 5 3` within C would be `C G E`.

Instead of a scale, a chord could also be used:

- `1 2 3 5` within C-7 would be `C D Eb G`.
- `1 2 3 5` within G-7b5 would be `G Ab Bb Db`.

### Problem with chord scales

Inside chords, the notes that are not part of the chord directly (e.g. 2 in -7b5) are not clearly defined. So we first would need to determine the scale that should be used for the chord. This is rather complicated because it depends on the function of the chord which scale fits best:

In the progression `C^7 | D-7 G7 | E-7`, the D-7 is the second degree inside C^7, meaning the dorian scale would fit best. The E-7 is the third degree with a phrygian scale being the most common.

## Direction

We could add minus or plus signs to the pattern to indicate an intended directional movement. Imagine we want the root note, its fith above and then the third between, like: C3 G3 E3.

- local expression: `1 5 -3`
- global expression: `1 5 3`
- nearest expression: `1 +5 3`

Those three options all have the same goal but a different interpretation:

- local: a minus sign tells that this note should be landed on coming from above.
- global: a minus sign tells that this note is below the one
- nearest: no signs means the nearest note, a plus the note above, a minus the note below.
- absolute: no signs, but bigger

To decide which one is the best, lets look at more examples:

_seventh up to one_

- local: `1 3 5 7 1`
- global: `1 3 5 7 +1`
- nearest: `1 3 5 7 1`
- absolute: `1 3 5 7 8`

_seventh down_

- local: `1 -7 -5 -3`
- global: `1 -7 -5 -3` or `+1 7 5 3`
- nearest: `1 7 5 3`
- absolute: `8 7 5 3`

_Equinox_

- local: `5 3 -1`
- global: `-5 3 1` or `5 +3 +1`
- nearest: `5 +3 1`
- absolute: `5 10 1`

_Blues line (going up to #11) [1,#11,4,b3,1]_

- local: `1 #11 -4 -b3 1`
- global: `1 #11 4 b3 1`
- nearest: `1 #11 4 b3 1` (#11 is equally away, but default would be up..)
- absolute: `1 #4 4 b3 1`

_Blues line (going down to #11) [1,#11,4,b3,1]_

- local: `1 -#11 -4 -b3 -1` => 1 and -1 is same note...
- global: `1 -#11 -4 -b3 -1` or `+1 #11 4 b3 1`
- nearest: `1 -#11 4 b3 1` (#11 is equally away, but default would be up..)
- absolute: `8 #4 4 b3 1`

_Blue Bossa_:

- local: `1 +1 -7 -6 -5 -4`
- global: `1 +1 7 6 5 4`
- nearest: `1 +1 7 6 5 4`
- absolute: `1 8 7 6 5 4`

_Octave pyramid `C2 C3 C4 C3 C2`_

- local `1 +1 +1 -1 -1`
- global: `1 +1 ++1 +1 1`
- nearest: `1 +1 +1 -1 -1`
- absolute: `1 8 15 8 1`

_Double Octave jump `C2 C4 C2`_

- local `1 ++1 --1`
- global: `1 ++1 1`
- nearest: `1 ++1 --1`
- absolute: `1 15 1`

_Triple octave scale_

- local: `1 2 3 4 5 6 7 1 2 3 4 5 6 7 1 2 3 4 5 6 7`
- global: `-1 -2 -3 -4 -5 -6 -7 1 2 3 4 5 6 7 +1 +2 +3 +4 +5 +6 +7`
- nearest: `1 2 3 4 5 6 7 1 2 3 4 5 6 7 1 2 3 4 5 6 7`
- absolute: `1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21`

Pros and cons:

- local: pro: easy concept, contra: many minus signs needed when going down + same note can look different
- global: pro: same notes look alike, less signs. contra: needs minus and plus signs
- nearest: pro: very few signs needed. contra: complicated concept
- absolute: pro: no signs needed. contra: higher numbers are less intuitive

In the end, the global method seems the most logical, and the absolute the most simple.
Because most patterns do use up more than two octaves, the absolute should suffice.

## Transposition

### Absolute Transposition

When practising patterns, one would want to practise it in multiple keys. After completing a pattern in one key, the player would progress to the next key by moving up or down a specific interval, e.g playing major triads, progressing with fourths:

- the pattern would be `1 3 5`
- the transposition would be 5 semitones

starting with C, the result is

```
C E G
F A C
Bb D F
Eb G Bb
Ab C Eb
F# A# C#
B D# F#
E G# B
A C# E
D F# A
G B D
```

### Relative Transposition

Instead of playing the exact same pattern from different start notes, we could play the pattern inside a tonality, adapting it to the notes that are inside. The transposition parameter is then a degree and not an interval

`1 3 5` within C major, progressing in fourths could be:

```
C E G
F A C
B D F
E G B
A C E
D F A
G H D
```

At `B D F`, the fourth is diminished to stay inside C major. The triads are also minor/major/diminished based on the tonality.

## Range

When we would want to render patterns to notes, we need to add octaves to the pitch classes.
If we would simply apply the intervals as is, the sequence would quickly leave the range of a normal instrument.
To solve this problem we must add jumps at certain spots to remain in the range.

### Interval permutations

A simple approach would be a permutation of all possible intervals, e.g. a C triad (`C E G`) would have the following combinations within the interval limit of one octave:

- C3 E3 G3 = 3M 3m
- C3 E3 G2 = 3M -6M
- C3 E2 G2 = -6m 3m

Of course, we could allow jumps higher than an octave, but those are uncommon for melodic movements.

#### Get all possible permutations

To decide which permutation should be used we need a given range, e.g. `['C2', 'C4']` and optionally a last played note e.g. `D2`. Goals:

- All notes must be inside the range
- The best permutation is the one with the smallest last to first note interval.

#### Without last played note

When having no last note given we could start on every note inside the range that has the pitch class of the first note in the pattern, for our example this would be C2, C3 and C4. For each possible start note, we can now render the following notes, using the interval permutations:

- C2: `C2 E2 G2`, `C2 E2 G1`, `C2 E1 G1`
- C3: `C3 E3 G3`, `C3 E3 G2`, `C3 E2 G2`
- C4: `C4 E4 G4`, `C4 E4 G3`, `C4 E3 G3`

After removing the patterns that contain notes out of range:

- C2: `C2 E2 G2`
- C3: `C3 E3 G3`, `C3 E3 G2`, `C3 E2 G2`
- C4: `C4 E3 G3`

So we would have 5 possibilities to play C major inside our range.

#### With last played note

When having a last played note given, e.g. `D3`, we can further narrow down the choices by calculating the semitones from it to the first note:

- C2: 14
- C3: -2
- C4: 10

This eliminates C2 as start note because it is over our limit of one octave, leaving us four choices:

- C3: `C3 E3 G3`, `C3 E3 G2`, `C3 E2 G2`
- C4: `C4 E3 G3`

Another more performant way to get those start notes would be to narrow down the range to the last played note minus and plus one octave:

- from: D3 - 1 octave = D2
- to: D3 + 1 octave = D4

All C's inside `['D2', 'D4']` are C3 and C4.

### More Properties for filtering/sorting

We could add more properties to our analysis to help us find the best match.

#### number of direction changes

- C3 E3 G3 = 3M 3m = 0 direction changes
- C3 E3 G2 = 3M -6M = 1 direction change
- C3 E2 G2 = -6m 3m = 1 direction change

If we would now sort the permutations by direction change, we would get `C3 E3 G3` as the definitive winner, being the only one without direction change.

#### number of jumps

The number of jumps could describe the number of deviations to the original pattern:

- C3 E3 G3 = 3M 3m = 0 jumps
- C3 E3 G2 = 3M -6M = 1 jump
- C3 E2 G2 = -6m 3m = 1 jump

This looks the same like direction changes, but depending on the pattern, it differs.

For example when having a pattern that already has direction change in it like [1,5,3]:

- C3 G3 E3 = `[1,5,3]` = 0 jumps (1 direction change)
- C3 G2 E2 = `[8,5,3]` = 1 jump (1 direction change)
- C4 G3 E3 = `[8,5,3]` = 1 jump (1 direction change)

The number of jumps can be seen as the numer of points where the original pattern is altered in octave. The intention of the original pattern is based on its default direction (see chapter of direction).
Lets keep the notes, but change the direction to [8,5,3]

- C3 G3 E3 = `[1,5,3]` = 1 jump => from C to G
- C4 G3 E3 = `[8,5,3]` = 0 jumps
- C3 G2 E2 = `[8,5,3]` = 0 jumps

If we only want to go up `[1,5,10]`:

- C3 G3 E3 = 5P -3m = 1 jump `[1,5,3]`
- C3 G2 E2 = -4P 3m = 2 jumps `[8,5,3]`
- C4 G3 E3 = -4P -3m = 2 jumps `[8,5,3]`

As we see, the original intention does not fit in the range of `['D2', 'D4']` at all:

- C2 G2 E3 = 0 jumps => first note too low
- C3 G3 E4 = 0 jumps => last to too high

#### total number of semitones moved

- C3 E3 G3 = 3M 3m = 7 semitones moved
- C3 E3 G2 = 3M -6M = 13 semitones moved
- C3 E2 G2 = -6m 3m = 12 semitones moved

Sorting by that property would also give as the root position as winner.

#### semitones moved from first to last note

- C3 E3 G3 = 3M 3m = 7 semitones moved
- C3 E3 G2 = 3M -6M = -5 semitones moved
- C3 E2 G2 = -6m 3m = -5 semitones moved

Sorting by the absolute value of this property we would get the two non root positions as winner!

#### semitone distance between lowest and highest note

- C3 E3 G3 = 3M 3m = 7 semitones distance
- C3 E3 G2 = 3M -6M = 9 semitones distance
- C3 E2 G2 = -6m 3m = 8 semitones distance

This property is again won by the root position

#### more options

- prefer specific intervals e.g. sort by number of sixths
- use min/max values

### Limitations of Permutation

Permutations can quickly become very expensive when the number of items increases. Here are some ideas to keep the number small:

- bigger patterns could be split into smaller chunks
- the filter mechanism of permutation must be very strict.
- a permutation calculation could also be quit as soon as a valid candidate has been found.

## Approach Notes

Often times a pattern doesn't have enough notes to fill a bar. This is where approach notes come in. Keeping the example triads moving in fourths, we would need an extra note to fill 4 beats.

_Rule of Thumb_: An approach note should always be different from the notes that were played before and after

### Chromatic Approach Notes

A Good way to fill this missing note is to use an approach note that is a half step above or below the next start note:

- `C E G Gb> F A C B> Bb D F E> ...` chromatic approach from above
- `C E G E> F A C A> Bb D F E> ...` chromatic approach from below

This approach always works and is independent of the current tonality.

### Diatonic Approach Notes

Instead of always using half steps to approach, we could use the next diatonic note above or below:

- `C E G G> F A C C> Bb D F F> ...` diatonic approach from above
- `C E G E> F A C A> Bb D F D> ...` diatonic approach from below \*

\* This approach equals the chromatic approach from below

In this example, approaching ƒrom above would not work well because of the repeated note. Lets progress in seconds:

- `C E G E> D F# A F#> E G# B G#> ...` diatonic approach from above
- `C E G C> D F# A D> E G# B E> ...` diatonic approach from below

This example works in both cases. Another possibility would be to calculate the diatonic approach inside the approached tonality:

- `C E G E> D F# A F#> E G# B G#> ...` diatonic approach from above
- `C E G C#> D F# A D#> E G# B E> ...` diatonic approach from below

while the approach from above stays the same because of the common note, the approach from below is now a half step.

### Doubling Pattern Notes

Another way to "approach" the next pattern would be to double the notes inside the pattern that are closest to the approached note:

- `C E G C> F A C F> Bb D F Bb> ...` pattern approach from above
- `C E G E> F A C A> Bb D F D> ...` pattern approach from below \*

\* This approach equals the chromatic and diatonic approach from below

Like with the diatonic approach, we can also use a pattern note of the next pattern to approach with:

- `C E G A> F A C D> Bb D F D> ...` pattern approach from above
- `C E G C> F A C F> Bb D F Bb> ...` pattern approach from below \*

\* This approach looks like the pattern approach from above within the origin pattern but would need to be an octave lower to approach from below.

### Approach Notes inside one tonality

Lets imagine the pattern `1 2 3` inside c major with possible approach notes:

- C D E (Eb/C#/C)
- D E F (D#/D) \*
- E F G (Gb/E)
- F G A (Ab/F#/F)
- G A B (Bb/G#/G)
- A B C (Bb/A) \*
- B C D (Db/B)
- (C)

As we see, some patterns have less approach options as others. Also, some approach options play multiple roles.

### Approach Notes between pattern notes

Now lets look at inserting approach notes between individual pattern notes.
A C major triad could be approach that way

- `C (D/D#/F/G) E (F/F#/Ab/A/C) G`

The roles of the different approach notes are:

From C to E:

- D: diatonic approach below
- D#: chromatic approach below
- F: diatonic approach above + chromatic approach above
  (- G: pattern approach above)

From E to G:

- F: diatonic approach below
- F#: chromatic approach below
- Ab: chromatic approach above
- A: diatonic approach above
  (- C: pattern approach above)

Now we have many nearly endless options, depending on the number of notes we fill in. In practise, approaches are often shaped similarly. This helps us narrow down the choices.

### One note approach

Those are the options if we always use the same type of approach for each note:

- C D E F G => diatonic approach below
- C D# E F# G => chromatic approach below
- C F E A G => diatonic approach above
- C F E Ab G => chromatic approach above

### Two note approach

If we want to always approach first from above and then below, we have the following options:

C to E:

- C F D# E
- C F D E

E to G

- E A F# G
- E Ab F# G
- E A F G
- E Ab F G

When playing those possibilities, we notice that the diatonic approaches have less movement than the chromatic approaches. Most jazz players would first approach diatonic and then chromatic to create tension.

### Below and above

The effect of approaching below or above depends on the direction of the melody. For example, if we add an approach note between C and E, the effect of a chromatic approach below is different than approaching C from E:

- C D# E
- E B C

The functional equivalents would be:

- C D# E (going up)
- E Db C (going down)

So the function depends on the direction of the pattern notes itself.
To abstract that, we could talk of same direction and opposite:

- C D# E (chromatic approach same direction )
- C D E (diatonic approach same direction)
- C F E (chromatic+diatonic approach opposite direction)

#### Example

Back to the C major triad one note approach example:

- C D E F G => diatonic approach same direction
- C D# E F# G => chromatic approach same direction
- C F E A G => diatonic approach opposite direction
- C F E Ab G => chromatic approach opposite direction

If we now would want a similar effect for a triad going down:

- G F E D C => diatonic approach same direction
- G F E Db C => chromatic approach same direction
- G D E B C => diatonic approach opposite direction
- G D# E B C => chromatic approach opposite direction

## Generating Patterns

https://www.youtube.com/watch?v=CEtz15mK7nc
https://www.youtube.com/watch?v=lVzhBqiGoY0

## The zig zag problem / degrees vs positions

Imagine we want a zig zag pattern like this on a C major scale:

notes: C-E D-F E-G F-A G-B A-C B-D (C)
degrees: 1-3 2-4 3-5 4-6 5-7 6-8 7-9 (8)

What if we want to practise the same idea over a C minor pentatonic scale?

notes: C-F Eb-G F-Bb G-C Bb-Eb C
intervals: 4P -2 3 -2 4 -3m 4 -2 4 -3m
steps: 1-4 b3-5 4-b7 5-1 b7-b3 1
degrees: 1-4 3-5 4-7 5-1 7-3 1

As we can see, the intervals/steps/degrees are different from one another, but the idea is kind of the same:
Take the scale, play note 1 and 3, 2 and 4, 3 and 5 and so on..
The Problem: At this point, we see that the degree no longer represents our mental model. It only works as long as the scale degree matches the note position. So we can use that "position" as a alternative and most times better way to describe patterns:

- position 3 of a C major scale is E (degree 3)
- position 3 of a C minor pentatonic scale is G (degree 5)

To describe the zig zag pattern with positions it is simply:
1-3 2-4 3-5 4-6 5-7 6-8 7-9 (8) for the major scale
1-3 2-4 3-5 4-6 5-7 (6) for the minor pentatonic scale

As we see, the zig zag pattern expressed in positions looks equal when ignoring its length.
Due to the fact that a pentatonic scale has only 5 notes, we can stop when the 6ths note is reached (which is the first note again). With the major scale we have to continue further to get all notes played. This issue will we discussed in the implementation.

## Implementation

### Simple patterns

Lets warm up by implementing a simple pattern rendering function:

```js
getPositions(positions, array) {
  return positions.map(p => array[(p - 1) % array.length]);
}
```

And yes, positions start with 1, because thats the musical norm.

Example usage:

```js
getPositions([1, 3, 5], cMajor); // [C, E, G]
getPositions([5, 3], cMinor); // [G, Eb]
```

This method will build the basis of everything that follows!

### Nested Patterns

Most musical patterns are a combination of multiple simple patterns to a more complex one.
For example, misterioso, a blues head by Monk:

```
G E, A F, B G, A F // bar one
C A, D Bb, Eb C, D Bb // bar two
```

The most simple and meaningful way to analyze this is a movement over degrees 1, 2, 3, 2 playing the 5 and 3. The first bar is in c major and the second in f mixolydian.
So we could describe this as being two nested patterns:

```js
Pattern.getNested(cMajor, [1, 2, 3, 2], [5, 3]); // G E, A F, B G, A F
Pattern.getNested(fMixo, [1, 2, 3, 2], [5, 3]); // C A, D Bb, Eb C, D Bb
```

Implementation:

```js
getNested(array, parent, child) {
  return parent.map(i => getPositions(child.map(p => p + i - 1), array));
}
```

This will render the child pattern for each parent element, adding the positions to get the relative value.
For misterioso, the added positions would look like those:

```
[[1+5-1, 1+3-1], [2+5-1, 2+3-1], [3+5-1, 3+3-1], [2+5-1, 2+3-1]]
```

=

```
[[5, 3], [6, 4], [7, 5], [6, 4]]
```

## Relative Positional Transposition

Relative positional transposition means transposing a note inside a scale to another note of the scale by some number of positions:

inside c major:

- transposing D by 2 positions up yields F
- transposing G by 3 positions yields C

inside c minor pentatonic:

- transposing C by 2 positions up yields F
- transposing Eb by 2 positions up yields G

### Scale Shuffling

Often times, especially when practising, we would want to play through a scale by some regular order:

- c major regular order: C D E F G A B (C)
- c major "every other" note: C E G B D F A (C)
- c minor pentatonic "every other": C F Bb Eb G (C)

The label "every other" just means the next note will be two positions away.

The following function can be used to do this kind of shuffling:

```js
  static traverse(n, m, i = 0) {
    let order = [];
    while (!order.includes(i)) {
      order.push(i);
      i = (i + m) % n;
    }
    return order;
  }
```

This function will start with i, adding m inside a range n. it stops before the same number would appear twice. Examples:

```js
traverse(3, 0); // 0 => stops immediatly
traverse(3, 1); // 0, 1, 2 => default order => one by another
traverse(3, 1, 1); // 1, 2, 0 => default order, starting from index 1
traverse(3, 2); // 0, 2, 1 => skip every other index
traverse(4, 2); // 0, 2 => skip every other index with even number => not all numbers are represented
traverse(4, 2, 1); // 1, 3 => different start
```

as soon as n is divisable by m, not all numbers in the range will be outputted. See the musical examples for a more vivid picture. We can now apply this number shuffling to an array:

```js
traverseArray(array, move, start) {
  return traverse(array.length, move, start).map(i => array[i]);
}
```

Some examples:

```js
// musical
const chromatic = ['C', 'Db' /** ... all chromatic notes **/, , 'Bb', 'B'];
traverseArray(chromatic, 2); // [C, D, E, Gb, Ab, Bb] // GT / 2M stack
traverseArray(chromatic, 3); // [C, Eb, Gb, A] // dim7 / 3m stack
traverseArray(chromatic, 4); // [C, E, Ab] // aug / 3M stack
traverseArray(chromatic, 5); // [C, F, Bb, Eb, Ab, Db, Gb, B, E, A, D, G] // circle of 4ths
traverseArray(chromatic, 6); // [C, Gb] // tritone
// the following are the same as with 2 - 5 but reversed
traverseArray(chromatic, 7); // [C, G, D, A, E, B, Gb, Db, Ab, Eb, Bb, F] // circle of 5ths
traverseArray(chromatic, 8); // [C, Ab, E] // aug down / 6m stack
traverseArray(chromatic, 9); // [C, A, Gb, Eb] // dim7 down / 6M stack
traverseArray(chromatic, 10); //  [C, Bb, Ab, Gb, E, D] // GT down / 7m stack

traverseArray(major, 2); //  [C, E, G, B, D, F, A] // thirds
traverseArray(major, 3); //  [C, F, B, E, A, D, G] // fourths
traverseArray(major, 4); //  [C, G, D, A, E, B, F] // fifths
traverseArray(major, 5); //  [C, A, F, D, B, G, E] // sixths
traverseArray(major, 6); //  [C, B, A, G, F, E, D] // sevenths

traverseArray(pentatonic, 2); //  [C, F, Bb, Eb, G] // every second
traverseArray(pentatonic, 3); //  [C, G, Eb, Bb, F] // every third
traverseArray(pentatonic, 4); //  [C, Bb, G, F, Eb] // every fourth
```

As we see, only using 5 or 7 results in all elements being present in the output. This happens because the number of items (12) is not dividable by those numbers. If the number of items is dividable, we get n duplicate blocks of the same items. Interestingly, the number of notes in major or pentatonic scales are prime, so any movement contains all notes!

### Regular Patterns

We can now generate more complex patterns by using simple patterns that are transposed relatively:

```js
function traverseNested(array, pattern, move = 1) {
  return Pattern.getNested(array, traverseArray(array, move), pattern);
}
```

This function will traverse the array and apply the given pattern relative to each note.

Example Values:

```js
 traverseNested(major, [1, 3]); // C,E D,F E,G F,A G,B A,C B,D
 traverseNested(chromatic, [1, 5], 2); // C,E D,F# E,G# Gb,Bb Ab,C Bb,D
 traverseNested(cMinorPenetatonic, [1, 3], 1)
 // => [[C, F], [Eb, G], [F, Bb], [G, C], [Bb, Eb]]
 traverseNested(cMajor, [1, 3], 1)
 // => [[C, E], [D, F], [E, G], [F, A], [G, B], [A, C], [B, D]]
 traverseNested(cMajor, [1, 3, 5]) == [C, E, G]
 traverseNested(cMajor, [2, 4, 6]) == [D, F, A]
 traverseNested(cMajor, [1, 3, 5], 1)
 // => [[C, E, G], [D, F, A], [E, G, B], [F, A, C], [G, B, D], [A, C, E], [B, D, F]]
 traverseNested(cMajor, [1, 3, 5], 3)
 // => [[C, E, G], [F, A, C], [B, D, F], [E, G, B], [A, C, E], [D, F, A], [G, B, D]]
 traverseNested(cMajor, [1, 2, 3, 1], 1) => clarke 2
```

## Musical Fractals

Image this:

```js
Pattern.getNested(major, [1, 3, 5], [1, 3, 5]); // C,E D,F E,G F,A G,B A,C B,D
```

## Using Bjorklund algorithm for musical patterns

The bjorklund algorithm is used to get the most even distribution n pulses over m steps.

https://tidalcycles.org/index.php/Tutorial
https://erikdemaine.org/papers/DeepRhythms_CGTA/paper.pdf
http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf

Examples

```js
bjorklund(12, 0); // nothing
bjorklund(12, 1); // one note
bjorklund(12, 2); // tritone, duality
bjorklund(12, 3); // augmented, trinity
bjorklund(12, 4); // diminished, tetraktys
bjorklund(12, 5); // [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0] pentatonic scale (when rotated)!
bjorklund(12, 6); // every other
bjorklund(12, 7); // [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1] ionian family (when rotated)
bjorklund(12, 8); // [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1] HTGT / GTHT depending on rotation
bjorklund(12, 9); // [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1] ?? augmented inverted
bjorklund(12, 10); // [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1] all except two
bjorklund(12, 11); // [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] all except one
bjorklund(12, 12); // everything

bjorklund(7, 3); //[1, 0, 1, 0, 1, 0, 0] // triad 135 136 146
bjorklund(7, 4); //[1, 0, 1, 0, 1, 0, 1] // seventh chord 1357
bjorklund(7, 5); //[1, 0, 1, 1, 0, 1, 1] // pentatonic (rotated)
bjorklund(7, 6); //[0, 1, 1, 1, 1, 1, 1] // all except one
```

taken from https://gist.github.com/withakay/1286731

```js
/*
An implementation of the Bjorklund algorithm in JavaScript
Inspired by the paper 'The Euclidean Algorithm Generates Traditional Musical Rhythms' 
by Godfried Toussaint

This is a port of the original algorithm by E. Bjorklund which I
found in the paper 'The Theory of Rep-Rate Pattern Generation in the SNS Timing Systems' by
E. Bjorklund.
Jack Rutherford
*/

function bjorklund(steps, pulses) {
  steps = Math.round(steps);
  pulses = Math.round(pulses);

  if (pulses > steps || pulses == 0 || steps == 0) {
    return new Array();
  }

  pattern = [];
  counts = [];
  remainders = [];
  divisor = steps - pulses;
  remainders.push(pulses);
  level = 0;

  while (true) {
    counts.push(Math.floor(divisor / remainders[level]));
    remainders.push(divisor % remainders[level]);
    divisor = remainders[level];
    level += 1;
    if (remainders[level] <= 1) {
      break;
    }
  }

  counts.push(divisor);

  var r = 0;
  var build = function(level) {
    r++;
    if (level > -1) {
      for (var i = 0; i < counts[level]; i++) {
        build(level - 1);
      }
      if (remainders[level] != 0) {
        build(level - 2);
      }
    } else if (level == -1) {
      pattern.push(0);
    } else if (level == -2) {
      pattern.push(1);
    }
  };

  build(level);
  return pattern.reverse();
}
```

## Pattern Snippets

e.g. 

```
"chromatic" <saw(12,5)>
"major" <saw(8,3)> + <1 3 5>
```


## Math Stuff

https://mauriciopoppe.github.io/function-plot/
  https://mauriciopoppe.github.io/greuler

https://github.com/mauriciopoppe/math-codegen !!
https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html#689




https://www.youtube.com/watch?v=V5tUM5aLHPA

https://www.youtube.com/watch?v=xBaA-iTYwi4

Algorithms from Fractmus to generate numbers:
https://en.wikipedia.org/wiki/Thue%E2%80%93Morse_sequence
https://de.wikipedia.org/wiki/Collatz-Problem
https://en.wikipedia.org/wiki/Chaos_theory
https://www.youtube.com/watch?v=FYE4JKAXSfY (Lorentz Attraktor)
https://www.youtube.com/watch?v=JhHugpABjDo (Hopalong Attraktor)
https://www.youtube.com/watch?v=PtfPDfoF-iY (Logistic Map)
https://www.youtube.com/watch?v=5k18BuEES34 (Gingerbreadman Map) !

https://en.wikipedia.org/wiki/List_of_chaotic_maps
http://softology.com.au/voc.htm !

## Rendering

http://twgljs.org/