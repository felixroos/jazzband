import iRealReader from 'ireal-reader';
import * as util from '../src/util/util';
import { swing } from '../src/grooves/swing';
import { RealParser } from '../src/sheet/RealParser';
import { Snippet } from '../src/sheet/Snippet';
import { SheetPlayer } from '../src/sheet/SheetPlayer';
import link from '../songs/1350.json';

const playlist = new iRealReader(decodeURI(link));

function getStandard(playlist) {
    let standard;
    // standard = util.randomElement(playlist.songs.filter(s => s.title.includes('Black Narcissus')));
    /* standard = util.randomElement(playlist.songs.filter(s => s.title.includes('All The Things'))); */
    standard = util.randomElement(playlist.songs.filter(s => s.title.includes('Mack The Knife')));
    /* standard = util.randomElement(playlist.songs); */
    standard.music.measures = RealParser.parseSheet(standard.music.raw);
    // console.log('standard', standard);
    return standard;
}

const options = {
    // forceDirection: 'down',
    maxVoices: 4, // maximum number of voices per chord
    maxDistance: 7,  // general max distance between single voices
    minDistance: 1,  // general max distance between single voices
    minBottomDistance: 3, // min semitones between the two bottom notes
    minTopDistance: 3, // min semitones between the two top notes
    real: true,
    swing: 0,
    pedal: false,
    noTopDrop: false,
    noTopAdd: false,
    noBottomDrop: false,
    noBottomAdd: false,
    range: ['C3', 'C6'],
    logging: true,
    filterChoices: (choice) => {
        return true;
    },
    sortChoices: (a, b) => {
        return a.difference - b.difference;
        /* return Math.abs(a.movement) - Math.abs(b.movement) */
        /* return Math.abs(Interval.semitones(a.topInterval)) - Math.abs(Interval.semitones(b.topInterval)) */
    }
};

window.onload = function () {
    // buttons
    const stop = document.getElementById('stop');
    const steps = document.getElementById('steps');
    const knife = document.getElementById('knife');
    const green = document.getElementById('green');
    const things = document.getElementById('things');
    const alice = document.getElementById('alice');
    const next = document.getElementById('next');
    let standard;

    next.addEventListener('click', () => {
        standard = getStandard(playlist);
        setTimeout(() => play(), 500);
    });

    function play(groove = swing) {
        //SheetPlayer.play({ chords: ['C', 'C', 'C/B', 'C/Bb', 'F', 'F/E', 'G6', 'G/F'] }, { pedal: true });
        /* SheetPlayer.play({ chords: ['C^7', 'E-', 'C^7', 'E-'] }, options);
        return; */
        return SheetPlayer.play(
            {
                composer: standard.composer,
                title: standard.title,
                forms: 1,
                time: 4,
                groove,
                chords: standard.music.measures,
            }, options);
    }
    stop.addEventListener('click', () => {
        SheetPlayer.stop();
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

    // document.getElementById('piano-roll').setAttribute('chords', ['C', 'F', 'G']);

}

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
            real: true,
            bpm: 160,
            swing: 0.2,
            voicings: {
                maxVoices: 4,
                maxDistance: 8,
                /* minTopDistance: 5,
                minBottomDistance: 5, */
                logging: false,
                range: ['C3', 'C6'],
                humanize: {
                    duration: 0
                }
            }
        }
    });
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
    SheetPlayer.play({
        title: 'Giant Steps',
        composer: 'John Coltrane',
        chords, melody,
        options: {
            bpm: 220,
            forms: 3,
            real: true,
            voicings: {
                /* maxDistance: 9,
                minTopDistance: 5,
                minBottomDistance: 5, */
                logging: false,
                /* range: ['G2', 'C6'] */
            }
        }
    });
}

function blueInGreen() {
    let melody = Snippet.parse2(`
    | e5 . / d5  | c5 . / bb4   | a4 - . / g4  | f4 d5 / / |
    | e4 / . / d4 . c#4 d4 . f4 a4 | c5 . / a4  | g4 . / f4 | c5 . / g#4 |
    | b4 . / a4  | f5 /  / c#5 (2Q) | (Q) e5 / / d5 | c5 . / bb4   |  a4 |`);
    /* 
    */
    /* let chords = Snippet.parse2(`
    |  Bb^7  |  A7   |  D-7 Db7  |  C-7 F7 |
    |  Bb^7  |  A7   |  D-6      |  E7     |
    |  A-7   |  D-7  |`); */
    let chords = Snippet.parse2(`
    |  Bb^7#11  |  A7   |  D-9 Db7  |  C-7 F7b9 / /  |
    |  Bb^7     |  A7b13  |  D-9      |  E7      |
    |  A-9      |   D-7 (2Q) |  (Q) Bb^7#11  |  A7    |
    |  D-6      |`);

    SheetPlayer.play({
        title: 'Blue in Green',
        composer: 'Bill Evans',
        chords, melody,
        options: {
            forms: 3,
            real: true,
            phantomMelody: false,
            logging: false,
            bpm: 70,
            humanize: {
                velocity: 0.1,
                time: 0.005,
                duration: 0.005,
            },
            voicings: {
                maxVoices: 4,
                logging: false,
            }
        }
    });
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

    SheetPlayer.play({
        title: 'All The Things you are',
        composer: ' ? ',
        chords, melody,
        voicings: {
            logging: true,
            maxVoices: 4,
            rangeBorders: [0, 0]
        },
        options: {
            phantomMelody: false,
            logging: false,
            forms: 3,
            real: true,
            bpm: 160
        }
    });
}

function mack() {
    let melody = Snippet.parse2(`
    | / . d4 f4  |
    |: g4 / / g4 . / | / . d4 f4 | g4 / / g4 . / | / . c4 eb4 |
    | g4 / / g4 . / | / . c4 eb4  | g4 | r . f4 a4 |
    | c5 / / bb4 . / | r . / bb4 . a4 . g4 | bb4 / / c4 . / | r . d4 eb4 |
    | bb4 / / c4 . / | r . bb4 a4 | g4 | 1 / . d4 f4  :| 2 / |
    `);
    let chords = Snippet.parse2(`
    |  / |:  Bb6  |  Bb     |  C-7  |  C-7  |
    |  F7   |  F7      |  Bb6  |  Bb  |
    |  G-7  |  G-7     |  C-7  |  / |
    |  C-7  |  C-7 F7  |  Bb6  | Bb :|  
    `);
    SheetPlayer.play({
        title: 'Mack The Knife',
        composer: ' ? ',
        chords, melody,
        voicings: {
            logging: false,
            maxVoices: 4,
            minTopDistance: 2
        },
        options: {
            swing: 0.2,
            forms: 3,
            duckMeasures: 0.5,
            real: false,
            bpm: 160,
            humanize: {
                duration: 0.01
            }
        }
    })
}