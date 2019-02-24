import { Logger } from '../util/Logger';
import { Sheet } from './Sheet';
import { Measure } from './Measure';
import * as Tone from 'tone';
import { Voicing } from '..';
import { Note } from 'tonal';
import { VoiceLeadingOptions } from '../harmony/Voicing';
import { Harmony } from '../harmony/Harmony';
import { piano as pianoSamples } from '../samples/piano/index.js';
import { drumSamples } from '../samples/drumset';
import { Snippet } from './Snippet';

export declare type noteTrigger = (time, duration?) => any;

declare interface Tone {
    [key: string]: any
};

export declare interface SheetPlayerOptions extends VoiceLeadingOptions {
    /** If true, a new voicing will not attack notes that stayed since the last voicing */
    pedal?: boolean;
    /** If true, "real" instruments will be used */
    real?: boolean;
    start?: number; // when to start
    swing?: number; // amount of swing
    swingSubdivision?: string;
}

export class SheetPlayer {
    static parts = [];
    static instruments = [];
    static realPiano;
    static realDrums;

    static getSequence(sheet) {
        return Sheet.render(sheet)
            .map((measure, measureIndex) => Measure.from(measure).chords
                .map((chord, chordIndex) => ({ chord, path: [measureIndex, chordIndex], measure })));
    }

    static async play(sheet, options?: SheetPlayerOptions) {
        SheetPlayer.stop();
        sheet = {
            chords: [],
            melody: [],
            forms: 2,
            cycle: 4,
            bpm: 130,
            swing: 0.5,
            swingSubdivision: '8n',
            ...sheet,
        }
        let {
            chords,
            melody,
            swing,
            swingSubdivision,
            bpm,
        } = sheet;
        Logger.logLegend();
        Logger.logSheet(sheet);

        Tone.Transport.bpm.value = bpm;
        Tone.Transport.swing = swing;
        Tone.Transport.swingSubdivision = swingSubdivision;

        SheetPlayer.playParts([
            await SheetPlayer.playChords(chords, options),
            await SheetPlayer.playBass(chords, options),
            await SheetPlayer.playMelody(melody, options),
            /* ...(await SheetPlayer.playDrums(sheet, options)) */
        ]);

        Tone.Transport.start('+1');
    }

    static playParts(parts) {
        SheetPlayer.parts = parts.filter(p => !!p);
        SheetPlayer.parts.forEach(part => part.start(0));
    }

    static stop(): void {
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
        SheetPlayer.parts = [];
        SheetPlayer.instruments = [];
    }

