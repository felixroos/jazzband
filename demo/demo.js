import iRealReader from 'ireal-reader';
import { Trio, Sampler, util } from '../lib';
import { bossa } from '../src/grooves/bossa';
// import { disco } from '../src/grooves/disco';
import { funk } from '../src/grooves/funk';
import { swing } from '../src/grooves/swing';
import { RealParser } from '../src/sheet/RealParser';
import { Snippet } from '../src/sheet/Snippet';
import link from '../songs/1350.json';
/* import { harp } from './samples/harp'; */
import { drumset } from '../src/samples/drumset';
import { piano } from '../src/samples/piano';
import { Sheet } from '../src/sheet/Sheet';
var AudioContext = window.AudioContext // Default
    || window.webkitAudioContext // Safari and old versions of Chrome
    || false;
if (!AudioContext) {
    alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
}
const context = new AudioContext();
const playlist = new iRealReader(decodeURI(link));

// bass = new Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });
const keyboard = new Sampler({ samples: piano, midiOffset: 24, gain: 1, context });
// const keyboard = new WebAudioFont({ context, preset: 50, gain: .8 });
// const bass = new WebAudioFont({ context, preset: 366 });
const bass = keyboard;
// const harpInstrument = new Sampler({ samples: harp, midiOffset: 24, gain: 1, context });
const drums = new Sampler({ samples: drumset, context, gain: 0.5, duration: 6000 });
const band = new Trio({ context, piano: keyboard, bass/* : false */, drums, solo: false });


