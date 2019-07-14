# Overview

This document tries to sum up all parts of the jazzband project. Currently, there are many loose ends that need to be brought together.

## demos

- demo-tone
- demo
- demo-patterns

### demo-tone

uses jazzband with ToneJS. Test Lab for Sheetplayer API

- button to play random standard
- buttons for standards that play with melody
- uses SheetPlayer + Snippet + RealParser + iRealReader

### demo

uses jazzband classes with waaclock

### demo-patterns

Test lab for Pattern + Numeric

## New APIs

### Sheetplayer

uses ToneJS to play a given sheet. Depends on:

- Sheet
- Measure
- Snippet
- Sequence
- Voicing
- Harmony
- Logger
- Tone

[ ] tested

Tries to reimplement stuff from Band.

Misses:

- Walking Bass
- Drums
- Groove system

### Sheet

- Renders leadsheets by interpreting (more or less) standard notation symbols of a musicians practice.
- Signs like repeats and jumps like DS.Coda etc are interpreted and converted to a flat output without signs that can be played by a dumb computer.

#### Methods

- *from*: converts object to full Leadsheet object with all expected default options
- *render*: converts array of measures with signs to rendered measures that represent the signs

[X] tested

### Measure

contains methods used on single measures. Is mainly consumed by Sheet and Snippet.

### Snippet

Convert string based format of chords / melodies to Array/Object format that can be handled by Sheet.

- currently there are multiple implementations for parsin (parse + parse2)

[X] tested

### Sequence

- Turns sheet object into array of note events. Uses Sheet and Voicing.
- Output format is designed to work with ToneJS Parts (but could be used with anything)

[X] tested

### Voicing

- turns a chord symbol into notes that represent the symbol
- finds best follow up voicing after any notes played before
- finds voicings without using any hard coded structures
- uses Permutation

[X] tested

### Harmony

- Builds on top of tonal methods
- Adds functionality that tonal should support

[X] tested


### Logger

Sophisticated logging methods mainly used for voicings and sequences

### Permutation

- contains recursive and non recursive permutation methods
- e.g. used to find voicings and patterns

[X] tested

### Pattern

- Array magic that could be used to generate scale patterns and more.
- Currently overlaps with Numeric, which is more powerful but still lacks full musical implementation + testing


### Numeric

- renders numeric arrays
- handles either sequenced rendering (e.g. fibonacci)
- or functional rendering (e.g. 2*x)
- thought to be used to generate note patterns in a flexible way
- see patterns.md
- see demo-patterns

### RealParser

- Turns ireal tokens into Measures that are understood by Sheet.
- ireal-reader packages is still used to unscramble the tokens and to get the metadata

### util

- contains millions of helper methods

### Loose Ends

- Pattern vs Numeric: implement
- try to get rid of util complexity
- Throw Old APIs away or adapt to ToneJS?
- How to live render? (endless playing, random changes etc)

## Old APIs

- Band
- Trio
- Musician
  - Bassist
  - Drummer
  - Improvisor
  - Permutator
  - Pianist
  - Pianist_newVoicings
- Instrument
  - Kick
  - MidiOut
  - PlasticDrums
  - Sampler
  - Snare
  - Synthesizer
  - WebAudioFont
- Improvisation
  - methods
- grooves
  - bossa
  - disco
  - funk
  - swing