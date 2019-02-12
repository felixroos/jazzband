import * as jazz from '../lib';
import link from './playlists/1350.json';
//import link from './playlists/zw.json';
import { RealParser } from '../src/RealParser';
import { piano } from './samples/piano';
/* import { harp } from './samples/harp'; */
import { drumset } from './samples/drumset';
import iRealReader from 'ireal-reader';
import { swing } from '../src/grooves/swing';
// import { disco } from '../src/grooves/disco';
import { funk } from '../src/grooves/funk';
import { bossa } from '../src/grooves/bossa';
import { Sheet } from '../src/sheet/Sheet';
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
    console.log('playlist', playlist);
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Lone Jack (Page 1)'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Minor Strain'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('El Cajon'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Mirror, Mirror'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Falling Grace')));
    const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Confirmation')));
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Mack The Knife'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Giant Steps'))); */
    /* const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Autumn Leaves'))); */
    /* const standard = jazz.util.randomElement(playlist.songs); */
    //console.log('tokens',parser.tokens);

    standard.music.measures = RealParser.parseSheet(standard.music.raw); // TODO: add Song that can be passed to comp
    console.log('standard', standard);
    console.log('sheet', standard.music.measures);
    return standard;
}

let lastVoicing;

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
    })


    let standard/*  = getStandard(); */

    function play(groove = swing) {
        console.log('groove', groove);
        // const bpm = 70 + Math.random() * 100;
        const bpm = /* groove.tempo ||  */160;
        console.log('tempo', bpm);
        const cycle = 4;
        band.comp(standard.music.measures, { metronome: false, exact: true, cycle, bpm, groove/* , arpeggio: true */ });

        const bars = Sheet.render(standard.music.measures);
        console.log('bars', bars);

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
