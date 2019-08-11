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
Object.defineProperty(exports, "__esModule", { value: true });
var Measure_1 = require("./Measure");
// extension of https://github.com/daumling/ireal-renderer/blob/master/src/ireal-renderer.js
var RealParser = /** @class */ (function () {
    function RealParser() {
    }
    RealParser.getChord = function (iRealChord) {
        return iRealChord.note + iRealChord.modifiers + (iRealChord.over ? '/' + this.getChord(iRealChord.over) : '');
    };
    RealParser.parseSheet = function (raw) {
        var tokens = RealParser.parse(raw);
        return RealParser.getSheet(tokens);
    };
    RealParser.getSheet = function (tokens) {
        var _this = this;
        var parsed = tokens
            .reduce(function (current, token, index, array) {
            var lastBarEnded = ['{', '|', '[', '||' /* 'Z',  */ /* , ']' */]
                .includes(token.bars || token.token);
            var signs = token.annots || [];
            var repeatStart = (token.bars || token.token) === '{';
            var repeatEnd = (token.bars || token.token) === '}';
            if (repeatStart) {
                signs.push('{');
            }
            if (repeatEnd) {
                signs.push('}');
            }
            // current.measure ends
            if (lastBarEnded) {
                if (current.measure) {
                    // simplify measure if no signs
                    /* if (Object.keys(current.measure).find(k=>k)) {
                        current.measure = current.measure.chords;
                    } */
                    current.measures.push(current.measure);
                }
                current.measure = { chords: [] };
            }
            var sectionStart = signs.find(function (a) { return a.match(/^\*[a-zA-Z]/); });
            if (sectionStart) {
                signs = signs.filter(function (s) { return s !== sectionStart; });
                current.measure.section = sectionStart.replace('*', '');
            }
            var hasCodaSign = signs.includes('Q');
            if (hasCodaSign) {
                signs = signs.filter(function (s) { return s !== 'Q'; });
                var codaSign = 'ToCoda';
                if (!!current.measures.find(function (m) { return Measure_1.Measure.hasSign('ToCoda', m); })) {
                    codaSign = 'Coda';
                }
                current.measure.signs = (current.measure.signs || []).concat([codaSign]);
            }
            var houseStart = signs.find(function (s) { return !!s.match(/^N./); });
            if (houseStart) {
                signs = signs.filter(function (s) { return s !== houseStart; });
                current.measure.house = parseInt(houseStart.replace('N', ''));
            }
            var time = signs.find(function (a) { return a.match(/^T\d\d/); });
            if (time) {
                signs = signs.filter(function (s) { return s !== time; });
                current.measure.time = time.replace('T', '');
            }
            if (token.chord) {
                current.measure.chords.push(_this.getChord(token.chord));
            }
            else if (token.token === 'n') {
                current.measure.chords.push(0);
            }
            var last = current.measures[current.measures.length - 1];
            if (last && last.chords[0] === 'r') {
                last.chords = current.measures[current.measures.length - 3].chords;
                current.measure.chords = current.measures[current.measures.length - 2].chords;
            }
            if (last && current.measure.chords[0] === 'x') {
                current.measure.chords = [].concat(last.chords);
                current.measure.idle = true;
            }
            if (signs.length) {
                current.measure.signs = (current.measure.signs || [])
                    .concat(signs);
            }
            if (token.comments.length) {
                current.measure.comments = (current.measure.comments || [])
                    .concat(token.comments.map(function (c) { return c.trim(); }));
            }
            return current;
        }, { measure: null, signs: null, measures: [] });
        if (parsed.measure.chords.length) {
            parsed.measures.push(parsed.measure);
        }
        return parsed.measures.map(function (measure) {
            var chords = [].concat(measure.chords);
            delete measure.chords;
            return __assign({}, measure, { body: chords });
        });
    };
    RealParser.parse = function (raw) {
        var text = raw;
        var arr = [], headers = [], comments = [];
        var i;
        text = text.trim();
        // text = text.trimRight();
        while (text) {
            var found = false;
            for (i = 0; i < RealParser.regExps.length; i++) {
                var match = RealParser.regExps[i].exec(text);
                if (match) {
                    found = true;
                    if (match.length <= 2) {
                        var replacement = match[0];
                        var repl = RealParser.replacements[replacement];
                        arr = arr.concat(repl ? repl : [replacement]);
                        text = text.substr(replacement.length);
                    }
                    else { // a chord
                        arr.push(match);
                        text = text.substr(match[0].length);
                    }
                    break;
                }
            }
            if (!found) {
                // ignore the comma separator
                if (text[0] !== ',')
                    arr.push(text[0]);
                text = text.substr(1);
            }
        }
        //		console.log(arr);
        // pass 2: extract prefixes, suffixes, annotations and comments
        var out = [];
        var obj = RealParser.newToken(out);
        for (i = 0; i < arr.length; i++) {
            var token = arr[i];
            if (token instanceof Array) {
                obj.chord = RealParser.parseChord(token);
                token = " ";
            }
            switch (token[0]) {
                case ',':
                    token = null;
                    break; // separator
                case 'S': // segno
                case 'T': // time measurement
                case 'Q': // coda
                case 'N': // repeat
                case 'U': // END
                case 's': // small
                case 'l': // normal
                case 'f': // fermata
                case '*':
                    obj.annots.push(token);
                    token = null;
                    break;
                case 'Y':
                    obj.spacer++;
                    token = null;
                    break;
                case 'r':
                case 'x':
                case 'W':
                    obj.chord = new iRealChord(token, "", null, null);
                    break;
                case '<':
                    token = token.substr(1, token.length - 2);
                    token = token.replace(/XyQ/g, "   "); // weird; needs to be done
                    obj.comments.push(token);
                    token = null;
                    break;
                default:
            }
            if (token) {
                if ("]}Z".indexOf(arr[i + 1]) >= 0)
                    obj.bars += arr[++i];
                if ("{[|".indexOf(token) >= 0) {
                    obj.bars += token;
                    token = null;
                }
            }
            if (token && i < arr.length - 1) {
                obj.token = token;
                obj = RealParser.newToken(out);
            }
        }
        return out;
    };
    RealParser.parseChord = function (match) {
        var note = match[1] || " ";
        var modifiers = match[2] || "";
        var comment = match[3] || "";
        if (comment)
            modifiers += comment.substr(1, comment.length - 2).replace("XyQ", "   ");
        var over = match[4] || "";
        if (over[0] === '/')
            over = over.substr(1);
        var alternate = match[5] || null;
        if (alternate) {
            match = RealParser.chordRegex.exec(alternate.substr(1, alternate.length - 2));
            if (!match)
                alternate = null;
            else
                alternate = this.parseChord(match);
        }
        // empty cell?
        if (note === " " && !alternate && !over)
            return null;
        if (over) {
            var offset = (over[1] === '#' || over[1] === 'b') ? 2 : 1;
            over = new iRealChord(over.substr(0, offset), over.substr(offset), null, null);
        }
        else
            over = null;
        return new iRealChord(note, modifiers, over, alternate);
    };
    RealParser.newToken = function (arr) {
        var obj = new iRealToken;
        arr.push(obj);
        return obj;
    };
    /**
     * The RegExp for a complete chord. The match array contains:
     * 1 - the base note
     * 2 - the modifiers (+-ohd0123456789 and su for sus)
     * 3 - any comments (may be e.g. add, sub, or private stuff)
     * 4 - the "over" part starting with a slash
     * 5 - the top chord as (chord)
     * @type RegExp
     */
    RealParser.chordRegex = /^([ A-GW][b#]?)((?:sus|[\+\-\^\dhob#])*)(\*.+?\*)*(\/[A-G][#b]?)?(\(.*?\))?/;
    RealParser.regExps = [
        /^\*[a-zA-Z]/,
        /^T\d\d/,
        /^N./,
        /^<.*?>/,
        /^ \(.*?\)/,
        RealParser.chordRegex,
        /^LZ/,
        /^XyQ/,
        /^Kcl/ // repeat last bar
    ];
    RealParser.replacements = {
        "LZ": [" ", "|"],
        "XyQ": [" ", " ", " "],
        "Kcl": ["|", "x", " "]
    };
    return RealParser;
}());
exports.RealParser = RealParser;
var iRealChord = /** @class */ (function () {
    function iRealChord(note, modifiers, over, alternate) {
        this.note = note;
        this.modifiers = modifiers;
        this.over = over;
        this.alternate = alternate;
    }
    return iRealChord;
}());
var iRealToken = /** @class */ (function () {
    function iRealToken() {
        this.annots = [];
        this.comments = [];
        this.bars = "";
        this.spacer = 0;
        this.chord = null;
    }
    return iRealToken;
}());
