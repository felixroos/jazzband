import iRealReader from 'ireal-reader';
import { Note } from 'tonal';
import * as Tone from 'tone';
import link from '../songs/1350.json';
import { SheetPlayer } from '../src/player/SheetPlayer';
import { RealParser } from '../src/sheet/RealParser';
import { Snippet } from '../src/sheet/Snippet';
import { Pattern } from '../src/util/Pattern';
import * as util from '../src/util/util';
import { drawPart } from './drawEvents';
import { green, maidens, swing } from './grooves';
const playlist = new iRealReader(decodeURI(link));
//const playlist = new iRealReader(decodeURI(beatles));
// const playlist = new iRealReader(decodeURI(stevie));

function getStandard(playlist) {
  let standard;
  // standard = util.randomElement(playlist.songs.filter(s => s.title.includes('Beatrice')));
  standard = util.randomElement(
    playlist.songs /* .filter(s => s.title.includes('Footprints')) */
  );
  standard.music.measures = RealParser.parseSheet(standard.music.raw);

  // drawPart()
  return standard;
}

let frame,
  flip = true;

window.onload = function() {
  // buttons
  const stop = document.getElementById('stop');
  const steps = document.getElementById('steps');
  const knife = document.getElementById('knife');
  const green = document.getElementById('green');
  const things = document.getElementById('things');
  const alice = document.getElementById('alice');
  const next = document.getElementById('next');
  let standard = getStandard(playlist);
  let standardSheet = {
    composer: standard.composer,
    title: standard.title,
    chords: standard.music.measures,
    options: {
      bpm: 120,
      forms: 2,
      mapEvents: (event, options) => {
        return {
          ...event,
          options: {
            ...event.options,
            feel: event.measure.section === 'A' ? 4 : 2
            /* voicings: {
              ...event.options.voicings,
              maxVoices: event.measure.lastTime ? 5 : 4,
              range: event.measure.section === 'B' ? ['G3', 'C6'] : ['C3', 'G5']
            } */
          }
        };
      },
      groove: swing,
      swing: 0.2,
      real: true,
      pedal: false,
      logging: false,
      voicings: {
        // forceDirection: 'down',
        idleChance: 0,
        /* topDegrees: [1, 9, 5, 6, 4], */
        maxVoices: 4, // maximum number of voices per chord
        maxDistance: 7, // general max distance between single voices
        minDistance: 1, // general max distance between single voices
        minBottomDistance: 3, // min semitones between the two bottom notes
        minTopDistance: 3, // min semitones between the two top notes
        noTopDrop: true,
        noTopAdd: true,
        noBottomDrop: false,
        noBottomAdd: false,
        range: ['F3', 'C5']
      }
      /* filterChoices: (choice) => {
                    return true;
                },
                sortChoices: (a, b) => {
                    return a.difference - b.difference;
                    // return Math.abs(a.movement) - Math.abs(b.movement)
                    // return Math.abs(Interval.semitones(a.topInterval)) - Math.abs(Interval.semitones(b.topInterval))
                } */
    }
  };
  SheetPlayer.renderSheetPart(standardSheet).then(standardPart => {
    drawPart(standardPart, false, flip)();
  });

  next.addEventListener('click', () => {
    setTimeout(() => play(), 500);
  });

  function play() {
    /* Tone.Transport.latencyHint = 'balanced'; */
    return SheetPlayer.play(standardSheet).then(parts =>
      drawPart(
        parts[0],
        paint => {
          frame = requestAnimationFrame(paint);
        },
        flip
      )
    );
  }
  stop.addEventListener('click', () => {
    SheetPlayer.stop();
    cancelAnimationFrame(frame);
  });
  steps.addEventListener('click', () => {
    giantSteps();
  });
  green.addEventListener('click', () => {
    blueInGreen();
  });
  alice.addEventListener('click', () => {
    bluesForAlice();
  });
  things.addEventListener('click', () => {
    allTheThings();
  });
  knife.addEventListener('click', () => {
    mack();
  });

  document.getElementById('beatrice').addEventListener('click', () => {
    let chords = Snippet.parse2(`
            |  F^7  |  Gb^7#11  |  F^7       |  Eb^7#11  |
            |  D-7  |  Eb^7#11  |  D-7 C-7   |  Bb-7     |
            |  A-7  |  Bb^7     |  Eh7 A7b9  |  D-7      |
            |  G-7  |  Gb^7#11  |  F-7       |  Gb^7#11  |
            `);

    let melody = Snippet.parse2(`
            |  r . - c5 . c5 r . c5 r | f5 c5 c5 bb4 | c5 . - a4 . f4 r . f4 r |
            | f4 a4 g4 . - . - . - | r . - a4 . a4 r . a4 r | d5 c5 eb5 g5 |
            | f5 . f4 - - a4 | c5 bb4 c5 . - . - . f4 a4 | - . - c5 |
            | f5 . - g5 | a5 | - . - . - . g5 r - - | - f5 . r . f5 . - f5 |
            | - . - c5 . f5 c5 . bb4 c5 | - . - bb4 . c5 bb4 . ab4 f4 | - |
            `);
    SheetPlayer.play({
      title: 'Beatrice',
      chords,
      melody,
      options: {
        forms: 3,
        real: true,
        bpm: 100,
        swing: 0.2,
        voicings: {
          maxDistance: 8,
          logging: true,
          rangeBorders: [0, 0],
          range: ['E2', 'C6']
        } /* ,
                humanize: {
                    duration: 0,
                    velocity: 0.2
                } */
      }
    }).then(parts =>
      drawPart(
        parts[0],
        paint => {
          frame = requestAnimationFrame(paint);
        },
        flip
      )
    );
  });

  /**
   *
   * Pattern Stuff
   *
   */
  function parsePatterns(snippet) {
    const lines = snippet.split('\n').map(line =>
      line.split('>').map(p =>
        p
          .trim()
          .split(' ')
          .map(n => (isNaN(n) ? n : parseInt(n) - 1))
      )
    );
    return lines;
  }
  const textarea = document.getElementById('textarea');
  textarea.value = ['1 2 5 1 > 8 7 5 3', '1 6 2 5 > 1 2 3 5'].join('\n');

  function playPattern() {
    const textarea = document.getElementById('textarea');
    const lines = parsePatterns(textarea.value);

    /* const pattern = lines.reduce((combined, line) => {
      return combined.concat(Pattern.flat(Pattern.nestIndices(...line)));
    }, []); */

    function group(array, count) {
      return array.reduce((groups, note) => {
        if (!groups.length || groups[groups.length - 1].length >= count) {
          groups.push([note]);
        } else {
          groups[groups.length - 1].push(note);
        }
        return groups;
      }, []);
    }

    let notes = lines.reduce((combined, line) => {
      let scale = 'C major';
      line = Pattern.render(scale, line, ['G2', 'G5']);
      return combined.concat(line);
    }, []);

    notes = group(notes, 4);

    const events = Pattern.renderEvents(notes);

    SheetPlayer.getPiano(6, true).then(piano => {
      const part = new Tone.Part((time, event) => {
        piano.triggerAttackRelease(
          event.note,
          event.duration,
          time,
          event.velocity
        );
      }, events.map(e => ({ ...e, note: Note.simplify(e.value.note) })));

      part.start(0);

      SheetPlayer.playParts([part]);
      drawPart(
        part,
        paint => {
          frame = requestAnimationFrame(paint);
        },
        flip
      );
    });
  }

  document.getElementById('playPattern').addEventListener('click', () => {
    playPattern();

    /* pattern(lines); */
  });
  document.getElementById('stopPattern').addEventListener('click', () => {
    /* seq.stop(); */
    /* cancelAnimationFrame(frame); */
    /* Tone.Transport.stop(); */
  });

  /**
   *
   * Pattern stuff end
   *
   */
};

