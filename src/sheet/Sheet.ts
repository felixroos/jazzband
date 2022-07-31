import { Measure, RenderedMeasure, Measures } from './Measure';

export type JumpSign<T> = {
  pair?: string,
  move?: number,
  fine?: boolean,
  validator?: (state: SheetState<T>) => boolean,
}

export type SheetState<T> = {
  measures?: RenderedMeasure<T>[],
  index?: number,
  sheet?: Measures<T>,
  jumps?: { [key: number]: number },
  visits?: { [key: number]: number },
  nested?: boolean,
  fallbackToZero?: boolean,
  forms?: number;
  totalForms?: number; // the inital value of forms
  firstTime?: boolean; // flips to false after first chorus is complete
  lastTime?: boolean; // flips to true when last chorus starts
}

export class Sheet {
  static jumpSigns: { [sign: string]: JumpSign<any> } = {
    '}': { pair: '{', move: -1 },
    'DC': {},
    'DS': { pair: 'Segno', move: -1 },
    'DS.Fine': { pair: 'Segno', move: -1 },
    'DS.Coda': { pair: 'Segno', move: -1 },
    'DC.Fine': {},
    'DC.Coda': {},
    'Fine': {
      fine: true,
      validator: (state) => Sheet.readyForFineOrCoda(state)
    },
    'ToCoda': {
      pair: 'Coda', move: 1,
      validator: (state) => Sheet.readyForFineOrCoda(state)
    }
  };

  static sequenceSigns = {
    rest: ['r', '0'],
    prolong: ['/', '-', '_'],
    repeat: ['%']
  }

  static render<T>(sheet: Measures<T>, options: SheetState<T> = {}): RenderedMeasure<T>[] {
    let state: SheetState<T> = {
      sheet,
      measures: [],
      forms: 1,
      nested: true,
      fallbackToZero: true,
      firstTime: true,
      ...options
    };
    state = {
      ...state,
      totalForms: state.forms,
      ...Sheet.newForm(state)
    };

    let runs = 0;
    while (runs < 1000 && state.index < sheet.length) {
      runs++;
      state = Sheet.nextMeasure(state);
    }
    return state.measures;
  }

  static nextMeasure<T>(state: SheetState<T>): SheetState<T> {
    state = {
      ...state,
      ...Sheet.nextSection(state)
    } // moves to the right house (if any)
    let { sheet, index, measures } = state;
    state = {
      ...state,
      measures: measures.concat([Measure.render(state)]),
      ...Sheet.nextIndex(state),
    }
    return Sheet.nextForm(state);
  }

  static nextIndex<T>(state): SheetState<T> {
    let { sheet, index, jumps, nested, fallbackToZero, lastTime } = state;
    if (!Sheet.shouldJump({ sheet, index, jumps, lastTime })) {
      return {
        index: index + 1
      };
    }
    const braces = [Sheet.getJumpDestination({ sheet, index, fallbackToZero, nested }), index];
    jumps = Sheet.wipeKeys(jumps, [braces[0], braces[1] - 1]); // wipes indices inside braces
    return {
      index: braces[0],
      jumps: { // count jumps up
        ...jumps,
        [braces[1]]: (jumps[braces[1]] || 0) + 1
      }
    }
  }

  static newForm<T>(state): SheetState<T> {
    return {
      ...state,
      index: 0,
      jumps: {},
      visits: {},
      lastTime: state.forms === 1,
    }
  }

  static nextForm<T>(state, force = false): SheetState<T> {
    let { sheet, index, forms } = state;
    if (force || (index >= sheet.length && forms > 1)) {
      return Sheet.newForm({
        ...state,
        firstTime: false,
        forms: forms - 1
      });
    }
    return state;
  }

