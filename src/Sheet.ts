import * as JsDiff from 'diff';

export type Measure = {
    chords?: string[],
    //voices?: string[][],
    signs?: string[],
    comments?: string[],
    house?: number | number[],
    times?: number,
    section?: string,
    idle?: true // bar is repeated
}// | string[];

export type Sheet = Array<Measure | string[] | string>;

export type Song = {
    name: string,
    composer?: string,
    style?: string,
    bpm?: number,
    repeats?: number,
    key?: string,
    sheet: Sheet
}

export function getMeasure(measure: Measure | string[] | string): Measure {
    if (typeof measure === 'string') {
        return {
            chords: [measure]
        }
    }
    if (Array.isArray(measure)) {
        return {
            chords: [].concat(measure)
        }
    }
    return Object.assign({}, measure);
    // return measure;
}

/** renderSheet2 */

export function hasSign(sign, measure) {
    measure = getMeasure(measure);
    return !!measure.signs && measure.signs.includes(sign);
}

export function hasHouse(measure, number?) {
    measure = getMeasure(measure);
    let { house } = measure;
    if (!house) {
        return false;
    } else if (number === undefined) {
        return true;
    }
    if (!Array.isArray(house)) {
        house = [house];
    }
    return house.includes(number);
}

/** Starts at a given index, stops when the pair functions returned equally often */
export function findPair(
    sheet,
    index: number,
    pairs: Array<(measure?: Measure, options?: { sheet?: Sheet, index?: number }) => boolean>,
    move = 1,
    stack = 0) {
    let match = -1; // start with no match
    while (match === -1 && index >= 0 && index < sheet.length) {
        if (pairs[0](sheet[index], { sheet, index })) { // same sign
            stack++;
        }
        if (pairs[1](sheet[index], { sheet, index })) { // pair sign
            stack--;
        }
        if (stack === 0) { // all pairs resolved > match!
            match = index;
        } else {
            index += move;
        }
    }
    return match;
}

// returns the index of the repeat sign that pairs with the given index
export function getBracePair(sheet, index, fallbackToZero = true) {
    if (hasSign('{', sheet[index])) {
        return findPair(sheet, index,
            [
                (m) => hasSign('{', m),
                (m) => hasSign('}', m),
            ]
            , 1);
    } else if (hasSign('}', sheet[index])) {
        const pair = findPair(sheet, index,
            [
                (m, state) => {
                    // this logic could be infinitely complex, having many side effects and interpretations
                    // the current behaviour is similar to musescore or ireal handling braces
                    if (!hasSign('}', m)) {
                        return false;
                    }
                    if (index === state.index) {
                        return true;
                    }
                    const relatedHouse = getRelatedHouse({ sheet, index: state.index });
                    return relatedHouse === -1;
                },
                (m) => hasSign('{', m)
            ]
            , -1);
        if (fallbackToZero) {
            return pair === -1 ? 0 : pair; // default to zero when searching repeat start (could be forgotten)
        }
        return pair;
    }
    return -1;
}

// returns true if the house at the given index has not been visited enough times
export function canVisitHouse({ sheet, index, visits }) {
    let houses = sheet[index].house;
    if (houses === undefined) {
        return false;
    }
    if (!Array.isArray(houses)) {
        houses = [houses];
    }
    const visited = visits[index] || 0;
    return visited < houses.length
}

// returns the next house that can be visited (from the given index)
export function getNextHouseIndex({ sheet, index, visits }, move = 1) {
    return findPair(sheet, index,
        [
            (m, step) => index === step.index,
            (m, step) => hasHouse(m) && canVisitHouse({ sheet, index: step.index, visits })
        ], move);
}

// moves the index to the current house (if any)
export function visitHouses({ sheet, index, visits }) {
    if (!hasHouse(sheet[index], 1)) {
        return {};
    }
    let next = getNextHouseIndex({ sheet, index, visits });
    if (next === -1) {
        next = index;
        visits = {}; // reset visits
    }
    return {
        visits: {
            ...visits,
            [next]: (visits[next] || 0) + 1
        },
        index: next
    }
}

// wipes all keys in the given range
export function wipeKeys(numberMap, range) {
    const wiped = {};
    Object.keys(numberMap)
        .map(i => parseInt(i))
        .filter(i => i < range[0] || i > range[1])
        .forEach(i => wiped[i] = numberMap[i]);
    return wiped;
}