function bluesForAlice() {
  let melody = Snippet.parse2(`
|: f5 . c5 a4 . e5 . c5 a4 |
    d5 e5 b4 d5 db5 bb4 g4 ab4 |
    a4 . f4 d4 . g4 a4 . f4 e4 |
    eb4 g4 bb4 . d5 db5 . / f4 . f4 g4 f4 |
    c5 . bb4 f4 . ab4 bb3 . / ab4 |
    eb5 db5 . bb4 b4 . c5  f4 . g4  a4 |
    / . e4 c4 . d4 . / c#5 |
    / . b4 f#4 . a#4 . / g#4 |
    g4 f5 f5 . f5 d5 bb4 g4 |
    a4 g4 . c5 bb4 . eb5 . / c5 |
    / . a4 f4 . g4 .  / d5 |
    / . bb4 d4 . a4 . / :|
    `);
  let chords = Snippet.parse2(`
    |:  F^7  |  Eh7 A7    |  D-7 G7  |  C-7 F7    |
    |  Bb7  |  Bb-7 Eb7  |  A-7 D7  |  Ab-7 Db7  |
    |  G-7  |  C7        |  F7 D7   |  G-7 C7    :|
    `);
  SheetPlayer.play({
    title: 'Blues For Alice',
    chords,
    melody,
    options: {
      forms: 3,
      real: false,
      bpm: 180,
      swing: 0.2,
      voicings: {
        logging: false,
        range: ['C3', 'C6']
      },
      humanize: {
        duration: 0
      }
    }
  }).then(parts =>
    drawPart(
      parts[0],
      paint => {
        frame = requestAnimationFrame(paint);
      },
      flip
    )
  );
}

