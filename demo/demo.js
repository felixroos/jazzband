import iRealReader from 'ireal-reader';
import * as util from '../src/util/util';
import { swing } from '../src/grooves/swing';
import { Voicing } from '../src/harmony/Voicing';
import { RealParser } from '../src/sheet/RealParser';
import { Snippet } from '../src/sheet/Snippet';
import { SheetPlayer } from '../src/sheet/SheetPlayer';
import link from './playlists/1350.json';

const playlist = new iRealReader(decodeURI(link));

function getStandard(playlist) {
    let standard;
    // standard = util.randomElement(playlist.songs.filter(s => s.title.includes('Black Narcissus')));
    standard = util.randomElement(playlist.songs);
    standard.music.measures = RealParser.parseSheet(standard.music.raw);
    // console.log('standard', standard);
    return standard;
}

const options = {
    // forceDirection: 'down',
    range: ['C3', 'G5'], // allowed voice range
    maxVoices: 4, // maximum number of voices per chord
    maxDistance: 7,  // general max distance between single voices
    minDistance: 1,  // general max distance between single voices
    minBottomDistance: 3, // min semitones between the two bottom notes
    minTopDistance: 2, // min semitones between the two top notes
    real: false,
    swing: 0,
    pedal: true,
    noTopDrop: true,
    noTopAdd: true,
    noBottomDrop: false,
    noBottomAdd: false,
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
    const alice = document.getElementById('alice');
    const next = document.getElementById('next');
    const playChord = document.getElementById('playChord');
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const c = document.getElementById('c');
    const d = document.getElementById('d');
    const e = document.getElementById('e');
    const f = document.getElementById('f');
    const g = document.getElementById('g');
    const chordInput = document.getElementById('chordInput');
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
    alice.addEventListener('click', () => {
        bluesForAlice();
    });
}

function bluesForAlice() {
    let melody = Snippet.parse2(`
    f4 . c4 a3 . e4 . c4 a3 |
    d4 e4 b3 d4 db4 bb3 g3 ab3 |
    a3 . f3 d3 . g3 a3 . f3 e3 |
    eb3 g3 bb3 . d4 db4 . / f3 . f3 g3 f3 |
    c4 . bb3 f3 . ab3 bb2 . / ab3 |
    eb4 db4 . bb3 b3 . c4  f3 . g3  a3 |
    / . e3 c3 . d3 . / c#4 |
    / . b3 f#3 . a#3 . / g#3 |
    g3 f4 f4 . f4 d4 bb3 g3 |
    a3 g3 . c4 bb3 . eb4 . / c4 |
    / . a3 f3 . g3 .  / d4 |
    / . bb3 d3 . a3 . / |
    `);
    let chords = Snippet.parse2(`
    |  F^7  |  Eh7 A7    |  D-7 G7  |  C-7 F7    |
    |  Bb7  |  Bb-7 Eb7  |  A-7 D7  |  Ab-7 Db7  |
    |  G-7  |  C7        |  F7 D7   |  G-7 C7    |
    `);
    SheetPlayer.play({
        title: 'Blues For Alice',
        chords,
        melody
    }, options);
}

function giantSteps() {
    let melody = Snippet.parse2(`
    f#4 d4 | b3  g3 |
    bb3  / | b3  a3 |
    d4 bb3 | g3  eb3 |
    f#3  / | g3  f3 |
    bb3  / | b3  a3 |
    d4  / | eb4  db4 |
    f#4 / | g4  f4 |
    bb4  / | f#4  f#4 |
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
        chords, melody
    }, options);
}

function knife() {
    let chords = Snippet.parse2(`
    |  B^7 D7   |  G^7 Bb7   |  Eb^7  |  A-7 D7    |
    |  G^7 Bb7  |  Eb^7 F#7  |  B^7   |  F-7 Bb7   |
    |  Eb^7     |  A-7 D7    |  G^7   |  C#-7 F#7  |
    |  B^7      |  F-7 Bb7   |  Eb^7  |  C#-7 F#7  |
    `);
    SheetPlayer.play({ chords, /* melody */ }, options)
}
