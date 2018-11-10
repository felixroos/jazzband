import * as jazz from '../lib';
import link from './playlists/1350.json';
//import link from './playlists/zw.json';
import { RealParser } from '../src/RealParser';
import { piano } from './samples/piano';
// import { harp } from './samples/harp';
import { drumset } from './samples/drumset';
import iRealReader from 'ireal-reader';
import { swing } from '../src/grooves/swing';
// import { disco } from '../src/grooves/disco';
import { funk } from '../src/grooves/funk';
import { bossa } from '../src/grooves/bossa';

const context = new AudioContext();
const playlist = new iRealReader(decodeURI(link));

// bass = new jazz.Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });

const keyboard = new jazz.Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
//const harpInstrument = new jazz.Sampler({ samples: harp, midiOffset: 24, gain: 1, context });
const drums = new jazz.Sampler({ samples: drumset, context, gain: 0.7, duration: 6000 });

const band = new jazz.Trio({ context, piano: keyboard, bass: keyboard, drums });
const soloist = new jazz.Permutator(jazz.util.randomSynth(context));
band.addMember(soloist);

function getStandard(playlist) {
    console.log('playlist', playlist);
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Lone Jack (Page 1)'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Minor Strain'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('El Cajon'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Mirror, Mirror'))); // TODO: fix
    //const standard = jazz.util.randomElement(playlist.songs.filter(s => s.title.includes('Falling Grace')));
    const standard = jazz.util.randomElement(playlist.songs);
    const parser = new RealParser(standard.music.raw);
    //console.log('tokens',parser.tokens);
    standard.music.measures = parser.sheet; // TODO: add Song that can be passed to comp
    console.log('standard', standard, standard.music.measures);
    console.log('sheet', parser.sheet);
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
    let standard/*  = getStandard(); */

    function play(groove = swing) {
        console.log('groove', groove);
        const bpm = 70 + Math.random() * 100;
        //const bpm = 120;
        console.log('tempo', bpm);
        const cycle = 4;
        band.comp(standard.music.measures, { metronome: true, cycle, bpm, groove/* , arpeggio: true */ })
        /*band.comp(new Array(5).fill(1).reduce((a, c) => a.concat(['D-7', 'G7', 'C^7', 'C^7']), []),
        { bpm, groove });*/
    }

    randomInstruments.addEventListener('click', () => {
        const allowed = ['sine', 'triangle', 'square', 'sawtooth'];
        band.pianist.instrument = jazz.util.randomSynth(band.mix, allowed);
        band.bassist.instrument = jazz.util.randomSynth(band.mix, allowed);
        console.log('pianist:', band.pianist.instrument.type);
        console.log('bassist:', band.bassist.instrument.type);
    });

    playJazz.addEventListener('click', () => {
        play(swing);
    })
    playFunk.addEventListener('click', () => {
        play(funk)
    });
    playBossa.addEventListener('click', () => {
        play(bossa)
    })
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
