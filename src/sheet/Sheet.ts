import { Measure, MeasureOrString, RenderedMeasure } from './Measure';
import { Harmony } from '../harmony/Harmony';
import { randomElement, maxArray, avgArray, humanize, isOffbeat } from '../util/util';
import { Voicing, VoiceLeadingOptions } from '../harmony/Voicing';
import { Distance } from 'tonal';
import { Note } from 'tonal';
import { Interval } from 'tonal';
import { Logger } from '../util/Logger';
import { SequenceOptions, SequenceEvent } from './Sequence';

export type Measures = Array<MeasureOrString>;

export type Leadsheet = {
  name?: string,
  composer?: string,
  style?: string,
  bpm?: number,
  repeats?: number,
  key?: string,
  measures?: Measures,
  chords?: Measures,
  melody?: Measures,
  renderedChords?: SequenceEvent[];
  renderedMelody?: SequenceEvent[];
  options?: SequenceOptions
}

export type JumpSign = {
  pair?: string,
  move?: number,
  fine?: boolean,
  validator?: (state) => boolean,
}

export type SheetState = {
  measures?: RenderedMeasure[],
  index?: number,
  sheet?: Measures,
  jumps?: { [key: number]: number },
  visits?: { [key: number]: number },
  nested?: boolean,
  fallbackToZero?: boolean,
  forms?: number;
  totalForms?: number; // the inital value of forms
  firstTime?: boolean; // flips to false after first chorus is complete
  lastTime?: boolean; // flips to true when last chorus starts
  property?: string; // to which measure property name the sheet should be rendered
}


export class Sheet implements Leadsheet {
  name?: string;
  composer?: string;
  style?: string;
  bpm?: number;
  repeats?: number;
  key?: string;
  measures?: Measures;
  chords?: Measures;
  melody?: Measures;
  voicings?: VoiceLeadingOptions;
  options?: SequenceOptions;

