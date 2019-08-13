import { Fraction, Fractions } from './Fractions';

export interface NestedRhythm<T> extends Array<T | NestedRhythm<T>> { }

export type RhythmEvent<T> = {
  path: number[];
  divisions?: number[];
  value: T/*  | NestedRhythm<T> */;
}

export type RhythmBrick = {
  body: NestedRhythm<number>;
  offset?: number;
}

export type EventPath = Fraction[];
export type FlatEvent<T> = {
  value: T,
  path: EventPath,
  length?: number
}


export interface TimedEvent<T> extends FlatEvent<T> {
  time: number;
  duration: number;
}

export type EventMapFn<T> = (event: FlatEvent<T>) => TimedEvent<T>;

export class Rhythm {

  static from<T>(body: T | NestedRhythm<T>): NestedRhythm<T> {
    if (!Array.isArray(body)) {
      return [body];
    }
    return body;
  }

  static duration(path: EventPath, whole = 1) {
    return path.reduce((f, p) => f / p[1], whole);
  }

  static time(path: EventPath, whole = 1) {
    return path.reduce(
      ({ f, t }, p, i) => ({ f: f / p[1], t: t + (f / p[1]) * path[i][0] }),
      { f: whole, t: 0 }
    ).t;
  }

  static oldDuration(divisions: number[], whole = 1) {
    return divisions.reduce((f, d) => f / d, whole);
  }

  static oldTime(divisions: number[], path, whole = 1) {
    return divisions.reduce(
      ({ f, p }, d, i) => ({ f: f / d, p: p + (f / d) * path[i] }),
      { f: whole, p: 0 }
    ).p;
  }


  static addPaths(
    a: number[],
    b: number[],
    divisions?: number[]
  ) {
    // console.warn('addPaths is deprecated');
    [a, b] = [a, b].sort((a, b) => b.length - a.length);
    const added = a.map((n, i) => n + (b[i] || 0));
    if (!divisions) {
      return added;
    }
    return Rhythm.overflow(added, divisions);
  }