function giantSteps() {
  let melody = Snippet.parse2(`
    f#5 d5 | b4  g4 |
    bb4  / | b4  a4 |
    d5 bb4 | g4  eb4 |
    f#4  / | g4  f4 |
    bb4  / | b4  a4 |
    d5  / | eb5  db5 |
    f#5 / | g5  f5 |
    bb5  / | f#5  f#5 |
     `);
  let chords = Snippet.parse2(`
    |  B^7 D7   |  G^7 Bb7   |  Eb^7  |  A-7 D7    |
    |  G^7 Bb7  |  Eb^7 F#7  |  B^7   |  F-7 Bb7   |
    |  Eb^7     |  A-7 D7    |  G^7   |  C#-7 F#7  |
    |  B^7      |  F-7 Bb7   |  Eb^7  |  C#-7 F#7  |
    `);
  /* let chords = Snippet.parse2(`
    |  B^9 D13   |  G^9 Bb13   |  Eb^9  |  A-9 D13    |
    |  G^9 Bb13  |  Eb^9 F#13  |  B^9   |  F-9 Bb13   |
    |  Eb^9     |  A-9 D13    |  G^9   |  C#-9 F#13  |
    |  B^9      |  F-9 Bb13   |  Eb^9  |  C#-9 F#13  |
    `); */
  SheetPlayer.play({
    title: 'Giant Steps',
    composer: 'John Coltrane',
    chords,
    melody,
    options: {
      groove: green,
      bpm: 220,
      forms: 3,
      real: true,
      logging: false,
      voicings: {
        maxVoices: 4,
        maxDistance: 7,
        logging: false
      }
    }
  }).then(parts =>
    drawPart(
      parts[0],
      paint => {
        frame = requestAnimationFrame(paint);
      },
      flip
    )
  );
}

function blueInGreen() {
  let melody = Snippet.parse2(`
    | e5 . / d5  | c5 . / bb4   | a4 - . / g4  | f4 d5 / / |
    | e4 / . / d4 . c#4 d4 . f4 a4 | c5 . / / / a4  | g4 . / f4 | c5 . / g#4 |
    | b4 . / a4  | f5 /  / c#5 (2Q) | (Q) e5 / / d5 | c5 . / bb4   |  a4 |`);

  let chords = Snippet.parse2(`
    |  Bb^7#11  |  A7   |  D-9 Db7  |  C-7 F7b9 / /  |
    |  Bb^7   |  A7b13  |  D-9      |  E7      |
    |  A-9      |   D-7 (2Q) |  (Q) Bb^7#11  |  A7    |
    |  D-6      |`);

  SheetPlayer.play({
    title: 'Blue in Green',
    composer: 'Bill Evans',
    chords,
    melody,
    options: {
      groove: maidens,
      forms: 3,
      real: true,
      phantomMelody: false,
      tightMelody: false,
      logging: false,
      bpm: 70,
      humanize: {
        velocity: 0.1,
        time: 0.005,
        duration: 0.005
      },
      voicings: {
        maxVoices: 3,
        maxDistance: 7,
        // bottomDegrees: [1],
        /* minTopDistance: 2, */
        /* minBottomDistance: 4, */
        rangeBorders: [0, 0],
        logging: false,
        range: ['C3', 'C7']
      }
    }
  }).then(parts =>
    drawPart(
      parts[0],
      paint => {
        frame = requestAnimationFrame(paint);
      },
      flip
    )
  );
}

