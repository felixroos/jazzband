import { Note } from 'tonal';
import { Chord } from 'tonal';
import { Interval } from 'tonal';
import { Distance } from 'tonal';
import { isPitchClass } from '../util/util';

export declare type intervalDirection = 'up' | 'down';
export declare type step = string | number;

export class Harmony {
  // mapping for ireal chords to tonal symbols, see getTonalChord
  static irealToTonal = {
    "^7": "M7",
    "7": "7",
    "-7": "m7",
    "h7": "m7b5",
    "7#9": "7#9",
    "7b9": "7b9",
    "^7#5": "M7#5",
    "": "",
    "6": "6",
    "9": "9",
    "-6": "m6",
    "o7": "o7",
    "h": "m7b5",
    "-^7": "mM7",
    "o": "o",
    "^9": "M9",
    "7#11": "7#11",
    "7#5": "7#5",
    "-": "m",
    "7sus": "7sus",
    "69": "M69",
    "7b13": "7b13",
    "^": "M",
    "+": "+",
    "7b9b5": "7b5b9",
    "-9": "m9",
    "9sus": "9sus",
    "7b9sus": "7b9sus",
    "7b9#5": "7#5b9",
    "13": "13",
    "^7#11": "M7#11",
    "-7b5": "m7b5",
    "^13": "M13",
    "7#9b5": "7b5#9",
    "-11": "m11",
    "11": "11",
    "7b5": "7b5",
    "9#5": "9#5",
    "13b9": "13b9",
    "9#11": "9#11",
    "13#11": "13#11",
    "-b6": "mb6",
    "7#9#5": "7#5#9",
    "-69": "m69",
    "13sus": "13sus",
    "^9#11": "M9#11",
    "7b9#9": "7b9#9",
    "sus": "sus",
    "7#9#11": "7#9#11",
    "7b9b13": "7b9b13",
    "7b9#11": "7b9#11",
    "13#9": "13#9",
    "9b5": "9b5",
    "-^9": "mM9",
    "2": "Madd9",
    "-#5": "m#5",
    "7+": "7#5",
    "7sus4": "7sus", // own addition
    "M69": "M69", // own addition
    // "5": "5",
    // "7b13sus": "7b13sus",
  };
  static pitchRegex = /^([A-G^][b|#]?)/;

  static isBlack(note) {
    return Note.props(note)['acc'] !== '';
  }

  static hasSamePitch(noteA: string, noteB: string, ignoreOctave = false) {
    if (ignoreOctave || isPitchClass(noteA) || isPitchClass(noteB)) {
      return Note.props(noteA).chroma === Note.props(noteB).chroma;
    }
    return Note.midi(noteA) === Note.midi(noteB);
  }

  static getTonalChord(chord: string) {
    if (!chord) {
      return null;
    }
    const root = Harmony.getBassNote(chord, true) || '';
    let symbol = chord.replace(root, '');
    symbol = symbol.split('/')[0]; // ignore slash
    // check if already a proper tonal chord
    if (!!Object.keys(Harmony.irealToTonal).find(i => Harmony.irealToTonal[i] === symbol)) {
      return root + symbol;
    }
    symbol = Harmony.irealToTonal[symbol];
    if (symbol === undefined) {
      return null;
    }
    return root + symbol;
  }

  static getBassNote(chord: string, ignoreSlash = false) {
    if (!chord) {
      return null;
    }
    if (!ignoreSlash && chord.includes('/')) {
      return chord.split('/')[1];
    }
    const match = chord.match(/^([A-G][b|#]?)/);
    if (!match || !match.length) {
      return '';
    }
    return match[0];
  }

  static transposeChord(chord, interval) {
    if (!chord) {
      return chord;
    }
    const tokens = Chord.tokenize(Harmony.getTonalChord(chord));
    let root = Distance.transpose(tokens[0], interval);
    root = Note.simplify(root);
    return root + tokens[1];
  }

  static getMidi(note, offset = 0) {
    return Note.midi(note) - offset;
  }


  static intervalComplement(interval) {
    const fix = {
      '8P': '1P',
      '8d': '1A',
      '8A': '1d',
      '1A': '8d',
      '1d': '8A',
    }
    const fixIndex = Object.keys(fix).find(key => interval.match(key));
    if (fixIndex) {
      return fix[fixIndex];
    }

    return Interval.invert(interval);
  }

  static invertInterval(interval) {
    if (!interval) {
      return null;
    }
    const positive = interval.replace('-', '');
    const complement = Harmony.intervalComplement(positive);
    const isNegative = interval.length > positive.length;
    return (isNegative ? '' : '-') + complement;
  }

  /** Transforms interval into one octave (octave+ get octaved down) */
  static fixInterval(interval = '', simplify = false) {
    let fix: { [key: string]: string } = {
      '0A': '1P',
      '-0A': '1P',
      /*  */
    }
    if (simplify) {
      fix = {
        ...fix,
        '8P': '1P',
        '-8P': '1P',
        /* '-1A': '-2m',
        '1A': '2m',
        '8d': '7M',
        '-8d': '-7M', */
      }
      interval = Interval.simplify(interval);
    }
    if (Object.keys(fix).includes(interval)) {
      return fix[interval];
    }
    return interval;
  }

  /** inverts the interval if it does not go to the desired direction */
  static forceDirection(interval, direction: intervalDirection, noUnison = false) {
    const semitones = Interval.semitones(interval);
    if ((direction === 'up' && semitones < 0) ||
      (direction === 'down' && semitones > 0)) {
      return Harmony.invertInterval(interval);
    }
    if (interval === '1P' && noUnison) {
      return (direction === 'down' ? '-' : '') + '8P';
    }
    return interval;
  }

  // use Interval.ic?
  static minInterval(interval, direction?: intervalDirection, noUnison?) {
    interval = Harmony.fixInterval(interval, true);
    if (direction) {
      return Harmony.forceDirection(interval, direction, noUnison)
    }
    let inversion = Harmony.invertInterval(interval);
    if (Math.abs(Interval.semitones(inversion)) < Math.abs(Interval.semitones(interval))) {
      interval = inversion;
    }
    return interval;
  }

  // returns array of intervals that lead the voices of chord A to chordB
  static minIntervals(chordA, chordB) {
    return chordA.map((n, i) => Harmony.minInterval(Distance.interval(n, chordB[i])));
  }

  static mapMinInterval(direction?: intervalDirection) {
    return (interval) => Harmony.minInterval(interval, direction);
  }

  // sort function
  static sortMinInterval(preferredDirection: intervalDirection = 'up', accessor = (i => i)) {
    return (a, b) => {
      const diff = Math.abs(Interval.semitones(accessor(a))) - Math.abs(Interval.semitones(accessor(b)));
      if (diff === 0) {
        return preferredDirection === 'up' ? -1 : 1;
      }
      return diff;
    }
  }

  /** Returns the note with the least distance to "from" */
  static getNearestNote(from, to, direction?: intervalDirection) {
    let interval = Harmony.minInterval(Distance.interval(Note.pc(from), Note.pc(to)), direction);
    return Distance.transpose(from, interval) + '';
  }

  static isValidNote(note: string) {
    return !!note.match(/^[A-Ga-g][b|#]*[0-9]?$/);
  }

  /** Returns the note with the least distance to "from". TODO: add range */
  static getNearestTargets(from, targets, preferredDirection: intervalDirection = 'down', flip = false) {
    let intervals = targets
      .map((target) => Distance.interval(Note.pc(from), target))
      .map(Harmony.mapMinInterval(preferredDirection))
      .sort(Harmony.sortMinInterval(preferredDirection))
    /* if (flip) {
        intervals = intervals.reverse();
    } */
    return intervals.map(i => Distance.transpose(from, i));
  }

  static intervalMatrix(from, to) {
    return to.map(note => from
      .map(n => {
        return Distance.interval(n, note)
      })
      .map(d => Harmony.minInterval(d))
      /* .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i) */
    )
  }

}