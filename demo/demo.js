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
import { Sheet } from '../lib/sheet/Sheet';

var AudioContext =
  window.AudioContext || // Default
  window.webkitAudioContext || // Safari and old versions of Chrome
  false;
if (!AudioContext) {
  alert(
    'Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox'
  );
}
const context = new AudioContext();
const playlist = new iRealReader(decodeURI(link));

// bass = new Synthesizer({ duration: 400, gain: gains[w1], type: w1, mix });
const keyboard = new Sampler({
  samples: piano,
  midiOffset: 24,
  gain: 1,
  context
});
// const keyboard = new WebAudioFont({ context, preset: 50, gain: .8 });
// const bass = new WebAudioFont({ context, preset: 366 });
const bass = keyboard;
// const harpInstrument = new Sampler({ samples: harp, midiOffset: 24, gain: 1, context });
const drums = new Sampler({
  samples: drumset,
  context,
  gain: 0.5,
  duration: 6000
});
const band = new Trio({
  context,
  piano: keyboard,
  bass /* : false */,
  drums,
  solo: false
});

const grooves = [swing, bossa, funk];

window.onload = function() {
  const stopButton = document.getElementById('stop');
  const slower = document.getElementById('slower');
  const faster = document.getElementById('faster');
  const tempoInput = document.getElementById('tempoInput');
  const next = document.getElementById('next');
  const searchInput = document.getElementById('searchInput');
  const playChords = document.getElementById('playChords');
  const format = document.getElementById('format');
  /* const transposeUp = document.getElementById('transposeUp');
    const transposeDown = document.getElementById('transposeDown'); */
  const toggleTraining = document.getElementById('startTraining');
  const nextChord = document.getElementById('nextChord');
  const playAgain = document.getElementById('playAgain');
  const playChordAgain = document.getElementById('playChordAgain');
  const playBassOnly = document.getElementById('playBassOnly');
  const playArpeggio = document.getElementById('playArpeggio');
  const minify = document.getElementById('minify');
  const standardTitle = document.getElementById('standardTitle');
  const textarea = document.getElementById('chords');
  const cheapSynths = document.getElementById('cheapsynths');
  const usePiano = document.getElementById('usePiano');
  let standard,
    sheet,
    latestGroove = swing,
    latestSettings,
    latestPath,
    latestChord,
    duration = 800,
    trainMode = false,
    guess = '';

  let bpm = latestGroove.tempo || 120;
  tempoInput.value = bpm;

  function getStandard(playlist, query) {
    let newStandard;
    if (query) {
      newStandard = util.randomElement(
        playlist.songs.filter(s =>
          s.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      newStandard = util.randomElement(playlist.songs);
    }

    if (newStandard) {
      newStandard.music.measures = RealParser.parseSheet(newStandard.music.raw); // TODO: add Song that can be passed to comp
      setPath(null);
      latestChord = null;
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
    sheet = {
      composer: standard.composer,
      title: standard.title,
      chords: standard.music.measures
    };
    guess = '';
    if (trainMode) {
      guess = Snippet.from(Sheet.obfuscate(sheet.chords));
      textarea.value = guess;
    } else {
      textarea.value = Snippet.from(sheet.chords, true);
    }
    setTitle(standard.composer + ' - ' + standard.title);
    stop();
  }

  function setTitle(title) {
    standardTitle.innerHTML = title;

    document.getElementById(
      'ytLink'
    ).href = `https://www.youtube.com/results?search_query=${title.replace(
      ' ',
      '+'
    )}`;
    document.getElementById('ytLink').innerHTML = 'yt';
  }

  function play(leadsheet = sheet, groove = latestGroove, resetBpm = false) {
    if (band.pulse) {
      band.pulse.stop();
    }
    setGroove(groove);
    textarea.value = Snippet.format(textarea.value);
    const forms = 2;
    const time = 4;
    if (resetBpm) {
      setTempo(groove.tempo || 100);
    }
    bpm = bpm || groove.tempo;
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
        maxDistance: 7, // general max distance between single voices
        minDistance: 1, // general max distance between single voices
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
      onMeasure: measure => {
        setPath([measure.index, 0]);
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
    play();
  });

  grooveSelect.addEventListener('change', e => {
    console.log('change groove to', e.target.value);
    const groove = grooves.find(g => g.name === e.target.value);
    play(sheet, groove || false, true);
  });

  stopButton.addEventListener('click', () => {
    stop();
  });
  function setTempo(tempo = bpm) {
    bpm = tempo;
    bpm = Math.max(30, bpm);
    bpm = Math.min(300, bpm);
    if (band.pulse) {
      band.pulse.changeTempo(bpm);
    }
    tempoInput.value = bpm;
  }
  function setGroove(groove = swing) {
    latestGroove = groove;
    const id = groove ? 'groove' + groove.name : 'grooveExact';
    /* document.getElementById(id).className = 'active'; */
  }

  tempoInput.addEventListener('blur', () => {
    setTempo(tempoInput.value);
  });
  slower.addEventListener('click', () => {
    setTempo(bpm - 10);
  });
  faster.addEventListener('click', () => {
    setTempo(bpm + 10);
  });

  textarea.addEventListener('click', () => {
    if (band.pulse) {
      band.pulse.stop();
    }
    if (trainMode) {
      return;
    }
    sheet = {
      title: 'Custom Changes',
      composer: 'You',
      chords: Snippet.parse2(textarea.value)
    };
    setTitle(sheet.composer + ' - ' + sheet.title);
  });

  textarea.addEventListener('blur', () => {
    if (trainMode) {
      guess = Snippet.format(textarea.value);
      return;
    }
    sheet = Object.assign(sheet, {
      chords: Snippet.parse2(textarea.value)
    });
  });

  playChords.addEventListener('click', () => {
    // the parseChords fn will transform the textarea string to a chord array
    sheet = {
      title: sheet.title,
      composer: sheet.composer,
      chords: trainMode ? sheet.chords : Snippet.parse2(textarea.value)
    };
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
        return Harmony.transposeSheet(sheet, interval);
    }
    transposeUp.addEventListener('click', () => {
        textarea.value = Snippet.minify(textarea.value, true);
    });
    transposeDown.addEventListener('click', () => {
        textarea.value = Snippet.minify(textarea.value, true);
    }); */
  /* function transpose(interval) {
        const sheet = Snippet.parse2(textarea.value);
        return Harmony.transposeSheet(sheet, interval);
    } */

  function setPath(path) {
    latestPath = path;
    playAgain.innerHTML = (latestPath || [0, 0]).join('/');
  }

  function playChord(
    path = [0, 0],
    { bassOnly, interval } = { bassOnly: false, interval: 0 }
  ) {
    if (!band.pianist) {
      console.warn('no pianist');
    }
    const chords = Sheet.stringify(sheet.chords);
    const chord = Sheet.getPath(chords, path);
    selectCell(path[0]);
    if (!chord) {
      console.warn('no chord');
      return;
    }
    latestChord = chord;
    setPath(path);
    if (!bassOnly) {
      band.pianist.playChord(latestChord, {
        duration,
        voicingOptions: {
          maxVoices: 4,
          forceBestPick: false,
          logIdle: true
        },
        interval
      });
    }
    band.bassist.playBass({
      value: { chord: latestChord },
      path: [0, 0],
      duration
    });
  }

  toggleTraining.addEventListener('click', () => {
    trainMode = !trainMode;
    toggleTraining.innerHTML = trainMode ? 'show solution' : 'hide solution';
    // TODO parse guess for missing chords => blame click :)
    stop();
    const solution = Snippet.from(sheet.chords);
    guess = !guess
      ? Snippet.from(Sheet.obfuscate(sheet.chords))
      : Snippet.format(guess, true);

    if (guess === solution) {
      alert('ALLES RICHTIG!!!!');
      toggleTraining.innerHTML = 'start ear training';
    } else if (guess && !trainMode) {
      console.warn('noch nicht alles richtig');
    }
    if (trainMode) {
      textarea.value = guess;
    } else {
      textarea.value = solution;
    }
  });

  nextChord.addEventListener('click', () => {
    stop();
    const chords = Sheet.stringify(sheet.chords);
    playChord(Sheet.nextPath(chords, latestPath), latestSettings);
  });

  prevChord.addEventListener('click', () => {
    stop();
    const chords = Sheet.stringify(sheet.chords);
    playChord(Sheet.nextPath(chords, latestPath, -1), latestSettings);
  });
  playAgain.addEventListener('click', () => {
    stop();
    playChord(latestPath || [0, 0], latestSettings);
  });

  /* playChordAgain.addEventListener('click', () => {
        stop();
        playChord(latestPath || [0, 0], false);
    });

    playBassOnly.addEventListener('click', () => {
        stop();
        playChord(latestPath || [0, 0], true);
    });

    playArpeggio.addEventListener('click', () => {
        stop();
        playChord(latestPath || [0, 0], false, .5);
    }); */

};
