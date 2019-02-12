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
var JsDiff = __importStar(require("diff"));
function getMeasure(measure) {
    if (typeof measure === 'string') {
        return {
            chords: [measure]
        };
    }
    if (Array.isArray(measure)) {
        return {
            chords: [].concat(measure)
        };
    }
    return Object.assign({}, measure);
    // return measure;
}
exports.getMeasure = getMeasure;
/** renderSheet2 */
function hasSign(sign, measure) {
    measure = getMeasure(measure);
    return !!measure.signs && measure.signs.includes(sign);
}
exports.hasSign = hasSign;
function hasHouse(measure, number) {
    measure = getMeasure(measure);
    var house = measure.house;
    if (!house) {
        return false;
    }
    else if (number === undefined) {
        return true;
    }
    if (!Array.isArray(house)) {
        house = [house];
    }
    return house.includes(number);
}
exports.hasHouse = hasHouse;
/** Starts at a given index, stops when the pair functions returned equally often */
function findPair(sheet, index, pairs, move, stack) {
    if (move === void 0) { move = 1; }
    if (stack === void 0) { stack = 0; }
    var match = -1; // start with no match
    while (match === -1 && index >= 0 && index < sheet.length) {
        if (pairs[0](sheet[index], { sheet: sheet, index: index })) { // same sign
            stack++;
        }
        if (pairs[1](sheet[index], { sheet: sheet, index: index })) { // pair sign
            stack--;
        }
        if (stack === 0) { // all pairs resolved > match!
            match = index;
        }
        else {
            index += move;
        }
    }
    return match;
}
exports.findPair = findPair;
// returns the index of the repeat sign that pairs with the given index
function getBracePair(sheet, index, fallbackToZero) {
    if (fallbackToZero === void 0) { fallbackToZero = true; }
    if (hasSign('{', sheet[index])) {
        return findPair(sheet, index, [
            function (m) { return hasSign('{', m); },
            function (m) { return hasSign('}', m); },
        ], 1);
    }
    else if (hasSign('}', sheet[index])) {
        var pair = findPair(sheet, index, [
            function (m, state) {
                // this logic could be infinitely complex, having many side effects and interpretations
                // the current behaviour is similar to musescore or ireal handling braces
                if (!hasSign('}', m)) {
                    return false;
                }
                if (index === state.index) {
                    return true;
                }
                var relatedHouse = getRelatedHouse({ sheet: sheet, index: state.index });
                return relatedHouse === -1;
            },
            function (m) { return hasSign('{', m); }
        ], -1);
        if (fallbackToZero) {
            return pair === -1 ? 0 : pair; // default to zero when searching repeat start (could be forgotten)
        }
        return pair;
    }
    return -1;
}
exports.getBracePair = getBracePair;
// returns true if the house at the given index has not been visited enough times
function canVisitHouse(_a) {
    var sheet = _a.sheet, index = _a.index, visits = _a.visits;
    var houses = sheet[index].house;
    if (houses === undefined) {
        return false;
    }
    if (!Array.isArray(houses)) {
        houses = [houses];
    }
    var visited = visits[index] || 0;
    return visited < houses.length;
}
exports.canVisitHouse = canVisitHouse;
// returns the next house that can be visited (from the given index)
function getNextHouseIndex(_a, move) {
    var sheet = _a.sheet, index = _a.index, visits = _a.visits;
    if (move === void 0) { move = 1; }
    return findPair(sheet, index, [
        function (m, step) { return index === step.index; },
        function (m, step) { return hasHouse(m) && canVisitHouse({ sheet: sheet, index: step.index, visits: visits }); }
    ], move);
}
exports.getNextHouseIndex = getNextHouseIndex;
// moves the index to the current house (if any)
function visitHouses(_a) {
    var sheet = _a.sheet, index = _a.index, visits = _a.visits;
    var _b;
    if (!hasHouse(sheet[index], 1)) {
        return {};
    }
    var next = getNextHouseIndex({ sheet: sheet, index: index, visits: visits });
    if (next === -1) {
        next = index;
        visits = {}; // reset visits
    }
    return {
        visits: __assign({}, visits, (_b = {}, _b[next] = (visits[next] || 0) + 1, _b)),
        index: next
    };
}
exports.visitHouses = visitHouses;
// wipes all keys in the given range
function wipeKeys(numberMap, range) {
    var wiped = {};
    Object.keys(numberMap)
        .map(function (i) { return parseInt(i); })
        .filter(function (i) { return i < range[0] || i > range[1]; })
        .forEach(function (i) { return wiped[i] = numberMap[i]; });
    return wiped;
}
exports.wipeKeys = wipeKeys;
function nextIndex(_a) {
    var sheet = _a.sheet, index = _a.index, repeated = _a.repeated;
    var _b;
    if (!shouldRepeat({ sheet: sheet, index: index, repeated: repeated })) {
        return {
            index: index + 1
        };
    }
    var braces = [getBracePair(sheet, index), index]; // inside { }
    repeated = wipeKeys(repeated, [braces[0], braces[1] - 1]); // wipes indices inside braces
    return {
        index: braces[0],
        repeated: __assign({}, repeated, (_b = {}, _b[braces[1]] = (repeated[braces[1]] || 0) + 1, _b))
    };
}
exports.nextIndex = nextIndex;
function getRelatedHouse(_a) {
    var sheet = _a.sheet, index = _a.index;
    var latestHouse = findPair(sheet, index, [
        function (m, state) { return index === state.index || hasSign('}', m); },
        function (m) { return hasHouse(m); }
    ], -1);
    return latestHouse;
}
exports.getRelatedHouse = getRelatedHouse;
function isFirstHouse(_a) {
    var sheet = _a.sheet, index = _a.index;
    return hasHouse(sheet[index], 1);
}
exports.isFirstHouse = isFirstHouse;
function getRepeatTimes(_a) {
    var sheet = _a.sheet, index = _a.index;
    if (!hasSign('}', sheet[index])) {
        return 0;
    }
    var measure = getMeasure(sheet[index]);
    if (measure.times !== undefined) {
        return measure.times;
    }
    return 1;
}
exports.getRepeatTimes = getRepeatTimes;
function shouldRepeat(_a) {
    var sheet = _a.sheet, index = _a.index, repeated = _a.repeated;
    if (!hasSign('}', sheet[index])) {
        return false;
    }
    var repeatTimes = getRepeatTimes({ sheet: sheet, index: index });
    var timesRepeated = repeated[index] || 0;
    return timesRepeated < repeatTimes;
}
exports.shouldRepeat = shouldRepeat;
function nextMeasure(state) {
    state = __assign({}, state, visitHouses(state)); // moves to the right house (if any)
    var sheet = state.sheet, index = state.index, measures = state.measures;
    return __assign({}, state, { measures: measures.concat([sheet[index]]) }, nextIndex(state));
}
exports.nextMeasure = nextMeasure;
function renderSheet(sheet) {
    var state = {
        measures: [],
        index: 0,
        sheet: sheet,
        repeated: {},
        visits: {},
    };
    var runs = 0;
    while (runs < 100 && state.index < sheet.length) {
        runs++;
        state = nextMeasure(state);
    }
    return state.measures /* .map(m => getMeasure(m)) */;
}
exports.renderSheet = renderSheet;
function renderChordSnippet(snippet) {
    var parsed = parseChordSnippet(snippet);
    return renderSheet(parsed);
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
    return sheet.map(function (m) { return getMeasure(m); }).map(function (m) { return m.chords; }).join(' ');
}
exports.testFormat = testFormat;
function getChordSnippet(sheet, format) {
    if (format === void 0) { format = true; }
    var snippet = sheet
        .map(function (m) { return getMeasure(m); })
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
    var sheet = renderSheet(rendered);
    var expanded = getChordSnippet(sheet);
    return expanded;
    /* return getChordSnippet(renderSheet(renderChordSnippet(snippet))); */
}
exports.expandSnippet = expandSnippet;
function chordSnippetDiff(snippetA, snippetB) {
    var diffFormat = [formatForDiff(snippetA), formatForDiff(snippetB)];
    return JsDiff.diffWords(diffFormat[0], diffFormat[1]);
}
exports.chordSnippetDiff = chordSnippetDiff;
/*

// returns the index of next house one to the left
export function getFirstHouse(sheet, index): number {
    return findPair(sheet, index,
        [
            (m, state) => index === state.index,
            (m) => hasHouse(m, 1)
        ], -1);
}

// returns the index of the next open repeat start, expects calling from a house
export function getHouseRepeat(sheet, index): number {
    const firstHouse = getFirstHouse(sheet, index);
    return findPair(sheet, firstHouse,
        [
            (m, state) => index === state.index || hasSign('}', m),
            (m) => hasSign('{', m)
        ], -1);
}

export function getNextHouseNumber({ sheet, index, houses }) {
    return (houses[getHouseRepeat(sheet, index)] || 0) + 1;
}

export function getNextHouse({ sheet, index, houses, visits }, move = 1) {
    const number = getNextHouseNumber({ sheet, index, houses });
    return findPair(sheet, index,
        [
            (m, state) => index === state.index,
            (m) => hasHouse(m, number)
        ], move);
}

export function hasRepeatingHouse({ sheet, index }) {
    if (!hasHouse(sheet[index])) {
        return false;
    }
    return findPair(sheet, index, [
        (m) => hasSign('{', m) || hasHouse(m),
        (m) => hasSign('}', m),
    ], 1) !== -1;
}

*/
/** renderSheet1 */
/* export function renderSheet(sheet: Sheet, current?) { //unify = false,
    current = Object.assign({
        index: 0, // index of current sheet measure
        measures: [], // resulting measures
        openRepeats: [], // opened repeat start indices
        repeated: [], // already repeated end indices
        end: sheet.length - 1, // last index that should be rendered
        house: 0, // latest housenumber
        houseStart: 0, // where did the latest N1 start?
        houses: {} // house targets of repeatStart indices
    }, current);

    while (current.index <= current.end) {
        // const measure = sheet[current.index];
        let m = getMeasure(sheet[current.index]);
        const signs = m.signs || [];
        //console.log(`${current.index}/${current.end}`, measure['chords'], `${current.house}/${JSON.stringify(current.targets)}`);

        const repeatStart = signs.includes('{');
        if (repeatStart) {
            current.openRepeats.unshift(current.index);
        }

        if (m.house) {
            current.house = m.house;
            if (m.house === 1) { // remember where it started..
                current.houseStart = current.openRepeats[0] || 0;
            }
        }

        const skip = current.house && current.houses[current.houseStart] && current.house !== current.houses[current.houseStart];
        if (!skip) {
            current.measures.push(m);
            const repeatEnd = signs.includes('}') && !current.repeated.includes(current.index);// && !current.repeatedEnds[current.index]; // TODO: support repeat n times

            if (repeatEnd) {
                const jumpTo = current.openRepeats[0] || 0;
                current.openRepeats.shift();
                current.houses[jumpTo] = (current.houses[jumpTo] || 1) + 1;

                current.measures = current.measures.concat(
                    renderSheet(sheet, {
                        index: jumpTo,
                        repeated: [current.index],
                        end: current.index,
                        houses: {
                            [jumpTo]: current.houses[jumpTo]
                        }
                    })
                );
            }
        }
        current.index += 1;
    }
    return current.measures;
} */
/* export function getLatestMeasure(index, sheet) {
    const m = getMeasure(sheet[index]);
    if (m.chords[0] === 'x') {
        return getLatestMeasure(index - 1, sheet);
    }
    return m;
}
export function getPairSign(sign) {
    if (!['{', '}'].includes(sign)) {
        throw new Error('getPairSign expects { or }');
    }
    return sign === '{' ? '}' : '{';
}

export function getLatestHouse({ sheet, index }): number {
    const latestHouse = findPair(sheet, index,
        [
            (m, state) => index === state.index,
            (m) => hasHouse(m)
        ], -1);
    return latestHouse;
}
*/
