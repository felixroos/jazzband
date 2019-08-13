
import * as xmljs from 'xml-js';



export type DurationOptions = {
  duration: string;
  divisions: number;
  dotted?: boolean
}

export interface PitchOptions extends DurationOptions {
  step: string;
  octave: number;
  alter?: number;
  stem?: 'up' | 'down';
  beam?: 'string';
  /* beams?: { number: number, type: string }[]; */
}

export interface RestOptions extends DurationOptions {
  step?: string; // only for typings
}

export type MeasureOptions = {
  number?: number;
  key?: number;
  time?: number[];
  clef?: string,
  clefLine?: number;
  first?: boolean;
  notes: PitchOptions[],
  harmony: ChordOptions[],
}

export type ChordOptions = {
  root: string;
  symbol: string;
  text: string;
}

export interface SheetOptions extends GlobalOptions {
  parts: Part[];
}

export type GlobalOptions = {
  version: string;
  title: string;
  composer: string;
  arranger: string;
  date: string;
  fontSize: number;
  fontFamily: string;
  divisions: number;
  transposeChromatic: number;
  transposeDiatonic: number;
  software: string;
  page: number;
}

export type Part = {
  id: string;
  name: string;
  shortName: string;
  instrumentName: string;
  measures: MeasureOptions[];
}

export class MusicJSON {

  static parse(xml: string) {
    return xmljs.xml2js(xml, { compact: true });
  }

  static render(json) {
    return xmljs.js2xml(json, { compact: true, ignoreComment: true, spaces: 4 });
  }

  static renderXML(options: SheetOptions) {
    const json = MusicJSON.renderJSON(options);
    return xmljs.js2xml(json, { compact: true, ignoreComment: true, spaces: 4 });
  }

  static addParts(options: SheetOptions) {
    let { parts } = options;
    return (!parts.length ? {} : {
      "part-list": parts.map(part => ({
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
      })),
      "part": parts.map(part => ({
        "_attributes": {
          "id": "P1"
        },
        "measure": MusicJSON.addMeasures(part, options)
      }))
    })
  }

  static renderJSON(options: SheetOptions) {
    options = {
      version: "3.1",
      title: '',
      composer: '',
      arranger: '',
      date: '2019-08-10',
      fontSize: 24,
      fontFamily: "Helvetica,Arial,sans-serif",
      software: 'Hacking Track 0.0.1',
      page: 1,
      divisions: 4,
      parts: [],
      ...options
    };

    return {
      "_declaration": {
        "_attributes": {
          "version": "1.0",
          "encoding": "UTF-8"
        }
      },
      "_doctype": "score-partwise PUBLIC \"-//Recordare//DTD MusicXML 3.1 Partwise//EN\" \"http://www.musicxml.org/dtds/partwise.dtd\"",
      "score-partwise": {
        "_attributes": {
          "version": "3.1"
        },
        "identification": {
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
        },
        "defaults": {
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
        },
        ...MusicJSON.addCredit(options),
        ...MusicJSON.addParts(options)
      }
    };
  }

  static getTempo(tempo) {
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
    }
  }
  static addCredit(options) {
    return {
      "credit": [
        MusicJSON.renderCredit({ text: options.title, justify: 'center' }),
        MusicJSON.renderCredit({ text: options.composer, justify: 'right' }),
      ].filter(c => !!c)
    }
  }

  static renderCredit(options) {
    options = {
      y: 1626.67,
      justify: 'center',
      valign: 'top',
      fontFamily: 'Helvetica,sans',
      fontSize: 24,
      text: '',
      ...options
    }
    const x = {
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
  }

  static addKey(fifths = 0) {
    return {
      "key": {
        "fifths": {
          "_text": fifths
        }
      }
    }
  }

  static addTime(time) {
    return !time ? {} : {
      "time": {
        "beats": {
          "_text": time[0]
        },
        "beat-type": {
          "_text": time[1]
        }
      }
    }
  }

  static addClef(sign = "G", line = 2) {
    return {
      "clef": {
        "sign": {
          "_text": sign
        },
        "line": {
          "_text": line
        }
      },
    }
  }

  static addTransposition(transposeDiatonic, transposeChromatic) {
    return !transposeChromatic && !transposeChromatic ? {} : {
      "transpose": {
        "diatonic": {
          "_text": transposeDiatonic
        },
        "chromatic": {
          "_text": transposeChromatic
        }
      }
    }
  }


  static addHarmony(harmony: ChordOptions[]) {
    return (!harmony || !harmony.length ? [] : harmony
      .map(({ root, symbol, text }) => ({
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
      }))
    );
  }

  static addSwing() {
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
  }

  static getDuration({ duration, divisions, dotted }: DurationOptions) {
    dotted = dotted || false;
    const durationTypes = {
      half: 0.5,
      quarter: 1,
      eighth: 2,
      '16th': 4,
      '32th': 8,
      '64th': 16,
      '128th': 32,
    }
    let absoluteDuration = divisions / durationTypes[duration];
    if (dotted) {
      absoluteDuration = absoluteDuration + absoluteDuration / 2;
    }
    return absoluteDuration;
  }

  static addRest(durationOptions: DurationOptions) {
    let { duration, divisions, dotted } = durationOptions;
    return {
      "rest": {},
      "duration": {
        "_text": MusicJSON.getDuration({ duration, divisions, dotted })
      },
      "voice": {
        "_text": "1"
      },
      ...(!duration ? {} : {
        "type": {
          "_text": duration
        }
      })
    }

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
  }

  static addPitch(pitchOptions: PitchOptions) {
    let { step, octave, alter, stem, beam, duration, divisions, dotted } = {
      octave: 4,
      stem: 'down',
      alter: 0,
      ...pitchOptions
    };
    function getBeam(beam) {
      return !beam ? {} : {
        "beam": {
          "_attributes": {
            "number": 1
          },
          "_text": beam
        }
      }
    }
    return {
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
      },
      "duration": {
        "_text": MusicJSON.getDuration({ duration, divisions, dotted })
      },
      "voice": {
        "_text": "1"
      },
      "type": {
        "_text": duration
      },
      "stem": {
        "_text": stem
      },
      /* ...getBeams(beams) */
      ...getBeam(beam)
    };
  }

  static addNotes(notes: PitchOptions[], divisions) {
    return notes.map(note => {
      note = {
        ...note,
        divisions
      };
      return note.step ? MusicJSON.addPitch(note) : MusicJSON.addRest(note);
    });
  }

  static addMeasure(measureOptions: MeasureOptions, globalOptions: GlobalOptions) {
    const { number, key, time, clef, clefLine, notes, harmony } = measureOptions;

    let { divisions, transposeChromatic, transposeDiatonic } = globalOptions;

    return {
      "_attributes": {
        "number": number,
        "width": "321.53"
      },
      ...(number === 1 ? { // add stuff that only belongs in first measure
        "print": {
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
        },
        ...MusicJSON.addTransposition(transposeDiatonic, transposeChromatic)
      } : {}),
      ...(key || time || clef ? {
        "attributes": {
          "divisions": {
            "_text": divisions
          },
          ...(key ? MusicJSON.addKey(key) : {}),
          ...(time ? MusicJSON.addTime(time) : {}),
          ...(clef ? MusicJSON.addClef(clef, clefLine) : {}),
        }
      } : {}),
      "harmony": MusicJSON.addHarmony(harmony),
      "note": MusicJSON.addNotes(notes, divisions)
    };
  }

  static addMeasures(part: Part, options: GlobalOptions) {
    return part.measures.map((measure, index) => MusicJSON.addMeasure({
      number: index + 1,
      ...measure
    }, options));
  }
}
