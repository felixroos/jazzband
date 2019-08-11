import { Measure, Measures } from './Measure';

// extension of https://github.com/daumling/ireal-renderer/blob/master/src/ireal-renderer.js

export class RealParser {
  /**
   * The RegExp for a complete chord. The match array contains:
   * 1 - the base note
   * 2 - the modifiers (+-ohd0123456789 and su for sus)
   * 3 - any comments (may be e.g. add, sub, or private stuff)
   * 4 - the "over" part starting with a slash
   * 5 - the top chord as (chord)
   * @type RegExp
   */

  static chordRegex = /^([ A-GW][b#]?)((?:sus|[\+\-\^\dhob#])*)(\*.+?\*)*(\/[A-G][#b]?)?(\(.*?\))?/;

  static regExps = [
    /^\*[a-zA-Z]/,							// section
    /^T\d\d/,								// time measurement
    /^N./,									// repeat marker
    /^<.*?>/,								// comments
    /^ \(.*?\)/,							// blank and (note)
    RealParser.chordRegex,				// chords
    /^LZ/,									// 1 cell + right bar
    /^XyQ/,									// 3 empty cells
    /^Kcl/									// repeat last bar
  ];

  static replacements = {
    "LZ": [" ", "|"],
    "XyQ": [" ", " ", " "],
    "Kcl": ["|", "x", " "]
  };

  static getChord(iRealChord) {
    return iRealChord.note + iRealChord.modifiers + (iRealChord.over ? '/' + this.getChord(iRealChord.over) : '');
  }

  static parseSheet(raw): Measures<string> {
    const tokens = RealParser.parse(raw);
    return RealParser.getSheet(tokens);
  }

  static getSheet(tokens): Measures<string> {
    const parsed = tokens
      .reduce((current, token, index, array) => {
        const lastBarEnded = ['{', '|', '[', '||' /* 'Z',  *//* , ']' */]
          .includes(token.bars || token.token);
        let signs = token.annots || [];
        const repeatStart = (token.bars || token.token) === '{';
        const repeatEnd = (token.bars || token.token) === '}';
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

        const sectionStart = signs.find(a => a.match(/^\*[a-zA-Z]/));
        if (sectionStart) {
          signs = signs.filter(s => s !== sectionStart);
          current.measure.section = sectionStart.replace('*', '');
        }

        const hasCodaSign = signs.includes('Q');
        if (hasCodaSign) {
          signs = signs.filter(s => s !== 'Q');
          let codaSign = 'ToCoda';
          if (!!current.measures.find(m => Measure.hasSign('ToCoda', m))) {
            codaSign = 'Coda';
          }
          current.measure.signs = (current.measure.signs || []).concat([codaSign]);
        }

        const houseStart = signs.find(s => !!s.match(/^N./));
        if (houseStart) {
          signs = signs.filter(s => s !== houseStart);
          current.measure.house = parseInt(houseStart.replace('N', ''));
        }

        const time = signs.find(a => a.match(/^T\d\d/));
        if (time) {
          signs = signs.filter(s => s !== time);
          current.measure.time = time.replace('T', '');
        }

        if (token.chord) {
          current.measure.chords.push(this.getChord(token.chord));
        } else if (token.token === 'n') {
          current.measure.chords.push(0);
        }

        const last = current.measures[current.measures.length - 1];
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
            .concat(token.comments.map(c => c.trim()));
        }
        return current;
      }, { measure: null, signs: null, measures: [] });
    if (parsed.measure.chords.length) {
      parsed.measures.push(parsed.measure);
    }
    return parsed.measures.map(measure => {
      const chords = [].concat(measure.chords);
      delete measure.chords;
      return { ...measure, body: chords };
    });
  }


  static parse(raw: string): any {
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
            const replacement = match[0];
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
        case ',': token = null; break; // separator
        case 'S':	// segno
        case 'T':	// time measurement
        case 'Q':	// coda
        case 'N':	// repeat
        case 'U':	// END
        case 's':	// small
        case 'l':	// normal
        case 'f':	// fermata
        case '*': obj.annots.push(token); token = null; break;
        case 'Y': obj.spacer++; token = null; break;
        case 'r':
        case 'x':
        case 'W':
          obj.chord = new iRealChord(token, "", null, null);
          break;
        case '<':
          token = token.substr(1, token.length - 2);
          token = token.replace(/XyQ/g, "   ");	// weird; needs to be done
          obj.comments.push(token);
          token = null; break;
        default:
      }
      if (token) {
        if ("]}Z".indexOf(arr[i + 1]) >= 0)
          obj.bars += arr[++i];
        if ("{[|".indexOf(token) >= 0) {
          obj.bars += token; token = null;
        }
      }
      if (token && i < arr.length - 1) {
        obj.token = token;
        obj = RealParser.newToken(out);
      }
    }
    return out;
  }



  static parseChord(match) {
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
  }

  static newToken(arr) {
    var obj = new iRealToken;
    arr.push(obj);
    return obj;
  }

}

class iRealChord {
  note: any;
  modifiers: any;
  over: any;
  alternate: any;
  constructor(note, modifiers, over, alternate) {
    this.note = note;
    this.modifiers = modifiers;
    this.over = over;
    this.alternate = alternate;
  }
}

class iRealToken {
  chord: any;
  spacer: number;
  bars: string;
  comments: any[];
  token: any;
  annots: any[];
  constructor() {
    this.annots = [];
    this.comments = [];
    this.bars = "";
    this.spacer = 0;
    this.chord = null;
  }
}