  // moves the index to the current house (if any)
  static nextSection<T>(state: SheetState<T>): SheetState<T> {
    let { sheet, index, visits, firstTime, lastTime } = state;
    // skip intro when not firstTime
    if (!firstTime && Measure.from(sheet[index]).section === 'IN') {
      return {
        index: Sheet.getNextSectionIndex({ sheet, index }),
      }
    }
    // skip coda when not last time
    if (Measure.hasSign('Coda', sheet[index]) && !Sheet.readyForFineOrCoda(state, -1)) {
      return Sheet.nextForm(state, true);
    }
    if (!Measure.hasHouse(sheet[index], 1)) {
      return {};
    }
    let next = Sheet.getNextHouseIndex({ sheet, index, visits });
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
  /** Starts at a given index, stops when the pair functions returned equally often */
  static findPair<T>(
    sheet,
    index: number,
    pairs: Array<(measure?: Measure<T>, options?: { sheet?: Measures<T>, index?: number }) => boolean>,
    move = 1,
    stack = 0): number {
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

  static findMatch<T>(
    sheet,
    index: number,
    find: (measure?: Measure<T>, options?: { sheet?: Measures<T>, index?: number }) => boolean,
    move = 1): number {
    let match = -1; // start with no match
    while (match === -1 && index >= 0 && index < sheet.length) {
      if (find(sheet[index], { sheet, index })) {
        match = index;
      } else {
        index += move;
      }
    }
    return match;
  }

  // simple matching for brace start, ignores nested repeats
  static getJumpDestination<T>(state: SheetState<T>): number {
    let { sheet, index, fallbackToZero, nested } = state;
    const sign = Measure.getJumpSign(sheet[index]);
    // if fine > jump till end
    if (sign.fine) { return sheet.length; }
    // if no pair given => da capo
    if (!sign.pair) { return 0; }
    // if nested mode on and opening brace is searched, use getBracePair..
    if (nested !== false && sign.pair === '{') {
      return Sheet.getBracePair({ sheet, index, fallbackToZero });
    }
    const destination = Sheet.findMatch(sheet, index,
      (m) => Measure.hasSign(sign.pair, m),
      sign.move || -1); // default move back
    if (fallbackToZero) {
      // default to zero when searching repeat start (could be forgotten)
      return destination === -1 ? 0 : destination;
    }
    return destination;
  }

  // returns the index of the repeat sign that pairs with the given index
  static getBracePair<T>(
    { sheet, index, fallbackToZero }: { sheet: Measures<T>, index: number, fallbackToZero?: boolean }
  ): number {
    if (fallbackToZero === undefined) {
      fallbackToZero = true;
    }
    if (Measure.hasSign('{', sheet[index])) {
      return Sheet.findPair(sheet, index,
        [
          (m) => Measure.hasSign('{', m),
          (m) => Measure.hasSign('}', m),
        ]
        , 1);
    } else if (Measure.hasSign('}', sheet[index])) {
      const pair = Sheet.findPair(sheet, index,
        [
          (m, state) => {
            // this logic could be infinitely complex, having many side effects and interpretations
            // the current behaviour is similar to musescore or ireal handling braces
            if (!Measure.hasSign('}', m)) {
              return false;
            }
            if (index === state.index) {
              return true;
            }
            const relatedHouse = Sheet.getRelatedHouse({ sheet, index: state.index });
            return relatedHouse === -1;
          },
          (m) => Measure.hasSign('{', m)
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
  static canVisitHouse({ sheet, index, visits }): boolean {
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
  static getNextHouseIndex({ sheet, index, visits }, move = 1): number {
    return Sheet.findMatch(sheet, index,
      (m, step) => Measure.hasHouse(m) && Sheet.canVisitHouse({ sheet, index: step.index, visits })
      , move);
  }

  static getNextSectionIndex({ sheet, index }, move = 1): number {
    return Sheet.findMatch(sheet, index + 1,
      (m) => Measure.from(m).section !== undefined, 1);
  }

  // wipes all keys in the given range
  static wipeKeys(numberMap, range): { [key: number]: number } {
    const wiped = {};
    Object.keys(numberMap)
      .map(i => parseInt(i))
      .filter(i => i < range[0] || i > range[1])
      .forEach(i => wiped[i] = numberMap[i]);
    return wiped;
  }

  static getRelatedHouse({ sheet, index }): number {
    const latestHouse = Sheet.findPair(sheet, index,
      [
        (m, state) => index === state.index || Measure.hasSign('}', m),
        (m) => Measure.hasHouse(m)
      ], -1);
    return latestHouse;
  }

  static isFirstHouse({ sheet, index }): boolean {
    return Measure.hasHouse(sheet[index], 1);
  }

  static getAllowedJumps({ sheet, index }) {
    if (!Measure.hasJumpSign(sheet[index])) {
      return 0;
    }
    const measure = Measure.from(sheet[index]);
    if (measure.times !== undefined) {
      return measure.times;
    }
    return 1;
  }

  static readyForFineOrCoda<T>({ sheet, index, jumps, lastTime }: SheetState<T>, move = 1): boolean {
    const signs = Object.keys(Sheet.jumpSigns)
      .filter(s => s.includes('DC') || s.includes('DS'));
    const backJump = Sheet.findMatch(sheet, index,
      (m) => signs.reduce((match, sign) => match || Measure.hasSign(sign, m), false), move
    );
    if (backJump === -1) {
      return lastTime; // last time
    }
    return jumps[backJump] > 0;
  }


  static shouldJump<T>({ sheet, index, jumps, lastTime }: SheetState<T>) {
    if (!Measure.hasJumpSign(sheet[index])) {
      return false;
    }
    const sign = Measure.getJumpSign(sheet[index]);
    if (sign.validator && !sign.validator({ sheet, index, jumps, lastTime })) {
      return false;
    }
    const allowedJumps = Sheet.getAllowedJumps({ sheet, index });
    const timesJumped = jumps[index] || 0;
    return timesJumped < allowedJumps;
  }

  static stringify<T>(measures: Measures<T>): string | any[] {
    return measures.map(measure => (Measure.from(measure).body));
  }

  // temporarily borrowed from rhythmical > Rhythm.from to avoid dependency
  static makeArray<T>(body: T | T[]) {
    if (!Array.isArray(body)) {
      return [body];
    }
    return body;
  }

  static obfuscate(measures: Measures<string>, keepFirst = true): Measure<string>[] {
    return measures
      .map(m => Measure.from(m))
      .map((m, i) => {
        m.body = Sheet.makeArray(m.body).map((c, j) => {
          if (keepFirst && i === 0 && j === 0) {
            return c;
          }
          if (typeof c !== 'string') {
            console.warn('Sheet.obfuscate does not support nested Rhythms (yet)');
            return ''
          }
          return c.replace(/([A-G1-9a-z#b\-\^+])/g, '?');
        })
        return m;
      });
  }



}
