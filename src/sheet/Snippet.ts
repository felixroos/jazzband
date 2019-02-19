import * as JsDiff from 'diff';
import { Measure } from './Measure';
import { Sheet } from './Sheet';
import { noteArray } from '../util/util';

export class Snippet {

    static render(snippet, options?) {
        const parsed = Snippet.parse(snippet);
        return Sheet.render(parsed, options);
    }

    static wrapPipes(string) {
        return `|${string}|`.replace(/\|+/g, '|');
    }

    static formatForDiff(snippet) {
        return Snippet.minify(snippet)
            .replace(/\|/g, ' | ').trim();
    }

    static format(snippet, linebreaks = true) {
        // replaces url chars back
        let compact = Snippet.minify(snippet, false);
        compact = Snippet.wrapPipes(compact);

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

            compact = Snippet.wrapPipes(compact);
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

    static minify(snippet, urlsafe = false) {
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

    static parse(snippet, simplify = true) {
        const formatted = Snippet.format(snippet, false);
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

    static nest(string) {
        let nested = string.split('.')
            .map(group => group.trim())
            .map(group => group.split(' '))
            .map(group => group.filter(chord => !!chord))  // kill empty chords
            .filter(group => !group || group.length)
            .map(group => group.length === 1 ? group[0] : group)
        nested = nested.length === 1 ? nested[0] : nested;
        return nested;
    }

    static parse2(snippet, simplify = true) {
        const formatted = Snippet.format(snippet, false);
        return formatted
            .split('|') // split into measures
            .filter(measure => measure && measure.length) // kill empty measures
            .map(measure => ({ symbols: measure.trim(), signs: [] }))
            // parse symbols to chords and signs
            .map((measure: { symbols, signs, house, chords }) => {
                // repeat start
                if (measure.symbols[0] === ':') {
                    measure.signs.unshift('{');
                }
                const last = measure.symbols[measure.symbols.length - 1];
                // repeat end
                if (last === ':') {
                    measure.signs.push('}');
                }
                measure.symbols = measure.symbols.replace(/:/g, '');

                /* const house = measure.symbols[0].match(/^[1-9]$/);
                if (house) {
                    measure.house = parseInt(house);
                    measure.symbols = measure.symbols.slice(1);
                } */
                measure.chords = [].concat(Snippet.nest(measure.symbols));
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

    static testFormat(sheet) {
        return sheet.map(m => Measure.from(m)).map(m => m.chords).join(' ');
    }

    static from(sheet, format = true) {
        const snippet = sheet
            .map(m => Measure.from(m))
            .reduce((snippet, { signs, house, chords }) => {
                const repeatStart = signs && signs.includes('{');
                const repeatEnd = signs && signs.includes('}');
                return snippet + `|${repeatStart ? ':' : ''}${house || ''} ${chords ? chords.join(' ') : ''}${repeatEnd ? ':' : ''}`;
            }, '');
        if (format) {
            return Snippet.format(snippet);
        }
        return Snippet.minify(snippet);
    }

    static expand(snippet, options?) {
        let rendered = Snippet.render(snippet, options);
        rendered = rendered
            .map(m => Measure.from(m))
            .map(m => {
                delete m.house;
                delete m.signs;
                return m;
            });
        const expanded = Snippet.from(rendered);
        return expanded;
        /* return from(Sheet.render(render(snippet))); */
    }

    static diff(snippetA, snippetB) {
        const diffFormat = [Snippet.formatForDiff(snippetA), Snippet.formatForDiff(snippetB)];
        return JsDiff.diffWords(
            diffFormat[0], diffFormat[1]
        );
    }
}