export function nextIndex({ sheet, index, repeated }) {
    if (!shouldRepeat({ sheet, index, repeated })) {
        return {
            index: index + 1
        };
    }
    const braces = [getBracePair(sheet, index), index]; // inside { }
    repeated = wipeKeys(repeated, [braces[0], braces[1] - 1]); // wipes indices inside braces
    return {
        index: braces[0],
        repeated: { // count repeat up
            ...repeated,
            [braces[1]]: (repeated[braces[1]] || 0) + 1
        }
    }
}

export function getRelatedHouse({ sheet, index }): number {
    const latestHouse = findPair(sheet, index,
        [
            (m, state) => index === state.index || hasSign('}', m),
            (m) => hasHouse(m)
        ], -1);
    return latestHouse;
}

export function isFirstHouse({ sheet, index }): number {
    return hasHouse(sheet[index], 1);
}

export function getRepeatTimes({ sheet, index }) {
    if (!hasSign('}', sheet[index])) {
        return 0;
    }
    const measure = getMeasure(sheet[index]);
    if (measure.times !== undefined) {
        return measure.times;
    }
    return 1;
}

export function shouldRepeat({ sheet, index, repeated }) {
    if (!hasSign('}', sheet[index])) {
        return false;
    }
    const repeatTimes = getRepeatTimes({ sheet, index });
    const timesRepeated = repeated[index] || 0;
    return timesRepeated < repeatTimes;
}


export function nextMeasure(state) {
    state = {
        ...state,
        ...visitHouses(state)
    } // moves to the right house (if any)
    let { sheet, index, measures } = state;
    return {
        ...state,
        measures: measures.concat([sheet[index]]),
        ...nextIndex(state),
    }
}


export function renderSheet(sheet) {
    let state = {
        measures: [],
        index: 0,
        sheet,
        repeated: {},
        visits: {},
    }
    let runs = 0;
    while (runs < 100 && state.index < sheet.length) {
        runs++;
        state = nextMeasure(state);
    }
    return state.measures/* .map(m => getMeasure(m)) */;
}


export function renderChordSnippet(snippet) {
    const parsed = parseChordSnippet(snippet);
    return renderSheet(parsed);
}


function wrapPipes(string) {
    return `|${string}|`.replace(/\|+/g, '|');
}

export function formatForDiff(snippet) {
    return minifyChordSnippet(snippet)
        .replace(/\|/g, ' | ').trim();
}

export function formatChordSnippet(snippet, linebreaks = true) {
    // replaces url chars back
    let compact = minifyChordSnippet(snippet, false);
    compact = wrapPipes(compact);

    if (linebreaks) {
        // insert spaces before first chord
        let bars = compact.split('|').slice(1, -1);
        bars = bars.map((bar, index) => {
            if (!bar[0].match(/[1-9:]/)) {
                bar = '  ' + bar;
            } else if (bar[0] === ':') {
                bar = ': ' + bar.slice(1);
            }
            return bar;
        });
        // find out indices of first houses
        const houses = bars.reduce((offset, bar, index) => {
            if (bar[0] === '1') {
                offset.push(index);
            }
            return offset;
        }, []);
        // insert empty bars before additional houses
        bars = bars.reduce((bars, bar, index) => {
            if (bar[0].match(/[2-9]/)) {
                const offset = houses.filter(h => h < index).reverse()[0];
                bars = bars.concat(new Array(offset % 4).fill(''));
            }
            bars.push(bar);
            return bars;
        }, []);
        // find out the maximal number of chars per column
        const chars = bars.reduce((max, bar, index) => {
            max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
            return max;
        }, []);
        // fill up each bar with spaces
        compact = bars.map((bar, index) => {
            let diff = chars[index % 4] - bar.length + 2;
            if (diff > 0) {
                bar += new Array(diff).fill(' ').join('');
            }
            // move double dots to end of bar
            bar = bar.replace(/:(\s+)$/, '$1:');
            return bar;
        }).join('|');

        compact = wrapPipes(compact);
        // break string all 4 bars
        let pipeIndex = -1;
        compact = compact.split('').reduce((string, char, index) => {
            if (char === '|') {
                pipeIndex++;
            }
            if (char === '|' && pipeIndex % 4 === 0 && index > 0 && index < compact.length - 1) {
                char = "|\n|";
                pipeIndex = 0;
            }
            return string + char;
        }, '');
    } else {
        compact = compact.replace(/\n/g, '|');
    }
    return compact
        .replace(/\|+/g, '|')
        .replace(/\|( +)\|( +)/g, ' $1 $2') // remove spacer bar pipes
        .replace(/\|( +)\|([1-9])/g, ' $1|$2')
        .replace(/^\s+|\s+$/g, '') // remove spaces/line breaks from start/end
}

