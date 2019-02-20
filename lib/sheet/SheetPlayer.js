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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var Harmony_1 = require("../harmony/Harmony");
var index_js_1 = require("../../demo/samples/piano/index.js");
var SheetPlayer = /** @class */ (function () {
    function SheetPlayer() {
    }
    SheetPlayer.getSequence = function (sheet) {
        return Sheet_1.Sheet.render(sheet)
            .map(function (measure, measureIndex) { return Measure_1.Measure.from(measure).chords
            .map(function (chord, chordIndex) { return ({ chord: chord, path: [measureIndex, chordIndex], measure: measure }); }); });
    };
    SheetPlayer.play = function (sheet, options) {
        return __awaiter(this, void 0, void 0, function () {
            var chords, melody, swing, bpm, compingPart, melodyPart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sheet = __assign({ chords: [], melody: [], forms: 2, cycle: 4, bpm: 130, swing: 0.7 }, sheet);
                        chords = sheet.chords, melody = sheet.melody, swing = sheet.swing, bpm = sheet.bpm;
                        Logger_1.Logger.logLegend();
                        Logger_1.Logger.logSheet(sheet);
                        Tone.Transport.bpm.value = bpm;
                        Tone.Transport.swing = swing;
                        Tone.Transport.swingSubdivision = "8n";
                        if (console.group) {
                            console.group('SheetPlayer.play');
                        }
                        if (!chords) return [3 /*break*/, 2];
                        return [4 /*yield*/, SheetPlayer.comp(chords, options)];
                    case 1:
                        compingPart = _a.sent();
                        SheetPlayer.parts.push(compingPart.start(0));
                        _a.label = 2;
                    case 2:
                        if (!melody) return [3 /*break*/, 4];
                        return [4 /*yield*/, SheetPlayer.melody(melody)];
                    case 3:
                        melodyPart = _a.sent();
                        SheetPlayer.parts.push(melodyPart.start(0));
                        _a.label = 4;
                    case 4:
                        Tone.Transport.start('+1');
                        return [2 /*return*/];
                }
            });
        });
    };
    SheetPlayer.stop = function () {
        SheetPlayer.parts.forEach(function (part) {
            part.stop();
        });
        SheetPlayer.instruments.forEach(function (instrument) {
            if (instrument.releaseAll) {
                instrument.releaseAll();
            }
            else {
                instrument.triggerRelease();
            }
        });
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
        return __awaiter(this, void 0, void 0, function () {
            var _a, maxVoices, pedal, real, bass, piano, sequence, currentVoicing, lastVoicing, currentBassnote, lastBassNote;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options = __assign({ range: ['C3', 'C5'], maxVoices: 4, maxDistance: 7, minBottomDistance: 3, minTopDistance: 2 }, options);
                        _a = __assign({ pedal: false, real: true }, options), maxVoices = _a.maxVoices, pedal = _a.pedal, real = _a.real;
                        return [4 /*yield*/, SheetPlayer.getBass(real)];
                    case 1:
                        bass = _b.sent();
                        SheetPlayer.instruments.push(bass);
                        return [4 /*yield*/, SheetPlayer.getPiano(maxVoices, real)];
                    case 2:
                        piano = _b.sent();
                        SheetPlayer.instruments.push(piano);
                        sequence = SheetPlayer.getSequence(sheet);
                        return [2 /*return*/, new Tone.Sequence(function (time, event) {
                                var chord = event.chord;
                                if (event.path[1] === 0) {
                                    if (event.path[0] === 0) {
                                        console.log("-- new chorus --");
                                    }
                                }
                                currentVoicing = __1.Voicing.getNextVoicing(chord, lastVoicing, options);
                                currentVoicing = currentVoicing.map(function (note) { return tonal_1.Note.simplify(note); });
                                if (currentVoicing) {
                                    var pianoNotes = SheetPlayer.getAttackRelease(currentVoicing, lastVoicing, pedal);
                                    /* piano.triggerRelease(pianoNotes.release, time);
                                    piano.triggerAttack(pianoNotes.attack, time); */
                                    SheetPlayer.releaseAll(pianoNotes.release, piano, time);
                                    SheetPlayer.attackAll(pianoNotes.attack, piano, time);
                                    /* piano.triggerAttack(currentVoicing[0], time); */
                                    lastVoicing = currentVoicing;
                                    // piano.triggerAttackRelease(pianoNotes.attack);
                                }
                                else if (lastVoicing) {
                                    // TODO
                                    piano.triggerRelease(lastVoicing, time);
                                    lastVoicing = null;
                                }
                                currentBassnote = Harmony_1.Harmony.getBassNote(chord) + '2';
                                if (currentBassnote) {
                                    if (!pedal || currentBassnote !== lastBassNote) {
                                        /* bass.triggerRelease(lastBassNote, time); */
                                        bass.triggerAttack(currentBassnote, time);
                                    }
                                    lastBassNote = currentBassnote;
                                    //bass.triggerAttack(note, "1n", time);
                                }
                                else if (lastBassNote) {
                                    /* bass.triggerRelease(lastBassNote, time); */
                                    piano.triggerRelease(lastBassNote, time);
                                    lastBassNote = null;
                                }
                            }, sequence, "1m")];
                }
            });
        });
    };
    SheetPlayer.attackAll = function (notes, instrument, time) {
        if (time === void 0) { time = 0; }
        notes.forEach(function (note) { return instrument.triggerAttack(note, time); });
    };
    SheetPlayer.releaseAll = function (notes, instrument, time) {
        if (time === void 0) { time = 0; }
        notes.forEach(function (note) { return instrument.triggerRelease(note, time); });
    };
    SheetPlayer.getAttackRelease = function (newNotes, oldNotes, pedal) {
        if (newNotes === void 0) { newNotes = []; }
        if (oldNotes === void 0) { oldNotes = []; }
        if (pedal === void 0) { pedal = false; }
        if (!newNotes) {
            return;
        }
        var attack = [], release = [];
        if (!pedal) {
            release = oldNotes;
            attack = newNotes;
        }
        else {
            release = oldNotes.filter(function (note) { return !newNotes.find(function (n) { return Harmony_1.Harmony.isSameNote(note, n); }); });
            attack = newNotes.filter(function (note) { return !oldNotes.find(function (n) { return Harmony_1.Harmony.isSameNote(note, n); }); });
        }
        return { attack: attack, release: release };
    };
    SheetPlayer.getBass = function (real) {
        if (real === void 0) { real = false; }
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
    };
    SheetPlayer.getPiano = function (voices, real) {
        if (voices === void 0) { voices = 4; }
        if (real === void 0) { real = true; }
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return new Tone.PolySynth(voices, Tone.Synth, {
            "volume": -18,
            "oscillator": {
                "partials": [1, .5, .25, .125],
            }
        }).toMaster();
    };
    SheetPlayer.getRealPiano = function () {
        if (SheetPlayer.realPiano) {
            return SheetPlayer.realPiano;
        }
        SheetPlayer.realPiano = new Promise(function (resolve, reject) {
            var sampler = new Tone.Sampler(index_js_1.piano, {
                volume: -4,
                onload: function () { return resolve(sampler); }
            }).toMaster();
        });
        return SheetPlayer.realPiano;
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
    SheetPlayer.parts = [];
    SheetPlayer.instruments = [];
    return SheetPlayer;
}());
exports.SheetPlayer = SheetPlayer;
