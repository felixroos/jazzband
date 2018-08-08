import jazz from '../jazzband';
import { piano } from './samples/piano';
import { drumset } from './samples/drumset';
import standards from './standards.json';
import { randomElement } from '../jazzband/src/util';

console.log('jazz', jazz);
const standard = randomElement(standards/* .filter(s=>s.style==='Funk') */);
console.log('standard', standard, standard.music.measures);

const context = new AudioContext();
const pianist = new jazz.Pianist({
    instrument: new jazz.Instrument({ samples: piano, midiOffset: 36, context }), context
});
const bassist = new jazz.Bassist({
    instrument: new jazz.Instrument({ samples: piano, midiOffset: 36, context }), context
});
const drummer = new jazz.Drummer({
    instrument: new jazz.Instrument({ context, samples: drumset }), context
});
const band = new jazz.Band({ musicians: [pianist, bassist, drummer], context });


window.onload = function () {
    const playJazz = document.getElementById('jazz');
    const playFunk = document.getElementById('funk');
    const pause = document.getElementById('pause');
    const stop = document.getElementById('stop');
    const slower = document.getElementById('slower');
    const faster = document.getElementById('faster');

    playJazz.addEventListener('click', () => {
        //band.comp(['D-7', 'G7', 'C^7', 'C^7'], { times: 5, bpm: 160, style: standard.style });
        band.comp(standard.music.measures, { /* exact: true, */ times: 3, cycle: 4, bpm: 130, style: standard.style });
    })
    playFunk.addEventListener('click', () => {
        //band.comp(['C-7', ['C^7', 'F^7'], 'A-7', ['Ab-7', 'Db7']], { times: 5, bpm: 90, style: 'Funk' });
        band.comp(standard.music.measures, { times: 3, bpm: 90, style: 'Funk' });
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
