import * as xmljs from 'xml-js';
export declare type DurationOptions = {
    duration: string;
    divisions: number;
    dotted?: boolean;
};
export interface PitchOptions extends DurationOptions {
    step: string;
    octave: number;
    alter?: number;
    stem?: 'up' | 'down';
    beam?: 'string';
}
export interface RestOptions extends DurationOptions {
    step?: string;
}
export declare type MeasureOptions = {
    number?: number;
    key?: number;
    time?: number[];
    clef?: string;
    clefLine?: number;
    first?: boolean;
    notes: PitchOptions[];
    harmony: ChordOptions[];
};
export declare type ChordOptions = {
    root: string;
    symbol: string;
    text: string;
};
export interface SheetOptions extends GlobalOptions {
    parts: Part[];
}
export declare type GlobalOptions = {
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
};
export declare type Part = {
    id: string;
    name: string;
    shortName: string;
    instrumentName: string;
    measures: MeasureOptions[];
};
export declare class MusicJSON {
    static parse(xml: string): xmljs.ElementCompact | xmljs.Element;
    static render(json: any): string;
    static renderXML(options: SheetOptions): string;
    static addParts(options: SheetOptions): {
        "part-list"?: undefined;
        "part"?: undefined;
    } | {
        "part-list": {
            "score-part": {
                "_attributes": {
                    "id": string;
                };
                "part-name": {
                    "_text": string;
                };
                "part-abbreviation": {
                    "_text": string;
                };
                "score-instrument": {
                    "_attributes": {
                        "id": string;
                    };
                    "instrument-name": {
                        "_text": string;
                    };
                };
                "midi-device": {
                    "_attributes": {
                        "id": string;
                        "port": string;
                    };
                };
                "midi-instrument": {
                    "_attributes": {
                        "id": string;
                    };
                    "midi-channel": {
                        "_text": string;
                    };
                    "midi-program": {
                        "_text": string;
                    };
                    "volume": {
                        "_text": string;
                    };
                    "pan": {
                        "_text": string;
                    };
                };
            };
        }[];
        "part": {
            "_attributes": {
                "id": string;
            };
            "measure": ({
                "harmony": {
                    "_attributes": {
                        "print-frame": string;
                    };
                    "root": {
                        "root-step": {
                            "_text": string;
                        };
                    };
                    "kind": {
                        "_attributes": {
                            "text": string;
                            "use-symbols": string;
                        };
                        "_text": string;
                    };
                }[];
                "note": ({
                    "beam"?: undefined;
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "beam": {
                        "_attributes": {
                            "number": number;
                        };
                        "_text": any;
                    };
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "rest": {};
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                })[];
                "attributes": {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time"?: undefined;
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time"?: undefined;
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time"?: undefined;
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time"?: undefined;
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                };
                "transpose"?: undefined;
                "print": {
                    "system-layout": {
                        "system-margins": {
                            "left-margin": {
                                "_text": string;
                            };
                            "right-margin": {
                                "_text": string;
                            };
                        };
                        "top-system-distance": {
                            "_text": string;
                        };
                    };
                };
                "_attributes": {
                    "number": number;
                    "width": string;
                };
            } | {
                "harmony": {
                    "_attributes": {
                        "print-frame": string;
                    };
                    "root": {
                        "root-step": {
                            "_text": string;
                        };
                    };
                    "kind": {
                        "_attributes": {
                            "text": string;
                            "use-symbols": string;
                        };
                        "_text": string;
                    };
                }[];
                "note": ({
                    "beam"?: undefined;
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "beam": {
                        "_attributes": {
                            "number": number;
                        };
                        "_text": any;
                    };
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "rest": {};
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                })[];
                "transpose"?: undefined;
                "print": {
                    "system-layout": {
                        "system-margins": {
                            "left-margin": {
                                "_text": string;
                            };
                            "right-margin": {
                                "_text": string;
                            };
                        };
                        "top-system-distance": {
                            "_text": string;
                        };
                    };
                };
                "_attributes": {
                    "number": number;
                    "width": string;
                };
            } | {
                "harmony": {
                    "_attributes": {
                        "print-frame": string;
                    };
                    "root": {
                        "root-step": {
                            "_text": string;
                        };
                    };
                    "kind": {
                        "_attributes": {
                            "text": string;
                            "use-symbols": string;
                        };
                        "_text": string;
                    };
                }[];
                "note": ({
                    "beam"?: undefined;
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "beam": {
                        "_attributes": {
                            "number": number;
                        };
                        "_text": any;
                    };
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "rest": {};
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                })[];
                "attributes": {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time"?: undefined;
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time"?: undefined;
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time"?: undefined;
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time"?: undefined;
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                };
                "transpose": {
                    "diatonic": {
                        "_text": any;
                    };
                    "chromatic": {
                        "_text": any;
                    };
                };
                "print": {
                    "system-layout": {
                        "system-margins": {
                            "left-margin": {
                                "_text": string;
                            };
                            "right-margin": {
                                "_text": string;
                            };
                        };
                        "top-system-distance": {
                            "_text": string;
                        };
                    };
                };
                "_attributes": {
                    "number": number;
                    "width": string;
                };
            } | {
                "harmony": {
                    "_attributes": {
                        "print-frame": string;
                    };
                    "root": {
                        "root-step": {
                            "_text": string;
                        };
                    };
                    "kind": {
                        "_attributes": {
                            "text": string;
                            "use-symbols": string;
                        };
                        "_text": string;
                    };
                }[];
                "note": ({
                    "beam"?: undefined;
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "beam": {
                        "_attributes": {
                            "number": number;
                        };
                        "_text": any;
                    };
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "rest": {};
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                })[];
                "transpose": {
                    "diatonic": {
                        "_text": any;
                    };
                    "chromatic": {
                        "_text": any;
                    };
                };
                "print": {
                    "system-layout": {
                        "system-margins": {
                            "left-margin": {
                                "_text": string;
                            };
                            "right-margin": {
                                "_text": string;
                            };
                        };
                        "top-system-distance": {
                            "_text": string;
                        };
                    };
                };
                "_attributes": {
                    "number": number;
                    "width": string;
                };
            } | {
                "harmony": {
                    "_attributes": {
                        "print-frame": string;
                    };
                    "root": {
                        "root-step": {
                            "_text": string;
                        };
                    };
                    "kind": {
                        "_attributes": {
                            "text": string;
                            "use-symbols": string;
                        };
                        "_text": string;
                    };
                }[];
                "note": ({
                    "beam"?: undefined;
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "beam": {
                        "_attributes": {
                            "number": number;
                        };
                        "_text": any;
                    };
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "rest": {};
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                })[];
                "attributes": {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time"?: undefined;
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time"?: undefined;
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "key": {
                        "fifths": {
                            "_text": number;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time"?: undefined;
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time"?: undefined;
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "clef": {
                        "sign": {
                            "_text": string;
                        };
                        "line": {
                            "_text": number;
                        };
                    };
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                } | {
                    "time": {
                        "beats": {
                            "_text": any;
                        };
                        "beat-type": {
                            "_text": any;
                        };
                    };
                    "divisions": {
                        "_text": number;
                    };
                };
                "_attributes": {
                    "number": number;
                    "width": string;
                };
            } | {
                "harmony": {
                    "_attributes": {
                        "print-frame": string;
                    };
                    "root": {
                        "root-step": {
                            "_text": string;
                        };
                    };
                    "kind": {
                        "_attributes": {
                            "text": string;
                            "use-symbols": string;
                        };
                        "_text": string;
                    };
                }[];
                "note": ({
                    "beam"?: undefined;
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "beam": {
                        "_attributes": {
                            "number": number;
                        };
                        "_text": any;
                    };
                    "pitch": {
                        "step": {
                            "_text": string;
                        };
                        "alter": {
                            "_text": number;
                        };
                        "octave": {
                            "_text": number;
                        };
                    };
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                    "type": {
                        "_text": string;
                    };
                    "stem": {
                        "_text": string;
                    };
                } | {
                    "rest": {};
                    "duration": {
                        "_text": number;
                    };
                    "voice": {
                        "_text": string;
                    };
                })[];
                "_attributes": {
                    "number": number;
                    "width": string;
                };
            })[];
        }[];
    };
    static renderJSON(options: SheetOptions): {
        "_declaration": {
            "_attributes": {
                "version": string;
                "encoding": string;
            };
        };
        "_doctype": string;
        "score-partwise": {
            "part-list"?: undefined;
            "part"?: undefined;
            "credit": {
                "_attributes": {
                    "page": string;
                };
                "credit-words": {
                    "_attributes": {
                        "default-x": any;
                        "default-y": any;
                        "justify": any;
                        "valign": any;
                        "font-family": any;
                        "font-size": any;
                    };
                    "_text": any;
                };
            }[];
            "_attributes": {
                "version": string;
            };
            "identification": {
                "encoding": {
                    "software": {
                        "_text": string;
                    };
                    "encoding-date": {
                        "_text": string;
                    };
                    "supports": ({
                        "_attributes": {
                            "element": string;
                            "type": string;
                            "attribute"?: undefined;
                            "value"?: undefined;
                        };
                    } | {
                        "_attributes": {
                            "element": string;
                            "attribute": string;
                            "type": string;
                            "value": string;
                        };
                    })[];
                };
            };
            "defaults": {
                "scaling": {
                    "millimeters": {
                        "_text": string;
                    };
                    "tenths": {
                        "_text": string;
                    };
                };
                "page-layout": {
                    "page-height": {
                        "_text": string;
                    };
                    "page-width": {
                        "_text": string;
                    };
                    "page-margins": {
                        "_attributes": {
                            "type": string;
                        };
                        "left-margin": {
                            "_text": string;
                        };
                        "right-margin": {
                            "_text": string;
                        };
                        "top-margin": {
                            "_text": string;
                        };
                        "bottom-margin": {
                            "_text": string;
                        };
                    }[];
                };
                "word-font": {
                    "_attributes": {
                        "font-family": string;
                        "font-size": string;
                    };
                };
                "lyric-font": {
                    "_attributes": {
                        "font-family": string;
                        "font-size": string;
                    };
                };
            };
        } | {
            "part-list": {
                "score-part": {
                    "_attributes": {
                        "id": string;
                    };
                    "part-name": {
                        "_text": string;
                    };
                    "part-abbreviation": {
                        "_text": string;
                    };
                    "score-instrument": {
                        "_attributes": {
                            "id": string;
                        };
                        "instrument-name": {
                            "_text": string;
                        };
                    };
                    "midi-device": {
                        "_attributes": {
                            "id": string;
                            "port": string;
                        };
                    };
                    "midi-instrument": {
                        "_attributes": {
                            "id": string;
                        };
                        "midi-channel": {
                            "_text": string;
                        };
                        "midi-program": {
                            "_text": string;
                        };
                        "volume": {
                            "_text": string;
                        };
                        "pan": {
                            "_text": string;
                        };
                    };
                };
            }[];
            "part": {
                "_attributes": {
                    "id": string;
                };
                "measure": ({
                    "harmony": {
                        "_attributes": {
                            "print-frame": string;
                        };
                        "root": {
                            "root-step": {
                                "_text": string;
                            };
                        };
                        "kind": {
                            "_attributes": {
                                "text": string;
                                "use-symbols": string;
                            };
                            "_text": string;
                        };
                    }[];
                    "note": ({
                        "beam"?: undefined;
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "beam": {
                            "_attributes": {
                                "number": number;
                            };
                            "_text": any;
                        };
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "rest": {};
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                    })[];
                    "attributes": {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time"?: undefined;
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time"?: undefined;
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time"?: undefined;
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time"?: undefined;
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    };
                    "transpose"?: undefined;
                    "print": {
                        "system-layout": {
                            "system-margins": {
                                "left-margin": {
                                    "_text": string;
                                };
                                "right-margin": {
                                    "_text": string;
                                };
                            };
                            "top-system-distance": {
                                "_text": string;
                            };
                        };
                    };
                    "_attributes": {
                        "number": number;
                        "width": string;
                    };
                } | {
                    "harmony": {
                        "_attributes": {
                            "print-frame": string;
                        };
                        "root": {
                            "root-step": {
                                "_text": string;
                            };
                        };
                        "kind": {
                            "_attributes": {
                                "text": string;
                                "use-symbols": string;
                            };
                            "_text": string;
                        };
                    }[];
                    "note": ({
                        "beam"?: undefined;
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "beam": {
                            "_attributes": {
                                "number": number;
                            };
                            "_text": any;
                        };
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "rest": {};
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                    })[];
                    "transpose"?: undefined;
                    "print": {
                        "system-layout": {
                            "system-margins": {
                                "left-margin": {
                                    "_text": string;
                                };
                                "right-margin": {
                                    "_text": string;
                                };
                            };
                            "top-system-distance": {
                                "_text": string;
                            };
                        };
                    };
                    "_attributes": {
                        "number": number;
                        "width": string;
                    };
                } | {
                    "harmony": {
                        "_attributes": {
                            "print-frame": string;
                        };
                        "root": {
                            "root-step": {
                                "_text": string;
                            };
                        };
                        "kind": {
                            "_attributes": {
                                "text": string;
                                "use-symbols": string;
                            };
                            "_text": string;
                        };
                    }[];
                    "note": ({
                        "beam"?: undefined;
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "beam": {
                            "_attributes": {
                                "number": number;
                            };
                            "_text": any;
                        };
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "rest": {};
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                    })[];
                    "attributes": {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time"?: undefined;
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time"?: undefined;
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time"?: undefined;
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time"?: undefined;
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    };
                    "transpose": {
                        "diatonic": {
                            "_text": any;
                        };
                        "chromatic": {
                            "_text": any;
                        };
                    };
                    "print": {
                        "system-layout": {
                            "system-margins": {
                                "left-margin": {
                                    "_text": string;
                                };
                                "right-margin": {
                                    "_text": string;
                                };
                            };
                            "top-system-distance": {
                                "_text": string;
                            };
                        };
                    };
                    "_attributes": {
                        "number": number;
                        "width": string;
                    };
                } | {
                    "harmony": {
                        "_attributes": {
                            "print-frame": string;
                        };
                        "root": {
                            "root-step": {
                                "_text": string;
                            };
                        };
                        "kind": {
                            "_attributes": {
                                "text": string;
                                "use-symbols": string;
                            };
                            "_text": string;
                        };
                    }[];
                    "note": ({
                        "beam"?: undefined;
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "beam": {
                            "_attributes": {
                                "number": number;
                            };
                            "_text": any;
                        };
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "rest": {};
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                    })[];
                    "transpose": {
                        "diatonic": {
                            "_text": any;
                        };
                        "chromatic": {
                            "_text": any;
                        };
                    };
                    "print": {
                        "system-layout": {
                            "system-margins": {
                                "left-margin": {
                                    "_text": string;
                                };
                                "right-margin": {
                                    "_text": string;
                                };
                            };
                            "top-system-distance": {
                                "_text": string;
                            };
                        };
                    };
                    "_attributes": {
                        "number": number;
                        "width": string;
                    };
                } | {
                    "harmony": {
                        "_attributes": {
                            "print-frame": string;
                        };
                        "root": {
                            "root-step": {
                                "_text": string;
                            };
                        };
                        "kind": {
                            "_attributes": {
                                "text": string;
                                "use-symbols": string;
                            };
                            "_text": string;
                        };
                    }[];
                    "note": ({
                        "beam"?: undefined;
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "beam": {
                            "_attributes": {
                                "number": number;
                            };
                            "_text": any;
                        };
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "rest": {};
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                    })[];
                    "attributes": {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time"?: undefined;
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time"?: undefined;
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "key": {
                            "fifths": {
                                "_text": number;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time"?: undefined;
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time"?: undefined;
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "clef": {
                            "sign": {
                                "_text": string;
                            };
                            "line": {
                                "_text": number;
                            };
                        };
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    } | {
                        "time": {
                            "beats": {
                                "_text": any;
                            };
                            "beat-type": {
                                "_text": any;
                            };
                        };
                        "divisions": {
                            "_text": number;
                        };
                    };
                    "_attributes": {
                        "number": number;
                        "width": string;
                    };
                } | {
                    "harmony": {
                        "_attributes": {
                            "print-frame": string;
                        };
                        "root": {
                            "root-step": {
                                "_text": string;
                            };
                        };
                        "kind": {
                            "_attributes": {
                                "text": string;
                                "use-symbols": string;
                            };
                            "_text": string;
                        };
                    }[];
                    "note": ({
                        "beam"?: undefined;
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "beam": {
                            "_attributes": {
                                "number": number;
                            };
                            "_text": any;
                        };
                        "pitch": {
                            "step": {
                                "_text": string;
                            };
                            "alter": {
                                "_text": number;
                            };
                            "octave": {
                                "_text": number;
                            };
                        };
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                        "type": {
                            "_text": string;
                        };
                        "stem": {
                            "_text": string;
                        };
                    } | {
                        "rest": {};
                        "duration": {
                            "_text": number;
                        };
                        "voice": {
                            "_text": string;
                        };
                    })[];
                    "_attributes": {
                        "number": number;
                        "width": string;
                    };
                })[];
            }[];
            "credit": {
                "_attributes": {
                    "page": string;
                };
                "credit-words": {
                    "_attributes": {
                        "default-x": any;
                        "default-y": any;
                        "justify": any;
                        "valign": any;
                        "font-family": any;
                        "font-size": any;
                    };
                    "_text": any;
                };
            }[];
            "_attributes": {
                "version": string;
            };
            "identification": {
                "encoding": {
                    "software": {
                        "_text": string;
                    };
                    "encoding-date": {
                        "_text": string;
                    };
                    "supports": ({
                        "_attributes": {
                            "element": string;
                            "type": string;
                            "attribute"?: undefined;
                            "value"?: undefined;
                        };
                    } | {
                        "_attributes": {
                            "element": string;
                            "attribute": string;
                            "type": string;
                            "value": string;
                        };
                    })[];
                };
            };
            "defaults": {
                "scaling": {
                    "millimeters": {
                        "_text": string;
                    };
                    "tenths": {
                        "_text": string;
                    };
                };
                "page-layout": {
                    "page-height": {
                        "_text": string;
                    };
                    "page-width": {
                        "_text": string;
                    };
                    "page-margins": {
                        "_attributes": {
                            "type": string;
                        };
                        "left-margin": {
                            "_text": string;
                        };
                        "right-margin": {
                            "_text": string;
                        };
                        "top-margin": {
                            "_text": string;
                        };
                        "bottom-margin": {
                            "_text": string;
                        };
                    }[];
                };
                "word-font": {
                    "_attributes": {
                        "font-family": string;
                        "font-size": string;
                    };
                };
                "lyric-font": {
                    "_attributes": {
                        "font-family": string;
                        "font-size": string;
                    };
                };
            };
        };
    };
    static getTempo(tempo: any): {
        "_attributes"?: undefined;
        "direction-type"?: undefined;
        "sound"?: undefined;
    } | {
        "_attributes": {
            "placement": string;
        };
        "direction-type": {
            "metronome": {
                "_attributes": {
                    "parentheses": string;
                    "default-x": string;
                    "default-y": string;
                    "relative-x": string;
                    "relative-y": string;
                };
                "beat-unit": {
                    "_text": string;
                };
                "per-minute": {
                    "_text": any;
                };
            };
        };
        "sound": {
            "_attributes": {
                "tempo": any;
            };
        };
    };
    static addCredit(options: any): {
        "credit": {
            "_attributes": {
                "page": string;
            };
            "credit-words": {
                "_attributes": {
                    "default-x": any;
                    "default-y": any;
                    "justify": any;
                    "valign": any;
                    "font-family": any;
                    "font-size": any;
                };
                "_text": any;
            };
        }[];
    };
    static renderCredit(options: any): {
        "_attributes": {
            "page": string;
        };
        "credit-words": {
            "_attributes": {
                "default-x": any;
                "default-y": any;
                "justify": any;
                "valign": any;
                "font-family": any;
                "font-size": any;
            };
            "_text": any;
        };
    };
    static addKey(fifths?: number): {
        "key": {
            "fifths": {
                "_text": number;
            };
        };
    };
    static addTime(time: any): {
        "time"?: undefined;
    } | {
        "time": {
            "beats": {
                "_text": any;
            };
            "beat-type": {
                "_text": any;
            };
        };
    };
    static addClef(sign?: string, line?: number): {
        "clef": {
            "sign": {
                "_text": string;
            };
            "line": {
                "_text": number;
            };
        };
    };
    static addTransposition(transposeDiatonic: any, transposeChromatic: any): {
        "transpose"?: undefined;
    } | {
        "transpose": {
            "diatonic": {
                "_text": any;
            };
            "chromatic": {
                "_text": any;
            };
        };
    };
    static addHarmony(harmony: ChordOptions[]): {
        "_attributes": {
            "print-frame": string;
        };
        "root": {
            "root-step": {
                "_text": string;
            };
        };
        "kind": {
            "_attributes": {
                "text": string;
                "use-symbols": string;
            };
            "_text": string;
        };
    }[];
    static addSwing(): {
        "direction-type": {
            "words": {
                "_attributes": {
                    "relative-x": string;
                    "relative-y": string;
                    "font-weight": string;
                    "font-size": string;
                };
                "_text": string;
            };
        };
    };
    static getDuration({ duration, divisions, dotted }: DurationOptions): number;
    static addRest(durationOptions: DurationOptions): {
        "rest": {};
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
    } | {
        "type": {
            "_text": string;
        };
        "rest": {};
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
    };
    static addPitch(pitchOptions: PitchOptions): {
        "beam"?: undefined;
        "pitch": {
            "step": {
                "_text": string;
            };
            "alter": {
                "_text": number;
            };
            "octave": {
                "_text": number;
            };
        };
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
        "type": {
            "_text": string;
        };
        "stem": {
            "_text": string;
        };
    } | {
        "beam": {
            "_attributes": {
                "number": number;
            };
            "_text": any;
        };
        "pitch": {
            "step": {
                "_text": string;
            };
            "alter": {
                "_text": number;
            };
            "octave": {
                "_text": number;
            };
        };
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
        "type": {
            "_text": string;
        };
        "stem": {
            "_text": string;
        };
    };
    static addNotes(notes: PitchOptions[], divisions: any): ({
        "beam"?: undefined;
        "pitch": {
            "step": {
                "_text": string;
            };
            "alter": {
                "_text": number;
            };
            "octave": {
                "_text": number;
            };
        };
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
        "type": {
            "_text": string;
        };
        "stem": {
            "_text": string;
        };
    } | {
        "beam": {
            "_attributes": {
                "number": number;
            };
            "_text": any;
        };
        "pitch": {
            "step": {
                "_text": string;
            };
            "alter": {
                "_text": number;
            };
            "octave": {
                "_text": number;
            };
        };
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
        "type": {
            "_text": string;
        };
        "stem": {
            "_text": string;
        };
    } | {
        "rest": {};
        "duration": {
            "_text": number;
        };
        "voice": {
            "_text": string;
        };
    })[];
    static addMeasure(measureOptions: MeasureOptions, globalOptions: GlobalOptions): {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "attributes": {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        };
        "transpose"?: undefined;
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "transpose"?: undefined;
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "attributes": {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        };
        "transpose": {
            "diatonic": {
                "_text": any;
            };
            "chromatic": {
                "_text": any;
            };
        };
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "transpose": {
            "diatonic": {
                "_text": any;
            };
            "chromatic": {
                "_text": any;
            };
        };
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "attributes": {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "_attributes": {
            "number": number;
            "width": string;
        };
    };
    static addMeasures(part: Part, options: GlobalOptions): ({
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "attributes": {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        };
        "transpose"?: undefined;
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "transpose"?: undefined;
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "attributes": {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        };
        "transpose": {
            "diatonic": {
                "_text": any;
            };
            "chromatic": {
                "_text": any;
            };
        };
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "transpose": {
            "diatonic": {
                "_text": any;
            };
            "chromatic": {
                "_text": any;
            };
        };
        "print": {
            "system-layout": {
                "system-margins": {
                    "left-margin": {
                        "_text": string;
                    };
                    "right-margin": {
                        "_text": string;
                    };
                };
                "top-system-distance": {
                    "_text": string;
                };
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "attributes": {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "key": {
                "fifths": {
                    "_text": number;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "time"?: undefined;
            "divisions": {
                "_text": number;
            };
        } | {
            "clef": {
                "sign": {
                    "_text": string;
                };
                "line": {
                    "_text": number;
                };
            };
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        } | {
            "time": {
                "beats": {
                    "_text": any;
                };
                "beat-type": {
                    "_text": any;
                };
            };
            "divisions": {
                "_text": number;
            };
        };
        "_attributes": {
            "number": number;
            "width": string;
        };
    } | {
        "harmony": {
            "_attributes": {
                "print-frame": string;
            };
            "root": {
                "root-step": {
                    "_text": string;
                };
            };
            "kind": {
                "_attributes": {
                    "text": string;
                    "use-symbols": string;
                };
                "_text": string;
            };
        }[];
        "note": ({
            "beam"?: undefined;
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "beam": {
                "_attributes": {
                    "number": number;
                };
                "_text": any;
            };
            "pitch": {
                "step": {
                    "_text": string;
                };
                "alter": {
                    "_text": number;
                };
                "octave": {
                    "_text": number;
                };
            };
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
            "type": {
                "_text": string;
            };
            "stem": {
                "_text": string;
            };
        } | {
            "rest": {};
            "duration": {
                "_text": number;
            };
            "voice": {
                "_text": string;
            };
        })[];
        "_attributes": {
            "number": number;
            "width": string;
        };
    })[];
}
