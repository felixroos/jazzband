import iRealReader from 'ireal-reader';
import * as jazz from '../lib';
import { bossa } from '../src/grooves/bossa';
// import { disco } from '../src/grooves/disco';
import { funk } from '../src/grooves/funk';
import { swing } from '../src/grooves/swing';
//import link from './playlists/zw.json';
import { RealParser } from '../src/sheet/RealParser';
import { Snippet } from '../src/sheet/Snippet';
import { SheetPlayer } from '../src/sheet/SheetPlayer';
import link from './playlists/1350.json';
/* import { harp } from './samples/harp'; */
import { drumset } from './samples/drumset';
import { piano } from './samples/piano';

const context = new AudioContext();
const playlist = new iRealReader(decodeURI(link));

// bass = new jazz.Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });

const keyboard = new jazz.Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
// const keyboard = new jazz.WebAudioFont({ context, preset: 50, gain: .8 });
/* const bass = new jazz.WebAudioFont({ context, preset: 366 }); */
const bass = keyboard;
/* const harpInstrument = new jazz.Sampler({ samples: harp, midiOffset: 24, gain: 1, context }); */
const drums = new jazz.Sampler({ samples: drumset, context, gain: 0.5, duration: 6000 });

const band = new jazz.Trio({ context, piano: keyboard, bass, drums, solo: false });


/* band.pianist.gain = .4;
band.bassist.gain = .9;
band.drummer.gain = .8; */
/* band.soloist.gain = .6; */

function getStandard(playlist) {
    /* console.log('playlist', playlist); */
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Lone Jack (Page 1)'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Minor Strain'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('El Cajon'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Mirror, Mirror'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Falling Grace')));
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Confirmation'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Giant Steps'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Autumn Leaves'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Blues For Alice'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Pink'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Knife'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Opener, The'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Forget Me'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Harlequin'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Thang'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Beatrice'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('One Note Samba'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Ain\'t She Sweet'))); */
    const standard = jazz.util.randomElement(playlist.songs);
    standard.music.measures = RealParser.parseSheet(standard.music.raw); // TODO: add Song that can be passed to comp
    console.log('standard', standard);
    return standard;
}

let lastVoicing;

function alice() {
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
    });
}

function steps() {
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
    })
}

function knife() {
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
    SheetPlayer.play(chords, melody)
}


window.onload = function () {
    // buttons
    const playJazz = document.getElementById('jazz');
    const playFunk = document.getElementById('funk');
    const playBossa = document.getElementById('bossa');
    const stop = document.getElementById('stop');
    const slower = document.getElementById('slower');
    const faster = document.getElementById('faster');
    const next = document.getElementById('next');
    const randomInstruments = document.getElementById('instruments');
    const playChord = document.getElementById('playChord');
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const c = document.getElementById('c');
    const d = document.getElementById('d');
    const e = document.getElementById('e');
    const f = document.getElementById('f');
    const g = document.getElementById('g');
    const chordInput = document.getElementById('chordInput');

    function voiceChord(chord) {
        const notes = jazz.util.getNextVoicing(chord, lastVoicing);
        lastVoicing = notes;
        console.log(chord, notes);
        context.resume();
        keyboard.playNotes(notes, { duration: 500 });
    }

    a.addEventListener('click', (e) => voiceChord(e.target.innerHTML));
    b.addEventListener('click', (e) => voiceChord(e.target.innerHTML));
    c.addEventListener('click', (e) => voiceChord(e.target.innerHTML));
    d.addEventListener('click', (e) => voiceChord(e.target.innerHTML));
    e.addEventListener('click', (e) => voiceChord(e.target.innerHTML));
    f.addEventListener('click', (e) => voiceChord(e.target.innerHTML));
    g.addEventListener('click', (e) => voiceChord(e.target.innerHTML));


    playChord.addEventListener('click', () => {
        voiceChord(chordInput.value);
    });


    let standard/*  = getStandard(); */

    function play(groove = swing) {
        /* SheetPlayer.play(['C^7', 'D-', 'E-7', 'F', 'G7', 'A-', 'B-7b5']); */
        /* SheetPlayer.play(['C^7', 'D-7', 'E-7', 'F^7', 'G7', 'A-7', 'B-7b5', 'C6'].reverse()); */
        /* SheetPlayer.play(['C^7', 'C7', 'C-7', 'C-6', 'C-', 'A7', 'D^7', 'Db^7']); */
        /* SheetPlayer.play(['C^7', 'E-', 'G7', 'C']); */
        /* SheetPlayer.play(['A7', 'Ab7']);
        return; */
        /* SheetPlayer.play(['E^7', 'E', 'B7', 'E6']);
        return; */
        alice();
        return;

        const forms = 2;
        const cycle = 4;

        return SheetPlayer.play({
            composer: standard.composer,
            title: standard.title,
            groove,
            forms,
            cycle,
            chords: standard.music.measures
        });

        band.comp(standard.music.measures, { render: { forms }, metronome: false, exact: false, cycle, bpm, groove/* , arpeggio: true */ });

    }

    randomInstruments.addEventListener('click', () => {
        const allowed = ['sine', 'triangle', 'square', 'sawtooth'];
        band.pianist.instrument = jazz.util.randomSynth(band.mix, allowed);
        band.bassist.instrument = jazz.util.randomSynth(band.mix, ['sine']);
        /* band.soloist.instrument = jazz.util.randomSynth(band.mix, allowed); */
        console.log('pianist:', band.pianist.instrument.type);
        console.log('bassist:', band.bassist.instrument.type);
    });

    playJazz.addEventListener('click', () => play(swing));
    playFunk.addEventListener('click', () => play(funk));
    playBossa.addEventListener('click', () => play(bossa));

    stop.addEventListener('click', () => {
        band.pulse.stop();
    });
    slower.addEventListener('click', () => {
        band.pulse.changeTempo(band.pulse.props.bpm - 10);
        console.log('tempo', band.pulse.props.bpm);
    });
    faster.addEventListener('click', () => {
        band.pulse.changeTempo(band.pulse.props.bpm + 10);
        console.log('tempo', band.pulse.props.bpm);
    });

    next.addEventListener('click', () => {
        if (band.pulse) {
            band.pulse.stop();
        }
        standard = getStandard(playlist);
        setTimeout(() => play(), 500);
    })
}