window.onload = function () {
    // buttons
    const playJazz = document.getElementById('jazz');
    const playFunk = document.getElementById('funk');
    const playBossa = document.getElementById('bossa');
    const playExact = document.getElementById('exact');
    const stopButton = document.getElementById('stop');
    const slower = document.getElementById('slower');
    const faster = document.getElementById('faster');
    const next = document.getElementById('next');
    const searchInput = document.getElementById('searchInput');
    const playChords = document.getElementById('playChords');
    const format = document.getElementById('format');
    /* const transposeUp = document.getElementById('transposeUp');
    const transposeDown = document.getElementById('transposeDown'); */
    const minify = document.getElementById('minify');
    const standardTitle = document.getElementById('standardTitle');
    const textarea = document.getElementById('chords');
    const cheapSynths = document.getElementById('cheapsynths');
    const usePiano = document.getElementById('usePiano');
    let standard, sheet, groove = swing;

    function getStandard(playlist, query) {
        let newStandard;
        if (query) {
            newStandard = util.randomElement(playlist.songs.filter(s => s.title.toLowerCase().includes(query.toLowerCase())));
        } else {
            newStandard = util.randomElement(playlist.songs);
        }

        if (newStandard) {
            newStandard.music.measures = RealParser.parseSheet(newStandard.music.raw); // TODO: add Song that can be passed to comp
            return newStandard;
        }
    }

    loadStandard();

    next.addEventListener('click', () => {
        loadStandard();
        searchInput.value = '';
    });

    searchInput.addEventListener('keyup', () => {
        const query = searchInput.value;
        loadStandard(query);
    });

    function stop() {
        if (band.pulse) {
            band.pulse.stop();
        }
    }

    function loadStandard(query) {
        standard = getStandard(playlist, query) || standard;
        textarea.value = Snippet.from(standard.music.measures);
        setTitle(standard.composer + ' - ' + standard.title);
        sheet = {
            composer: standard.composer,
            title: standard.title,
            chords: standard.music.measures
        };
        stop();
    }

    function setTitle(title) {
        standardTitle.innerHTML = title;
    }

    function play(leadsheet = sheet, groove = swing) {
        if (band.pulse) {
            band.pulse.stop();
        }
        const forms = 2;
        const time = 4;
        const bpm = groove ? groove.tempo : 130;
        setTitle(sheet.composer + ' - ' + sheet.title);
        band.comp(sheet, {
            render: { forms },
            metronome: false,
            exact: !groove,
            cycle: time,
            bpm,
            groove,
            voicings: {
                range: ['C3', 'C#5'], // allowed voice range
                maxVoices: 4, // maximum number of voices per chord
                maxDistance: 7,  // general max distance between single voices
                minDistance: 1,  // general max distance between single voices
                minBottomDistance: 3, // min semitones between the two bottom notes
                minTopDistance: 2, // min semitones between the two top notes
                noTopDrop: true,
                noTopAdd: true,
                // bottomDegrees: [1],
                // topDegrees: [3, 7],
                // omitNotes: ['Bb'],
                // topNotes: ['B', 'C', 'C#'],
                rangeBorders: [2, 1],
                noBottomDrop: false,
                noBottomAdd: true,
                idleChance: 1,
                logging: true
            },
            onMeasure: (measure) => {
                selectCell(measure.index);

            }
        });
    }
    usePiano.addEventListener('click', () => {
        stop();
        band.pianist.instrument = keyboard;
        band.bassist.instrument = bass;
        /* band.soloist.instrument = util.randomSynth(band.mix, allowed); */
        console.log('pianist:', band.pianist.instrument.type);
        console.log('bassist:', band.bassist.instrument.type);
        play();
    });
    cheapSynths.addEventListener('click', () => {
        stop();
        const allowed = ['triangle', 'square', 'sawtooth'];
        band.pianist.instrument = util.randomSynth(band.mix, allowed);
        band.bassist.instrument = util.randomSynth(band.mix, ['sine']);
        /* band.soloist.instrument = util.randomSynth(band.mix, allowed); */
        console.log('pianist:', band.pianist.instrument.type);
        console.log('bassist:', band.bassist.instrument.type);
        play()
    });

    playJazz.addEventListener('click', () => play(sheet, swing));
    playFunk.addEventListener('click', () => play(sheet, funk));
    playBossa.addEventListener('click', () => play(sheet, bossa));
    playExact.addEventListener('click', () => play(sheet, false));

    stopButton.addEventListener('click', () => {
        stop();
    });
    slower.addEventListener('click', () => {
        band.pulse.changeTempo(band.pulse.props.bpm - 10);
        console.log('tempo', band.pulse.props.bpm);
    });
    faster.addEventListener('click', () => {
        band.pulse.changeTempo(band.pulse.props.bpm + 10);
        console.log('tempo', band.pulse.props.bpm);
    });

    textarea.addEventListener('click', () => {
        if (band.pulse) {
            band.pulse.stop();
        }
        sheet = {
            title: 'Custom Changes',
            composer: 'You',
            chords: Snippet.parse(textarea.value),
        }
        setTitle(sheet.composer + ' - ' + sheet.title);
    });

    playChords.addEventListener('click', () => {
        // the parseChords fn will transform the textarea string to a chord array
        sheet = {
            title: sheet.title,
            composer: sheet.composer,
            chords: Snippet.parse(textarea.value),
        }
        textarea.value = Snippet.format(textarea.value);
        play();
    });

    function selectCell(n) {
        const bounds = Snippet.getCellBounds(n, textarea.value);
        textarea.focus();
        textarea.setSelectionRange(bounds[0], bounds[1]);
    }
    let n = 0;
    format.addEventListener('click', () => {
        textarea.value = Snippet.format(textarea.value);
        selectCell(n++);
    });
    minify.addEventListener('click', () => {
        textarea.value = Snippet.minify(textarea.value, true);
    });
    /* function transpose(interval) {
        const sheet = Snippet.parse2(textarea.value);
        return Sheet.transpose(sheet, interval);
    }
    transposeUp.addEventListener('click', () => {
        textarea.value = Snippet.minify(textarea.value, true);
    });
    transposeDown.addEventListener('click', () => {
        textarea.value = Snippet.minify(textarea.value, true);
    }); */
}
