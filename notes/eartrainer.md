# Ear Trainer

In this file, I collect ideas about a way to implement ear training with jazzband.

## General Ear Training Disciplines

### Interval Recognition

- harmonic or Sequential
- also more than one possible

## Chord Recognition

- harmonic or sequential or permutation
- chord progressions
- voicing recognition

## Scale Recognition

- sequential or permutation or chord/interval progression

## Restricting available questions/answers

To restrict the available symbols, the ear trainer could just use the symbols defined in the current tune.

### Selecting Tunes to train with

To have a better control over the trained material, be able to filter/sort all tunes by:

- using symbols: only tunes using the given symbols will be returned: ```['-7', '7', '^7']```
- using progression: ```['II-7','V7','I^7']```
- using only given chords ```['C^7','D-7','G7']```
- using only given relative chords ```['I^7','II-7','V7']```

Another possibility would be add chord progressions that are optimized for ear training purposes.

### Dictation Mode

1. Select Tune
2. The snippet will obfuscate all chords with a question mark.
3. The snippet will be played, either in tempo or one chord after the other via "play next" button.
4. The user has to replace the question marks with the actual chords used.
5. Pressing "Finish" will check the answer and tell the user

Instead of just playing the chords harmonically, other play variants are possible:

- play bass note + one random chord note > guess degree, interval or actual note
  - could be a guide tone line
- guess top note/degree/interval
- guess whole voicing degree structure e.g. 7,9,3,13 or intervals
- arpegiate chord notes in arbitrary order
- play chords with a drone organ

### Random Mode

1. Select Tune.
2. All chords are visible
3. A random chord will be played via "play random" button. The played state is not shown.
4. The user has to click on the chord that was played.

Play Variants:

- Extract all different chords from the tune.
- Extract all different chord symbols from the tune.
