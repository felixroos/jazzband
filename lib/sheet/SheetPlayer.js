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
var SheetPlayer = /** @class */ (function () {
    function SheetPlayer() {
    }
    SheetPlayer.getSequence = function (sheet) {
        return Sheet_1.Sheet.render(sheet)
            .map(function (measure, measureIndex) { return Measure_1.Measure.from(measure).chords
            .map(function (chord, chordIndex) { return ({ chord: chord, path: [measureIndex, chordIndex], measure: measure }); }); });
    };
    SheetPlayer.play = function (sheet) {
        sheet = __assign({ chords: [], melody: [], forms: 2, cycle: 4, bpm: 130, swing: 0.7, maxVoices: 4 }, sheet);
        var chords = sheet.chords, melody = sheet.melody, forms = sheet.forms, title = sheet.title, cycle = sheet.cycle, swing = sheet.swing, bpm = sheet.bpm, maxVoices = sheet.maxVoices;
        Logger_1.Logger.logLegend();
        Logger_1.Logger.logSheet(sheet);
        var bass = SheetPlayer.getBass();
        var piano = SheetPlayer.getPiano();
        var lead = SheetPlayer.getLead();
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.swing = swing;
        Tone.Transport.swingSubdivision = "8n";
        if (console.group) {
            console.group('SheetPlayer.play');
        }
        if (chords) {
            SheetPlayer.comp(chords, { bass: bass, piano: piano, maxVoices: maxVoices }).start(0);
            ;
        }
        if (melody) {
            SheetPlayer.melody(melody, { lead: lead }).start(0);
            ;
        }
        Tone.Transport.start('+1');
    };
    SheetPlayer.melody = function (sequence, _a) {
        var lead = _a.lead;
        /* const sequence = SheetPlayer.getSequence(sheet); */
        return new Tone.Sequence(function (time, note) {
            if (note.match(/[a-g][b|#]?[0-6]/)) {
                lead.triggerAttackRelease(note, "1n");
            }
        }, sequence, "1m");
    };
    SheetPlayer.comp = function (sheet, _a) {
        var bass = _a.bass, piano = _a.piano, maxVoices = _a.maxVoices;
        maxVoices = maxVoices || 4;
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
            voicing = __1.Voicing.getNextVoicing(chord, latest, range, maxVoices);
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
    SheetPlayer.getPiano = function () {
        return new Tone.PolySynth(4, Tone.Synth, {
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
