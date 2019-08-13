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
var xmljs = __importStar(require("xml-js"));
var MusicJSON = /** @class */ (function () {
    function MusicJSON() {
    }
    MusicJSON.parse = function (xml) {
        return xmljs.xml2js(xml, { compact: true });
    };
    MusicJSON.render = function (json) {
        return xmljs.js2xml(json, { compact: true, ignoreComment: true, spaces: 4 });
    };
    MusicJSON.renderXML = function (options) {
        var json = MusicJSON.renderJSON(options);
        return xmljs.js2xml(json, { compact: true, ignoreComment: true, spaces: 4 });
    };
    MusicJSON.addParts = function (options) {
        var parts = options.parts;
        return (!parts.length ? {} : {
            "part-list": parts.map(function (part) { return ({
                "score-part": {
                    "_attributes": {
                        "id": "P1"
                    },
                    "part-name": {
                        "_text": part.name
                    },
                    "part-abbreviation": {
                        "_text": part.shortName
                    },
                    "score-instrument": {
                        "_attributes": {
                            "id": "P1-I1"
                        },
                        "instrument-name": {
                            "_text": part.instrumentName
                        }
                    },
                    "midi-device": {
                        "_attributes": {
                            "id": "P1-I1",
                            "port": "1"
                        }
                    },
                    "midi-instrument": {
                        "_attributes": {
                            "id": "P1-I1"
                        },
                        "midi-channel": {
                            "_text": "1"
                        },
                        "midi-program": {
                            "_text": "57"
                        },
                        "volume": {
                            "_text": "78.7402"
                        },
                        "pan": {
                            "_text": "0"
                        }
                    }
                }
            }); }),
            "part": parts.map(function (part) { return ({
                "_attributes": {
                    "id": "P1"
                },
                "measure": MusicJSON.addMeasures(part, options)
            }); })
        });
    };
    MusicJSON.renderJSON = function (options) {
        options = __assign({ version: "3.1", title: '', composer: '', arranger: '', date: '2019-08-10', fontSize: 24, fontFamily: "Helvetica,Arial,sans-serif", software: 'Hacking Track 0.0.1', page: 1, divisions: 4, parts: [] }, options);
        return {
            "_declaration": {
                "_attributes": {
                    "version": "1.0",
                    "encoding": "UTF-8"
                }
            },
            "_doctype": "score-partwise PUBLIC \"-//Recordare//DTD MusicXML 3.1 Partwise//EN\" \"http://www.musicxml.org/dtds/partwise.dtd\"",
            "score-partwise": __assign({ "_attributes": {
                    "version": "3.1"
                }, "identification": {
                    "encoding": {
                        "software": {
                            "_text": options.software
                        },
                        "encoding-date": {
                            "_text": options.date
                        },
                        "supports": [
                            {
                                "_attributes": {
                                    "element": "accidental",
                                    "type": "yes"
                                }
                            },
                            {
                                "_attributes": {
                                    "element": "beam",
                                    "type": "yes"
                                }
                            },
                            {
                                "_attributes": {
                                    "element": "print",
                                    "attribute": "new-page",
                                    "type": "yes",
                                    "value": "yes"
                                }
                            },
                            {
                                "_attributes": {
                                    "element": "print",
                                    "attribute": "new-system",
                                    "type": "yes",
                                    "value": "yes"
                                }
                            },
                            {
                                "_attributes": {
                                    "element": "stem",
                                    "type": "yes"
                                }
                            }
                        ]
                    }
                }, "defaults": {
                    "scaling": {
                        "millimeters": {
                            "_text": "7.05556"
                        },
                        "tenths": {
                            "_text": "40"
                        }
                    },
                    "page-layout": {
                        "page-height": {
                            "_text": "1683.36"
                        },
                        "page-width": {
                            "_text": "1190.88"
                        },
                        "page-margins": [
                            {
                                "_attributes": {
                                    "type": "even"
                                },
                                "left-margin": {
                                    "_text": "56.6929"
                                },
                                "right-margin": {
                                    "_text": "56.6929"
                                },
                                "top-margin": {
                                    "_text": "56.6929"
                                },
                                "bottom-margin": {
                                    "_text": "113.386"
                                }
                            },
                            {
                                "_attributes": {
                                    "type": "odd"
                                },
                                "left-margin": {
                                    "_text": "56.6929"
                                },
                                "right-margin": {
                                    "_text": "56.6929"
                                },
                                "top-margin": {
                                    "_text": "56.6929"
                                },
                                "bottom-margin": {
                                    "_text": "113.386"
                                }
                            }
                        ]
                    },
                    "word-font": {
                        "_attributes": {
                            "font-family": options.fontFamily,
                            "font-size": "10"
                        }
                    },
                    "lyric-font": {
                        "_attributes": {
                            "font-family": options.fontFamily,
                            "font-size": "11"
                        }
                    }
                } }, MusicJSON.addCredit(options), MusicJSON.addParts(options))
        };
    };
    MusicJSON.getTempo = function (tempo) {
        return !tempo ? {} : {
            "_attributes": {
                "placement": "above"
            },
            "direction-type": {
                "metronome": {
                    "_attributes": {
                        "parentheses": "no",
                        "default-x": "-136.90",
                        "default-y": "8.89",
                        "relative-x": "-179.49",
                        "relative-y": "53.88"
                    },
                    "beat-unit": {
                        "_text": "quarter"
                    },
                    "per-minute": {
                        "_text": tempo
                    }
                }
            },
            "sound": {
                "_attributes": {
                    "tempo": tempo
                }
            }
        };
    };
    MusicJSON.addCredit = function (options) {
        return {
            "credit": [
                MusicJSON.renderCredit({ text: options.title, justify: 'center' }),
                MusicJSON.renderCredit({ text: options.composer, justify: 'right' }),
            ].filter(function (c) { return !!c; })
        };
    };
    MusicJSON.renderCredit = function (options) {
        options = __assign({ y: 1626.67, justify: 'center', valign: 'top', fontFamily: 'Helvetica,sans', fontSize: 24, text: '' }, options);
        var x = {
            right: "1134.19",
            center: "595.44",
            left: "100.44"
        };
        return !options.text ? null : {
            "_attributes": {
                "page": "1"
            },
            "credit-words": {
                "_attributes": {
                    "default-x": x[options.justify] || 0,
                    "default-y": options.y,
                    "justify": options.justify,
                    "valign": options.valign,
                    "font-family": options.fontFamily,
                    "font-size": options.fontSize
                },
                "_text": options.text
            }
        };
    };
    MusicJSON.addKey = function (fifths) {
        if (fifths === void 0) { fifths = 0; }
        return {
            "key": {
                "fifths": {
                    "_text": fifths
                }
            }
        };
    };
    MusicJSON.addTime = function (time) {
        return !time ? {} : {
            "time": {
                "beats": {
                    "_text": time[0]
                },
                "beat-type": {
                    "_text": time[1]
                }
            }
        };
    };
    MusicJSON.addClef = function (sign, line) {
        if (sign === void 0) { sign = "G"; }
        if (line === void 0) { line = 2; }
        return {
            "clef": {
                "sign": {
                    "_text": sign
                },
                "line": {
                    "_text": line
                }
            },
        };
    };
    MusicJSON.addTransposition = function (transposeDiatonic, transposeChromatic) {
        return !transposeChromatic && !transposeChromatic ? {} : {
            "transpose": {
                "diatonic": {
                    "_text": transposeDiatonic
                },
                "chromatic": {
                    "_text": transposeChromatic
                }
            }
        };
    };
    MusicJSON.addHarmony = function (harmony) {
        return (!harmony || !harmony.length ? [] : harmony
            .map(function (_a) {
            var root = _a.root, symbol = _a.symbol, text = _a.text;
            return ({
                "_attributes": {
                    "print-frame": "no"
                },
                "root": {
                    "root-step": {
                        "_text": root
                    }
                },
                "kind": {
                    "_attributes": {
                        "text": symbol,
                        "use-symbols": "yes"
                    },
                    "_text": text
                }
            });
        }));
    };
    MusicJSON.addSwing = function () {
        return {
            "direction-type": {
                "words": {
                    "_attributes": {
                        "relative-x": "0",
                        "relative-y": "40.85",
                        "font-weight": "bold",
                        "font-size": "12"
                    },
                    "_text": "Swing"
                }
            }
        };
    };
    MusicJSON.getDuration = function (_a) {
        var duration = _a.duration, divisions = _a.divisions, dotted = _a.dotted;
        dotted = dotted || false;
        var durationTypes = {
            half: 0.5,
            quarter: 1,
            eighth: 2,
            '16th': 4,
            '32th': 8,
            '64th': 16,
            '128th': 32,
        };
        var absoluteDuration = divisions / durationTypes[duration];
        if (dotted) {
            absoluteDuration = absoluteDuration + absoluteDuration / 2;
        }
        return absoluteDuration;
    };
    MusicJSON.addRest = function (durationOptions) {
        var duration = durationOptions.duration, divisions = durationOptions.divisions, dotted = durationOptions.dotted;
        return __assign({ "rest": {}, "duration": {
                "_text": MusicJSON.getDuration({ duration: duration, divisions: divisions, dotted: dotted })
            }, "voice": {
                "_text": "1"
            } }, (!duration ? {} : {
            "type": {
                "_text": duration
            }
        }));
        /*
      
    divisions: smalles division:
    
    quarter: 1
    eigth: 2
    16th: 4
    
    duration = divisions * value
    example: duration of half with smallest division = 2 = eigth: 2 * 2 = 4
    example: duration of bar rest in 44 with smallest division = 2 = 4 * 2 = 8
    
        divisions 1
    
        44: 1 bar rest = duration 4
        34: 1 bar rest = duration 3
        24: 1 bar rest = duration 2
        54: 1 bar rest = duration 5
        44: half rest = duration 2, type = half
        34: half rest = duration 2
        24: quarter rest = duration 1
        54: half rest = duration 2
        54: half rest = duration 2, quarter rest = duration 1
    
        divisions 2
        44: 1 bar rest = duration 8
        34: 1 bar rest = duration 6
        24: 1 bar rest = duration 4
        54: 1 bar rest = duration 10
        44: half rest = duration 4, type = half
        34: half rest = duration 4, type = half
        24: quarter rest = duration 2, type = quarter
        54: 1 bar rest = duration 10
        
        44: eigths rest = duration 1
        44: eigths rest = duration 1
    
    
        */
        /*
        in 44
         quarter: 4,
         eighth: 2,
         16th: 1
         
         quarter: 48 (dotted quarter)
         half: 8, 64 (?! half after dotted quarter)
         128th: duration 1
         64th: duration 2
         32nd: duration 4
         16th: duration 8
         => seems related with divisions value in attributes
    
         in 34
         quarter: 2,
         half: 4,
         quarter: 2
         quarter: 3 (dotted)
         */
    };
    MusicJSON.addPitch = function (pitchOptions) {
        var _a = __assign({ octave: 4, stem: 'down', alter: 0 }, pitchOptions), step = _a.step, octave = _a.octave, alter = _a.alter, stem = _a.stem, beam = _a.beam, duration = _a.duration, divisions = _a.divisions, dotted = _a.dotted;
        function getBeam(beam) {
            return !beam ? {} : {
                "beam": {
                    "_attributes": {
                        "number": 1
                    },
                    "_text": beam
                }
            };
        }
        return __assign({ 
            /* "_attributes": {
              "default-x": "165.38",
              "default-y": "-35.00"
            }, */
            "pitch": {
                "step": {
                    "_text": step // F
                },
                "alter": {
                    "_text": alter // 1
                },
                "octave": {
                    "_text": octave // 4
                }
            }, "duration": {
                "_text": MusicJSON.getDuration({ duration: duration, divisions: divisions, dotted: dotted })
            }, "voice": {
                "_text": "1"
            }, "type": {
                "_text": duration
            }, "stem": {
                "_text": stem
            } }, getBeam(beam));
    };
    MusicJSON.addNotes = function (notes, divisions) {
        return notes.map(function (note) {
            note = __assign({}, note, { divisions: divisions });
            return note.step ? MusicJSON.addPitch(note) : MusicJSON.addRest(note);
        });
    };
    MusicJSON.addMeasure = function (measureOptions, globalOptions) {
        var number = measureOptions.number, key = measureOptions.key, time = measureOptions.time, clef = measureOptions.clef, clefLine = measureOptions.clefLine, notes = measureOptions.notes, harmony = measureOptions.harmony;
        var divisions = globalOptions.divisions, transposeChromatic = globalOptions.transposeChromatic, transposeDiatonic = globalOptions.transposeDiatonic;
        return __assign({ "_attributes": {
                "number": number,
                "width": "321.53"
            } }, (number === 1 ? __assign({ "print": {
                "system-layout": {
                    "system-margins": {
                        "left-margin": {
                            "_text": "0.00"
                        },
                        "right-margin": {
                            "_text": "0.00"
                        }
                    },
                    "top-system-distance": {
                        "_text": "179.28"
                    }
                }
            } }, MusicJSON.addTransposition(transposeDiatonic, transposeChromatic)) : {}), (key || time || clef ? {
            "attributes": __assign({ "divisions": {
                    "_text": divisions
                } }, (key ? MusicJSON.addKey(key) : {}), (time ? MusicJSON.addTime(time) : {}), (clef ? MusicJSON.addClef(clef, clefLine) : {}))
        } : {}), { "harmony": MusicJSON.addHarmony(harmony), "note": MusicJSON.addNotes(notes, divisions) });
    };
    MusicJSON.addMeasures = function (part, options) {
        return part.measures.map(function (measure, index) { return MusicJSON.addMeasure(__assign({ number: index + 1 }, measure), options); });
    };
    return MusicJSON;
}());
exports.MusicJSON = MusicJSON;
