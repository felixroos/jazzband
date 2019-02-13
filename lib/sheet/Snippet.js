"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var JsDiff = __importStar(require("diff"));
var Measure_1 = require("./Measure");
var Sheet_1 = require("./Sheet");
function renderChordSnippet(snippet) {
    var parsed = parseChordSnippet(snippet);
    return Sheet_1.Sheet.render(parsed);
}
exports.renderChordSnippet = renderChordSnippet;
function wrapPipes(string) {
    return ("|" + string + "|").replace(/\|+/g, '|');
}
function formatForDiff(snippet) {
    return minifyChordSnippet(snippet)
        .replace(/\|/g, ' | ').trim();
}
exports.formatForDiff = formatForDiff;
function formatChordSnippet(snippet, linebreaks) {
    if (linebreaks === void 0) { linebreaks = true; }
    // replaces url chars back
    var compact = minifyChordSnippet(snippet, false);
    compact = wrapPipes(compact);
    if (linebreaks) {
        // insert spaces before first chord
        var bars = compact.split('|').slice(1, -1);
        bars = bars.map(function (bar, index) {
            if (!bar[0].match(/[1-9:]/)) {
                bar = '  ' + bar;
            }
            else if (bar[0] === ':') {
                bar = ': ' + bar.slice(1);
            }
            return bar;
        });
        // find out indices of first houses
        var houses_1 = bars.reduce(function (offset, bar, index) {
            if (bar[0] === '1') {
                offset.push(index);
            }
            return offset;
        }, []);
        // insert empty bars before additional houses
        bars = bars.reduce(function (bars, bar, index) {
            if (bar[0].match(/[2-9]/)) {
                var offset = houses_1.filter(function (h) { return h < index; }).reverse()[0];
                bars = bars.concat(new Array(offset % 4).fill(''));
            }
            bars.push(bar);
            return bars;
        }, []);
        // find out the maximal number of chars per column
        var chars_1 = bars.reduce(function (max, bar, index) {
            max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
            return max;
        }, []);
        // fill up each bar with spaces
        compact = bars.map(function (bar, index) {
            var diff = chars_1[index % 4] - bar.length + 2;
            if (diff > 0) {
                bar += new Array(diff).fill(' ').join('');
            }
            // move double dots to end of bar
            bar = bar.replace(/:(\s+)$/, '$1:');
            return bar;
        }).join('|');
        compact = wrapPipes(compact);
        // break string all 4 bars
        var pipeIndex_1 = -1;
        compact = compact.split('').reduce(function (string, char, index) {
            if (char === '|') {
                pipeIndex_1++;
            }
            if (char === '|' && pipeIndex_1 % 4 === 0 && index > 0 && index < compact.length - 1) {
                char = "|\n|";
                pipeIndex_1 = 0;
            }
            return string + char;
        }, '');
    }
    else {
        compact = compact.replace(/\n/g, '|');
    }
    return compact
        .replace(/\|+/g, '|')
        .replace(/\|( +)\|( +)/g, ' $1 $2') // remove spacer bar pipes
        .replace(/\|( +)\|([1-9])/g, ' $1|$2')
        .replace(/^\s+|\s+$/g, ''); // remove spaces/line breaks from start/end
}
exports.formatChordSnippet = formatChordSnippet;
function minifyChordSnippet(snippet, urlsafe) {
    if (urlsafe === void 0) { urlsafe = false; }
    var compact = ("|" + snippet + "|")
        .replace(/\n+/g, '|') // replace line breaks with pipes
        .replace(/\s+/g, ' ') // no repeated pipes
        .replace(/\s?\|\s?/g, '|') // no pipes with spaces
        .replace(/\s?\:\s?/g, ':') // no repeat with spaces
        .replace(/\|+/g, '|'); // no repeated pipes
    if (urlsafe) {
        // replaces url unfriendly chars
        compact = compact
            .replace(/\|+/g, 'I')
            .replace(/\s+/g, '_')
            .replace(/:/g, 'R')
            .replace(/\^/g, 'M')
            .replace(/\#/g, 'S')
            .replace(/\%/g, 'X');
    }
    else {
        // replaces url unfriendly chars
        compact = compact
            .replace(/\I+/g, '|')
            .replace(/\_+/g, ' ')
            .replace(/R/g, ':')
            .replace(/M/g, '^')
            .replace(/X/g, 'x')
            .replace(/S/g, '#');
    }
    return compact.slice(1, -1);
}
exports.minifyChordSnippet = minifyChordSnippet;
function parseChordSnippet(snippet, simplify) {
    if (simplify === void 0) { simplify = true; }
    var formatted = formatChordSnippet(snippet, false);
    return formatted
        .split('|') // split into measures
        .map(function (measure) { return measure.split(' '); }) // split measures by spaces
        .map(function (measure) { return measure.filter(function (chord) { return !!chord; }); }) // kill empty chords
        .filter(function (measure) { return !measure || measure.length; }) // kill empty measures
        .map(function (measure) { return ({ symbols: measure, signs: [] }); })
        // parse symbols to chords and signs
        .map(function (measure) {
        // repeat start
        if (measure.symbols[0][0] === ':') {
            if (measure.symbols[0].length === 1) {
                measure.symbols = measure.symbols.slice(1);
            }
            measure.signs.unshift('{');
        }
        var last = measure.symbols[measure.symbols.length - 1];
        // repeat end
        if (last[last.length - 1] === ':') {
            if (last.length === 1) {
                measure.symbols.pop();
            }
            measure.signs.push('}');
        }
        measure.symbols = measure.symbols.map(function (s) { return s.replace(/:/g, ''); });
        var house = measure.symbols.find(function (s) { return s.match(/^[1-9]$/); });
        if (house) {
            measure.house = parseInt(house);
        }
        measure.symbols = measure.symbols.filter(function (s) { return !s.match(/^[1-9]$/); });
        // houses
        measure.chords = [].concat(measure.symbols);
        delete measure.symbols;
        return measure;
    })
        .map(function (measure) {
        if (!simplify) {
            return measure;
        }
        if (measure.signs.length === 0) {
            delete measure.signs;
        }
        if (measure.chords.length === 0) {
            delete measure.chords;
        }
        return measure;
    })
        // kill empty measures
        .filter(function (measure) { return Object.keys(measure).length > 0; })
        // simplify => measures with only chords will be arrays
        .map(function (measure) {
        if (!simplify) {
            return measure;
        }
        if (measure.chords && Object.keys(measure).length === 1) {
            return measure.chords.length === 1 ?
                measure.chords[0] : // simplify one chord measures
                measure.chords;
        }
        return measure;
    });
}
exports.parseChordSnippet = parseChordSnippet;
function testFormat(sheet) {
    return sheet.map(function (m) { return Measure_1.Measure.from(m); }).map(function (m) { return m.chords; }).join(' ');
}
exports.testFormat = testFormat;
function getChordSnippet(sheet, format) {
    if (format === void 0) { format = true; }
    var snippet = sheet
        .map(function (m) { return Measure_1.Measure.from(m); })
        .reduce(function (snippet, _a) {
        var signs = _a.signs, house = _a.house, chords = _a.chords;
        var repeatStart = signs && signs.includes('{');
        var repeatEnd = signs && signs.includes('}');
        return snippet + ("|" + (repeatStart ? ':' : '') + (house || '') + " " + (chords ? chords.join(' ') : '') + (repeatEnd ? ':' : ''));
    }, '');
    if (format) {
        return formatChordSnippet(snippet);
    }
    return minifyChordSnippet(snippet);
}
exports.getChordSnippet = getChordSnippet;
function expandSnippet(snippet) {
    var rendered = renderChordSnippet(snippet);
    rendered = rendered
        .map(function (m) { return Measure_1.Measure.from(m); })
        .map(function (m) {
        delete m.house;
        delete m.signs;
        return m;
    });
    var expanded = getChordSnippet(rendered);
    return expanded;
    /* return getChordSnippet(Sheet.render(renderChordSnippet(snippet))); */
}
exports.expandSnippet = expandSnippet;
function chordSnippetDiff(snippetA, snippetB) {
    var diffFormat = [formatForDiff(snippetA), formatForDiff(snippetB)];
    return JsDiff.diffWords(diffFormat[0], diffFormat[1]);
}
exports.chordSnippetDiff = chordSnippetDiff;
