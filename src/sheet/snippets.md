# Snippets

A Snippet is a textual representation of a Leadsheet, meaning chords and/or melody of a tune/song.

## Design Goals

- Readability
- Minimal keystrokes
- Flexibility
- Musician friendly

## Example: Beautiful Love

Here is an example of the chords of Lullaby of Birdland by George Shearing:

```txt
|: F- Dh7    |  G7 C7     |  F-          |  Bb-7 Eb7    |
|  C-7 F-7   |  Bb-7 Eb7  |1 Ab^7        |  Gh7 C7b9   :|
                          |2 Ab^7 Eb7    |  Ab^7        |
|  Ch7 F7b9  |  Bb-7      |  Bb-7 Eb7b9  |  Ab^7        |
|  Ch7 F7b9  |  Bb-7      |  Bb-7 Eb7b9  |  Ab^7 C7b9   |
|  F- Dh7    |  G7 C7     |  F-          |  Bb-7 Eb7    |
|  C-7 F-7   |  Bb-7 Eb7  |  Ab^7 Eb7    |  Ab^7 Gh C7  |
```

The following characters are showcased:

- | barlines
- : repeat signs
- 1,2 .. houses
- chord symbols: - h7 7 -7 ^7 7b9 h

You can also see that the second house has a offset to be below the first house. This syncs the reading position with the harmonic rhythm.

## Control Flow

The term "Control Flow" means all signs that control the flow of the musical piece. Following signs are common to musical sheets:

### Repeat signs

When hitting this sign at the end of a bar, jump back to latest bar with this sign at the beginning (or beginning), ignore next time:

```| A | B :|``` => ```| A | B | A | B |```

```|: A | B :|``` => ```| A | B | A | B |```

### Houses

Inside repeat signs. Play one house at a time, step forward sequentially each repeat:

```|: A | 1 B :| 2 C |``` => ```| A | B | A | C |```

### DC = Da Capo

Jump back to beginning:

```| A (DC) | B |``` => ```| A | A | B |```

### DC + Fine = Da Capo al Fine

Finishes the piece, only when a DS/DC has been hit before.

```| A (Fine) | B (DC) |``` => ```| A | B | A |```

Short:

```| A (F) | B (DC) |``` => ```| A | B | A |```

### DC + Coda = Da Capo al Coda

Finishes the piece, only when a DS/DC has been hit before.

```| A (ToCoda) | B (DC) | (Coda) C |``` => ```| A | B | A | C |```

Short:

```| A (2Q) | B (DC) | (Q) C |``` => ```| A | B | A | C |```

### DS = Dal Segno

Jump back to Segno (S).

```| A | (Segno) B (DS) | C |``` => ```| A | B | B | C |```

Short:

```| A | (S) B (DS) | C |``` => ```| A | B | B | C |```

### DS + Fine = Dal Segno al Fine

Jump back to Segno. Stop playing when hitting Fine:

```| A | (Segno) B (Fine) | C (DS) |``` => ```| A | B | C | B |```

Short:

```| A | (S) B (F) | C (DS) |``` => ```| A | B | C | B |```

### DS + Coda = Dal Segno al Coda

Jump back to Segno. When hitting ToCoda sign, jump to the Bar with the Coda sign.

```| A | (S) B (ToCoda) | C (DS) | (Coda) D |``` => ```| A | B | C | B | D |```

Short:

```| A | (S) B (2Q) | C (DS) | (Q) D |``` => ```| A | B | C | B | D |```

## Real World Control Flow

Blue in Green

```txt
|  G-6      |  A7#9  |  D-7 Db7  |  C-7 F7  |
|  Bb^7#11  |  A7#9  |  D-6      |  E7b13   |
|  A-7      |  D-7   |  (Q) G-6  |  A7#9    |
|  D-6      |  D-6   |
```

Beautiful Love

```txt
(A)
|: Eh7    |  A7b9         |  D-   |  D-        |
|  G-7    |  C7           |  F^7  |  Eh7 A7b9  |
(B)
|1 D-     |  G-7          |  Bb7  |  A7b9      |
|  D-     |  G7#11        |  Eh7  |  A7b9     :|
(C)
|2 D-     |  G-7          |  Bb7  |  A7b9      |
|  D- B7  |  Bb7#11 A7b9  |  D-   |  D-        |
```