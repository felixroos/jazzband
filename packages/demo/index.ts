import jazz from '../jazzband';
import { piano } from './samples/piano';
import { drumset } from './samples/drumset';
import standards from './standards.json';
import { randomElement } from '../jazzband/src/util';

console.log('jazz', jazz);
const standard = randomElement(standards/* .filter(s=>s.title.includes('Ipanema')) */);
/** 
 * Songs that sound good:
 * - Raincheck
 */
console.log('standard', standard, standard.music.measures);
let keyboard, bass, drums;

const context = new AudioContext();
const organic = true;
const mix = context.createGain();
mix.gain.value = 0.9;
mix.connect(context.destination);

// setup waveforms
const gains = {
    sine: 0.7,
    triangle: 0.5,
    //square: 0.2,
    /* sawtooth: 0.3 */
};
const [w1, w2] = [randomElement(Object.keys(gains)), randomElement(Object.keys(gains))];
console.log(w1, w2);

// setup instruments
if (organic) {
    keyboard = new jazz.Sampler({ samples: piano, midiOffset: 36, mix });
    bass = new jazz.Sampler({ samples: piano, midiOffset: 36, mix });
    //bass = new jazz.Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });
    drums = new jazz.Sampler({ samples: drumset, mix });
} else {
    bass = new jazz.Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });
    keyboard = new jazz.Synthesizer({ duration: 400, gain: gains[w2], type: w2, mix });
    // drums = new jazz.PlasticDrums({ mix });
    drums = new jazz.Sampler({ samples: drumset, mix });
}

// setup musicians and band
const pianist = new jazz.Pianist(keyboard);
const bassist = new jazz.Bassist(bass);
const drummer = new jazz.Drummer(drums);
const band = new jazz.Band({ musicians: [pianist, bassist, drummer], context });

window.onload = function () {
    // buttons
    const playJazz = document.getElementById('jazz');
    const playFunk = document.getElementById('funk');
    const pause = document.getElementById('pause');
    const stop = document.getElementById('stop');
    const slower = document.getElementById('slower');
    const faster = document.getElementById('faster');

    playJazz.addEventListener('click', () => {
        //band.comp(['D-7', 'G7', 'C^7', 'C^7'], { times: 5, bpm: 160, style: standard.style });
        band.comp(standard.music.measures, { arpeggio: false, times: 5, cycle: 4, bpm: 90 + Math.random() * 100, style: standard.style });
    })
    playFunk.addEventListener('click', () => {
        //band.comp(['C-7', 'C^7'], { times: 10, bpm: 90, style: 'Funk' });
        //band.comp(['C-7', ['C^7', 'F^7'], 'A-7', ['Ab-7', 'Db7']], { times: 5, bpm: 90, style: 'Funk' });
        band.comp(standard.music.measures, { arpeggio: false, times: 5, bpm: 90, style: 'Funk' });
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
}
