"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = require("../util/Logger");
var Sheet_1 = require("./Sheet");
var Measure_1 = require("./Measure");
var Tone = __importStar(require("tone"));
var __1 = require("..");
var tonal_1 = require("tonal");
var SheetPlayer = /** @class */ (function () {
    function SheetPlayer() {
    }
    SheetPlayer.getSequence = function (sheet) {
        return Sheet_1.Sheet.render(sheet)
            .map(function (measure, measureIndex) { return Measure_1.Measure.from(measure).chords
            .map(function (chord, chordIndex) { return ({ chord: chord, path: [measureIndex, chordIndex], measure: measure }); }); });
    };
    SheetPlayer.play = function (sheet, options) {
        sheet = __assign({ chords: [], melody: [], forms: 2, cycle: 4, bpm: 130, swing: 0.7 }, sheet);
        var chords = sheet.chords, melody = sheet.melody, swing = sheet.swing, bpm = sheet.bpm;
        Logger_1.Logger.logLegend();
        Logger_1.Logger.logSheet(sheet);
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.swing = swing;
        Tone.Transport.swingSubdivision = "8n";
        if (console.group) {
            console.group('SheetPlayer.play');
        }
        if (chords) {
            SheetPlayer.comp(chords, options).start(0);
            ;
        }
        if (melody) {
            SheetPlayer.melody(melody).start(0);
            ;
        }
        Tone.Transport.start('+1');
    };
    SheetPlayer.melody = function (sequence) {
        var lead = SheetPlayer.getLead();
        /* const sequence = SheetPlayer.getSequence(sheet); */
        return new Tone.Sequence(function (time, note) {
            if (note.match(/[a-g][b|#]?[0-6]/)) {
                lead.triggerAttackRelease(note, "1n");
            }
        }, sequence, "1m");
    };
    SheetPlayer.comp = function (sheet, options) {
        options = __assign({ range: ['C3', 'C5'], maxVoices: 4, maxDistance: 7, minBottomDistance: 3, minTopDistance: 2 }, options);
        var maxVoices = options.maxVoices;
        var bass = SheetPlayer.getBass();
        var piano = SheetPlayer.getPiano(maxVoices);
        var sequence = SheetPlayer.getSequence(sheet);
        // console.log('comp', sheet, sequence);
        var range = ['C3', 'C5'];
        var voicing, latest;
        return new Tone.Sequence(function (time, event) {
            if (event.path[1] === 0) {
                if (event.path[0] === 0) {
                    console.log("-- new chorus --");
                }
            }
            var chord = event.chord;
            latest = voicing || latest;
            voicing = __1.Voicing.getNextVoicing(chord, latest, options);
            voicing = voicing.map(function (note) { return tonal_1.Note.simplify(note); });
            if (voicing) {
                piano.triggerAttackRelease(voicing, "1n");
                var note = chord.match((/[A-G][b|#]?/))[0] + '2';
                bass.triggerAttackRelease(note, "1n", time);
            }
        }, sequence, "1m");
    };
    SheetPlayer.getBass = function () {
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
    };
    SheetPlayer.getPiano = function (voices) {
        if (voices === void 0) { voices = 4; }
        return new Tone.PolySynth(voices, Tone.Synth, {
            "volume": -18,
            "oscillator": {
                "partials": [1, .5, .25, .125],
            }
        }).toMaster();
    };
    SheetPlayer.getLead = function () {
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
    };
    return SheetPlayer;
}());
exports.SheetPlayer = SheetPlayer;