    static async playMelody(sequence, options?: SheetPlayerOptions): Promise<Tone.Sequence> {
        let { real } = options;
        const lead = await SheetPlayer.getLead(real);
        return new Tone.Sequence((time, note) => {
            if (note.match(/[a-g][b|#]?[0-6]/)) {
                if (note) {
                    lead.triggerAttackRelease(note, '2n', time);
                }
            }
        }, sequence, "1m");
    }

    static async playDrums(sheet, options?: SheetPlayerOptions): Promise<Tone.Sequence[]> {
        let { real } = {
            ...options
        };
        return SheetPlayer.getDrums(true).then(drums => {

            SheetPlayer.instruments.push(drums);

            const short = {
                'bd': 'kick',
                'sn': 'snare',
                'hh': 'hihat',
                'rc': 'ride',
                'rs': 'rimshot',
                'cr': 'crash',
            }

            const swing = [
                'rc . rc ~ rc . rc . rc ~ rc',
                '~ . hh . ~ . hh ',
                /* '~ . ~ rs ', */
                /* 'bd | ~ | bd | ~', */
                /* '~ | ~ | ~ | ~ . ~ ~ ~ ~ ~ sn' */,
            ];
            const triggerSound = (time, sound) => {
                if (drums[sound]) {
                    drums[sound](time);
                }
            }
            return swing.map(p => Snippet.parse2(p))
                .map(seq => new Tone.Sequence((time, sound) =>
                    triggerSound(time, short[sound]),
                    seq, "1m"));
        });
    }

    static async playChords(sheet, options: SheetPlayerOptions = {}): Promise<Tone.Sequence> {
        if (!sheet) {
            return;
        }
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
        const piano = await SheetPlayer.getPiano(maxVoices, real);
        SheetPlayer.instruments.push(piano);

        const sequence = SheetPlayer.getSequence(sheet);
        let currentVoicing, previousVoicing;
        return new Tone.Sequence(function (time, event) {
            const { chord } = event;
            if (event.path[1] === 0) {
                if (event.path[0] === 0) {
                    console.log(`-- new chorus --`);
                }
            }
            currentVoicing = Voicing.getNextVoicing(chord, previousVoicing, options);
            currentVoicing = currentVoicing.map(note => Note.simplify(note));
            if (currentVoicing) {
                let pianoNotes = SheetPlayer.getAttackRelease(currentVoicing, previousVoicing, pedal);

                if (pedal) {
                    SheetPlayer.releaseAll(pianoNotes.release, piano, time);
                } else {
                    piano.releaseAll(time);
                }
                SheetPlayer.attackAll(pianoNotes.attack, piano, time);

                previousVoicing = currentVoicing;
            } else if (previousVoicing) {
                // TODO
                piano.triggerRelease(previousVoicing, time);
                previousVoicing = null;
            }
        }, sequence, "1m");
    }

    static async playBass(sheet, options: SheetPlayerOptions = {}): Promise<Tone.Sequence> {
        if (!sheet) {
            return;
        }
        let { real, pedal } = {
            ...options
        };
        const sequence = SheetPlayer.getSequence(sheet);

        const bass = await SheetPlayer.getBass(real);
        SheetPlayer.instruments.push(bass);
        let currentBassnote, previousBassNote;
        return new Tone.Sequence(function (time, event) {
            const { chord } = event;
            currentBassnote = Harmony.getBassNote(chord) + '2';
            if (currentBassnote) {
                if (!pedal || currentBassnote !== previousBassNote) {
                    bass.triggerAttack(currentBassnote, time);
                }
                previousBassNote = currentBassnote;
            } else if (previousBassNote) {
                bass.triggerRelease(previousBassNote, time);
                previousBassNote = null;
            }
        }, sequence, "1m");
    }

    static attackAll(notes, instrument, time = 0): void {
        notes.forEach(note => instrument.triggerAttack(note, time));
    }

    static releaseAll(notes, instrument, time = 0): void {
        notes.forEach(note => instrument.triggerRelease(note, time));
    }

    static getAttackRelease(newNotes = [], oldNotes = [], pedal = false): { attack: string[], release: string[] } {
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

    static getBass(real = false): Promise<Tone.Instrument> {
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return Promise.resolve(
            new Tone.MonoSynth({
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
            }).toMaster()
        );
    }

    static async getDrums(real = true): Promise<{ [sound: string]: noteTrigger }> {
        if (real) {
            return SheetPlayer.getRealDrums();
        }
        const hihat = await SheetPlayer.hihat();
        const ride = await SheetPlayer.ride();
        return {
            // hihat: (time, duration) => hihat.triggerAttackRelease(time, duration),
            ride: (time, duration) => {
                console.log('ride', time, duration);
                ride.triggerAttackRelease(time, duration)
            },
        }
    }

    static ride() {
        return Promise.resolve(
            new Tone.MetalSynth({
                volume: -30,
                frequency: 200,
                envelope: {
                    attack: 0.001,
                    decay: 1,
                    release: 1
                },
                harmonicity: 6,
                modulationIndex: 8,
                resonance: 3000,
                octaves: 1
            }).toMaster()
        );
    }
    static hihat() {
        return Promise.resolve(
            new Tone.MetalSynth({
                volume: -22,
                frequency: 200,
                envelope: {
                    attack: 0.001,
                    decay: .1,
                    release: .1
                },
                harmonicity: 5.1,
                modulationIndex: 100,
                resonance: 100,
                octaves: 2
            }).toMaster()
        );
    }

    static getPiano(voices = 4, real = true): Promise<Tone.Instrument> {
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return Promise.resolve(
            new Tone.PolySynth(voices, Tone.Synth, {
                "volume": -18,
                "oscillator": {
                    "partials": [1, 2, 3],
                }
            }).toMaster()
        );
    }

    static getRealPiano(): Promise<Tone.Instrument> {
        if (SheetPlayer.realPiano) {
            return SheetPlayer.realPiano;
        }
        SheetPlayer.realPiano = SheetPlayer.getSampler(pianoSamples, { volume: -4 });
        return SheetPlayer.realPiano;
    }

    static async getRealDrums(): Promise<Tone.Instrument> {
        if (SheetPlayer.realDrums) {
            return SheetPlayer.realDrums;
        }
        const sampler = await SheetPlayer.getSampler(drumSamples, { volume: -8 });
        SheetPlayer.realDrums = {
            kick: (time, duration) => sampler.triggerAttackRelease('C1', time),
            snare: (time, duration) => sampler.triggerAttackRelease('C2', time),
            hihat: (time, duration) => sampler.triggerAttackRelease('C3', time),
            ride: (time, duration) => sampler.triggerAttackRelease('C4', time),
            crash: (time, duration) => sampler.triggerAttackRelease('C5', time),
            rimshot: (time, duration) => sampler.triggerAttackRelease('C6', time),
        }
        return SheetPlayer.realDrums;
    }

    static getSampler(samples, options): Promise<Tone.Instrument> {
        return new Promise((resolve, reject) => {
            const sampler = new Tone.Sampler(samples, {
                ...options, onload: () => resolve(sampler)
            }).toMaster();
        });
    }

    static getLead(real?): Tone.Instrument {
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return new Tone.FMSynth({
            volume: -12,
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0.6,
                release: 0.1
            },
            portamento: 0.05
        }).toMaster();
    }
}