import { Logger } from '../util/Logger';
import { Sheet } from './Sheet';
import { Measure } from './Measure';
import * as Tone from 'tone';
import { Voicing } from '..';
import { Note } from 'tonal';

export class SheetPlayer {

    static getSequence(sheet) {
        return Sheet.render(sheet)
            .map((measure, measureIndex) => Measure.from(measure).chords
                .map((chord, chordIndex) => ({ chord, path: [measureIndex, chordIndex], measure })));
    }

    static play(sheet) {
        sheet = {
            chords: [],
            melody: [],
            forms: 2,
            cycle: 4,
            bpm: 130,
            swing: 0.7,
            maxVoices: 4,
            rootless: true,
            ...sheet,
        }
        let {
            chords,
            melody,
            forms,
            title,
            cycle,
            swing,
            bpm,
            maxVoices,
            rootless
        } = sheet;
        Logger.logLegend();
        Logger.logSheet(sheet);


        var bass = SheetPlayer.getBass();
        const piano = SheetPlayer.getPiano(maxVoices);
        const lead = SheetPlayer.getLead();

        Tone.Transport.bpm.value = bpm;
        Tone.Transport.swing = swing;
        Tone.Transport.swingSubdivision = "8n"
        if (console.group) {
            console.group('SheetPlayer.play');
        }
        if (chords) {
            SheetPlayer.comp(chords, { bass, piano, maxVoices, rootless }).start(0);;
        }
        if (melody) {
            SheetPlayer.melody(melody, { lead }).start(0);;
        }
        Tone.Transport.start('+1');
    }

    static melody(sequence, { lead }) {

        /* const sequence = SheetPlayer.getSequence(sheet); */
        return new Tone.Sequence((time, note) => {
            if (note.match(/[a-g][b|#]?[0-6]/)) {
                lead.triggerAttackRelease(note, "1n");
            }
        }, sequence, "1m");
    }

    static comp(sheet, { bass, piano, maxVoices, rootless }) {
        maxVoices = maxVoices || 4;
        const sequence = SheetPlayer.getSequence(sheet);
        // console.log('comp', sheet, sequence);
        const range = ['C3', 'C5'];
        let voicing, latest;
        return new Tone.Sequence(function (time, event) {
            if (event.path[1] === 0) {
                if (event.path[0] === 0) {
                    console.log(`-- new chorus --`);
                }
            }
            const chord = event.chord;
            latest = voicing || latest;
            voicing = Voicing.getNextVoicing(chord, latest, range, maxVoices, rootless);
            voicing = voicing.map(note => Note.simplify(note));
            if (voicing) {
                piano.triggerAttackRelease(voicing, "1n");
                const note = chord.match((/[A-G][b|#]?/))[0] + '2';
                bass.triggerAttackRelease(note, "1n", time);
            }
        }, sequence, "1m")
    }

    static getBass() {
        return new Tone.MonoSynth({
            "volume": -22,
            "envelope": {
                "attack": 0.02,
                "decay": 0.3,
                "release": 2,
            },
            "filterEnvelope": {
                "attack": 0.001,
                "decay": 0.001,
                "sustain": 0.4,
                "baseFrequency": 130,
                "octaves": 2.6
            }
        }).toMaster();
    }

    static getPiano(voices = 4) {
        return new Tone.PolySynth(voices, Tone.Synth, {
            "volume": -18,
            "oscillator": {
                "partials": [1, .5, .25, .125],
            }
        }).toMaster();
    }

    static getLead() {
        return new Tone.Synth({
            "volume": -12,
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0.6,
                release: 0.1
            },
            portamento: 0.01
        }).toMaster();
    }
}