  /** recalculates path inside given divisions */
  static overflow(path: number[], divisions: number[]) {
    path = [].concat(path);
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

  static calculate<T>(totalLength = 1): EventMapFn<T> {
    return ({ path, value, length }) => {
      if (typeof value === 'number') {
        length = value;
      } else {
        length = 1;
      }
      return {
        value,
        path,
        time: Rhythm.time(path, totalLength),
        duration: Rhythm.duration(path, totalLength) * length
      };
    }
  }

  static useValueAsDuration(event: TimedEvent<number>): TimedEvent<number> {
    return {
      ...event,
      duration: event.duration * event.value
    };
  }

  static useValueAsLength(event: FlatEvent<number>): FlatEvent<number> {
    return {
      ...event,
      length: event.value
    };
  }

  static render<T>(rhythm: NestedRhythm<T>, length = 1, useValueAsLength = false): TimedEvent<T>[] {
    return Rhythm.flat(rhythm)
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
      if (item.path[0] >= item.divisions[0]) {
        console.error(`invalid path ${item.path[0]} in divisions ${item.divisions[0]} on item`, item);
        return nested;
      }
      if (item.path.length !== item.divisions.length) {
        console.error('invalid flat rhythm: different length of path / divisions', item);
        return nested;
      }
      if (nested.length && nested.length < item.divisions[0]) {
        console.error('ivalid flat rhythm: different divisions on same level > concat', items, nested);
        nested = nested.concat(Array(item.divisions[0] - nested.length).fill(fill));
        /* return nested; */
      }
      if (nested.length && nested.length > item.divisions[0]) {
        console.warn('flat rhythm: different divisions on same level', items, nested);
      }
      if (!nested.length && item.divisions[0]) {
        nested = new Array(item.divisions[0]).fill(fill);
      }
      if (item.path.length === 1) {
        /* if (expanded[item.path[0]] !== undefined) {
          if (!!expanded[item.path[0]]) {
            return expanded; // dont override if already not 0
          }
          console.warn('override path ', item.path[0], ':', expanded[item.path[0]], 'with', item.value);
        } */
        if (Math.round(item.path[0]) === item.path[0]) {
          nested[item.path[0]] = item.value;
        } else if (item.value !== fill) {
          // console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item)
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
    console.warn('expand is deprecated');
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

  static haveSameSlot(a: RhythmEvent<any>, b: RhythmEvent<any>) {
    return Rhythm.simplePath(a.path) === Rhythm.simplePath(b.path) &&
      Rhythm.simplePath(a.divisions) === Rhythm.simplePath(b.divisions)
    //a.divisions.length === b.divisions.length
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

  static addPulse<T>(rhythm: NestedRhythm<T>, pulse: number, offset: number = 0): NestedRhythm<T> {
    const measures = Math.ceil(rhythm.length / pulse);
    return Rhythm.nest(
      Rhythm.flatten(rhythm).map(({ value, divisions, path }) => {
        divisions = [measures].concat([pulse], divisions.slice(1));
        path = [Math.floor(path[0] / pulse)].concat([path[0] % pulse], path.slice(1));
        path = offset ? Rhythm.addPaths(path, [0, offset], divisions) : path;
        return {
          value,
          divisions,
          path
        }
      })
    );
  }

  /* static addPulses<T>(rhythm: NestedRhythm<T>, pulses: number[], offset: number = 0): NestedRhythm<T> {
    return Rhythm.nest(
      Rhythm.flatten(rhythm).map(({ value, divisions, path }) => {
        // const pulse = divisions[1] || 1;
        const pulse = path[0]
        const measures = Math.ceil(rhythm.length / pulse);
        divisions = [measures].concat([pulse], divisions.slice(1));
        path = [Math.floor(path[0] / pulse)].concat([path[0] % pulse], path.slice(1));
        path = offset ? Rhythm.addPaths(path, [0, offset], divisions) : path;
        return {
          value,
          divisions,
          path
        }
      })
    );
  } */

  static removePulse<T>(rhythm: NestedRhythm<T>): NestedRhythm<T> {
    return Rhythm.nest(
      Rhythm.flatten(rhythm).map(({ value, divisions, path }) => ({
        value,
        divisions: [divisions[1] * divisions[0]].concat(divisions.slice(2)),
        path: [path[0] * divisions[1] + path[1]].concat(path.slice(2))
      }))
    );
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


  /**
   * NEW SYNTAX
   */



  static multiplyDivisions(divisions: number[], factor: number): number[] {
    return [divisions[0] * factor].concat(divisions.slice(1));
  }

  static multiplyPath(path: number[], divisions: number[], factor: number): number[] {
    path = path.map(v => factor * v);
    return Rhythm.overflow(path, divisions);
  }

  static multiplyEvents(rhythm: FlatEvent<number>[], factor: number): FlatEvent<number>[] {
    return Rhythm.fixTopLevel(rhythm
      .map(({ value, path }) => ({
        value: value * factor,
        path:
          Rhythm.carry(
            path.map((f, i) => [
              f[0] * factor,
              f[1] * (!i ? factor : 1)
              // f[1] * factor
              // f[1]
            ])
          )
      })));
  }

  static divideEvents(rhythm: FlatEvent<number>[], factor: number): FlatEvent<number>[] {
    return Rhythm.multiplyEvents(rhythm, 1 / factor);
  }

  static multiply(rhythm: NestedRhythm<number>, factor: number): NestedRhythm<number> {
    return Rhythm.nested(
      Rhythm.multiplyEvents(
        Rhythm.flat(rhythm), factor
      )
    );
  }

  static divide(rhythm: NestedRhythm<number>, divisor: number) {
    return Rhythm.multiply(rhythm, 1 / divisor);
  }


  static maxArray(array) {
    if (!array || !array.length) {
      return;
    }
    return array.reduce((max, item) => Math.max(max, item), array[0]);
  }

  /** Flattens the given possibly nested tree array to an array containing all values in sequential order. 
   * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
  static flat<T>(rhythm: NestedRhythm<T>, path: EventPath = []): Array<FlatEvent<T>> {
    return rhythm.reduce(
      (flat: Array<FlatEvent<T>>, item: NestedRhythm<T> | T, index: number): Array<FlatEvent<T>> => {
        if (!Array.isArray(item)) {
          return flat.concat([{
            value: item,
            path: path.concat([[index, rhythm.length]]),
          }])
        }
        return flat.concat(
          Rhythm.flat(item, path.concat([[index, rhythm.length]]))
        )
      }, []);
  }

  static nested<T>(items: FlatEvent<T>[], fill: any = 0): NestedRhythm<T> {
    return items.reduce((nested, item) => {
      if (item.path[0][0] >= item.path[0][1]) {
        console.error(`invalid path ${item.path[0]} on item`, item);
        return nested;
      }
      if (nested.length && nested.length < item.path[0][1]) {
        console.warn('ivalid flat rhythm: different divisions on same level > concat', items, nested);
        nested = nested.concat(Array(item.path[0][1] - nested.length).fill(fill));
        /* return nested; */
      }
      if (nested.length && nested.length > item.path[0][1]) {
        console.warn('flat rhythm: different divisions on same level', items, nested);
      }
      if (!nested.length && item.path[0][1]) {
        nested = new Array(item.path[0][1]).fill(fill);
      }
      if (item.path.length === 1) {
        if (Math.round(item.path[0][0]) === item.path[0][0]) {
          nested[item.path[0][0]] = item.value;
        } else if (item.value !== fill) {
          console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item)
        }
      } else {
        nested[item.path[0][0]] = Rhythm.nested(
          items
            .filter(i => i.path.length > 1 && i.path[0][0] === item.path[0][0])
            .map(i => ({ ...i, path: i.path.slice(1) })),
          fill
        )
      }
      return nested;
    }, [])

  }


  // aligns all paths to longest path length, filling each up with [0, 1]
  static align(...paths: EventPath[]): EventPath[] {
    return paths.map(p => p
      .concat(
        Array(
          Rhythm.maxArray(
            paths.map(p => p.length)
          ) - p.length
        ).fill([0, 1])
      )
    );
  }
  // carries all fractions that are >=1 over to the next fraction to mimic notated rhythm behaviour
  static carry(a: EventPath) {
    a = [].concat(a);
    for (let i = a.length - 1; i > 0; --i) {
      a[i - 1][0] += Math.floor(a[i][0] / a[i][1]);
      a[i][0] = a[i][0] % a[i][1];
    }
    a[0][1] = Math.max(a[0][0] + 1, a[0][1]);
    return a;
  }

  static add(a: EventPath, b: EventPath, cancel = false): EventPath {
    [a, b] = Rhythm.align(a, b);
    return Rhythm.carry(
      a.map((f, i) => Fractions.add(f, b[i], cancel))
    );
  }

  static fixTopLevel<T>(events: FlatEvent<T>[]): FlatEvent<T>[] {
    // find max divisor on top level
    const max: number = Rhythm.maxArray(events.map(e => e.path[0][1]));
    // use max divisor for all top levels
    return events.map(e => ({
      ...e,
      path: e.path.map((f, i) => !i ? [f[0], max] : f),
    }));
  }

  /* Makes sure the top level is correct on all events + adds optional path to move the events */
  static shiftEvents<T>(events: FlatEvent<T>[], path?: EventPath): FlatEvent<T>[] {
    if (path) {
      events = events.map(e => ({ ...e, path: Rhythm.add(e.path, path) }));
    }
    return Rhythm.fixTopLevel(events).filter(e => !!e.value);
  }

  static shift<T>(rhythm: NestedRhythm<T>, path: EventPath) {
    return Rhythm.nested(Rhythm.shiftEvents(Rhythm.flat(rhythm), path));
  }

  static groupEvents<T>(events: FlatEvent<T>[], pulse, offset?: number): FlatEvent<T>[] {
    let wrapped =
      events.map(({ value, path }) => {
        path = [].concat(
          [[Math.floor(path[0][0] / pulse), Math.ceil(path[0][1] / pulse)]],
          [[path[0][0] % pulse, pulse]],
          path.slice(1)
        );
        return {
          value,
          path
        }
      });
    if (offset) {
      wrapped = Rhythm.shiftEvents(wrapped, [[0, 1], [offset, pulse]]);
    }
    return wrapped;
  }

  static group<T>(rhythm: NestedRhythm<T>, pulse: number, offset?: number): NestedRhythm<T> {
    return Rhythm.nested(Rhythm.groupEvents(Rhythm.flat(rhythm), pulse, offset));
  }

  static ungroupEvents<T>(events: FlatEvent<T>[]): FlatEvent<T>[] {
    return events.map(({ value, path }) => ({
      value,
      path: [
        [
          path[0][0] * path[1][1] + path[1][0],
          path[1][1] * path[0][1]
        ]
      ]
        .concat(path.slice(2)),
    }));
  }


  static ungroup<T>(rhythm: NestedRhythm<T>) {
    return Rhythm.nested(Rhythm.ungroupEvents(Rhythm.flat(rhythm)));
  }

  static combine<T>(source: NestedRhythm<T>, target: NestedRhythm<T>): NestedRhythm<T> {
    let targetEvents = Rhythm.flat(target);
    let sourceEvents = Rhythm.flat(source);
    if (source.length > target.length) {
      targetEvents = Rhythm.shiftEvents(Rhythm.flat(target), [[0, source.length]]); // add empty bars
    } else if (target.length > source.length) {
      sourceEvents = Rhythm.shiftEvents(Rhythm.flat(source), [[0, target.length]]); // add empty bars
    }
    return Rhythm.nested(Rhythm.combineEvents(targetEvents, sourceEvents));
  }

  static combineEvents<T>(a: FlatEvent<T>[], b: FlatEvent<T>[]): FlatEvent<T>[] {
    return Rhythm.shiftEvents(
      [].concat(a, b).filter(e => !!e.value)
    );
  }

  static isEqualPath(a: EventPath, b: EventPath) {
    const paths = Rhythm.align(a, b).map(p => JSON.stringify(p));
    return paths[0] === paths[1];
  }

  static insertEvents<T>(sourceEvents: FlatEvent<T>[], targetEvents: FlatEvent<T>[], beat?: number) {
    const pulses = targetEvents.map(e => e.path[1] ? e.path[1][1] : 1);
    const beats = targetEvents[0].path[0][1] * pulses[0];
    if (beat === undefined) {
      beat = beats; // set to end if undefined
    } else if (beat < 0) {
      beat = beats + beat // subtract from end
    }
    // handle negative offset
    sourceEvents = Rhythm.groupEvents(sourceEvents, pulses[0], beat);
    return Rhythm.combineEvents(targetEvents, sourceEvents);
  }

  static insert<T>(source: NestedRhythm<T>, target: NestedRhythm<T>, beat?: number) {
    return Rhythm.nested(
      Rhythm.insertEvents(Rhythm.flat(source), Rhythm.flat(target), beat)
    );
  }

  static migratePath(divisions: number[], path?: number[]) {
    return divisions.map((d, index) => [path ? path[index] : 0, d]);
  }
}


/*


static normalize(a: RhythmEvent<number>, depth) {
  const diff = depth - a.path.length;
  if (diff > 0) { // gets longer
    return {
      value: a.value,
      path: a.path.concat(Array(diff).fill(0)),
      divisions: a.divisions.concat(Array(diff).fill(1)),
    }
  }
  // const divisions = a.divisions.slice(0, depth);
  return {
    value: a.value * Rhythm.duration(a.divisions),
    path: a.path.slice(0, depth),
    divisions: a.divisions.slice(0, depth)
  }
} */

/*

  static f<T>(source: NestedRhythm<T>, target: NestedRhythm<T>, offset = 0) {
    let targetEvents = Rhythm.flatten(target);
    const pulses = targetEvents.map(e => e.divisions[1] || 1);
    source = Rhythm.addPulse(source, pulses[0], offset);

    const targetLength = source.length;
    if (targetLength >= target.length) {
      const fill = targetLength - target.length;
      target = target.concat(Array(fill).fill(0));
    }
    targetEvents = Rhythm.flatten(target);
    const sourceEvents = Rhythm.flatten(source)
      .map(event => ({ ...event, divisions: [target.length].concat(event.divisions.slice(1)) }))
      .filter(event => !!event.value || !targetEvents.find(e => Rhythm.haveSameSlot(e, event)))
      .map(event => ({ ...event, path: Rhythm.overflow(event.path, event.divisions) }));
    return Rhythm.nest(targetEvents.concat(sourceEvents));
  }

  static merge<T>(source: NestedRhythm<T>, target: NestedRhythm<T>, path = [0]) {
    const targetLength = source.length + path[0];
    if (targetLength >= target.length) {
      const fill = targetLength - target.length;
      target = target.concat(Array(fill).fill(0));
    }
    const targetEvents = Rhythm.flatten(target);
    const sourceEvents = Rhythm.flatten(source)
      .map(event => ({ ...event, divisions: [target.length].concat(event.divisions.slice(1)) }))
      .filter(event => !!event.value || !targetEvents.find(e => Rhythm.haveSameSlot(e, event)))
      .map(event => ({ ...event, path: Rhythm.addPaths(path, event.path, event.divisions) }));

    return Rhythm.nest(targetEvents.concat(sourceEvents));
  }
  */