import { Measure } from './Measure';

export interface NestedRhythm<T> extends Array<T | NestedRhythm<T>> { }

export type RhythmEvent<T> = {
  path: number[];
  divisions?: number[];
  value: T/*  | NestedRhythm<T> */;
}

export interface TimedEvent<T> extends RhythmEvent<T> {
  time: number;
  duration: number;
}

export type EventMapFn<T> = (event: RhythmEvent<T>) => TimedEvent<T>;

export class Rhythm {

  static from<T>(body: T | NestedRhythm<T>): NestedRhythm<T> {
    if (!Array.isArray(body)) {
      return [body];
    }
    return body;
  }

  static duration(divisions: number[], whole = 1) {
    return divisions.reduce((f, d) => f / d, whole);
  }

  static time(divisions: number[], path, whole = 1) {
    return divisions.reduce(
      ({ f, p }, d, i) => ({ f: f / d, p: p + (f / d) * path[i] }),
      { f: whole, p: 0 }
    ).p;
  }

  static addPaths(
    a: number[],
    b: number[]
  ) {
    [a, b] = [a, b].sort((a, b) => b.length - a.length);
    return a.map((n, i) => n + (b[i] || 0));
  }

  static calculate<T>(length = 1): EventMapFn<T> {
    return ({ path, divisions, value }) => {
      return {
        value,
        path,
        divisions,
        time: Rhythm.time(divisions, path, length),
        duration: Rhythm.duration(divisions, length)
      };
    }
  }

  static useValueAsDuration(event: TimedEvent<number>): TimedEvent<number> {
    return {
      ...event,
      duration: event.duration * event.value
    };
  }

  static render<T>(rhythm: NestedRhythm<T>, length = 1): TimedEvent<T>[] {
    return Rhythm.flatten(rhythm)
      .map(Rhythm.calculate(length))
      .filter(event => !!event.duration)
  }


  static spm(bpm, pulse) {
    return 60 / bpm * pulse;
  }

  /** Flattens the given possibly nested tree array to an array containing all values in sequential order. 
   * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
  static flatten<T>(tree: NestedRhythm<T>, path: number[] = [], divisions: number[] = []): RhythmEvent<T>[] {
    if (!Array.isArray(tree)) { // is primitive value
      return [{
        path,
        divisions,
        value: tree
      }];
    }
    return tree.reduce(
      (flat: RhythmEvent<T>[], item: NestedRhythm<T>, index: number): RhythmEvent<T>[] =>
        flat.concat(
          Rhythm.flatten(item, path.concat([index]), divisions.concat([tree.length]))
        ), []);
  }

  static isValid<T>(items: RhythmEvent<T>[]) {
    return items.reduce((valid, item) => {
      return valid &&
        item.divisions && item.path &&
        item.divisions.length === item.path.length
    }, true);
  }

  static nest<T>(items: RhythmEvent<T>[], fill: any = 0): NestedRhythm<T> {
    return items.reduce((nested, item) => {
      if (nested.length && nested.length !== item.divisions[0]) {
        console.error('ivalid flat rhythm: different divisions on same level', items, nested);
        return nested;
      }
      if (item.path.length !== item.divisions.length) {
        console.error('invliad flat rhythm: different length of path / divisions', item);
        return nested;
      }
      if (!nested.length && item.divisions[0]) {
        nested = new Array(item.divisions[0]).fill(fill);
      }
      if (item.path.length === 1) {
        if (Math.round(item.path[0]) === item.path[0]) {
          nested[item.path[0]] = item.value;
        } else if (item.value !== fill) {
          console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item)
        }
      } else {
        nested[item.path[0]] = Rhythm.nest(
          items
            .filter(i => i.path.length > 1 && i.path[0] === item.path[0])
            .map(i => ({ ...i, path: i.path.slice(1), divisions: i.divisions.slice(1) })),
          fill
        )
      }
      return nested;
    }, [])

  }
  /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten. */
  static expand<T>(items: RhythmEvent<T>[]): NestedRhythm<T> {
    let lastSiblingIndex = -1;
    return items.reduce((expanded, item, index) => {
      if (item.path.length === 1) {
        expanded[item.path[0]] = item.value;
      } else if (item.path[0] > lastSiblingIndex) {
        lastSiblingIndex = item.path[0];
        const siblings = items
          .filter((i, j) => j >= index && i.path.length >= item.path.length)
          .map(i => ({ ...i, path: i.path.slice(1) }));
        expanded[item.path[0]] = Rhythm.expand(siblings)
      }
      return expanded;
    }, []);
  }

  static pathOf(value, tree): number[] | undefined {
    const flat = Rhythm.flatten(tree);
    const match = flat.find(v => v.value === value);
    if (match) {
      return match.path;
    }
  }

