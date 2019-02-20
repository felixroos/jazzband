import { Logger } from '../util/Logger';
import { Sheet } from './Sheet';
import { Measure } from './Measure';
import * as Tone from 'tone';
import { Voicing } from '..';
import { Note } from 'tonal';
import { VoiceLeadingOptions } from '../harmony/Voicing';
import { Harmony } from '../harmony/Harmony';
import { piano as pianoSamples } from '../../demo/samples/piano/index.js';

export declare interface SheetPlayerOptions extends VoiceLeadingOptions {
    /** If true, a new voicing will not attack notes that stayed since the last voicing */
    pedal?: boolean;
    /** If true, "real" instruments will be used */
    real?: boolean;
}

export class SheetPlayer {
    static parts = [];
    static instruments = [];
    static realPiano;

    static getSequence(sheet) {
        return Sheet.render(sheet)
            .map((measure, measureIndex) => Measure.from(measure).chords
                .map((chord, chordIndex) => ({ chord, path: [measureIndex, chordIndex], measure })));
    }

    static async play(sheet, options?: SheetPlayerOptions) {
        sheet = {
            chords: [],
            melody: [],
            forms: 2,
            cycle: 4,
            bpm: 130,
            swing: 0.7,
            ...sheet,
        }
        let {
            chords,
            melody,
            swing,
            bpm,
        } = sheet;
        Logger.logLegend();
        Logger.logSheet(sheet);

        Tone.Transport.bpm.value = bpm;
        Tone.Transport.swing = swing;
        Tone.Transport.swingSubdivision = "8n"

        if (console.group) {
            console.group('SheetPlayer.play');
        }
        if (chords) {
            const compingPart = await SheetPlayer.comp(chords, options);
            SheetPlayer.parts.push(compingPart.start(0));
        }
        if (melody) {
            const melodyPart = await SheetPlayer.melody(melody);
            SheetPlayer.parts.push(melodyPart.start(0));
        }
        Tone.Transport.start('+1');
    }

    static stop() {
        SheetPlayer.parts.forEach(part => {
            part.stop();
        });
        SheetPlayer.instruments.forEach(instrument => {
            if (instrument.releaseAll) {
                instrument.releaseAll();
            } else {
                instrument.triggerRelease();
            }
        });
    }

    static melody(sequence) {

        const lead = SheetPlayer.getLead();
        /* const sequence = SheetPlayer.getSequence(sheet); */
        return new Tone.Sequence((time, note) => {
            if (note.match(/[a-g][b|#]?[0-6]/)) {
                lead.triggerAttackRelease(note, "1n");
            }
        }, sequence, "1m");
    }

    static async comp(sheet, options?: SheetPlayerOptions) {

        options = {
            range: ['C3', 'C5'],
            maxVoices: 4,
            maxDistance: 7,
            minBottomDistance: 3, // min semitones between the two bottom notes
            minTopDistance: 2, // min semitones between the two top notes
            ...options
        }
        let { maxVoices, pedal, real }: SheetPlayerOptions =
        {
            pedal: false,
            real: true,
            ...options
        };

        const bass = await SheetPlayer.getBass(real);
        SheetPlayer.instruments.push(bass);
        const piano = await SheetPlayer.getPiano(maxVoices, real);
        SheetPlayer.instruments.push(piano);


        const sequence = SheetPlayer.getSequence(sheet);

        let currentVoicing, lastVoicing, currentBassnote, lastBassNote;
        return new Tone.Sequence(function (time, event) {
            const { chord } = event;
            if (event.path[1] === 0) {
                if (event.path[0] === 0) {
                    console.log(`-- new chorus --`);
                }
            }

            currentVoicing = Voicing.getNextVoicing(chord, lastVoicing, options);
            currentVoicing = currentVoicing.map(note => Note.simplify(note));
            if (currentVoicing) {
                let pianoNotes = SheetPlayer.getAttackRelease(currentVoicing, lastVoicing, pedal);
                /* piano.triggerRelease(pianoNotes.release, time);
                piano.triggerAttack(pianoNotes.attack, time); */
                SheetPlayer.releaseAll(pianoNotes.release, piano, time);
                SheetPlayer.attackAll(pianoNotes.attack, piano, time);

                /* piano.triggerAttack(currentVoicing[0], time); */
                lastVoicing = currentVoicing;
                // piano.triggerAttackRelease(pianoNotes.attack);
            } else if (lastVoicing) {
                // TODO
                piano.triggerRelease(lastVoicing, time);
                lastVoicing = null;
            }

            currentBassnote = Harmony.getBassNote(chord) + '2';
            if (currentBassnote) {
                if (!pedal || currentBassnote !== lastBassNote) {
                    /* bass.triggerRelease(lastBassNote, time); */
                    bass.triggerAttack(currentBassnote, time);
                }
                lastBassNote = currentBassnote;
                //bass.triggerAttack(note, "1n", time);
            } else if (lastBassNote) {
                /* bass.triggerRelease(lastBassNote, time); */
                piano.triggerRelease(lastBassNote, time);
                lastBassNote = null;
            }

        }, sequence, "1m");
    }

    static attackAll(notes, instrument, time = 0) {
        notes.forEach(note => instrument.triggerAttack(note, time));
    }

    static releaseAll(notes, instrument, time = 0) {
        notes.forEach(note => instrument.triggerRelease(note, time));
    }

    static getAttackRelease(newNotes = [], oldNotes = [], pedal = false) {
        if (!newNotes) {
            return;
        }
        let attack = [], release = [];
        if (!pedal) {
            release = oldNotes;
            attack = newNotes;
        } else {
            release = oldNotes.filter(note => !newNotes.find(n => Harmony.isSameNote(note, n)));
            attack = newNotes.filter(note => !oldNotes.find(n => Harmony.isSameNote(note, n)));
        }
        return { attack, release };
    }

    static getBass(real = false) {
        if (real) {
            return SheetPlayer.getRealPiano();
        }
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

    static getPiano(voices = 4, real = true) {
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return new Tone.PolySynth(voices, Tone.Synth, {
            "volume": -18,
            "oscillator": {
                "partials": [1, .5, .25, .125],
            }
        }).toMaster();
    }

    static getRealPiano() {
        if (SheetPlayer.realPiano) {
            return SheetPlayer.realPiano;
        }
        SheetPlayer.realPiano = new Promise((resolve, reject) => {
            const sampler = new Tone.Sampler(pianoSamples, {
                volume: -4,
                onload: () => resolve(sampler)
            }).toMaster();
        });
        return SheetPlayer.realPiano;
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