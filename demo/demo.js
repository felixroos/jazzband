import iRealReader from 'ireal-reader';
import { Trio, Sampler, util } from '../lib';
import { bossa } from '../src/grooves/bossa';
// import { disco } from '../src/grooves/disco';
import { funk } from '../src/grooves/funk';
import { swing } from '../src/grooves/swing';
import { RealParser } from '../src/sheet/RealParser';
import { Voicing } from '../src/harmony/Voicing';
import link from '../songs/1350.json';
/* import { harp } from './samples/harp'; */
import { drumset } from '../samples/drumset';
import { piano } from '../samples/piano';

const context = new AudioContext();
const playlist = new iRealReader(decodeURI(link));
// bass = new Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });
const keyboard = new Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
// const keyboard = new WebAudioFont({ context, preset: 50, gain: .8 });
// const bass = new WebAudioFont({ context, preset: 366 });
const bass = keyboard;
// const harpInstrument = new Sampler({ samples: harp, midiOffset: 24, gain: 1, context });
const drums = new Sampler({ samples: drumset, context, gain: 0.5, duration: 6000 });
const band = new Trio({ context, piano: keyboard, bass, drums, solo: false });

function getStandard(playlist) {
    /* const standard = util.randomElement(playlist.songs.filter(s => s.title.includes('Black Narcissus'))); */
    const standard = util.randomElement(playlist.songs);
    standard.music.measures = RealParser.parseSheet(standard.music.raw); // TODO: add Song that can be passed to comp
    console.log('standard', standard);
    return standard;
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
    let standard;

    next.addEventListener('click', () => {
        if (band.pulse) {
            band.pulse.stop();
        }
        standard = getStandard(playlist);
        setTimeout(() => play(), 500);
    });

    function play(groove = swing) {
        const forms = 2;
        const time = 4;
        const bpm = 130;
        band.comp({
            composer: standard.composer,
            title: standard.title,
            chords: standard.music.measures
        }, {
                render: { forms },
                metronome: false,
                exact: false,
                cycle: time,
                bpm,
                groove,
                voicings: {
                    // forceDirection: 'down',
                    range: ['C3', 'C5'], // allowed voice range
                    maxVoices: 3, // maximum number of voices per chord
                    maxDistance: 7,  // general max distance between single voices
                    minDistance: 1,  // general max distance between single voices
                    minBottomDistance: 3, // min semitones between the two bottom notes
                    minTopDistance: 2, // min semitones between the two top notes
                    noTopDrop: true,
                    noTopAdd: true,
                    noBottomDrop: false,
                    noBottomAdd: false,
                    logging: true
                    /* filterChoices: (choice) => {
                        return true;
                    },
                    sortChoices: (a, b) => {
                        return a.difference - b.difference;
                    } */
                }
            });
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


    let lastVoicing;
    function voiceChord(chord) {
        const notes = Voicing.getNextVoicing(chord, lastVoicing);
        lastVoicing = notes;
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
}