  static simplePath(path) {
    return path.join('.').replace(/(\.0)*$/, ''); //.split('.');
  }

  static haveSamePath(a: RhythmEvent<any>, b: RhythmEvent<any>) {
    return Rhythm.simplePath(a.path) === Rhythm.simplePath(b.path);
  }


  static getPath<T>(tree, path, withPath = false, flat?: RhythmEvent<T>[]): any | RhythmEvent<T> {
    if (typeof path === 'number') {
      path = [path];
    }
    flat = flat || Rhythm.flatten(tree);
    const match = flat.find(v => {
      const min = Math.min(path.length, v.path.length);
      return v.path.slice(0, min).join(',') === path.slice(0, min).join(',')
    });
    if (withPath) {
      return match;
    }
    return match ? match.value : undefined;
  }

  static nextItem<T>(tree, path, move = 1, withPath = false, flat?: RhythmEvent<T>[]): any | RhythmEvent<T> {
    flat = Rhythm.flatten(tree);
    const match = Rhythm.getPath(tree, path, true, flat);
    if (match) {
      let index = (flat.indexOf(match) + move + flat.length) % flat.length;
      if (withPath) {
        return flat[index];
      }
      return flat[index] ? flat[index].value : undefined;
    }
  }

  static nextValue(tree, value, move = 1): any | undefined {
    const flat = Rhythm.flatten(tree);
    const match = flat.find(v => v.value === value);
    if (match) {
      return Rhythm.nextItem(tree, match.path, move, false, flat)
    }
  }

  static nextPath(tree, path?, move = 1): any | undefined {
    const flat = Rhythm.flatten(tree);
    if (!path) {
      return flat[0] ? flat[0].path : undefined;
    }
    const match = Rhythm.getPath(tree, path, true, flat);
    if (match) {
      const next = Rhythm.nextItem(tree, match.path, move, true, flat);
      return next ? next.path : undefined;
    }
  }

  static getBlock(length, position, pulse = 4): NestedRhythm<number> {
    const blocks = {
      4: [4], // or any other 4 block
      2: position === 0 ? [2, 0] : [0, 2] // or any other 2 block
      /** ... */
    }
    Array(position).fill(0).concat(blocks[length]).concat(Array(pulse - position - length).fill(0));
    return blocks[length];
  }

  addGroove(items: string[], pulse = 4): { [item: string]: NestedRhythm<number> } {
    const chordsPerBeat = pulse / items.length;
    if (chordsPerBeat < 0) {
      // need another grid... or just error??
    }
    if (Math.round(chordsPerBeat) !== chordsPerBeat) {
      // apply bjorklund to fill chords evenly
    }
    const rendered = Rhythm.render(items, pulse);
    let time = 0;
    return rendered.reduce((combined, chordEvent: TimedEvent<string>, index) => {
      // const time = rendered.slice(0, index + 1).reduce((sum, track) => sum + track.duration, 0);
      combined = {
        ...combined,
        [chordEvent.value]: Rhythm.getBlock(chordEvent.duration, time),
      }
      time += chordEvent.duration;
      return combined;
    }, {});
  }

  static multiplyDivisions(divisions: number[], factor: number): number[] {
    return [divisions[0] * factor].concat(divisions.slice(1));
  }

  static multiplyPath(path: number[], divisions: number[], factor: number): number[] {
    path = path.map(v => factor * v);
    /* path = path.map(v => {
      const r = v * factor;
      if (Math.round(r) !== r) {
        return v;
      }
      return r;
    }); */
    for (let i = path.length - 1; i > 0; --i) {
      if (path[i] >= divisions[i]) {
        const rest = Math.floor(path[i] / divisions[i]);
        path[i] = path[i] % divisions[i];
        path[i - 1] += rest;
        // todo what happens if rest is too much for path[i-1]
      }
    }
    return path;
  }

  static multiplyEvents(rhythm: RhythmEvent<number>[], factor: number): RhythmEvent<number>[] {
    return rhythm.map(({ value, path, divisions }) => ({
      value: value * factor,
      divisions: Rhythm.multiplyDivisions(divisions, factor),
      path: Rhythm.multiplyPath(path, divisions, factor)
    }));
  }

  static divideEvents(rhythm: RhythmEvent<number>[], factor: number): RhythmEvent<number>[] {
    return Rhythm.multiplyEvents(rhythm, 1 / factor);
  }

  static multiply(rhythm: NestedRhythm<number>, factor: number): NestedRhythm<number> {
    return Rhythm.nest(
      Rhythm.multiplyEvents(
        Rhythm.render(rhythm), factor
      )
    );
  }

  static divide(rhythm: NestedRhythm<number>, divisor: number) {
    return Rhythm.multiply(rhythm, 1 / divisor);
  }
}