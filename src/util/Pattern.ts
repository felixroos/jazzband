import { Scale } from 'tonal';
import { util } from '..';
import { Harmony } from '../harmony/Harmony';
import { Note } from 'tonal';

export class Pattern {
  static traverse(size, step, offset = 0) {
    let order = [];
    let i = offset;
    while (!order.includes(i)) {
      // while (order.length < max + offset) {
      order.push(i);
      // i = i + step;
      i = (i + step) % size;
    }
    return order;
  }
  static traverseArray(array, move, start = 0) {
    return this.traverse(array.length, move, start).map(i => array[i]);
  }

  // index starts with 1
  static getPositions(positions, array) {
    return positions.map(p => array[(p - 1) % array.length]);
  }

  // index starts with 0
  /* static nestIndices(parent, child) {
    return parent.map(i => child.map(p => p + i));
  } */

  static flat(array: any[]) {
    return array.reduce((flat, item) => {
      if (Array.isArray(item)) {
        flat = flat.concat(this.flat(item));
      } else {
        flat.push(item);
      }
      return flat;
    }, []);
  }

  // index starts with 0
  static nestIndices(...patterns) {
    let parent = patterns[0];
    const children = patterns.slice(1);
    if (children.length === 0) {
      return parent;
    }
    parent = this.flat(parent).map(i => children[0].map(p => {
      if (isNaN(p) || isNaN(i)) {
        return p + ' ' + i;
      }
      return p + i;
    }));
    children.shift();
    return this.nestIndices(parent, ...children);
  }

  static getNested(array, parent, child) {
    return parent.map(i => this.getPositions(child.map(p => p + i - 1), array));
  }

  static deepNest(array, tree) {
    const nested = this.getNested(array, tree[0], tree[1]);
  }

  static traverseNested(array, pattern, move = 1, start = 0) {
    const traversed = this.traverse(array.length, move, start);
    return this.getNested(array, traversed.map(p => p + 1), pattern);
  }

  static testFormat(nestedNotes: string[][]) {
    return nestedNotes.map(e => e.join(' ')).join(' ');
  }

  static scale(scaleName, pattern = [1], range?) {
    // get pitch classes of scale
    const scaleNotes = Scale.notes(scaleName);
    let scale;
    // use pitch classes when no range is given
    if (!range) {
      scale = scaleNotes;
    } else {
      // get all absolute notes inside range
      scale = util
        .noteArray(range)
        .map(n => {
          const pc = scaleNotes.find(s => Harmony.hasSamePitch(n, s));
          if (pc) {
            return n;
          }
        })
        .filter(n => !!n);
    }
    // find out index of scale tonic
    const firstTonic = scale.find(n => Note.pc(n) === scaleNotes[0]);
    const offset = scale.indexOf(firstTonic) - 1; // -1 for non zero starting indices...
    // add offset to pattern
    pattern = pattern
      .map(n => n + offset)
      .map(n => {
        return n >= scale.length ? n - scaleNotes.length : n;
      });
    return pattern.map(n => Note.simplify(scale[n]));
  }

  static render(scaleName, patterns, range = ['G3', 'G5']) {
    const scaleNotes = Scale.notes(scaleName);
    const scale = util
      .noteArray(range)
      .map(n => {
        const pc = scaleNotes.find(s => Harmony.hasSamePitch(n, s));
        if (pc) {
          return n;
          /* console.log('pc', pc, n, Note.oct(n));
          return pc + Note.oct(n); */
        }
      })
      .filter(n => !!n);
    const firstTonic = scale.find(n => Note.pc(n) === scaleNotes[0]);
    const start = scale.indexOf(firstTonic);
    patterns.unshift([start]);

    const nested = this.nestIndices(...patterns).map(p => {
      if (p.find(i => i >= scale.length)) {
        return p.map(n => n - scaleNotes.length);
      }
      return p;
    });
    return this.flat(nested).map(n => ({
      note: Note.simplify(scale[n]),
      index: n
    }));
  }
}
