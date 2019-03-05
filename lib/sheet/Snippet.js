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
var Snippet = /** @class */ (function () {
    function Snippet() {
    }
    Snippet.render = function (snippet, options) {
        var parsed = Snippet.parse(snippet);
        return Sheet_1.Sheet.render(parsed, options, true);
    };
    Snippet.wrapPipes = function (string) {
        return ("|" + string + "|").replace(/\|+/g, '|');
    };
    Snippet.formatForDiff = function (snippet) {
        return Snippet.minify(snippet)
            .replace(/\|/g, ' | ').trim();
    };
    Snippet.format = function (snippet, linebreaks) {
        if (linebreaks === void 0) { linebreaks = true; }
        // replaces url chars back
        var compact = Snippet.minify(snippet, false);
        compact = Snippet.wrapPipes(compact);
        if (linebreaks) {
            compact = Snippet.parseBars(snippet).compact;
        }
        else {
            compact = compact.replace(/\n/g, '|');
        }
        return compact
            .replace(/\|+/g, '|')
            .replace(/\|( +)\|( +)/g, ' $1 $2') // remove spacer bar pipes
            .replace(/\|( +)\|([1-9])/g, ' $1|$2')
            .replace(/^\s+|\s+$/g, ''); // remove spaces/line breaks from start/end
    };
    Snippet.parseBars = function (snippet) {
        var compact = Snippet.minify(snippet, false);
        compact = Snippet.wrapPipes(compact);
        // insert spaces before first chord
        var cells = compact.split('|').slice(1, -1);
        cells = cells.map(function (bar, index) {
            if (!bar[0].match(/[1-9:]/)) {
                bar = '  ' + bar;
            }
            else if (bar[0] === ':') {
                bar = ': ' + bar.slice(1);
            }
            return bar;
        });
        // find out indices of first houses
        var houses = cells.reduce(function (offset, bar, index) {
            if (bar[0] === '1') {
                offset.push(index);
            }
            return offset;
        }, []);
        // insert empty cells before additional houses
        cells = cells.reduce(function (cells, bar, index) {
            if (bar[0].match(/[2-9]/)) {
                var offset = houses.filter(function (h) { return h < index; }).reverse()[0];
                cells = cells.concat(new Array(offset % 4).fill(''));
            }
            cells.push(bar);
            return cells;
        }, []);
        // find out the maximal number of chars per column
        var chars = cells.reduce(function (max, bar, index) {
            max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
            return max;
        }, []);
        // fill up each bar with spaces
        compact = cells.map(function (bar, index) {
            var diff = chars[index % 4] - bar.length + 2;
            if (diff > 0) {
                bar += new Array(diff).fill(' ').join('');
            }
            // move double dots to end of bar
            bar = bar.replace(/:(\s+)$/, '$1:');
            return bar;
        }).join('|');
        compact = Snippet.wrapPipes(compact);
        // break string all 4 cells
        var pipeIndex = -1;
        compact = compact.split('').reduce(function (string, char, index) {
            if (char === '|') {
                pipeIndex++;
            }
            if (char === '|' && pipeIndex % 4 === 0 && index > 0 && index < compact.length - 1) {
                char = "|\n|";
                pipeIndex = 0;
            }
            return string + char;
        }, '');
        return { compact: compact, cells: cells, houses: houses, chars: chars };
    };
    Snippet.columnChars = function (snippet) {
        var bars = snippet.split('|');
        var chars = bars.reduce(function (max, bar, index) {
            max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
            return max;
        }, []);
    };
    Snippet.getCellBounds = function (index, snippet) {
        var _a = Snippet.parseBars(snippet), chars = _a.chars, cells = _a.cells;
        // get correct index with offset (dont count empty cells)
        index = cells.map((function (cell, index) { return ({ cell: cell, index: index }); }))
            .filter(function (_a) {
            var cell = _a.cell;
            return cell !== '';
        })[index].index;
        index = index % cells.length;
        var col = index % 4;
        var row = Math.floor(index / 4);
        var rowlength = chars.reduce(function (sum, current) { return sum + current + 3; }, 0) + 2;
        var rowLeft = rowlength * row;
        var left = rowLeft + chars.slice(0, col).reduce(function (sum, current, i) { return sum + current + 3; }, 0) + 1;
        return [left, left + chars[col] + 2];
    };
    Snippet.minify = function (snippet, urlsafe) {
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
                .replace(/\#/g, 'Y')
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
                .replace(/Y/g, '#');
        }
        return compact.slice(1, -1);
    };
    Snippet.getControlSigns = function (symbols) {
        if (symbols === void 0) { symbols = []; }
        return symbols
            .filter(function (s) { return typeof s === 'string'; }) // control should not be nested!
            .map(function (s) { return Snippet.controlSigns.find(function (c) { return [c.name, c.short]
            .includes(s.replace('(', '').replace(')', '')); }); })
            .filter(function (s) { return !!s; });
    };
    Snippet.parse = function (snippet, simplify) {
        if (simplify === void 0) { simplify = true; }
        var formatted = Snippet.format(snippet, false);
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
            var controlSigns = Snippet.getControlSigns(measure.symbols);
            if (controlSigns.length) {
                measure.signs = measure.signs.concat(controlSigns.map(function (sign) { return sign.name; }));
                measure.symbols = measure.symbols
                    .filter(function (s) { return !controlSigns
                    .find(function (c) { return [c.name, c.short].includes(s.replace(')', '').replace('(', '')); }); });
            }
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
    };
    Snippet.nest = function (string) {
        var nested = string.split('.')
            .map(function (group) { return group.trim(); })
            .map(function (group) { return group.split(' '); })
            .map(function (group) { return group.filter(function (chord) { return !!chord; }); }) // kill empty chords
            .filter(function (group) { return !group || group.length; })
            .map(function (group) { return group.length === 1 ? group[0] : group; });
        nested = nested.length === 1 ? nested[0] : nested;
        return nested;
    };
    Snippet.parse2 = function (snippet, simplify) {
        if (simplify === void 0) { simplify = true; }
        var formatted = Snippet.format(snippet, false);
        return formatted
            .split('|') // split into measures
            .filter(function (measure) { return measure && measure.length; }) // kill empty measures
            .map(function (measure) { return ({ symbols: measure.trim(), signs: [] }); })
            // parse symbols to chords and signs
            .map(function (measure) {
            // repeat start
            if (measure.symbols[0] === ':') {
                measure.signs.unshift('{');
            }
            var last = measure.symbols[measure.symbols.length - 1];
            // repeat end
            if (last === ':') {
                measure.signs.push('}');
            }
            measure.symbols = measure.symbols.replace(/:/g, '');
            var house = measure.symbols[0].match(/^[1-9]$/);
            if (house) {
                measure.house = parseInt(house);
                measure.symbols = measure.symbols.slice(1);
            }
            measure.symbols = [].concat(Snippet.nest(measure.symbols));
            var controlSigns = Snippet.getControlSigns(measure.symbols);
            if (controlSigns.length) {
                measure.signs = measure.signs.concat(controlSigns.map(function (sign) { return sign.name; }));
                measure.symbols = measure.symbols
                    .filter(function (s) { return !controlSigns
                    .find(function (c) { return [c.name, c.short].includes(s.replace(')', '').replace('(', '')); }); });
            }
            measure.chords = measure.symbols;
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
    };
    Snippet.testFormat = function (sheet) {
        return sheet.map(function (m) { return Measure_1.Measure.from(m); }).map(function (m) { return m.chords; }).join(' ');
    };
    Snippet.from = function (sheet, format) {
        if (format === void 0) { format = true; }
        var snippet = sheet
            .map(function (m) { return Measure_1.Measure.from(m); })
            .reduce(function (snippet, _a) {
            var signs = _a.signs, house = _a.house, chords = _a.chords;
            var controlSigns = Snippet.getControlSigns(signs || []);
            var start = controlSigns.filter(function (c) { return !c.end; }).map(function (c) { return '(' + c.short + ')'; }).join(' ');
            var end = controlSigns.filter(function (c) { return !!c.end; }).map(function (c) { return '(' + c.short + ')'; }).join(' ');
            var repeatStart = signs && signs.includes('{');
            var repeatEnd = signs && signs.includes('}');
            return snippet + ("|" + (repeatStart ? ':' : '') + (house || '') + " " + (start ? start + ' ' : '') + (chords ? chords.join(' ') : '') + (end ? ' ' + end : '') + (repeatEnd ? ':' : ''));
        }, '');
        if (format) {
            return Snippet.format(snippet);
        }
        return Snippet.minify(snippet);
    };
    Snippet.expand = function (snippet, options) {
        return Snippet.from(Snippet.render(snippet, options));
    };
    Snippet.diff = function (snippetA, snippetB) {
        var diffFormat = [Snippet.formatForDiff(snippetA), Snippet.formatForDiff(snippetB)];
        return JsDiff.diffWords(diffFormat[0], diffFormat[1]);
    };
    Snippet.controlSigns = [
        {
            name: 'DC',
            short: 'DC',
            end: true
        },
        {
            name: 'DS',
            short: 'DS',
            end: true
        },
        {
            name: 'Segno',
            short: 'S',
        },
        {
            name: 'DS.Fine',
            short: 'DS',
            end: true
        },
        {
            name: 'DS.Coda',
            short: 'DS',
            end: true
        },
        {
            name: 'DC.Fine',
            short: 'DC',
            end: true
        },
        {
            name: 'DC.Coda',
            short: 'DC',
            end: true
        },
        {
            name: 'Fine',
            short: 'Fi',
            end: true
        },
        {
            name: 'ToCoda',
            short: '2Q',
            end: true
        },
        {
            name: 'Coda',
            short: 'Q'
        },
    ];
    return Snippet;
}());
exports.Snippet = Snippet;
