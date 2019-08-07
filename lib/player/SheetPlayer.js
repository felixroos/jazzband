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
var Sheet_1 = require("../sheet/Sheet");
var Tone = __importStar(require("tone"));
var __1 = require("..");
var tonal_1 = require("tonal");
var Harmony_1 = require("../harmony/Harmony");
var index_js_1 = require("../samples/piano/index.js");
var drumset_1 = require("../samples/drumset");
var Snippet_1 = require("../sheet/Snippet");
var Sequence_1 = require("./Sequence");
var Leadsheet_1 = require("./Leadsheet");
;
var SheetPlayer = /** @class */ (function () {
    function SheetPlayer() {
    }
    SheetPlayer.getSequence = function (sheet, options) {
        if (options === void 0) { options = {}; }
        return Sheet_1.Sheet.render(sheet, options)
            .map(function (measure, measureIndex) { return measure.chords
            .map(function (chord, chordIndex) { return ({ chord: chord, path: [measureIndex, chordIndex], measure: measure }); }); });
    };
    SheetPlayer.play = function (sheet) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, swing, swingSubdivision, bpm, parts, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        SheetPlayer.stop();
                        sheet = __assign({ chords: [], melody: [], swing: 0.5, swingSubdivision: '8n' }, sheet);
                        sheet = Leadsheet_1.Leadsheet.from(sheet);
                        _a = sheet.options, swing = _a.swing, swingSubdivision = _a.swingSubdivision, bpm = _a.bpm;
                        Logger_1.Logger.logLegend();
                        Logger_1.Logger.logSheet(sheet);
                        Tone.Transport.bpm.value = bpm;
                        _c = (_b = SheetPlayer).playParts;
                        return [4 /*yield*/, SheetPlayer.playSheet(sheet)];
                    case 1:
                        parts = _c.apply(_b, [[
                                _d.sent()
                            ]]);
                        return [2 /*return*/, parts];
                }
            });
        });
    };
    SheetPlayer.playParts = function (parts) {
        SheetPlayer.parts = parts.filter(function (p) { return !!p; });
        SheetPlayer.parts.forEach(function (part) { return part.start(0); });
        Tone.Transport.start('+1');
        return SheetPlayer.parts;
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
        SheetPlayer.parts = [];
        SheetPlayer.instruments = [];
    };
    SheetPlayer.playMelody = function (sheet) {
        return __awaiter(this, void 0, void 0, function () {
            var real, lead;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sheet = Leadsheet_1.Leadsheet.from(sheet);
                        real = sheet.options.real;
                        return [4 /*yield*/, SheetPlayer.getLead(real)];
                    case 1:
                        lead = _a.sent();
                        return [2 /*return*/, new Tone.Sequence(function (time, note) {
                                if (note.match(/[a-g][b|#]?[0-6]/)) {
                                    if (note) {
                                        lead.triggerAttackRelease(note, '2n', time);
                                    }
                                }
                            }, sheet.melody, "1m")];
                }
            });
        });
    };
    SheetPlayer.playDrums = function (sheet, options) {
        if (options === void 0) { options = sheet.options; }
        return __awaiter(this, void 0, void 0, function () {
            var real;
            return __generator(this, function (_a) {
                real = __assign({}, options).real;
                return [2 /*return*/, SheetPlayer.getDrums(true).then(function (drums) {
                        SheetPlayer.instruments.push(drums);
                        var short = {
                            'bd': 'kick',
                            'sn': 'snare',
                            'hh': 'hihat',
                            'rc': 'ride',
                            'rs': 'rimshot',
                            'cr': 'crash',
                        };
                        var swing = [
                            'rc . rc ~ rc . rc . rc ~ rc',
                            '~ . hh . ~ . hh ',
                            ,
                            /* '~ . ~ rs ', */
                            /* 'bd | ~ | bd | ~', */
                            /* '~ | ~ | ~ | ~ . ~ ~ ~ ~ ~ sn' */ 
                        ];
                        var triggerSound = function (time, sound) {
                            if (drums[sound]) {
                                drums[sound](time);
                            }
                        };
                        return swing.map(function (p) { return Snippet_1.Snippet.parse2(p); })
                            .map(function (seq) { return new Tone.Sequence(function (time, sound) {
                            return triggerSound(time, short[sound]);
                        }, seq, "1m"); });
                    })];
            });
        });
    };
    SheetPlayer.renderSheetPart = function (sheet) {
        return __awaiter(this, void 0, void 0, function () {
            var chords, melody, _a, pedal, real, maxVoices, piano, sequence, part;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        chords = sheet.chords, melody = sheet.melody;
                        if (!chords && !melody) {
                            return [2 /*return*/];
                        }
                        sheet = Leadsheet_1.Leadsheet.from(sheet);
                        _a = sheet.options, pedal = _a.pedal, real = _a.real;
                        maxVoices = sheet.options.voicings.maxVoices;
                        if (melody) {
                            maxVoices *= 2;
                        }
                        return [4 /*yield*/, SheetPlayer.getPiano(maxVoices, real)];
                    case 1:
                        piano = _b.sent();
                        SheetPlayer.instruments.push(piano);
                        sequence = Sequence_1.Sequence.render(sheet).map(function (event) { return (__assign({}, event, { note: tonal_1.Note.simplify(event.value) })); }) /* .filter(e => !!e.note) */;
                        part = new Tone.Part(function (time, event) {
                            if (!event.note || event.type === 'chord') {
                                return; // chord events are just for displaying..
                            }
                            piano.triggerAttackRelease(event.note, event.duration, time, event.velocity);
                        }, sequence);
                        return [2 /*return*/, part];
                }
            });
        });
    };
    SheetPlayer.getPart = function (events, callback) {
        return __awaiter(this, void 0, Tone.Part, function () {
            var part;
            return __generator(this, function (_a) {
                part = new Tone.Part(callback, events);
                return [2 /*return*/, part];
            });
        });
    };
    SheetPlayer.playSheet = function (sheet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.renderSheetPart(sheet)];
                    case 1: return [2 /*return*/, (_a.sent()).start(0)];
                }
            });
        });
    };
    SheetPlayer.playChords = function (sheet) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pedal, real, maxVoices, piano, sequence, currentVoicing, previousVoicing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!sheet) {
                            return [2 /*return*/];
                        }
                        sheet = Leadsheet_1.Leadsheet.from(sheet);
                        _a = sheet.options, pedal = _a.pedal, real = _a.real;
                        maxVoices = sheet.options.voicings.maxVoices;
                        return [4 /*yield*/, SheetPlayer.getPiano(maxVoices, real)];
                    case 1:
                        piano = _b.sent();
                        SheetPlayer.instruments.push(piano);
                        sequence = SheetPlayer.getSequence(sheet.chords, sheet.options);
                        return [2 /*return*/, new Tone.Sequence(function (time, event) {
                                var chord = event.chord;
                                if (event.path[1] === 0) {
                                    if (event.path[0] === 0) {
                                        console.log("-- new chorus --");
                                    }
                                }
                                currentVoicing = __1.Voicing.getNextVoicing(chord, previousVoicing, sheet.options.voicings);
                                currentVoicing = currentVoicing.map(function (note) { return tonal_1.Note.simplify(note); });
                                if (currentVoicing) {
                                    var pianoNotes = SheetPlayer.getAttackRelease(currentVoicing, previousVoicing, pedal);
                                    if (pedal) {
                                        SheetPlayer.releaseAll(pianoNotes.release, piano, time);
                                    }
                                    else {
                                        piano.releaseAll(time);
                                    }
                                    SheetPlayer.attackAll(pianoNotes.attack, piano, time);
                                    previousVoicing = currentVoicing;
                                }
                                else if (previousVoicing) {
                                    // TODO
                                    piano.triggerRelease(previousVoicing, time);
                                    previousVoicing = null;
                                }
                            }, sequence, "1m")];
                }
            });
        });
    };
    SheetPlayer.playBass = function (sheet) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, real, pedal, sequence, bass, currentBassnote, previousBassNote;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!sheet) {
                            return [2 /*return*/];
                        }
                        sheet = Leadsheet_1.Leadsheet.from(sheet);
                        _a = sheet.options, real = _a.real, pedal = _a.pedal;
                        sequence = SheetPlayer.getSequence(sheet.chords, sheet.options);
                        return [4 /*yield*/, SheetPlayer.getBass(false)];
                    case 1:
                        bass = _b.sent();
                        SheetPlayer.instruments.push(bass);
                        return [2 /*return*/, new Tone.Sequence(function (time, event) {
                                var chord = event.chord;
                                currentBassnote = Harmony_1.Harmony.getBassNote(chord) + '2';
                                if (!Harmony_1.Harmony.isValidNote(currentBassnote)) {
                                    return;
                                }
                                if (currentBassnote) {
                                    if (!pedal || currentBassnote !== previousBassNote) {
                                        bass.triggerAttack(currentBassnote, time);
                                    }
                                    previousBassNote = currentBassnote;
                                }
                                else if (previousBassNote) {
                                    bass.triggerRelease(previousBassNote, time);
                                    previousBassNote = null;
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
            release = oldNotes.filter(function (note) { return !newNotes.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); }); });
            attack = newNotes.filter(function (note) { return !oldNotes.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); }); });
        }
        return { attack: attack, release: release };
    };
    SheetPlayer.getBass = function (real) {
        if (real === void 0) { real = false; }
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return Promise.resolve(new Tone.MonoSynth({
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
        }).toMaster());
    };
    SheetPlayer.getDrums = function (real) {
        if (real === void 0) { real = true; }
        return __awaiter(this, void 0, void 0, function () {
            var hihat, ride;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (real) {
                            return [2 /*return*/, SheetPlayer.getRealDrums()];
                        }
                        return [4 /*yield*/, SheetPlayer.hihat()];
                    case 1:
                        hihat = _a.sent();
                        return [4 /*yield*/, SheetPlayer.ride()];
                    case 2:
                        ride = _a.sent();
                        return [2 /*return*/, {
                                // hihat: (time, duration) => hihat.triggerAttackRelease(time, duration),
                                ride: function (time, duration) {
                                    console.log('ride', time, duration);
                                    ride.triggerAttackRelease(time, duration);
                                },
                            }];
                }
            });
        });
    };
    SheetPlayer.ride = function () {
        return Promise.resolve(new Tone.MetalSynth({
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
        }).toMaster());
    };
    SheetPlayer.hihat = function () {
        return Promise.resolve(new Tone.MetalSynth({
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
        }).toMaster());
    };
    SheetPlayer.getPiano = function (voices, real) {
        if (voices === void 0) { voices = 4; }
        if (real === void 0) { real = true; }
        if (real) {
            return SheetPlayer.getRealPiano();
        }
        return Promise.resolve(new Tone.PolySynth(voices * 2, Tone.Synth, {
            "volume": -18,
            "envelope": {
                "attack": 0.02
            },
            "oscillator": {
                "partials": [1, 2, 3],
            }
        }).toMaster());
    };
    SheetPlayer.getRealPiano = function () {
        if (SheetPlayer.realPiano) {
            return SheetPlayer.realPiano;
        }
        SheetPlayer.realPiano = SheetPlayer.getSampler(index_js_1.piano, { volume: -4 });
        return SheetPlayer.realPiano;
    };
    SheetPlayer.getRealDrums = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sampler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (SheetPlayer.realDrums) {
                            return [2 /*return*/, SheetPlayer.realDrums];
                        }
                        return [4 /*yield*/, SheetPlayer.getSampler(drumset_1.drumSamples, { volume: -8 })];
                    case 1:
                        sampler = _a.sent();
                        SheetPlayer.realDrums = {
                            kick: function (time, duration) { return sampler.triggerAttackRelease('C1', time); },
                            snare: function (time, duration) { return sampler.triggerAttackRelease('C2', time); },
                            hihat: function (time, duration) { return sampler.triggerAttackRelease('C3', time); },
                            ride: function (time, duration) { return sampler.triggerAttackRelease('C4', time); },
                            crash: function (time, duration) { return sampler.triggerAttackRelease('C5', time); },
                            rimshot: function (time, duration) { return sampler.triggerAttackRelease('C6', time); },
                        };
                        return [2 /*return*/, SheetPlayer.realDrums];
                }
            });
        });
    };
    SheetPlayer.getSampler = function (samples, options) {
        return new Promise(function (resolve, reject) {
            var sampler = new Tone.Sampler(samples, __assign({}, options, { onload: function () { return resolve(sampler); } })).toMaster();
        });
    };
    SheetPlayer.getLead = function (real) {
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
    };
    SheetPlayer.parts = [];
    SheetPlayer.instruments = [];
    return SheetPlayer;
}());
exports.SheetPlayer = SheetPlayer;
