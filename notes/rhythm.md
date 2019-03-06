# Rhythm

This note deals with handling rhythm.

## Flat rhythmic notation

The most obvious way to notate rhythmic notes is this:

```
C8 D8 E4 D8 E8 F4
```

The number following the note name expresses the length of the note as fraction to a whole note.

A simplification of above would be to set a global fraction and only notate deviations in relation to it:

```
L:1/8
CD E2 DE F2
```
or 

```
L:1/4
C2D2 E D2E2 F
```

This is how it is done in abc notation. It is especially useful when having dealing with music that has homogeneous rhythms.

### Playback

In Tone.js, the above would be played like that:

```js
var synth = new Tone.Synth().toMaster()
var part = new Tone.Part((time, event) => {
	synth.triggerAttackRelease(event.note, event.dur, time)
}, [
    { time : '0', note : 'C4', dur : '8n'},
    { time : '0:0.5', note : 'D4', dur : '8n'},
    { time : '0:1', note : 'E4', dur : '4n'},
    { time : '0:2', note : 'D4', dur : '8n'},
    { time : '0:2.5', note : 'E4', dur : '8n'},
    { time : '0:3', note : 'F4', dur : '4n'},    
    ]);
part.start(0)
Tone.Transport.start();
```
Maybe the time could be expressed better, see [Time](https://github.com/Tonejs/Tone.js/wiki/Time).

## Nested rhythmic notation

Another way to express rhythm is by using nesting:

```
[CD] E [DE] F
```

This is approach is used e.g. by [Tidal Cycles](https://tidalcycles.org/index.php/Tutorial).

The clever thing is: no numbers are needed to express relations, just groups. It is also visually more clear than the flat approach.

As also used by Tidal, groupings can also be expressed by dots:

```
CD.E.DE.F
```

### Playback

Tone.js already has an easy solution to play patterns like that:

```js
var synth = new Tone.Synth().toMaster()
var seq = new Tone.Sequence(function(time, note){
	synth.triggerAttackRelease(note, '8n', time)    
}, [['C4','D4'],'E4',['D4','E4'],'F4'], "1m");
```

## Comparison

Let's examine the two approaches more deeply, regarding:

- Note Duration
- Syncopation
- Odd Rhythms
- Rests
- Editing
- Multiple Notes
- Articulation
- Rendering

## Complex Example

Lets use the bebop tune "Blues for Alice" as a more complex example:

### in [abc notation](https://abcjs.net/abcjs-editor.html):

```
T: Blues for Alice
M: 4/4
L: 1/8
| f2 cA e2 cA | deBd _d_BG_A |
| A2 FD GAFE | (3_EG_B d_d z F (3FGF |
| c2 _BF _A_B, z_A | _e_d _B=B cF GA- |
| A2 EC D2 z^c- | ^c2 B^F ^A2 z^G | 
| (3G2f2f2 fd _BG | AG c_B _e2 z c- |
| c2 AF G2 zd- |d2 _BD A2 z2 |
```

### in nested notation:

```
T: Blues for Alice
M: 4/4
| f.cA.e.cA | deBd _D_BG_A | 
| A.FD.GA.FE | BG_B.d_d.~F.FGF |
| c._BF._A_B,.~_A | _e_d._BB.cF.GA |
| %.EC.D.~^c | %.B^F.^A.~^G | 
| Gff.fd_BG | AG.c_B._e.~c |
| %.AF.G.~d | %._BD.A.~ |
```

- rests: ~
- hold notes: %

## optimization

confusing symbols:

- flats and sharps should be written normally (_b => bb, ^c => c# )
    - this requires putting spaces between every note
    - => increases readability
- uppercase/lowercase is bad
    - use relative distances
    - most songs rarely move in large intervals
    - => prepend direction sign if distance is > perfect 4th
    - move up = "+", move down = "-"

```
T: Blues for Alice
M: 4/4
| f . c a . +e .c a | d e b d . db bb g ab | 
| a . f d . g a . f e | eb g bb . d db . ~ -f . f g f |
| +c . bb f . ab -bb . ~ +ab | +eb db . bb b . c -f . g a |
| % . e c . d . ~ +c# | % . b f# . a# . ~ g# | 
| g +f f . f d bb g | a g . c bb . eb . ~ c |
| % . a f . g . ~ ^d | % . bb d . a . ~ |
```