  static jumpSigns: { [sign: string]: JumpSign } = {
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

  constructor(sheet: Leadsheet) {
    Object.assign(this, Sheet.from(sheet));
  }

  static from(sheet: Leadsheet) {
    sheet.options = sheet.options || {};
    return {
      ...sheet,
      options: {
        forms: 1,
        arpeggio: false,
        bell: false,
        pedal: false,
        real: true,
        tightMelody: true,
        bpm: 120,
        swing: 0,
        fermataLength: 4,
        duckMeasures: 1,
        ...sheet.options,
        humanize: {
          velocity: 0.1,
          time: 0.002,
          duration: 0.002,
          ...(sheet.options.humanize || {})
        },
        voicings: {
          minBottomDistance: 3, // min semitones between the two bottom notes
          minTopDistance: 2, // min semitones between the two top notes
          logging: false,
          maxVoices: 4,
          range: ['C3', 'C6'],
          rangeBorders: [1, 1],
          maxDistance: 7,
          idleChance: 1,
          ...(sheet.options.voicings || {}),
        },
      },
    }
  }

  static render(sheet: MeasureOrString[], options: SheetState = {}): RenderedMeasure[] {
    let state: SheetState = {
      sheet,
      measures: [],
      forms: 1,
      property: 'chords',
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

  static nextMeasure(state: SheetState): SheetState {
    state = {
      ...state,
      ...Sheet.nextSection(state)
    } // moves to the right house (if any)
    let { sheet, index, measures, property } = state;
    state = {
      ...state,
      measures: measures.concat([Measure.render(state)]),
      ...Sheet.nextIndex(state),
    }
    return Sheet.nextForm(state);
  }

  static nextIndex(state): SheetState {
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

  static newForm(state): SheetState {
    return {
      ...state,
      index: 0,
      jumps: {},
      visits: {},
      lastTime: state.forms === 1,
    }
  }

  static nextForm(state, force = false): SheetState {
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
  static nextSection(state: SheetState): SheetState {
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
  static findPair(
    sheet,
    index: number,
    pairs: Array<(measure?: Measure, options?: { sheet?: Measures, index?: number }) => boolean>,
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

  static findMatch(
    sheet,
    index: number,
    find: (measure?: Measure, options?: { sheet?: Measures, index?: number }) => boolean,
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
  static getJumpDestination(state: SheetState): number {
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
  static getBracePair(
    { sheet, index, fallbackToZero }: { sheet: Measures, index: number, fallbackToZero?: boolean }
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

  static readyForFineOrCoda({ sheet, index, jumps, lastTime }: SheetState, move = 1): boolean {
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


  static shouldJump({ sheet, index, jumps, lastTime }: SheetState) {
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

  static transpose(sheet: Leadsheet, interval) {
    if (sheet.chords) {
      sheet = {
        ...sheet,
        chords: sheet.chords
          .map(measure => Measure.from(measure).chords
            .map(chord => Harmony.transposeChord(chord, interval)))
      }
    }
    if (sheet.melody) {
      console.log('TODO: tranpose melody');
    }
    return sheet;
  }


  /** Flattens the given possibly nested tree array to an array containing all values in sequential order. 
   * If withPath is set to true, the values are turned to objects containing the nested path (FlatEvent).
   * You can then turn FlatEvent[] back to the original nested array with Measure.expand. */
  static flatten(tree: any[] | any, withPath = false, path: number[] = [], divisions: number[] = []): SequenceEvent[] {
    if (!Array.isArray(tree)) { // is primitive value
      if (withPath) {
        return [{
          path,
          divisions,
          value: tree
        }];
      }
      return [tree];
    }
    return tree.reduce(
      (flat: (any | SequenceEvent)[], item: any[] | any, index: number): (any | SequenceEvent)[] =>
        flat.concat(
          Sheet.flatten(item, withPath, path.concat([index]), divisions.concat([tree.length]))
        ), []);
  }

  /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten (using withPath=true). */
  static expand(items: SequenceEvent[]): any[] {
    let lastSiblingIndex = -1;
    return items.reduce((expanded, item, index) => {
      if (item.path.length === 1) {
        expanded[item.path[0]] = item.value;
      } else if (item.path[0] > lastSiblingIndex) {
        lastSiblingIndex = item.path[0];
        const siblings = items
          .filter((i, j) => j >= index && i.path.length >= item.path.length)
          .map(i => ({ ...i, path: i.path.slice(1) }));
        expanded[item.path[0]] = Sheet.expand(siblings)
        /* expanded.push(Measure.expand(siblings)); */
      }
      return expanded;
    }, []);
  }

  static pathOf(value, tree): number[] | undefined {
    const flat = Sheet.flatten(tree, true);
    const match = flat.find(v => v.value === value);
    if (match) {
      return match.path;
    }
  }

  static getPath(tree, path, withPath = false, flat?: SequenceEvent[]): any | SequenceEvent {
    if (typeof path === 'number') {
      path = [path];
    }
    flat = flat || Sheet.flatten(tree, true);
    const match = flat.find(v => {
      const min = Math.min(path.length, v.path.length);
      return v.path.slice(0, min).join(',') === path.slice(0, min).join(',')
    });
    if (withPath) {
      return match;
    }
    return match ? match.value : undefined;
  }

  static nextItem(tree, path, move = 1, withPath = false, flat?: SequenceEvent[]): any | SequenceEvent {
    flat = Sheet.flatten(tree, true);
    const match = Sheet.getPath(tree, path, true, flat);
    if (match) {
      let index = (flat.indexOf(match) + move + flat.length) % flat.length;
      if (withPath) {
        return flat[index];
      }
      return flat[index] ? flat[index].value : undefined;
    }
  }

  static nextValue(tree, value, move = 1): any | undefined {
    const flat = Sheet.flatten(tree, true);
    const match = flat.find(v => v.value === value);
    if (match) {
      return Sheet.nextItem(tree, match.path, move, false, flat)
    }
  }

  static nextPath(tree, path?, move = 1): any | undefined {
    const flat = Sheet.flatten(tree, true);
    if (!path) {
      return flat[0] ? flat[0].path : undefined;
    }
    const match = Sheet.getPath(tree, path, true, flat);
    if (match) {
      const next = Sheet.nextItem(tree, match.path, move, true, flat);
      return next ? next.path : undefined;
    }
  }

  static randomItem(tree) {
    const flat = Sheet.flatten(tree, true);
    return randomElement(flat);
  }

  static stringify(measures: MeasureOrString[], property = 'chords'): string | any[] {
    return measures.map(measure => (Measure.from(measure)[property]));
  }

  static obfuscate(measures: Measures, keepFirst = true): Measure[] {
    return measures
      .map(m => Measure.from(m, 'chords'))
      .map((m, i) => {
        m.chords = m.chords.map((c, j) => {
          if (keepFirst && i === 0 && j === 0) {
            return c;
          }
          return c.replace(/([A-G1-9a-z#b\-\^+])/g, '?');
        })
        return m;
      });
  }
}