export function minifyChordSnippet(snippet, urlsafe = false) {
    let compact = (`|${snippet}|`)
        .replace(/\n+/g, '|') // replace line breaks with pipes
        .replace(/\s+/g, ' ') // no repeated pipes
        .replace(/\s?\|\s?/g, '|') // no pipes with spaces
        .replace(/\s?\:\s?/g, ':') // no repeat with spaces
        .replace(/\|+/g, '|') // no repeated pipes
    if (urlsafe) {
        // replaces url unfriendly chars
        compact = compact
            .replace(/\|+/g, 'I')
            .replace(/\s+/g, '_')
            .replace(/:/g, 'R')
            .replace(/\^/g, 'M')
            .replace(/\#/g, 'S')
            .replace(/\%/g, 'X')
    } else {
        // replaces url unfriendly chars
        compact = compact
            .replace(/\I+/g, '|')
            .replace(/\_+/g, ' ')
            .replace(/R/g, ':')
            .replace(/M/g, '^')
            .replace(/X/g, 'x')
            .replace(/S/g, '#')
    }
    return compact.slice(1, -1);
}

export function parseChordSnippet(snippet, simplify = true) {
    const formatted = formatChordSnippet(snippet, false);
    return formatted
        .split('|') // split into measures
        .map(measure => measure.split(' ')) // split measures by spaces
        .map(measure => measure.filter(chord => !!chord)) // kill empty chords
        .filter(measure => !measure || measure.length) // kill empty measures
        .map(measure => ({ symbols: measure, signs: [] }))
        // parse symbols to chords and signs
        .map((measure: { symbols, signs, house, chords }) => {
            // repeat start
            if (measure.symbols[0][0] === ':') {
                if (measure.symbols[0].length === 1) {
                    measure.symbols = measure.symbols.slice(1);
                }
                measure.signs.unshift('{');
            }
            const last = measure.symbols[measure.symbols.length - 1];
            // repeat end
            if (last[last.length - 1] === ':') {
                if (last.length === 1) {
                    measure.symbols.pop();
                }
                measure.signs.push('}');
            }
            measure.symbols = measure.symbols.map(s => s.replace(/:/g, ''));
            const house = measure.symbols.find(s => s.match(/^[1-9]$/));
            if (house) {
                measure.house = parseInt(house);
            }
            measure.symbols = measure.symbols.filter(s => !s.match(/^[1-9]$/))
            // houses
            measure.chords = [].concat(measure.symbols);
            delete measure.symbols;
            return measure;
        })
        .map(measure => {
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
        .filter(measure => Object.keys(measure).length > 0)
        // simplify => measures with only chords will be arrays
        .map(measure => {
            if (!simplify) {
                return measure;
            }
            if (measure.chords && Object.keys(measure).length === 1) {
                return measure.chords.length === 1 ?
                    measure.chords[0] : // simplify one chord measures
                    measure.chords
            }
            return measure;
        });
}

export function testFormat(sheet) {
    return sheet.map(m => getMeasure(m)).map(m => m.chords).join(' ');
}

export function getChordSnippet(sheet, format = true) {
    const snippet = sheet
        .map(m => getMeasure(m))
        .reduce((snippet, { signs, house, chords }) => {
            const repeatStart = signs && signs.includes('{');
            const repeatEnd = signs && signs.includes('}');
            return snippet + `|${repeatStart ? ':' : ''}${house || ''} ${chords ? chords.join(' ') : ''}${repeatEnd ? ':' : ''}`;
        }, '');
    if (format) {
        return formatChordSnippet(snippet);
    }
    return minifyChordSnippet(snippet);
}

export function expandSnippet(snippet) {
    const rendered = renderChordSnippet(snippet);
    const sheet = renderSheet(rendered);
    const expanded = getChordSnippet(sheet);
    return expanded;
    /* return getChordSnippet(renderSheet(renderChordSnippet(snippet))); */
}


export function chordSnippetDiff(snippetA, snippetB) {
    const diffFormat = [formatForDiff(snippetA), formatForDiff(snippetB)];
    return JsDiff.diffWords(
        diffFormat[0], diffFormat[1]
    );
}


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
