import { Measure, RenderedMeasure, Measures } from './Measure';
import { Sheet } from './Sheet';

export class Snippet {
  static controlSigns = [
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
  ]

  static render(snippet, options?) {
    const parsed = Snippet.parse(snippet);
    return Sheet.render(parsed, { ...options });
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
      compact = Snippet.parseBars(snippet).compact;
    } else {
      compact = compact.replace(/\n/g, '|');
    }
    return compact
      .replace(/\|+/g, '|')
      .replace(/\|( +)\|( +)/g, ' $1 $2') // remove spacer bar pipes
      .replace(/\|( +)\|([1-9])/g, ' $1|$2')
      .replace(/^\s+|\s+$/g, '') // remove spaces/line breaks from start/end
  }

  static parseBars(snippet) {
    let compact = Snippet.minify(snippet, false);
    compact = Snippet.wrapPipes(compact);
    // insert spaces before first chord
    let cells = compact.split('|').slice(1, -1);
    cells = cells.map((bar, index) => {
      if (!bar[0].match(/[1-9:]/)) {
        bar = '  ' + bar;
      } else if (bar[0] === ':') {
        bar = ': ' + bar.slice(1);
      }
      return bar;
    });
    // find out indices of first houses
    const houses = cells.reduce((offset, bar, index) => {
      if (bar[0] === '1') {
        offset.push(index);
      }
      return offset;
    }, []);
    // insert empty cells before additional houses
    cells = cells.reduce((cells, bar, index) => {
      if (bar[0].match(/[2-9]/)) {
        const offset = houses.filter(h => h < index).reverse()[0];
        if (offset > 0) {
          cells = cells.concat(new Array(offset % 4).fill(''));
        }
      }
      cells.push(bar);
      return cells;
    }, []);
    // find out the maximal number of chars per column
    const chars = cells.reduce((max, bar, index) => {
      max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
      return max;
    }, []);
    // fill up each bar with spaces
    compact = cells.map((bar, index) => {
      let diff = chars[index % 4] - bar.length + 2;
      if (diff > 0) {
        bar += new Array(diff).fill(' ').join('');
      }
      // move double dots to end of bar
      bar = bar.replace(/:(\s+)$/, '$1:');
      return bar;
    }).join('|');

    compact = Snippet.wrapPipes(compact);
    // break string all 4 cells
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
    return { compact, cells, houses, chars };
  }

  static columnChars(snippet) {
    const bars = snippet.split('|');
    const chars = bars.reduce((max, bar, index) => {
      max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
      return max;
    }, []);
  }

  static getCellBounds(index, snippet) {
    const { chars, cells } = Snippet.parseBars(snippet);
    // get correct index with offset (dont count empty cells)
    index = cells.map(((cell, index) => ({ cell, index })))
      .filter(({ cell }) => cell !== '')[index].index;
    index = index % cells.length;
    const col = index % 4;
    const row = Math.floor(index / 4);
    const rowlength = chars.reduce((sum, current) => sum + current + 3, 0) + 2;
    const rowLeft = rowlength * row;
    const left = rowLeft + chars.slice(0, col).reduce((sum, current, i) => sum + current + 3, 0) + 1;
    return [left, left + chars[col] + 2];
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
        .replace(/\#/g, 'Y')
        .replace(/\%/g, 'X')
    } else {
      // replaces url unfriendly chars
      compact = compact
        .replace(/\I+/g, '|')
        .replace(/\_+/g, ' ')
        .replace(/R/g, ':')
        .replace(/M/g, '^')
        .replace(/X/g, 'x')
        .replace(/Y/g, '#')
    }
    return compact.slice(1, -1);
  }

  static getControlSigns(symbols = []) {
    return symbols
      .filter(s => typeof s === 'string') // control should not be nested!
      .map(s => Snippet.controlSigns.find(c => [c.name, c.short]
        .includes(s.replace('(', '').replace(')', ''))))
      .filter(s => !!s);
  }

  static parse(snippet, simplify = true): Measures<string> {
    const formatted = Snippet.format(snippet, false);
    return formatted
      .split('|') // split into measures
      .map(measure => measure.split(' ')) // split measures by spaces
      .map(measure => measure.filter(chord => !!chord)) // kill empty chords
      .filter(measure => !measure || measure.length) // kill empty measures
      .map(measure => ({ symbols: measure, signs: [] }))
      // parse symbols to chords and signs
      .map((measure: { symbols, signs, house, body }) => {
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

        let controlSigns = Snippet.getControlSigns(measure.symbols);
        if (controlSigns.length) {
          measure.signs = measure.signs.concat(controlSigns.map(sign => sign.name));
          measure.symbols = measure.symbols
            .filter(s => !controlSigns
              .find(c => [c.name, c.short].includes(s.replace(')', '').replace('(', ''))));
        }

        measure.body = [].concat(measure.symbols);

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
        if (measure.body.length === 0) {
          delete measure.body;
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
        if (measure.body && Object.keys(measure).length === 1) {
          return measure.body.length === 1 ?
            measure.body[0] : // simplify one chord measures
            measure.body
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
      .map((measure: { symbols, signs, house, body }) => {
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
        const house = measure.symbols[0].match(/^[1-9]$/);
        if (house) {
          measure.house = parseInt(house);
          measure.symbols = measure.symbols.slice(1);
        }
        measure.symbols = [].concat(Snippet.nest(measure.symbols));
        let controlSigns = Snippet.getControlSigns(measure.symbols);
        if (controlSigns.length) {
          measure.signs = measure.signs.concat(controlSigns.map(sign => sign.name));
          measure.symbols = measure.symbols
            .filter(s => !controlSigns
              .find(c => [c.name, c.short].includes(s.replace(')', '').replace('(', ''))));
        }
        measure.body = measure.symbols;
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
        if (measure.body.length === 0) {
          delete measure.body;
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
        if (measure.body && Object.keys(measure).length === 1) {
          return measure.body.length === 1 ?
            measure.body[0] : // simplify one chord measures
            measure.body
        }
        return measure;
      });
  }

  static testFormat(measures: RenderedMeasure<any>[]) {
    return measures.map(m => m.body).join(' ');
  }

  static from<T>(measures: Measures<string>, format = true) {
    const snippet = measures
      .map(m => Measure.from(m))
      .reduce((snippet, { signs, house, body }) => {
        const controlSigns = Snippet.getControlSigns(signs || []);
        const start = controlSigns.filter(c => !c.end).map(c => '(' + c.short + ')').join(' ');
        const end = controlSigns.filter(c => !!c.end).map(c => '(' + c.short + ')').join(' ');
        const repeatStart = signs && signs.includes('{');
        const repeatEnd = signs && signs.includes('}');
        body = Sheet.makeArray(body);
        return snippet + `|${repeatStart ? ':' : ''}${house || ''} ${start ? start + ' ' : ''}${body ? body.join(' ') : ''}${end ? ' ' + end : ''}${repeatEnd ? ':' : ''}`;
      }, '');
    if (format) {
      return Snippet.format(snippet);
    }
    return Snippet.minify(snippet);
  }

  static expand(snippet, options?) {
    return Snippet.from(Snippet.render(snippet, options));
  }

  static obfuscate(snippet: string, keepFirst = true, format = true) {
    const chords = Snippet.parse(snippet);
    return Snippet.from(Sheet.obfuscate(chords, keepFirst), format);
  }
}
