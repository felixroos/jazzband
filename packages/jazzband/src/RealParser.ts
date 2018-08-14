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

    chordRegex = /^([ A-GW][b#]?)((?:sus|[\+\-\^\dhob#])*)(\*.+?\*)*(\/[A-G][#b]?)?(\(.*?\))?/;

    regExps = [
        /^\*[a-zA-Z]/,							// section
        /^T\d\d/,								// time measurement
        /^N./,									// repeat marker
        /^<.*?>/,								// comments
        /^ \(.*?\)/,							// blank and (note)
        this.chordRegex,				// chords
        /^LZ/,									// 1 cell + right bar
        /^XyQ/,									// 3 empty cells
        /^Kcl/									// repeat last bar
    ];

    replacements = {
        "LZ": [" ", "|"],
        "XyQ": [" ", " ", " "],
        "Kcl": ["|", "x", " "]
    };
    raw: string;
    sections: any; //chords json
    bars: any;
    tokens: any;

    constructor(raw, times = 3) {
        this.raw = raw;
        this.tokens = this.parse(raw);
        this.sections = this.getSections(this.tokens);
        //this.bars = parsed.out;
        this.bars = this.renderSong(this.sections, times);
        return raw;
    }

    renderSong(sections = this.sections, times = 1) {
        let bars = [];
        for (let i = 1; i <= times; ++i) {
            bars = bars.concat(this.getBars(sections, { first: i === 0, last: i === times }));
        }
        return bars;
    }

    getBars(sections = this.sections, { first, last }, repeated = []) {
        /* let bars = []; */
        // TODO: loop times
        // TODO: detect intro and only play first time
        return sections.filter(s => first || s.section !== 'i')
            .reduce((current, section, sectionIndex) => {
                let endings = [].concat(section.endings);
                if (repeated.find(r => r[0] === section.section)) {
                    endings = endings.slice(1);
                    //console.log('already repeated that section..');
                }
                if (endings.length) {
                    current.bars = current.bars.concat(section.bars.concat(endings[0]));
                    if (section.jumpToCoda) {
                        console.warn('CODA in section with endings... not implemented yet..');
                    }
                } else {
                    let sectionBars = [].concat(section.bars)
                    if (section.jumpToCoda && last) {
                        console.log('jumpToCoda', section.jumpToCoda, sectionBars);
                        sectionBars = sectionBars.slice(0, section.jumpToCoda);
                        if (section.repeats) {
                            console.warn('ALARM: jumpToCoda in section with repeats.. not implemented yet..')
                            // TODO: support jumpToCoda in section with repeats
                        }
                    }
                    current.bars = current.bars.concat(sectionBars);
                }
                if (section.repeats.length) { // splice repeats
                    //console.log('repeats', section.repeats);
                    section.repeats.forEach((repeat, index) => {
                        if (repeat[0] !== null) {
                            current.repeatStart = [sectionIndex, repeat[0]];
                        }
                        const skip = !!repeated.find(r => r[0] === section.section && r[1] === repeat[1]);
                        if (repeat[1] && !skip) {
                            if (!current.repeatStart) { // if no { at start.. see lover man
                                console.log('no repeat start found', repeat);
                                current.repeatStart = [0, 0];
                            }
                            const repeatedSections = sections.slice(current.repeatStart[0], sectionIndex + 1);
                            repeated.push([section.section, repeat[1]])
                            /* console.log('repeated sections', repeatedSections); */
                            const insert = this.getBars(repeatedSections, { first, last }, repeated);
                            /* console.log('insert', insert); */
                            current.bars = current.bars.concat(insert);
                        }
                    })
                }
                return current;
            }, { bars: [], repeatStart: null, repeatEnd: null }).bars;
        /* return bars; */
    }


    getSections(tokens) {
        return tokens.reduce((current, token, index) => {

            // not working correctly: 
            // "Pretty Girl Is Like A Melody, A" => bar with "/"
            // current token has barline => end current.bar

            // beginning of new section
            const sectionStart = token.annots.find(annotation => annotation.match(/^\*[a-zA-Z]/));
            const codaSign = token.annots.includes('Q');
            const segnioSign = token.annots.includes('S'); // TODO: add segnio
            const codaJump = codaSign && current.section.jumpToCoda === null;
            const codaStart = codaSign && !codaJump;
            const houseStart = token.annots.find(annotation => annotation.match(/^N./));
            const lastToken = index === tokens.length - 1;

            // new bar
            if (['{', '|', '[', 'Z', '||', ']'].includes(token.bars || token.token)) {
                //if (!current.bar.length && (!sectionStart || codaStart)) {
                // current.bar = ['N.C.']; // TODO: write N.C. directly when parsing
                //}
                if (current.bar.length) {
                    //current.out.push(current.bar);
                    if (current.section) {
                        (current.house || current.section.bars).push(current.bar);
                    }
                    current.bar = [];
                }
            }
            // sectionSign or second coda sign
            if (sectionStart || codaStart || lastToken) {
                if (current.section) {
                    if (current.house) {
                        current.section.endings.push(current.house);
                        current.house = null;
                    }
                    current.sections.push(current.section);
                }
                delete current.section;
            }
            // either first bar without section name or new section sign
            if (!current.section) {// && !lastToken
                current.section = {
                    section: codaStart ? 'coda' : (sectionStart || '').replace('*', '') || 'A',
                    bars: [],
                    repeats: [],
                    endings: [],
                    jumpToCoda: null,
                    annotations: {}
                };
            }
            const barIndex = current.section.bars.length + (current.house || []).length;
            if (codaJump) {
                current.section.jumpToCoda = barIndex;
            }
            // beginning of house
            if (houseStart) {
                if (current.house) {
                    current.section.endings.push(current.house);
                    current.house = null;
                }
                current.house = [];
            }

            if (token.chord) {
                current.bar.push(token.chord.note + token.chord.modifiers);
                //current.bar.push(token);
            }
            if (token.annots.length) {
                current.section.annotations[barIndex] = token.annots;
            }
            if (token.bars === '{') {
                current.section.repeats.push([barIndex]);
            }
            if (token.bars === '}' || token.token === '}') { // see lover man: bars is empty but token is }
                if (current.section.repeats.length && current.section.repeats[current.section.repeats.length - 1]) {
                    current.section.repeats[current.section.repeats.length - 1].push(barIndex);
                } else {
                    console.warn('end loop without start in section');
                    current.section.repeats.push([null, barIndex]);
                }
            }
            return current;
        }, { /* out: [], */ sections: [], house: null, bar: [], section: null }).sections;
    }

    parse(raw: string): any {
        var text = raw;
        var arr = [], headers = [], comments = [];
        var i;
        text = text.trim();
        // text = text.trimRight();
        while (text) {
            var found = false;
            for (i = 0; i < this.regExps.length; i++) {
                var match = this.regExps[i].exec(text);

                if (match) {
                    found = true;
                    if (match.length <= 2) {
                        const replacement = match[0];
                        var repl = this.replacements[replacement];
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
        var obj = this.newToken(out);
        for (i = 0; i < arr.length; i++) {
            var token = arr[i];
            if (token instanceof Array) {
                obj.chord = this.parseChord(token);
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
                obj = this.newToken(out);
            }
        }
        return out;
    }



    parseChord(match) {
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
            match = this.chordRegex.exec(alternate.substr(1, alternate.length - 2));
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

    newToken(arr) {
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