function allTheThings() {
  let melody = Snippet.parse2(`
    | ab4  | db5  . / ab4 | g4 g4 / g4 |  g4 c5 . / g4  | 
    | f4   | f4 b4 . / f4  | e4  | / |
    | eb4  | ab4 . / eb4 | d4 d4 . / d4 |  d4 g4 . / d4  | 
    | c4   | c4 d4 eb4 . d4 c4  | b3  | / d4 g4 d5 |
    | d5 c5 | / eb4 e4 c5 | b4 | / d4 g4 b4 |
    | b4 a4 | / b3 c4 a4 | ab4 | / |
    | ab4  | db5  . / ab4 | g4 . / g4 |  g4 c5 . / g4  | 
    | f4 |  eb5 db5   | eb4 | g4 f4  | 
    | bb4 | / | / | / |
    |`);

  let chords = Snippet.parse2(`
    |  F-7   |  Bb-7    |  Eb7   |  Ab^7      |
    |  Db^7  |  D-7 G7  |  C^7   |  C^7       |
    |  C-7   |  F-7     |  Bb7   |  Eb^7      |
    |  Ab^7  |  A-7 D7  |  G^7   |  G^7       |
    |  A-7   |  D7      |  G^7   |  G^7       |
    |  F#h7  |  B7b9    |  E^7   |  C7b13     |
    |  F-7   |  Bb-7    |  Eb7   |  Ab^7      |
    |  Db^7  |  Db-^7   |  C-7   |  Bo7       |
    |  Bb-7  |  Eb7     |  Ab^7  |  Gh7 C7b9  |`);

  /* chords = chords
    .slice(0, 2)
    .concat([{ chords: ['/'], options: { feel: 2 } }])
    .concat(chords.slice(3, 10)); */

  // weirdness
  /* chords = chords
    .slice(0, 2)
    .concat([{ chords: ['Eb7'], options: { pulses: 2 } }])
    .concat([{ chords: ['Ab^7'], options: { pulses: 6 } }])
    .concat([{ chords: ['Db^7'], options: { pulses: 3 } }])
    .concat(chords.slice(5, 10)); */

  SheetPlayer.play({
    title: 'All The Things you are',
    composer: ' ? ',
    chords,
    melody,
    options: {
      groove: swing,
      phantomMelody: false,
      tightMelody: false,
      logging: false,
      forms: 3,
      /* feel: 4, */
      real: true,
      bpm: 160,
      voicings: {
        maxDistance: 7,
        maxVoices: 3,
        logging: false,
        rangeBorders: [0, 0],
        range: ['C3', 'C7']
      }
    }
  }).then(parts =>
    drawPart(
      parts[0],
      paint => {
        frame = requestAnimationFrame(paint);
      },
      flip
    )
  );
}

function mack() {
  let melody = Snippet.parse2(`
    | / . d4 f4  |
    |: g4 / / g4 . / | / . d4 f4 | g4 / / g4 . / | / . c4 eb4 |
    | g4 / / g4 . / | / . c4 eb4  | g4 | r . f4 a4 |
    | c5 / / bb4 . / | r . / bb4 . a4 . g4 | bb4 / / c4 . / | - . d4 eb4 |
    | bb4 / / c4 . / | - . bb4 a4 | g4 | 1 / . d4 f4  :| 2 / |
    `);
  let chords = Snippet.parse2(`
    |  / |:  Bb6  |  Bb     |  C-7  |  C-7  |
    |  F7   |  F7      |  Bb6  |  Bb  |
    |  G-7  |  G-7     |  C-7  |  C-7 |
    |  C-7  |  C-7 F7  |  Bb6  | Bb :|  
    `);
  SheetPlayer.play({
    title: 'Mack The Knife',
    composer: ' ? ',
    chords,
    melody,
    options: {
      voicings: {
        logging: false,
        maxVoices: 4,
        minTopDistance: 2
      },
      swing: 0.2,
      forms: 3,
      duckMeasures: 0.5,
      real: true,
      bpm: 160,
      humanize: {
        duration: 0.01
      }
    }
  }).then(parts =>
    drawPart(
      parts[0],
      paint => {
        frame = requestAnimationFrame(paint);
      },
      flip
    )
  );
}
