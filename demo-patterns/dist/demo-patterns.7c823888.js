// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../node_modules/tonal-array/node_modules/tonal-note/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokenize = tokenize;
exports.fromMidi = fromMidi;
exports.enharmonic = exports.simplify = exports.build = exports.from = exports.altToAcc = exports.stepToLetter = exports.oct = exports.chroma = exports.freqToMidi = exports.freq = exports.midiToFreq = exports.midi = exports.pc = exports.name = exports.props = exports.names = void 0;
var NAMES = "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B".split(" ");

var names = function (accTypes) {
  return typeof accTypes !== "string" ? NAMES.slice() : NAMES.filter(function (n) {
    var acc = n[1] || " ";
    return accTypes.indexOf(acc) !== -1;
  });
};

exports.names = names;
var SHARPS = names(" #");
var FLATS = names(" b");
var REGEX = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;

function tokenize(str) {
  if (typeof str !== "string") str = "";
  var m = REGEX.exec(str);
  return [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]];
}

var NO_NOTE = Object.freeze({
  pc: null,
  name: null,
  step: null,
  alt: null,
  oct: null,
  octStr: null,
  chroma: null,
  midi: null,
  freq: null
});
var SEMI = [0, 2, 4, 5, 7, 9, 11];

var properties = function (str) {
  var tokens = tokenize(str);
  if (tokens[0] === "" || tokens[3] !== "") return NO_NOTE;
  var letter = tokens[0],
      acc = tokens[1],
      octStr = tokens[2];
  var p = {
    letter: letter,
    acc: acc,
    octStr: octStr,
    pc: letter + acc,
    name: letter + acc + octStr,
    step: (letter.charCodeAt(0) + 3) % 7,
    alt: acc[0] === "b" ? -acc.length : acc.length,
    oct: octStr.length ? +octStr : null,
    chroma: 0,
    midi: null,
    freq: null
  };
  p.chroma = (SEMI[p.step] + p.alt + 120) % 12;
  p.midi = p.oct !== null ? SEMI[p.step] + p.alt + 12 * (p.oct + 1) : null;
  p.freq = midiToFreq(p.midi);
  return Object.freeze(p);
};

var memo = function (fn, cache) {
  if (cache === void 0) {
    cache = {};
  }

  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};

var props = memo(properties);
exports.props = props;

var name = function (str) {
  return props(str).name;
};

exports.name = name;

var pc = function (str) {
  return props(str).pc;
};

exports.pc = pc;

var isMidiRange = function (m) {
  return m >= 0 && m <= 127;
};

var midi = function (note) {
  if (typeof note !== "number" && typeof note !== "string") {
    return null;
  }

  var midi = props(note).midi;
  var value = midi || midi === 0 ? midi : +note;
  return isMidiRange(value) ? value : null;
};

exports.midi = midi;

var midiToFreq = function (midi, tuning) {
  if (tuning === void 0) {
    tuning = 440;
  }

  return typeof midi === "number" ? Math.pow(2, (midi - 69) / 12) * tuning : null;
};

exports.midiToFreq = midiToFreq;

var freq = function (note) {
  return props(note).freq || midiToFreq(note);
};

exports.freq = freq;
var L2 = Math.log(2);
var L440 = Math.log(440);

var freqToMidi = function (freq) {
  var v = 12 * (Math.log(freq) - L440) / L2 + 69;
  return Math.round(v * 100) / 100;
};

exports.freqToMidi = freqToMidi;

var chroma = function (str) {
  return props(str).chroma;
};

exports.chroma = chroma;

var oct = function (str) {
  return props(str).oct;
};

exports.oct = oct;
var LETTERS = "CDEFGAB";

var stepToLetter = function (step) {
  return LETTERS[step];
};

exports.stepToLetter = stepToLetter;

var fillStr = function (s, n) {
  return Array(n + 1).join(s);
};

var numToStr = function (num, op) {
  return typeof num !== "number" ? "" : op(num);
};

var altToAcc = function (alt) {
  return numToStr(alt, function (alt) {
    return alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
  });
};

exports.altToAcc = altToAcc;

var from = function (fromProps, baseNote) {
  if (fromProps === void 0) {
    fromProps = {};
  }

  if (baseNote === void 0) {
    baseNote = null;
  }

  var _a = baseNote ? Object.assign({}, props(baseNote), fromProps) : fromProps,
      step = _a.step,
      alt = _a.alt,
      oct = _a.oct;

  if (typeof step !== "number") return null;
  var letter = stepToLetter(step);
  if (!letter) return null;
  var pc = letter + altToAcc(alt);
  return oct || oct === 0 ? pc + oct : pc;
};

exports.from = from;
var build = from;
exports.build = build;

function fromMidi(num, sharps) {
  if (sharps === void 0) {
    sharps = false;
  }

  num = Math.round(num);
  var pcs = sharps === true ? SHARPS : FLATS;
  var pc = pcs[num % 12];
  var o = Math.floor(num / 12) - 1;
  return pc + o;
}

var simplify = function (note, sameAcc) {
  if (sameAcc === void 0) {
    sameAcc = true;
  }

  var _a = props(note),
      alt = _a.alt,
      chroma = _a.chroma,
      midi = _a.midi;

  if (chroma === null) return null;
  var alteration = alt;
  var useSharps = sameAcc === false ? alteration < 0 : alteration > 0;
  return midi === null ? pc(fromMidi(chroma, useSharps)) : fromMidi(midi, useSharps);
};

exports.simplify = simplify;

var enharmonic = function (note) {
  return simplify(note, false);
};

exports.enharmonic = enharmonic;
},{}],"../node_modules/tonal-array/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.range = range;
exports.rotate = rotate;
exports.sort = sort;
exports.unique = unique;
exports.permutations = exports.shuffle = exports.compact = void 0;

var _tonalNote = require("tonal-note");

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-array.svg?style=flat-square)](https://www.npmjs.com/package/tonal-array)
 *
 * Tonal array utilities. Create ranges, sort notes, ...
 *
 * @example
 * import * as Array;
 * Array.sort(["f", "a", "c"]) // => ["C", "F", "A"]
 *
 * @example
 * const Array = require("tonal-array")
 * Array.range(1, 4) // => [1, 2, 3, 4]
 *
 * @module Array
 */
// ascending range
function ascR(b, n) {
  for (var a = []; n--; a[n] = n + b) {
    ;
  }

  return a;
} // descending range


function descR(b, n) {
  for (var a = []; n--; a[n] = b - n) {
    ;
  }

  return a;
}
/**
 * Create a numeric range
 *
 * @param {Number} from
 * @param {Number} to
 * @return {Array}
 *
 * @example
 * Array.range(-2, 2) // => [-2, -1, 0, 1, 2]
 * Array.range(2, -2) // => [2, 1, 0, -1, -2]
 */


function range(a, b) {
  return a === null || b === null ? [] : a < b ? ascR(a, b - a + 1) : descR(a, a - b + 1);
}
/**
 *
 * Rotates a list a number of times. It"s completly agnostic about the
 * contents of the list.
 *
 * @param {Integer} times - the number of rotations
 * @param {Array} array
 * @return {Array} the rotated array
 * @example
 * Array.rotate(1, [1, 2, 3]) // => [2, 3, 1]
 */


function rotate(times, arr) {
  var len = arr.length;
  var n = (times % len + len) % len;
  return arr.slice(n, len).concat(arr.slice(0, n));
}
/**
 * Return a copy of the array with the null values removed
 * @function
 * @param {Array} array
 * @return {Array}
 *
 * @example
 * Array.compact(["a", "b", null, "c"]) // => ["a", "b", "c"]
 */


var compact = function (arr) {
  return arr.filter(function (n) {
    return n === 0 || n;
  });
}; // a function that get note heights (with negative number for pitch classes)


exports.compact = compact;

var height = function (name) {
  var m = (0, _tonalNote.props)(name).midi;
  return m !== null ? m : (0, _tonalNote.props)(name + "-100").midi;
};
/**
 * Sort an array of notes in ascending order
 *
 * @param {String|Array} notes
 * @return {Array} sorted array of notes
 */


function sort(src) {
  return compact(src.map(_tonalNote.name)).sort(function (a, b) {
    return height(a) > height(b);
  });
}
/**
 * Get sorted notes with duplicates removed
 *
 * @function
 * @param {Array} notes
 */


function unique(arr) {
  return sort(arr).filter(function (n, i, a) {
    return i === 0 || n !== a[i - 1];
  });
}
/**
 * Randomizes the order of the specified array in-place, using the Fisher–Yates shuffle.
 *
 * @private
 * @function
 * @param {Array|String} arr - the array
 * @return {Array} the shuffled array
 *
 * @example
 * Array.shuffle(["C", "D", "E", "F"])
 */


var shuffle = function (arr, rnd) {
  if (rnd === void 0) rnd = Math.random;
  var i, t;
  var m = arr.length;

  while (m) {
    i = rnd() * m-- | 0;
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }

  return arr;
};
/**
 * Get all permutations of an array
 * http://stackoverflow.com/questions/9960908/permutations-in-javascript
 *
 * @param {Array} array - the array
 * @return {Array<Array>} an array with all the permutations
 */


exports.shuffle = shuffle;

var permutations = function (arr) {
  if (arr.length === 0) {
    return [[]];
  }

  return permutations(arr.slice(1)).reduce(function (acc, perm) {
    return acc.concat(arr.map(function (e, pos) {
      var newPerm = perm.slice();
      newPerm.splice(pos, 0, arr[0]);
      return newPerm;
    }));
  }, []);
};

exports.permutations = permutations;
},{"tonal-note":"../node_modules/tonal-array/node_modules/tonal-note/build/es6.js"}],"../node_modules/tonal-note/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokenize = tokenize;
exports.fromMidi = fromMidi;
exports.enharmonic = exports.simplify = exports.build = exports.from = exports.altToAcc = exports.stepToLetter = exports.oct = exports.chroma = exports.freqToMidi = exports.freq = exports.midiToFreq = exports.midi = exports.pc = exports.name = exports.props = exports.names = void 0;
var NAMES = "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B".split(" ");

var names = function (accTypes) {
  return typeof accTypes !== "string" ? NAMES.slice() : NAMES.filter(function (n) {
    var acc = n[1] || " ";
    return accTypes.indexOf(acc) !== -1;
  });
};

exports.names = names;
var SHARPS = names(" #");
var FLATS = names(" b");
var REGEX = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;

function tokenize(str) {
  if (typeof str !== "string") str = "";
  var m = REGEX.exec(str);
  return [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]];
}

var NO_NOTE = Object.freeze({
  pc: null,
  name: null,
  step: null,
  alt: null,
  oct: null,
  octStr: null,
  chroma: null,
  midi: null,
  freq: null
});
var SEMI = [0, 2, 4, 5, 7, 9, 11];

var properties = function (str) {
  var tokens = tokenize(str);
  if (tokens[0] === "" || tokens[3] !== "") return NO_NOTE;
  var letter = tokens[0],
      acc = tokens[1],
      octStr = tokens[2];
  var p = {
    letter: letter,
    acc: acc,
    octStr: octStr,
    pc: letter + acc,
    name: letter + acc + octStr,
    step: (letter.charCodeAt(0) + 3) % 7,
    alt: acc[0] === "b" ? -acc.length : acc.length,
    oct: octStr.length ? +octStr : null,
    chroma: 0,
    midi: null,
    freq: null
  };
  p.chroma = (SEMI[p.step] + p.alt + 120) % 12;
  p.midi = p.oct !== null ? SEMI[p.step] + p.alt + 12 * (p.oct + 1) : null;
  p.freq = midiToFreq(p.midi);
  return Object.freeze(p);
};

var memo = function (fn, cache) {
  if (cache === void 0) {
    cache = {};
  }

  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};

var props = memo(properties);
exports.props = props;

var name = function (str) {
  return props(str).name;
};

exports.name = name;

var pc = function (str) {
  return props(str).pc;
};

exports.pc = pc;

var isMidiRange = function (m) {
  return m >= 0 && m <= 127;
};

var midi = function (note) {
  if (typeof note !== "number" && typeof note !== "string") {
    return null;
  }

  var midi = props(note).midi;
  var value = midi || midi === 0 ? midi : +note;
  return isMidiRange(value) ? value : null;
};

exports.midi = midi;

var midiToFreq = function (midi, tuning) {
  if (tuning === void 0) {
    tuning = 440;
  }

  return typeof midi === "number" ? Math.pow(2, (midi - 69) / 12) * tuning : null;
};

exports.midiToFreq = midiToFreq;

var freq = function (note) {
  return props(note).freq || midiToFreq(note);
};

exports.freq = freq;
var L2 = Math.log(2);
var L440 = Math.log(440);

var freqToMidi = function (freq) {
  var v = 12 * (Math.log(freq) - L440) / L2 + 69;
  return Math.round(v * 100) / 100;
};

exports.freqToMidi = freqToMidi;

var chroma = function (str) {
  return props(str).chroma;
};

exports.chroma = chroma;

var oct = function (str) {
  return props(str).oct;
};

exports.oct = oct;
var LETTERS = "CDEFGAB";

var stepToLetter = function (step) {
  return LETTERS[step];
};

exports.stepToLetter = stepToLetter;

var fillStr = function (s, n) {
  return Array(n + 1).join(s);
};

var numToStr = function (num, op) {
  return typeof num !== "number" ? "" : op(num);
};

var altToAcc = function (alt) {
  return numToStr(alt, function (alt) {
    return alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
  });
};

exports.altToAcc = altToAcc;

var from = function (fromProps, baseNote) {
  if (fromProps === void 0) {
    fromProps = {};
  }

  if (baseNote === void 0) {
    baseNote = null;
  }

  var _a = baseNote ? Object.assign({}, props(baseNote), fromProps) : fromProps,
      step = _a.step,
      alt = _a.alt,
      oct = _a.oct;

  if (typeof step !== "number") return null;
  var letter = stepToLetter(step);
  if (!letter) return null;
  var pc = letter + altToAcc(alt);
  return oct || oct === 0 ? pc + oct : pc;
};

exports.from = from;
var build = from;
exports.build = build;

function fromMidi(num, sharps) {
  if (sharps === void 0) {
    sharps = false;
  }

  num = Math.round(num);
  var pcs = sharps === true ? SHARPS : FLATS;
  var pc = pcs[num % 12];
  var o = Math.floor(num / 12) - 1;
  return pc + o;
}

var simplify = function (note, sameAcc) {
  if (sameAcc === void 0) {
    sameAcc = true;
  }

  var _a = props(note),
      alt = _a.alt,
      chroma = _a.chroma,
      midi = _a.midi;

  if (chroma === null) return null;
  var alteration = alt;
  var useSharps = sameAcc === false ? alteration < 0 : alteration > 0;
  return midi === null ? pc(fromMidi(chroma, useSharps)) : fromMidi(midi, useSharps);
};

exports.simplify = simplify;

var enharmonic = function (note) {
  return simplify(note, false);
};

exports.enharmonic = enharmonic;
},{}],"../node_modules/tonal-interval/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.props = props;
exports.fromSemitones = exports.invert = exports.simplify = exports.build = exports.ic = exports.chroma = exports.semitones = exports.name = exports.num = exports.altToQ = exports.qToAlt = exports.tokenize = exports.names = void 0;
var IVL_TNL = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
var IVL_STR = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
var REGEX = new RegExp("^" + IVL_TNL + "|" + IVL_STR + "$");
var SIZES = [0, 2, 4, 5, 7, 9, 11];
var TYPES = "PMMPPMM";
var CLASSES = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
var NAMES = "1P 2m 2M 3m 3M 4P 5P 6m 6M 7m 7M 8P".split(" ");

var names = function (types) {
  return typeof types !== "string" ? NAMES.slice() : NAMES.filter(function (n) {
    return types.indexOf(n[1]) !== -1;
  });
};

exports.names = names;

var tokenize = function (str) {
  var m = REGEX.exec("" + str);
  if (m === null) return null;
  return m[1] ? [m[1], m[2]] : [m[4], m[3]];
};

exports.tokenize = tokenize;
var NO_IVL = Object.freeze({
  name: null,
  num: null,
  q: null,
  step: null,
  alt: null,
  dir: null,
  type: null,
  simple: null,
  semitones: null,
  chroma: null,
  oct: null
});

var fillStr = function (s, n) {
  return Array(Math.abs(n) + 1).join(s);
};

var qToAlt = function (type, q) {
  if (q === "M" && type === "M") return 0;
  if (q === "P" && type === "P") return 0;
  if (q === "m" && type === "M") return -1;
  if (/^A+$/.test(q)) return q.length;
  if (/^d+$/.test(q)) return type === "P" ? -q.length : -q.length - 1;
  return null;
};

exports.qToAlt = qToAlt;

var altToQ = function (type, alt) {
  if (alt === 0) return type === "M" ? "M" : "P";else if (alt === -1 && type === "M") return "m";else if (alt > 0) return fillStr("A", alt);else if (alt < 0) return fillStr("d", type === "P" ? alt : alt + 1);else return null;
};

exports.altToQ = altToQ;

var numToStep = function (num) {
  return (Math.abs(num) - 1) % 7;
};

var properties = function (str) {
  var t = tokenize(str);
  if (t === null) return NO_IVL;
  var p = {
    num: 0,
    q: "d",
    name: "",
    type: "M",
    step: 0,
    dir: -1,
    simple: 1,
    alt: 0,
    oct: 0,
    semitones: 0,
    chroma: 0,
    ic: 0
  };
  p.num = +t[0];
  p.q = t[1];
  p.step = numToStep(p.num);
  p.type = TYPES[p.step];
  if (p.type === "M" && p.q === "P") return NO_IVL;
  p.name = "" + p.num + p.q;
  p.dir = p.num < 0 ? -1 : 1;
  p.simple = p.num === 8 || p.num === -8 ? p.num : p.dir * (p.step + 1);
  p.alt = qToAlt(p.type, p.q);
  p.oct = Math.floor((Math.abs(p.num) - 1) / 7);
  p.semitones = p.dir * (SIZES[p.step] + p.alt + 12 * p.oct);
  p.chroma = (p.dir * (SIZES[p.step] + p.alt) % 12 + 12) % 12;
  return Object.freeze(p);
};

var cache = {};

function props(str) {
  if (typeof str !== "string") return NO_IVL;
  return cache[str] || (cache[str] = properties(str));
}

var num = function (str) {
  return props(str).num;
};

exports.num = num;

var name = function (str) {
  return props(str).name;
};

exports.name = name;

var semitones = function (str) {
  return props(str).semitones;
};

exports.semitones = semitones;

var chroma = function (str) {
  return props(str).chroma;
};

exports.chroma = chroma;

var ic = function (ivl) {
  if (typeof ivl === "string") ivl = props(ivl).chroma;
  return typeof ivl === "number" ? CLASSES[ivl % 12] : null;
};

exports.ic = ic;

var build = function (_a) {
  var _b = _a === void 0 ? {} : _a,
      num = _b.num,
      step = _b.step,
      alt = _b.alt,
      _c = _b.oct,
      oct = _c === void 0 ? 1 : _c,
      dir = _b.dir;

  if (step !== undefined) num = step + 1 + 7 * oct;
  if (num === undefined) return null;
  if (typeof alt !== "number") return null;
  var d = typeof dir !== "number" ? "" : dir < 0 ? "-" : "";
  var type = TYPES[numToStep(num)];
  return d + num + altToQ(type, alt);
};

exports.build = build;

var simplify = function (str) {
  var p = props(str);
  if (p === NO_IVL) return null;
  var intervalProps = p;
  return intervalProps.simple + intervalProps.q;
};

exports.simplify = simplify;

var invert = function (str) {
  var p = props(str);
  if (p === NO_IVL) return null;
  var intervalProps = p;
  var step = (7 - intervalProps.step) % 7;
  var alt = intervalProps.type === "P" ? -intervalProps.alt : -(intervalProps.alt + 1);
  return build({
    step: step,
    alt: alt,
    oct: intervalProps.oct,
    dir: intervalProps.dir
  });
};

exports.invert = invert;
var IN = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7];
var IQ = "P m M m M P d P m M m M".split(" ");

var fromSemitones = function (num) {
  var d = num < 0 ? -1 : 1;
  var n = Math.abs(num);
  var c = n % 12;
  var o = Math.floor(n / 12);
  return d * (IN[c] + 7 * o) + IQ[c];
};

exports.fromSemitones = fromSemitones;
},{}],"../node_modules/tonal-distance/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transpose = transpose;
exports.trFifths = trFifths;
exports.fifths = fifths;
exports.transposeBy = transposeBy;
exports.addIntervals = addIntervals;
exports.add = add;
exports.subtract = subtract;
exports.interval = interval;
exports.semitones = semitones;

var _tonalNote = require("tonal-note");

var _tonalInterval = require("tonal-interval");

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-distance.svg)](https://www.npmjs.com/package/tonal-distance)
 * [![tonal](https://img.shields.io/badge/tonal-distance-yellow.svg)](https://github.com/danigb/tonal/tree/master/packages/tonal/distance)
 *
 * Transpose notes by intervals and find distances between notes
 *
 * @example
 * // es6
 * import * as Distance from "tonal-distance"
 * Distance.interval("C3", "C4") // => "1P"
 *
 * @example
 * // es6 import selected functions
 * import { interval, semitones, transpose } from "tonal-distance"
 *
 * semitones("C" ,"D") // => 2
 * interval("C4", "G4") // => "5P"
 * transpose("C4", "P5") // => "G4"
 *
 * @example
 * // included in tonal facade
 * const Tonal = require("tonal");
 * Tonal.Distance.transpose("C4", "P5")
 * Tonal.Distance.transposeBy("P5", "C4")
 *
 * @module Distance
 */
// Map from letter step to number of fifths starting from "C":
// { C: 0, D: 2, E: 4, F: -1, G: 1, A: 3, B: 5 }
var FIFTHS = [0, 2, 4, -1, 1, 3, 5]; // Given a number of fifths, return the octaves they span

var fOcts = function (f) {
  return Math.floor(f * 7 / 12);
}; // Get the number of octaves it span each step


var FIFTH_OCTS = FIFTHS.map(fOcts);

var encode = function (ref) {
  var step = ref.step;
  var alt = ref.alt;
  var oct = ref.oct;
  var dir = ref.dir;
  if (dir === void 0) dir = 1;
  var f = FIFTHS[step] + 7 * alt;

  if (oct === null) {
    return [dir * f];
  }

  var o = oct - FIFTH_OCTS[step] - 4 * alt;
  return [dir * f, dir * o];
}; // We need to get the steps from fifths
// Fifths for CDEFGAB are [ 0, 2, 4, -1, 1, 3, 5 ]
// We add 1 to fifths to avoid negative numbers, so:
// for ["F", "C", "G", "D", "A", "E", "B"] we have:


var STEPS = [3, 0, 4, 1, 5, 2, 6]; // Return the number of fifths as if it were unaltered

function unaltered(f) {
  var i = (f + 1) % 7;
  return i < 0 ? 7 + i : i;
}

var decode = function (f, o, dir) {
  var step = STEPS[unaltered(f)];
  var alt = Math.floor((f + 1) / 7);

  if (o === undefined) {
    return {
      step: step,
      alt: alt,
      dir: dir
    };
  }

  var oct = o + 4 * alt + FIFTH_OCTS[step];
  return {
    step: step,
    alt: alt,
    oct: oct,
    dir: dir
  };
};

var memo = function (fn, cache) {
  if (cache === void 0) cache = {};
  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};

var encoder = function (props) {
  return memo(function (str) {
    var p = props(str);
    return p.name === null ? null : encode(p);
  });
};

var encodeNote = encoder(_tonalNote.props);
var encodeIvl = encoder(_tonalInterval.props);
/**
 * Transpose a note by an interval. The note can be a pitch class.
 *
 * This function can be partially applied.
 *
 * @param {string} note
 * @param {string} interval
 * @return {string} the transposed note
 * @example
 * import { tranpose } from "tonal-distance"
 * transpose("d3", "3M") // => "F#3"
 * // it works with pitch classes
 * transpose("D", "3M") // => "F#"
 * // can be partially applied
 * ["C", "D", "E", "F", "G"].map(transpose("M3)) // => ["E", "F#", "G#", "A", "B"]
 */

function transpose(note, interval) {
  if (arguments.length === 1) {
    return function (i) {
      return transpose(note, i);
    };
  }

  var n = encodeNote(note);
  var i = encodeIvl(interval);

  if (n === null || i === null) {
    return null;
  }

  var tr = n.length === 1 ? [n[0] + i[0]] : [n[0] + i[0], n[1] + i[1]];
  return (0, _tonalNote.build)(decode(tr[0], tr[1]));
}
/**
 * Transpose a pitch class by a number of perfect fifths.
 *
 * It can be partially applied.
 *
 * @function
 * @param {string} pitchClass - the pitch class
 * @param {Integer} fifhts - the number of fifths
 * @return {string} the transposed pitch class
 *
 * @example
 * import { trFifths } from "tonal-transpose"
 * [0, 1, 2, 3, 4].map(trFifths("C")) // => ["C", "G", "D", "A", "E"]
 * // or using tonal
 * Distance.trFifths("G4", 1) // => "D"
 */


function trFifths(note, fifths) {
  if (arguments.length === 1) {
    return function (f) {
      return trFifths(note, f);
    };
  }

  var n = encodeNote(note);

  if (n === null) {
    return null;
  }

  return (0, _tonalNote.build)(decode(n[0] + fifths));
}
/**
 * Get the distance in fifths between pitch classes
 *
 * Can be partially applied.
 *
 * @param {string} to - note or pitch class
 * @param {string} from - note or pitch class
 */


function fifths(from, to) {
  if (arguments.length === 1) {
    return function (to) {
      return fifths(from, to);
    };
  }

  var f = encodeNote(from);
  var t = encodeNote(to);

  if (t === null || f === null) {
    return null;
  }

  return t[0] - f[0];
}
/**
 * The same as transpose with the arguments inverted.
 *
 * Can be partially applied.
 *
 * @param {string} note
 * @param {string} interval
 * @return {string} the transposed note
 * @example
 * import { tranposeBy } from "tonal-distance"
 * transposeBy("3m", "5P") // => "7m"
 */


function transposeBy(interval, note) {
  if (arguments.length === 1) {
    return function (n) {
      return transpose(n, interval);
    };
  }

  return transpose(note, interval);
}

var isDescending = function (e) {
  return e[0] * 7 + e[1] * 12 < 0;
};

var decodeIvl = function (i) {
  return isDescending(i) ? decode(-i[0], -i[1], -1) : decode(i[0], i[1], 1);
};

function addIntervals(ivl1, ivl2, dir) {
  var i1 = encodeIvl(ivl1);
  var i2 = encodeIvl(ivl2);

  if (i1 === null || i2 === null) {
    return null;
  }

  var i = [i1[0] + dir * i2[0], i1[1] + dir * i2[1]];
  return (0, _tonalInterval.build)(decodeIvl(i));
}
/**
 * Add two intervals
 *
 * Can be partially applied.
 *
 * @param {string} interval1
 * @param {string} interval2
 * @return {string} the resulting interval
 * @example
 * import { add } from "tonal-distance"
 * add("3m", "5P") // => "7m"
 */


function add(ivl1, ivl2) {
  if (arguments.length === 1) {
    return function (i2) {
      return add(ivl1, i2);
    };
  }

  return addIntervals(ivl1, ivl2, 1);
}
/**
 * Subtract two intervals
 *
 * Can be partially applied
 *
 * @param {string} minuend
 * @param {string} subtrahend
 * @return {string} interval diference
 */


function subtract(ivl1, ivl2) {
  if (arguments.length === 1) {
    return function (i2) {
      return add(ivl1, i2);
    };
  }

  return addIntervals(ivl1, ivl2, -1);
}
/**
 * Find the interval between two pitches. It works with pitch classes
 * (both must be pitch classes and the interval is always ascending)
 *
 * Can be partially applied
 *
 * @param {string} from - distance from
 * @param {string} to - distance to
 * @return {string} the interval distance
 *
 * @example
 * import { interval } from "tonal-distance"
 * interval("C2", "C3") // => "P8"
 * interval("G", "B") // => "M3"
 *
 * @example
 * import * as Distance from "tonal-distance"
 * Distance.interval("M2", "P5") // => "P4"
 */


function interval(from, to) {
  if (arguments.length === 1) {
    return function (t) {
      return interval(from, t);
    };
  }

  var f = encodeNote(from);
  var t = encodeNote(to);

  if (f === null || t === null || f.length !== t.length) {
    return null;
  }

  var d = f.length === 1 ? [t[0] - f[0], -Math.floor((t[0] - f[0]) * 7 / 12)] : [t[0] - f[0], t[1] - f[1]];
  return (0, _tonalInterval.build)(decodeIvl(d));
}
/**
 * Get the distance between two notes in semitones
 *
 * @param {String|Pitch} from - first note
 * @param {String|Pitch} to - last note
 * @return {Integer} the distance in semitones or null if not valid notes
 * @example
 * import { semitones } from "tonal-distance"
 * semitones("C3", "A2") // => -3
 * // or use tonal
 * Tonal.Distance.semitones("C3", "G3") // => 7
 */


function semitones(from, to) {
  if (arguments.length === 1) {
    return function (t) {
      return semitones(from, t);
    };
  }

  var f = (0, _tonalNote.props)(from);
  var t = (0, _tonalNote.props)(to);
  return f.midi !== null && t.midi !== null ? t.midi - f.midi : f.chroma !== null && t.chroma !== null ? (t.chroma - f.chroma + 12) % 12 : null;
}
},{"tonal-note":"../node_modules/tonal-note/build/es6.js","tonal-interval":"../node_modules/tonal-interval/build/es6.js"}],"../node_modules/tonal-dictionary/build/data/scales.json":[function(require,module,exports) {
module.exports = {
  "chromatic": ["1P 2m 2M 3m 3M 4P 4A 5P 6m 6M 7m 7M"],
  "lydian": ["1P 2M 3M 4A 5P 6M 7M"],
  "major": ["1P 2M 3M 4P 5P 6M 7M", ["ionian"]],
  "mixolydian": ["1P 2M 3M 4P 5P 6M 7m", ["dominant"]],
  "dorian": ["1P 2M 3m 4P 5P 6M 7m"],
  "aeolian": ["1P 2M 3m 4P 5P 6m 7m", ["minor"]],
  "phrygian": ["1P 2m 3m 4P 5P 6m 7m"],
  "locrian": ["1P 2m 3m 4P 5d 6m 7m"],
  "melodic minor": ["1P 2M 3m 4P 5P 6M 7M"],
  "melodic minor second mode": ["1P 2m 3m 4P 5P 6M 7m"],
  "lydian augmented": ["1P 2M 3M 4A 5A 6M 7M"],
  "lydian dominant": ["1P 2M 3M 4A 5P 6M 7m", ["lydian b7"]],
  "melodic minor fifth mode": [
    "1P 2M 3M 4P 5P 6m 7m",
    ["hindu", "mixolydian b6M"]
  ],
  "locrian #2": ["1P 2M 3m 4P 5d 6m 7m", ["half-diminished"]],
  "altered": [
    "1P 2m 3m 3M 5d 6m 7m",
    ["super locrian", "diminished whole tone", "pomeroy"]
  ],
  "harmonic minor": ["1P 2M 3m 4P 5P 6m 7M"],
  "phrygian dominant": ["1P 2m 3M 4P 5P 6m 7m", ["spanish", "phrygian major"]],
  "half-whole diminished": ["1P 2m 3m 3M 4A 5P 6M 7m", ["dominant diminished"]],
  "diminished": ["1P 2M 3m 4P 5d 6m 6M 7M", ["whole-half diminished"]],
  "major pentatonic": ["1P 2M 3M 5P 6M", ["pentatonic"]],
  "lydian pentatonic": ["1P 3M 4A 5P 7M", ["chinese"]],
  "mixolydian pentatonic": ["1P 3M 4P 5P 7m", ["indian"]],
  "locrian pentatonic": [
    "1P 3m 4P 5d 7m",
    ["minor seven flat five pentatonic"]
  ],
  "minor pentatonic": ["1P 3m 4P 5P 7m"],
  "minor six pentatonic": ["1P 3m 4P 5P 6M"],
  "minor hexatonic": ["1P 2M 3m 4P 5P 7M"],
  "flat three pentatonic": ["1P 2M 3m 5P 6M", ["kumoi"]],
  "flat six pentatonic": ["1P 2M 3M 5P 6m"],
  "major flat two pentatonic": ["1P 2m 3M 5P 6M"],
  "whole tone pentatonic": ["1P 3M 5d 6m 7m"],
  "ionian pentatonic": ["1P 3M 4P 5P 7M"],
  "lydian #5P pentatonic": ["1P 3M 4A 5A 7M"],
  "lydian dominant pentatonic": ["1P 3M 4A 5P 7m"],
  "minor #7M pentatonic": ["1P 3m 4P 5P 7M"],
  "super locrian pentatonic": ["1P 3m 4d 5d 7m"],
  "in-sen": ["1P 2m 4P 5P 7m"],
  "iwato": ["1P 2m 4P 5d 7m"],
  "hirajoshi": ["1P 2M 3m 5P 6m"],
  "kumoijoshi": ["1P 2m 4P 5P 6m"],
  "pelog": ["1P 2m 3m 5P 6m"],
  "vietnamese 1": ["1P 3m 4P 5P 6m"],
  "vietnamese 2": ["1P 3m 4P 5P 7m"],
  "prometheus": ["1P 2M 3M 4A 6M 7m"],
  "prometheus neopolitan": ["1P 2m 3M 4A 6M 7m"],
  "ritusen": ["1P 2M 4P 5P 6M"],
  "scriabin": ["1P 2m 3M 5P 6M"],
  "piongio": ["1P 2M 4P 5P 6M 7m"],
  "major blues": ["1P 2M 3m 3M 5P 6M"],
  "minor blues": ["1P 3m 4P 5d 5P 7m", ["blues"]],
  "composite blues": ["1P 2M 3m 3M 4P 5d 5P 6M 7m"],
  "augmented": ["1P 2A 3M 5P 5A 7M"],
  "augmented heptatonic": ["1P 2A 3M 4P 5P 5A 7M"],
  "dorian #4": ["1P 2M 3m 4A 5P 6M 7m"],
  "lydian diminished": ["1P 2M 3m 4A 5P 6M 7M"],
  "whole tone": ["1P 2M 3M 4A 5A 7m"],
  "leading whole tone": ["1P 2M 3M 4A 5A 7m 7M"],
  "lydian minor": ["1P 2M 3M 4A 5P 6m 7m"],
  "locrian major": ["1P 2M 3M 4P 5d 6m 7m", ["arabian"]],
  "neopolitan": ["1P 2m 3m 4P 5P 6m 7M"],
  "neopolitan minor": ["1P 2m 3m 4P 5P 6m 7M"],
  "neopolitan major": ["1P 2m 3m 4P 5P 6M 7M", ["dorian b2"]],
  "neopolitan major pentatonic": ["1P 3M 4P 5d 7m"],
  "romanian minor": ["1P 2M 3m 5d 5P 6M 7m"],
  "double harmonic lydian": ["1P 2m 3M 4A 5P 6m 7M"],
  "harmonic major": ["1P 2M 3M 4P 5P 6m 7M"],
  "double harmonic major": ["1P 2m 3M 4P 5P 6m 7M", ["gypsy"]],
  "egyptian": ["1P 2M 4P 5P 7m"],
  "hungarian minor": ["1P 2M 3m 4A 5P 6m 7M"],
  "hungarian major": ["1P 2A 3M 4A 5P 6M 7m"],
  "oriental": ["1P 2m 3M 4P 5d 6M 7m"],
  "spanish heptatonic": ["1P 2m 3m 3M 4P 5P 6m 7m"],
  "flamenco": ["1P 2m 3m 3M 4A 5P 7m"],
  "balinese": ["1P 2m 3m 4P 5P 6m 7M"],
  "todi raga": ["1P 2m 3m 4A 5P 6m 7M"],
  "malkos raga": ["1P 3m 4P 6m 7m"],
  "kafi raga": ["1P 3m 3M 4P 5P 6M 7m 7M"],
  "purvi raga": ["1P 2m 3M 4P 4A 5P 6m 7M"],
  "persian": ["1P 2m 3M 4P 5d 6m 7M"],
  "bebop": ["1P 2M 3M 4P 5P 6M 7m 7M"],
  "bebop dominant": ["1P 2M 3M 4P 5P 6M 7m 7M"],
  "bebop minor": ["1P 2M 3m 3M 4P 5P 6M 7m"],
  "bebop major": ["1P 2M 3M 4P 5P 5A 6M 7M"],
  "bebop locrian": ["1P 2m 3m 4P 5d 5P 6m 7m"],
  "minor bebop": ["1P 2M 3m 4P 5P 6m 7m 7M"],
  "mystery #1": ["1P 2m 3M 5d 6m 7m"],
  "enigmatic": ["1P 2m 3M 5d 6m 7m 7M"],
  "minor six diminished": ["1P 2M 3m 4P 5P 6m 6M 7M"],
  "ionian augmented": ["1P 2M 3M 4P 5A 6M 7M"],
  "lydian #9": ["1P 2m 3M 4A 5P 6M 7M"],
  "ichikosucho": ["1P 2M 3M 4P 5d 5P 6M 7M"],
  "six tone symmetric": ["1P 2m 3M 4P 5A 6M"]
}
;
},{}],"../node_modules/tonal-dictionary/build/data/chords.json":[function(require,module,exports) {
module.exports = {
  "4": ["1P 4P 7m 10m", ["quartal"]],
  "64": ["5P 8P 10M"],
  "5": ["1P 5P"],
  "M": ["1P 3M 5P", ["Major", ""]],
  "M#5": ["1P 3M 5A", ["augmented", "maj#5", "Maj#5", "+", "aug"]],
  "M#5add9": ["1P 3M 5A 9M", ["+add9"]],
  "M13": ["1P 3M 5P 7M 9M 13M", ["maj13", "Maj13"]],
  "M13#11": [
    "1P 3M 5P 7M 9M 11A 13M",
    ["maj13#11", "Maj13#11", "M13+4", "M13#4"]
  ],
  "M6": ["1P 3M 5P 13M", ["6"]],
  "M6#11": ["1P 3M 5P 6M 11A", ["M6b5", "6#11", "6b5"]],
  "M69": ["1P 3M 5P 6M 9M", ["69"]],
  "M69#11": ["1P 3M 5P 6M 9M 11A"],
  "M7#11": ["1P 3M 5P 7M 11A", ["maj7#11", "Maj7#11", "M7+4", "M7#4"]],
  "M7#5": ["1P 3M 5A 7M", ["maj7#5", "Maj7#5", "maj9#5", "M7+"]],
  "M7#5sus4": ["1P 4P 5A 7M"],
  "M7#9#11": ["1P 3M 5P 7M 9A 11A"],
  "M7add13": ["1P 3M 5P 6M 7M 9M"],
  "M7b5": ["1P 3M 5d 7M"],
  "M7b6": ["1P 3M 6m 7M"],
  "M7b9": ["1P 3M 5P 7M 9m"],
  "M7sus4": ["1P 4P 5P 7M"],
  "M9": ["1P 3M 5P 7M 9M", ["maj9", "Maj9"]],
  "M9#11": ["1P 3M 5P 7M 9M 11A", ["maj9#11", "Maj9#11", "M9+4", "M9#4"]],
  "M9#5": ["1P 3M 5A 7M 9M", ["Maj9#5"]],
  "M9#5sus4": ["1P 4P 5A 7M 9M"],
  "M9b5": ["1P 3M 5d 7M 9M"],
  "M9sus4": ["1P 4P 5P 7M 9M"],
  "Madd9": ["1P 3M 5P 9M", ["2", "add9", "add2"]],
  "Maj7": ["1P 3M 5P 7M", ["maj7", "M7"]],
  "Mb5": ["1P 3M 5d"],
  "Mb6": ["1P 3M 13m"],
  "Msus2": ["1P 2M 5P", ["add9no3", "sus2"]],
  "Msus4": ["1P 4P 5P", ["sus", "sus4"]],
  "Maddb9": ["1P 3M 5P 9m"],
  "7": ["1P 3M 5P 7m", ["Dominant", "Dom"]],
  "9": ["1P 3M 5P 7m 9M", ["79"]],
  "11": ["1P 5P 7m 9M 11P"],
  "13": ["1P 3M 5P 7m 9M 13M", ["13_"]],
  "11b9": ["1P 5P 7m 9m 11P"],
  "13#11": ["1P 3M 5P 7m 9M 11A 13M", ["13+4", "13#4"]],
  "13#9": ["1P 3M 5P 7m 9A 13M", ["13#9_"]],
  "13#9#11": ["1P 3M 5P 7m 9A 11A 13M"],
  "13b5": ["1P 3M 5d 6M 7m 9M"],
  "13b9": ["1P 3M 5P 7m 9m 13M"],
  "13b9#11": ["1P 3M 5P 7m 9m 11A 13M"],
  "13no5": ["1P 3M 7m 9M 13M"],
  "13sus4": ["1P 4P 5P 7m 9M 13M", ["13sus"]],
  "69#11": ["1P 3M 5P 6M 9M 11A"],
  "7#11": ["1P 3M 5P 7m 11A", ["7+4", "7#4", "7#11_", "7#4_"]],
  "7#11b13": ["1P 3M 5P 7m 11A 13m", ["7b5b13"]],
  "7#5": ["1P 3M 5A 7m", ["+7", "7aug", "aug7"]],
  "7#5#9": ["1P 3M 5A 7m 9A", ["7alt", "7#5#9_", "7#9b13_"]],
  "7#5b9": ["1P 3M 5A 7m 9m"],
  "7#5b9#11": ["1P 3M 5A 7m 9m 11A"],
  "7#5sus4": ["1P 4P 5A 7m"],
  "7#9": ["1P 3M 5P 7m 9A", ["7#9_"]],
  "7#9#11": ["1P 3M 5P 7m 9A 11A", ["7b5#9"]],
  "7#9#11b13": ["1P 3M 5P 7m 9A 11A 13m"],
  "7#9b13": ["1P 3M 5P 7m 9A 13m"],
  "7add6": ["1P 3M 5P 7m 13M", ["67", "7add13"]],
  "7b13": ["1P 3M 7m 13m"],
  "7b5": ["1P 3M 5d 7m"],
  "7b6": ["1P 3M 5P 6m 7m"],
  "7b9": ["1P 3M 5P 7m 9m"],
  "7b9#11": ["1P 3M 5P 7m 9m 11A", ["7b5b9"]],
  "7b9#9": ["1P 3M 5P 7m 9m 9A"],
  "7b9b13": ["1P 3M 5P 7m 9m 13m"],
  "7b9b13#11": ["1P 3M 5P 7m 9m 11A 13m", ["7b9#11b13", "7b5b9b13"]],
  "7no5": ["1P 3M 7m"],
  "7sus4": ["1P 4P 5P 7m", ["7sus"]],
  "7sus4b9": [
    "1P 4P 5P 7m 9m",
    ["susb9", "7susb9", "7b9sus", "7b9sus4", "phryg"]
  ],
  "7sus4b9b13": ["1P 4P 5P 7m 9m 13m", ["7b9b13sus4"]],
  "9#11": ["1P 3M 5P 7m 9M 11A", ["9+4", "9#4", "9#11_", "9#4_"]],
  "9#11b13": ["1P 3M 5P 7m 9M 11A 13m", ["9b5b13"]],
  "9#5": ["1P 3M 5A 7m 9M", ["9+"]],
  "9#5#11": ["1P 3M 5A 7m 9M 11A"],
  "9b13": ["1P 3M 7m 9M 13m"],
  "9b5": ["1P 3M 5d 7m 9M"],
  "9no5": ["1P 3M 7m 9M"],
  "9sus4": ["1P 4P 5P 7m 9M", ["9sus"]],
  "m": ["1P 3m 5P"],
  "m#5": ["1P 3m 5A", ["m+", "mb6"]],
  "m11": ["1P 3m 5P 7m 9M 11P", ["_11"]],
  "m11A 5": ["1P 3m 6m 7m 9M 11P"],
  "m11b5": ["1P 3m 7m 12d 2M 4P", ["h11", "_11b5"]],
  "m13": ["1P 3m 5P 7m 9M 11P 13M", ["_13"]],
  "m6": ["1P 3m 4P 5P 13M", ["_6"]],
  "m69": ["1P 3m 5P 6M 9M", ["_69"]],
  "m7": ["1P 3m 5P 7m", ["minor7", "_", "_7"]],
  "m7#5": ["1P 3m 6m 7m"],
  "m7add11": ["1P 3m 5P 7m 11P", ["m7add4"]],
  "m7b5": ["1P 3m 5d 7m", ["half-diminished", "h7", "_7b5"]],
  "m9": ["1P 3m 5P 7m 9M", ["_9"]],
  "m9#5": ["1P 3m 6m 7m 9M"],
  "m9b5": ["1P 3m 7m 12d 2M", ["h9", "-9b5"]],
  "mMaj7": ["1P 3m 5P 7M", ["mM7", "_M7"]],
  "mMaj7b6": ["1P 3m 5P 6m 7M", ["mM7b6"]],
  "mM9": ["1P 3m 5P 7M 9M", ["mMaj9", "-M9"]],
  "mM9b6": ["1P 3m 5P 6m 7M 9M", ["mMaj9b6"]],
  "mb6M7": ["1P 3m 6m 7M"],
  "mb6b9": ["1P 3m 6m 9m"],
  "o": ["1P 3m 5d", ["mb5", "dim"]],
  "o7": ["1P 3m 5d 13M", ["diminished", "m6b5", "dim7"]],
  "o7M7": ["1P 3m 5d 6M 7M"],
  "oM7": ["1P 3m 5d 7M"],
  "sus24": ["1P 2M 4P 5P", ["sus4add9"]],
  "+add#9": ["1P 3M 5A 9A"],
  "madd4": ["1P 3m 4P 5P"],
  "madd9": ["1P 3m 5P 9M"]
}
;
},{}],"../node_modules/tonal-pcset/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chroma = chroma;
exports.chromas = chromas;
exports.modes = modes;
exports.isChroma = isChroma;
exports.intervals = intervals;
exports.isEqual = isEqual;
exports.isSubsetOf = isSubsetOf;
exports.isSupersetOf = isSupersetOf;
exports.includes = includes;
exports.filter = filter;

var _tonalNote = require("tonal-note");

var _tonalInterval = require("tonal-interval");

var _tonalArray = require("tonal-array");

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-pcset.svg?style=flat-square)](https://www.npmjs.com/package/tonal-pcset)
 * [![tonal](https://img.shields.io/badge/tonal-pcset-yellow.svg?style=flat-square)](https://www.npmjs.com/browse/keyword/tonal)
 *
 * `tonal-pcset` is a collection of functions to work with pitch class sets, oriented
 * to make comparations (isEqual, isSubset, isSuperset)
 *
 * This is part of [tonal](https://www.npmjs.com/package/tonal) music theory library.
 *
 * You can install via npm: `npm i --save tonal-pcset`
 *
 * ```js
 * // es6
 * import PcSet from "tonal-pcset"
 * var PcSet = require("tonal-pcset")
 *
 * PcSet.isEqual("c2 d5 e6", "c6 e3 d1") // => true
 * ```
 *
 * ## API documentation
 *
 * @module PcSet
 */
var chr = function (str) {
  return (0, _tonalNote.chroma)(str) || (0, _tonalInterval.chroma)(str) || 0;
};

var pcsetNum = function (set) {
  return parseInt(chroma(set), 2);
};

var clen = function (chroma) {
  return chroma.replace(/0/g, "").length;
};
/**
 * Get chroma of a pitch class set. A chroma identifies each set uniquely.
 * It"s a 12-digit binary each presenting one semitone of the octave.
 *
 * Note that this function accepts a chroma as parameter and return it
 * without modification.
 *
 * @param {Array|String} set - the pitch class set
 * @return {string} a binary representation of the pitch class set
 * @example
 * PcSet.chroma(["C", "D", "E"]) // => "1010100000000"
 */


function chroma(set) {
  if (isChroma(set)) {
    return set;
  }

  if (!Array.isArray(set)) {
    return "";
  }

  var b = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  set.map(chr).forEach(function (i) {
    b[i] = 1;
  });
  return b.join("");
}

var all = null;
/**
 * Get a list of all possible chromas (all possible scales)
 * More information: http://allthescales.org/
 * @return {Array} an array of possible chromas from '10000000000' to '11111111111'
 *
 */

function chromas(n) {
  all = all || (0, _tonalArray.range)(2048, 4095).map(function (n) {
    return n.toString(2);
  });
  return typeof n === "number" ? all.filter(function (chroma) {
    return clen(chroma) === n;
  }) : all.slice();
}
/**
 * Given a a list of notes or a pcset chroma, produce the rotations
 * of the chroma discarding the ones that starts with "0"
 *
 * This is used, for example, to get all the modes of a scale.
 *
 * @param {Array|String} set - the list of notes or pitchChr of the set
 * @param {Boolean} normalize - (Optional, true by default) remove all
 * the rotations that starts with "0"
 * @return {Array<String>} an array with all the modes of the chroma
 *
 * @example
 * PcSet.modes(["C", "D", "E"]).map(PcSet.intervals)
 */


function modes(set, normalize) {
  normalize = normalize !== false;
  var binary = chroma(set).split("");
  return (0, _tonalArray.compact)(binary.map(function (_, i) {
    var r = (0, _tonalArray.rotate)(i, binary);
    return normalize && r[0] === "0" ? null : r.join("");
  }));
}

var REGEX = /^[01]{12}$/;
/**
 * Test if the given string is a pitch class set chroma.
 * @param {string} chroma - the pitch class set chroma
 * @return {Boolean} true if its a valid pcset chroma
 * @example
 * PcSet.isChroma("101010101010") // => true
 * PcSet.isChroma("101001") // => false
 */

function isChroma(set) {
  return REGEX.test(set);
}

var IVLS = "1P 2m 2M 3m 3M 4P 5d 5P 6m 6M 7m 7M".split(" ");
/**
 * Given a pcset (notes or chroma) return it"s intervals
 * @param {String|Array} pcset - the pitch class set (notes or chroma)
 * @return {Array} intervals or empty array if not valid pcset
 * @example
 * PcSet.intervals("1010100000000") => ["1P", "2M", "3M"]
 */

function intervals(set) {
  if (!isChroma(set)) {
    return [];
  }

  return (0, _tonalArray.compact)(set.split("").map(function (d, i) {
    return d === "1" ? IVLS[i] : null;
  }));
}
/**
 * Test if two pitch class sets are identical
 *
 * @param {Array|String} set1 - one of the pitch class sets
 * @param {Array|String} set2 - the other pitch class set
 * @return {Boolean} true if they are equal
 * @example
 * PcSet.isEqual(["c2", "d3"], ["c5", "d2"]) // => true
 */


function isEqual(s1, s2) {
  if (arguments.length === 1) {
    return function (s) {
      return isEqual(s1, s);
    };
  }

  return chroma(s1) === chroma(s2);
}
/**
 * Create a function that test if a collection of notes is a
 * subset of a given set
 *
 * The function can be partially applied
 *
 * @param {Array|String} set - an array of notes or a chroma set string to test against
 * @param {Array|String} notes - an array of notes or a chroma set
 * @return {boolean} true if notes is a subset of set, false otherwise
 * @example
 * const inCMajor = PcSet.isSubsetOf(["C", "E", "G"])
 * inCMajor(["e6", "c4"]) // => true
 * inCMajor(["e6", "c4", "d3"]) // => false
 */


function isSubsetOf(set, notes) {
  if (arguments.length > 1) {
    return isSubsetOf(set)(notes);
  }

  set = pcsetNum(set);
  return function (notes) {
    notes = pcsetNum(notes);
    return notes !== set && (notes & set) === notes;
  };
}
/**
 * Create a function that test if a collectio of notes is a
 * superset of a given set (it contains all notes and at least one more)
 *
 * @param {Array|String} set - an array of notes or a chroma set string to test against
 * @param {Array|String} notes - an array of notes or a chroma set
 * @return {boolean} true if notes is a superset of set, false otherwise
 * @example
 * const extendsCMajor = PcSet.isSupersetOf(["C", "E", "G"])
 * extendsCMajor(["e6", "a", "c4", "g2"]) // => true
 * extendsCMajor(["c6", "e4", "g3"]) // => false
 */


function isSupersetOf(set, notes) {
  if (arguments.length > 1) {
    return isSupersetOf(set)(notes);
  }

  set = pcsetNum(set);
  return function (notes) {
    notes = pcsetNum(notes);
    return notes !== set && (notes | set) === notes;
  };
}
/**
 * Test if a given pitch class set includes a note
 * @param {Array|String} set - the base set to test against
 * @param {String|Pitch} note - the note to test
 * @return {Boolean} true if the note is included in the pcset
 * @example
 * PcSet.includes(["C", "D", "E"], "C4") // => true
 * PcSet.includes(["C", "D", "E"], "C#4") // => false
 */


function includes(set, note) {
  if (arguments.length > 1) {
    return includes(set)(note);
  }

  set = chroma(set);
  return function (note) {
    return set[chr(note)] === "1";
  };
}
/**
 * Filter a list with a pitch class set
 *
 * @param {Array|String} set - the pitch class set notes
 * @param {Array|String} notes - the note list to be filtered
 * @return {Array} the filtered notes
 *
 * @example
 * PcSet.filter(["C", "D", "E"], ["c2", "c#2", "d2", "c3", "c#3", "d3"]) // => [ "c2", "d2", "c3", "d3" ])
 * PcSet.filter(["C2"], ["c2", "c#2", "d2", "c3", "c#3", "d3"]) // => [ "c2", "c3" ])
 */


function filter(set, notes) {
  if (arguments.length === 1) {
    return function (n) {
      return filter(set, n);
    };
  }

  return notes.filter(includes(set));
}
},{"tonal-note":"../node_modules/tonal-note/build/es6.js","tonal-interval":"../node_modules/tonal-interval/build/es6.js","tonal-array":"../node_modules/tonal-array/build/es6.js"}],"../node_modules/tonal-dictionary/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pcset = exports.chord = exports.scale = exports.combine = exports.dictionary = void 0;

var _scales = _interopRequireDefault(require("./data/scales.json"));

var _chords = _interopRequireDefault(require("./data/chords.json"));

var _tonalPcset = require("tonal-pcset");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-dictionary.svg)](https://www.npmjs.com/package/tonal-dictionary)
 *
 * `tonal-dictionary` contains a dictionary of musical scales and chords
 *
 * This is part of [tonal](https://www.npmjs.com/package/tonal) music theory library.
 *
 * @example
 * // es6
 * import * as Dictionary from "tonal-dictionary"
 * // es5
 * const Dictionary = require("tonal-dictionary")
 *
 * @example
 * Dictionary.chord("Maj7") // => ["1P", "3M", "5P", "7M"]
 *
 * @module Dictionary
 */
var dictionary = function (raw) {
  var keys = Object.keys(raw).sort();
  var data = [];
  var index = [];

  var add = function (name, ivls, chroma) {
    data[name] = ivls;
    index[chroma] = index[chroma] || [];
    index[chroma].push(name);
  };

  keys.forEach(function (key) {
    var ivls = raw[key][0].split(" ");
    var alias = raw[key][1];
    var chr = (0, _tonalPcset.chroma)(ivls);
    add(key, ivls, chr);

    if (alias) {
      alias.forEach(function (a) {
        return add(a, ivls, chr);
      });
    }
  });
  var allKeys = Object.keys(data).sort();

  var dict = function (name) {
    return data[name];
  };

  dict.names = function (p) {
    if (typeof p === "string") {
      return (index[p] || []).slice();
    } else {
      return (p === true ? allKeys : keys).slice();
    }
  };

  return dict;
};

exports.dictionary = dictionary;

var combine = function (a, b) {
  var dict = function (name) {
    return a(name) || b(name);
  };

  dict.names = function (p) {
    return a.names(p).concat(b.names(p));
  };

  return dict;
};
/**
 * A dictionary of scales: a function that given a scale name (without tonic)
 * returns an array of intervals
 *
 * @function
 * @param {string} name
 * @return {Array} intervals
 * @example
 * import { scale } from "tonal-dictionary"
 * scale("major") // => ["1P", "2M", ...]
 * scale.names(); // => ["major", ...]
 */


exports.combine = combine;
var scale = dictionary(_scales.default);
/**
 * A dictionary of chords: a function that given a chord type
 * returns an array of intervals
 *
 * @function
 * @param {string} type
 * @return {Array} intervals
 * @example
 * import { chord } from "tonal-dictionary"
 * chord("Maj7") // => ["1P", "3M", ...]
 * chord.names(); // => ["Maj3", ...]
 */

exports.scale = scale;
var chord = dictionary(_chords.default);
exports.chord = chord;
var pcset = combine(scale, chord);
exports.pcset = pcset;
},{"./data/scales.json":"../node_modules/tonal-dictionary/build/data/scales.json","./data/chords.json":"../node_modules/tonal-dictionary/build/data/chords.json","tonal-pcset":"../node_modules/tonal-pcset/build/es6.js"}],"../node_modules/tonal-scale/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notes = notes;
exports.exists = exists;
exports.tokenize = tokenize;
exports.subsets = exports.supersets = exports.toScale = exports.chords = exports.modeNames = exports.intervals = exports.names = exports.props = void 0;

var _tonalNote = require("tonal-note");

var _tonalPcset = require("tonal-pcset");

var _tonalDistance = require("tonal-distance");

var _tonalDictionary = require("tonal-dictionary");

var _tonalArray = require("tonal-array");

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-scale.svg?style=flat-square)](https://www.npmjs.com/package/tonal-scale)
 *
 * A scale is a collection of pitches in ascending or descending order.
 *
 * This module provides functions to get and manipulate scales.
 *
 * @example
 * // es6
 * import * as Scale from "tonal-scale"
 * // es5
 * const Scale = require("tonal-scale");
 *
 * @example
 * Scale.notes("Ab bebop") // => [ "Ab", "Bb", "C", "Db", "Eb", "F", "Gb", "G" ]
 * Scale.names() => ["major", "minor", ...]
 * @module Scale
 */
var NO_SCALE = Object.freeze({
  name: null,
  intervals: [],
  names: [],
  chroma: null,
  setnum: null
});

var properties = function (name) {
  var intervals = (0, _tonalDictionary.scale)(name);

  if (!intervals) {
    return NO_SCALE;
  }

  var s = {
    intervals: intervals,
    name: name
  };
  s.chroma = (0, _tonalPcset.chroma)(intervals);
  s.setnum = parseInt(s.chroma, 2);
  s.names = _tonalDictionary.scale.names(s.chroma);
  return Object.freeze(s);
};

var memoize = function (fn, cache) {
  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};
/**
 * Get scale properties. It returns an object with:
 * - name: the scale name
 * - names: a list with all possible names (includes the current)
 * - intervals: an array with the scale intervals
 * - chroma:  scale croma (see pcset)
 * - setnum: scale chroma number
 *
 * @function
 * @param {string} name - the scale name (without tonic)
 * @return {Object}
 */


var props = memoize(properties, {});
/**
 * Return the available scale names
 *
 * @function
 * @param {boolean} [aliases=false] - true to include aliases
 * @return {Array} the scale names
 *
 * @example
 * Scale.names() // => ["maj7", ...]
 */

exports.props = props;
var names = _tonalDictionary.scale.names;
/**
 * Given a scale name, return its intervals. The name can be the type and
 * optionally the tonic (which is ignored)
 *
 * It retruns an empty array when no scale found
 *
 * @function
 * @param {string} name - the scale name (tonic and type, tonic is optional)
 * @return {Array<string>} the scale intervals if is a known scale or an empty
 * array if no scale found
 * @example
 * Scale.intervals("major") // => [ "1P", "2M", "3M", "4P", "5P", "6M", "7M" ]
 */

exports.names = names;

var intervals = function (name) {
  var p = tokenize(name);
  return props(p[1]).intervals;
};
/**
 * Get the notes (pitch classes) of a scale.
 *
 * Note that it always returns an array, and the values are only pitch classes.
 *
 * @function
 * @param {string} tonic
 * @param {string} nameOrTonic - the scale name or tonic (if 2nd param)
 * @param {string} [name] - the scale name without tonic
 * @return {Array} a pitch classes array
 *
 * @example
 * Scale.notes("C", "major") // => [ "C", "D", "E", "F", "G", "A", "B" ]
 * Scale.notes("C major") // => [ "C", "D", "E", "F", "G", "A", "B" ]
 * Scale.notes("C4", "major") // => [ "C", "D", "E", "F", "G", "A", "B" ]
 * Scale.notes("A4", "no-scale") // => []
 * Scale.notes("blah", "major") // => []
 */


exports.intervals = intervals;

function notes(nameOrTonic, name) {
  var p = tokenize(nameOrTonic);
  name = name || p[1];
  return intervals(name).map((0, _tonalDistance.transpose)(p[0]));
}
/**
 * Check if the given name is a known scale from the scales dictionary
 *
 * @function
 * @param {string} name - the scale name
 * @return {Boolean}
 */


function exists(name) {
  var p = tokenize(name);
  return (0, _tonalDictionary.scale)(p[1]) !== undefined;
}
/**
 * Given a string with a scale name and (optionally) a tonic, split
 * that components.
 *
 * It retuns an array with the form [ name, tonic ] where tonic can be a
 * note name or null and name can be any arbitrary string
 * (this function doesn"t check if that scale name exists)
 *
 * @function
 * @param {string} name - the scale name
 * @return {Array} an array [tonic, name]
 * @example
 * Scale.tokenize("C mixolydean") // => ["C", "mixolydean"]
 * Scale.tokenize("anything is valid") // => ["", "anything is valid"]
 * Scale.tokenize() // => ["", ""]
 */


function tokenize(str) {
  if (typeof str !== "string") {
    return ["", ""];
  }

  var i = str.indexOf(" ");
  var tonic = (0, _tonalNote.name)(str.substring(0, i)) || (0, _tonalNote.name)(str) || "";
  var name = tonic !== "" ? str.substring(tonic.length + 1) : str;
  return [tonic, name.length ? name : ""];
}
/**
 * Find mode names of a scale
 *
 * @function
 * @param {string} name - scale name
 * @example
 * Scale.modeNames("C pentatonic") // => [
 *   ["C", "major pentatonic"],
 *   ["D", "egyptian"],
 *   ["E", "malkos raga"],
 *   ["G", "ritusen"],
 *   ["A", "minor pentatonic"]
 * ]
 */


var modeNames = function (name) {
  var ivls = intervals(name);
  var tonics = notes(name);
  return (0, _tonalPcset.modes)(ivls).map(function (chroma, i) {
    var name = _tonalDictionary.scale.names(chroma)[0];

    if (name) {
      return [tonics[i] || ivls[i], name];
    }
  }).filter(function (x) {
    return x;
  });
};
/**
 * Get all chords that fits a given scale
 *
 * @function
 * @param {string} name - the scale name
 * @return {Array<string>} - the chord names
 *
 * @example
 * Scale.chords("pentatonic") // => ["5", "64", "M", "M6", "Madd9", "Msus2"]
 */


exports.modeNames = modeNames;

var chords = function (name) {
  var inScale = (0, _tonalPcset.isSubsetOf)(intervals(name));
  return _tonalDictionary.chord.names().filter(function (name) {
    return inScale((0, _tonalDictionary.chord)(name));
  });
};
/**
 * Given an array of notes, return the scale: a pitch class set starting from
 * the first note of the array
 *
 * @function
 * @param {Array} notes
 * @return {Array}
 * @example
 * Scale.toScale(['C4', 'c3', 'C5', 'C4', 'c4']) // => ["C"]
 * Scale.toScale(['D4', 'c#5', 'A5', 'F#6']) // => ["D", "F#", "A", "C#"]
 */


exports.chords = chords;

var toScale = function (notes) {
  var pcset = (0, _tonalArray.compact)(notes.map(_tonalNote.pc));

  if (!pcset.length) {
    return pcset;
  }

  var tonic = pcset[0];
  var scale = (0, _tonalArray.unique)(pcset);
  return (0, _tonalArray.rotate)(scale.indexOf(tonic), scale);
};
/**
 * Get all scales names that are a superset of the given one
 * (has the same notes and at least one more)
 *
 * @function
 * @param {string} name
 * @return {Array} a list of scale names
 * @example
 * Scale.supersets("major") // => ["bebop", "bebop dominant", "bebop major", "chromatic", "ichikosucho"]
 */


exports.toScale = toScale;

var supersets = function (name) {
  if (!intervals(name).length) {
    return [];
  }

  var isSuperset = (0, _tonalPcset.isSupersetOf)(intervals(name));
  return _tonalDictionary.scale.names().filter(function (name) {
    return isSuperset((0, _tonalDictionary.scale)(name));
  });
};
/**
 * Find all scales names that are a subset of the given one
 * (has less notes but all from the given scale)
 *
 * @function
 * @param {string} name
 * @return {Array} a list of scale names
 *
 * @example
 * Scale.subsets("major") // => ["ionian pentatonic", "major pentatonic", "ritusen"]
 */


exports.supersets = supersets;

var subsets = function (name) {
  var isSubset = (0, _tonalPcset.isSubsetOf)(intervals(name));
  return _tonalDictionary.scale.names().filter(function (name) {
    return isSubset((0, _tonalDictionary.scale)(name));
  });
};

exports.subsets = subsets;
},{"tonal-note":"../node_modules/tonal-note/build/es6.js","tonal-pcset":"../node_modules/tonal-pcset/build/es6.js","tonal-distance":"../node_modules/tonal-distance/build/es6.js","tonal-dictionary":"../node_modules/tonal-dictionary/build/es6.js","tonal-array":"../node_modules/tonal-array/build/es6.js"}],"../node_modules/tonal-chord/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notes = notes;
exports.tokenize = tokenize;
exports.subsets = exports.supersets = exports.exists = exports.intervals = exports.props = exports.names = void 0;

var _tonalNote = require("tonal-note");

var _tonalDistance = require("tonal-distance");

var _tonalDictionary = require("tonal-dictionary");

var _tonalPcset = require("tonal-pcset");

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-chord.svg)](https://www.npmjs.com/package/tonal-chord)
 * [![tonal](https://img.shields.io/badge/tonal-chord-yellow.svg)](https://www.npmjs.com/browse/keyword/tonal)
 *
 * `tonal-chord` is a collection of functions to manipulate musical chords
 *
 * This is part of [tonal](https://www.npmjs.com/package/tonal) music theory library.
 *
 * @example
 * // es6
 * import * as Chord from "tonal-chord"
 * // es5
 * const Chord = require("tonal-chord")
 *
 * @example
 * Chord.notes("CMaj7") // => ["C", "E", "G", "B"]
 *
 * @module Chord
 */

/**
 * Return the available chord names
 *
 * @function
 * @param {boolean} aliases - true to include aliases
 * @return {Array} the chord names
 *
 * @example
 * Chord.names() // => ["maj7", ...]
 */
var names = _tonalDictionary.chord.names;
exports.names = names;
var NO_CHORD = Object.freeze({
  name: null,
  names: [],
  intervals: [],
  chroma: null,
  setnum: null
});

var properties = function (name) {
  var intervals = (0, _tonalDictionary.chord)(name);

  if (!intervals) {
    return NO_CHORD;
  }

  var s = {
    intervals: intervals,
    name: name
  };
  s.chroma = (0, _tonalPcset.chroma)(intervals);
  s.setnum = parseInt(s.chroma, 2);
  s.names = _tonalDictionary.chord.names(s.chroma);
  return s;
};

var memo = function (fn, cache) {
  if (cache === void 0) cache = {};
  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};
/**
 * Get chord properties. It returns an object with:
 *
 * - name: the chord name
 * - names: a list with all possible names (includes the current)
 * - intervals: an array with the chord intervals
 * - chroma:  chord croma (see pcset)
 * - setnum: chord chroma number
 *
 * @function
 * @param {string} name - the chord name (without tonic)
 * @return {Object} an object with the properties or a object with all properties
 * set to null if not valid chord name
 */


var props = memo(properties);
/**
 * Get chord intervals. It always returns an array
 *
 * @function
 * @param {string} name - the chord name (optionally a tonic and type)
 * @return {Array<String>} a list of intervals or null if the type is not known
 */

exports.props = props;

var intervals = function (name) {
  return props(tokenize(name)[1]).intervals;
};
/**
 * Get the chord notes of a chord. This function accepts either a chord name
 * (for example: "Cmaj7") or a list of notes.
 *
 * It always returns an array, even if the chord is not found.
 *
 * @function
 * @param {string} nameOrTonic - name of the chord or the tonic (if the second parameter is present)
 * @param {string} [name] - (Optional) name if the first parameter is the tonic
 * @return {Array} an array of notes or an empty array
 *
 * @example
 * Chord.notes("Cmaj7") // => ["C", "E", "G", "B"]
 * Chord.notes("C", "maj7") // => ["C", "E", "G", "B"]
 */


exports.intervals = intervals;

function notes(nameOrTonic, name) {
  if (name) {
    return props(name).intervals.map((0, _tonalDistance.transpose)(nameOrTonic));
  }

  var ref = tokenize(nameOrTonic);
  var tonic = ref[0];
  var type = ref[1];
  return props(type).intervals.map((0, _tonalDistance.transpose)(tonic));
}
/**
 * Check if a given name correspond to a chord in the dictionary
 *
 * @function
 * @param {string} name
 * @return {Boolean}
 * @example
 * Chord.exists("CMaj7") // => true
 * Chord.exists("Maj7") // => true
 * Chord.exists("Ablah") // => false
 */


var exists = function (name) {
  return (0, _tonalDictionary.chord)(tokenize(name)[1]) !== undefined;
};
/**
 * Get all chords names that are a superset of the given one
 * (has the same notes and at least one more)
 *
 * @function
 * @param {string} name
 * @return {Array} a list of chord names
 */


exports.exists = exists;

var supersets = function (name) {
  if (!intervals(name).length) {
    return [];
  }

  var isSuperset = (0, _tonalPcset.isSupersetOf)(intervals(name));
  return _tonalDictionary.chord.names().filter(function (name) {
    return isSuperset((0, _tonalDictionary.chord)(name));
  });
};
/**
 * Find all chords names that are a subset of the given one
 * (has less notes but all from the given chord)
 *
 * @function
 * @param {string} name
 * @return {Array} a list of chord names
 */


exports.supersets = supersets;

var subsets = function (name) {
  var isSubset = (0, _tonalPcset.isSubsetOf)(intervals(name));
  return _tonalDictionary.chord.names().filter(function (name) {
    return isSubset((0, _tonalDictionary.chord)(name));
  });
}; // 6, 64, 7, 9, 11 and 13 are consider part of the chord
// (see https://github.com/danigb/tonal/issues/55)


exports.subsets = subsets;
var NUM_TYPES = /^(6|64|7|9|11|13)$/;
/**
 * Tokenize a chord name. It returns an array with the tonic and chord type
 * If not tonic is found, all the name is considered the chord name.
 *
 * This function does NOT check if the chord type exists or not. It only tries
 * to split the tonic and chord type.
 *
 * @function
 * @param {string} name - the chord name
 * @return {Array} an array with [tonic, type]
 * @example
 * Chord.tokenize("Cmaj7") // => [ "C", "maj7" ]
 * Chord.tokenize("C7") // => [ "C", "7" ]
 * Chord.tokenize("mMaj7") // => [ "", "mMaj7" ]
 * Chord.tokenize("Cnonsense") // => [ "C", "nonsense" ]
 */

function tokenize(name) {
  var p = (0, _tonalNote.tokenize)(name);

  if (p[0] === "") {
    return ["", name];
  } // aug is augmented (see https://github.com/danigb/tonal/issues/55)


  if (p[0] === "A" && p[3] === "ug") {
    return ["", "aug"];
  }

  if (NUM_TYPES.test(p[2])) {
    return [p[0] + p[1], p[2] + p[3]];
  } else {
    return [p[0] + p[1] + p[2], p[3]];
  }
}
},{"tonal-note":"../node_modules/tonal-note/build/es6.js","tonal-distance":"../node_modules/tonal-distance/build/es6.js","tonal-dictionary":"../node_modules/tonal-dictionary/build/es6.js","tonal-pcset":"../node_modules/tonal-pcset/build/es6.js"}],"../node_modules/tonal/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PcSet = exports.Chord = exports.Scale = exports.Dictionary = exports.Distance = exports.Interval = exports.Note = exports.Array = exports.scale = exports.chord = exports.freq = exports.midi = exports.note = exports.interval = exports.transpose = void 0;

var Array = _interopRequireWildcard(require("tonal-array"));

exports.Array = Array;

var Note = _interopRequireWildcard(require("tonal-note"));

exports.Note = Note;

var Interval = _interopRequireWildcard(require("tonal-interval"));

exports.Interval = Interval;

var Distance = _interopRequireWildcard(require("tonal-distance"));

exports.Distance = Distance;

var Dictionary = _interopRequireWildcard(require("tonal-dictionary"));

exports.Dictionary = Dictionary;

var Scale = _interopRequireWildcard(require("tonal-scale"));

exports.Scale = Scale;

var Chord = _interopRequireWildcard(require("tonal-chord"));

exports.Chord = Chord;

var PcSet = _interopRequireWildcard(require("tonal-pcset"));

exports.PcSet = PcSet;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-key.svg?style=flat-square)](https://www.npmjs.com/package/tonal-key)
 *
 * The `Tonal` module is a facade to the rest of the modules. They are namespaced,
 * so for example to use `pc` function from `tonal-note` you have to write:
 * `Tonal.Note.pc`
 *
 * It exports the following modules:
 * - Note
 * - Interval
 * - Distance
 * - Scale
 * - Chord
 * - PcSet
 *
 * Additionally this facade exports some functions without namespace (see "Methods" below)
 *
 * @example
 * // es6 modules
 * import * as Tonal from "tonal"
 * Tonal.Note.name("cx") // => "C##"
 *
 * @example
 * import { Note } from "tonal"
 * Note.name("bb") // => "Bb"
 *
 * @example
 * // es5 node modules
 * var Tonal = require("tonal");
 * Tonal.Distance.transpose(Tonal.Note.pc("C#2"), "M3") // => "E#"
 * Tonal.Chord.notes("Dmaj7") // => ["D", "F#", "A", "C#"]
 *
 * @module Tonal
 */

/**
 * Transpose a note by an interval
 * @function
 * @param {string} note
 * @param {string} interval
 * @return {string} the transported note
 * @see Distance.transpose
 */
const transpose = Distance.transpose;
/**
 * Get the interval from two notes
 * @function
 * @param {string} from
 * @param {string} to
 * @return {string} the interval in reverse shorthand notation
 * @see Distance.interval
 */

exports.transpose = transpose;
const interval = Distance.interval;
/**
 * Get note properties
 * @function
 * @param {string} note - the note name
 * @return {Object}
 * @see Note.props
 * @example
 * Tonal.note("A4").chroma // => 9
 */

exports.interval = interval;
const note = Note.props;
/**
 * Get midi note number
 * @function
 * @param {string} note
 * @return {Number}
 * @see Note.midi
 * @example
 * Tonal.midi("A4") // => 49
 */

exports.note = note;
const midi = Note.midi;
/**
 * Get note frequency using equal tempered tuning at 440
 * @function
 * @param {string} note
 * @return {Number}
 * @see Note.freq
 * @example
 * Tonal.freq("A4") // => 440
 */

exports.midi = midi;
const freq = Note.freq;
/**
 * Get intervals from a chord type
 * @function
 * @param {string} type - the chord type (no tonic)
 * @return {Array} an array of intervals or undefined if the chord type is not known
 * @see Dictionary.chord
 * @example
 * Tonal.chord("m7b5") // => ["1P", "3m", "5d", "7m"]
 */

exports.freq = freq;
const chord = Dictionary.chord;
/**
 * Get intervals from scale name
 * @function
 * @param {string} name - the scale name (without tonic)
 * @return {Array} an array of intervals or undefiend if the scale is not kown
 * @example
 * Tonal.scale("major") // => ["1P", "2M", "3M"...]
 */

exports.chord = chord;
const scale = Dictionary.scale;
exports.scale = scale;
},{"tonal-array":"../node_modules/tonal-array/build/es6.js","tonal-note":"../node_modules/tonal-note/build/es6.js","tonal-interval":"../node_modules/tonal-interval/build/es6.js","tonal-distance":"../node_modules/tonal-distance/build/es6.js","tonal-dictionary":"../node_modules/tonal-dictionary/build/es6.js","tonal-scale":"../node_modules/tonal-scale/build/es6.js","tonal-chord":"../node_modules/tonal-chord/build/es6.js","tonal-pcset":"../node_modules/tonal-pcset/build/es6.js"}],"../node_modules/tone/build/Tone.js":[function(require,module,exports) {
var define;
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Tone=e():t.Tone=e()}("undefined"!=typeof self?self:this,function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},i.r=function(t){Object.defineProperty(t,"__esModule",{value:!0})},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=155)}([function(t,e,i){(function(n){var o,s;
/**
 *  Tone.js
 *  @author Yotam Mann
 *  @license http://opensource.org/licenses/MIT MIT License
 *  @copyright 2014-2019 Yotam Mann
 */o=[i(153)],void 0===(s=function(t){"use strict";var e=function(){if(!(this instanceof e))throw new Error("constructor needs to be called with the 'new' keyword")};return e.prototype.toString=function(){for(var t in e){var i=t[0].match(/^[A-Z]$/),n=e[t]===this.constructor;if(e.isFunction(e[t])&&i&&n)return t}return"Tone"},e.prototype.dispose=function(){return this},e.prototype.set=function(t,i,n){if(e.isObject(t))n=i;else if(e.isString(t)){var o={};o[t]=i,t=o}t:for(var s in t){i=t[s];var r=this;if(-1!==s.indexOf(".")){for(var a=s.split("."),l=0;l<a.length-1;l++)if((r=r[a[l]])instanceof e){a.splice(0,l+1);var h=a.join(".");r.set(h,i);continue t}s=a[a.length-1]}var u=r[s];e.isUndef(u)||(e.Signal&&u instanceof e.Signal||e.Param&&u instanceof e.Param?u.value!==i&&(e.isUndef(n)?u.value=i:u.rampTo(i,n)):u instanceof AudioParam?u.value!==i&&(u.value=i):e.TimeBase&&u instanceof e.TimeBase?r[s]=i:u instanceof e?u.set(i):u!==i&&(r[s]=i))}return this},e.prototype.get=function(t){e.isUndef(t)?t=this._collectDefaults(this.constructor):e.isString(t)&&(t=[t]);for(var i={},n=0;n<t.length;n++){var o=t[n],s=this,r=i;if(-1!==o.indexOf(".")){for(var a=o.split("."),l=0;l<a.length-1;l++){var h=a[l];r[h]=r[h]||{},r=r[h],s=s[h]}o=a[a.length-1]}var u=s[o];e.isObject(t[o])?r[o]=u.get():e.Signal&&u instanceof e.Signal?r[o]=u.value:e.Param&&u instanceof e.Param?r[o]=u.value:u instanceof AudioParam?r[o]=u.value:u instanceof e?r[o]=u.get():!e.isFunction(u)&&e.isDefined(u)&&(r[o]=u)}return i},e.prototype._collectDefaults=function(t){var i=[];if(e.isDefined(t.defaults)&&(i=Object.keys(t.defaults)),e.isDefined(t._super))for(var n=this._collectDefaults(t._super),o=0;o<n.length;o++)-1===i.indexOf(n[o])&&i.push(n[o]);return i},e.defaults=function(t,i,n){var o={};if(1===t.length&&e.isObject(t[0]))o=t[0];else for(var s=0;s<i.length;s++)o[i[s]]=t[s];return e.isDefined(n.defaults)?e.defaultArg(o,n.defaults):e.isObject(n)?e.defaultArg(o,n):o},e.defaultArg=function(t,i){if(e.isObject(t)&&e.isObject(i)){var n={};for(var o in t)n[o]=e.defaultArg(i[o],t[o]);for(var s in i)n[s]=e.defaultArg(t[s],i[s]);return n}return e.isUndef(t)?i:t},e.prototype.log=function(){if(this.debug||this.toString()===e.global.TONE_DEBUG_CLASS){var t=Array.from(arguments);t.unshift(this.toString()+":"),console.log.apply(void 0,t)}},e.prototype.assert=function(t,e){if(!t)throw new Error(e)},e.connectSeries=function(){for(var t=arguments[0],i=1;i<arguments.length;i++){var n=arguments[i];t.connect(n),t=n}return e},e.isUndef=function(t){return void 0===t},e.isDefined=function(t){return!e.isUndef(t)},e.isFunction=function(t){return"function"==typeof t},e.isNumber=function(t){return"number"==typeof t},e.isObject=function(t){return"[object Object]"===Object.prototype.toString.call(t)&&t.constructor===Object},e.isBoolean=function(t){return"boolean"==typeof t},e.isArray=function(t){return Array.isArray(t)},e.isString=function(t){return"string"==typeof t},e.isNote=function(t){return e.isString(t)&&/^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(t)},e.noOp=function(){},e.prototype._readOnly=function(t){if(Array.isArray(t))for(var e=0;e<t.length;e++)this._readOnly(t[e]);else Object.defineProperty(this,t,{writable:!1,enumerable:!0})},e.prototype._writable=function(t){if(Array.isArray(t))for(var e=0;e<t.length;e++)this._writable(t[e]);else Object.defineProperty(this,t,{writable:!0})},e.State={Started:"started",Stopped:"stopped",Paused:"paused"},e.global=e.isUndef(n)?window:n,e.equalPowerScale=function(t){var e=.5*Math.PI;return Math.sin(t*e)},e.dbToGain=function(t){return Math.pow(10,t/20)},e.gainToDb=function(t){return Math.log(t)/Math.LN10*20},e.intervalToFrequencyRatio=function(t){return Math.pow(2,t/12)},e.prototype.now=function(){return e.context.now()},e.now=function(){return e.context.now()},e.prototype.immediate=function(){return e.context.currentTime},e.immediate=function(){return e.context.currentTime},e.extend=function(t,i){function n(){}e.isUndef(i)&&(i=e),n.prototype=i.prototype,t.prototype=new n,t.prototype.constructor=t,t._super=i},e._audioContext=null,e.start=function(){return e.context.resume()},Object.defineProperty(e,"context",{get:function(){return e._audioContext},set:function(t){t.isContext?e._audioContext=t:e._audioContext=new e.Context(t),e.Context.emit("init",e._audioContext)}}),Object.defineProperty(e.prototype,"context",{get:function(){return e.context}}),e.setContext=function(t){e.context=t},Object.defineProperty(e.prototype,"blockTime",{get:function(){return 128/this.context.sampleRate}}),Object.defineProperty(e.prototype,"sampleTime",{get:function(){return 1/this.context.sampleRate}}),Object.defineProperty(e,"supported",{get:function(){var t=e.global.hasOwnProperty("AudioContext")||e.global.hasOwnProperty("webkitAudioContext"),i=e.global.hasOwnProperty("Promise");return t&&i}}),Object.defineProperty(e,"initialized",{get:function(){return Boolean(e.context)}}),e.getContext=function(t){if(e.initialized)t(e.context);else{var i=function(){t(e.context),e.Context.off("init",i)};e.Context.on("init",i)}return e},e.version=t,e}.apply(e,o))||(t.exports=s)}).call(this,i(154))},function(t,e,i){var n,o;n=[i(0),i(7),i(4),i(14),i(97),i(3)],void 0===(o=function(t){"use strict";return t.Signal=function(){var e=t.defaults(arguments,["value","units"],t.Signal);t.Param.call(this,e),this._constantSource=this.context.createConstantSource(),this._constantSource.start(0),this._param=this._constantSource.offset,this.value=e.value,this.output=this._constantSource,this.input=this._param=this.output.offset},t.extend(t.Signal,t.Param),t.Signal.defaults={value:0,units:t.Type.Default,convert:!0},t.Signal.prototype.connect=t.SignalBase.prototype.connect,t.Signal.prototype.disconnect=t.SignalBase.prototype.disconnect,t.Signal.prototype.getValueAtTime=function(e){return this._param.getValueAtTime?this._param.getValueAtTime(e):t.Param.prototype.getValueAtTime.call(this,e)},t.Signal.prototype.dispose=function(){return t.Param.prototype.dispose.call(this),this._constantSource.disconnect(),this._constantSource=null,this},t.Signal}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(20)],void 0===(o=function(t){return t.AudioNode=function(){t.call(this);var e=t.defaults(arguments,["context"],{context:t.context});this._context=e.context},t.extend(t.AudioNode),Object.defineProperty(t.AudioNode.prototype,"context",{get:function(){return this._context}}),t.AudioNode.prototype.createInsOuts=function(t,e){1===t?this.input=this.context.createGain():t>1&&(this.input=new Array(t)),1===e?this.output=this.context.createGain():e>1&&(this.output=new Array(e))},Object.defineProperty(t.AudioNode.prototype,"channelCount",{get:function(){return this.output.channelCount},set:function(t){return this.output.channelCount=t}}),Object.defineProperty(t.AudioNode.prototype,"channelCountMode",{get:function(){return this.output.channelCountMode},set:function(t){return this.output.channelCountMode=t}}),Object.defineProperty(t.AudioNode.prototype,"channelInterpretation",{get:function(){return this.output.channelInterpretation},set:function(t){return this.output.channelInterpretation=t}}),Object.defineProperty(t.AudioNode.prototype,"numberOfInputs",{get:function(){return this.input?t.isArray(this.input)?this.input.length:1:0}}),Object.defineProperty(t.AudioNode.prototype,"numberOfOutputs",{get:function(){return this.output?t.isArray(this.output)?this.output.length:1:0}}),t.AudioNode.prototype.connect=function(e,i,n){return t.isArray(this.output)?(i=t.defaultArg(i,0),this.output[i].connect(e,0,n)):this.output.connect(e,i,n),this},t.AudioNode.prototype.disconnect=function(e,i,n){t.isArray(this.output)?t.isNumber(e)?this.output[e].disconnect():(i=t.defaultArg(i,0),this.output[i].disconnect(e,0,n)):this.output.disconnect.apply(this.output,arguments)},t.AudioNode.prototype.chain=function(){for(var t=this,e=0;e<arguments.length;e++){var i=arguments[e];t.connect(i),t=i}return this},t.AudioNode.prototype.fan=function(){for(var t=0;t<arguments.length;t++)this.connect(arguments[t]);return this},t.global.AudioNode&&(AudioNode.prototype.chain=t.AudioNode.prototype.chain,AudioNode.prototype.fan=t.AudioNode.prototype.fan),t.AudioNode.prototype.dispose=function(){return t.isDefined(this.input)&&(this.input instanceof AudioNode&&this.input.disconnect(),this.input=null),t.isDefined(this.output)&&(this.output instanceof AudioNode&&this.output.disconnect(),this.output=null),this._context=null,this},t.AudioNode}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(14),i(4),i(2)],void 0===(o=function(t){"use strict";return t.Gain=function(){var e=t.defaults(arguments,["gain","units"],t.Gain);t.AudioNode.call(this,e),this.input=this.output=this._gainNode=this.context.createGain(),this.gain=new t.Param({param:this._gainNode.gain,units:e.units,value:e.gain,convert:e.convert}),this._readOnly("gain")},t.extend(t.Gain,t.AudioNode),t.Gain.defaults={gain:1,convert:!0},t.Gain.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this),this._gainNode.disconnect(),this._gainNode=null,this._writable("gain"),this.gain.dispose(),this.gain=null},t.Gain}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(65),i(46),i(45),i(20)],void 0===(o=function(t){return t.Type={Default:"number",Time:"time",Frequency:"frequency",TransportTime:"transportTime",Ticks:"ticks",NormalRange:"normalRange",AudioRange:"audioRange",Decibels:"db",Interval:"interval",BPM:"bpm",Positive:"positive",Gain:"gain",Cents:"cents",Degrees:"degrees",MIDI:"midi",BarsBeatsSixteenths:"barsBeatsSixteenths",Samples:"samples",Hertz:"hertz",Note:"note",Milliseconds:"milliseconds",Seconds:"seconds",Notation:"notation"},t.prototype.toSeconds=function(e){return t.isNumber(e)?e:t.isUndef(e)?this.now():t.isString(e)||t.isObject(e)?new t.Time(e).toSeconds():e instanceof t.TimeBase?e.toSeconds():void 0},t.prototype.toFrequency=function(e){return t.isNumber(e)?e:t.isString(e)||t.isUndef(e)||t.isObject(e)?new t.Frequency(e).valueOf():e instanceof t.TimeBase?e.toFrequency():void 0},t.prototype.toTicks=function(e){return t.isNumber(e)||t.isString(e)||t.isObject(e)?new t.TransportTime(e).toTicks():t.isUndef(e)?t.Transport.ticks:e instanceof t.TimeBase?e.toTicks():void 0},t}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(14),i(3),i(36)],void 0===(o=function(t){"use strict";return t.Multiply=function(e){t.Signal.call(this),this.createInsOuts(2,0),this._mult=this.input[0]=this.output=new t.Gain,this._param=this.input[1]=this.output.gain,this.value=t.defaultArg(e,0),this.proxy=!1},t.extend(t.Multiply,t.Signal),t.Multiply.prototype.dispose=function(){return t.Signal.prototype.dispose.call(this),this._mult.dispose(),this._mult=null,this._param=null,this},t.Multiply}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(16),i(27),i(40),i(4),i(33),i(1),i(2)],void 0===(o=function(t){"use strict";return t.Source=function(e){e=t.defaultArg(e,t.Source.defaults),t.AudioNode.call(this),this._volume=this.output=new t.Volume(e.volume),this.volume=this._volume.volume,this._readOnly("volume"),this._state=new t.TimelineState(t.State.Stopped),this._state.memory=100,this._synced=!1,this._scheduled=[],this._volume.output.output.channelCount=2,this._volume.output.output.channelCountMode="explicit",this.mute=e.mute},t.extend(t.Source,t.AudioNode),t.Source.defaults={volume:0,mute:!1},Object.defineProperty(t.Source.prototype,"state",{get:function(){return this._synced?t.Transport.state===t.State.Started?this._state.getValueAtTime(t.Transport.seconds):t.State.Stopped:this._state.getValueAtTime(this.now())}}),Object.defineProperty(t.Source.prototype,"mute",{get:function(){return this._volume.mute},set:function(t){this._volume.mute=t}}),t.Source.prototype._start=t.noOp,t.Source.prototype.restart=t.noOp,t.Source.prototype._stop=t.noOp,t.Source.prototype.start=function(e,i,n){if(e=t.isUndef(e)&&this._synced?t.Transport.seconds:this.toSeconds(e),this._state.getValueAtTime(e)===t.State.Started)this._state.cancel(e),this._state.setStateAtTime(t.State.Started,e),this.restart(e,i,n);else if(this._state.setStateAtTime(t.State.Started,e),this._synced){var o=this._state.get(e);o.offset=t.defaultArg(i,0),o.duration=n;var s=t.Transport.schedule(function(t){this._start(t,i,n)}.bind(this),e);this._scheduled.push(s),t.Transport.state===t.State.Started&&this._syncedStart(this.now(),t.Transport.seconds)}else this._start.apply(this,arguments);return this},t.Source.prototype.stop=function(e){if(e=t.isUndef(e)&&this._synced?t.Transport.seconds:this.toSeconds(e),this._synced){var i=t.Transport.schedule(this._stop.bind(this),e);this._scheduled.push(i)}else this._stop.apply(this,arguments);return this._state.cancel(e),this._state.setStateAtTime(t.State.Stopped,e),this},t.Source.prototype.sync=function(){return this._synced=!0,this._syncedStart=function(e,i){if(i>0){var n=this._state.get(i);if(n&&n.state===t.State.Started&&n.time!==i){var o,s=i-this.toSeconds(n.time);n.duration&&(o=this.toSeconds(n.duration)-s),this._start(e,this.toSeconds(n.offset)+s,o)}}}.bind(this),this._syncedStop=function(e){var i=t.Transport.getSecondsAtTime(Math.max(e-this.sampleTime,0));this._state.getValueAtTime(i)===t.State.Started&&this._stop(e)}.bind(this),t.Transport.on("start loopStart",this._syncedStart),t.Transport.on("stop pause loopEnd",this._syncedStop),this},t.Source.prototype.unsync=function(){this._synced&&(t.Transport.off("stop pause loopEnd",this._syncedStop),t.Transport.off("start loopStart",this._syncedStart)),this._synced=!1;for(var e=0;e<this._scheduled.length;e++){var i=this._scheduled[e];t.Transport.clear(i)}return this._scheduled=[],this._state.cancel(0),this},t.Source.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this),this.unsync(),this._scheduled=null,this._writable("volume"),this._volume.dispose(),this._volume=null,this.volume=null,this._state.dispose(),this._state=null},t.Source}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(36),i(98)],void 0===(o=function(t){"use strict";return t.WaveShaper=function(e,i){t.SignalBase.call(this),this._shaper=this.input=this.output=this.context.createWaveShaper(),this._curve=null,Array.isArray(e)?this.curve=e:isFinite(e)||t.isUndef(e)?this._curve=new Float32Array(t.defaultArg(e,1024)):t.isFunction(e)&&(this._curve=new Float32Array(t.defaultArg(i,1024)),this.setMap(e))},t.extend(t.WaveShaper,t.SignalBase),t.WaveShaper.prototype.setMap=function(t){for(var e=new Array(this._curve.length),i=0,n=this._curve.length;i<n;i++){var o=i/(n-1)*2-1;e[i]=t(o,i)}return this.curve=e,this},Object.defineProperty(t.WaveShaper.prototype,"curve",{get:function(){return this._shaper.curve},set:function(t){this._curve=new Float32Array(t),this._shaper.curve=this._curve}}),Object.defineProperty(t.WaveShaper.prototype,"oversample",{get:function(){return this._shaper.oversample},set:function(t){if(!["none","2x","4x"].includes(t))throw new RangeError("Tone.WaveShaper: oversampling must be either 'none', '2x', or '4x'");this._shaper.oversample=t}}),t.WaveShaper.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._shaper.disconnect(),this._shaper=null,this._curve=null,this},t.WaveShaper}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(23),i(2)],void 0===(o=function(t){"use strict";return t.Effect=function(){var e=t.defaults(arguments,["wet"],t.Effect);t.AudioNode.call(this),this.createInsOuts(1,1),this._dryWet=new t.CrossFade(e.wet),this.wet=this._dryWet.fade,this.effectSend=new t.Gain,this.effectReturn=new t.Gain,this.input.connect(this._dryWet.a),this.input.connect(this.effectSend),this.effectReturn.connect(this._dryWet.b),this._dryWet.connect(this.output),this._readOnly(["wet"])},t.extend(t.Effect,t.AudioNode),t.Effect.defaults={wet:1},t.Effect.prototype.connectEffect=function(t){return this.effectSend.chain(t,this.effectReturn),this},t.Effect.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._dryWet.dispose(),this._dryWet=null,this.effectSend.dispose(),this.effectSend=null,this.effectReturn.dispose(),this.effectReturn=null,this._writable(["wet"]),this.wet=null,this},t.Effect}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(2)],void 0===(o=function(t){"use strict";return t.Filter=function(){var e=t.defaults(arguments,["frequency","type","rolloff"],t.Filter);t.AudioNode.call(this),this.createInsOuts(1,1),this._filters=[],this.frequency=new t.Signal(e.frequency,t.Type.Frequency),this.detune=new t.Signal(0,t.Type.Cents),this.gain=new t.Signal({value:e.gain,convert:!0,type:t.Type.Decibels}),this.Q=new t.Signal(e.Q),this._type=e.type,this._rolloff=e.rolloff,this.rolloff=e.rolloff,this._readOnly(["detune","frequency","gain","Q"])},t.extend(t.Filter,t.AudioNode),t.Filter.defaults={type:"lowpass",frequency:350,rolloff:-12,Q:1,gain:0},Object.defineProperty(t.Filter.prototype,"type",{get:function(){return this._type},set:function(t){if(-1===["lowpass","highpass","bandpass","lowshelf","highshelf","notch","allpass","peaking"].indexOf(t))throw new TypeError("Tone.Filter: invalid type "+t);this._type=t;for(var e=0;e<this._filters.length;e++)this._filters[e].type=t}}),Object.defineProperty(t.Filter.prototype,"rolloff",{get:function(){return this._rolloff},set:function(e){e=parseInt(e,10);var i=[-12,-24,-48,-96].indexOf(e);if(-1===i)throw new RangeError("Tone.Filter: rolloff can only be -12, -24, -48 or -96");i+=1,this._rolloff=e,this.input.disconnect();for(var n=0;n<this._filters.length;n++)this._filters[n].disconnect(),this._filters[n]=null;this._filters=new Array(i);for(var o=0;o<i;o++){var s=this.context.createBiquadFilter();s.type=this._type,this.frequency.connect(s.frequency),this.detune.connect(s.detune),this.Q.connect(s.Q),this.gain.connect(s.gain),this._filters[o]=s}var r=[this.input].concat(this._filters).concat([this.output]);t.connectSeries.apply(t,r)}}),t.Filter.prototype.getFrequencyResponse=function(e){e=t.defaultArg(e,128);for(var i=new Float32Array(e).map(function(){return 1}),n=new Float32Array(e),o=0;o<e;o++){var s=19980*Math.pow(o/e,2)+20;n[o]=s}var r=new Float32Array(e),a=new Float32Array(e);return this._filters.forEach(function(){var t=this.context.createBiquadFilter();t.type=this._type,t.Q.value=this.Q.value,t.frequency.value=this.frequency.value,t.gain.value=this.gain.value,t.getFrequencyResponse(n,r,a),r.forEach(function(t,e){i[e]*=t})}.bind(this)),i},t.Filter.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this);for(var e=0;e<this._filters.length;e++)this._filters[e].disconnect(),this._filters[e]=null;return this._filters=null,this._writable(["detune","frequency","gain","Q"]),this.frequency.dispose(),this.Q.dispose(),this.frequency=null,this.Q=null,this.detune.dispose(),this.detune=null,this.gain.dispose(),this.gain=null,this},t.Filter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(2)],void 0===(o=function(t){"use strict";return t.Merge=function(){t.AudioNode.call(this),this.createInsOuts(2,0),this.left=this.input[0]=new t.Gain,this.right=this.input[1]=new t.Gain,this._merger=this.output=this.context.createChannelMerger(2),this.left.connect(this._merger,0,0),this.right.connect(this._merger,0,1),this.left.channelCount=1,this.right.channelCount=1,this.left.channelCountMode="explicit",this.right.channelCountMode="explicit"},t.extend(t.Merge,t.AudioNode),t.Merge.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this.left.dispose(),this.left=null,this.right.dispose(),this.right=null,this._merger.disconnect(),this._merger=null,this},t.Merge}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(35),i(4),i(81)],void 0===(o=function(t){"use strict";return t.Buffer=function(){var e=t.defaults(arguments,["url","onload","onerror"],t.Buffer);t.call(this),this._buffer=null,this._reversed=e.reverse,this._xhr=null,this.onload=t.noOp,e.url instanceof AudioBuffer||e.url instanceof t.Buffer?(this.set(e.url),this.loaded||(this.onload=e.onload)):t.isString(e.url)&&this.load(e.url).then(e.onload).catch(e.onerror)},t.extend(t.Buffer),t.Buffer.defaults={url:void 0,reverse:!1,onload:t.noOp,onerror:t.noOp},t.Buffer.prototype.set=function(e){return e instanceof t.Buffer?e.loaded?this._buffer=e.get():e.onload=function(){this.set(e),this.onload(this)}.bind(this):this._buffer=e,this},t.Buffer.prototype.get=function(){return this._buffer},t.Buffer.prototype.load=function(e,i,n){return new Promise(function(o,s){this._xhr=t.Buffer.load(e,function(t){this._xhr=null,this.set(t),o(this),this.onload(this),i&&i(this)}.bind(this),function(t){this._xhr=null,s(t),n&&n(t)}.bind(this))}.bind(this))},t.Buffer.prototype.dispose=function(){return t.prototype.dispose.call(this),this._buffer=null,this._xhr&&(t.Buffer._removeFromDownloadQueue(this._xhr),this._xhr.abort(),this._xhr=null),this},Object.defineProperty(t.Buffer.prototype,"loaded",{get:function(){return this.length>0}}),Object.defineProperty(t.Buffer.prototype,"duration",{get:function(){return this._buffer?this._buffer.duration:0}}),Object.defineProperty(t.Buffer.prototype,"length",{get:function(){return this._buffer?this._buffer.length:0}}),Object.defineProperty(t.Buffer.prototype,"numberOfChannels",{get:function(){return this._buffer?this._buffer.numberOfChannels:0}}),t.Buffer.prototype.fromArray=function(t){var e=t[0].length>0,i=e?t.length:1,n=e?t[0].length:t.length,o=this.context.createBuffer(i,n,this.context.sampleRate);e||1!==i||(t=[t]);for(var s=0;s<i;s++)o.copyToChannel(t[s],s);return this._buffer=o,this},t.Buffer.prototype.toMono=function(e){if(t.isNumber(e))this.fromArray(this.toArray(e));else{for(var i=new Float32Array(this.length),n=this.numberOfChannels,o=0;o<n;o++)for(var s=this.toArray(o),r=0;r<s.length;r++)i[r]+=s[r];i=i.map(function(t){return t/n}),this.fromArray(i)}return this},t.Buffer.prototype.toArray=function(e){if(t.isNumber(e))return this.getChannelData(e);if(1===this.numberOfChannels)return this.toArray(0);for(var i=[],n=0;n<this.numberOfChannels;n++)i[n]=this.getChannelData(n);return i},t.Buffer.prototype.getChannelData=function(t){return this._buffer.getChannelData(t)},t.Buffer.prototype.slice=function(e,i){i=t.defaultArg(i,this.duration);for(var n=Math.floor(this.context.sampleRate*this.toSeconds(e)),o=Math.floor(this.context.sampleRate*this.toSeconds(i)),s=[],r=0;r<this.numberOfChannels;r++)s[r]=this.toArray(r).slice(n,o);return(new t.Buffer).fromArray(s)},t.Buffer.prototype._reverse=function(){if(this.loaded)for(var t=0;t<this.numberOfChannels;t++)Array.prototype.reverse.call(this.getChannelData(t));return this},Object.defineProperty(t.Buffer.prototype,"reverse",{get:function(){return this._reversed},set:function(t){this._reversed!==t&&(this._reversed=t,this._reverse())}}),t.Emitter.mixin(t.Buffer),t.Buffer._downloadQueue=[],t.Buffer.baseUrl="",t.Buffer.fromArray=function(e){return(new t.Buffer).fromArray(e)},t.Buffer.fromUrl=function(e){var i=new t.Buffer;return i.load(e).then(function(){return i})},t.Buffer._removeFromDownloadQueue=function(e){var i=t.Buffer._downloadQueue.indexOf(e);-1!==i&&t.Buffer._downloadQueue.splice(i,1)},t.Buffer.load=function(e,i,n){i=t.defaultArg(i,t.noOp);var o=e.match(/\[(.+\|?)+\]$/);if(o){for(var s=o[1].split("|"),r=s[0],a=0;a<s.length;a++)if(t.Buffer.supportsType(s[a])){r=s[a];break}e=e.replace(o[0],r)}function l(e){if(t.Buffer._removeFromDownloadQueue(u),t.Buffer.emit("error",e),!n)throw e;n(e)}function h(){for(var e=0,i=0;i<t.Buffer._downloadQueue.length;i++)e+=t.Buffer._downloadQueue[i].progress;t.Buffer.emit("progress",e/t.Buffer._downloadQueue.length)}var u=new XMLHttpRequest;return u.open("GET",t.Buffer.baseUrl+e,!0),u.responseType="arraybuffer",u.progress=0,t.Buffer._downloadQueue.push(u),u.addEventListener("load",function(){200===u.status?t.context.decodeAudioData(u.response).then(function(e){u.progress=1,h(),i(e),t.Buffer._removeFromDownloadQueue(u),0===t.Buffer._downloadQueue.length&&t.Buffer.emit("load")}).catch(function(){t.Buffer._removeFromDownloadQueue(u),l("Tone.Buffer: could not decode audio data: "+e)}):l("Tone.Buffer: could not locate file: "+e)}),u.addEventListener("error",l),u.addEventListener("progress",function(t){t.lengthComputable&&(u.progress=t.loaded/t.total*.95,h())}),u.send(),u},t.Buffer.cancelDownloads=function(){return t.Buffer._downloadQueue.slice().forEach(function(e){t.Buffer._removeFromDownloadQueue(e),e.abort()}),t.Buffer},t.Buffer.supportsType=function(t){var e=t.split(".");return e=e[e.length-1],""!==document.createElement("audio").canPlayType("audio/"+e)},t.loaded=function(){var e,i;function n(){t.Buffer.off("load",e),t.Buffer.off("error",i)}return new Promise(function(n,o){e=function(){n()},i=function(){o()},t.Buffer.on("load",e),t.Buffer.on("error",i)}).then(n).catch(function(t){throw n(),new Error(t)})},t.Buffer}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(17),i(26),i(2),i(1),i(22),i(4),i(28)],void 0===(o=function(t){"use strict";return t.LFO=function(){var e=t.defaults(arguments,["frequency","min","max"],t.LFO);t.AudioNode.call(this),this._oscillator=new t.Oscillator({frequency:e.frequency,type:e.type}),this.frequency=this._oscillator.frequency,this.amplitude=this._oscillator.volume,this.amplitude.units=t.Type.NormalRange,this.amplitude.value=e.amplitude,this._stoppedSignal=new t.Signal(0,t.Type.AudioRange),this._zeros=new t.Zero,this._stoppedValue=0,this._a2g=new t.AudioToGain,this._scaler=this.output=new t.Scale(e.min,e.max),this._units=t.Type.Default,this.units=e.units,this._oscillator.chain(this._a2g,this._scaler),this._zeros.connect(this._a2g),this._stoppedSignal.connect(this._a2g),this._readOnly(["amplitude","frequency"]),this.phase=e.phase},t.extend(t.LFO,t.AudioNode),t.LFO.defaults={type:"sine",min:0,max:1,phase:0,frequency:"4n",amplitude:1,units:t.Type.Default},t.LFO.prototype.start=function(t){return t=this.toSeconds(t),this._stoppedSignal.setValueAtTime(0,t),this._oscillator.start(t),this},t.LFO.prototype.stop=function(t){return t=this.toSeconds(t),this._stoppedSignal.setValueAtTime(this._stoppedValue,t),this._oscillator.stop(t),this},t.LFO.prototype.sync=function(){return this._oscillator.sync(),this._oscillator.syncFrequency(),this},t.LFO.prototype.unsync=function(){return this._oscillator.unsync(),this._oscillator.unsyncFrequency(),this},Object.defineProperty(t.LFO.prototype,"min",{get:function(){return this._toUnits(this._scaler.min)},set:function(t){t=this._fromUnits(t),this._scaler.min=t}}),Object.defineProperty(t.LFO.prototype,"max",{get:function(){return this._toUnits(this._scaler.max)},set:function(t){t=this._fromUnits(t),this._scaler.max=t}}),Object.defineProperty(t.LFO.prototype,"type",{get:function(){return this._oscillator.type},set:function(t){this._oscillator.type=t,this._stoppedValue=this._oscillator._getInitialValue(),this._stoppedSignal.value=this._stoppedValue}}),Object.defineProperty(t.LFO.prototype,"phase",{get:function(){return this._oscillator.phase},set:function(t){this._oscillator.phase=t,this._stoppedValue=this._oscillator._getInitialValue(),this._stoppedSignal.value=this._stoppedValue}}),Object.defineProperty(t.LFO.prototype,"units",{get:function(){return this._units},set:function(t){var e=this.min,i=this.max;this._units=t,this.min=e,this.max=i}}),Object.defineProperty(t.LFO.prototype,"mute",{get:function(){return this._oscillator.mute},set:function(t){this._oscillator.mute=t}}),Object.defineProperty(t.LFO.prototype,"state",{get:function(){return this._oscillator.state}}),t.LFO.prototype.connect=function(e){return e.constructor!==t.Signal&&e.constructor!==t.Param||(this.convert=e.convert,this.units=e.units),t.SignalBase.prototype.connect.apply(this,arguments),this},t.LFO.prototype._fromUnits=t.Param.prototype._fromUnits,t.LFO.prototype._toUnits=t.Param.prototype._toUnits,t.LFO.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["amplitude","frequency"]),this._oscillator.dispose(),this._oscillator=null,this._stoppedSignal.dispose(),this._stoppedSignal=null,this._zeros.dispose(),this._zeros=null,this._scaler.dispose(),this._scaler=null,this._a2g.dispose(),this._a2g=null,this.frequency=null,this.amplitude=null,this},t.LFO}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(29),i(94),i(1),i(3)],void 0===(o=function(t){"use strict";return t.Subtract=function(e){t.Signal.call(this),this.createInsOuts(2,0),this._sum=this.input[0]=this.output=new t.Gain,this._neg=new t.Negate,this._param=this.input[1]=new t.Signal(e),this._param.chain(this._neg,this._sum),this.proxy=!1},t.extend(t.Subtract,t.Signal),t.Subtract.prototype.dispose=function(){return t.Signal.prototype.dispose.call(this),this._neg.dispose(),this._neg=null,this._sum.disconnect(),this._sum=null,this},t.Subtract}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(4),i(2),i(24)],void 0===(o=function(t){"use strict";return t.Param=function(){var e=t.defaults(arguments,["param","units","convert"],t.Param);t.AudioNode.call(this,e),this._param=this.input=e.param,this.units=e.units,this.convert=e.convert,this.overridden=!1,this._events=new t.Timeline(1e3),t.isDefined(e.value)&&this._param&&this.setValueAtTime(e.value,0)},t.extend(t.Param,t.AudioNode),t.Param.defaults={units:t.Type.Default,convert:!0,param:void 0},Object.defineProperty(t.Param.prototype,"value",{get:function(){var t=this.now();return this._toUnits(this.getValueAtTime(t))},set:function(t){this._initialValue=this._fromUnits(t),this.cancelScheduledValues(this.now()),this.setValueAtTime(t,this.now())}}),Object.defineProperty(t.Param.prototype,"minValue",{get:function(){return this.units===t.Type.Time||this.units===t.Type.Frequency||this.units===t.Type.NormalRange||this.units===t.Type.Positive||this.units===t.Type.BPM?0:this.units===t.Type.AudioRange?-1:this.units===t.Type.Decibels?-1/0:this._param.minValue}}),Object.defineProperty(t.Param.prototype,"maxValue",{get:function(){return this.units===t.Type.NormalRange||this.units===t.Type.AudioRange?1:this._param.maxValue}}),t.Param.prototype._fromUnits=function(e){if(!this.convert&&!t.isUndef(this.convert)||this.overridden)return e;switch(this.units){case t.Type.Time:return this.toSeconds(e);case t.Type.Frequency:return this.toFrequency(e);case t.Type.Decibels:return t.dbToGain(e);case t.Type.NormalRange:return Math.min(Math.max(e,0),1);case t.Type.AudioRange:return Math.min(Math.max(e,-1),1);case t.Type.Positive:return Math.max(e,0);default:return e}},t.Param.prototype._toUnits=function(e){if(!this.convert&&!t.isUndef(this.convert))return e;switch(this.units){case t.Type.Decibels:return t.gainToDb(e);default:return e}},t.Param.prototype._minOutput=1e-5,t.Param.AutomationType={Linear:"linearRampToValueAtTime",Exponential:"exponentialRampToValueAtTime",Target:"setTargetAtTime",SetValue:"setValueAtTime",Cancel:"cancelScheduledValues"},t.Param.prototype.setValueAtTime=function(e,i){return i=this.toSeconds(i),e=this._fromUnits(e),this._events.add({type:t.Param.AutomationType.SetValue,value:e,time:i}),this.log(t.Param.AutomationType.SetValue,e,i),this._param.setValueAtTime(e,i),this},t.Param.prototype.getValueAtTime=function(e){e=this.toSeconds(e);var i=this._events.getAfter(e),n=this._events.get(e),o=t.defaultArg(this._initialValue,this._param.defaultValue),s=o;if(null===n)s=o;else if(n.type===t.Param.AutomationType.Target){var r,a=this._events.getBefore(n.time);r=null===a?o:a.value,s=this._exponentialApproach(n.time,r,n.value,n.constant,e)}else s=null===i?n.value:i.type===t.Param.AutomationType.Linear?this._linearInterpolate(n.time,n.value,i.time,i.value,e):i.type===t.Param.AutomationType.Exponential?this._exponentialInterpolate(n.time,n.value,i.time,i.value,e):n.value;return s},t.Param.prototype.setRampPoint=function(t){t=this.toSeconds(t);var e=this.getValueAtTime(t);return this.cancelAndHoldAtTime(t),0===e&&(e=this._minOutput),this.setValueAtTime(this._toUnits(e),t),this},t.Param.prototype.linearRampToValueAtTime=function(e,i){return e=this._fromUnits(e),i=this.toSeconds(i),this._events.add({type:t.Param.AutomationType.Linear,value:e,time:i}),this.log(t.Param.AutomationType.Linear,e,i),this._param.linearRampToValueAtTime(e,i),this},t.Param.prototype.exponentialRampToValueAtTime=function(e,i){return e=this._fromUnits(e),e=Math.max(this._minOutput,e),i=this.toSeconds(i),this._events.add({type:t.Param.AutomationType.Exponential,time:i,value:e}),this.log(t.Param.AutomationType.Exponential,e,i),this._param.exponentialRampToValueAtTime(e,i),this},t.Param.prototype.exponentialRampTo=function(t,e,i){return i=this.toSeconds(i),this.setRampPoint(i),this.exponentialRampToValueAtTime(t,i+this.toSeconds(e)),this},t.Param.prototype.linearRampTo=function(t,e,i){return i=this.toSeconds(i),this.setRampPoint(i),this.linearRampToValueAtTime(t,i+this.toSeconds(e)),this},t.Param.prototype.targetRampTo=function(t,e,i){return i=this.toSeconds(i),this.setRampPoint(i),this.exponentialApproachValueAtTime(t,i,e),this},t.Param.prototype.exponentialApproachValueAtTime=function(t,e,i){var n=Math.log(this.toSeconds(i)+1)/Math.log(200);return e=this.toSeconds(e),this.setTargetAtTime(t,e,n)},t.Param.prototype.setTargetAtTime=function(e,i,n){if(e=this._fromUnits(e),n<=0)throw new Error("timeConstant must be greater than 0");return i=this.toSeconds(i),this._events.add({type:t.Param.AutomationType.Target,value:e,time:i,constant:n}),this.log(t.Param.AutomationType.Target,e,i,n),this._param.setTargetAtTime(e,i,n),this},t.Param.prototype.setValueCurveAtTime=function(e,i,n,o){o=t.defaultArg(o,1),n=this.toSeconds(n),i=this.toSeconds(i),this.setValueAtTime(e[0]*o,i);for(var s=n/(e.length-1),r=1;r<e.length;r++)this.linearRampToValueAtTime(e[r]*o,i+r*s);return this},t.Param.prototype.cancelScheduledValues=function(e){return e=this.toSeconds(e),this._events.cancel(e),this._param.cancelScheduledValues(e),this.log(t.Param.AutomationType.Cancel,e),this},t.Param.prototype.cancelAndHoldAtTime=function(e){var i=this.getValueAtTime(e);this.log("cancelAndHoldAtTime",e,"value="+i),this._param.cancelScheduledValues(e);var n=this._events.get(e),o=this._events.getAfter(e);return n&&n.time===e?o?this._events.cancel(o.time):this._events.cancel(e+this.sampleTime):o&&(this._events.cancel(o.time),o.type===t.Param.AutomationType.Linear?this.linearRampToValueAtTime(i,e):o.type===t.Param.AutomationType.Exponential&&this.exponentialRampToValueAtTime(i,e)),this._events.add({type:t.Param.AutomationType.SetValue,value:i,time:e}),this._param.setValueAtTime(i,e),this},t.Param.prototype.rampTo=function(e,i,n){return i=t.defaultArg(i,.1),this.units===t.Type.Frequency||this.units===t.Type.BPM||this.units===t.Type.Decibels?this.exponentialRampTo(e,i,n):this.linearRampTo(e,i,n),this},t.Param.prototype._exponentialApproach=function(t,e,i,n,o){return i+(e-i)*Math.exp(-(o-t)/n)},t.Param.prototype._linearInterpolate=function(t,e,i,n,o){return e+(o-t)/(i-t)*(n-e)},t.Param.prototype._exponentialInterpolate=function(t,e,i,n,o){return e*Math.pow(n/e,(o-t)/(i-t))},t.Param.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._param=null,this._events=null,this},t.Param}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(19),i(10),i(23)],void 0===(o=function(t){"use strict";return t.StereoEffect=function(){t.AudioNode.call(this);var e=t.defaults(arguments,["wet"],t.Effect);this.createInsOuts(1,1),this._dryWet=new t.CrossFade(e.wet),this.wet=this._dryWet.fade,this._split=new t.Split,this.effectSendL=this._split.left,this.effectSendR=this._split.right,this._merge=new t.Merge,this.effectReturnL=this._merge.left,this.effectReturnR=this._merge.right,this.input.connect(this._split),this.input.connect(this._dryWet,0,0),this._merge.connect(this._dryWet,0,1),this._dryWet.connect(this.output),this._readOnly(["wet"])},t.extend(t.StereoEffect,t.Effect),t.StereoEffect.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._dryWet.dispose(),this._dryWet=null,this._split.dispose(),this._split=null,this._merge.dispose(),this._merge=null,this.effectSendL=null,this.effectSendR=null,this.effectReturnL=null,this.effectReturnR=null,this._writable(["wet"]),this.wet=null,this},t.StereoEffect}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(86),i(4),i(24),i(35),i(3),i(84),i(83),i(55)],void 0===(o=function(t){"use strict";t.Transport=function(){t.Emitter.call(this),t.getContext(function(){this.loop=!1,this._loopStart=0,this._loopEnd=0,this._ppq=e.defaults.PPQ,this._clock=new t.Clock({callback:this._processTick.bind(this),frequency:0}),this._bindClockEvents(),this.bpm=this._clock.frequency,this.bpm._toUnits=this._toUnits.bind(this),this.bpm._fromUnits=this._fromUnits.bind(this),this.bpm.units=t.Type.BPM,this.bpm.value=e.defaults.bpm,this._readOnly("bpm"),this._timeSignature=e.defaults.timeSignature,this._scheduledEvents={},this._timeline=new t.Timeline,this._repeatedEvents=new t.IntervalTimeline,this._syncedSignals=[],this._swingTicks=e.defaults.PPQ/2,this._swingAmount=0,this.context.transport=this}.bind(this))},t.extend(t.Transport,t.Emitter),t.Transport.defaults={bpm:120,swing:0,swingSubdivision:"8n",timeSignature:4,loopStart:0,loopEnd:"4m",PPQ:192},t.Transport.prototype.isTransport=!0,t.Transport.prototype._processTick=function(e,i){if(this._swingAmount>0&&i%this._ppq!=0&&i%(2*this._swingTicks)!=0){var n=i%(2*this._swingTicks)/(2*this._swingTicks),o=Math.sin(n*Math.PI)*this._swingAmount;e+=t.Ticks(2*this._swingTicks/3).toSeconds()*o}this.loop&&i>=this._loopEnd&&(this.emit("loopEnd",e),this._clock.setTicksAtTime(this._loopStart,e),i=this._loopStart,this.emit("loopStart",e,this._clock.getSecondsAtTime(e)),this.emit("loop",e)),this._timeline.forEachAtTime(i,function(t){t.invoke(e)})},t.Transport.prototype.schedule=function(e,i){var n=new t.TransportEvent(this,{time:t.TransportTime(i),callback:e});return this._addEvent(n,this._timeline)},t.Transport.prototype.scheduleRepeat=function(e,i,n,o){var s=new t.TransportRepeatEvent(this,{callback:e,interval:t.Time(i),time:t.TransportTime(n),duration:t.Time(t.defaultArg(o,1/0))});return this._addEvent(s,this._repeatedEvents)},t.Transport.prototype.scheduleOnce=function(e,i){var n=new t.TransportEvent(this,{time:t.TransportTime(i),callback:e,once:!0});return this._addEvent(n,this._timeline)},t.Transport.prototype.clear=function(t){if(this._scheduledEvents.hasOwnProperty(t)){var e=this._scheduledEvents[t.toString()];e.timeline.remove(e.event),e.event.dispose(),delete this._scheduledEvents[t.toString()]}return this},t.Transport.prototype._addEvent=function(t,e){return this._scheduledEvents[t.id.toString()]={event:t,timeline:e},e.add(t),t.id},t.Transport.prototype.cancel=function(e){return e=t.defaultArg(e,0),e=this.toTicks(e),this._timeline.forEachFrom(e,function(t){this.clear(t.id)}.bind(this)),this._repeatedEvents.forEachFrom(e,function(t){this.clear(t.id)}.bind(this)),this},t.Transport.prototype._bindClockEvents=function(){this._clock.on("start",function(e,i){i=t.Ticks(i).toSeconds(),this.emit("start",e,i)}.bind(this)),this._clock.on("stop",function(t){this.emit("stop",t)}.bind(this)),this._clock.on("pause",function(t){this.emit("pause",t)}.bind(this))},Object.defineProperty(t.Transport.prototype,"state",{get:function(){return this._clock.getStateAtTime(this.now())}}),t.Transport.prototype.start=function(e,i){return t.isDefined(i)&&(i=this.toTicks(i)),this._clock.start(e,i),this},t.Transport.prototype.stop=function(t){return this._clock.stop(t),this},t.Transport.prototype.pause=function(t){return this._clock.pause(t),this},t.Transport.prototype.toggle=function(e){return e=this.toSeconds(e),this._clock.getStateAtTime(e)!==t.State.Started?this.start(e):this.stop(e),this},Object.defineProperty(t.Transport.prototype,"timeSignature",{get:function(){return this._timeSignature},set:function(e){t.isArray(e)&&(e=e[0]/e[1]*4),this._timeSignature=e}}),Object.defineProperty(t.Transport.prototype,"loopStart",{get:function(){return t.Ticks(this._loopStart).toSeconds()},set:function(t){this._loopStart=this.toTicks(t)}}),Object.defineProperty(t.Transport.prototype,"loopEnd",{get:function(){return t.Ticks(this._loopEnd).toSeconds()},set:function(t){this._loopEnd=this.toTicks(t)}}),t.Transport.prototype.setLoopPoints=function(t,e){return this.loopStart=t,this.loopEnd=e,this},Object.defineProperty(t.Transport.prototype,"swing",{get:function(){return this._swingAmount},set:function(t){this._swingAmount=t}}),Object.defineProperty(t.Transport.prototype,"swingSubdivision",{get:function(){return t.Ticks(this._swingTicks).toNotation()},set:function(t){this._swingTicks=this.toTicks(t)}}),Object.defineProperty(t.Transport.prototype,"position",{get:function(){var e=this.now(),i=this._clock.getTicksAtTime(e);return t.Ticks(i).toBarsBeatsSixteenths()},set:function(t){var e=this.toTicks(t);this.ticks=e}}),Object.defineProperty(t.Transport.prototype,"seconds",{get:function(){return this._clock.seconds},set:function(t){var e=this.now(),i=this.bpm.timeToTicks(t,e);this.ticks=i}}),Object.defineProperty(t.Transport.prototype,"progress",{get:function(){if(this.loop){var t=this.now();return(this._clock.getTicksAtTime(t)-this._loopStart)/(this._loopEnd-this._loopStart)}return 0}}),Object.defineProperty(t.Transport.prototype,"ticks",{get:function(){return this._clock.ticks},set:function(e){if(this._clock.ticks!==e){var i=this.now();this.state===t.State.Started?(this.emit("stop",i),this._clock.setTicksAtTime(e,i),this.emit("start",i,this.seconds)):this._clock.setTicksAtTime(e,i)}}}),t.Transport.prototype.getTicksAtTime=function(t){return Math.round(this._clock.getTicksAtTime(t))},t.Transport.prototype.getSecondsAtTime=function(t){return this._clock.getSecondsAtTime(t)},Object.defineProperty(t.Transport.prototype,"PPQ",{get:function(){return this._ppq},set:function(t){var e=this.bpm.value;this._ppq=t,this.bpm.value=e}}),t.Transport.prototype._fromUnits=function(t){return 1/(60/t/this.PPQ)},t.Transport.prototype._toUnits=function(t){return t/this.PPQ*60},t.Transport.prototype.nextSubdivision=function(e){if(e=this.toTicks(e),this.state!==t.State.Started)return 0;var i=this.now(),n=e-this.getTicksAtTime(i)%e;return this._clock.nextTickTime(n,i)},t.Transport.prototype.syncSignal=function(e,i){if(!i){var n=this.now();i=0!==e.getValueAtTime(n)?e.getValueAtTime(n)/this.bpm.getValueAtTime(n):0}var o=new t.Gain(i);return this.bpm.chain(o,e._param),this._syncedSignals.push({ratio:o,signal:e,initial:e.value}),e.value=0,this},t.Transport.prototype.unsyncSignal=function(t){for(var e=this._syncedSignals.length-1;e>=0;e--){var i=this._syncedSignals[e];i.signal===t&&(i.ratio.dispose(),i.signal.value=i.initial,this._syncedSignals.splice(e,1))}return this},t.Transport.prototype.dispose=function(){return t.Emitter.prototype.dispose.call(this),this._clock.dispose(),this._clock=null,this._writable("bpm"),this.bpm=null,this._timeline.dispose(),this._timeline=null,this._repeatedEvents.dispose(),this._repeatedEvents=null,this};var e=t.Transport;return t.Transport=new e,t.Context.on("init",function(i){i.transport&&i.transport.isTransport?t.Transport=i.transport:t.Transport=new e}),t.Context.on("close",function(t){t.transport&&t.transport.isTransport&&t.transport.dispose()}),t.Transport}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(6),i(16),i(82)],void 0===(o=function(t){"use strict";return t.Oscillator=function(){var e=t.defaults(arguments,["frequency","type"],t.Oscillator);t.Source.call(this,e),this._oscillator=null,this.frequency=new t.Signal(e.frequency,t.Type.Frequency),this.detune=new t.Signal(e.detune,t.Type.Cents),this._wave=null,this._partials=e.partials,this._partialCount=e.partialCount,this._phase=e.phase,this._type=e.type,e.partialCount&&e.type!==t.Oscillator.Type.Custom&&(this._type=this.baseType+e.partialCount.toString()),this.phase=this._phase,this._readOnly(["frequency","detune"])},t.extend(t.Oscillator,t.Source),t.Oscillator.defaults={type:"sine",frequency:440,detune:0,phase:0,partials:[],partialCount:0},t.Oscillator.Type={Sine:"sine",Triangle:"triangle",Sawtooth:"sawtooth",Square:"square",Custom:"custom"},t.Oscillator.prototype._start=function(e){this.log("start",e),this._oscillator=new t.OscillatorNode,this._wave?this._oscillator.setPeriodicWave(this._wave):this._oscillator.type=this._type,this._oscillator.connect(this.output),this.frequency.connect(this._oscillator.frequency),this.detune.connect(this._oscillator.detune),e=this.toSeconds(e),this._oscillator.start(e)},t.Oscillator.prototype._stop=function(t){return this.log("stop",t),this._oscillator&&(t=this.toSeconds(t),this._oscillator.stop(t)),this},t.Oscillator.prototype.restart=function(t){return this._oscillator&&this._oscillator.cancelStop(),this._state.cancel(this.toSeconds(t)),this},t.Oscillator.prototype.syncFrequency=function(){return t.Transport.syncSignal(this.frequency),this},t.Oscillator.prototype.unsyncFrequency=function(){return t.Transport.unsyncSignal(this.frequency),this},Object.defineProperty(t.Oscillator.prototype,"type",{get:function(){return this._type},set:function(t){var e=this._getRealImaginary(t,this._phase),i=this.context.createPeriodicWave(e[0],e[1]);this._wave=i,null!==this._oscillator&&this._oscillator.setPeriodicWave(this._wave),this._type=t}}),Object.defineProperty(t.Oscillator.prototype,"baseType",{get:function(){return this._type.replace(this.partialCount,"")},set:function(e){this.partialCount&&this._type!==t.Oscillator.Type.Custom&&e!==t.Oscillator.Type.Custom?this.type=e+this.partialCount:this.type=e}}),Object.defineProperty(t.Oscillator.prototype,"partialCount",{get:function(){return this._partialCount},set:function(e){var i=this._type,n=/^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);n&&(i=n[1]),this._type!==t.Oscillator.Type.Custom&&(this.type=0===e?i:i+e.toString())}}),t.Oscillator.prototype.get=function(){const e=t.prototype.get.apply(this,arguments);return e.type!==t.Oscillator.Type.Custom&&delete e.partials,e},t.Oscillator.prototype._getRealImaginary=function(e,i){var n=2048,o=new Float32Array(n),s=new Float32Array(n),r=1;if(e===t.Oscillator.Type.Custom)r=this._partials.length+1,this._partialCount=this._partials.length,n=r;else{var a=/^(sine|triangle|square|sawtooth)(\d+)$/.exec(e);a?(r=parseInt(a[2])+1,this._partialCount=parseInt(a[2]),e=a[1],n=r=Math.max(r,2)):this._partialCount=0,this._partials=[]}for(var l=1;l<n;++l){var h,u=2/(l*Math.PI);switch(e){case t.Oscillator.Type.Sine:h=l<=r?1:0,this._partials[l-1]=h;break;case t.Oscillator.Type.Square:h=1&l?2*u:0,this._partials[l-1]=h;break;case t.Oscillator.Type.Sawtooth:h=u*(1&l?1:-1),this._partials[l-1]=h;break;case t.Oscillator.Type.Triangle:h=1&l?u*u*2*(l-1>>1&1?-1:1):0,this._partials[l-1]=h;break;case t.Oscillator.Type.Custom:h=this._partials[l-1];break;default:throw new TypeError("Tone.Oscillator: invalid type: "+e)}0!==h?(o[l]=-h*Math.sin(i*l),s[l]=h*Math.cos(i*l)):(o[l]=0,s[l]=0)}return[o,s]},t.Oscillator.prototype._inverseFFT=function(t,e,i){for(var n=0,o=t.length,s=0;s<o;s++)n+=t[s]*Math.cos(s*i)+e[s]*Math.sin(s*i);return n},t.Oscillator.prototype._getInitialValue=function(){for(var t=this._getRealImaginary(this._type,0),e=t[0],i=t[1],n=0,o=2*Math.PI,s=0;s<8;s++)n=Math.max(this._inverseFFT(e,i,s/8*o),n);return-this._inverseFFT(e,i,this._phase)/n},Object.defineProperty(t.Oscillator.prototype,"partials",{get:function(){return this._partials},set:function(e){this._partials=e,this.type=t.Oscillator.Type.Custom}}),Object.defineProperty(t.Oscillator.prototype,"phase",{get:function(){return this._phase*(180/Math.PI)},set:function(t){this._phase=t*Math.PI/180,this.type=this._type}}),t.Oscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),null!==this._oscillator&&(this._oscillator.dispose(),this._oscillator=null),this._wave=null,this._writable(["frequency","detune"]),this.frequency.dispose(),this.frequency=null,this.detune.dispose(),this.detune=null,this._partials=null,this},t.Oscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(14),i(2)],void 0===(o=function(t){"use strict";return t.Delay=function(){var e=t.defaults(arguments,["delayTime","maxDelay"],t.Delay);t.AudioNode.call(this,e),this._maxDelay=Math.max(this.toSeconds(e.maxDelay),this.toSeconds(e.delayTime)),this._delayNode=this.input=this.output=this.context.createDelay(this._maxDelay),this.delayTime=new t.Param({param:this._delayNode.delayTime,units:t.Type.Time,value:e.delayTime}),this._readOnly("delayTime")},t.extend(t.Delay,t.AudioNode),t.Delay.defaults={maxDelay:1,delayTime:0},Object.defineProperty(t.Delay.prototype,"maxDelay",{get:function(){return this._maxDelay}}),t.Delay.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._delayNode.disconnect(),this._delayNode=null,this._writable("delayTime"),this.delayTime=null,this},t.Delay}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(3),i(2)],void 0===(o=function(t){"use strict";return t.Split=function(){t.AudioNode.call(this),this.createInsOuts(0,2),this._splitter=this.input=this.context.createChannelSplitter(2),this.left=this.output[0]=new t.Gain,this.right=this.output[1]=new t.Gain,this._splitter.connect(this.left,0,0),this._splitter.connect(this.right,1,0)},t.extend(t.Split,t.AudioNode),t.Split.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._splitter.disconnect(),this.left.dispose(),this.left=null,this.right.dispose(),this.right=null,this._splitter=null,this},t.Split}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(35),i(24),i(34)],void 0===(o=function(t){t.Context=function(){t.Emitter.call(this);var i=t.defaults(arguments,["context"],t.Context);if(!i.context&&(i.context=new t.global.AudioContext,!i.context))throw new Error("could not create AudioContext. Possibly too many AudioContexts running already.");for(this._context=i.context;this._context.rawContext;)this._context=this._context.rawContext;for(var n in this._context)this._defineProperty(this._context,n);this._latencyHint=i.latencyHint,this._constants={},this.lookAhead=i.lookAhead,this._computedUpdateInterval=0,this._ticker=new e(this.emit.bind(this,"tick"),i.clockSource,i.updateInterval),this._timeouts=new t.Timeline,this._timeoutIds=0,this.on("tick",this._timeoutLoop.bind(this)),this._context.onstatechange=function(t){this.emit("statechange",t)}.bind(this)},t.extend(t.Context,t.Emitter),t.Emitter.mixin(t.Context),t.Context.defaults={clockSource:"worker",latencyHint:"interactive",lookAhead:.1,updateInterval:.03},t.Context.prototype.isContext=!0,t.Context.prototype._defineProperty=function(e,i){t.isUndef(this[i])&&Object.defineProperty(this,i,{get:function(){return"function"==typeof e[i]?e[i].bind(e):e[i]},set:function(t){e[i]=t}})},t.Context.prototype.now=function(){return this._context.currentTime+this.lookAhead},Object.defineProperty(t.Context.prototype,"destination",{get:function(){return this.master?this.master:this._context.destination}}),t.Context.prototype.resume=function(){return"suspended"===this._context.state&&this._context instanceof AudioContext?this._context.resume():Promise.resolve()},t.Context.prototype.close=function(){var e=Promise.resolve();return this!==t.global.TONE_AUDIO_CONTEXT&&(e=this.rawContext.close()),e.then(function(){t.Context.emit("close",this)}.bind(this))},t.Context.prototype.getConstant=function(t){if(this._constants[t])return this._constants[t];for(var e=this._context.createBuffer(1,128,this._context.sampleRate),i=e.getChannelData(0),n=0;n<i.length;n++)i[n]=t;var o=this._context.createBufferSource();return o.channelCount=1,o.channelCountMode="explicit",o.buffer=e,o.loop=!0,o.start(0),this._constants[t]=o,o},t.Context.prototype._timeoutLoop=function(){for(var t=this.now();this._timeouts&&this._timeouts.length&&this._timeouts.peek().time<=t;)this._timeouts.shift().callback()},t.Context.prototype.setTimeout=function(t,e){this._timeoutIds++;var i=this.now();return this._timeouts.add({callback:t,time:i+e,id:this._timeoutIds}),this._timeoutIds},t.Context.prototype.clearTimeout=function(t){return this._timeouts.forEach(function(e){e.id===t&&this.remove(e)}),this},Object.defineProperty(t.Context.prototype,"updateInterval",{get:function(){return this._ticker.updateInterval},set:function(t){this._ticker.updateInterval=t}}),Object.defineProperty(t.Context.prototype,"rawContext",{get:function(){return this._context}}),Object.defineProperty(t.Context.prototype,"clockSource",{get:function(){return this._ticker.type},set:function(t){this._ticker.type=t}}),Object.defineProperty(t.Context.prototype,"latencyHint",{get:function(){return this._latencyHint},set:function(e){var i=e;if(this._latencyHint=e,t.isString(e))switch(e){case"interactive":i=.1,this._context.latencyHint=e;break;case"playback":i=.8,this._context.latencyHint=e;break;case"balanced":i=.25,this._context.latencyHint=e;break;case"fastest":this._context.latencyHint="interactive",i=.01}this.lookAhead=i,this.updateInterval=i/3}}),t.Context.prototype.dispose=function(){return this.close().then(function(){for(var e in t.Emitter.prototype.dispose.call(this),this._ticker.dispose(),this._ticker=null,this._timeouts.dispose(),this._timeouts=null,this._constants)this._constants[e].disconnect();this._constants=null}.bind(this))};var e=function(e,i,n){this._type=i,this._updateInterval=n,this._callback=t.defaultArg(e,t.noOp),this._createClock()};if(e.Type={Worker:"worker",Timeout:"timeout",Offline:"offline"},e.prototype._createWorker=function(){t.global.URL=t.global.URL||t.global.webkitURL;var e=new Blob(["var timeoutTime = "+(1e3*this._updateInterval).toFixed(1)+";self.onmessage = function(msg){\ttimeoutTime = parseInt(msg.data);};function tick(){\tsetTimeout(tick, timeoutTime);\tself.postMessage('tick');}tick();"]),i=URL.createObjectURL(e),n=new Worker(i);n.onmessage=this._callback.bind(this),this._worker=n},e.prototype._createTimeout=function(){this._timeout=setTimeout(function(){this._createTimeout(),this._callback()}.bind(this),1e3*this._updateInterval)},e.prototype._createClock=function(){if(this._type===e.Type.Worker)try{this._createWorker()}catch(t){this._type=e.Type.Timeout,this._createClock()}else this._type===e.Type.Timeout&&this._createTimeout()},Object.defineProperty(e.prototype,"updateInterval",{get:function(){return this._updateInterval},set:function(t){this._updateInterval=Math.max(t,128/44100),this._type===e.Type.Worker&&this._worker.postMessage(Math.max(1e3*t,1))}}),Object.defineProperty(e.prototype,"type",{get:function(){return this._type},set:function(t){this._disposeClock(),this._type=t,this._createClock()}}),e.prototype._disposeClock=function(){this._timeout&&(clearTimeout(this._timeout),this._timeout=null),this._worker&&(this._worker.terminate(),this._worker.onmessage=null,this._worker=null)},e.prototype.dispose=function(){this._disposeClock(),this._callback=null},t.getContext(function(){var e=AudioNode.prototype.connect,i=AudioNode.prototype.disconnect;function n(i,n,o){if(i.input)return o=t.defaultArg(o,0),t.isArray(i.input)?this.connect(i.input[o]):this.connect(i.input,n,o);try{return i instanceof AudioNode?(e.call(this,i,n,o),i):(e.call(this,i,n),i)}catch(t){throw new Error("error connecting to node: "+i+"\n"+t)}}AudioNode.prototype.connect!==n&&(AudioNode.prototype.connect=n,AudioNode.prototype.disconnect=function(e,n,o){if(e&&e.input&&t.isArray(e.input))o=t.defaultArg(o,0),this.disconnect(e.input[o],n,0);else if(e&&e.input)this.disconnect(e.input,n,o);else try{e instanceof AudioParam?i.call(this,e,n):i.apply(this,arguments)}catch(t){throw new Error("error disconnecting node: "+e+"\n"+t)}})}),t.supported&&!t.initialized){if(t.global.TONE_AUDIO_CONTEXT||(t.global.TONE_AUDIO_CONTEXT=new t.Context),t.context=t.global.TONE_AUDIO_CONTEXT,!t.global.TONE_SILENCE_VERSION_LOGGING){var i="v";"dev"===t.version&&(i="");var n=" * Tone.js "+i+t.version+" * ";console.log("%c"+n,"background: #000; color: #fff")}}else t.supported||console.warn("This browser does not support Tone.js");return t.Context}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(4),i(40)],void 0===(o=function(t){"use strict";return t.Instrument=function(e){e=t.defaultArg(e,t.Instrument.defaults),t.AudioNode.call(this),this._volume=this.output=new t.Volume(e.volume),this.volume=this._volume.volume,this._readOnly("volume"),this._scheduledEvents=[]},t.extend(t.Instrument,t.AudioNode),t.Instrument.defaults={volume:0},t.Instrument.prototype.triggerAttack=t.noOp,t.Instrument.prototype.triggerRelease=t.noOp,t.Instrument.prototype.sync=function(){return this._syncMethod("triggerAttack",1),this._syncMethod("triggerRelease",0),this},t.Instrument.prototype._syncMethod=function(e,i){var n=this["_original_"+e]=this[e];this[e]=function(){var e=Array.prototype.slice.call(arguments),o=e[i],s=t.Transport.schedule(function(t){e[i]=t,n.apply(this,e)}.bind(this),o);this._scheduledEvents.push(s)}.bind(this)},t.Instrument.prototype.unsync=function(){return this._scheduledEvents.forEach(function(e){t.Transport.clear(e)}),this._scheduledEvents=[],this._original_triggerAttack&&(this.triggerAttack=this._original_triggerAttack,this.triggerRelease=this._original_triggerRelease),this},t.Instrument.prototype.triggerAttackRelease=function(t,e,i,n){return i=this.toSeconds(i),e=this.toSeconds(e),this.triggerAttack(t,i,n),this.triggerRelease(i+e),this},t.Instrument.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._volume.dispose(),this._volume=null,this._writable(["volume"]),this.volume=null,this.unsync(),this._scheduledEvents=null,this},t.Instrument}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7),i(1)],void 0===(o=function(t){"use strict";return t.AudioToGain=function(){t.SignalBase.call(this),this._norm=this.input=this.output=new t.WaveShaper(function(t){return(t+1)/2})},t.extend(t.AudioToGain,t.SignalBase),t.AudioToGain.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._norm.dispose(),this._norm=null,this},t.AudioToGain}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(13),i(93),i(3),i(2)],void 0===(o=function(t){"use strict";return t.CrossFade=function(e){t.AudioNode.call(this),this.createInsOuts(2,1),this.a=this.input[0]=new t.Gain,this.b=this.input[1]=new t.Gain,this.fade=new t.Signal(t.defaultArg(e,.5),t.Type.NormalRange),this._equalPowerA=new t.EqualPowerGain,this._equalPowerB=new t.EqualPowerGain,this._one=this.context.getConstant(1),this._invert=new t.Subtract,this.a.connect(this.output),this.b.connect(this.output),this.fade.chain(this._equalPowerB,this.b.gain),this._one.connect(this._invert,0,0),this.fade.connect(this._invert,0,1),this._invert.chain(this._equalPowerA,this.a.gain),this._readOnly("fade")},t.extend(t.CrossFade,t.AudioNode),t.CrossFade.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable("fade"),this._equalPowerA.dispose(),this._equalPowerA=null,this._equalPowerB.dispose(),this._equalPowerB=null,this.fade.dispose(),this.fade=null,this._invert.dispose(),this._invert=null,this._one=null,this.a.dispose(),this.a=null,this.b.dispose(),this.b=null,this},t.CrossFade}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){"use strict";return t.Timeline=function(){var e=t.defaults(arguments,["memory"],t.Timeline);t.call(this),this._timeline=[],this.memory=e.memory},t.extend(t.Timeline),t.Timeline.defaults={memory:1/0},Object.defineProperty(t.Timeline.prototype,"length",{get:function(){return this._timeline.length}}),t.Timeline.prototype.add=function(e){if(t.isUndef(e.time))throw new Error("Tone.Timeline: events must have a time attribute");e.time=e.time.valueOf();var i=this._search(e.time);if(this._timeline.splice(i+1,0,e),this.length>this.memory){var n=this.length-this.memory;this._timeline.splice(0,n)}return this},t.Timeline.prototype.remove=function(t){var e=this._timeline.indexOf(t);return-1!==e&&this._timeline.splice(e,1),this},t.Timeline.prototype.get=function(e,i){i=t.defaultArg(i,"time");var n=this._search(e,i);return-1!==n?this._timeline[n]:null},t.Timeline.prototype.peek=function(){return this._timeline[0]},t.Timeline.prototype.shift=function(){return this._timeline.shift()},t.Timeline.prototype.getAfter=function(e,i){i=t.defaultArg(i,"time");var n=this._search(e,i);return n+1<this._timeline.length?this._timeline[n+1]:null},t.Timeline.prototype.getBefore=function(e,i){i=t.defaultArg(i,"time");var n=this._timeline.length;if(n>0&&this._timeline[n-1][i]<e)return this._timeline[n-1];var o=this._search(e,i);return o-1>=0?this._timeline[o-1]:null},t.Timeline.prototype.cancel=function(t){if(this._timeline.length>1){var e=this._search(t);if(e>=0)if(this._timeline[e].time===t){for(var i=e;i>=0&&this._timeline[i].time===t;i--)e=i;this._timeline=this._timeline.slice(0,e)}else this._timeline=this._timeline.slice(0,e+1);else this._timeline=[]}else 1===this._timeline.length&&this._timeline[0].time>=t&&(this._timeline=[]);return this},t.Timeline.prototype.cancelBefore=function(t){var e=this._search(t);return e>=0&&(this._timeline=this._timeline.slice(e+1)),this},t.Timeline.prototype.previousEvent=function(t){var e=this._timeline.indexOf(t);return e>0?this._timeline[e-1]:null},t.Timeline.prototype._search=function(e,i){if(0===this._timeline.length)return-1;i=t.defaultArg(i,"time");var n=0,o=this._timeline.length,s=o;if(o>0&&this._timeline[o-1][i]<=e)return o-1;for(;n<s;){var r=Math.floor(n+(s-n)/2),a=this._timeline[r],l=this._timeline[r+1];if(a[i]===e){for(var h=r;h<this._timeline.length;h++){this._timeline[h][i]===e&&(r=h)}return r}if(a[i]<e&&l[i]>e)return r;a[i]>e?s=r:n=r+1}return-1},t.Timeline.prototype._iterate=function(e,i,n){i=t.defaultArg(i,0),n=t.defaultArg(n,this._timeline.length-1),this._timeline.slice(i,n+1).forEach(function(t){e.call(this,t)}.bind(this))},t.Timeline.prototype.forEach=function(t){return this._iterate(t),this},t.Timeline.prototype.forEachBefore=function(t,e){var i=this._search(t);return-1!==i&&this._iterate(e,0,i),this},t.Timeline.prototype.forEachAfter=function(t,e){var i=this._search(t);return this._iterate(e,i+1),this},t.Timeline.prototype.forEachBetween=function(t,e,i){var n=this._search(t),o=this._search(e);return-1!==n&&-1!==o?(this._timeline[n].time!==t&&(n+=1),this._timeline[o].time===e&&(o-=1),this._iterate(i,n,o)):-1===n&&this._iterate(i,0,o),this},t.Timeline.prototype.forEachFrom=function(t,e){for(var i=this._search(t);i>=0&&this._timeline[i].time>=t;)i--;return this._iterate(e,i+1),this},t.Timeline.prototype.forEachAtTime=function(t,e){var i=this._search(t);return-1!==i&&this._iterate(function(i){i.time===t&&e.call(this,i)},0,i),this},t.Timeline.prototype.dispose=function(){return t.prototype.dispose.call(this),this._timeline=null,this},t.Timeline}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(21),i(1)],void 0===(o=function(t){"use strict";return t.Monophonic=function(e){e=t.defaultArg(e,t.Monophonic.defaults),t.Instrument.call(this,e),this.portamento=e.portamento},t.extend(t.Monophonic,t.Instrument),t.Monophonic.defaults={portamento:0},t.Monophonic.prototype.triggerAttack=function(t,e,i){return this.log("triggerAttack",t,e,i),e=this.toSeconds(e),this._triggerEnvelopeAttack(e,i),this.setNote(t,e),this},t.Monophonic.prototype.triggerRelease=function(t){return this.log("triggerRelease",t),t=this.toSeconds(t),this._triggerEnvelopeRelease(t),this},t.Monophonic.prototype._triggerEnvelopeAttack=function(){},t.Monophonic.prototype._triggerEnvelopeRelease=function(){},t.Monophonic.prototype.getLevelAtTime=function(t){return t=this.toSeconds(t),this.envelope.getValueAtTime(t)},t.Monophonic.prototype.setNote=function(t,e){if(e=this.toSeconds(e),this.portamento>0&&this.getLevelAtTime(e)>.05){var i=this.toSeconds(this.portamento);this.frequency.exponentialRampTo(t,i,e)}else this.frequency.setValueAtTime(t,e);return this},t.Monophonic}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(29),i(5),i(1)],void 0===(o=function(t){"use strict";return t.Scale=function(e,i){t.SignalBase.call(this),this._outputMin=t.defaultArg(e,0),this._outputMax=t.defaultArg(i,1),this._scale=this.input=new t.Multiply(1),this._add=this.output=new t.Add(0),this._scale.connect(this._add),this._setRange()},t.extend(t.Scale,t.SignalBase),Object.defineProperty(t.Scale.prototype,"min",{get:function(){return this._outputMin},set:function(t){this._outputMin=t,this._setRange()}}),Object.defineProperty(t.Scale.prototype,"max",{get:function(){return this._outputMax},set:function(t){this._outputMax=t,this._setRange()}}),t.Scale.prototype._setRange=function(){this._add.value=this._outputMin,this._scale.value=this._outputMax-this._outputMin},t.Scale.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._add.dispose(),this._add=null,this._scale.dispose(),this._scale=null,this},t.Scale}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(3),i(2)],void 0===(o=function(t){"use strict";return t.Volume=function(){var e=t.defaults(arguments,["volume"],t.Volume);t.AudioNode.call(this,e),this.output=this.input=new t.Gain(e.volume,t.Type.Decibels),this._unmutedVolume=e.volume,this.volume=this.output.gain,this._readOnly("volume"),this.mute=e.mute},t.extend(t.Volume,t.AudioNode),t.Volume.defaults={volume:0,mute:!1},Object.defineProperty(t.Volume.prototype,"mute",{get:function(){return this.volume.value===-1/0},set:function(t){!this.mute&&t?(this._unmutedVolume=this.volume.value,this.volume.value=-1/0):this.mute&&!t&&(this.volume.value=this._unmutedVolume)}}),t.Volume.prototype.dispose=function(){return this.input.dispose(),t.AudioNode.prototype.dispose.call(this),this._writable("volume"),this.volume.dispose(),this.volume=null,this},t.Volume}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(3),i(36)],void 0===(o=function(t){return t.Zero=function(){t.SignalBase.call(this),this._gain=this.input=this.output=new t.Gain,this.context.getConstant(0).connect(this._gain)},t.extend(t.Zero,t.SignalBase),t.Zero.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._gain.dispose(),this._gain=null,this},t.Zero}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(3)],void 0===(o=function(t){"use strict";return t.Add=function(e){t.Signal.call(this),this.createInsOuts(2,0),this._sum=this.input[0]=this.input[1]=this.output=new t.Gain,this._param=this.input[1]=new t.Signal(e),this._param.connect(this._sum),this.proxy=!1},t.extend(t.Add,t.Signal),t.Add.prototype.dispose=function(){return t.Signal.prototype.dispose.call(this),this._sum.dispose(),this._sum=null,this},t.Add}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(47),i(3)],void 0===(o=function(t){"use strict";return t.AmplitudeEnvelope=function(){t.Envelope.apply(this,arguments),this.input=this.output=new t.Gain,this._sig.connect(this.output.gain)},t.extend(t.AmplitudeEnvelope,t.Envelope),t.AmplitudeEnvelope.prototype.dispose=function(){return t.Envelope.prototype.dispose.call(this),this},t.AmplitudeEnvelope}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(11),i(6),i(3),i(2),i(63)],void 0===(o=function(t){return t.BufferSource=function(){var e=t.defaults(arguments,["buffer","onload"],t.BufferSource);t.AudioNode.call(this,e),this.onended=e.onended,this._startTime=-1,this._sourceStarted=!1,this._sourceStopped=!1,this._stopTime=-1,this._gainNode=this.output=new t.Gain(0),this._source=this.context.createBufferSource(),this._source.connect(this._gainNode),this._source.onended=this._onended.bind(this),this._buffer=new t.Buffer(e.buffer,e.onload),this.playbackRate=new t.Param({param:this._source.playbackRate,units:t.Type.Positive,value:e.playbackRate}),this.fadeIn=e.fadeIn,this.fadeOut=e.fadeOut,this.curve=e.curve,this._onendedTimeout=-1,this.loop=e.loop,this.loopStart=e.loopStart,this.loopEnd=e.loopEnd},t.extend(t.BufferSource,t.AudioNode),t.BufferSource.defaults={onended:t.noOp,onload:t.noOp,loop:!1,loopStart:0,loopEnd:0,fadeIn:0,fadeOut:0,curve:"linear",playbackRate:1},Object.defineProperty(t.BufferSource.prototype,"state",{get:function(){return this.getStateAtTime(this.now())}}),t.BufferSource.prototype.getStateAtTime=function(e){return e=this.toSeconds(e),-1!==this._startTime&&this._startTime<=e&&(-1===this._stopTime||e<this._stopTime)&&!this._sourceStopped?t.State.Started:t.State.Stopped},t.BufferSource.prototype.start=function(e,i,n,o){this.log("start",e,i,n,o),this.assert(-1===this._startTime,"can only be started once"),this.assert(this.buffer.loaded,"buffer is either not set or not loaded"),this.assert(!this._sourceStopped,"source is already stopped"),e=this.toSeconds(e),i=this.loop?t.defaultArg(i,this.loopStart):t.defaultArg(i,0),i=this.toSeconds(i),i=Math.max(i,0),o=t.defaultArg(o,1);var s=this.toSeconds(this.fadeIn);if(s>0?(this._gainNode.gain.setValueAtTime(0,e),"linear"===this.curve?this._gainNode.gain.linearRampToValueAtTime(o,e+s):this._gainNode.gain.exponentialApproachValueAtTime(o,e,s)):this._gainNode.gain.setValueAtTime(o,e),this._startTime=e,t.isDefined(n)){var r=this.toSeconds(n);r=Math.max(r,0),this.stop(e+r)}if(this.loop){var a=this.loopEnd||this.buffer.duration,l=this.loopStart;i>=a&&(i=(i-l)%(a-l)+l)}return this._source.buffer=this.buffer.get(),this._source.loopEnd=this.loopEnd||this.buffer.duration,i<this.buffer.duration&&(this._sourceStarted=!0,this._source.start(e,i)),this},t.BufferSource.prototype.stop=function(e){this.log("stop",e),this.assert(this.buffer.loaded,"buffer is either not set or not loaded"),this.assert(!this._sourceStopped,"source is already stopped"),e=this.toSeconds(e),-1!==this._stopTime&&this.cancelStop();var i=this.toSeconds(this.fadeOut);return this._stopTime=e+i,i>0?"linear"===this.curve?this._gainNode.gain.linearRampTo(0,i,e):this._gainNode.gain.targetRampTo(0,i,e):(this._gainNode.gain.cancelAndHoldAtTime(e),this._gainNode.gain.setValueAtTime(0,e)),t.context.clearTimeout(this._onendedTimeout),this._onendedTimeout=t.context.setTimeout(this._onended.bind(this),this._stopTime-this.now()),this},t.BufferSource.prototype.cancelStop=function(){if(-1!==this._startTime&&!this._sourceStopped){var t=this.toSeconds(this.fadeIn);this._gainNode.gain.cancelScheduledValues(this._startTime+t+this.sampleTime),this.context.clearTimeout(this._onendedTimeout),this._stopTime=-1}return this},t.BufferSource.prototype._onended=function(){if(!this._sourceStopped){this._sourceStopped=!0;var t="exponential"===this.curve?2*this.fadeOut:0;this._sourceStarted&&-1!==this._stopTime&&this._source.stop(this._stopTime+t),this.onended(this)}},Object.defineProperty(t.BufferSource.prototype,"loopStart",{get:function(){return this._source.loopStart},set:function(t){this._source.loopStart=this.toSeconds(t)}}),Object.defineProperty(t.BufferSource.prototype,"loopEnd",{get:function(){return this._source.loopEnd},set:function(t){this._source.loopEnd=this.toSeconds(t)}}),Object.defineProperty(t.BufferSource.prototype,"buffer",{get:function(){return this._buffer},set:function(t){this._buffer.set(t)}}),Object.defineProperty(t.BufferSource.prototype,"loop",{get:function(){return this._source.loop},set:function(t){this._source.loop=t,this.cancelStop()}}),t.BufferSource.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this.onended=null,this._source.onended=null,this._source.disconnect(),this._source=null,this._gainNode.dispose(),this._gainNode=null,this._buffer.dispose(),this._buffer=null,this._startTime=-1,this.playbackRate=null,t.context.clearTimeout(this._onendedTimeout),this},t.BufferSource}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(1),i(5),i(3)],void 0===(o=function(t){"use strict";return t.FeedbackEffect=function(){var e=t.defaults(arguments,["feedback"],t.FeedbackEffect);t.Effect.call(this,e),this._feedbackGain=new t.Gain(e.feedback,t.Type.NormalRange),this.feedback=this._feedbackGain.gain,this.effectReturn.chain(this._feedbackGain,this.effectSend),this._readOnly(["feedback"])},t.extend(t.FeedbackEffect,t.Effect),t.FeedbackEffect.defaults={feedback:.125},t.FeedbackEffect.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._writable(["feedback"]),this._feedbackGain.dispose(),this._feedbackGain=null,this.feedback=null,this},t.FeedbackEffect}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(24),i(4)],void 0===(o=function(t){"use strict";return t.TimelineState=function(e){t.Timeline.call(this),this._initial=e},t.extend(t.TimelineState,t.Timeline),t.TimelineState.prototype.getValueAtTime=function(t){var e=this.get(t);return null!==e?e.state:this._initial},t.TimelineState.prototype.setStateAtTime=function(t,e){return this.add({state:t,time:e}),this},t.TimelineState.prototype.getLastState=function(t,e){e=this.toSeconds(e);for(var i=this._search(e);i>=0;i--){var n=this._timeline[i];if(n.state===t)return n}},t.TimelineState.prototype.getNextState=function(t,e){e=this.toSeconds(e);var i=this._search(e);if(-1!==i)for(var n=i;n<this._timeline.length;n++){var o=this._timeline[n];if(o.state===t)return o}},t.TimelineState}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(66)],void 0===(o=function(t){if(t.supported){!t.global.hasOwnProperty("AudioContext")&&t.global.hasOwnProperty("webkitAudioContext")&&(t.global.AudioContext=t.global.webkitAudioContext),AudioContext.prototype.close||(AudioContext.prototype.close=function(){return t.isFunction(this.suspend)&&this.suspend(),Promise.resolve()}),AudioContext.prototype.resume||(AudioContext.prototype.resume=function(){var t=this.createBuffer(1,1,this.sampleRate),e=this.createBufferSource();return e.buffer=t,e.connect(this.destination),e.start(0),Promise.resolve()}),!AudioContext.prototype.createGain&&AudioContext.prototype.createGainNode&&(AudioContext.prototype.createGain=AudioContext.prototype.createGainNode),!AudioContext.prototype.createDelay&&AudioContext.prototype.createDelayNode&&(AudioContext.prototype.createDelay=AudioContext.prototype.createDelayNode);var e=!1,i=new OfflineAudioContext(1,1,44100),n=new Uint32Array([1179011410,48,1163280727,544501094,16,131073,44100,176400,1048580,1635017060,8,0,0,0,0]).buffer;try{var o=i.decodeAudioData(n);o&&t.isFunction(o.then)&&(e=!0)}catch(t){e=!1}e||(AudioContext.prototype._native_decodeAudioData=AudioContext.prototype.decodeAudioData,AudioContext.prototype.decodeAudioData=function(t){return new Promise(function(e,i){this._native_decodeAudioData(t,e,i)}.bind(this))})}}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){"use strict";return t.Emitter=function(){t.call(this),this._events={}},t.extend(t.Emitter),t.Emitter.prototype.on=function(t,e){for(var i=t.split(/\W+/),n=0;n<i.length;n++){var o=i[n];this._events.hasOwnProperty(o)||(this._events[o]=[]),this._events[o].push(e)}return this},t.Emitter.prototype.once=function(t,e){var i=function(){e.apply(this,arguments),this.off(t,i)}.bind(this);return this.on(t,i),this},t.Emitter.prototype.off=function(e,i){for(var n=e.split(/\W+/),o=0;o<n.length;o++)if(e=n[o],this._events.hasOwnProperty(e))if(t.isUndef(i))this._events[e]=[];else for(var s=this._events[e],r=0;r<s.length;r++)s[r]===i&&s.splice(r,1);return this},t.Emitter.prototype.emit=function(t){if(this._events){var e=Array.apply(null,arguments).slice(1);if(this._events.hasOwnProperty(t))for(var i=this._events[t].slice(0),n=0,o=i.length;n<o;n++)i[n].apply(this,e)}return this},t.Emitter.mixin=function(e){var i=["on","once","off","emit"];e._events={};for(var n=0;n<i.length;n++){var o=i[n],s=t.Emitter.prototype[o];e[o]=s}return t.Emitter},t.Emitter.prototype.dispose=function(){return t.prototype.dispose.call(this),this._events=null,this},t.Emitter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(2)],void 0===(o=function(t){"use strict";return t.SignalBase=function(){t.AudioNode.call(this)},t.extend(t.SignalBase,t.AudioNode),t.SignalBase.prototype.connect=function(e,i,n){return t.Signal&&t.Signal===e.constructor||t.Param&&t.Param===e.constructor?(e._param.cancelScheduledValues(0),e._param.setValueAtTime(0,0),e.overridden=!0):e instanceof AudioParam&&(e.cancelScheduledValues(0),e.setValueAtTime(0,0)),t.AudioNode.prototype.connect.call(this,e,i,n),this},t.SignalBase}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(17),i(49),i(71),i(48),i(70),i(69)],void 0===(o=function(t){"use strict";t.OmniOscillator=function(){var e=t.defaults(arguments,["frequency","type"],t.OmniOscillator);t.Source.call(this,e),this.frequency=new t.Signal(e.frequency,t.Type.Frequency),this.detune=new t.Signal(e.detune,t.Type.Cents),this._sourceType=void 0,this._oscillator=null,this.type=e.type,this._readOnly(["frequency","detune"]),this.set(e)},t.extend(t.OmniOscillator,t.Source),t.OmniOscillator.defaults={frequency:440,detune:0,type:"sine",phase:0};var e="PulseOscillator",i="PWMOscillator",n="Oscillator",o="FMOscillator",s="AMOscillator",r="FatOscillator";t.OmniOscillator.prototype._start=function(t){this._oscillator.start(t)},t.OmniOscillator.prototype._stop=function(t){this._oscillator.stop(t)},t.OmniOscillator.prototype.restart=function(t){this._oscillator.restart(t)},Object.defineProperty(t.OmniOscillator.prototype,"type",{get:function(){var t="";return this._sourceType===o?t="fm":this._sourceType===s?t="am":this._sourceType===r&&(t="fat"),t+this._oscillator.type},set:function(t){"fm"===t.substr(0,2)?(this._createNewOscillator(o),this._oscillator.type=t.substr(2)):"am"===t.substr(0,2)?(this._createNewOscillator(s),this._oscillator.type=t.substr(2)):"fat"===t.substr(0,3)?(this._createNewOscillator(r),this._oscillator.type=t.substr(3)):"pwm"===t?this._createNewOscillator(i):"pulse"===t?this._createNewOscillator(e):(this._createNewOscillator(n),this._oscillator.type=t)}}),Object.defineProperty(t.OmniOscillator.prototype,"partials",{get:function(){return this._oscillator.partials},set:function(t){this._oscillator.partials=t}}),Object.defineProperty(t.OmniOscillator.prototype,"partialCount",{get:function(){return this._oscillator.partialCount},set:function(t){this._oscillator.partialCount=t}}),t.OmniOscillator.prototype.set=function(e,i){return"type"===e?this.type=i:t.isObject(e)&&e.hasOwnProperty("type")&&(this.type=e.type),t.prototype.set.apply(this,arguments),this},t.OmniOscillator.prototype.get=function(t){var e=this._oscillator.get(t);return e.type=this.type,e},t.OmniOscillator.prototype._createNewOscillator=function(e){if(e!==this._sourceType){this._sourceType=e;var i=t[e],n=this.now();if(null!==this._oscillator){var o=this._oscillator;o.stop(n),this.context.setTimeout(function(){o.dispose(),o=null},this.blockTime)}this._oscillator=new i,this.frequency.connect(this._oscillator.frequency),this.detune.connect(this._oscillator.detune),this._oscillator.connect(this.output),this.state===t.State.Started&&this._oscillator.start(n)}},Object.defineProperty(t.OmniOscillator.prototype,"phase",{get:function(){return this._oscillator.phase},set:function(t){this._oscillator.phase=t}});var a={PulseOscillator:"pulse",PWMOscillator:"pwm",Oscillator:"oscillator",FMOscillator:"fm",AMOscillator:"am",FatOscillator:"fat"};return Object.defineProperty(t.OmniOscillator.prototype,"sourceType",{get:function(){return a[this._sourceType]},set:function(t){var e="sine";"pwm"!==this._oscillator.type&&"pulse"!==this._oscillator.type&&(e=this._oscillator.type),t===a.FMOscillator?this.type="fm"+e:t===a.AMOscillator?this.type="am"+e:t===a.FatOscillator?this.type="fat"+e:t===a.Oscillator?this.type=e:t===a.PulseOscillator?this.type="pulse":t===a.PWMOscillator&&(this.type="pwm")}}),Object.defineProperty(t.OmniOscillator.prototype,"baseType",{get:function(){return this._oscillator.baseType},set:function(t){this.sourceType!==a.PulseOscillator&&this.sourceType!==a.PWMOscillator&&(this._oscillator.baseType=t)}}),Object.defineProperty(t.OmniOscillator.prototype,"width",{get:function(){if(this._sourceType===e)return this._oscillator.width}}),Object.defineProperty(t.OmniOscillator.prototype,"count",{get:function(){if(this._sourceType===r)return this._oscillator.count},set:function(t){this._sourceType===r&&(this._oscillator.count=t)}}),Object.defineProperty(t.OmniOscillator.prototype,"spread",{get:function(){if(this._sourceType===r)return this._oscillator.spread},set:function(t){this._sourceType===r&&(this._oscillator.spread=t)}}),Object.defineProperty(t.OmniOscillator.prototype,"modulationType",{get:function(){if(this._sourceType===o||this._sourceType===s)return this._oscillator.modulationType},set:function(t){this._sourceType!==o&&this._sourceType!==s||(this._oscillator.modulationType=t)}}),Object.defineProperty(t.OmniOscillator.prototype,"modulationIndex",{get:function(){if(this._sourceType===o)return this._oscillator.modulationIndex}}),Object.defineProperty(t.OmniOscillator.prototype,"harmonicity",{get:function(){if(this._sourceType===o||this._sourceType===s)return this._oscillator.harmonicity}}),Object.defineProperty(t.OmniOscillator.prototype,"modulationFrequency",{get:function(){if(this._sourceType===i)return this._oscillator.modulationFrequency}}),t.OmniOscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this._writable(["frequency","detune"]),this.detune.dispose(),this.detune=null,this.frequency.dispose(),this.frequency=null,this._oscillator.dispose(),this._oscillator=null,this._sourceType=null,this},t.OmniOscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(30),i(37),i(1),i(25)],void 0===(o=function(t){"use strict";return t.Synth=function(e){e=t.defaultArg(e,t.Synth.defaults),t.Monophonic.call(this,e),this.oscillator=new t.OmniOscillator(e.oscillator),this.frequency=this.oscillator.frequency,this.detune=this.oscillator.detune,this.envelope=new t.AmplitudeEnvelope(e.envelope),this.oscillator.chain(this.envelope,this.output),this._readOnly(["oscillator","frequency","detune","envelope"])},t.extend(t.Synth,t.Monophonic),t.Synth.defaults={oscillator:{type:"triangle"},envelope:{attack:.005,decay:.1,sustain:.3,release:1}},t.Synth.prototype._triggerEnvelopeAttack=function(t,e){return this.envelope.triggerAttack(t,e),this.oscillator.start(t),0===this.envelope.sustain&&this.oscillator.stop(t+this.envelope.attack+this.envelope.decay),this},t.Synth.prototype._triggerEnvelopeRelease=function(t){return t=this.toSeconds(t),this.envelope.triggerRelease(t),this.oscillator.stop(t+this.envelope.release),this},t.Synth.prototype.dispose=function(){return t.Monophonic.prototype.dispose.call(this),this._writable(["oscillator","frequency","detune","envelope"]),this.oscillator.dispose(),this.oscillator=null,this.envelope.dispose(),this.envelope=null,this.frequency=null,this.detune=null,this},t.Synth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(11),i(31)],void 0===(o=function(t){"use strict";t.Noise=function(){var e=t.defaults(arguments,["type"],t.Noise);t.Source.call(this,e),this._source=null,this._type=e.type,this._playbackRate=e.playbackRate},t.extend(t.Noise,t.Source),t.Noise.defaults={type:"white",playbackRate:1},Object.defineProperty(t.Noise.prototype,"type",{get:function(){return this._type},set:function(i){if(this._type!==i){if(!(i in e))throw new TypeError("Tone.Noise: invalid type: "+i);if(this._type=i,this.state===t.State.Started){var n=this.now();this._stop(n),this._start(n)}}}}),Object.defineProperty(t.Noise.prototype,"playbackRate",{get:function(){return this._playbackRate},set:function(t){this._playbackRate=t,this._source&&(this._source.playbackRate.value=t)}}),t.Noise.prototype._start=function(i){var n=e[this._type];this._source=new t.BufferSource(n).connect(this.output),this._source.loop=!0,this._source.playbackRate.value=this._playbackRate,this._source.start(this.toSeconds(i),Math.random()*(n.duration-.001))},t.Noise.prototype._stop=function(t){this._source&&(this._source.stop(this.toSeconds(t)),this._source=null)},t.Noise.prototype.restart=function(t){return this._stop(t),this._start(t),this},t.Noise.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),null!==this._source&&(this._source.disconnect(),this._source=null),this._buffer=null,this};var e={},i={};return Object.defineProperty(e,"pink",{get:function(){if(!i.pink){for(var e=[],n=0;n<2;n++){var o,s,r,a,l,h,u,c=new Float32Array(220500);e[n]=c,o=s=r=a=l=h=u=0;for(var p=0;p<220500;p++){var f=2*Math.random()-1;o=.99886*o+.0555179*f,s=.99332*s+.0750759*f,r=.969*r+.153852*f,a=.8665*a+.3104856*f,l=.55*l+.5329522*f,h=-.7616*h-.016898*f,c[p]=o+s+r+a+l+h+u+.5362*f,c[p]*=.11,u=.115926*f}}i.pink=(new t.Buffer).fromArray(e)}return i.pink}}),Object.defineProperty(e,"brown",{get:function(){if(!i.brown){for(var e=[],n=0;n<2;n++){var o=new Float32Array(220500);e[n]=o;for(var s=0,r=0;r<220500;r++){var a=2*Math.random()-1;o[r]=(s+.02*a)/1.02,s=o[r],o[r]*=3.5}}i.brown=(new t.Buffer).fromArray(e)}return i.brown}}),Object.defineProperty(e,"white",{get:function(){if(!i.white){for(var e=[],n=0;n<2;n++){var o=new Float32Array(220500);e[n]=o;for(var s=0;s<220500;s++)o[s]=2*Math.random()-1}i.white=(new t.Buffer).fromArray(e)}return i.white}}),t.Noise}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(27),i(20),i(2)],void 0===(o=function(t){"use strict";t.Master=function(){t.AudioNode.call(this),t.getContext(function(){this.createInsOuts(1,0),this._volume=this.output=new t.Volume,this.volume=this._volume.volume,this._readOnly("volume"),this.input.chain(this.output,this.context.destination),this.context.master=this}.bind(this))},t.extend(t.Master,t.AudioNode),t.Master.defaults={volume:0,mute:!1},t.Master.prototype.isMaster=!0,Object.defineProperty(t.Master.prototype,"mute",{get:function(){return this._volume.mute},set:function(t){this._volume.mute=t}}),t.Master.prototype.chain=function(){this.input.disconnect(),this.input.chain.apply(this.input,arguments),arguments[arguments.length-1].connect(this.output)},t.Master.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this),this._writable("volume"),this._volume.dispose(),this._volume=null,this.volume=null},t.AudioNode.prototype.toMaster=function(){return this.connect(this.context.master),this};var e=t.Master;return t.Master=new e,t.Context.on("init",function(i){i.master&&i.master.isMaster?t.Master=i.master:t.Master=new e}),t.Context.on("close",function(t){t.master&&t.master.isMaster&&t.master.dispose()}),t.Master}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(89),i(47)],void 0===(o=function(t){"use strict";return t.FrequencyEnvelope=function(){var e=t.defaults(arguments,["attack","decay","sustain","release"],t.Envelope);e=t.defaultArg(e,t.FrequencyEnvelope.defaults),t.ScaledEnvelope.call(this,e),this._octaves=e.octaves,this.baseFrequency=e.baseFrequency,this.octaves=e.octaves,this.exponent=e.exponent},t.extend(t.FrequencyEnvelope,t.Envelope),t.FrequencyEnvelope.defaults={baseFrequency:200,octaves:4,exponent:1},Object.defineProperty(t.FrequencyEnvelope.prototype,"baseFrequency",{get:function(){return this._scale.min},set:function(t){this._scale.min=this.toFrequency(t),this.octaves=this._octaves}}),Object.defineProperty(t.FrequencyEnvelope.prototype,"octaves",{get:function(){return this._octaves},set:function(t){this._octaves=t,this._scale.max=this.baseFrequency*Math.pow(2,t)}}),Object.defineProperty(t.FrequencyEnvelope.prototype,"exponent",{get:function(){return this._exp.value},set:function(t){this._exp.value=t}}),t.FrequencyEnvelope.prototype.dispose=function(){return t.ScaledEnvelope.prototype.dispose.call(this),this},t.FrequencyEnvelope}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(26),i(61)],void 0===(o=function(t){return t.ScaleExp=function(e,i,n){t.SignalBase.call(this),this._scale=this.output=new t.Scale(e,i),this._exp=this.input=new t.Pow(t.defaultArg(n,2)),this._exp.connect(this._scale)},t.extend(t.ScaleExp,t.SignalBase),Object.defineProperty(t.ScaleExp.prototype,"exponent",{get:function(){return this._exp.value},set:function(t){this._exp.value=t}}),Object.defineProperty(t.ScaleExp.prototype,"min",{get:function(){return this._scale.min},set:function(t){this._scale.min=t}}),Object.defineProperty(t.ScaleExp.prototype,"max",{get:function(){return this._scale.max},set:function(t){this._scale.max=t}}),t.ScaleExp.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._scale.dispose(),this._scale=null,this._exp.dispose(),this._exp=null,this},t.ScaleExp}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(14),i(2)],void 0===(o=function(t){"use strict";return t.Compressor=function(){var e=t.defaults(arguments,["threshold","ratio"],t.Compressor);t.AudioNode.call(this),this._compressor=this.input=this.output=this.context.createDynamicsCompressor(),this.threshold=new t.Param({param:this._compressor.threshold,units:t.Type.Decibels,convert:!1}),this.attack=new t.Param(this._compressor.attack,t.Type.Time),this.release=new t.Param(this._compressor.release,t.Type.Time),this.knee=new t.Param({param:this._compressor.knee,units:t.Type.Decibels,convert:!1}),this.ratio=new t.Param({param:this._compressor.ratio,convert:!1}),this._readOnly(["knee","release","attack","ratio","threshold"]),this.set(e)},t.extend(t.Compressor,t.AudioNode),t.Compressor.defaults={ratio:12,threshold:-24,release:.25,attack:.003,knee:30},t.Compressor.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["knee","release","attack","ratio","threshold"]),this._compressor.disconnect(),this._compressor=null,this.attack.dispose(),this.attack=null,this.release.dispose(),this.release=null,this.threshold.dispose(),this.threshold=null,this.ratio.dispose(),this.ratio=null,this.knee.dispose(),this.knee=null,this},t.Compressor}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(2),i(96)],void 0===(o=function(t){"use strict";return t.Analyser=function(){var e=t.defaults(arguments,["type","size"],t.Analyser);t.AudioNode.call(this),this._analyser=this.input=this.output=this.context.createAnalyser(),this._type=e.type,this._buffer=null,this.size=e.size,this.type=e.type},t.extend(t.Analyser,t.AudioNode),t.Analyser.defaults={size:1024,type:"fft",smoothing:.8},t.Analyser.Type={Waveform:"waveform",FFT:"fft"},t.Analyser.prototype.getValue=function(){return this._type===t.Analyser.Type.FFT?this._analyser.getFloatFrequencyData(this._buffer):this._type===t.Analyser.Type.Waveform&&this._analyser.getFloatTimeDomainData(this._buffer),this._buffer},Object.defineProperty(t.Analyser.prototype,"size",{get:function(){return this._analyser.frequencyBinCount},set:function(t){this._analyser.fftSize=2*t,this._buffer=new Float32Array(t)}}),Object.defineProperty(t.Analyser.prototype,"type",{get:function(){return this._type},set:function(e){if(e!==t.Analyser.Type.Waveform&&e!==t.Analyser.Type.FFT)throw new TypeError("Tone.Analyser: invalid type: "+e);this._type=e}}),Object.defineProperty(t.Analyser.prototype,"smoothing",{get:function(){return this._analyser.smoothingTimeConstant},set:function(t){this._analyser.smoothingTimeConstant=t}}),t.Analyser.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this),this._analyser.disconnect(),this._analyser=null,this._buffer=null},t.Analyser}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(65)],void 0===(o=function(t){return t.TransportTime=function(e,i){if(!(this instanceof t.TransportTime))return new t.TransportTime(e,i);t.Time.call(this,e,i)},t.extend(t.TransportTime,t.Time),t.TransportTime.prototype._now=function(){return t.Transport.seconds},t.TransportTime}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(64)],void 0===(o=function(t){t.Frequency=function(e,i){if(!(this instanceof t.Frequency))return new t.Frequency(e,i);t.TimeBase.call(this,e,i)},t.extend(t.Frequency,t.TimeBase),t.Frequency.prototype._expressions=Object.assign({},t.TimeBase.prototype._expressions,{midi:{regexp:/^(\d+(?:\.\d+)?midi)/,method:function(e){return"midi"===this._defaultUnits?e:t.Frequency.mtof(e)}},note:{regexp:/^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,method:function(i,n){var o=e[i.toLowerCase()]+12*(parseInt(n)+1);return"midi"===this._defaultUnits?o:t.Frequency.mtof(o)}},tr:{regexp:/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,method:function(t,e,i){var n=1;return t&&"0"!==t&&(n*=this._beatsToUnits(this._getTimeSignature()*parseFloat(t))),e&&"0"!==e&&(n*=this._beatsToUnits(parseFloat(e))),i&&"0"!==i&&(n*=this._beatsToUnits(parseFloat(i)/4)),n}}}),t.Frequency.prototype.transpose=function(e){return new this.constructor(this.valueOf()*t.intervalToFrequencyRatio(e))},t.Frequency.prototype.harmonize=function(t){return t.map(function(t){return this.transpose(t)}.bind(this))},t.Frequency.prototype.toMidi=function(){return t.Frequency.ftom(this.valueOf())},t.Frequency.prototype.toNote=function(){var e=this.toFrequency(),n=Math.log2(e/t.Frequency.A4),o=Math.round(12*n)+57,s=Math.floor(o/12);return s<0&&(o+=-12*s),i[o%12]+s.toString()},t.Frequency.prototype.toSeconds=function(){return 1/t.TimeBase.prototype.toSeconds.call(this)},t.Frequency.prototype.toFrequency=function(){return t.TimeBase.prototype.toFrequency.call(this)},t.Frequency.prototype.toTicks=function(){var e=this._beatsToUnits(1),i=this.valueOf()/e;return Math.floor(i*t.Transport.PPQ)},t.Frequency.prototype._noArg=function(){return 0},t.Frequency.prototype._frequencyToUnits=function(t){return t},t.Frequency.prototype._ticksToUnits=function(e){return 1/(60*e/(t.Transport.bpm.value*t.Transport.PPQ))},t.Frequency.prototype._beatsToUnits=function(e){return 1/t.TimeBase.prototype._beatsToUnits.call(this,e)},t.Frequency.prototype._secondsToUnits=function(t){return 1/t},t.Frequency.prototype._defaultUnits="hz";var e={cbb:-2,cb:-1,c:0,"c#":1,cx:2,dbb:0,db:1,d:2,"d#":3,dx:4,ebb:2,eb:3,e:4,"e#":5,ex:6,fbb:3,fb:4,f:5,"f#":6,fx:7,gbb:5,gb:6,g:7,"g#":8,gx:9,abb:7,ab:8,a:9,"a#":10,ax:11,bbb:9,bb:10,b:11,"b#":12,bx:13},i=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];return t.Frequency.A4=440,t.Frequency.mtof=function(e){return t.Frequency.A4*Math.pow(2,(e-69)/12)},t.Frequency.ftom=function(e){return 69+Math.round(12*Math.log2(e/t.Frequency.A4))},t.Frequency}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(61),i(4),i(2)],void 0===(o=function(t){"use strict";return t.Envelope=function(){var e=t.defaults(arguments,["attack","decay","sustain","release"],t.Envelope);t.AudioNode.call(this),this.attack=e.attack,this.decay=e.decay,this.sustain=e.sustain,this.release=e.release,this._attackCurve="linear",this._releaseCurve="exponential",this._sig=this.output=new t.Signal(0),this.attackCurve=e.attackCurve,this.releaseCurve=e.releaseCurve,this.decayCurve=e.decayCurve},t.extend(t.Envelope,t.AudioNode),t.Envelope.defaults={attack:.01,decay:.1,sustain:.5,release:1,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},Object.defineProperty(t.Envelope.prototype,"value",{get:function(){return this.getValueAtTime(this.now())}}),t.Envelope.prototype._getCurve=function(e,i){if(t.isString(e))return e;if(t.isArray(e)){for(var n in t.Envelope.Type)if(t.Envelope.Type[n][i]===e)return n;return e}},t.Envelope.prototype._setCurve=function(e,i,n){if(t.Envelope.Type.hasOwnProperty(n)){var o=t.Envelope.Type[n];t.isObject(o)?this[e]=o[i]:this[e]=o}else{if(!t.isArray(n))throw new Error("Tone.Envelope: invalid curve: "+n);this[e]=n}},Object.defineProperty(t.Envelope.prototype,"attackCurve",{get:function(){return this._getCurve(this._attackCurve,"In")},set:function(t){this._setCurve("_attackCurve","In",t)}}),Object.defineProperty(t.Envelope.prototype,"releaseCurve",{get:function(){return this._getCurve(this._releaseCurve,"Out")},set:function(t){this._setCurve("_releaseCurve","Out",t)}}),Object.defineProperty(t.Envelope.prototype,"decayCurve",{get:function(){return this._decayCurve},set:function(t){if(!["linear","exponential"].includes(t))throw new Error("Tone.Envelope: invalid curve: "+t);this._decayCurve=t}}),t.Envelope.prototype.triggerAttack=function(e,i){this.log("triggerAttack",e,i),e=this.toSeconds(e);var n=this.toSeconds(this.attack),o=this.toSeconds(this.decay);i=t.defaultArg(i,1);var s=this.getValueAtTime(e);s>0&&(n=(1-s)/(1/n));if("linear"===this._attackCurve)this._sig.linearRampTo(i,n,e);else if("exponential"===this._attackCurve)this._sig.targetRampTo(i,n,e);else if(n>0){this._sig.cancelAndHoldAtTime(e);for(var r=this._attackCurve,a=1;a<r.length;a++)if(r[a-1]<=s&&s<=r[a]){(r=this._attackCurve.slice(a))[0]=s;break}this._sig.setValueCurveAtTime(r,e,n,i)}if(o){var l=i*this.sustain,h=e+n;this.log("decay",h),"linear"===this._decayCurve?this._sig.linearRampTo(l,o,h+this.sampleTime):"exponential"===this._decayCurve&&this._sig.exponentialApproachValueAtTime(l,h,o)}return this},t.Envelope.prototype.triggerRelease=function(e){this.log("triggerRelease",e),e=this.toSeconds(e);var i=this.getValueAtTime(e);if(i>0){var n=this.toSeconds(this.release);if("linear"===this._releaseCurve)this._sig.linearRampTo(0,n,e);else if("exponential"===this._releaseCurve)this._sig.targetRampTo(0,n,e);else{var o=this._releaseCurve;t.isArray(o)&&(this._sig.cancelAndHoldAtTime(e),this._sig.setValueCurveAtTime(o,e,n,i))}}return this},t.Envelope.prototype.getValueAtTime=function(t){return this._sig.getValueAtTime(t)},t.Envelope.prototype.triggerAttackRelease=function(t,e,i){return e=this.toSeconds(e),this.triggerAttack(e,i),this.triggerRelease(e+this.toSeconds(t)),this},t.Envelope.prototype.cancel=function(t){return this._sig.cancelScheduledValues(t),this},t.Envelope.prototype.connect=t.SignalBase.prototype.connect,function(){var e,i,n=[];for(e=0;e<128;e++)n[e]=Math.sin(e/127*(Math.PI/2));var o=[];for(e=0;e<127;e++){i=e/127;var s=Math.sin(i*(2*Math.PI)*6.4-Math.PI/2)+1;o[e]=s/10+.83*i}o[127]=1;var r=[];for(e=0;e<128;e++)r[e]=Math.ceil(e/127*5)/5;var a=[];for(e=0;e<128;e++)i=e/127,a[e]=.5*(1-Math.cos(Math.PI*i));var l,h=[];for(e=0;e<128;e++){i=e/127;var u=4*Math.pow(i,3)+.2,c=Math.cos(u*Math.PI*2*i);h[e]=Math.abs(c*(1-i))}function p(t){for(var e=new Array(t.length),i=0;i<t.length;i++)e[i]=1-t[i];return e}t.Envelope.Type={linear:"linear",exponential:"exponential",bounce:{In:p(h),Out:h},cosine:{In:n,Out:(l=n,l.slice(0).reverse())},step:{In:r,Out:p(r)},ripple:{In:o,Out:p(o)},sine:{In:a,Out:p(a)}}}(),t.Envelope.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._sig.dispose(),this._sig=null,this._attackCurve=null,this._releaseCurve=null,this},t.Envelope}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(17),i(5),i(3)],void 0===(o=function(t){"use strict";return t.FMOscillator=function(){var e=t.defaults(arguments,["frequency","type","modulationType"],t.FMOscillator);t.Source.call(this,e),this._carrier=new t.Oscillator(e.frequency,e.type),this.frequency=new t.Signal(e.frequency,t.Type.Frequency),this.detune=this._carrier.detune,this.detune.value=e.detune,this.modulationIndex=new t.Multiply(e.modulationIndex),this.modulationIndex.units=t.Type.Positive,this._modulator=new t.Oscillator(e.frequency,e.modulationType),this.harmonicity=new t.Multiply(e.harmonicity),this.harmonicity.units=t.Type.Positive,this._modulationNode=new t.Gain(0),this.frequency.connect(this._carrier.frequency),this.frequency.chain(this.harmonicity,this._modulator.frequency),this.frequency.chain(this.modulationIndex,this._modulationNode),this._modulator.connect(this._modulationNode.gain),this._modulationNode.connect(this._carrier.frequency),this._carrier.connect(this.output),this.detune.connect(this._modulator.detune),this.phase=e.phase,this._readOnly(["modulationIndex","frequency","detune","harmonicity"])},t.extend(t.FMOscillator,t.Source),t.FMOscillator.defaults={frequency:440,detune:0,phase:0,type:"sine",modulationIndex:2,modulationType:"square",harmonicity:1},t.FMOscillator.prototype._start=function(t){this._modulator.start(t),this._carrier.start(t)},t.FMOscillator.prototype._stop=function(t){this._modulator.stop(t),this._carrier.stop(t)},t.FMOscillator.prototype.restart=function(t){this._modulator.restart(t),this._carrier.restart(t)},Object.defineProperty(t.FMOscillator.prototype,"type",{get:function(){return this._carrier.type},set:function(t){this._carrier.type=t}}),Object.defineProperty(t.FMOscillator.prototype,"baseType",{get:function(){return this._carrier.baseType},set:function(t){this._carrier.baseType=t}}),Object.defineProperty(t.FMOscillator.prototype,"partialCount",{get:function(){return this._carrier.partialCount},set:function(t){this._carrier.partialCount=t}}),Object.defineProperty(t.FMOscillator.prototype,"modulationType",{get:function(){return this._modulator.type},set:function(t){this._modulator.type=t}}),Object.defineProperty(t.FMOscillator.prototype,"phase",{get:function(){return this._carrier.phase},set:function(t){this._carrier.phase=t,this._modulator.phase=t}}),Object.defineProperty(t.FMOscillator.prototype,"partials",{get:function(){return this._carrier.partials},set:function(t){this._carrier.partials=t}}),t.FMOscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this._writable(["modulationIndex","frequency","detune","harmonicity"]),this.frequency.dispose(),this.frequency=null,this.detune=null,this.harmonicity.dispose(),this.harmonicity=null,this._carrier.dispose(),this._carrier=null,this._modulator.dispose(),this._modulator=null,this._modulationNode.dispose(),this._modulationNode=null,this.modulationIndex.dispose(),this.modulationIndex=null,this},t.FMOscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(17),i(1),i(7),i(3)],void 0===(o=function(t){"use strict";return t.PulseOscillator=function(){var e=t.defaults(arguments,["frequency","width"],t.Oscillator);t.Source.call(this,e),this.width=new t.Signal(e.width,t.Type.NormalRange),this._widthGate=new t.Gain(0),this._sawtooth=new t.Oscillator({frequency:e.frequency,detune:e.detune,type:"sawtooth",phase:e.phase}),this.frequency=this._sawtooth.frequency,this.detune=this._sawtooth.detune,this._thresh=new t.WaveShaper(function(t){return t<0?-1:1}),this._sawtooth.chain(this._thresh,this.output),this.width.chain(this._widthGate,this._thresh),this._readOnly(["width","frequency","detune"])},t.extend(t.PulseOscillator,t.Source),t.PulseOscillator.defaults={frequency:440,detune:0,phase:0,width:.2},t.PulseOscillator.prototype._start=function(t){t=this.toSeconds(t),this._sawtooth.start(t),this._widthGate.gain.setValueAtTime(1,t)},t.PulseOscillator.prototype._stop=function(t){t=this.toSeconds(t),this._sawtooth.stop(t),this._widthGate.gain.setValueAtTime(0,t)},t.PulseOscillator.prototype.restart=function(t){this._sawtooth.restart(t),this._widthGate.gain.cancelScheduledValues(t),this._widthGate.gain.setValueAtTime(1,t)},Object.defineProperty(t.PulseOscillator.prototype,"phase",{get:function(){return this._sawtooth.phase},set:function(t){this._sawtooth.phase=t}}),Object.defineProperty(t.PulseOscillator.prototype,"type",{get:function(){return"pulse"}}),Object.defineProperty(t.PulseOscillator.prototype,"baseType",{get:function(){return"pulse"}}),Object.defineProperty(t.PulseOscillator.prototype,"partials",{get:function(){return[]}}),t.PulseOscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this._sawtooth.dispose(),this._sawtooth=null,this._writable(["width","frequency","detune"]),this.width.dispose(),this.width=null,this._widthGate.dispose(),this._widthGate=null,this._thresh.dispose(),this._thresh=null,this.frequency=null,this.detune=null,this},t.PulseOscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(16),i(4),i(33)],void 0===(o=function(t){"use strict";return t.Event=function(){var e=t.defaults(arguments,["callback","value"],t.Event);t.call(this),this._loop=e.loop,this.callback=e.callback,this.value=e.value,this._loopStart=this.toTicks(e.loopStart),this._loopEnd=this.toTicks(e.loopEnd),this._state=new t.TimelineState(t.State.Stopped),this._playbackRate=1,this._startOffset=0,this._probability=e.probability,this._humanize=e.humanize,this.mute=e.mute,this.playbackRate=e.playbackRate},t.extend(t.Event),t.Event.defaults={callback:t.noOp,loop:!1,loopEnd:"1m",loopStart:0,playbackRate:1,value:null,probability:1,mute:!1,humanize:!1},t.Event.prototype._rescheduleEvents=function(e){return e=t.defaultArg(e,-1),this._state.forEachFrom(e,function(e){var i;if(e.state===t.State.Started){t.isDefined(e.id)&&t.Transport.clear(e.id);var n=e.time+Math.round(this.startOffset/this._playbackRate);if(this._loop){i=1/0,t.isNumber(this._loop)&&(i=this._loop*this._getLoopDuration());var o=this._state.getAfter(n);null!==o&&(i=Math.min(i,o.time-n)),i!==1/0&&(this._state.setStateAtTime(t.State.Stopped,n+i+1),i=t.Ticks(i));var s=t.Ticks(this._getLoopDuration());e.id=t.Transport.scheduleRepeat(this._tick.bind(this),s,t.Ticks(n),i)}else e.id=t.Transport.schedule(this._tick.bind(this),t.Ticks(n))}}.bind(this)),this},Object.defineProperty(t.Event.prototype,"state",{get:function(){return this._state.getValueAtTime(t.Transport.ticks)}}),Object.defineProperty(t.Event.prototype,"startOffset",{get:function(){return this._startOffset},set:function(t){this._startOffset=t}}),Object.defineProperty(t.Event.prototype,"probability",{get:function(){return this._probability},set:function(t){this._probability=t}}),Object.defineProperty(t.Event.prototype,"humanize",{get:function(){return this._humanize},set:function(t){this._humanize=t}}),t.Event.prototype.start=function(e){return e=this.toTicks(e),this._state.getValueAtTime(e)===t.State.Stopped&&(this._state.add({state:t.State.Started,time:e,id:void 0}),this._rescheduleEvents(e)),this},t.Event.prototype.stop=function(e){if(this.cancel(e),e=this.toTicks(e),this._state.getValueAtTime(e)===t.State.Started){this._state.setStateAtTime(t.State.Stopped,e);var i=this._state.getBefore(e),n=e;null!==i&&(n=i.time),this._rescheduleEvents(n)}return this},t.Event.prototype.cancel=function(e){return e=t.defaultArg(e,-1/0),e=this.toTicks(e),this._state.forEachFrom(e,function(e){t.Transport.clear(e.id)}),this._state.cancel(e),this},t.Event.prototype._tick=function(e){var i=t.Transport.getTicksAtTime(e);if(!this.mute&&this._state.getValueAtTime(i)===t.State.Started){if(this.probability<1&&Math.random()>this.probability)return;if(this.humanize){var n=.02;t.isBoolean(this.humanize)||(n=this.toSeconds(this.humanize)),e+=(2*Math.random()-1)*n}this.callback(e,this.value)}},t.Event.prototype._getLoopDuration=function(){return Math.round((this._loopEnd-this._loopStart)/this._playbackRate)},Object.defineProperty(t.Event.prototype,"loop",{get:function(){return this._loop},set:function(t){this._loop=t,this._rescheduleEvents()}}),Object.defineProperty(t.Event.prototype,"playbackRate",{get:function(){return this._playbackRate},set:function(t){this._playbackRate=t,this._rescheduleEvents()}}),Object.defineProperty(t.Event.prototype,"loopEnd",{get:function(){return t.Ticks(this._loopEnd).toSeconds()},set:function(t){this._loopEnd=this.toTicks(t),this._loop&&this._rescheduleEvents()}}),Object.defineProperty(t.Event.prototype,"loopStart",{get:function(){return t.Ticks(this._loopStart).toSeconds()},set:function(t){this._loopStart=this.toTicks(t),this._loop&&this._rescheduleEvents()}}),Object.defineProperty(t.Event.prototype,"progress",{get:function(){if(this._loop){var e=t.Transport.ticks,i=this._state.get(e);if(null!==i&&i.state===t.State.Started){var n=this._getLoopDuration();return(e-i.time)%n/n}return 0}return 0}}),t.Event.prototype.dispose=function(){this.cancel(),this._state.dispose(),this._state=null,this.callback=null,this.value=null},t.Event}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(13),i(29),i(10),i(3),i(2)],void 0===(o=function(t){"use strict";return t.MidSideMerge=function(){t.AudioNode.call(this),this.createInsOuts(2,0),this.mid=this.input[0]=new t.Gain,this._left=new t.Add,this._timesTwoLeft=new t.Multiply(Math.SQRT1_2),this.side=this.input[1]=new t.Gain,this._right=new t.Subtract,this._timesTwoRight=new t.Multiply(Math.SQRT1_2),this._merge=this.output=new t.Merge,this.mid.connect(this._left,0,0),this.side.connect(this._left,0,1),this.mid.connect(this._right,0,0),this.side.connect(this._right,0,1),this._left.connect(this._timesTwoLeft),this._right.connect(this._timesTwoRight),this._timesTwoLeft.connect(this._merge,0,0),this._timesTwoRight.connect(this._merge,0,1)},t.extend(t.MidSideMerge,t.AudioNode),t.MidSideMerge.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this.mid.dispose(),this.mid=null,this.side.dispose(),this.side=null,this._left.dispose(),this._left=null,this._timesTwoLeft.dispose(),this._timesTwoLeft=null,this._right.dispose(),this._right=null,this._timesTwoRight.dispose(),this._timesTwoRight=null,this._merge.dispose(),this._merge=null,this},t.MidSideMerge}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(29),i(13),i(1),i(19),i(2)],void 0===(o=function(t){"use strict";return t.MidSideSplit=function(){t.AudioNode.call(this),this.createInsOuts(0,2),this._split=this.input=new t.Split,this._midAdd=new t.Add,this.mid=this.output[0]=new t.Multiply(Math.SQRT1_2),this._sideSubtract=new t.Subtract,this.side=this.output[1]=new t.Multiply(Math.SQRT1_2),this._split.connect(this._midAdd,0,0),this._split.connect(this._midAdd,1,1),this._split.connect(this._sideSubtract,0,0),this._split.connect(this._sideSubtract,1,1),this._midAdd.connect(this.mid),this._sideSubtract.connect(this.side)},t.extend(t.MidSideSplit,t.AudioNode),t.MidSideSplit.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this.mid.dispose(),this.mid=null,this.side.dispose(),this.side=null,this._midAdd.dispose(),this._midAdd=null,this._sideSubtract.dispose(),this._sideSubtract=null,this._split.dispose(),this._split=null,this},t.MidSideSplit}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(9),i(2),i(58)],void 0===(o=function(t){"use strict";return t.LowpassCombFilter=function(){var e=t.defaults(arguments,["delayTime","resonance","dampening"],t.LowpassCombFilter);t.AudioNode.call(this),this._combFilter=this.output=new t.FeedbackCombFilter(e.delayTime,e.resonance),this.delayTime=this._combFilter.delayTime,this._lowpass=this.input=new t.Filter({frequency:e.dampening,type:"lowpass",Q:0,rolloff:-12}),this.dampening=this._lowpass.frequency,this.resonance=this._combFilter.resonance,this._lowpass.connect(this._combFilter),this._readOnly(["dampening","resonance","delayTime"])},t.extend(t.LowpassCombFilter,t.AudioNode),t.LowpassCombFilter.defaults={delayTime:.1,resonance:.5,dampening:3e3},t.LowpassCombFilter.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["dampening","resonance","delayTime"]),this._combFilter.dispose(),this._combFilter=null,this.resonance=null,this.delayTime=null,this._lowpass.dispose(),this._lowpass=null,this.dampening=null,this},t.LowpassCombFilter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(45)],void 0===(o=function(t){return t.Ticks=function(e,i){if(!(this instanceof t.Ticks))return new t.Ticks(e,i);t.TransportTime.call(this,e,i)},t.extend(t.Ticks,t.TransportTime),t.Ticks.prototype._defaultUnits="i",t.Ticks.prototype._now=function(){return t.Transport.ticks},t.Ticks.prototype._beatsToUnits=function(t){return this._getPPQ()*t},t.Ticks.prototype._secondsToUnits=function(t){return Math.floor(t/(60/this._getBpm())*this._getPPQ())},t.Ticks.prototype._ticksToUnits=function(t){return t},t.Ticks.prototype.toTicks=function(){return this.valueOf()},t.Ticks.prototype.toSeconds=function(){return this.valueOf()/this._getPPQ()*(60/this._getBpm())},t.Ticks}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(54)],void 0===(o=function(t){return t.TransportEvent=function(e,i){i=t.defaultArg(i,t.TransportEvent.defaults),t.call(this),this.Transport=e,this.id=t.TransportEvent._eventId++,this.time=t.Ticks(i.time),this.callback=i.callback,this._once=i.once},t.extend(t.TransportEvent),t.TransportEvent.defaults={once:!1,callback:t.noOp},t.TransportEvent._eventId=0,t.TransportEvent.prototype.invoke=function(t){this.callback&&(this.callback(t),this._once&&this.Transport&&this.Transport.clear(this.id))},t.TransportEvent.prototype.dispose=function(){return t.prototype.dispose.call(this),this.Transport=null,this.callback=null,this.time=null,this},t.TransportEvent}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(85),i(33),i(24),i(14)],void 0===(o=function(t){"use strict";return t.TickSource=function(){var e=t.defaults(arguments,["frequency"],t.TickSource);this.frequency=new t.TickSignal(e.frequency),this._readOnly("frequency"),this._state=new t.TimelineState(t.State.Stopped),this._state.setStateAtTime(t.State.Stopped,0),this._tickOffset=new t.Timeline,this.setTicksAtTime(0,0)},t.extend(t.TickSource),t.TickSource.defaults={frequency:1},Object.defineProperty(t.TickSource.prototype,"state",{get:function(){return this._state.getValueAtTime(this.now())}}),t.TickSource.prototype.start=function(e,i){return e=this.toSeconds(e),this._state.getValueAtTime(e)!==t.State.Started&&(this._state.setStateAtTime(t.State.Started,e),t.isDefined(i)&&this.setTicksAtTime(i,e)),this},t.TickSource.prototype.stop=function(e){if(e=this.toSeconds(e),this._state.getValueAtTime(e)===t.State.Stopped){var i=this._state.get(e);i.time>0&&(this._tickOffset.cancel(i.time),this._state.cancel(i.time))}return this._state.cancel(e),this._state.setStateAtTime(t.State.Stopped,e),this.setTicksAtTime(0,e),this},t.TickSource.prototype.pause=function(e){return e=this.toSeconds(e),this._state.getValueAtTime(e)===t.State.Started&&this._state.setStateAtTime(t.State.Paused,e),this},t.TickSource.prototype.cancel=function(t){return t=this.toSeconds(t),this._state.cancel(t),this._tickOffset.cancel(t),this},t.TickSource.prototype.getTicksAtTime=function(e){e=this.toSeconds(e);var i=this._state.getLastState(t.State.Stopped,e),n={state:t.State.Paused,time:e};this._state.add(n);var o=i,s=0;return this._state.forEachBetween(i.time,e+this.sampleTime,function(e){var i=o.time,n=this._tickOffset.get(e.time);n.time>=o.time&&(s=n.ticks,i=n.time),o.state===t.State.Started&&e.state!==t.State.Started&&(s+=this.frequency.getTicksAtTime(e.time)-this.frequency.getTicksAtTime(i)),o=e}.bind(this)),this._state.remove(n),s},Object.defineProperty(t.TickSource.prototype,"ticks",{get:function(){return this.getTicksAtTime(this.now())},set:function(t){this.setTicksAtTime(t,this.now())}}),Object.defineProperty(t.TickSource.prototype,"seconds",{get:function(){return this.getSecondsAtTime(this.now())},set:function(t){var e=this.now(),i=this.frequency.timeToTicks(t,e);this.setTicksAtTime(i,e)}}),t.TickSource.prototype.getSecondsAtTime=function(e){e=this.toSeconds(e);var i=this._state.getLastState(t.State.Stopped,e),n={state:t.State.Paused,time:e};this._state.add(n);var o=i,s=0;return this._state.forEachBetween(i.time,e+this.sampleTime,function(e){var i=o.time,n=this._tickOffset.get(e.time);n.time>=o.time&&(s=n.seconds,i=n.time),o.state===t.State.Started&&e.state!==t.State.Started&&(s+=e.time-i),o=e}.bind(this)),this._state.remove(n),s},t.TickSource.prototype.setTicksAtTime=function(t,e){return e=this.toSeconds(e),this._tickOffset.cancel(e),this._tickOffset.add({time:e,ticks:t,seconds:this.frequency.getDurationOfTicks(t,e)}),this},t.TickSource.prototype.getStateAtTime=function(t){return t=this.toSeconds(t),this._state.getValueAtTime(t)},t.TickSource.prototype.getTimeOfTick=function(e,i){i=t.defaultArg(i,this.now());var n=this._tickOffset.get(i),o=this._state.get(i),s=Math.max(n.time,o.time),r=this.frequency.getTicksAtTime(s)+e-n.ticks;return this.frequency.getTimeOfTick(r)},t.TickSource.prototype.forEachTickBetween=function(e,i,n){var o=this._state.get(e);if(this._state.forEachBetween(e,i,function(i){o.state===t.State.Started&&i.state!==t.State.Started&&this.forEachTickBetween(Math.max(o.time,e),i.time-this.sampleTime,n),o=i}.bind(this)),e=Math.max(o.time,e),o.state===t.State.Started&&this._state){var s=this.frequency.getTicksAtTime(e),r=(s-this.frequency.getTicksAtTime(o.time))%1;0!==r&&(r=1-r);for(var a=this.frequency.getTimeOfTick(s+r),l=null;a<i&&this._state;){try{n(a,Math.round(this.getTicksAtTime(a)))}catch(t){l=t;break}this._state&&(a+=this.frequency.getDurationOfTicks(1,a))}}if(l)throw l;return this},t.TickSource.prototype.dispose=function(){return t.Param.prototype.dispose.call(this),this._state.dispose(),this._state=null,this._tickOffset.dispose(),this._tickOffset=null,this._writable("frequency"),this.frequency.dispose(),this.frequency=null,this},t.TickSource}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(90),i(13),i(1),i(4),i(18),i(2)],void 0===(o=function(t){"use strict";return t.Follower=function(){var e=t.defaults(arguments,["smoothing"],t.Follower);t.AudioNode.call(this),this.createInsOuts(1,1),this._abs=new t.Abs,this._filter=this.context.createBiquadFilter(),this._filter.type="lowpass",this._filter.frequency.value=0,this._filter.Q.value=0,this._sub=new t.Subtract,this._delay=new t.Delay(this.blockTime),this._smoothing=e.smoothing,this.input.connect(this._delay,this._sub),this.input.connect(this._sub,0,1),this._sub.chain(this._abs,this._filter,this.output),this.smoothing=e.smoothing},t.extend(t.Follower,t.AudioNode),t.Follower.defaults={smoothing:.05},Object.defineProperty(t.Follower.prototype,"smoothing",{get:function(){return this._smoothing},set:function(e){this._smoothing=e,this._filter.frequency.value=.5*t.Time(e).toFrequency()}}),t.Follower.prototype.connect=t.SignalBase.prototype.connect,t.Follower.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._filter.disconnect(),this._filter=null,this._delay.dispose(),this._delay=null,this._sub.disconnect(),this._sub=null,this._abs.dispose(),this._abs=null,this},t.Follower}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(42),i(1),i(14),i(18),i(3),i(2)],void 0===(o=function(t){"use strict";return t.FeedbackCombFilter=function(){var e=t.defaults(arguments,["delayTime","resonance"],t.FeedbackCombFilter);t.AudioNode.call(this),this._delay=this.input=this.output=new t.Delay(e.delayTime),this.delayTime=this._delay.delayTime,this._feedback=new t.Gain(e.resonance,t.Type.NormalRange),this.resonance=this._feedback.gain,this._delay.chain(this._feedback,this._delay),this._readOnly(["resonance","delayTime"])},t.extend(t.FeedbackCombFilter,t.AudioNode),t.FeedbackCombFilter.defaults={delayTime:.1,resonance:.5},t.FeedbackCombFilter.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["resonance","delayTime"]),this._delay.dispose(),this._delay=null,this.delayTime=null,this._feedback.dispose(),this._feedback=null,this.resonance=null,this},t.FeedbackCombFilter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(9),i(1),i(3),i(2)],void 0===(o=function(t){"use strict";return t.MultibandSplit=function(){var e=t.defaults(arguments,["lowFrequency","highFrequency"],t.MultibandSplit);t.AudioNode.call(this),this.input=new t.Gain,this.output=new Array(3),this.low=this.output[0]=new t.Filter(0,"lowpass"),this._lowMidFilter=new t.Filter(0,"highpass"),this.mid=this.output[1]=new t.Filter(0,"lowpass"),this.high=this.output[2]=new t.Filter(0,"highpass"),this.lowFrequency=new t.Signal(e.lowFrequency,t.Type.Frequency),this.highFrequency=new t.Signal(e.highFrequency,t.Type.Frequency),this.Q=new t.Signal(e.Q),this.input.fan(this.low,this.high),this.input.chain(this._lowMidFilter,this.mid),this.lowFrequency.connect(this.low.frequency),this.lowFrequency.connect(this._lowMidFilter.frequency),this.highFrequency.connect(this.mid.frequency),this.highFrequency.connect(this.high.frequency),this.Q.connect(this.low.Q),this.Q.connect(this._lowMidFilter.Q),this.Q.connect(this.mid.Q),this.Q.connect(this.high.Q),this._readOnly(["high","mid","low","highFrequency","lowFrequency"])},t.extend(t.MultibandSplit,t.AudioNode),t.MultibandSplit.defaults={lowFrequency:400,highFrequency:2500,Q:1},t.MultibandSplit.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["high","mid","low","highFrequency","lowFrequency"]),this.low.dispose(),this.low=null,this._lowMidFilter.dispose(),this._lowMidFilter=null,this.mid.dispose(),this.mid=null,this.high.dispose(),this.high=null,this.lowFrequency.dispose(),this.lowFrequency=null,this.highFrequency.dispose(),this.highFrequency=null,this.Q.dispose(),this.Q=null,this},t.MultibandSplit}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(23),i(10),i(19),i(92),i(1),i(22),i(28),i(2)],void 0===(o=function(t){"use strict";return t.Panner=function(e){t.AudioNode.call(this),this._panner=this.input=this.output=this.context.createStereoPanner(),this.pan=this._panner.pan,this.pan.value=t.defaultArg(e,0),this._readOnly("pan")},t.extend(t.Panner,t.AudioNode),t.Panner.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable("pan"),this._panner.disconnect(),this._panner=null,this.pan=null,this},t.Panner}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7)],void 0===(o=function(t){"use strict";return t.Pow=function(e){t.SignalBase.call(this),this._exp=t.defaultArg(e,1),this._expScaler=this.input=this.output=new t.WaveShaper(this._expFunc(this._exp),8192)},t.extend(t.Pow,t.SignalBase),Object.defineProperty(t.Pow.prototype,"value",{get:function(){return this._exp},set:function(t){this._exp=t,this._expScaler.setMap(this._expFunc(this._exp))}}),t.Pow.prototype._expFunc=function(t){return function(e){return Math.pow(Math.abs(e),t)}},t.Pow.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._expScaler.dispose(),this._expScaler=null,this},t.Pow}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(20),i(66)],void 0===(o=function(t){return t.OfflineContext=function(e,i,n){var o=new OfflineAudioContext(e,i*n,n);t.Context.call(this,{context:o,clockSource:"offline",lookAhead:0,updateInterval:128/n}),this._duration=i,this._currentTime=0},t.extend(t.OfflineContext,t.Context),t.OfflineContext.prototype.now=function(){return this._currentTime},t.OfflineContext.prototype.resume=function(){return Promise.resolve()},t.OfflineContext.prototype.render=function(){for(;this._duration-this._currentTime>=0;)this.emit("tick"),this._currentTime+=this.blockTime;return this._context.startRendering()},t.OfflineContext.prototype.close=function(){return this._context=null,Promise.resolve()},t.OfflineContext}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(62)],void 0===(o=function(t){if(t.supported){var e=navigator.userAgent.toLowerCase();e.includes("safari")&&!e.includes("chrome")&&e.includes("mobile")&&(t.OfflineContext.prototype.createBufferSource=function(){var t=this._context.createBufferSource(),e=t.start;return t.start=function(i){this.setTimeout(function(){e.call(t,i)}.bind(this),0)}.bind(this),t})}}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){return t.TimeBase=function(e,i){if(!(this instanceof t.TimeBase))return new t.TimeBase(e,i);if(this._val=e,this._units=i,t.isUndef(this._units)&&t.isString(this._val)&&parseFloat(this._val)==this._val&&"+"!==this._val.charAt(0))this._val=parseFloat(this._val),this._units=this._defaultUnits;else if(e&&e.constructor===this.constructor)this._val=e._val,this._units=e._units;else if(e instanceof t.TimeBase)switch(this._defaultUnits){case"s":this._val=e.toSeconds();break;case"i":this._val=e.toTicks();break;case"hz":this._val=e.toFrequency();break;case"midi":this._val=e.toMidi();break;default:throw new Error("Unrecognized default units "+this._defaultUnits)}},t.extend(t.TimeBase),t.TimeBase.prototype._expressions={n:{regexp:/^(\d+)n(\.?)$/i,method:function(t,e){t=parseInt(t);var i="."===e?1.5:1;return 1===t?this._beatsToUnits(this._getTimeSignature())*i:this._beatsToUnits(4/t)*i}},t:{regexp:/^(\d+)t$/i,method:function(t){return t=parseInt(t),this._beatsToUnits(8/(3*parseInt(t)))}},m:{regexp:/^(\d+)m$/i,method:function(t){return this._beatsToUnits(parseInt(t)*this._getTimeSignature())}},i:{regexp:/^(\d+)i$/i,method:function(t){return this._ticksToUnits(parseInt(t))}},hz:{regexp:/^(\d+(?:\.\d+)?)hz$/i,method:function(t){return this._frequencyToUnits(parseFloat(t))}},tr:{regexp:/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,method:function(t,e,i){var n=0;return t&&"0"!==t&&(n+=this._beatsToUnits(this._getTimeSignature()*parseFloat(t))),e&&"0"!==e&&(n+=this._beatsToUnits(parseFloat(e))),i&&"0"!==i&&(n+=this._beatsToUnits(parseFloat(i)/4)),n}},s:{regexp:/^(\d+(?:\.\d+)?)s$/,method:function(t){return this._secondsToUnits(parseFloat(t))}},samples:{regexp:/^(\d+)samples$/,method:function(t){return parseInt(t)/this.context.sampleRate}},default:{regexp:/^(\d+(?:\.\d+)?)$/,method:function(t){return this._expressions[this._defaultUnits].method.call(this,t)}}},t.TimeBase.prototype._defaultUnits="s",t.TimeBase.prototype._getBpm=function(){return t.Transport?t.Transport.bpm.value:120},t.TimeBase.prototype._getTimeSignature=function(){return t.Transport?t.Transport.timeSignature:4},t.TimeBase.prototype._getPPQ=function(){return t.Transport?t.Transport.PPQ:192},t.TimeBase.prototype._now=function(){return this.now()},t.TimeBase.prototype._frequencyToUnits=function(t){return 1/t},t.TimeBase.prototype._beatsToUnits=function(t){return 60/this._getBpm()*t},t.TimeBase.prototype._secondsToUnits=function(t){return t},t.TimeBase.prototype._ticksToUnits=function(t){return t*(this._beatsToUnits(1)/this._getPPQ())},t.TimeBase.prototype._noArg=function(){return this._now()},t.TimeBase.prototype.valueOf=function(){if(t.isUndef(this._val))return this._noArg();if(t.isString(this._val)&&t.isUndef(this._units)){for(var e in this._expressions)if(this._expressions[e].regexp.test(this._val.trim())){this._units=e;break}}else if(t.isObject(this._val)){var i=0;for(var n in this._val){var o=this._val[n];i+=new this.constructor(n).valueOf()*o}return i}if(t.isDefined(this._units)){var s=this._expressions[this._units],r=this._val.toString().trim().match(s.regexp);return r?s.method.apply(this,r.slice(1)):s.method.call(this,parseFloat(this._val))}return this._val},t.TimeBase.prototype.toSeconds=function(){return this.valueOf()},t.TimeBase.prototype.toFrequency=function(){return 1/this.toSeconds()},t.TimeBase.prototype.toSamples=function(){return this.toSeconds()*this.context.sampleRate},t.TimeBase.prototype.toMilliseconds=function(){return 1e3*this.toSeconds()},t.TimeBase.prototype.dispose=function(){this._val=null,this._units=null},t.TimeBase}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(64),i(46)],void 0===(o=function(t){return t.Time=function(e,i){if(!(this instanceof t.Time))return new t.Time(e,i);t.TimeBase.call(this,e,i)},t.extend(t.Time,t.TimeBase),t.Time.prototype._expressions=Object.assign({},t.TimeBase.prototype._expressions,{quantize:{regexp:/^@(.+)/,method:function(e){if(t.Transport){var i=new this.constructor(e);return this._secondsToUnits(t.Transport.nextSubdivision(i))}return 0}},now:{regexp:/^\+(.+)/,method:function(t){return this._now()+new this.constructor(t)}}}),t.Time.prototype.quantize=function(e,i){i=t.defaultArg(i,1);var n=new this.constructor(e),o=this.valueOf();return o+(Math.round(o/n)*n-o)*i},t.Time.prototype.toNotation=function(){for(var e=this.toSeconds(),i=["1m"],n=1;n<8;n++){var o=Math.pow(2,n);i.push(o+"n."),i.push(o+"n"),i.push(o+"t")}i.push("0");var s=i[0],r=t.Time(i[0]).toSeconds();return i.forEach(function(i){var n=t.Time(i).toSeconds();Math.abs(n-e)<Math.abs(r-e)&&(s=i,r=n)}),s},t.Time.prototype.toBarsBeatsSixteenths=function(){var t=this._beatsToUnits(1),e=this.valueOf()/t;e=parseFloat(e.toFixed(4));var i=Math.floor(e/this._getTimeSignature()),n=e%1*4;return e=Math.floor(e)%this._getTimeSignature(),(n=n.toString()).length>3&&(n=parseFloat(parseFloat(n).toFixed(3))),[i,e,n].join(":")},t.Time.prototype.toTicks=function(){var t=this._beatsToUnits(1),e=this.valueOf()/t;return Math.round(e*this._getPPQ())},t.Time.prototype.toSeconds=function(){return this.valueOf()},t.Time.prototype.toMidi=function(){return t.Frequency.ftom(this.toFrequency())},t.Time}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){if(t.supported){!t.global.hasOwnProperty("OfflineAudioContext")&&t.global.hasOwnProperty("webkitOfflineAudioContext")&&(t.global.OfflineAudioContext=t.global.webkitOfflineAudioContext);var e=new OfflineAudioContext(1,1,44100).startRendering();e&&t.isFunction(e.then)||(OfflineAudioContext.prototype._native_startRendering=OfflineAudioContext.prototype.startRendering,OfflineAudioContext.prototype.startRendering=function(){return new Promise(function(t){this.oncomplete=function(e){t(e.renderedBuffer)},this._native_startRendering()}.bind(this))})}}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(11),i(6),i(56),i(31)],void 0===(o=function(t){"use strict";return t.Player=function(e){var i;e instanceof t.Buffer&&e.loaded?(e=e.get(),i=t.Player.defaults):i=t.defaults(arguments,["url","onload"],t.Player),t.Source.call(this,i),this.autostart=i.autostart,this._buffer=new t.Buffer({url:i.url,onload:this._onload.bind(this,i.onload),reverse:i.reverse}),e instanceof AudioBuffer&&this._buffer.set(e),this._loop=i.loop,this._loopStart=i.loopStart,this._loopEnd=i.loopEnd,this._playbackRate=i.playbackRate,this._activeSources=[],this.fadeIn=i.fadeIn,this.fadeOut=i.fadeOut},t.extend(t.Player,t.Source),t.Player.defaults={onload:t.noOp,playbackRate:1,loop:!1,autostart:!1,loopStart:0,loopEnd:0,reverse:!1,fadeIn:0,fadeOut:0},t.Player.prototype.load=function(t,e){return this._buffer.load(t,this._onload.bind(this,e))},t.Player.prototype._onload=function(e){(e=t.defaultArg(e,t.noOp))(this),this.autostart&&this.start()},t.Player.prototype._onSourceEnd=function(e){var i=this._activeSources.indexOf(e);this._activeSources.splice(i,1),0!==this._activeSources.length||this._synced||this._state.setStateAtTime(t.State.Stopped,t.now())},t.Player.prototype._start=function(e,i,n){i=this._loop?t.defaultArg(i,this._loopStart):t.defaultArg(i,0),i=this.toSeconds(i);var o=t.defaultArg(n,Math.max(this._buffer.duration-i,0));o=this.toSeconds(o),o/=this._playbackRate,e=this.toSeconds(e);var s=new t.BufferSource({buffer:this._buffer,loop:this._loop,loopStart:this._loopStart,loopEnd:this._loopEnd,onended:this._onSourceEnd.bind(this),playbackRate:this._playbackRate,fadeIn:this.fadeIn,fadeOut:this.fadeOut}).connect(this.output);return this._loop||this._synced||this._state.setStateAtTime(t.State.Stopped,e+o),this._activeSources.push(s),this._loop&&t.isUndef(n)?s.start(e,i):s.start(e,i,o-this.toSeconds(this.fadeOut)),this},t.Player.prototype._stop=function(t){return t=this.toSeconds(t),this._activeSources.forEach(function(e){e.stop(t)}),this},t.Player.prototype.restart=function(t,e,i){return this._stop(t),this._start(t,e,i),this},t.Player.prototype.seek=function(e,i){return i=this.toSeconds(i),this._state.getValueAtTime(i)===t.State.Started&&(e=this.toSeconds(e),this._stop(i),this._start(i,e)),this},t.Player.prototype.setLoopPoints=function(t,e){return this.loopStart=t,this.loopEnd=e,this},Object.defineProperty(t.Player.prototype,"loopStart",{get:function(){return this._loopStart},set:function(t){this._loopStart=t,this._activeSources.forEach(function(e){e.loopStart=t})}}),Object.defineProperty(t.Player.prototype,"loopEnd",{get:function(){return this._loopEnd},set:function(t){this._loopEnd=t,this._activeSources.forEach(function(e){e.loopEnd=t})}}),Object.defineProperty(t.Player.prototype,"buffer",{get:function(){return this._buffer},set:function(t){this._buffer.set(t)}}),Object.defineProperty(t.Player.prototype,"loop",{get:function(){return this._loop},set:function(e){if(this._loop!==e&&(this._loop=e,this._activeSources.forEach(function(t){t.loop=e}),e)){var i=this._state.getNextState(t.State.Stopped,this.now());i&&this._state.cancel(i.time)}}}),Object.defineProperty(t.Player.prototype,"playbackRate",{get:function(){return this._playbackRate},set:function(e){this._playbackRate=e;var i=this.now(),n=this._state.getNextState(t.State.Stopped,i);n&&this._state.cancel(n.time),this._activeSources.forEach(function(t){t.cancelStop(),t.playbackRate.setValueAtTime(e,i)})}}),Object.defineProperty(t.Player.prototype,"reverse",{get:function(){return this._buffer.reverse},set:function(t){this._buffer.reverse=t}}),Object.defineProperty(t.Player.prototype,"loaded",{get:function(){return this._buffer.loaded}}),t.Player.prototype.dispose=function(){return this._activeSources.forEach(function(t){t.dispose()}),this._activeSources=null,t.Source.prototype.dispose.call(this),this._buffer.dispose(),this._buffer=null,this},t.Player}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(30),i(41),i(37),i(1),i(9),i(25)],void 0===(o=function(t){"use strict";return t.MonoSynth=function(e){e=t.defaultArg(e,t.MonoSynth.defaults),t.Monophonic.call(this,e),this.oscillator=new t.OmniOscillator(e.oscillator),this.frequency=this.oscillator.frequency,this.detune=this.oscillator.detune,this.filter=new t.Filter(e.filter),this.filter.frequency.value=5e3,this.filterEnvelope=new t.FrequencyEnvelope(e.filterEnvelope),this.envelope=new t.AmplitudeEnvelope(e.envelope),this.oscillator.chain(this.filter,this.envelope,this.output),this.filterEnvelope.connect(this.filter.frequency),this._readOnly(["oscillator","frequency","detune","filter","filterEnvelope","envelope"])},t.extend(t.MonoSynth,t.Monophonic),t.MonoSynth.defaults={frequency:"C4",detune:0,oscillator:{type:"square"},filter:{Q:6,type:"lowpass",rolloff:-24},envelope:{attack:.005,decay:.1,sustain:.9,release:1},filterEnvelope:{attack:.06,decay:.2,sustain:.5,release:2,baseFrequency:200,octaves:7,exponent:2}},t.MonoSynth.prototype._triggerEnvelopeAttack=function(t,e){return t=this.toSeconds(t),this.envelope.triggerAttack(t,e),this.filterEnvelope.triggerAttack(t),this.oscillator.start(t),0===this.envelope.sustain&&this.oscillator.stop(t+this.envelope.attack+this.envelope.decay),this},t.MonoSynth.prototype._triggerEnvelopeRelease=function(t){return this.envelope.triggerRelease(t),this.filterEnvelope.triggerRelease(t),this.oscillator.stop(t+this.envelope.release),this},t.MonoSynth.prototype.dispose=function(){return t.Monophonic.prototype.dispose.call(this),this._writable(["oscillator","frequency","detune","filter","filterEnvelope","envelope"]),this.oscillator.dispose(),this.oscillator=null,this.envelope.dispose(),this.envelope=null,this.filterEnvelope.dispose(),this.filterEnvelope=null,this.filter.dispose(),this.filter=null,this.frequency=null,this.detune=null,this},t.MonoSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(17),i(5),i(3)],void 0===(o=function(t){"use strict";return t.FatOscillator=function(){var e=t.defaults(arguments,["frequency","type","spread"],t.FatOscillator);t.Source.call(this,e),this.frequency=new t.Signal(e.frequency,t.Type.Frequency),this.detune=new t.Signal(e.detune,t.Type.Cents),this._oscillators=[],this._spread=e.spread,this._type=e.type,this._phase=e.phase,this._partials=e.partials,this._partialCount=e.partialCount,this.count=e.count,this._readOnly(["frequency","detune"])},t.extend(t.FatOscillator,t.Source),t.FatOscillator.defaults={frequency:440,detune:0,phase:0,spread:20,count:3,type:"sawtooth",partials:[],partialCount:0},t.FatOscillator.prototype._start=function(t){t=this.toSeconds(t),this._forEach(function(e){e.start(t)})},t.FatOscillator.prototype._stop=function(t){t=this.toSeconds(t),this._forEach(function(e){e.stop(t)})},t.FatOscillator.prototype.restart=function(t){t=this.toSeconds(t),this._forEach(function(e){e.restart(t)})},t.FatOscillator.prototype._forEach=function(t){for(var e=0;e<this._oscillators.length;e++)t.call(this,this._oscillators[e],e)},Object.defineProperty(t.FatOscillator.prototype,"type",{get:function(){return this._type},set:function(t){this._type=t,this._forEach(function(e){e.type=t})}}),Object.defineProperty(t.FatOscillator.prototype,"spread",{get:function(){return this._spread},set:function(t){if(this._spread=t,this._oscillators.length>1){var e=-t/2,i=t/(this._oscillators.length-1);this._forEach(function(t,n){t.detune.value=e+i*n})}}}),Object.defineProperty(t.FatOscillator.prototype,"count",{get:function(){return this._oscillators.length},set:function(e){if(e=Math.max(e,1),this._oscillators.length!==e){this._forEach(function(t){t.dispose()}),this._oscillators=[];for(var i=0;i<e;i++){var n=new t.Oscillator;this.type===t.Oscillator.Type.Custom?n.partials=this._partials:n.type=this._type,n.partialCount=this._partialCount,n.phase=this._phase+i/e*360,n.volume.value=-6-1.1*e,this.frequency.connect(n.frequency),this.detune.connect(n.detune),n.connect(this.output),this._oscillators[i]=n}this.spread=this._spread,this.state===t.State.Started&&this._forEach(function(t){t.start()})}}}),Object.defineProperty(t.FatOscillator.prototype,"phase",{get:function(){return this._phase},set:function(t){this._phase=t,this._forEach(function(e){e.phase=t})}}),Object.defineProperty(t.FatOscillator.prototype,"baseType",{get:function(){return this._oscillators[0].baseType},set:function(t){this._forEach(function(e){e.baseType=t}),this._type=this._oscillators[0].type}}),Object.defineProperty(t.FatOscillator.prototype,"partials",{get:function(){return this._oscillators[0].partials},set:function(e){this._partials=e,this._type=t.Oscillator.Type.Custom,this._forEach(function(t){t.partials=e})}}),Object.defineProperty(t.FatOscillator.prototype,"partialCount",{get:function(){return this._oscillators[0].partialCount},set:function(t){this._partialCount=t,this._forEach(function(e){e.partialCount=t}),this._type=this._oscillators[0].type}}),t.FatOscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this._writable(["frequency","detune"]),this.frequency.dispose(),this.frequency=null,this.detune.dispose(),this.detune=null,this._forEach(function(t){t.dispose()}),this._oscillators=null,this._partials=null,this},t.FatOscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(17),i(5),i(3),i(22)],void 0===(o=function(t){"use strict";return t.AMOscillator=function(){var e=t.defaults(arguments,["frequency","type","modulationType"],t.AMOscillator);t.Source.call(this,e),this._carrier=new t.Oscillator(e.frequency,e.type),this.frequency=this._carrier.frequency,this.detune=this._carrier.detune,this.detune.value=e.detune,this._modulator=new t.Oscillator(e.frequency,e.modulationType),this._modulationScale=new t.AudioToGain,this.harmonicity=new t.Multiply(e.harmonicity),this.harmonicity.units=t.Type.Positive,this._modulationNode=new t.Gain(0),this.frequency.chain(this.harmonicity,this._modulator.frequency),this.detune.connect(this._modulator.detune),this._modulator.chain(this._modulationScale,this._modulationNode.gain),this._carrier.chain(this._modulationNode,this.output),this.phase=e.phase,this._readOnly(["frequency","detune","harmonicity"])},t.extend(t.AMOscillator,t.Oscillator),t.AMOscillator.defaults={frequency:440,detune:0,phase:0,type:"sine",modulationType:"square",harmonicity:1},t.AMOscillator.prototype._start=function(t){this._modulator.start(t),this._carrier.start(t)},t.AMOscillator.prototype._stop=function(t){this._modulator.stop(t),this._carrier.stop(t)},t.AMOscillator.prototype.restart=function(t){this._modulator.restart(t),this._carrier.restart(t)},Object.defineProperty(t.AMOscillator.prototype,"type",{get:function(){return this._carrier.type},set:function(t){this._carrier.type=t}}),Object.defineProperty(t.AMOscillator.prototype,"baseType",{get:function(){return this._carrier.baseType},set:function(t){this._carrier.baseType=t}}),Object.defineProperty(t.AMOscillator.prototype,"partialCount",{get:function(){return this._carrier.partialCount},set:function(t){this._carrier.partialCount=t}}),Object.defineProperty(t.AMOscillator.prototype,"modulationType",{get:function(){return this._modulator.type},set:function(t){this._modulator.type=t}}),Object.defineProperty(t.AMOscillator.prototype,"phase",{get:function(){return this._carrier.phase},set:function(t){this._carrier.phase=t,this._modulator.phase=t}}),Object.defineProperty(t.AMOscillator.prototype,"partials",{get:function(){return this._carrier.partials},set:function(t){this._carrier.partials=t}}),t.AMOscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this._writable(["frequency","detune","harmonicity"]),this.frequency=null,this.detune=null,this.harmonicity.dispose(),this.harmonicity=null,this._carrier.dispose(),this._carrier=null,this._modulator.dispose(),this._modulator=null,this._modulationNode.dispose(),this._modulationNode=null,this._modulationScale.dispose(),this._modulationScale=null,this},t.AMOscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(49),i(17),i(5)],void 0===(o=function(t){"use strict";return t.PWMOscillator=function(){var e=t.defaults(arguments,["frequency","modulationFrequency"],t.PWMOscillator);t.Source.call(this,e),this._pulse=new t.PulseOscillator(e.modulationFrequency),this._pulse._sawtooth.type="sine",this._modulator=new t.Oscillator({frequency:e.frequency,detune:e.detune,phase:e.phase}),this._scale=new t.Multiply(2),this.frequency=this._modulator.frequency,this.detune=this._modulator.detune,this.modulationFrequency=this._pulse.frequency,this._modulator.chain(this._scale,this._pulse.width),this._pulse.connect(this.output),this._readOnly(["modulationFrequency","frequency","detune"])},t.extend(t.PWMOscillator,t.Source),t.PWMOscillator.defaults={frequency:440,detune:0,phase:0,modulationFrequency:.4},t.PWMOscillator.prototype._start=function(t){t=this.toSeconds(t),this._modulator.start(t),this._pulse.start(t)},t.PWMOscillator.prototype._stop=function(t){t=this.toSeconds(t),this._modulator.stop(t),this._pulse.stop(t)},t.PWMOscillator.prototype.restart=function(t){this._modulator.restart(t),this._pulse.restart(t)},Object.defineProperty(t.PWMOscillator.prototype,"type",{get:function(){return"pwm"}}),Object.defineProperty(t.PWMOscillator.prototype,"baseType",{get:function(){return"pwm"}}),Object.defineProperty(t.PWMOscillator.prototype,"partials",{get:function(){return[]}}),Object.defineProperty(t.PWMOscillator.prototype,"phase",{get:function(){return this._modulator.phase},set:function(t){this._modulator.phase=t}}),t.PWMOscillator.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this._pulse.dispose(),this._pulse=null,this._scale.dispose(),this._scale=null,this._modulator.dispose(),this._modulator=null,this._writable(["modulationFrequency","frequency","detune"]),this.frequency=null,this.detune=null,this.modulationFrequency=null,this},t.PWMOscillator}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(50),i(4),i(16)],void 0===(o=function(t){"use strict";return t.Part=function(){var e=t.defaults(arguments,["callback","events"],t.Part);t.Event.call(this,e),this._events=[];for(var i=0;i<e.events.length;i++)Array.isArray(e.events[i])?this.add(e.events[i][0],e.events[i][1]):this.add(e.events[i])},t.extend(t.Part,t.Event),t.Part.defaults={callback:t.noOp,loop:!1,loopEnd:"1m",loopStart:0,playbackRate:1,probability:1,humanize:!1,mute:!1,events:[]},t.Part.prototype.start=function(e,i){var n=this.toTicks(e);return this._state.getValueAtTime(n)!==t.State.Started&&(i=this._loop?t.defaultArg(i,this._loopStart):t.defaultArg(i,0),i=this.toTicks(i),this._state.add({state:t.State.Started,time:n,offset:i}),this._forEach(function(t){this._startNote(t,n,i)})),this},t.Part.prototype._startNote=function(e,i,n){i-=n,this._loop?e.startOffset>=this._loopStart&&e.startOffset<this._loopEnd?(e.startOffset<n&&(i+=this._getLoopDuration()),e.start(t.Ticks(i))):e.startOffset<this._loopStart&&e.startOffset>=n&&(e.loop=!1,e.start(t.Ticks(i))):e.startOffset>=n&&e.start(t.Ticks(i))},Object.defineProperty(t.Part.prototype,"startOffset",{get:function(){return this._startOffset},set:function(t){this._startOffset=t,this._forEach(function(t){t.startOffset+=this._startOffset})}}),t.Part.prototype.stop=function(e){var i=this.toTicks(e);return this._state.cancel(i),this._state.setStateAtTime(t.State.Stopped,i),this._forEach(function(t){t.stop(e)}),this},t.Part.prototype.at=function(e,i){e=t.TransportTime(e);for(var n=t.Ticks(1).toSeconds(),o=0;o<this._events.length;o++){var s=this._events[o];if(Math.abs(e.toTicks()-s.startOffset)<n)return t.isDefined(i)&&(s.value=i),s}return t.isDefined(i)?(this.add(e,i),this._events[this._events.length-1]):null},t.Part.prototype.add=function(e,i){var n;return e.hasOwnProperty("time")&&(e=(i=e).time),e=this.toTicks(e),i instanceof t.Event?(n=i).callback=this._tick.bind(this):n=new t.Event({callback:this._tick.bind(this),value:i}),n.startOffset=e,n.set({loopEnd:this.loopEnd,loopStart:this.loopStart,loop:this.loop,humanize:this.humanize,playbackRate:this.playbackRate,probability:this.probability}),this._events.push(n),this._restartEvent(n),this},t.Part.prototype._restartEvent=function(e){this._state.forEach(function(i){i.state===t.State.Started?this._startNote(e,i.time,i.offset):e.stop(t.Ticks(i.time))}.bind(this))},t.Part.prototype.remove=function(e,i){e.hasOwnProperty("time")&&(e=(i=e).time),e=this.toTicks(e);for(var n=this._events.length-1;n>=0;n--){var o=this._events[n];o.startOffset===e&&(t.isUndef(i)||t.isDefined(i)&&o.value===i)&&(this._events.splice(n,1),o.dispose())}return this},t.Part.prototype.removeAll=function(){return this._forEach(function(t){t.dispose()}),this._events=[],this},t.Part.prototype.cancel=function(t){return this._forEach(function(e){e.cancel(t)}),this._state.cancel(this.toTicks(t)),this},t.Part.prototype._forEach=function(e,i){if(this._events){i=t.defaultArg(i,this);for(var n=this._events.length-1;n>=0;n--){var o=this._events[n];o instanceof t.Part?o._forEach(e,i):e.call(i,o)}}return this},t.Part.prototype._setAll=function(t,e){this._forEach(function(i){i[t]=e})},t.Part.prototype._tick=function(t,e){this.mute||this.callback(t,e)},t.Part.prototype._testLoopBoundries=function(e){e.startOffset<this._loopStart||e.startOffset>=this._loopEnd?e.cancel(0):e.state===t.State.Stopped&&this._restartEvent(e)},Object.defineProperty(t.Part.prototype,"probability",{get:function(){return this._probability},set:function(t){this._probability=t,this._setAll("probability",t)}}),Object.defineProperty(t.Part.prototype,"humanize",{get:function(){return this._humanize},set:function(t){this._humanize=t,this._setAll("humanize",t)}}),Object.defineProperty(t.Part.prototype,"loop",{get:function(){return this._loop},set:function(t){this._loop=t,this._forEach(function(e){e._loopStart=this._loopStart,e._loopEnd=this._loopEnd,e.loop=t,this._testLoopBoundries(e)})}}),Object.defineProperty(t.Part.prototype,"loopEnd",{get:function(){return t.Ticks(this._loopEnd).toSeconds()},set:function(t){this._loopEnd=this.toTicks(t),this._loop&&this._forEach(function(e){e.loopEnd=t,this._testLoopBoundries(e)})}}),Object.defineProperty(t.Part.prototype,"loopStart",{get:function(){return t.Ticks(this._loopStart).toSeconds()},set:function(t){this._loopStart=this.toTicks(t),this._loop&&this._forEach(function(t){t.loopStart=this.loopStart,this._testLoopBoundries(t)})}}),Object.defineProperty(t.Part.prototype,"playbackRate",{get:function(){return this._playbackRate},set:function(t){this._playbackRate=t,this._setAll("playbackRate",t)}}),Object.defineProperty(t.Part.prototype,"length",{get:function(){return this._events.length}}),t.Part.prototype.dispose=function(){return t.Event.prototype.dispose.call(this),this.removeAll(),this.callback=null,this._events=null,this},t.Part}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(50)],void 0===(o=function(t){return t.Loop=function(){var e=t.defaults(arguments,["callback","interval"],t.Loop);t.call(this),this._event=new t.Event({callback:this._tick.bind(this),loop:!0,loopEnd:e.interval,playbackRate:e.playbackRate,probability:e.probability}),this.callback=e.callback,this.iterations=e.iterations},t.extend(t.Loop),t.Loop.defaults={interval:"4n",callback:t.noOp,playbackRate:1,iterations:1/0,probability:!0,mute:!1},t.Loop.prototype.start=function(t){return this._event.start(t),this},t.Loop.prototype.stop=function(t){return this._event.stop(t),this},t.Loop.prototype.cancel=function(t){return this._event.cancel(t),this},t.Loop.prototype._tick=function(t){this.callback(t)},Object.defineProperty(t.Loop.prototype,"state",{get:function(){return this._event.state}}),Object.defineProperty(t.Loop.prototype,"progress",{get:function(){return this._event.progress}}),Object.defineProperty(t.Loop.prototype,"interval",{get:function(){return this._event.loopEnd},set:function(t){this._event.loopEnd=t}}),Object.defineProperty(t.Loop.prototype,"playbackRate",{get:function(){return this._event.playbackRate},set:function(t){this._event.playbackRate=t}}),Object.defineProperty(t.Loop.prototype,"humanize",{get:function(){return this._event.humanize},set:function(t){this._event.humanize=t}}),Object.defineProperty(t.Loop.prototype,"probability",{get:function(){return this._event.probability},set:function(t){this._event.probability=t}}),Object.defineProperty(t.Loop.prototype,"mute",{get:function(){return this._event.mute},set:function(t){this._event.mute=t}}),Object.defineProperty(t.Loop.prototype,"iterations",{get:function(){return!0===this._event.loop?1/0:this._event.loop},set:function(t){this._event.loop=t===1/0||t}}),t.Loop.prototype.dispose=function(){this._event.dispose(),this._event=null,this.callback=null},t.Loop}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(15),i(32)],void 0===(o=function(t){"use strict";return t.StereoXFeedbackEffect=function(){var e=t.defaults(arguments,["feedback"],t.FeedbackEffect);t.StereoEffect.call(this,e),this.feedback=new t.Signal(e.feedback,t.Type.NormalRange),this._feedbackLR=new t.Gain,this._feedbackRL=new t.Gain,this.effectReturnL.chain(this._feedbackLR,this.effectSendR),this.effectReturnR.chain(this._feedbackRL,this.effectSendL),this.feedback.fan(this._feedbackLR.gain,this._feedbackRL.gain),this._readOnly(["feedback"])},t.extend(t.StereoXFeedbackEffect,t.StereoEffect),t.StereoXFeedbackEffect.prototype.dispose=function(){return t.StereoEffect.prototype.dispose.call(this),this._writable(["feedback"]),this.feedback.dispose(),this.feedback=null,this._feedbackLR.dispose(),this._feedbackLR=null,this._feedbackRL.dispose(),this._feedbackRL=null,this},t.StereoXFeedbackEffect}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(52),i(51)],void 0===(o=function(t){"use strict";return t.MidSideEffect=function(){t.Effect.apply(this,arguments),this._midSideSplit=new t.MidSideSplit,this._midSideMerge=new t.MidSideMerge,this.midSend=this._midSideSplit.mid,this.sideSend=this._midSideSplit.side,this.midReturn=this._midSideMerge.mid,this.sideReturn=this._midSideMerge.side,this.effectSend.connect(this._midSideSplit),this._midSideMerge.connect(this.effectReturn)},t.extend(t.MidSideEffect,t.Effect),t.MidSideEffect.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._midSideSplit.dispose(),this._midSideSplit=null,this._midSideMerge.dispose(),this._midSideMerge=null,this.midSend=null,this.sideSend=null,this.midReturn=null,this.sideReturn=null,this},t.MidSideEffect}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(11),i(8)],void 0===(o=function(t){"use strict";return t.Convolver=function(){var e=t.defaults(arguments,["url","onload"],t.Convolver);t.Effect.call(this,e),this._convolver=this.context.createConvolver(),this._buffer=new t.Buffer(e.url,function(t){this.buffer=t.get(),e.onload()}.bind(this)),this._buffer.loaded&&(this.buffer=this._buffer),this.normalize=e.normalize,this.connectEffect(this._convolver)},t.extend(t.Convolver,t.Effect),t.Convolver.defaults={onload:t.noOp,normalize:!0},Object.defineProperty(t.Convolver.prototype,"buffer",{get:function(){return this._buffer.length?this._buffer:null},set:function(t){this._buffer.set(t),this._convolver.buffer&&(this.effectSend.disconnect(),this._convolver.disconnect(),this._convolver=this.context.createConvolver(),this.connectEffect(this._convolver)),this._convolver.buffer=this._buffer.get()}}),Object.defineProperty(t.Convolver.prototype,"normalize",{get:function(){return this._convolver.normalize},set:function(t){this._convolver.normalize=t}}),t.Convolver.prototype.load=function(t,e){return this._buffer.load(t,function(t){this.buffer=t,e&&e()}.bind(this))},t.Convolver.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._buffer.dispose(),this._buffer=null,this._convolver.disconnect(),this._convolver=null,this},t.Convolver}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7),i(5),i(13)],void 0===(o=function(t){"use strict";return t.Modulo=function(e){t.SignalBase.call(this),this.createInsOuts(1,0),this._shaper=new t.WaveShaper(Math.pow(2,16)),this._multiply=new t.Multiply,this._subtract=this.output=new t.Subtract,this._modSignal=new t.Signal(e),this.input.fan(this._shaper,this._subtract),this._modSignal.connect(this._multiply,0,0),this._shaper.connect(this._multiply,0,1),this._multiply.connect(this._subtract,0,1),this._setWaveShaper(e)},t.extend(t.Modulo,t.SignalBase),t.Modulo.prototype._setWaveShaper=function(t){this._shaper.setMap(function(e){return Math.floor((e+1e-4)/t)})},Object.defineProperty(t.Modulo.prototype,"value",{get:function(){return this._modSignal.value},set:function(t){this._modSignal.value=t,this._setWaveShaper(t)}}),t.Modulo.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._shaper.dispose(),this._shaper=null,this._multiply.dispose(),this._multiply=null,this._subtract.dispose(),this._subtract=null,this._modSignal.dispose(),this._modSignal=null,this},t.Modulo}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(16),i(11),i(62),i(40)],void 0===(o=function(t){return t.Offline=function(e,i){var n=t.context.sampleRate,o=t.context,s=new t.OfflineContext(2,i,n);t.context=s;var r=e(t.Transport),a=null;return a=r&&t.isFunction(r.then)?r.then(function(){return s.render()}):s.render(),t.context=o,a.then(function(e){return new t.Buffer(e)})},t.Offline}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(11)],void 0===(o=function(t){return t.Buffers=function(e){var i=Array.prototype.slice.call(arguments);i.shift();var n=t.defaults(i,["onload","baseUrl"],t.Buffers);for(var o in t.call(this),this._buffers={},this.baseUrl=n.baseUrl,this._loadingCount=0,e)this._loadingCount++,this.add(o,e[o],this._bufferLoaded.bind(this,n.onload))},t.extend(t.Buffers),t.Buffers.defaults={onload:t.noOp,baseUrl:""},t.Buffers.prototype.has=function(t){return this._buffers.hasOwnProperty(t)},t.Buffers.prototype.get=function(t){if(this.has(t))return this._buffers[t];throw new Error("Tone.Buffers: no buffer named "+t)},t.Buffers.prototype._bufferLoaded=function(t){this._loadingCount--,0===this._loadingCount&&t&&t(this)},Object.defineProperty(t.Buffers.prototype,"loaded",{get:function(){var t=!0;for(var e in this._buffers){var i=this.get(e);t=t&&i.loaded}return t}}),t.Buffers.prototype.add=function(e,i,n){return n=t.defaultArg(n,t.noOp),i instanceof t.Buffer?(this._buffers[e]=i,n(this)):i instanceof AudioBuffer?(this._buffers[e]=new t.Buffer(i),n(this)):t.isString(i)&&(this._buffers[e]=new t.Buffer(this.baseUrl+i,n)),this},t.Buffers.prototype.dispose=function(){for(var e in t.prototype.dispose.call(this),this._buffers)this._buffers[e].dispose();return this._buffers=null,this},t.Buffers}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){"use strict";return t.CtrlPattern=function(){var e=t.defaults(arguments,["values","type"],t.CtrlPattern);t.call(this),this.values=e.values,this.index=0,this._type=null,this._shuffled=null,this._direction=null,this.type=e.type},t.extend(t.CtrlPattern),t.CtrlPattern.Type={Up:"up",Down:"down",UpDown:"upDown",DownUp:"downUp",AlternateUp:"alternateUp",AlternateDown:"alternateDown",Random:"random",RandomWalk:"randomWalk",RandomOnce:"randomOnce"},t.CtrlPattern.defaults={type:t.CtrlPattern.Type.Up,values:[]},Object.defineProperty(t.CtrlPattern.prototype,"value",{get:function(){if(0!==this.values.length){if(1===this.values.length)return this.values[0];this.index=Math.min(this.index,this.values.length-1);var e=this.values[this.index];return this.type===t.CtrlPattern.Type.RandomOnce&&(this.values.length!==this._shuffled.length&&this._shuffleValues(),e=this.values[this._shuffled[this.index]]),e}}}),Object.defineProperty(t.CtrlPattern.prototype,"type",{get:function(){return this._type},set:function(e){this._type=e,this._shuffled=null,this._type===t.CtrlPattern.Type.Up||this._type===t.CtrlPattern.Type.UpDown||this._type===t.CtrlPattern.Type.RandomOnce||this._type===t.CtrlPattern.Type.AlternateUp?this.index=0:this._type!==t.CtrlPattern.Type.Down&&this._type!==t.CtrlPattern.Type.DownUp&&this._type!==t.CtrlPattern.Type.AlternateDown||(this.index=this.values.length-1),this._type===t.CtrlPattern.Type.UpDown||this._type===t.CtrlPattern.Type.AlternateUp?this._direction=t.CtrlPattern.Type.Up:this._type!==t.CtrlPattern.Type.DownUp&&this._type!==t.CtrlPattern.Type.AlternateDown||(this._direction=t.CtrlPattern.Type.Down),this._type===t.CtrlPattern.Type.RandomOnce?this._shuffleValues():this._type===t.CtrlPattern.Random&&(this.index=Math.floor(Math.random()*this.values.length))}}),t.CtrlPattern.prototype.next=function(){var e=this.type;return e===t.CtrlPattern.Type.Up?(this.index++,this.index>=this.values.length&&(this.index=0)):e===t.CtrlPattern.Type.Down?(this.index--,this.index<0&&(this.index=this.values.length-1)):e===t.CtrlPattern.Type.UpDown||e===t.CtrlPattern.Type.DownUp?(this._direction===t.CtrlPattern.Type.Up?this.index++:this.index--,this.index<0?(this.index=1,this._direction=t.CtrlPattern.Type.Up):this.index>=this.values.length&&(this.index=this.values.length-2,this._direction=t.CtrlPattern.Type.Down)):e===t.CtrlPattern.Type.Random?this.index=Math.floor(Math.random()*this.values.length):e===t.CtrlPattern.Type.RandomWalk?Math.random()<.5?(this.index--,this.index=Math.max(this.index,0)):(this.index++,this.index=Math.min(this.index,this.values.length-1)):e===t.CtrlPattern.Type.RandomOnce?(this.index++,this.index>=this.values.length&&(this.index=0,this._shuffleValues())):e===t.CtrlPattern.Type.AlternateUp?(this._direction===t.CtrlPattern.Type.Up?(this.index+=2,this._direction=t.CtrlPattern.Type.Down):(this.index-=1,this._direction=t.CtrlPattern.Type.Up),this.index>=this.values.length&&(this.index=0,this._direction=t.CtrlPattern.Type.Up)):e===t.CtrlPattern.Type.AlternateDown&&(this._direction===t.CtrlPattern.Type.Up?(this.index+=1,this._direction=t.CtrlPattern.Type.Down):(this.index-=2,this._direction=t.CtrlPattern.Type.Up),this.index<0&&(this.index=this.values.length-1,this._direction=t.CtrlPattern.Type.Down)),this.value},t.CtrlPattern.prototype._shuffleValues=function(){var t=[];this._shuffled=[];for(var e=0;e<this.values.length;e++)t[e]=e;for(;t.length>0;){var i=t.splice(Math.floor(t.length*Math.random()),1);this._shuffled.push(i[0])}},t.CtrlPattern.prototype.dispose=function(){this._shuffled=null,this.values=null},t.CtrlPattern}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){t.supported&&(AudioBuffer.prototype.copyToChannel||(AudioBuffer.prototype.copyToChannel=function(t,e,i){var n=this.getChannelData(e);i=i||0;for(var o=0;o<n.length;o++)n[o+i]=t[o]},AudioBuffer.prototype.copyFromChannel=function(t,e,i){var n=this.getChannelData(e);i=i||0;for(var o=0;o<t.length;o++)t[o]=n[o+i]}))}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(11),i(6),i(3),i(2)],void 0===(o=function(t){return t.OscillatorNode=function(){var e=t.defaults(arguments,["frequency","type"],t.OscillatorNode);t.AudioNode.call(this,e),this.onended=e.onended,this._startTime=-1,this._stopTime=-1,this._gainNode=this.output=new t.Gain(0),this._oscillator=this.context.createOscillator(),this._oscillator.connect(this._gainNode),this.type=e.type,this.frequency=new t.Param({param:this._oscillator.frequency,units:t.Type.Frequency,value:e.frequency}),this.detune=new t.Param({param:this._oscillator.detune,units:t.Type.Cents,value:e.detune}),this._gain=1},t.extend(t.OscillatorNode,t.AudioNode),t.OscillatorNode.defaults={frequency:440,detune:0,type:"sine",onended:t.noOp},Object.defineProperty(t.OscillatorNode.prototype,"state",{get:function(){return this.getStateAtTime(this.now())}}),t.OscillatorNode.prototype.getStateAtTime=function(e){return e=this.toSeconds(e),-1!==this._startTime&&e>=this._startTime&&(-1===this._stopTime||e<=this._stopTime)?t.State.Started:t.State.Stopped},t.OscillatorNode.prototype.start=function(t){if(this.log("start",t),-1!==this._startTime)throw new Error("cannot call OscillatorNode.start more than once");return this._startTime=this.toSeconds(t),this._oscillator.start(this._startTime),this._gainNode.gain.setValueAtTime(1,this._startTime),this},t.OscillatorNode.prototype.setPeriodicWave=function(t){return this._oscillator.setPeriodicWave(t),this},t.OscillatorNode.prototype.stop=function(t){return this.log("stop",t),this.assert(-1!==this._startTime,"'start' must be called before 'stop'"),this.cancelStop(),this._stopTime=this.toSeconds(t),this._stopTime>this._startTime?(this._gainNode.gain.setValueAtTime(0,this._stopTime),this.context.clearTimeout(this._timeout),this._timeout=this.context.setTimeout(function(){this._oscillator.stop(this.now()),this.onended()}.bind(this),this._stopTime-this.context.currentTime)):this._gainNode.gain.cancelScheduledValues(this._startTime),this},t.OscillatorNode.prototype.cancelStop=function(){return-1!==this._startTime&&(this._gainNode.gain.cancelScheduledValues(this._startTime+this.sampleTime),this.context.clearTimeout(this._timeout),this._stopTime=-1),this},Object.defineProperty(t.OscillatorNode.prototype,"type",{get:function(){return this._oscillator.type},set:function(t){this._oscillator.type=t}}),t.OscillatorNode.prototype.dispose=function(){return this.context.clearTimeout(this._timeout),t.AudioNode.prototype.dispose.call(this),this.onended=null,this._oscillator.disconnect(),this._oscillator=null,this._gainNode.dispose(),this._gainNode=null,this.frequency.dispose(),this.frequency=null,this.detune.dispose(),this.detune=null,this},t.OscillatorNode}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(55),i(54)],void 0===(o=function(t){return t.TransportRepeatEvent=function(e,i){t.TransportEvent.call(this,e,i),i=t.defaultArg(i,t.TransportRepeatEvent.defaults),this.duration=t.Ticks(i.duration),this._interval=t.Ticks(i.interval),this._currentId=-1,this._nextId=-1,this._nextTick=this.time,this._boundRestart=this._restart.bind(this),this.Transport.on("start loopStart",this._boundRestart),this._restart()},t.extend(t.TransportRepeatEvent,t.TransportEvent),t.TransportRepeatEvent.defaults={duration:1/0,interval:1},t.TransportRepeatEvent.prototype.invoke=function(e){this._createEvents(e),t.TransportEvent.prototype.invoke.call(this,e)},t.TransportRepeatEvent.prototype._createEvents=function(e){var i=this.Transport.getTicksAtTime(e);i>=this.time&&i>=this._nextTick&&this._nextTick+this._interval<this.time+this.duration&&(this._nextTick+=this._interval,this._currentId=this._nextId,this._nextId=this.Transport.scheduleOnce(this.invoke.bind(this),t.Ticks(this._nextTick)))},t.TransportRepeatEvent.prototype._restart=function(e){this.Transport.clear(this._currentId),this.Transport.clear(this._nextId),this._nextTick=this.time;var i=this.Transport.getTicksAtTime(e);i>this.time&&(this._nextTick=this.time+Math.ceil((i-this.time)/this._interval)*this._interval),this._currentId=this.Transport.scheduleOnce(this.invoke.bind(this),t.Ticks(this._nextTick)),this._nextTick+=this._interval,this._nextId=this.Transport.scheduleOnce(this.invoke.bind(this),t.Ticks(this._nextTick))},t.TransportRepeatEvent.prototype.dispose=function(){return this.Transport.clear(this._currentId),this.Transport.clear(this._nextId),this.Transport.off("start loopStart",this._boundRestart),this._boundCreateEvents=null,t.TransportEvent.prototype.dispose.call(this),this.duration=null,this._interval=null,this},t.TransportRepeatEvent}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(4)],void 0===(o=function(t){"use strict";t.IntervalTimeline=function(){t.call(this),this._root=null,this._length=0},t.extend(t.IntervalTimeline),t.IntervalTimeline.prototype.add=function(i){if(t.isUndef(i.time)||t.isUndef(i.duration))throw new Error("Tone.IntervalTimeline: events must have time and duration parameters");i.time=i.time.valueOf();var n=new e(i.time,i.time+i.duration,i);for(null===this._root?this._root=n:this._root.insert(n),this._length++;null!==n;)n.updateHeight(),n.updateMax(),this._rebalance(n),n=n.parent;return this},t.IntervalTimeline.prototype.remove=function(t){if(null!==this._root){var e=[];this._root.search(t.time,e);for(var i=0;i<e.length;i++){var n=e[i];if(n.event===t){this._removeNode(n),this._length--;break}}}return this},Object.defineProperty(t.IntervalTimeline.prototype,"length",{get:function(){return this._length}}),t.IntervalTimeline.prototype.cancel=function(t){return this.forEachFrom(t,function(t){this.remove(t)}.bind(this)),this},t.IntervalTimeline.prototype._setRoot=function(t){this._root=t,null!==this._root&&(this._root.parent=null)},t.IntervalTimeline.prototype._replaceNodeInParent=function(t,e){null!==t.parent?(t.isLeftChild()?t.parent.left=e:t.parent.right=e,this._rebalance(t.parent)):this._setRoot(e)},t.IntervalTimeline.prototype._removeNode=function(t){if(null===t.left&&null===t.right)this._replaceNodeInParent(t,null);else if(null===t.right)this._replaceNodeInParent(t,t.left);else if(null===t.left)this._replaceNodeInParent(t,t.right);else{var e,i;if(t.getBalance()>0)if(null===t.left.right)(e=t.left).right=t.right,i=e;else{for(e=t.left.right;null!==e.right;)e=e.right;e.parent.right=e.left,i=e.parent,e.left=t.left,e.right=t.right}else if(null===t.right.left)(e=t.right).left=t.left,i=e;else{for(e=t.right.left;null!==e.left;)e=e.left;e.parent=e.parent,e.parent.left=e.right,i=e.parent,e.left=t.left,e.right=t.right}null!==t.parent?t.isLeftChild()?t.parent.left=e:t.parent.right=e:this._setRoot(e),this._rebalance(i)}t.dispose()},t.IntervalTimeline.prototype._rotateLeft=function(t){var e=t.parent,i=t.isLeftChild(),n=t.right;t.right=n.left,n.left=t,null!==e?i?e.left=n:e.right=n:this._setRoot(n)},t.IntervalTimeline.prototype._rotateRight=function(t){var e=t.parent,i=t.isLeftChild(),n=t.left;t.left=n.right,n.right=t,null!==e?i?e.left=n:e.right=n:this._setRoot(n)},t.IntervalTimeline.prototype._rebalance=function(t){var e=t.getBalance();e>1?t.left.getBalance()<0?this._rotateLeft(t.left):this._rotateRight(t):e<-1&&(t.right.getBalance()>0?this._rotateRight(t.right):this._rotateLeft(t))},t.IntervalTimeline.prototype.get=function(t){if(null!==this._root){var e=[];if(this._root.search(t,e),e.length>0){for(var i=e[0],n=1;n<e.length;n++)e[n].low>i.low&&(i=e[n]);return i.event}}return null},t.IntervalTimeline.prototype.forEach=function(t){if(null!==this._root){var e=[];this._root.traverse(function(t){e.push(t)});for(var i=0;i<e.length;i++){var n=e[i].event;n&&t(n)}}return this},t.IntervalTimeline.prototype.forEachAtTime=function(t,e){if(null!==this._root){var i=[];this._root.search(t,i);for(var n=i.length-1;n>=0;n--){var o=i[n].event;o&&e(o)}}return this},t.IntervalTimeline.prototype.forEachFrom=function(t,e){if(null!==this._root){var i=[];this._root.searchAfter(t,i);for(var n=i.length-1;n>=0;n--){e(i[n].event)}}return this},t.IntervalTimeline.prototype.dispose=function(){var t=[];null!==this._root&&this._root.traverse(function(e){t.push(e)});for(var e=0;e<t.length;e++)t[e].dispose();return t=null,this._root=null,this};var e=function(t,e,i){this.event=i,this.low=t,this.high=e,this.max=this.high,this._left=null,this._right=null,this.parent=null,this.height=0};return e.prototype.insert=function(t){t.low<=this.low?null===this.left?this.left=t:this.left.insert(t):null===this.right?this.right=t:this.right.insert(t)},e.prototype.search=function(t,e){t>this.max||(null!==this.left&&this.left.search(t,e),this.low<=t&&this.high>t&&e.push(this),this.low>t||null!==this.right&&this.right.search(t,e))},e.prototype.searchAfter=function(t,e){this.low>=t&&(e.push(this),null!==this.left&&this.left.searchAfter(t,e)),null!==this.right&&this.right.searchAfter(t,e)},e.prototype.traverse=function(t){t(this),null!==this.left&&this.left.traverse(t),null!==this.right&&this.right.traverse(t)},e.prototype.updateHeight=function(){null!==this.left&&null!==this.right?this.height=Math.max(this.left.height,this.right.height)+1:null!==this.right?this.height=this.right.height+1:null!==this.left?this.height=this.left.height+1:this.height=0},e.prototype.updateMax=function(){this.max=this.high,null!==this.left&&(this.max=Math.max(this.max,this.left.max)),null!==this.right&&(this.max=Math.max(this.max,this.right.max))},e.prototype.getBalance=function(){var t=0;return null!==this.left&&null!==this.right?t=this.left.height-this.right.height:null!==this.left?t=this.left.height+1:null!==this.right&&(t=-(this.right.height+1)),t},e.prototype.isLeftChild=function(){return null!==this.parent&&this.parent.left===this},Object.defineProperty(e.prototype,"left",{get:function(){return this._left},set:function(t){this._left=t,null!==t&&(t.parent=this),this.updateHeight(),this.updateMax()}}),Object.defineProperty(e.prototype,"right",{get:function(){return this._right},set:function(t){this._right=t,null!==t&&(t.parent=this),this.updateHeight(),this.updateMax()}}),e.prototype.dispose=function(){this.parent=null,this._left=null,this._right=null,this.event=null},t.IntervalTimeline}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1)],void 0===(o=function(t){function e(t){return function(e,i){i=this.toSeconds(i),t.apply(this,arguments);var n=this._events.get(i),o=this._events.previousEvent(n),s=this._getTicksUntilEvent(o,i);return n.ticks=Math.max(s,0),this}}return t.TickSignal=function(e){e=t.defaultArg(e,1),t.Signal.call(this,{units:t.Type.Ticks,value:e}),this._events.memory=1/0,this.cancelScheduledValues(0),this._events.add({type:t.Param.AutomationType.SetValue,time:0,value:e})},t.extend(t.TickSignal,t.Signal),t.TickSignal.prototype.setValueAtTime=e(t.Signal.prototype.setValueAtTime),t.TickSignal.prototype.linearRampToValueAtTime=e(t.Signal.prototype.linearRampToValueAtTime),t.TickSignal.prototype.setTargetAtTime=function(t,e,i){e=this.toSeconds(e),this.setRampPoint(e),t=this._fromUnits(t);for(var n=this._events.get(e),o=Math.round(Math.max(1/i,1)),s=0;s<=o;s++){var r=i*s+e,a=this._exponentialApproach(n.time,n.value,t,i,r);this.linearRampToValueAtTime(this._toUnits(a),r)}return this},t.TickSignal.prototype.exponentialRampToValueAtTime=function(t,e){e=this.toSeconds(e),t=this._fromUnits(t);var i=this._events.get(e);null===i&&(i={value:this._initialValue,time:0});for(var n=Math.round(Math.max(10*(e-i.time),1)),o=(e-i.time)/n,s=0;s<=n;s++){var r=o*s+i.time,a=this._exponentialInterpolate(i.time,i.value,e,t,r);this.linearRampToValueAtTime(this._toUnits(a),r)}return this},t.TickSignal.prototype._getTicksUntilEvent=function(e,i){if(null===e)e={ticks:0,time:0};else if(t.isUndef(e.ticks)){var n=this._events.previousEvent(e);e.ticks=this._getTicksUntilEvent(n,e.time)}var o=this.getValueAtTime(e.time),s=this.getValueAtTime(i);return this._events.get(i).time===i&&this._events.get(i).type===t.Param.AutomationType.SetValue&&(s=this.getValueAtTime(i-this.sampleTime)),.5*(i-e.time)*(o+s)+e.ticks},t.TickSignal.prototype.getTicksAtTime=function(t){t=this.toSeconds(t);var e=this._events.get(t);return Math.max(this._getTicksUntilEvent(e,t),0)},t.TickSignal.prototype.getDurationOfTicks=function(t,e){e=this.toSeconds(e);var i=this.getTicksAtTime(e);return this.getTimeOfTick(i+t)-e},t.TickSignal.prototype.getTimeOfTick=function(e){var i=this._events.get(e,"ticks"),n=this._events.getAfter(e,"ticks");if(i&&i.ticks===e)return i.time;if(i&&n&&n.type===t.Param.AutomationType.Linear&&i.value!==n.value){var o=this.getValueAtTime(i.time),s=(this.getValueAtTime(n.time)-o)/(n.time-i.time),r=Math.sqrt(Math.pow(o,2)-2*s*(i.ticks-e)),a=(-o+r)/s;return(a>0?a:(-o-r)/s)+i.time}return i?0===i.value?1/0:i.time+(e-i.ticks)/i.value:e/this._initialValue},t.TickSignal.prototype.ticksToTime=function(e,i){return i=this.toSeconds(i),new t.Time(this.getDurationOfTicks(e,i))},t.TickSignal.prototype.timeToTicks=function(e,i){i=this.toSeconds(i),e=this.toSeconds(e);var n=this.getTicksAtTime(i),o=this.getTicksAtTime(i+e);return new t.Ticks(o-n)},t.TickSignal}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(56),i(33),i(35),i(20)],void 0===(o=function(t){"use strict";return t.Clock=function(){var e=t.defaults(arguments,["callback","frequency"],t.Clock);t.Emitter.call(this),this.callback=e.callback,this._nextTick=0,this._tickSource=new t.TickSource(e.frequency),this._lastUpdate=0,this.frequency=this._tickSource.frequency,this._readOnly("frequency"),this._state=new t.TimelineState(t.State.Stopped),this._state.setStateAtTime(t.State.Stopped,0),this._boundLoop=this._loop.bind(this),this.context.on("tick",this._boundLoop)},t.extend(t.Clock,t.Emitter),t.Clock.defaults={callback:t.noOp,frequency:1},Object.defineProperty(t.Clock.prototype,"state",{get:function(){return this._state.getValueAtTime(this.now())}}),t.Clock.prototype.start=function(e,i){return this.context.resume(),e=this.toSeconds(e),this._state.getValueAtTime(e)!==t.State.Started&&(this._state.setStateAtTime(t.State.Started,e),this._tickSource.start(e,i),e<this._lastUpdate&&this.emit("start",e,i)),this},t.Clock.prototype.stop=function(e){return e=this.toSeconds(e),this._state.cancel(e),this._state.setStateAtTime(t.State.Stopped,e),this._tickSource.stop(e),e<this._lastUpdate&&this.emit("stop",e),this},t.Clock.prototype.pause=function(e){return e=this.toSeconds(e),this._state.getValueAtTime(e)===t.State.Started&&(this._state.setStateAtTime(t.State.Paused,e),this._tickSource.pause(e),e<this._lastUpdate&&this.emit("pause",e)),this},Object.defineProperty(t.Clock.prototype,"ticks",{get:function(){return Math.ceil(this.getTicksAtTime(this.now()))},set:function(t){this._tickSource.ticks=t}}),Object.defineProperty(t.Clock.prototype,"seconds",{get:function(){return this._tickSource.seconds},set:function(t){this._tickSource.seconds=t}}),t.Clock.prototype.getSecondsAtTime=function(t){return this._tickSource.getSecondsAtTime(t)},t.Clock.prototype.setTicksAtTime=function(t,e){return this._tickSource.setTicksAtTime(t,e),this},t.Clock.prototype.getTicksAtTime=function(t){return this._tickSource.getTicksAtTime(t)},t.Clock.prototype.nextTickTime=function(t,e){e=this.toSeconds(e);var i=this.getTicksAtTime(e);return this._tickSource.getTimeOfTick(i+t,e)},t.Clock.prototype._loop=function(){var e=this._lastUpdate,i=this.now();this._lastUpdate=i,e!==i&&(this._state.forEachBetween(e,i,function(e){switch(e.state){case t.State.Started:var i=this._tickSource.getTicksAtTime(e.time);this.emit("start",e.time,i);break;case t.State.Stopped:0!==e.time&&this.emit("stop",e.time);break;case t.State.Paused:this.emit("pause",e.time)}}.bind(this)),this._tickSource.forEachTickBetween(e,i,function(t,e){this.callback(t,e)}.bind(this)))},t.Clock.prototype.getStateAtTime=function(t){return t=this.toSeconds(t),this._state.getValueAtTime(t)},t.Clock.prototype.dispose=function(){t.Emitter.prototype.dispose.call(this),this.context.off("tick",this._boundLoop),this._writable("frequency"),this._tickSource.dispose(),this._tickSource=null,this.frequency=null,this._boundLoop=null,this._nextTick=1/0,this.callback=null,this._state.dispose(),this._state=null},t.Clock}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(1),i(5),i(7)],void 0===(o=function(t){"use strict";return t.GreaterThanZero=function(){t.SignalBase.call(this),this._thresh=this.output=new t.WaveShaper(function(t){return t<=0?0:1},127),this._scale=this.input=new t.Multiply(1e4),this._scale.connect(this._thresh)},t.extend(t.GreaterThanZero,t.SignalBase),t.GreaterThanZero.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._scale.dispose(),this._scale=null,this._thresh.dispose(),this._thresh=null,this},t.GreaterThanZero}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(87),i(13),i(1)],void 0===(o=function(t){"use strict";return t.GreaterThan=function(e){t.Signal.call(this),this.createInsOuts(2,0),this._param=this.input[0]=new t.Subtract(e),this.input[1]=this._param.input[1],this._gtz=this.output=new t.GreaterThanZero,this._param.connect(this._gtz),this.proxy=!1},t.extend(t.GreaterThan,t.Signal),t.GreaterThan.prototype.dispose=function(){return t.Signal.prototype.dispose.call(this),this._gtz.dispose(),this._gtz=null,this},t.GreaterThan}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(47),i(26)],void 0===(o=function(t){"use strict";return t.ScaledEnvelope=function(){var e=t.defaults(arguments,["attack","decay","sustain","release"],t.Envelope);t.Envelope.call(this,e),e=t.defaultArg(e,t.ScaledEnvelope.defaults),this._exp=this.output=new t.Pow(e.exponent),this._scale=this.output=new t.Scale(e.min,e.max),this._sig.chain(this._exp,this._scale)},t.extend(t.ScaledEnvelope,t.Envelope),t.ScaledEnvelope.defaults={min:0,max:1,exponent:1},Object.defineProperty(t.ScaledEnvelope.prototype,"min",{get:function(){return this._scale.min},set:function(t){this._scale.min=t}}),Object.defineProperty(t.ScaledEnvelope.prototype,"max",{get:function(){return this._scale.max},set:function(t){this._scale.max=t}}),Object.defineProperty(t.ScaledEnvelope.prototype,"exponent",{get:function(){return this._exp.value},set:function(t){this._exp.value=t}}),t.ScaledEnvelope.prototype.dispose=function(){return t.Envelope.prototype.dispose.call(this),this._scale.dispose(),this._scale=null,this._exp.dispose(),this._exp=null,this},t.ScaledEnvelope}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7),i(36)],void 0===(o=function(t){"use strict";return t.Abs=function(){t.SignalBase.call(this),this._abs=this.input=this.output=new t.WaveShaper(function(t){return Math.abs(t)<.001?0:Math.abs(t)},1024)},t.extend(t.Abs,t.SignalBase),t.Abs.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._abs.dispose(),this._abs=null,this},t.Abs}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(3),i(2)],void 0===(o=function(t){return t.Solo=function(){var e=t.defaults(arguments,["solo"],t.Solo);t.AudioNode.call(this),this.input=this.output=new t.Gain,this._soloBind=this._soloed.bind(this),this.context.on("solo",this._soloBind),this.solo=e.solo},t.extend(t.Solo,t.AudioNode),t.Solo.defaults={solo:!1},Object.defineProperty(t.Solo.prototype,"solo",{get:function(){return this._isSoloed()},set:function(t){t?this._addSolo():this._removeSolo(),this.context.emit("solo",this)}}),Object.defineProperty(t.Solo.prototype,"muted",{get:function(){return 0===this.input.gain.value}}),t.Solo.prototype._addSolo=function(){t.isArray(this.context._currentSolo)||(this.context._currentSolo=[]),this._isSoloed()||this.context._currentSolo.push(this)},t.Solo.prototype._removeSolo=function(){if(this._isSoloed()){var t=this.context._currentSolo.indexOf(this);this.context._currentSolo.splice(t,1)}},t.Solo.prototype._isSoloed=function(){return!!t.isArray(this.context._currentSolo)&&(0!==this.context._currentSolo.length&&-1!==this.context._currentSolo.indexOf(this))},t.Solo.prototype._noSolos=function(){return!t.isArray(this.context._currentSolo)||0===this.context._currentSolo.length},t.Solo.prototype._soloed=function(){this._isSoloed()?this.input.gain.value=1:this._noSolos()?this.input.gain.value=1:this.input.gain.value=0},t.Solo.prototype.dispose=function(){return this.context.off("solo",this._soloBind),this._removeSolo(),this._soloBind=null,t.AudioNode.prototype.dispose.call(this),this},t.Solo}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7),i(10),i(28),i(19),i(3),i(1),i(20)],void 0===(o=function(t){if(t.supported&&!t.global.AudioContext.prototype.createStereoPanner){var e=function(e){this.context=e,this.pan=new t.Signal(0,t.Type.AudioRange);var i=new t.WaveShaper(function(e){return t.equalPowerScale((e+1)/2)},4096),n=new t.WaveShaper(function(e){return t.equalPowerScale(1-(e+1)/2)},4096),o=new t.Gain,s=new t.Gain,r=this.input=new t.Split;r._splitter.channelCountMode="explicit",(new t.Zero).fan(i,n);var a=this.output=new t.Merge;r.left.chain(o,a.left),r.right.chain(s,a.right),this.pan.chain(n,o.gain),this.pan.chain(i,s.gain)};e.prototype.disconnect=function(){this.output.disconnect.apply(this.output,arguments)},e.prototype.connect=function(){this.output.connect.apply(this.output,arguments)},AudioContext.prototype.createStereoPanner=function(){return new e(this)},t.Context.prototype.createStereoPanner=function(){return new e(this)}}}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7)],void 0===(o=function(t){"use strict";return t.EqualPowerGain=function(){t.SignalBase.call(this),this._eqPower=this.input=this.output=new t.WaveShaper(function(e){return Math.abs(e)<.001?0:t.equalPowerScale(e)}.bind(this),4096)},t.extend(t.EqualPowerGain,t.SignalBase),t.EqualPowerGain.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._eqPower.dispose(),this._eqPower=null,this},t.EqualPowerGain}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(5),i(1)],void 0===(o=function(t){"use strict";return t.Negate=function(){t.SignalBase.call(this),this._multiply=this.input=this.output=new t.Multiply(-1)},t.extend(t.Negate,t.SignalBase),t.Negate.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._multiply.dispose(),this._multiply=null,this},t.Negate}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(60),i(27),i(2)],void 0===(o=function(t){"use strict";return t.PanVol=function(){var e=t.defaults(arguments,["pan","volume"],t.PanVol);t.AudioNode.call(this),this._panner=this.input=new t.Panner(e.pan),this.pan=this._panner.pan,this._volume=this.output=new t.Volume(e.volume),this.volume=this._volume.volume,this._panner.connect(this._volume),this.mute=e.mute,this._readOnly(["pan","volume"])},t.extend(t.PanVol,t.AudioNode),t.PanVol.defaults={pan:0,volume:0,mute:!1},Object.defineProperty(t.PanVol.prototype,"mute",{get:function(){return this._volume.mute},set:function(t){this._volume.mute=t}}),t.PanVol.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["pan","volume"]),this._panner.dispose(),this._panner=null,this.pan=null,this._volume.dispose(),this._volume=null,this.volume=null,this},t.PanVol}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(34)],void 0===(o=function(t){t.supported&&(AnalyserNode.prototype.getFloatTimeDomainData||(AnalyserNode.prototype.getFloatTimeDomainData=function(t){var e=new Uint8Array(t.length);this.getByteTimeDomainData(e);for(var i=0;i<e.length;i++)t[i]=(e[i]-128)/128}))}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(34),i(63),i(20),i(3)],void 0===(o=function(t){if(t.supported&&!t.global.AudioContext.prototype.createConstantSource){var e=function(t){this.context=t;for(var e=t.createBuffer(1,128,t.sampleRate),i=e.getChannelData(0),n=0;n<i.length;n++)i[n]=1;this._bufferSource=t.createBufferSource(),this._bufferSource.channelCount=1,this._bufferSource.channelCountMode="explicit",this._bufferSource.buffer=e,this._bufferSource.loop=!0;var o=this._output=t.createGain();this.offset=o.gain,this._bufferSource.connect(o)};e.prototype.start=function(t){return this._bufferSource.start(t),this},e.prototype.stop=function(t){return this._bufferSource.stop(t),this},e.prototype.connect=function(){return this._output.connect.apply(this._output,arguments),this},e.prototype.disconnect=function(){return this._output.disconnect.apply(this._output,arguments),this},AudioContext.prototype.createConstantSource=function(){return new e(this)},t.Context.prototype.createConstantSource=function(){return new e(this)}}}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(34)],void 0===(o=function(t){if(t.supported&&!t.global.AudioContext.prototype._native_createWaveShaper){var e=navigator.userAgent.toLowerCase();if(e.includes("safari")&&!e.includes("chrome")){var i=function(t){for(var e in this._internalNode=this.input=this.output=t._native_createWaveShaper(),this._curve=null,this._internalNode)this._defineProperty(this._internalNode,e)};Object.defineProperty(i.prototype,"curve",{get:function(){return this._curve},set:function(t){this._curve=t;var e=new Float32Array(t.length+1);e.set(t,1),e[0]=t[0],this._internalNode.curve=e}}),i.prototype._defineProperty=function(e,i){t.isUndef(this[i])&&Object.defineProperty(this,i,{get:function(){return"function"==typeof e[i]?e[i].bind(e):e[i]},set:function(t){e[i]=t}})},t.global.AudioContext.prototype._native_createWaveShaper=t.global.AudioContext.prototype.createWaveShaper,t.global.AudioContext.prototype.createWaveShaper=function(){return new i(this)}}}}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(46)],void 0===(o=function(t){return t.Midi=function(e,i){if(!(this instanceof t.Midi))return new t.Midi(e,i);t.Frequency.call(this,e,i)},t.extend(t.Midi,t.Frequency),t.Midi.prototype._defaultUnits="midi",t.Midi.prototype._frequencyToUnits=function(e){return t.Frequency.ftom(t.Frequency.prototype._frequencyToUnits.call(this,e))},t.Midi.prototype._ticksToUnits=function(e){return t.Frequency.ftom(t.Frequency.prototype._ticksToUnits.call(this,e))},t.Midi.prototype._beatsToUnits=function(e){return t.Frequency.ftom(t.Frequency.prototype._beatsToUnits.call(this,e))},t.Midi.prototype._secondsToUnits=function(e){return t.Frequency.ftom(t.Frequency.prototype._secondsToUnits.call(this,e))},t.Midi.prototype.toMidi=function(){return this.valueOf()},t.Midi.prototype.toFrequency=function(){return t.Frequency.mtof(this.toMidi())},t.Midi.prototype.transpose=function(t){return new this.constructor(this.toMidi()+t)},t.Midi}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(27),i(2)],void 0===(o=function(t){"use strict";return t.UserMedia=function(){var e=t.defaults(arguments,["volume"],t.UserMedia);t.AudioNode.call(this),this._mediaStream=null,this._stream=null,this._device=null,this._volume=this.output=new t.Volume(e.volume),this.volume=this._volume.volume,this._readOnly("volume"),this.mute=e.mute},t.extend(t.UserMedia,t.AudioNode),t.UserMedia.defaults={volume:0,mute:!1},t.UserMedia.prototype.open=function(e){return this.state===t.State.Started&&this.close(),t.UserMedia.enumerateDevices().then(function(i){var n;if(t.isNumber(e))n=i[e];else if(!(n=i.find(function(t){return t.label===e||t.deviceId===e}))&&i.length>0)n=i[0];else if(!n&&t.isDefined(e))throw new Error("Tone.UserMedia: no matching device: "+e);this._device=n;var o={audio:{echoCancellation:!1,sampleRate:this.context.sampleRate,noiseSuppression:!1,mozNoiseSuppression:!1}};return n&&(o.audio.deviceId=n.deviceId),navigator.mediaDevices.getUserMedia(o).then(function(t){return this._stream||(this._stream=t,this._mediaStream=this.context.createMediaStreamSource(t),this._mediaStream.connect(this.output)),this}.bind(this))}.bind(this))},t.UserMedia.prototype.close=function(){return this._stream&&(this._stream.getAudioTracks().forEach(function(t){t.stop()}),this._stream=null,this._mediaStream.disconnect(),this._mediaStream=null),this._device=null,this},t.UserMedia.enumerateDevices=function(){return navigator.mediaDevices.enumerateDevices().then(function(t){return t.filter(function(t){return"audioinput"===t.kind})})},Object.defineProperty(t.UserMedia.prototype,"state",{get:function(){return this._stream&&this._stream.active?t.State.Started:t.State.Stopped}}),Object.defineProperty(t.UserMedia.prototype,"deviceId",{get:function(){if(this._device)return this._device.deviceId}}),Object.defineProperty(t.UserMedia.prototype,"groupId",{get:function(){if(this._device)return this._device.groupId}}),Object.defineProperty(t.UserMedia.prototype,"label",{get:function(){if(this._device)return this._device.label}}),Object.defineProperty(t.UserMedia.prototype,"mute",{get:function(){return this._volume.mute},set:function(t){this._volume.mute=t}}),t.UserMedia.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this.close(),this._writable("volume"),this._volume.dispose(),this._volume=null,this.volume=null,this},Object.defineProperty(t.UserMedia,"supported",{get:function(){return t.isDefined(navigator.mediaDevices)&&t.isFunction(navigator.mediaDevices.getUserMedia)}}),t.UserMedia}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(67),i(27),i(2)],void 0===(o=function(t){"use strict";return t.Players=function(e){var i=Array.prototype.slice.call(arguments);i.shift();var n=t.defaults(i,["onload"],t.Players);for(var o in t.AudioNode.call(this,n),this._volume=this.output=new t.Volume(n.volume),this.volume=this._volume.volume,this._readOnly("volume"),this._volume.output.output.channelCount=2,this._volume.output.output.channelCountMode="explicit",this.mute=n.mute,this._players={},this._loadingCount=0,this._fadeIn=n.fadeIn,this._fadeOut=n.fadeOut,e)this._loadingCount++,this.add(o,e[o],this._bufferLoaded.bind(this,n.onload))},t.extend(t.Players,t.AudioNode),t.Players.defaults={volume:0,mute:!1,onload:t.noOp,fadeIn:0,fadeOut:0},t.Players.prototype._bufferLoaded=function(t){this._loadingCount--,0===this._loadingCount&&t&&t(this)},Object.defineProperty(t.Players.prototype,"mute",{get:function(){return this._volume.mute},set:function(t){this._volume.mute=t}}),Object.defineProperty(t.Players.prototype,"fadeIn",{get:function(){return this._fadeIn},set:function(t){this._fadeIn=t,this._forEach(function(e){e.fadeIn=t})}}),Object.defineProperty(t.Players.prototype,"fadeOut",{get:function(){return this._fadeOut},set:function(t){this._fadeOut=t,this._forEach(function(e){e.fadeOut=t})}}),Object.defineProperty(t.Players.prototype,"state",{get:function(){var e=!1;return this._forEach(function(i){e=e||i.state===t.State.Started}),e?t.State.Started:t.State.Stopped}}),t.Players.prototype.has=function(t){return this._players.hasOwnProperty(t)},t.Players.prototype.get=function(t){if(this.has(t))return this._players[t];throw new Error("Tone.Players: no player named "+t)},t.Players.prototype._forEach=function(t){for(var e in this._players)t(this._players[e],e);return this},Object.defineProperty(t.Players.prototype,"loaded",{get:function(){var t=!0;return this._forEach(function(e){t=t&&e.loaded}),t}}),t.Players.prototype.add=function(e,i,n){return this._players[e]=new t.Player(i,n).connect(this.output),this._players[e].fadeIn=this._fadeIn,this._players[e].fadeOut=this._fadeOut,this},t.Players.prototype.stopAll=function(t){this._forEach(function(e){e.stop(t)})},t.Players.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._volume.dispose(),this._volume=null,this._writable("volume"),this.volume=null,this.output=null,this._forEach(function(t){t.dispose()}),this._players=null,this},t.Players}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(6),i(11),i(31)],void 0===(o=function(t){return t.GrainPlayer=function(){var e=t.defaults(arguments,["url","onload"],t.GrainPlayer);t.Source.call(this,e),this.buffer=new t.Buffer(e.url,e.onload),this._clock=new t.Clock(this._tick.bind(this),e.grainSize),this._loopStart=0,this._loopEnd=0,this._activeSources=[],this._playbackRate=e.playbackRate,this._grainSize=e.grainSize,this._overlap=e.overlap,this.detune=e.detune,this.overlap=e.overlap,this.loop=e.loop,this.playbackRate=e.playbackRate,this.grainSize=e.grainSize,this.loopStart=e.loopStart,this.loopEnd=e.loopEnd,this.reverse=e.reverse,this._clock.on("stop",this._onstop.bind(this))},t.extend(t.GrainPlayer,t.Source),t.GrainPlayer.defaults={onload:t.noOp,overlap:.1,grainSize:.2,playbackRate:1,detune:0,loop:!1,loopStart:0,loopEnd:0,reverse:!1},t.GrainPlayer.prototype._start=function(e,i,n){i=t.defaultArg(i,0),i=this.toSeconds(i),e=this.toSeconds(e),this._offset=i,this._clock.start(e),n&&this.stop(e+this.toSeconds(n))},t.GrainPlayer.prototype._stop=function(t){this._clock.stop(t)},t.GrainPlayer.prototype._onstop=function(t){this._activeSources.forEach(function(e){e.fadeOut=0,e.stop(t)})},t.GrainPlayer.prototype._tick=function(e){if(!this.loop&&this._offset>this.buffer.duration)this.stop(e);else{var i=this._offset<this._overlap?0:this._overlap,n=new t.BufferSource({buffer:this.buffer,fadeIn:i,fadeOut:this._overlap,loop:this.loop,loopStart:this._loopStart,loopEnd:this._loopEnd,playbackRate:t.intervalToFrequencyRatio(this.detune/100)}).connect(this.output);n.start(e,this._offset),this._offset+=this.grainSize,n.stop(e+this.grainSize/this.playbackRate),this._activeSources.push(n),n.onended=function(){var t=this._activeSources.indexOf(n);-1!==t&&this._activeSources.splice(t,1)}.bind(this)}},Object.defineProperty(t.GrainPlayer.prototype,"playbackRate",{get:function(){return this._playbackRate},set:function(t){this._playbackRate=t,this.grainSize=this._grainSize}}),Object.defineProperty(t.GrainPlayer.prototype,"loopStart",{get:function(){return this._loopStart},set:function(t){this._loopStart=this.toSeconds(t)}}),Object.defineProperty(t.GrainPlayer.prototype,"loopEnd",{get:function(){return this._loopEnd},set:function(t){this._loopEnd=this.toSeconds(t)}}),Object.defineProperty(t.GrainPlayer.prototype,"reverse",{get:function(){return this.buffer.reverse},set:function(t){this.buffer.reverse=t}}),Object.defineProperty(t.GrainPlayer.prototype,"grainSize",{get:function(){return this._grainSize},set:function(t){this._grainSize=this.toSeconds(t),this._clock.frequency.value=this._playbackRate/this._grainSize}}),Object.defineProperty(t.GrainPlayer.prototype,"overlap",{get:function(){return this._overlap},set:function(t){this._overlap=this.toSeconds(t)}}),Object.defineProperty(t.GrainPlayer.prototype,"loaded",{get:function(){return this.buffer.loaded}}),t.GrainPlayer.prototype.dispose=function(){return t.Source.prototype.dispose.call(this),this.buffer.dispose(),this.buffer=null,this._clock.dispose(),this._clock=null,this._activeSources.forEach(function(t){t.dispose()}),this._activeSources=null,this},t.GrainPlayer}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(16),i(1),i(45)],void 0===(o=function(t){return t.TransportTimelineSignal=function(){t.Signal.apply(this,arguments),this.output=this._outputSig=new t.Signal(this._initialValue),this._lastVal=this.value,this._synced=t.Transport.scheduleRepeat(this._onTick.bind(this),"1i"),this._bindAnchorValue=this._anchorValue.bind(this),t.Transport.on("start stop pause",this._bindAnchorValue),this._events.memory=1/0},t.extend(t.TransportTimelineSignal,t.Signal),t.TransportTimelineSignal.prototype._onTick=function(e){var i=this.getValueAtTime(t.Transport.seconds);this._lastVal!==i&&(this._lastVal=i,this._outputSig.linearRampToValueAtTime(i,e))},t.TransportTimelineSignal.prototype._anchorValue=function(e){var i=this.getValueAtTime(t.Transport.seconds);return this._lastVal=i,this._outputSig.cancelScheduledValues(e),this._outputSig.setValueAtTime(i,e),this},t.TransportTimelineSignal.prototype.getValueAtTime=function(e){return e=t.TransportTime(e),t.Signal.prototype.getValueAtTime.call(this,e)},t.TransportTimelineSignal.prototype.setValueAtTime=function(e,i){return i=t.TransportTime(i),t.Signal.prototype.setValueAtTime.call(this,e,i),this},t.TransportTimelineSignal.prototype.linearRampToValueAtTime=function(e,i){return i=t.TransportTime(i),t.Signal.prototype.linearRampToValueAtTime.call(this,e,i),this},t.TransportTimelineSignal.prototype.exponentialRampToValueAtTime=function(e,i){return i=t.TransportTime(i),t.Signal.prototype.exponentialRampToValueAtTime.call(this,e,i),this},t.TransportTimelineSignal.prototype.setTargetAtTime=function(e,i,n){return i=t.TransportTime(i),t.Signal.prototype.setTargetAtTime.call(this,e,i,n),this},t.TransportTimelineSignal.prototype.cancelScheduledValues=function(e){return e=t.TransportTime(e),t.Signal.prototype.cancelScheduledValues.call(this,e),this},t.TransportTimelineSignal.prototype.setValueCurveAtTime=function(e,i,n,o){return i=t.TransportTime(i),n=t.TransportTime(n),t.Signal.prototype.setValueCurveAtTime.call(this,e,i,n,o),this},t.TransportTimelineSignal.prototype.cancelAndHoldAtTime=function(e){return t.Signal.prototype.cancelAndHoldAtTime.call(this,t.TransportTime(e))},t.TransportTimelineSignal.prototype.dispose=function(){t.Transport.clear(this._synced),t.Transport.off("start stop pause",this._syncedCallback),this._events.cancel(0),t.Signal.prototype.dispose.call(this),this._outputSig.dispose(),this._outputSig=null},t.TransportTimelineSignal}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(29),i(5)],void 0===(o=function(t){"use strict";return t.Normalize=function(e,i){t.SignalBase.call(this),this._inputMin=t.defaultArg(e,0),this._inputMax=t.defaultArg(i,1),this._sub=this.input=new t.Add(0),this._div=this.output=new t.Multiply(1),this._sub.connect(this._div),this._setRange()},t.extend(t.Normalize,t.SignalBase),Object.defineProperty(t.Normalize.prototype,"min",{get:function(){return this._inputMin},set:function(t){this._inputMin=t,this._setRange()}}),Object.defineProperty(t.Normalize.prototype,"max",{get:function(){return this._inputMax},set:function(t){this._inputMax=t,this._setRange()}}),t.Normalize.prototype._setRange=function(){this._sub.value=-this._inputMin,this._div.value=1/(this._inputMax-this._inputMin)},t.Normalize.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._sub.dispose(),this._sub=null,this._div.dispose(),this._div=null,this},t.Normalize}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(7),i(1)],void 0===(o=function(t){"use strict";return t.GainToAudio=function(){t.SignalBase.call(this),this._norm=this.input=this.output=new t.WaveShaper(function(t){return 2*Math.abs(t)-1})},t.extend(t.GainToAudio,t.SignalBase),t.GainToAudio.prototype.dispose=function(){return t.SignalBase.prototype.dispose.call(this),this._norm.dispose(),this._norm=null,this},t.GainToAudio}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){t.supported&&(OscillatorNode.prototype.setPeriodicWave||(OscillatorNode.prototype.setPeriodicWave=OscillatorNode.prototype.setWaveTable),AudioContext.prototype.createPeriodicWave||(AudioContext.prototype.createPeriodicWave=AudioContext.prototype.createWaveTable))}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(21),i(79),i(31)],void 0===(o=function(t){return t.Sampler=function(e){var i=Array.prototype.slice.call(arguments);i.shift();var n=t.defaults(i,["onload","baseUrl"],t.Sampler);t.Instrument.call(this,n);var o={};for(var s in e)if(t.isNote(s)){o[t.Frequency(s).toMidi()]=e[s]}else{if(isNaN(parseFloat(s)))throw new Error("Tone.Sampler: url keys must be the note's pitch");o[s]=e[s]}this._buffers=new t.Buffers(o,n.onload,n.baseUrl),this._activeSources={},this.attack=n.attack,this.release=n.release,this.curve=n.curve},t.extend(t.Sampler,t.Instrument),t.Sampler.defaults={attack:0,release:.1,onload:t.noOp,baseUrl:"",curve:"exponential"},t.Sampler.prototype._findClosest=function(t){for(var e=0;e<96;){if(this._buffers.has(t+e))return-e;if(this._buffers.has(t-e))return e;e++}return null},t.Sampler.prototype.triggerAttack=function(e,i,n){this.log("triggerAttack",e,i,n),Array.isArray(e)||(e=[e]);for(var o=0;o<e.length;o++){var s=t.Frequency(e[o]).toMidi(),r=this._findClosest(s);if(null!==r){var a=s-r,l=this._buffers.get(a),h=t.intervalToFrequencyRatio(r),u=new t.BufferSource({buffer:l,playbackRate:h,fadeIn:this.attack,fadeOut:this.release,curve:this.curve}).connect(this.output);u.start(i,0,l.duration/h,n),t.isArray(this._activeSources[s])||(this._activeSources[s]=[]),this._activeSources[s].push(u),u.onended=function(){if(this._activeSources&&this._activeSources[s]){var t=this._activeSources[s].indexOf(u);-1!==t&&this._activeSources[s].splice(t,1)}}.bind(this)}}return this},t.Sampler.prototype.triggerRelease=function(e,i){this.log("triggerRelease",e,i),Array.isArray(e)||(e=[e]);for(var n=0;n<e.length;n++){var o=t.Frequency(e[n]).toMidi();if(this._activeSources[o]&&this._activeSources[o].length){var s=this._activeSources[o].shift();i=this.toSeconds(i),s.stop(i)}}return this},t.Sampler.prototype.releaseAll=function(t){for(var e in t=this.toSeconds(t),this._activeSources)for(var i=this._activeSources[e];i.length;){i.shift().stop(t)}return this},t.Sampler.prototype.sync=function(){return this._syncMethod("triggerAttack",1),this._syncMethod("triggerRelease",1),this},t.Sampler.prototype.triggerAttackRelease=function(e,i,n,o){if(n=this.toSeconds(n),this.triggerAttack(e,n,o),t.isArray(i)&&t.isArray(e))for(var s=0;s<e.length;s++){var r=i[Math.min(s,i.length-1)];this.triggerRelease(e[s],n+this.toSeconds(r))}else this.triggerRelease(e,n+this.toSeconds(i));return this},t.Sampler.prototype.add=function(e,i,n){if(t.isNote(e)){var o=t.Frequency(e).toMidi();this._buffers.add(o,i,n)}else{if(isNaN(parseFloat(e)))throw new Error("Tone.Sampler: note must be the note's pitch. Instead got "+e);this._buffers.add(e,i,n)}},Object.defineProperty(t.Sampler.prototype,"loaded",{get:function(){return this._buffers.loaded}}),t.Sampler.prototype.dispose=function(){for(var e in t.Instrument.prototype.dispose.call(this),this._buffers.dispose(),this._buffers=null,this._activeSources)this._activeSources[e].forEach(function(t){t.dispose()});return this._activeSources=null,this},t.Sampler}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(38),i(6)],void 0===(o=function(t){"use strict";return t.PolySynth=function(){var e=t.defaults(arguments,["polyphony","voice"],t.PolySynth);t.Instrument.call(this,e),(e=t.defaultArg(e,t.Instrument.defaults)).polyphony=Math.min(t.PolySynth.MAX_POLYPHONY,e.polyphony),this.voices=new Array(e.polyphony),this.assert(e.polyphony>0,"polyphony must be greater than 0"),this.detune=new t.Signal(e.detune,t.Type.Cents),this._readOnly("detune");for(var i=0;i<e.polyphony;i++){var n=new e.voice(arguments[2],arguments[3]);if(!(n instanceof t.Monophonic))throw new Error("Synth constructor must be instance of Tone.Monophonic");this.voices[i]=n,n.index=i,n.connect(this.output),n.hasOwnProperty("detune")&&this.detune.connect(n.detune)}},t.extend(t.PolySynth,t.Instrument),t.PolySynth.defaults={polyphony:4,volume:0,detune:0,voice:t.Synth},t.PolySynth.prototype._getClosestVoice=function(e,i){var n=this.voices.find(function(n){if(Math.abs(n.frequency.getValueAtTime(e)-t.Frequency(i))<1e-4&&n.getLevelAtTime(e)>1e-5)return n});return n||this.voices.slice().sort(function(t,i){var n=t.getLevelAtTime(e+this.blockTime),o=i.getLevelAtTime(e+this.blockTime);return n<1e-5&&(n=0),o<1e-5&&(o=0),n-o}.bind(this))[0]},t.PolySynth.prototype.triggerAttack=function(t,e,i){return Array.isArray(t)||(t=[t]),e=this.toSeconds(e),t.forEach(function(t){var n=this._getClosestVoice(e,t);n.triggerAttack(t,e,i),this.log("triggerAttack",n.index,t)}.bind(this)),this},t.PolySynth.prototype.triggerRelease=function(t,e){return Array.isArray(t)||(t=[t]),e=this.toSeconds(e),t.forEach(function(t){var i=this._getClosestVoice(e,t);this.log("triggerRelease",i.index,t),i.triggerRelease(e)}.bind(this)),this},t.PolySynth.prototype.triggerAttackRelease=function(e,i,n,o){if(n=this.toSeconds(n),this.triggerAttack(e,n,o),t.isArray(i)&&t.isArray(e))for(var s=0;s<e.length;s++){var r=i[Math.min(s,i.length-1)];this.triggerRelease(e[s],n+this.toSeconds(r))}else this.triggerRelease(e,n+this.toSeconds(i));return this},t.PolySynth.prototype.sync=function(){return this._syncMethod("triggerAttack",1),this._syncMethod("triggerRelease",1),this},t.PolySynth.prototype.set=function(t,e,i){for(var n=0;n<this.voices.length;n++)this.voices[n].set(t,e,i);return this},t.PolySynth.prototype.get=function(t){return this.voices[0].get(t)},t.PolySynth.prototype.releaseAll=function(t){return t=this.toSeconds(t),this.voices.forEach(function(e){e.triggerRelease(t)}),this},t.PolySynth.prototype.dispose=function(){return t.Instrument.prototype.dispose.call(this),this.voices.forEach(function(t){t.dispose()}),this._writable("detune"),this.detune.dispose(),this.detune=null,this.voices=null,this},t.PolySynth.MAX_POLYPHONY=20,t.PolySynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(21),i(39),i(53)],void 0===(o=function(t){"use strict";return t.PluckSynth=function(e){e=t.defaultArg(e,t.PluckSynth.defaults),t.Instrument.call(this,e),this._noise=new t.Noise("pink"),this.attackNoise=e.attackNoise,this._lfcf=new t.LowpassCombFilter({resonance:e.resonance,dampening:e.dampening}),this.resonance=this._lfcf.resonance,this.dampening=this._lfcf.dampening,this._noise.connect(this._lfcf),this._lfcf.connect(this.output),this._readOnly(["resonance","dampening"])},t.extend(t.PluckSynth,t.Instrument),t.PluckSynth.defaults={attackNoise:1,dampening:4e3,resonance:.7},t.PluckSynth.prototype.triggerAttack=function(t,e){t=this.toFrequency(t),e=this.toSeconds(e);var i=1/t;return this._lfcf.delayTime.setValueAtTime(i,e),this._noise.start(e),this._noise.stop(e+i*this.attackNoise),this},t.PluckSynth.prototype.dispose=function(){return t.Instrument.prototype.dispose.call(this),this._noise.dispose(),this._lfcf.dispose(),this._noise=null,this._lfcf=null,this._writable(["resonance","dampening"]),this.dampening=null,this.resonance=null,this},t.PluckSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(30),i(41),i(39),i(1),i(9),i(21)],void 0===(o=function(t){"use strict";return t.NoiseSynth=function(e){e=t.defaultArg(e,t.NoiseSynth.defaults),t.Instrument.call(this,e),this.noise=new t.Noise(e.noise),this.envelope=new t.AmplitudeEnvelope(e.envelope),this.noise.chain(this.envelope,this.output),this._readOnly(["noise","envelope"])},t.extend(t.NoiseSynth,t.Instrument),t.NoiseSynth.defaults={noise:{type:"white"},envelope:{attack:.005,decay:.1,sustain:0}},t.NoiseSynth.prototype.triggerAttack=function(t,e){return t=this.toSeconds(t),this.envelope.triggerAttack(t,e),this.noise.start(t),0===this.envelope.sustain&&this.noise.stop(t+this.envelope.attack+this.envelope.decay),this},t.NoiseSynth.prototype.triggerRelease=function(t){return this.envelope.triggerRelease(t),this.noise.stop(t+this.envelope.release),this},t.NoiseSynth.prototype.sync=function(){return this._syncMethod("triggerAttack",0),this._syncMethod("triggerRelease",0),this},t.NoiseSynth.prototype.triggerAttackRelease=function(t,e,i){return e=this.toSeconds(e),t=this.toSeconds(t),this.triggerAttack(e,i),this.triggerRelease(e+t),this},t.NoiseSynth.prototype.dispose=function(){return t.Instrument.prototype.dispose.call(this),this._writable(["noise","envelope"]),this.noise.dispose(),this.noise=null,this.envelope.dispose(),this.envelope=null,this},t.NoiseSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(21),i(48),i(9),i(41),i(30),i(3),i(26),i(5)],void 0===(o=function(t){var e=[1,1.483,1.932,2.546,2.63,3.897];return t.MetalSynth=function(i){i=t.defaultArg(i,t.MetalSynth.defaults),t.Instrument.call(this,i),this.frequency=new t.Signal(i.frequency,t.Type.Frequency),this._oscillators=[],this._freqMultipliers=[],this._amplitue=new t.Gain(0).connect(this.output),this._highpass=new t.Filter({type:"highpass",Q:-3.0102999566398125}).connect(this._amplitue),this._octaves=i.octaves,this._filterFreqScaler=new t.Scale(i.resonance,7e3),this.envelope=new t.Envelope({attack:i.envelope.attack,attackCurve:"linear",decay:i.envelope.decay,sustain:0,release:i.envelope.release}).chain(this._filterFreqScaler,this._highpass.frequency),this.envelope.connect(this._amplitue.gain);for(var n=0;n<e.length;n++){var o=new t.FMOscillator({type:"square",modulationType:"square",harmonicity:i.harmonicity,modulationIndex:i.modulationIndex});o.connect(this._highpass),this._oscillators[n]=o;var s=new t.Multiply(e[n]);this._freqMultipliers[n]=s,this.frequency.chain(s,o.frequency)}this.octaves=i.octaves},t.extend(t.MetalSynth,t.Instrument),t.MetalSynth.defaults={frequency:200,envelope:{attack:.001,decay:1.4,release:.2},harmonicity:5.1,modulationIndex:32,resonance:4e3,octaves:1.5},t.MetalSynth.prototype.triggerAttack=function(e,i){return e=this.toSeconds(e),i=t.defaultArg(i,1),this.envelope.triggerAttack(e,i),this._oscillators.forEach(function(t){t.start(e)}),0===this.envelope.sustain&&this._oscillators.forEach(function(t){t.stop(e+this.envelope.attack+this.envelope.decay)}.bind(this)),this},t.MetalSynth.prototype.triggerRelease=function(t){return t=this.toSeconds(t),this.envelope.triggerRelease(t),this._oscillators.forEach(function(e){e.stop(t+this.envelope.release)}.bind(this)),this},t.MetalSynth.prototype.sync=function(){return this._syncMethod("triggerAttack",0),this._syncMethod("triggerRelease",0),this},t.MetalSynth.prototype.triggerAttackRelease=function(t,e,i){return e=this.toSeconds(e),t=this.toSeconds(t),this.triggerAttack(e,i),this.triggerRelease(e+t),this},Object.defineProperty(t.MetalSynth.prototype,"modulationIndex",{get:function(){return this._oscillators[0].modulationIndex.value},set:function(t){for(var e=0;e<this._oscillators.length;e++)this._oscillators[e].modulationIndex.value=t}}),Object.defineProperty(t.MetalSynth.prototype,"harmonicity",{get:function(){return this._oscillators[0].harmonicity.value},set:function(t){for(var e=0;e<this._oscillators.length;e++)this._oscillators[e].harmonicity.value=t}}),Object.defineProperty(t.MetalSynth.prototype,"resonance",{get:function(){return this._filterFreqScaler.min},set:function(t){this._filterFreqScaler.min=t,this.octaves=this._octaves}}),Object.defineProperty(t.MetalSynth.prototype,"octaves",{get:function(){return this._octaves},set:function(t){this._octaves=t,this._filterFreqScaler.max=this._filterFreqScaler.min*Math.pow(2,t)}}),t.MetalSynth.prototype.dispose=function(){t.Instrument.prototype.dispose.call(this);for(var e=0;e<this._oscillators.length;e++)this._oscillators[e].dispose(),this._freqMultipliers[e].dispose();this._oscillators=null,this._freqMultipliers=null,this.frequency.dispose(),this.frequency=null,this._filterFreqScaler.dispose(),this._filterFreqScaler=null,this._amplitue.dispose(),this._amplitue=null,this.envelope.dispose(),this.envelope=null,this._highpass.dispose(),this._highpass=null},t.MetalSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(37),i(21),i(30)],void 0===(o=function(t){"use strict";return t.MembraneSynth=function(e){e=t.defaultArg(e,t.MembraneSynth.defaults),t.Instrument.call(this,e),this.oscillator=new t.OmniOscillator(e.oscillator),this.envelope=new t.AmplitudeEnvelope(e.envelope),this.octaves=e.octaves,this.pitchDecay=e.pitchDecay,this.oscillator.chain(this.envelope,this.output),this._readOnly(["oscillator","envelope"])},t.extend(t.MembraneSynth,t.Instrument),t.MembraneSynth.defaults={pitchDecay:.05,octaves:10,oscillator:{type:"sine"},envelope:{attack:.001,decay:.4,sustain:.01,release:1.4,attackCurve:"exponential"}},t.MembraneSynth.prototype.triggerAttack=function(t,e,i){e=this.toSeconds(e);var n=(t=this.toFrequency(t))*this.octaves;return this.oscillator.frequency.setValueAtTime(n,e),this.oscillator.frequency.exponentialRampToValueAtTime(t,e+this.toSeconds(this.pitchDecay)),this.envelope.triggerAttack(e,i),this.oscillator.start(e),0===this.envelope.sustain&&this.oscillator.stop(e+this.envelope.attack+this.envelope.decay),this},t.MembraneSynth.prototype.triggerRelease=function(t){return t=this.toSeconds(t),this.envelope.triggerRelease(t),this.oscillator.stop(t+this.envelope.release),this},t.MembraneSynth.prototype.dispose=function(){return t.Instrument.prototype.dispose.call(this),this._writable(["oscillator","envelope"]),this.oscillator.dispose(),this.oscillator=null,this.envelope.dispose(),this.envelope=null,this},t.MembraneSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(38),i(1),i(5),i(25)],void 0===(o=function(t){"use strict";return t.FMSynth=function(e){e=t.defaultArg(e,t.FMSynth.defaults),t.Monophonic.call(this,e),this._carrier=new t.Synth(e.carrier),this._carrier.volume.value=-10,this.oscillator=this._carrier.oscillator,this.envelope=this._carrier.envelope.set(e.envelope),this._modulator=new t.Synth(e.modulator),this._modulator.volume.value=-10,this.modulation=this._modulator.oscillator.set(e.modulation),this.modulationEnvelope=this._modulator.envelope.set(e.modulationEnvelope),this.frequency=new t.Signal(440,t.Type.Frequency),this.detune=new t.Signal(e.detune,t.Type.Cents),this.harmonicity=new t.Multiply(e.harmonicity),this.harmonicity.units=t.Type.Positive,this.modulationIndex=new t.Multiply(e.modulationIndex),this.modulationIndex.units=t.Type.Positive,this._modulationNode=new t.Gain(0),this.frequency.connect(this._carrier.frequency),this.frequency.chain(this.harmonicity,this._modulator.frequency),this.frequency.chain(this.modulationIndex,this._modulationNode),this.detune.fan(this._carrier.detune,this._modulator.detune),this._modulator.connect(this._modulationNode.gain),this._modulationNode.connect(this._carrier.frequency),this._carrier.connect(this.output),this._readOnly(["frequency","harmonicity","modulationIndex","oscillator","envelope","modulation","modulationEnvelope","detune"])},t.extend(t.FMSynth,t.Monophonic),t.FMSynth.defaults={harmonicity:3,modulationIndex:10,detune:0,oscillator:{type:"sine"},envelope:{attack:.01,decay:.01,sustain:1,release:.5},modulation:{type:"square"},modulationEnvelope:{attack:.5,decay:0,sustain:1,release:.5}},t.FMSynth.prototype._triggerEnvelopeAttack=function(t,e){return t=this.toSeconds(t),this._carrier._triggerEnvelopeAttack(t,e),this._modulator._triggerEnvelopeAttack(t),this},t.FMSynth.prototype._triggerEnvelopeRelease=function(t){return t=this.toSeconds(t),this._carrier._triggerEnvelopeRelease(t),this._modulator._triggerEnvelopeRelease(t),this},t.FMSynth.prototype.dispose=function(){return t.Monophonic.prototype.dispose.call(this),this._writable(["frequency","harmonicity","modulationIndex","oscillator","envelope","modulation","modulationEnvelope","detune"]),this._carrier.dispose(),this._carrier=null,this._modulator.dispose(),this._modulator=null,this.frequency.dispose(),this.frequency=null,this.detune.dispose(),this.detune=null,this.modulationIndex.dispose(),this.modulationIndex=null,this.harmonicity.dispose(),this.harmonicity=null,this._modulationNode.dispose(),this._modulationNode=null,this.oscillator=null,this.envelope=null,this.modulationEnvelope=null,this.modulation=null,this},t.FMSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(68),i(12),i(1),i(5),i(25),i(14)],void 0===(o=function(t){"use strict";return t.DuoSynth=function(e){e=t.defaultArg(e,t.DuoSynth.defaults),t.Monophonic.call(this,e),this.voice0=new t.MonoSynth(e.voice0),this.voice0.volume.value=-10,this.voice1=new t.MonoSynth(e.voice1),this.voice1.volume.value=-10,this._vibrato=new t.LFO(e.vibratoRate,-50,50),this._vibrato.start(),this.vibratoRate=this._vibrato.frequency,this._vibratoGain=new t.Gain(e.vibratoAmount,t.Type.Positive),this.vibratoAmount=this._vibratoGain.gain,this.frequency=new t.Signal(440,t.Type.Frequency),this.harmonicity=new t.Multiply(e.harmonicity),this.harmonicity.units=t.Type.Positive,this.frequency.connect(this.voice0.frequency),this.frequency.chain(this.harmonicity,this.voice1.frequency),this._vibrato.connect(this._vibratoGain),this._vibratoGain.fan(this.voice0.detune,this.voice1.detune),this.voice0.connect(this.output),this.voice1.connect(this.output),this._readOnly(["voice0","voice1","frequency","vibratoAmount","vibratoRate"])},t.extend(t.DuoSynth,t.Monophonic),t.DuoSynth.defaults={vibratoAmount:.5,vibratoRate:5,harmonicity:1.5,voice0:{volume:-10,portamento:0,oscillator:{type:"sine"},filterEnvelope:{attack:.01,decay:0,sustain:1,release:.5},envelope:{attack:.01,decay:0,sustain:1,release:.5}},voice1:{volume:-10,portamento:0,oscillator:{type:"sine"},filterEnvelope:{attack:.01,decay:0,sustain:1,release:.5},envelope:{attack:.01,decay:0,sustain:1,release:.5}}},t.DuoSynth.prototype._triggerEnvelopeAttack=function(t,e){return t=this.toSeconds(t),this.voice0._triggerEnvelopeAttack(t,e),this.voice1._triggerEnvelopeAttack(t,e),this},t.DuoSynth.prototype._triggerEnvelopeRelease=function(t){return this.voice0._triggerEnvelopeRelease(t),this.voice1._triggerEnvelopeRelease(t),this},t.DuoSynth.prototype.getLevelAtTime=function(t){return(this.voice0.getLevelAtTime(t)+this.voice1.getLevelAtTime(t))/2},t.DuoSynth.prototype.dispose=function(){return t.Monophonic.prototype.dispose.call(this),this._writable(["voice0","voice1","frequency","vibratoAmount","vibratoRate"]),this.voice0.dispose(),this.voice0=null,this.voice1.dispose(),this.voice1=null,this.frequency.dispose(),this.frequency=null,this._vibratoGain.dispose(),this._vibratoGain=null,this._vibrato=null,this.harmonicity.dispose(),this.harmonicity=null,this.vibratoAmount.dispose(),this.vibratoAmount=null,this.vibratoRate=null,this},t.DuoSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(38),i(1),i(5),i(25),i(22),i(3)],void 0===(o=function(t){"use strict";return t.AMSynth=function(e){e=t.defaultArg(e,t.AMSynth.defaults),t.Monophonic.call(this,e),this._carrier=new t.Synth,this._carrier.volume.value=-10,this.oscillator=this._carrier.oscillator.set(e.oscillator),this.envelope=this._carrier.envelope.set(e.envelope),this._modulator=new t.Synth,this._modulator.volume.value=-10,this.modulation=this._modulator.oscillator.set(e.modulation),this.modulationEnvelope=this._modulator.envelope.set(e.modulationEnvelope),this.frequency=new t.Signal(440,t.Type.Frequency),this.detune=new t.Signal(e.detune,t.Type.Cents),this.harmonicity=new t.Multiply(e.harmonicity),this.harmonicity.units=t.Type.Positive,this._modulationScale=new t.AudioToGain,this._modulationNode=new t.Gain,this.frequency.connect(this._carrier.frequency),this.frequency.chain(this.harmonicity,this._modulator.frequency),this.detune.fan(this._carrier.detune,this._modulator.detune),this._modulator.chain(this._modulationScale,this._modulationNode.gain),this._carrier.chain(this._modulationNode,this.output),this._readOnly(["frequency","harmonicity","oscillator","envelope","modulation","modulationEnvelope","detune"])},t.extend(t.AMSynth,t.Monophonic),t.AMSynth.defaults={harmonicity:3,detune:0,oscillator:{type:"sine"},envelope:{attack:.01,decay:.01,sustain:1,release:.5},modulation:{type:"square"},modulationEnvelope:{attack:.5,decay:0,sustain:1,release:.5}},t.AMSynth.prototype._triggerEnvelopeAttack=function(t,e){return t=this.toSeconds(t),this._carrier._triggerEnvelopeAttack(t,e),this._modulator._triggerEnvelopeAttack(t),this},t.AMSynth.prototype._triggerEnvelopeRelease=function(t){return this._carrier._triggerEnvelopeRelease(t),this._modulator._triggerEnvelopeRelease(t),this},t.AMSynth.prototype.dispose=function(){return t.Monophonic.prototype.dispose.call(this),this._writable(["frequency","harmonicity","oscillator","envelope","modulation","modulationEnvelope","detune"]),this._carrier.dispose(),this._carrier=null,this._modulator.dispose(),this._modulator=null,this.frequency.dispose(),this.frequency=null,this.detune.dispose(),this.detune=null,this.harmonicity.dispose(),this.harmonicity=null,this._modulationScale.dispose(),this._modulationScale=null,this._modulationNode.dispose(),this._modulationNode=null,this.oscillator=null,this.envelope=null,this.modulationEnvelope=null,this.modulation=null,this},t.AMSynth}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(72),i(16)],void 0===(o=function(t){"use strict";return t.Sequence=function(){var e=t.defaults(arguments,["callback","events","subdivision"],t.Sequence),i=e.events;if(delete e.events,t.Part.call(this,e),this._subdivision=this.toTicks(e.subdivision),t.isUndef(e.loopEnd)&&t.isDefined(i)&&(this._loopEnd=i.length*this._subdivision),this._loop=!0,t.isDefined(i))for(var n=0;n<i.length;n++)this.add(n,i[n])},t.extend(t.Sequence,t.Part),t.Sequence.defaults={subdivision:"4n"},Object.defineProperty(t.Sequence.prototype,"subdivision",{get:function(){return t.Ticks(this._subdivision).toSeconds()}}),t.Sequence.prototype.at=function(e,i){return t.isArray(i)&&this.remove(e),t.Part.prototype.at.call(this,this._indexTime(e),i)},t.Sequence.prototype.add=function(e,i){if(null===i)return this;if(t.isArray(i)){var n=Math.round(this._subdivision/i.length);i=new t.Sequence(this._tick.bind(this),i,t.Ticks(n))}return t.Part.prototype.add.call(this,this._indexTime(e),i),this},t.Sequence.prototype.remove=function(e,i){return t.Part.prototype.remove.call(this,this._indexTime(e),i),this},t.Sequence.prototype._indexTime=function(e){return e instanceof t.TransportTime?e:t.Ticks(e*this._subdivision+this.startOffset).toSeconds()},t.Sequence.prototype.dispose=function(){return t.Part.prototype.dispose.call(this),this},t.Sequence}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(73),i(80)],void 0===(o=function(t){return t.Pattern=function(){var e=t.defaults(arguments,["callback","values","pattern"],t.Pattern);t.Loop.call(this,e),this._pattern=new t.CtrlPattern({values:e.values,type:e.pattern,index:e.index})},t.extend(t.Pattern,t.Loop),t.Pattern.defaults={pattern:t.CtrlPattern.Type.Up,callback:t.noOp,values:[]},t.Pattern.prototype._tick=function(t){this.callback(t,this._pattern.value),this._pattern.next()},Object.defineProperty(t.Pattern.prototype,"index",{get:function(){return this._pattern.index},set:function(t){this._pattern.index=t}}),Object.defineProperty(t.Pattern.prototype,"values",{get:function(){return this._pattern.values},set:function(t){this._pattern.values=t}}),Object.defineProperty(t.Pattern.prototype,"value",{get:function(){return this._pattern.value}}),Object.defineProperty(t.Pattern.prototype,"pattern",{get:function(){return this._pattern.type},set:function(t){this._pattern.type=t}}),t.Pattern.prototype.dispose=function(){t.Loop.prototype.dispose.call(this),this._pattern.dispose(),this._pattern=null},t.Pattern}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(18),i(12)],void 0===(o=function(t){"use strict";return t.Vibrato=function(){var e=t.defaults(arguments,["frequency","depth"],t.Vibrato);t.Effect.call(this,e),this._delayNode=new t.Delay(0,e.maxDelay),this._lfo=new t.LFO({type:e.type,min:0,max:e.maxDelay,frequency:e.frequency,phase:-90}).start().connect(this._delayNode.delayTime),this.frequency=this._lfo.frequency,this.depth=this._lfo.amplitude,this.depth.value=e.depth,this._readOnly(["frequency","depth"]),this.effectSend.chain(this._delayNode,this.effectReturn)},t.extend(t.Vibrato,t.Effect),t.Vibrato.defaults={maxDelay:.005,frequency:5,depth:.1,type:"sine"},Object.defineProperty(t.Vibrato.prototype,"type",{get:function(){return this._lfo.type},set:function(t){this._lfo.type=t}}),t.Vibrato.prototype.dispose=function(){t.Effect.prototype.dispose.call(this),this._delayNode.dispose(),this._delayNode=null,this._lfo.dispose(),this._lfo=null,this._writable(["frequency","depth"]),this.frequency=null,this.depth=null},t.Vibrato}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(12),i(15)],void 0===(o=function(t){"use strict";return t.Tremolo=function(){var e=t.defaults(arguments,["frequency","depth"],t.Tremolo);t.StereoEffect.call(this,e),this._lfoL=new t.LFO({phase:e.spread,min:1,max:0}),this._lfoR=new t.LFO({phase:e.spread,min:1,max:0}),this._amplitudeL=new t.Gain,this._amplitudeR=new t.Gain,this.frequency=new t.Signal(e.frequency,t.Type.Frequency),this.depth=new t.Signal(e.depth,t.Type.NormalRange),this._readOnly(["frequency","depth"]),this.effectSendL.chain(this._amplitudeL,this.effectReturnL),this.effectSendR.chain(this._amplitudeR,this.effectReturnR),this._lfoL.connect(this._amplitudeL.gain),this._lfoR.connect(this._amplitudeR.gain),this.frequency.fan(this._lfoL.frequency,this._lfoR.frequency),this.depth.fan(this._lfoR.amplitude,this._lfoL.amplitude),this.type=e.type,this.spread=e.spread},t.extend(t.Tremolo,t.StereoEffect),t.Tremolo.defaults={frequency:10,type:"sine",depth:.5,spread:180},t.Tremolo.prototype.start=function(t){return this._lfoL.start(t),this._lfoR.start(t),this},t.Tremolo.prototype.stop=function(t){return this._lfoL.stop(t),this._lfoR.stop(t),this},t.Tremolo.prototype.sync=function(e){return this._lfoL.sync(e),this._lfoR.sync(e),t.Transport.syncSignal(this.frequency),this},t.Tremolo.prototype.unsync=function(){return this._lfoL.unsync(),this._lfoR.unsync(),t.Transport.unsyncSignal(this.frequency),this},Object.defineProperty(t.Tremolo.prototype,"type",{get:function(){return this._lfoL.type},set:function(t){this._lfoL.type=t,this._lfoR.type=t}}),Object.defineProperty(t.Tremolo.prototype,"spread",{get:function(){return this._lfoR.phase-this._lfoL.phase},set:function(t){this._lfoL.phase=90-t/2,this._lfoR.phase=t/2+90}}),t.Tremolo.prototype.dispose=function(){return t.StereoEffect.prototype.dispose.call(this),this._writable(["frequency","depth"]),this._lfoL.dispose(),this._lfoL=null,this._lfoR.dispose(),this._lfoR=null,this._amplitudeL.dispose(),this._amplitudeL=null,this._amplitudeR.dispose(),this._amplitudeR=null,this.frequency=null,this.depth=null,this},t.Tremolo}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(75),i(1),i(5),i(13)],void 0===(o=function(t){"use strict";return t.StereoWidener=function(){var e=t.defaults(arguments,["width"],t.StereoWidener);t.MidSideEffect.call(this,e),this.width=new t.Signal(e.width,t.Type.NormalRange),this._readOnly(["width"]),this._twoTimesWidthMid=new t.Multiply(2),this._twoTimesWidthSide=new t.Multiply(2),this._midMult=new t.Multiply,this._twoTimesWidthMid.connect(this._midMult,0,1),this.midSend.chain(this._midMult,this.midReturn),this._oneMinusWidth=new t.Subtract,this._oneMinusWidth.connect(this._twoTimesWidthMid),this.context.getConstant(1).connect(this._oneMinusWidth,0,0),this.width.connect(this._oneMinusWidth,0,1),this._sideMult=new t.Multiply,this.width.connect(this._twoTimesWidthSide),this._twoTimesWidthSide.connect(this._sideMult,0,1),this.sideSend.chain(this._sideMult,this.sideReturn)},t.extend(t.StereoWidener,t.MidSideEffect),t.StereoWidener.defaults={width:.5},t.StereoWidener.prototype.dispose=function(){return t.MidSideEffect.prototype.dispose.call(this),this._writable(["width"]),this.width.dispose(),this.width=null,this._midMult.dispose(),this._midMult=null,this._sideMult.dispose(),this._sideMult=null,this._twoTimesWidthMid.dispose(),this._twoTimesWidthMid=null,this._twoTimesWidthSide.dispose(),this._twoTimesWidthSide=null,this._oneMinusWidth.dispose(),this._oneMinusWidth=null,this},t.StereoWidener}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(15),i(32),i(3)],void 0===(o=function(t){"use strict";return t.StereoFeedbackEffect=function(){var e=t.defaults(arguments,["feedback"],t.FeedbackEffect);t.StereoEffect.call(this,e),this.feedback=new t.Signal(e.feedback,t.Type.NormalRange),this._feedbackL=new t.Gain,this._feedbackR=new t.Gain,this.effectReturnL.chain(this._feedbackL,this.effectSendL),this.effectReturnR.chain(this._feedbackR,this.effectSendR),this.feedback.fan(this._feedbackL.gain,this._feedbackR.gain),this._readOnly(["feedback"])},t.extend(t.StereoFeedbackEffect,t.StereoEffect),t.StereoFeedbackEffect.prototype.dispose=function(){return t.StereoEffect.prototype.dispose.call(this),this._writable(["feedback"]),this.feedback.dispose(),this.feedback=null,this._feedbackL.dispose(),this._feedbackL=null,this._feedbackR.dispose(),this._feedbackR=null,this},t.StereoFeedbackEffect}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(78),i(9),i(10),i(39),i(3),i(76)],void 0===(o=function(t){"use strict";return t.Reverb=function(){var e=t.defaults(arguments,["decay"],t.Reverb);t.Effect.call(this,e),this._convolver=this.context.createConvolver(),this.decay=e.decay,this.preDelay=e.preDelay,this.connectEffect(this._convolver)},t.extend(t.Reverb,t.Effect),t.Reverb.defaults={decay:1.5,preDelay:.01},t.Reverb.prototype.generate=function(){return t.Offline(function(){var e=new t.Noise,i=new t.Noise,n=new t.Merge;e.connect(n.left),i.connect(n.right);var o=(new t.Gain).toMaster();n.connect(o),e.start(0),i.start(0),o.gain.setValueAtTime(0,0),o.gain.linearRampToValueAtTime(1,this.preDelay),o.gain.exponentialApproachValueAtTime(0,this.preDelay,this.decay-this.preDelay)}.bind(this),this.decay).then(function(t){return this._convolver.buffer=t.get(),this}.bind(this))},t.Reverb.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._convolver.disconnect(),this._convolver=null,this},t.Reverb}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(12),i(23),i(1),i(32),i(18)],void 0===(o=function(t){"use strict";return t.PitchShift=function(){var e=t.defaults(arguments,["pitch"],t.PitchShift);t.FeedbackEffect.call(this,e),this._frequency=new t.Signal(0),this._delayA=new t.Delay(0,1),this._lfoA=new t.LFO({min:0,max:.1,type:"sawtooth"}).connect(this._delayA.delayTime),this._delayB=new t.Delay(0,1),this._lfoB=new t.LFO({min:0,max:.1,type:"sawtooth",phase:180}).connect(this._delayB.delayTime),this._crossFade=new t.CrossFade,this._crossFadeLFO=new t.LFO({min:0,max:1,type:"triangle",phase:90}).connect(this._crossFade.fade),this._feedbackDelay=new t.Delay(e.delayTime),this.delayTime=this._feedbackDelay.delayTime,this._readOnly("delayTime"),this._pitch=e.pitch,this._windowSize=e.windowSize,this._delayA.connect(this._crossFade.a),this._delayB.connect(this._crossFade.b),this._frequency.fan(this._lfoA.frequency,this._lfoB.frequency,this._crossFadeLFO.frequency),this.effectSend.fan(this._delayA,this._delayB),this._crossFade.chain(this._feedbackDelay,this.effectReturn);var i=this.now();this._lfoA.start(i),this._lfoB.start(i),this._crossFadeLFO.start(i),this.windowSize=this._windowSize},t.extend(t.PitchShift,t.FeedbackEffect),t.PitchShift.defaults={pitch:0,windowSize:.1,delayTime:0,feedback:0},Object.defineProperty(t.PitchShift.prototype,"pitch",{get:function(){return this._pitch},set:function(e){this._pitch=e;var i=0;e<0?(this._lfoA.min=0,this._lfoA.max=this._windowSize,this._lfoB.min=0,this._lfoB.max=this._windowSize,i=t.intervalToFrequencyRatio(e-1)+1):(this._lfoA.min=this._windowSize,this._lfoA.max=0,this._lfoB.min=this._windowSize,this._lfoB.max=0,i=t.intervalToFrequencyRatio(e)-1),this._frequency.value=i*(1.2/this._windowSize)}}),Object.defineProperty(t.PitchShift.prototype,"windowSize",{get:function(){return this._windowSize},set:function(t){this._windowSize=this.toSeconds(t),this.pitch=this._pitch}}),t.PitchShift.prototype.dispose=function(){return t.FeedbackEffect.prototype.dispose.call(this),this._frequency.dispose(),this._frequency=null,this._delayA.disconnect(),this._delayA=null,this._delayB.disconnect(),this._delayB=null,this._lfoA.dispose(),this._lfoA=null,this._lfoB.dispose(),this._lfoB=null,this._crossFade.dispose(),this._crossFade=null,this._crossFadeLFO.dispose(),this._crossFadeLFO=null,this._writable("delayTime"),this._feedbackDelay.dispose(),this._feedbackDelay=null,this.delayTime=null,this},t.PitchShift}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(74),i(1),i(18)],void 0===(o=function(t){"use strict";return t.PingPongDelay=function(){var e=t.defaults(arguments,["delayTime","feedback"],t.PingPongDelay);t.StereoXFeedbackEffect.call(this,e),this._leftDelay=new t.Delay(0,e.maxDelayTime),this._rightDelay=new t.Delay(0,e.maxDelayTime),this._rightPreDelay=new t.Delay(0,e.maxDelayTime),this.delayTime=new t.Signal(e.delayTime,t.Type.Time),this.effectSendL.chain(this._leftDelay,this.effectReturnL),this.effectSendR.chain(this._rightPreDelay,this._rightDelay,this.effectReturnR),this.delayTime.fan(this._leftDelay.delayTime,this._rightDelay.delayTime,this._rightPreDelay.delayTime),this._feedbackLR.disconnect(),this._feedbackLR.connect(this._rightDelay),this._readOnly(["delayTime"])},t.extend(t.PingPongDelay,t.StereoXFeedbackEffect),t.PingPongDelay.defaults={delayTime:.25,maxDelayTime:1},t.PingPongDelay.prototype.dispose=function(){return t.StereoXFeedbackEffect.prototype.dispose.call(this),this._leftDelay.dispose(),this._leftDelay=null,this._rightDelay.dispose(),this._rightDelay=null,this._rightPreDelay.dispose(),this._rightPreDelay=null,this._writable(["delayTime"]),this.delayTime.dispose(),this.delayTime=null,this},t.PingPongDelay}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(12),i(9),i(15)],void 0===(o=function(t){"use strict";return t.Phaser=function(){var e=t.defaults(arguments,["frequency","octaves","baseFrequency"],t.Phaser);t.StereoEffect.call(this,e),this._lfoL=new t.LFO(e.frequency,0,1),this._lfoR=new t.LFO(e.frequency,0,1),this._lfoR.phase=180,this._baseFrequency=e.baseFrequency,this._octaves=e.octaves,this.Q=new t.Signal(e.Q,t.Type.Positive),this._filtersL=this._makeFilters(e.stages,this._lfoL,this.Q),this._filtersR=this._makeFilters(e.stages,this._lfoR,this.Q),this.frequency=this._lfoL.frequency,this.frequency.value=e.frequency,this.effectSendL.connect(this._filtersL[0]),this.effectSendR.connect(this._filtersR[0]),this._filtersL[e.stages-1].connect(this.effectReturnL),this._filtersR[e.stages-1].connect(this.effectReturnR),this._lfoL.frequency.connect(this._lfoR.frequency),this.baseFrequency=e.baseFrequency,this.octaves=e.octaves,this._lfoL.start(),this._lfoR.start(),this._readOnly(["frequency","Q"])},t.extend(t.Phaser,t.StereoEffect),t.Phaser.defaults={frequency:.5,octaves:3,stages:10,Q:10,baseFrequency:350},t.Phaser.prototype._makeFilters=function(e,i,n){for(var o=new Array(e),s=0;s<e;s++){var r=this.context.createBiquadFilter();r.type="allpass",n.connect(r.Q),i.connect(r.frequency),o[s]=r}return t.connectSeries.apply(t,o),o},Object.defineProperty(t.Phaser.prototype,"octaves",{get:function(){return this._octaves},set:function(t){this._octaves=t;var e=this._baseFrequency*Math.pow(2,t);this._lfoL.max=e,this._lfoR.max=e}}),Object.defineProperty(t.Phaser.prototype,"baseFrequency",{get:function(){return this._baseFrequency},set:function(t){this._baseFrequency=t,this._lfoL.min=t,this._lfoR.min=t,this.octaves=this._octaves}}),t.Phaser.prototype.dispose=function(){t.StereoEffect.prototype.dispose.call(this),this._writable(["frequency","Q"]),this.Q.dispose(),this.Q=null,this._lfoL.dispose(),this._lfoL=null,this._lfoR.dispose(),this._lfoR=null;for(var e=0;e<this._filtersL.length;e++)this._filtersL[e].disconnect(),this._filtersL[e]=null;this._filtersL=null;for(var i=0;i<this._filtersR.length;i++)this._filtersR[i].disconnect(),this._filtersR[i]=null;return this._filtersR=null,this.frequency=null,this},t.Phaser}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(58),i(15),i(26)],void 0===(o=function(t){"use strict";var e=[.06748,.06404,.08212,.09004],i=[.773,.802,.753,.733],n=[347,113,37];return t.JCReverb=function(){var o=t.defaults(arguments,["roomSize"],t.JCReverb);t.StereoEffect.call(this,o),this.roomSize=new t.Signal(o.roomSize,t.Type.NormalRange),this._scaleRoomSize=new t.Scale(-.733,.197),this._allpassFilters=[],this._feedbackCombFilters=[];for(var s=0;s<n.length;s++){var r=this.context.createBiquadFilter();r.type="allpass",r.frequency.value=n[s],this._allpassFilters.push(r)}for(var a=0;a<e.length;a++){var l=new t.FeedbackCombFilter(e[a],.1);this._scaleRoomSize.connect(l.resonance),l.resonance.value=i[a],this._allpassFilters[this._allpassFilters.length-1].connect(l),a<e.length/2?l.connect(this.effectReturnL):l.connect(this.effectReturnR),this._feedbackCombFilters.push(l)}this.roomSize.connect(this._scaleRoomSize),t.connectSeries.apply(t,this._allpassFilters),this.effectSendL.connect(this._allpassFilters[0]),this.effectSendR.connect(this._allpassFilters[0]),this._readOnly(["roomSize"])},t.extend(t.JCReverb,t.StereoEffect),t.JCReverb.defaults={roomSize:.5},t.JCReverb.prototype.dispose=function(){t.StereoEffect.prototype.dispose.call(this);for(var e=0;e<this._allpassFilters.length;e++)this._allpassFilters[e].disconnect(),this._allpassFilters[e]=null;this._allpassFilters=null;for(var i=0;i<this._feedbackCombFilters.length;i++)this._feedbackCombFilters[i].dispose(),this._feedbackCombFilters[i]=null;return this._feedbackCombFilters=null,this._writable(["roomSize"]),this.roomSize.dispose(),this.roomSize=null,this._scaleRoomSize.dispose(),this._scaleRoomSize=null,this},t.JCReverb}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(53),i(15),i(1),i(19),i(10),i(42)],void 0===(o=function(t){"use strict";var e=[1557/44100,1617/44100,1491/44100,1422/44100,1277/44100,1356/44100,1188/44100,1116/44100],i=[225,556,441,341];return t.Freeverb=function(){var n=t.defaults(arguments,["roomSize","dampening"],t.Freeverb);t.StereoEffect.call(this,n),this.roomSize=new t.Signal(n.roomSize,t.Type.NormalRange),this.dampening=new t.Signal(n.dampening,t.Type.Frequency),this._combFilters=[],this._allpassFiltersL=[],this._allpassFiltersR=[];for(var o=0;o<i.length;o++){var s=this.context.createBiquadFilter();s.type="allpass",s.frequency.value=i[o],this._allpassFiltersL.push(s)}for(var r=0;r<i.length;r++){var a=this.context.createBiquadFilter();a.type="allpass",a.frequency.value=i[r],this._allpassFiltersR.push(a)}for(var l=0;l<e.length;l++){var h=new t.LowpassCombFilter(e[l]);l<e.length/2?this.effectSendL.chain(h,this._allpassFiltersL[0]):this.effectSendR.chain(h,this._allpassFiltersR[0]),this.roomSize.connect(h.resonance),this.dampening.connect(h.dampening),this._combFilters.push(h)}t.connectSeries.apply(t,this._allpassFiltersL),t.connectSeries.apply(t,this._allpassFiltersR),this._allpassFiltersL[this._allpassFiltersL.length-1].connect(this.effectReturnL),this._allpassFiltersR[this._allpassFiltersR.length-1].connect(this.effectReturnR),this._readOnly(["roomSize","dampening"])},t.extend(t.Freeverb,t.StereoEffect),t.Freeverb.defaults={roomSize:.7,dampening:3e3},t.Freeverb.prototype.dispose=function(){t.StereoEffect.prototype.dispose.call(this);for(var e=0;e<this._allpassFiltersL.length;e++)this._allpassFiltersL[e].disconnect(),this._allpassFiltersL[e]=null;this._allpassFiltersL=null;for(var i=0;i<this._allpassFiltersR.length;i++)this._allpassFiltersR[i].disconnect(),this._allpassFiltersR[i]=null;this._allpassFiltersR=null;for(var n=0;n<this._combFilters.length;n++)this._combFilters[n].dispose(),this._combFilters[n]=null;return this._combFilters=null,this._writable(["roomSize","dampening"]),this.roomSize.dispose(),this.roomSize=null,this.dampening.dispose(),this.dampening=null,this},t.Freeverb}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(32),i(1),i(18)],void 0===(o=function(t){"use strict";return t.FeedbackDelay=function(){var e=t.defaults(arguments,["delayTime","feedback"],t.FeedbackDelay);t.FeedbackEffect.call(this,e),this._delayNode=new t.Delay(e.delayTime,e.maxDelay),this.delayTime=this._delayNode.delayTime,this.connectEffect(this._delayNode),this._readOnly(["delayTime"])},t.extend(t.FeedbackDelay,t.FeedbackEffect),t.FeedbackDelay.defaults={delayTime:.25,maxDelay:1},t.FeedbackDelay.prototype.dispose=function(){return t.FeedbackEffect.prototype.dispose.call(this),this._delayNode.dispose(),this._delayNode=null,this._writable(["delayTime"]),this.delayTime=null,this},t.FeedbackDelay}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(7)],void 0===(o=function(t){"use strict";return t.Distortion=function(){var e=t.defaults(arguments,["distortion"],t.Distortion);t.Effect.call(this,e),this._shaper=new t.WaveShaper(4096),this._distortion=e.distortion,this.connectEffect(this._shaper),this.distortion=e.distortion,this.oversample=e.oversample},t.extend(t.Distortion,t.Effect),t.Distortion.defaults={distortion:.4,oversample:"none"},Object.defineProperty(t.Distortion.prototype,"distortion",{get:function(){return this._distortion},set:function(t){this._distortion=t;var e=100*t,i=Math.PI/180;this._shaper.setMap(function(t){return Math.abs(t)<.001?0:(3+e)*t*20*i/(Math.PI+e*Math.abs(t))})}}),Object.defineProperty(t.Distortion.prototype,"oversample",{get:function(){return this._shaper.oversample},set:function(t){this._shaper.oversample=t}}),t.Distortion.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._shaper.dispose(),this._shaper=null,this},t.Distortion}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(12),i(15),i(18)],void 0===(o=function(t){"use strict";return t.Chorus=function(){var e=t.defaults(arguments,["frequency","delayTime","depth"],t.Chorus);t.StereoEffect.call(this,e),this._depth=e.depth,this._delayTime=e.delayTime/1e3,this._lfoL=new t.LFO({frequency:e.frequency,min:0,max:1}),this._lfoR=new t.LFO({frequency:e.frequency,min:0,max:1,phase:180}),this._delayNodeL=new t.Delay,this._delayNodeR=new t.Delay,this.frequency=this._lfoL.frequency,this.effectSendL.chain(this._delayNodeL,this.effectReturnL),this.effectSendR.chain(this._delayNodeR,this.effectReturnR),this.effectSendL.connect(this.effectReturnL),this.effectSendR.connect(this.effectReturnR),this._lfoL.connect(this._delayNodeL.delayTime),this._lfoR.connect(this._delayNodeR.delayTime),this._lfoL.start(),this._lfoR.start(),this._lfoL.frequency.connect(this._lfoR.frequency),this.depth=this._depth,this.frequency.value=e.frequency,this.type=e.type,this._readOnly(["frequency"]),this.spread=e.spread},t.extend(t.Chorus,t.StereoEffect),t.Chorus.defaults={frequency:1.5,delayTime:3.5,depth:.7,type:"sine",spread:180},Object.defineProperty(t.Chorus.prototype,"depth",{get:function(){return this._depth},set:function(t){this._depth=t;var e=this._delayTime*t;this._lfoL.min=Math.max(this._delayTime-e,0),this._lfoL.max=this._delayTime+e,this._lfoR.min=Math.max(this._delayTime-e,0),this._lfoR.max=this._delayTime+e}}),Object.defineProperty(t.Chorus.prototype,"delayTime",{get:function(){return 1e3*this._delayTime},set:function(t){this._delayTime=t/1e3,this.depth=this._depth}}),Object.defineProperty(t.Chorus.prototype,"type",{get:function(){return this._lfoL.type},set:function(t){this._lfoL.type=t,this._lfoR.type=t}}),Object.defineProperty(t.Chorus.prototype,"spread",{get:function(){return this._lfoR.phase-this._lfoL.phase},set:function(t){this._lfoL.phase=90-t/2,this._lfoR.phase=t/2+90}}),t.Chorus.prototype.dispose=function(){return t.StereoEffect.prototype.dispose.call(this),this._lfoL.dispose(),this._lfoL=null,this._lfoR.dispose(),this._lfoR=null,this._delayNodeL.dispose(),this._delayNodeL=null,this._delayNodeR.dispose(),this._delayNodeR=null,this._writable("frequency"),this.frequency=null,this},t.Chorus}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(7)],void 0===(o=function(t){"use strict";return t.Chebyshev=function(){var e=t.defaults(arguments,["order"],t.Chebyshev);t.Effect.call(this,e),this._shaper=new t.WaveShaper(4096),this._order=e.order,this.connectEffect(this._shaper),this.order=e.order,this.oversample=e.oversample},t.extend(t.Chebyshev,t.Effect),t.Chebyshev.defaults={order:1,oversample:"none"},t.Chebyshev.prototype._getCoefficient=function(t,e,i){return i.hasOwnProperty(e)?i[e]:(i[e]=0===e?0:1===e?t:2*t*this._getCoefficient(t,e-1,i)-this._getCoefficient(t,e-2,i),i[e])},Object.defineProperty(t.Chebyshev.prototype,"order",{get:function(){return this._order},set:function(t){this._order=t;for(var e=new Array(4096),i=e.length,n=0;n<i;++n){var o=2*n/i-1;e[n]=0===o?0:this._getCoefficient(o,t,{})}this._shaper.curve=e}}),Object.defineProperty(t.Chebyshev.prototype,"oversample",{get:function(){return this._shaper.oversample},set:function(t){this._shaper.oversample=t}}),t.Chebyshev.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._shaper.dispose(),this._shaper=null,this},t.Chebyshev}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(13),i(77)],void 0===(o=function(t){"use strict";return t.BitCrusher=function(){var e=t.defaults(arguments,["bits"],t.BitCrusher);t.Effect.call(this,e);var i=1/Math.pow(2,e.bits-1);this._subtract=new t.Subtract,this._modulo=new t.Modulo(i),this._bits=e.bits,this.effectSend.fan(this._subtract,this._modulo),this._modulo.connect(this._subtract,0,1),this._subtract.connect(this.effectReturn)},t.extend(t.BitCrusher,t.Effect),t.BitCrusher.defaults={bits:4},Object.defineProperty(t.BitCrusher.prototype,"bits",{get:function(){return this._bits},set:function(t){this._bits=t;var e=1/Math.pow(2,t-1);this._modulo.value=e}}),t.BitCrusher.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._subtract.dispose(),this._subtract=null,this._modulo.dispose(),this._modulo=null,this},t.BitCrusher}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(57),i(42),i(8),i(9)],void 0===(o=function(t){"use strict";return t.AutoWah=function(){var e=t.defaults(arguments,["baseFrequency","octaves","sensitivity"],t.AutoWah);t.Effect.call(this,e),this.follower=new t.Follower(e.follower),this._sweepRange=new t.ScaleExp(0,1,.5),this._baseFrequency=e.baseFrequency,this._octaves=e.octaves,this._inputBoost=new t.Gain,this._bandpass=new t.Filter({rolloff:-48,frequency:0,Q:e.Q}),this._peaking=new t.Filter(0,"peaking"),this._peaking.gain.value=e.gain,this.gain=this._peaking.gain,this.Q=this._bandpass.Q,this.effectSend.chain(this._inputBoost,this.follower,this._sweepRange),this._sweepRange.connect(this._bandpass.frequency),this._sweepRange.connect(this._peaking.frequency),this.effectSend.chain(this._bandpass,this._peaking,this.effectReturn),this._setSweepRange(),this.sensitivity=e.sensitivity,this._readOnly(["gain","Q"])},t.extend(t.AutoWah,t.Effect),t.AutoWah.defaults={baseFrequency:100,octaves:6,sensitivity:0,Q:2,gain:2,follower:{attack:.3,release:.5}},Object.defineProperty(t.AutoWah.prototype,"octaves",{get:function(){return this._octaves},set:function(t){this._octaves=t,this._setSweepRange()}}),Object.defineProperty(t.AutoWah.prototype,"baseFrequency",{get:function(){return this._baseFrequency},set:function(t){this._baseFrequency=t,this._setSweepRange()}}),Object.defineProperty(t.AutoWah.prototype,"sensitivity",{get:function(){return t.gainToDb(1/this._inputBoost.gain.value)},set:function(e){this._inputBoost.gain.value=1/t.dbToGain(e)}}),t.AutoWah.prototype._setSweepRange=function(){this._sweepRange.min=this._baseFrequency,this._sweepRange.max=Math.min(this._baseFrequency*Math.pow(2,this._octaves),this.context.sampleRate/2)},t.AutoWah.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this.follower.dispose(),this.follower=null,this._sweepRange.dispose(),this._sweepRange=null,this._bandpass.dispose(),this._bandpass=null,this._peaking.dispose(),this._peaking=null,this._inputBoost.dispose(),this._inputBoost=null,this._writable(["gain","Q"]),this.gain=null,this.Q=null,this},t.AutoWah}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(12),i(60)],void 0===(o=function(t){"use strict";return t.AutoPanner=function(){var e=t.defaults(arguments,["frequency"],t.AutoPanner);t.Effect.call(this,e),this._lfo=new t.LFO({frequency:e.frequency,amplitude:e.depth,min:-1,max:1}),this.depth=this._lfo.amplitude,this._panner=new t.Panner,this.frequency=this._lfo.frequency,this.connectEffect(this._panner),this._lfo.connect(this._panner.pan),this.type=e.type,this._readOnly(["depth","frequency"])},t.extend(t.AutoPanner,t.Effect),t.AutoPanner.defaults={frequency:1,type:"sine",depth:1},t.AutoPanner.prototype.start=function(t){return this._lfo.start(t),this},t.AutoPanner.prototype.stop=function(t){return this._lfo.stop(t),this},t.AutoPanner.prototype.sync=function(t){return this._lfo.sync(t),this},t.AutoPanner.prototype.unsync=function(){return this._lfo.unsync(),this},Object.defineProperty(t.AutoPanner.prototype,"type",{get:function(){return this._lfo.type},set:function(t){this._lfo.type=t}}),t.AutoPanner.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._lfo.dispose(),this._lfo=null,this._panner.dispose(),this._panner=null,this._writable(["depth","frequency"]),this.frequency=null,this.depth=null,this},t.AutoPanner}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(8),i(12),i(9)],void 0===(o=function(t){"use strict";return t.AutoFilter=function(){var e=t.defaults(arguments,["frequency","baseFrequency","octaves"],t.AutoFilter);t.Effect.call(this,e),this._lfo=new t.LFO({frequency:e.frequency,amplitude:e.depth}),this.depth=this._lfo.amplitude,this.frequency=this._lfo.frequency,this.filter=new t.Filter(e.filter),this._octaves=0,this.connectEffect(this.filter),this._lfo.connect(this.filter.frequency),this.type=e.type,this._readOnly(["frequency","depth"]),this.octaves=e.octaves,this.baseFrequency=e.baseFrequency},t.extend(t.AutoFilter,t.Effect),t.AutoFilter.defaults={frequency:1,type:"sine",depth:1,baseFrequency:200,octaves:2.6,filter:{type:"lowpass",rolloff:-12,Q:1}},t.AutoFilter.prototype.start=function(t){return this._lfo.start(t),this},t.AutoFilter.prototype.stop=function(t){return this._lfo.stop(t),this},t.AutoFilter.prototype.sync=function(t){return this._lfo.sync(t),this},t.AutoFilter.prototype.unsync=function(){return this._lfo.unsync(),this},Object.defineProperty(t.AutoFilter.prototype,"type",{get:function(){return this._lfo.type},set:function(t){this._lfo.type=t}}),Object.defineProperty(t.AutoFilter.prototype,"baseFrequency",{get:function(){return this._lfo.min},set:function(t){this._lfo.min=this.toFrequency(t),this.octaves=this._octaves}}),Object.defineProperty(t.AutoFilter.prototype,"octaves",{get:function(){return this._octaves},set:function(t){this._octaves=t,this._lfo.max=this.baseFrequency*Math.pow(2,t)}}),t.AutoFilter.prototype.dispose=function(){return t.Effect.prototype.dispose.call(this),this._lfo.dispose(),this._lfo=null,this.filter.dispose(),this.filter=null,this._writable(["frequency","depth"]),this.frequency=null,this.depth=null,this},t.AutoFilter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(23),i(10),i(19),i(1),i(22),i(28)],void 0===(o=function(t){"use strict";t.Listener=function(){t.call(this),this._orientation=[0,0,0,0,0,0],this._position=[0,0,0],t.getContext(function(){this.set(e.defaults),this.context.listener=this}.bind(this))},t.extend(t.Listener),t.Listener.defaults={positionX:0,positionY:0,positionZ:0,forwardX:0,forwardY:0,forwardZ:1,upX:0,upY:1,upZ:0},t.Listener.prototype.isListener=!0,t.Listener.prototype._rampTimeConstant=.01,t.Listener.prototype.setPosition=function(t,e,i){if(this.context.rawContext.listener.positionX){var n=this.now();this.context.rawContext.listener.positionX.setTargetAtTime(t,n,this._rampTimeConstant),this.context.rawContext.listener.positionY.setTargetAtTime(e,n,this._rampTimeConstant),this.context.rawContext.listener.positionZ.setTargetAtTime(i,n,this._rampTimeConstant)}else this.context.rawContext.listener.setPosition(t,e,i);return this._position=Array.prototype.slice.call(arguments),this},t.Listener.prototype.setOrientation=function(t,e,i,n,o,s){if(this.context.rawContext.listener.forwardX){var r=this.now();this.context.rawContext.listener.forwardX.setTargetAtTime(t,r,this._rampTimeConstant),this.context.rawContext.listener.forwardY.setTargetAtTime(e,r,this._rampTimeConstant),this.context.rawContext.listener.forwardZ.setTargetAtTime(i,r,this._rampTimeConstant),this.context.rawContext.listener.upX.setTargetAtTime(n,r,this._rampTimeConstant),this.context.rawContext.listener.upY.setTargetAtTime(o,r,this._rampTimeConstant),this.context.rawContext.listener.upZ.setTargetAtTime(s,r,this._rampTimeConstant)}else this.context.rawContext.listener.setOrientation(t,e,i,n,o,s);return this._orientation=Array.prototype.slice.call(arguments),this},Object.defineProperty(t.Listener.prototype,"positionX",{set:function(t){this._position[0]=t,this.setPosition.apply(this,this._position)},get:function(){return this._position[0]}}),Object.defineProperty(t.Listener.prototype,"positionY",{set:function(t){this._position[1]=t,this.setPosition.apply(this,this._position)},get:function(){return this._position[1]}}),Object.defineProperty(t.Listener.prototype,"positionZ",{set:function(t){this._position[2]=t,this.setPosition.apply(this,this._position)},get:function(){return this._position[2]}}),Object.defineProperty(t.Listener.prototype,"forwardX",{set:function(t){this._orientation[0]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[0]}}),Object.defineProperty(t.Listener.prototype,"forwardY",{set:function(t){this._orientation[1]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[1]}}),Object.defineProperty(t.Listener.prototype,"forwardZ",{set:function(t){this._orientation[2]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[2]}}),Object.defineProperty(t.Listener.prototype,"upX",{set:function(t){this._orientation[3]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[3]}}),Object.defineProperty(t.Listener.prototype,"upY",{set:function(t){this._orientation[4]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[4]}}),Object.defineProperty(t.Listener.prototype,"upZ",{set:function(t){this._orientation[5]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[5]}}),t.Listener.prototype.dispose=function(){return this._orientation=null,this._position=null,this};var e=t.Listener;return t.Listener=new e,t.Context.on("init",function(i){i.listener&&i.listener.isListener?t.Listener=i.listener:t.Listener=new e}),t.Listener}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(24)],void 0===(o=function(t){"use strict";return t.Draw=function(){t.call(this),this._events=new t.Timeline,this.expiration=.25,this.anticipation=.008,this._boundDrawLoop=this._drawLoop.bind(this)},t.extend(t.Draw),t.Draw.prototype.schedule=function(t,e){return this._events.add({callback:t,time:this.toSeconds(e)}),1===this._events.length&&requestAnimationFrame(this._boundDrawLoop),this},t.Draw.prototype.cancel=function(t){return this._events.cancel(this.toSeconds(t)),this},t.Draw.prototype._drawLoop=function(){for(var e=t.context.currentTime;this._events.length&&this._events.peek().time-this.anticipation<=e;){var i=this._events.shift();e-i.time<=this.expiration&&i.callback()}this._events.length>0&&requestAnimationFrame(this._boundDrawLoop)},t.Draw=new t.Draw,t.Draw}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(3)],void 0===(o=function(t){"use strict";var e={};return t.prototype.send=function(i,n){e.hasOwnProperty(i)||(e[i]=this.context.createGain()),n=t.defaultArg(n,0);var o=new t.Gain(n,t.Type.Decibels);return this.connect(o),o.connect(e[i]),o},t.prototype.receive=function(t,i){return e.hasOwnProperty(t)||(e[t]=this.context.createGain()),e[t].connect(this,0,i),this},t.Context.on("init",function(t){t.buses?e=t.buses:(e={},t.buses=e)}),t}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(4)],void 0===(o=function(t){"use strict";return t.CtrlRandom=function(){var e=t.defaults(arguments,["min","max"],t.CtrlRandom);t.call(this),this.min=e.min,this.max=e.max,this.integer=e.integer},t.extend(t.CtrlRandom),t.CtrlRandom.defaults={min:0,max:1,integer:!1},Object.defineProperty(t.CtrlRandom.prototype,"value",{get:function(){var t=this.toSeconds(this.min),e=this.toSeconds(this.max),i=Math.random(),n=i*t+(1-i)*e;return this.integer&&(n=Math.floor(n)),n}}),t.CtrlRandom}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0)],void 0===(o=function(t){"use strict";return t.CtrlMarkov=function(e,i){t.call(this),this.values=t.defaultArg(e,{}),this.value=t.defaultArg(i,Object.keys(this.values)[0])},t.extend(t.CtrlMarkov),t.CtrlMarkov.prototype.next=function(){if(this.values.hasOwnProperty(this.value)){var e=this.values[this.value];if(t.isArray(e))for(var i=this._getProbDistribution(e),n=Math.random(),o=0,s=0;s<i.length;s++){var r=i[s];if(n>o&&n<o+r){var a=e[s];t.isObject(a)?this.value=a.value:this.value=a}o+=r}else this.value=e}return this.value},t.CtrlMarkov.prototype._getProbDistribution=function(e){for(var i=[],n=0,o=!1,s=0;s<e.length;s++){var r=e[s];t.isObject(r)?(o=!0,i[s]=r.probability):i[s]=1/e.length,n+=i[s]}if(o)for(var a=0;a<i.length;a++)i[a]=i[a]/n;return i},t.CtrlMarkov.prototype.dispose=function(){this.values=null},t.CtrlMarkov}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(4)],void 0===(o=function(t){"use strict";return t.CtrlInterpolate=function(){var e=t.defaults(arguments,["values","index"],t.CtrlInterpolate);t.call(this),this.values=e.values,this.index=e.index},t.extend(t.CtrlInterpolate),t.CtrlInterpolate.defaults={index:0,values:[]},Object.defineProperty(t.CtrlInterpolate.prototype,"value",{get:function(){var t=this.index;t=Math.min(t,this.values.length-1);var e=Math.floor(t),i=this.values[e],n=this.values[Math.ceil(t)];return this._interpolate(t-e,i,n)}}),t.CtrlInterpolate.prototype._interpolate=function(e,i,n){if(t.isArray(i)){for(var o=[],s=0;s<i.length;s++)o[s]=this._interpolate(e,i[s],n[s]);return o}if(t.isObject(i)){var r={};for(var a in i)r[a]=this._interpolate(e,i[a],n[a]);return r}return(1-e)*(i=this._toNumber(i))+e*(n=this._toNumber(n))},t.CtrlInterpolate.prototype._toNumber=function(e){return t.isNumber(e)?e:this.toSeconds(e)},t.CtrlInterpolate.prototype.dispose=function(){this.values=null},t.CtrlInterpolate}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(44),i(2)],void 0===(o=function(t){return t.Waveform=function(){var e=t.defaults(arguments,["size"],t.Waveform);e.type=t.Analyser.Type.Waveform,t.AudioNode.call(this),this._analyser=this.input=this.output=new t.Analyser(e)},t.extend(t.Waveform,t.AudioNode),t.Waveform.defaults={size:1024},t.Waveform.prototype.getValue=function(){return this._analyser.getValue()},Object.defineProperty(t.Waveform.prototype,"size",{get:function(){return this._analyser.size},set:function(t){this._analyser.size=t}}),t.Waveform.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this),this._analyser.dispose(),this._analyser=null},t.Waveform}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(23),i(10),i(19),i(1),i(22),i(28),i(2)],void 0===(o=function(t){"use strict";return t.Panner3D=function(){var e=t.defaults(arguments,["positionX","positionY","positionZ"],t.Panner3D);t.AudioNode.call(this),this._panner=this.input=this.output=this.context.createPanner(),this._panner.panningModel=e.panningModel,this._panner.maxDistance=e.maxDistance,this._panner.distanceModel=e.distanceModel,this._panner.coneOuterGain=e.coneOuterGain,this._panner.coneOuterAngle=e.coneOuterAngle,this._panner.coneInnerAngle=e.coneInnerAngle,this._panner.refDistance=e.refDistance,this._panner.rolloffFactor=e.rolloffFactor,this._orientation=[e.orientationX,e.orientationY,e.orientationZ],this._position=[e.positionX,e.positionY,e.positionZ],this.orientationX=e.orientationX,this.orientationY=e.orientationY,this.orientationZ=e.orientationZ,this.positionX=e.positionX,this.positionY=e.positionY,this.positionZ=e.positionZ},t.extend(t.Panner3D,t.AudioNode),t.Panner3D.defaults={positionX:0,positionY:0,positionZ:0,orientationX:0,orientationY:0,orientationZ:0,panningModel:"equalpower",maxDistance:1e4,distanceModel:"inverse",coneOuterGain:0,coneOuterAngle:360,coneInnerAngle:360,refDistance:1,rolloffFactor:1},t.Panner3D.prototype._rampTimeConstant=.01,t.Panner3D.prototype.setPosition=function(t,e,i){if(this._panner.positionX){var n=this.now();this._panner.positionX.setTargetAtTime(t,n,this._rampTimeConstant),this._panner.positionY.setTargetAtTime(e,n,this._rampTimeConstant),this._panner.positionZ.setTargetAtTime(i,n,this._rampTimeConstant)}else this._panner.setPosition(t,e,i);return this._position=Array.prototype.slice.call(arguments),this},t.Panner3D.prototype.setOrientation=function(t,e,i){if(this._panner.orientationX){var n=this.now();this._panner.orientationX.setTargetAtTime(t,n,this._rampTimeConstant),this._panner.orientationY.setTargetAtTime(e,n,this._rampTimeConstant),this._panner.orientationZ.setTargetAtTime(i,n,this._rampTimeConstant)}else this._panner.setOrientation(t,e,i);return this._orientation=Array.prototype.slice.call(arguments),this},Object.defineProperty(t.Panner3D.prototype,"positionX",{set:function(t){this._position[0]=t,this.setPosition.apply(this,this._position)},get:function(){return this._position[0]}}),Object.defineProperty(t.Panner3D.prototype,"positionY",{set:function(t){this._position[1]=t,this.setPosition.apply(this,this._position)},get:function(){return this._position[1]}}),Object.defineProperty(t.Panner3D.prototype,"positionZ",{set:function(t){this._position[2]=t,this.setPosition.apply(this,this._position)},get:function(){return this._position[2]}}),Object.defineProperty(t.Panner3D.prototype,"orientationX",{set:function(t){this._orientation[0]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[0]}}),Object.defineProperty(t.Panner3D.prototype,"orientationY",{set:function(t){this._orientation[1]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[1]}}),Object.defineProperty(t.Panner3D.prototype,"orientationZ",{set:function(t){this._orientation[2]=t,this.setOrientation.apply(this,this._orientation)},get:function(){return this._orientation[2]}}),t.Panner3D._aliasProperty=function(e){Object.defineProperty(t.Panner3D.prototype,e,{set:function(t){this._panner[e]=t},get:function(){return this._panner[e]}})},t.Panner3D._aliasProperty("panningModel"),t.Panner3D._aliasProperty("refDistance"),t.Panner3D._aliasProperty("rolloffFactor"),t.Panner3D._aliasProperty("distanceModel"),t.Panner3D._aliasProperty("coneInnerAngle"),t.Panner3D._aliasProperty("coneOuterAngle"),t.Panner3D._aliasProperty("coneOuterGain"),t.Panner3D._aliasProperty("maxDistance"),t.Panner3D.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._panner.disconnect(),this._panner=null,this._orientation=null,this._position=null,this},t.Panner3D}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(59),i(43),i(2)],void 0===(o=function(t){"use strict";return t.MultibandCompressor=function(e){t.AudioNode.call(this),e=t.defaultArg(arguments,t.MultibandCompressor.defaults),this._splitter=this.input=new t.MultibandSplit({lowFrequency:e.lowFrequency,highFrequency:e.highFrequency}),this.lowFrequency=this._splitter.lowFrequency,this.highFrequency=this._splitter.highFrequency,this.output=new t.Gain,this.low=new t.Compressor(e.low),this.mid=new t.Compressor(e.mid),this.high=new t.Compressor(e.high),this._splitter.low.chain(this.low,this.output),this._splitter.mid.chain(this.mid,this.output),this._splitter.high.chain(this.high,this.output),this._readOnly(["high","mid","low","highFrequency","lowFrequency"])},t.extend(t.MultibandCompressor,t.AudioNode),t.MultibandCompressor.defaults={low:t.Compressor.defaults,mid:t.Compressor.defaults,high:t.Compressor.defaults,lowFrequency:250,highFrequency:2e3},t.MultibandCompressor.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._splitter.dispose(),this._writable(["high","mid","low","highFrequency","lowFrequency"]),this.low.dispose(),this.mid.dispose(),this.high.dispose(),this._splitter=null,this.low=null,this.mid=null,this.high=null,this.lowFrequency=null,this.highFrequency=null,this},t.MultibandCompressor}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(10),i(2)],void 0===(o=function(t){"use strict";return t.Mono=function(){t.AudioNode.call(this),this.createInsOuts(1,0),this._merge=this.output=new t.Merge,this.input.connect(this._merge,0,0),this.input.connect(this._merge,0,1)},t.extend(t.Mono,t.AudioNode),t.Mono.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._merge.dispose(),this._merge=null,this},t.Mono}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(52),i(51),i(43),i(2)],void 0===(o=function(t){"use strict";return t.MidSideCompressor=function(e){t.AudioNode.call(this),e=t.defaultArg(e,t.MidSideCompressor.defaults),this._midSideSplit=this.input=new t.MidSideSplit,this._midSideMerge=this.output=new t.MidSideMerge,this.mid=new t.Compressor(e.mid),this.side=new t.Compressor(e.side),this._midSideSplit.mid.chain(this.mid,this._midSideMerge.mid),this._midSideSplit.side.chain(this.side,this._midSideMerge.side),this._readOnly(["mid","side"])},t.extend(t.MidSideCompressor,t.AudioNode),t.MidSideCompressor.defaults={mid:{ratio:3,threshold:-24,release:.03,attack:.02,knee:16},side:{ratio:6,threshold:-30,release:.25,attack:.03,knee:10}},t.MidSideCompressor.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["mid","side"]),this.mid.dispose(),this.mid=null,this.side.dispose(),this.side=null,this._midSideSplit.dispose(),this._midSideSplit=null,this._midSideMerge.dispose(),this._midSideMerge=null,this},t.MidSideCompressor}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(44),i(2)],void 0===(o=function(t){"use strict";return t.Meter=function(){var e=t.defaults(arguments,["smoothing"],t.Meter);t.AudioNode.call(this),this.smoothing=e.smoothing,this._rms=0,this.input=this.output=this._analyser=new t.Analyser("waveform",256)},t.extend(t.Meter,t.AudioNode),t.Meter.defaults={smoothing:.8},t.Meter.prototype.getLevel=function(){for(var e=this._analyser.getValue(),i=0,n=0;n<e.length;n++){var o=e[n];i+=o*o}var s=Math.sqrt(i/e.length);return this._rms=Math.max(s,this._rms*this.smoothing),t.gainToDb(this._rms)},t.Meter.prototype.getValue=function(){return this._analyser.getValue()[0]},t.Meter.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._analyser.dispose(),this._analyser=null,this},t.Meter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(43),i(2)],void 0===(o=function(t){"use strict";return t.Limiter=function(){var e=t.defaults(arguments,["threshold"],t.Limiter);t.AudioNode.call(this),this._compressor=this.input=this.output=new t.Compressor({attack:.001,decay:.001,threshold:e.threshold}),this.threshold=this._compressor.threshold,this._readOnly("threshold")},t.extend(t.Limiter,t.AudioNode),t.Limiter.defaults={threshold:-12},t.Limiter.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._compressor.dispose(),this._compressor=null,this._writable("threshold"),this.threshold=null,this},t.Limiter}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(57),i(88),i(2)],void 0===(o=function(t){"use strict";return t.Gate=function(){var e=t.defaults(arguments,["threshold","smoothing"],t.Gate);t.AudioNode.call(this),this.createInsOuts(1,1),this._follower=new t.Follower(e.smoothing),this._gt=new t.GreaterThan(t.dbToGain(e.threshold)),this.input.connect(this.output),this.input.chain(this._follower,this._gt,this.output.gain)},t.extend(t.Gate,t.AudioNode),t.Gate.defaults={smoothing:.1,threshold:-40},Object.defineProperty(t.Gate.prototype,"threshold",{get:function(){return t.gainToDb(this._gt.value)},set:function(e){this._gt.value=t.dbToGain(e)}}),Object.defineProperty(t.Gate.prototype,"smoothing",{get:function(){return this._follower.smoothing},set:function(t){this._follower.smoothing=t}}),t.Gate.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._follower.dispose(),this._gt.dispose(),this._follower=null,this._gt=null,this},t.Gate}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(44),i(2)],void 0===(o=function(t){return t.FFT=function(){var e=t.defaults(arguments,["size"],t.FFT);e.type=t.Analyser.Type.FFT,t.AudioNode.call(this),this._analyser=this.input=this.output=new t.Analyser(e)},t.extend(t.FFT,t.AudioNode),t.FFT.defaults={size:1024},t.FFT.prototype.getValue=function(){return this._analyser.getValue()},Object.defineProperty(t.FFT.prototype,"size",{get:function(){return this._analyser.size},set:function(t){this._analyser.size=t}}),t.FFT.prototype.dispose=function(){t.AudioNode.prototype.dispose.call(this),this._analyser.dispose(),this._analyser=null},t.FFT}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(59),i(3),i(2)],void 0===(o=function(t){"use strict";return t.EQ3=function(){var e=t.defaults(arguments,["low","mid","high"],t.EQ3);t.AudioNode.call(this),this.output=new t.Gain,this._multibandSplit=this.input=new t.MultibandSplit({lowFrequency:e.lowFrequency,highFrequency:e.highFrequency}),this._lowGain=new t.Gain(e.low,t.Type.Decibels),this._midGain=new t.Gain(e.mid,t.Type.Decibels),this._highGain=new t.Gain(e.high,t.Type.Decibels),this.low=this._lowGain.gain,this.mid=this._midGain.gain,this.high=this._highGain.gain,this.Q=this._multibandSplit.Q,this.lowFrequency=this._multibandSplit.lowFrequency,this.highFrequency=this._multibandSplit.highFrequency,this._multibandSplit.low.chain(this._lowGain,this.output),this._multibandSplit.mid.chain(this._midGain,this.output),this._multibandSplit.high.chain(this._highGain,this.output),this._readOnly(["low","mid","high","lowFrequency","highFrequency"])},t.extend(t.EQ3,t.AudioNode),t.EQ3.defaults={low:0,mid:0,high:0,lowFrequency:400,highFrequency:2500},t.EQ3.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["low","mid","high","lowFrequency","highFrequency"]),this._multibandSplit.dispose(),this._multibandSplit=null,this.lowFrequency=null,this.highFrequency=null,this._lowGain.dispose(),this._lowGain=null,this._midGain.dispose(),this._midGain=null,this._highGain.dispose(),this._highGain=null,this.low=null,this.mid=null,this.high=null,this.Q=null,this},t.EQ3}.apply(e,n))||(t.exports=o)},function(t,e,i){var n,o;n=[i(0),i(95),i(91),i(2)],void 0===(o=function(t){return t.Channel=function(){var e=t.defaults(arguments,["volume","pan"],t.PanVol);t.AudioNode.call(this,e),this._solo=this.input=new t.Solo(e.solo),this._panVol=this.output=new t.PanVol({pan:e.pan,volume:e.volume,mute:e.mute}),this.pan=this._panVol.pan,this.volume=this._panVol.volume,this._solo.connect(this._panVol),this._readOnly(["pan","volume"])},t.extend(t.Channel,t.AudioNode),t.Channel.defaults={pan:0,volume:0,mute:!1,solo:!1},Object.defineProperty(t.Channel.prototype,"solo",{get:function(){return this._solo.solo},set:function(t){this._solo.solo=t}}),Object.defineProperty(t.Channel.prototype,"muted",{get:function(){return this._solo.muted||this.mute}}),Object.defineProperty(t.Channel.prototype,"mute",{get:function(){return this._panVol.mute},set:function(t){this._panVol.mute=t}}),t.Channel.prototype.dispose=function(){return t.AudioNode.prototype.dispose.call(this),this._writable(["pan","volume"]),this._panVol.dispose(),this._panVol=null,this.pan=null,this.volume=null,this._solo.dispose(),this._solo=null,this},t.Channel}.apply(e,n))||(t.exports=o)},function(t,e){t.exports="13.4.9"},function(t,e){var i;i=function(){return this}();try{i=i||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(i=window)}t.exports=i},function(t,e,i){i(30),i(44),i(152),i(43),i(23),i(47),i(151),i(58),i(150),i(9),i(57),i(41),i(149),i(12),i(148),i(53),i(10),i(147),i(146),i(51),i(52),i(145),i(144),i(59),i(60),i(143),i(95),i(89),i(91),i(19),i(27),i(142),i(141),i(140),i(80),i(139),i(2),i(11),i(79),i(138),i(86),i(20),i(18),i(137),i(35),i(3),i(84),i(136),i(40),i(78),i(62),i(14),i(24),i(33),i(16),i(55),i(83),i(135),i(134),i(133),i(132),i(131),i(130),i(76),i(129),i(8),i(128),i(32),i(127),i(126),i(75),i(125),i(124),i(123),i(122),i(15),i(121),i(120),i(74),i(119),i(118),i(50),i(73),i(72),i(117),i(116),i(115),i(114),i(113),i(21),i(112),i(111),i(25),i(68),i(110),i(109),i(108),i(107),i(38),i(96),i(81),i(34),i(63),i(97),i(66),i(106),i(92),i(98),i(90),i(29),i(22),i(93),i(105),i(88),i(87),i(77),i(5),i(94),i(104),i(61),i(26),i(42),i(1),i(36),i(13),i(85),i(103),i(7),i(28),i(70),i(31),i(69),i(48),i(102),i(39),i(37),i(17),i(82),i(67),i(101),i(49),i(71),i(6),i(56),i(100),i(46),i(99),i(54),i(65),i(64),i(45),i(4),t.exports=i(0)}])});

},{}],"../lib/util/Numeric.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Numeric =
/** @class */
function () {
  function Numeric() {} // calculates number sequence f inside range


  Numeric.sequence = function (f, options) {
    if (options === void 0) {
      options = {};
    }

    var value;

    var exitCase = __assign({
      exitCase: function exitCase(value, numbers) {
        return numbers.includes(value);
      }
    }, options).exitCase;

    var numbers = [].concat(options.initialValues || []);

    while (true) {
      value = f(numbers, numbers.length - 1);

      if (exitCase(value, numbers)) {
        break;
      }

      numbers.push(value);
    }

    return numbers;
  };

  Numeric.minMax = function () {
    var values = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      values[_i] = arguments[_i];
    }

    return values.sort();
  };

  Numeric.api = function (options) {
    var _this = this;

    var defaultApi = {
      init: function init(values) {
        return _this.api(__assign({}, options, _this.init(values)));
      },
      range: function range(a, b) {
        return _this.api(__assign({}, options, _this.range(a, b)));
      },
      fixed: function fixed(length) {
        return _this.api(__assign({}, options, _this.fixed(length)));
      },
      sequence: function sequence(f) {
        return _this.sequence(f, options);
      },

      /* plot: (f: PlotPoint) =>
        this.plot(f, options.plotRange, options.quantization) */
      plot: function plot(f) {
        return _this.api(__assign({}, options, {
          plotFunction: f
        }));
      },
      render: function render() {
        if (options.plotFunction) {
          return _this.plotArray(options.plotFunction, options.plotRange, options.quantization);
        }

        if (options.sequenceFunction) {
          return _this.sequence(options.sequenceFunction, options);
        }
      }
    };
    return __assign({
      inititialValues: [],
      plotRange: [-3, 3],
      quantization: 10000
    }, options, defaultApi);
  };

  Numeric.init = function (initialValues) {
    if (typeof initialValues === 'number') {
      initialValues = [initialValues];
    }

    return this.api({
      initialValues: initialValues
    });
  };

  Numeric.range = function (a, b, grain) {
    if (grain === void 0) {
      grain = 1;
    }

    var _a = this.minMax(a, b),
        min = _a[0],
        max = _a[1];

    return this.api({
      exitCase: function exitCase(value, numbers) {
        return value > max || value < min;
      },
      initialValues: [a],
      plotRange: [a, b, grain]
    });
  };

  Numeric.fixed = function (length) {
    return this.api({
      exitCase: function exitCase(value, numbers) {
        return numbers.length > length - 1;
      }
    });
  }; // calculates number sequence f inside range


  Numeric.rangeSequence = function (f, _a, initialValues) {
    var a = _a[0],
        b = _a[1];

    if (initialValues === void 0) {
      initialValues = [a];
    }

    var _b = [Math.min(a, b), Math.max(a, b)],
        min = _b[0],
        max = _b[1];

    var exitCase = function exitCase(value) {
      return value > max || value < min;
    };

    return this.sequence(f, {
      exitCase: exitCase,
      initialValues: initialValues
    });
  };

  Numeric.fixedSequence = function (f, length, initialValues) {
    if (initialValues === void 0) {
      initialValues = [];
    }

    var exitCase = function exitCase(value, numbers) {
      return numbers.length > length - 1;
    };

    return this.sequence(f, {
      exitCase: exitCase,
      initialValues: initialValues
    });
  };

  Numeric.uniqueSequence = function (f, initialValues) {
    if (initialValues === void 0) {
      initialValues = [];
    }

    var exitCase = function exitCase(value, numbers) {
      return numbers.includes(value);
    };

    return this.sequence(f, {
      exitCase: exitCase,
      initialValues: initialValues
    });
  }; // recursive fibonacci function


  Numeric.fibonacci = function (n) {
    if (n < 1) {
      return 0;
    }

    if (n < 3) {
      return 1;
    }

    return this.fibonacci(n - 2) + this.fibonacci(n - 1);
  };

  Numeric.modRange = function (number, _a) {
    var min = _a[0],
        max = _a[1];
    var value = (number - min) % max + min;

    if (value < min) {
      return max + value;
    }

    return value;
  };

  Numeric.saw = function (range, step) {
    var _this = this;

    if (step === void 0) {
      step = 1;
    }

    if (typeof range === 'number') {
      range = step >= 0 ? [1, range] : [range, 1];
    }

    var _a = this.minMax.apply(this, range),
        min = _a[0],
        max = _a[1];

    return function (s, i) {
      var value = !s.length ? range[0] : _this.modRange(s[i] + step, [min, max]); // const value = !s.length ? range[0] : ((s[i] + step - min) % max) + min;

      if (value < min) {
        return max + value;
      }

      return value;
    };
  };

  Numeric.triangle = function (_a, step) {
    var min = _a[0],
        max = _a[1];

    if (step === void 0) {
      step = 1;
    }

    var _b;

    _b = this.minMax(min, max), min = _b[0], max = _b[1];
    var init = step > 0 ? min : max;
    return function (s, i) {
      var direction = step / Math.abs(step); // inital direction

      if (!s.length) {
        return init;
      }

      if (s.length > 1) {
        direction = s[i] > s[i - 1] ? 1 : -1;
      } // are we going up or down?


      var value = s[i] + direction * Math.abs(step); // is the next value in that direction invalid?

      if (value < min || value > max) {
        return s[i] + direction * -1 * Math.abs(step);
      }

      return value;
    };
  };

  Numeric.square = function (_a) {
    var min = _a[0],
        max = _a[1];
    return function (s, i) {
      if (!s.length) {
        return min;
      }

      return s[i] === min ? max : min;
    };
  };

  Numeric.plot = function (f
  /*  | string */
  ) {
    /* if (typeof f === 'string') {
      f = this.plotFunctions[f];
    } */
    return this.api({
      plotFunction: f
    });
  }; // calculates the values of f(x) inside range with given precision


  Numeric.plotArray = function (f, range, quantization) {
    if (quantization === void 0) {
      quantization = 1000;
    }

    var values = [];
    var x = range[0];
    var grain = range[2] || 1;

    while (x <= range[1]) {
      var value = Math.round(quantization * f(x)) / quantization;

      if (value === -0) {
        value = 0;
      }

      values.push(value);
      x += grain;
    }

    return values;
  }; // calculates line points within a modulo


  Numeric.plotSaw = function (_a, firstY, length) {
    var m = _a[0],
        b = _a[1],
        mod = _a[2];

    if (firstY === void 0) {
      firstY = 0;
    }

    if (length === void 0) {
      length = mod;
    }

    var saw = function saw(m, b, mod) {
      return function (x) {
        var y = m * x % (mod - b) + b;
        return y < b ? mod + y - b : y; // subtract values outside of [b,mod] from mod
      };
    };

    var start = (firstY - b) / m; // get x value of firstY

    return this.plotArray(saw(m, b, mod), [start, start + length - 1]);
  }; // calculates linear steps of given length within a number range


  Numeric.plotPenrose = function (_a, start, step, length) {
    var min = _a[0],
        max = _a[1];

    if (start === void 0) {
      start = min;
    }

    if (step === void 0) {
      step = 1;
    }

    if (length === void 0) {
      length = max - min + 1;
    }

    return this.plotSaw([step, min, max + 1], start, length);
  };

  return Numeric;
}();

exports.Numeric = Numeric;
},{}],"../node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../node_modules/waaclock/lib/WAAClock.js":[function(require,module,exports) {
var process = require("process");
var isBrowser = (typeof window !== 'undefined')

var CLOCK_DEFAULTS = {
  toleranceLate: 0.10,
  toleranceEarly: 0.001
}

// ==================== Event ==================== //
var Event = function(clock, deadline, func) {
  this.clock = clock
  this.func = func
  this._cleared = false // Flag used to clear an event inside callback

  this.toleranceLate = clock.toleranceLate
  this.toleranceEarly = clock.toleranceEarly
  this._latestTime = null
  this._earliestTime = null
  this.deadline = null
  this.repeatTime = null

  this.schedule(deadline)
}

// Unschedules the event
Event.prototype.clear = function() {
  this.clock._removeEvent(this)
  this._cleared = true
  return this
}

// Sets the event to repeat every `time` seconds.
Event.prototype.repeat = function(time) {
  if (time === 0)
    throw new Error('delay cannot be 0')
  this.repeatTime = time
  if (!this.clock._hasEvent(this))
    this.schedule(this.deadline + this.repeatTime)
  return this
}

// Sets the time tolerance of the event.
// The event will be executed in the interval `[deadline - early, deadline + late]`
// If the clock fails to execute the event in time, the event will be dropped.
Event.prototype.tolerance = function(values) {
  if (typeof values.late === 'number')
    this.toleranceLate = values.late
  if (typeof values.early === 'number')
    this.toleranceEarly = values.early
  this._refreshEarlyLateDates()
  if (this.clock._hasEvent(this)) {
    this.clock._removeEvent(this)
    this.clock._insertEvent(this)
  }
  return this
}

// Returns true if the event is repeated, false otherwise
Event.prototype.isRepeated = function() { return this.repeatTime !== null }

// Schedules the event to be ran before `deadline`.
// If the time is within the event tolerance, we handle the event immediately.
// If the event was already scheduled at a different time, it is rescheduled.
Event.prototype.schedule = function(deadline) {
  this._cleared = false
  this.deadline = deadline
  this._refreshEarlyLateDates()

  if (this.clock.context.currentTime >= this._earliestTime) {
    this._execute()
  
  } else if (this.clock._hasEvent(this)) {
    this.clock._removeEvent(this)
    this.clock._insertEvent(this)
  
  } else this.clock._insertEvent(this)
}

Event.prototype.timeStretch = function(tRef, ratio) {
  if (this.isRepeated())
    this.repeatTime = this.repeatTime * ratio

  var deadline = tRef + ratio * (this.deadline - tRef)
  // If the deadline is too close or past, and the event has a repeat,
  // we calculate the next repeat possible in the stretched space.
  if (this.isRepeated()) {
    while (this.clock.context.currentTime >= deadline - this.toleranceEarly)
      deadline += this.repeatTime
  }
  this.schedule(deadline)
}

// Executes the event
Event.prototype._execute = function() {
  if (this.clock._started === false) return
  this.clock._removeEvent(this)

  if (this.clock.context.currentTime < this._latestTime)
    this.func(this)
  else {
    if (this.onexpired) this.onexpired(this)
    console.warn('event expired')
  }
  // In the case `schedule` is called inside `func`, we need to avoid
  // overrwriting with yet another `schedule`.
  if (!this.clock._hasEvent(this) && this.isRepeated() && !this._cleared)
    this.schedule(this.deadline + this.repeatTime) 
}

// Updates cached times
Event.prototype._refreshEarlyLateDates = function() {
  this._latestTime = this.deadline + this.toleranceLate
  this._earliestTime = this.deadline - this.toleranceEarly
}

// ==================== WAAClock ==================== //
var WAAClock = module.exports = function(context, opts) {
  var self = this
  opts = opts || {}
  this.tickMethod = opts.tickMethod || 'ScriptProcessorNode'
  this.toleranceEarly = opts.toleranceEarly || CLOCK_DEFAULTS.toleranceEarly
  this.toleranceLate = opts.toleranceLate || CLOCK_DEFAULTS.toleranceLate
  this.context = context
  this._events = []
  this._started = false
}

// ---------- Public API ---------- //
// Schedules `func` to run after `delay` seconds.
WAAClock.prototype.setTimeout = function(func, delay) {
  return this._createEvent(func, this._absTime(delay))
}

// Schedules `func` to run before `deadline`.
WAAClock.prototype.callbackAtTime = function(func, deadline) {
  return this._createEvent(func, deadline)
}

// Stretches `deadline` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `tRef`. In fact this is equivalent to changing the tempo.
WAAClock.prototype.timeStretch = function(tRef, events, ratio) {
  events.forEach(function(event) { event.timeStretch(tRef, ratio) })
  return events
}

// Removes all scheduled events and starts the clock 
WAAClock.prototype.start = function() {
  if (this._started === false) {
    var self = this
    this._started = true
    this._events = []

    if (this.tickMethod === 'ScriptProcessorNode') {
      var bufferSize = 256
      // We have to keep a reference to the node to avoid garbage collection
      this._clockNode = this.context.createScriptProcessor(bufferSize, 1, 1)
      this._clockNode.connect(this.context.destination)
      this._clockNode.onaudioprocess = function () {
        process.nextTick(function() { self._tick() })
      }
    } else if (this.tickMethod === 'manual') null // _tick is called manually

    else throw new Error('invalid tickMethod ' + this.tickMethod)
  }
}

// Stops the clock
WAAClock.prototype.stop = function() {
  if (this._started === true) {
    this._started = false
    this._clockNode.disconnect()
  }  
}

// ---------- Private ---------- //

// This function is ran periodically, and at each tick it executes
// events for which `currentTime` is included in their tolerance interval.
WAAClock.prototype._tick = function() {
  var event = this._events.shift()

  while(event && event._earliestTime <= this.context.currentTime) {
    event._execute()
    event = this._events.shift()
  }

  // Put back the last event
  if(event) this._events.unshift(event)
}

// Creates an event and insert it to the list
WAAClock.prototype._createEvent = function(func, deadline) {
  return new Event(this, deadline, func)
}

// Inserts an event to the list
WAAClock.prototype._insertEvent = function(event) {
  this._events.splice(this._indexByTime(event._earliestTime), 0, event)
}

// Removes an event from the list
WAAClock.prototype._removeEvent = function(event) {
  var ind = this._events.indexOf(event)
  if (ind !== -1) this._events.splice(ind, 1)
}

// Returns true if `event` is in queue, false otherwise
WAAClock.prototype._hasEvent = function(event) {
 return this._events.indexOf(event) !== -1
}

// Returns the index of the first event whose deadline is >= to `deadline`
WAAClock.prototype._indexByTime = function(deadline) {
  // performs a binary search
  var low = 0
    , high = this._events.length
    , mid
  while (low < high) {
    mid = Math.floor((low + high) / 2)
    if (this._events[mid]._earliestTime < deadline)
      low = mid + 1
    else high = mid
  }
  return low
}

// Converts from relative time to absolute time
WAAClock.prototype._absTime = function(relTime) {
  return relTime + this.context.currentTime
}

// Converts from absolute time to relative time 
WAAClock.prototype._relTime = function(absTime) {
  return absTime - this.context.currentTime
}
},{"process":"../node_modules/process/browser.js"}],"../node_modules/waaclock/index.js":[function(require,module,exports) {
var WAAClock = require('./lib/WAAClock')

module.exports = WAAClock
if (typeof window !== 'undefined') window.WAAClock = WAAClock

},{"./lib/WAAClock":"../node_modules/waaclock/lib/WAAClock.js"}],"../lib/Pulse.js":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var waaclock_1 = __importDefault(require("waaclock"));

var Pulse =
/** @class */
function () {
  function Pulse(props) {
    if (props === void 0) {
      props = {};
    }

    this.defaults = {
      bpm: 120,
      cycle: 4,
      delay: 0
    };
    this.events = [];
    this.callbackAtTime = false;
    this.props = Object.assign({}, this.defaults, props);
    this.context = this.props.context || new AudioContext();
    this.clock = this.props.clock || new waaclock_1.default(this.context, {
      toleranceEarly: 0.1,
      toleranceLate: 0.1
    });
  }

  Pulse.prototype.getMeasureLength = function (bpm, beatsPerMeasure) {
    if (bpm === void 0) {
      bpm = this.props.bpm;
    }

    if (beatsPerMeasure === void 0) {
      beatsPerMeasure = this.props.cycle;
    }

    return 60 / bpm * beatsPerMeasure;
  };

  Pulse.prototype.arrayPulse = function (children, length, path, start, callback, deadline) {
    var _this = this;

    if (length === void 0) {
      length = 1;
    }

    if (path === void 0) {
      path = [];
    }

    if (start === void 0) {
      start = 0;
    } //TODO: return promise on next one (for chaining)


    if (!Array.isArray(children)) {
      if (children === 0) {
        return 0;
      }

      var item_1 = {
        value: children,
        length: length,
        path: path,
        start: start,
        pulse: this,
        cycle: this.props.cycle,
        timeout: null
      };
      start += this.props.delay; // TODO: be able to add delay from arrayPulse fn directly

      if (this.callbackAtTime) {
        start += deadline ? deadline : this.context.currentTime;
        item_1.timeout = this.clock.callbackAtTime(function (event) {
          return callback(Object.assign(item_1, {
            event: event,
            deadline: event.deadline
          }));
        }, start);
      } else {
        start += (deadline || this.context.currentTime) - this.context.currentTime;
        item_1.timeout = this.clock.setTimeout(function (event) {
          return callback(Object.assign(item_1, {
            event: event,
            deadline: event.deadline
          }));
        }, start);
      }

      this.events.push(item_1.timeout);
      return item_1;
    }

    var childLength = length / children.length;
    return {
      length: length,
      children: children.map(function (el, i) {
        return _this.arrayPulse(el, childLength, path.concat([i]), start + i * childLength, callback, deadline);
      })
    };
  };

  Pulse.prototype.tickArray = function (array, callback, deadline, length) {
    var _this = this;

    array.push(1);
    var l = length || this.getMeasureLength() * array.length;
    this.start();
    return new Promise(function (resolve, reject) {
      _this.arrayPulse(array, l, [], 0, function (tick, start) {
        if (tick.path[0] === array.length - 1) {
          resolve(tick);
        } else {
          callback(tick, start);
        }
      }, deadline);
    });
  };

  Pulse.prototype.start = function () {
    // console.log('start with', this.events.length, 'events');
    var criticalEvents = 6000;

    if (this.events.length > criticalEvents) {
      console.warn('more than ', criticalEvents, 'events received. Consider using less "times" to keep the timing precies');
    }

    this.clock.start();
  };

  Pulse.prototype.stop = function () {
    this.clock.stop();
  };

  Pulse.prototype.changeTempo = function (newTempo, timeout) {
    var _this = this;

    if (timeout === void 0) {
      timeout = 0.2;
    }

    var factor = this.props.bpm / newTempo;
    this.props.bpm = newTempo;
    var events = this.events.filter(function (e) {
      return e.deadline - _this.context.currentTime > timeout;
    }); // TODO: stretch durations?!

    this.clock.timeStretch(this.context.currentTime, events, factor);
  };

  return Pulse;
}();

exports.Pulse = Pulse;
},{"waaclock":"../node_modules/waaclock/index.js"}],"../lib/sheet/Measure.js":[function(require,module,exports) {
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Sheet_1 = require("./Sheet");

var Measure =
/** @class */
function () {
  function Measure() {}

  Measure.from = function (measure) {
    // if (!Array.isArray(measure) && typeof measure !== 'object') {
    if (!Array.isArray(measure) && _typeof(measure) !== 'object') {
      return {
        body: [measure]
      };
    }

    if (Array.isArray(measure)) {
      return {
        body: [].concat(measure)
      };
    }

    return measure;
  };

  Measure.render = function (state) {
    var sheet = state.sheet,
        index = state.index,
        forms = state.forms,
        totalForms = state.totalForms;
    var measure = Measure.from(sheet[index]); // TODO: options is lost here...

    return {
      body: measure.body,
      form: totalForms - forms,
      totalForms: totalForms,
      index: index
    };
  };

  Measure.hasSign = function (sign, measure) {
    measure = Measure.from(measure);
    return !!measure.signs && measure.signs.includes(sign);
  };

  Measure.hasHouse = function (measure, number) {
    measure = Measure.from(measure);
    var house = measure.house;

    if (!house) {
      return false;
    } else if (number === undefined) {
      return true;
    }

    if (!Array.isArray(house)) {
      house = [house];
    }

    return house.includes(number);
  };

  Measure.getJumpSign = function (measure) {
    var signs = (Measure.from(measure).signs || []).filter(function (s) {
      return Object.keys(Sheet_1.Sheet.jumpSigns).includes(s);
    });

    if (signs.length > 1) {
      console.warn('measure cannot contain more than one repeat sign', measure);
    }

    return Sheet_1.Sheet.jumpSigns[signs[0]];
  };

  Measure.hasJumpSign = function (measure) {
    return Object.keys(Sheet_1.Sheet.jumpSigns).reduce(function (match, current) {
      return match || Measure.hasSign(current, measure);
    }, false);
  };

  return Measure;
}();

exports.Measure = Measure;
},{"./Sheet":"../lib/sheet/Sheet.js"}],"../lib/rhythmical/Fractions.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Fractions =
/** @class */
function () {
  function Fractions() {}

  Fractions.add = function (a, b, cancel) {
    if (cancel === void 0) {
      cancel = true;
    }

    var _a;

    var lcm = Fractions.lcm(a[1], b[1]);
    _a = [a, b].map(function (f) {
      return Fractions.setDivisor(f, lcm);
    }), a = _a[0], b = _a[1];
    var sum = [a[0] + b[0], lcm];

    if (cancel) {
      return Fractions.cancel(sum);
    }

    return sum;
  };

  Fractions.cancel = function (a) {
    return Fractions.setDivisor(a, a[1] / Fractions.gcd(a[0], a[1]));
  };

  Fractions.setDivisor = function (a, divisor) {
    return [a[0] * divisor / a[1], divisor];
  };

  Fractions.lcm = function (x, y) {
    return !x || !y ? 0 : Math.abs(x * y / Fractions.gcd(x, y));
  };

  Fractions.gcd = function (x, y) {
    x = Math.abs(x);
    y = Math.abs(y);

    while (y) {
      var t = y;
      y = x % y;
      x = t;
    }

    return x;
  };

  return Fractions;
}();

exports.Fractions = Fractions;
},{}],"../lib/rhythmical/Rhythm.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Fractions_1 = require("./Fractions");

var Rhythm =
/** @class */
function () {
  function Rhythm() {}

  Rhythm.from = function (body) {
    if (!Array.isArray(body)) {
      return [body];
    }

    return body;
  };

  Rhythm.duration = function (path, whole) {
    if (whole === void 0) {
      whole = 1;
    }

    return path.reduce(function (f, p) {
      return f / p[1];
    }, whole);
  };

  Rhythm.time = function (path, whole) {
    if (whole === void 0) {
      whole = 1;
    }

    return path.reduce(function (_a, p, i) {
      var f = _a.f,
          t = _a.t;
      return {
        f: f / p[1],
        t: t + f / p[1] * path[i][0]
      };
    }, {
      f: whole,
      t: 0
    }).t;
  };

  Rhythm.oldDuration = function (divisions, whole) {
    if (whole === void 0) {
      whole = 1;
    }

    return divisions.reduce(function (f, d) {
      return f / d;
    }, whole);
  };

  Rhythm.oldTime = function (divisions, path, whole) {
    if (whole === void 0) {
      whole = 1;
    }

    return divisions.reduce(function (_a, d, i) {
      var f = _a.f,
          p = _a.p;
      return {
        f: f / d,
        p: p + f / d * path[i]
      };
    }, {
      f: whole,
      p: 0
    }).p;
  };

  Rhythm.addPaths = function (a, b, divisions) {
    var _a; // console.warn('addPaths is deprecated');


    _a = [a, b].sort(function (a, b) {
      return b.length - a.length;
    }), a = _a[0], b = _a[1];
    var added = a.map(function (n, i) {
      return n + (b[i] || 0);
    });

    if (!divisions) {
      return added;
    }

    return Rhythm.overflow(added, divisions);
  };
  /** recalculates path inside given divisions */


  Rhythm.overflow = function (path, divisions) {
    path = [].concat(path);

    for (var i = path.length - 1; i > 0; --i) {
      if (path[i] >= divisions[i]) {
        var rest = Math.floor(path[i] / divisions[i]);
        path[i] = path[i] % divisions[i];
        path[i - 1] += rest; // todo what happens if rest is too much for path[i-1]
      }
    }

    return path;
  };

  Rhythm.calculate = function (totalLength) {
    if (totalLength === void 0) {
      totalLength = 1;
    }

    return function (_a) {
      var path = _a.path,
          value = _a.value,
          length = _a.length;

      if (typeof value === 'number') {
        length = value;
      } else {
        length = 1;
      }

      return {
        value: value,
        path: path,
        time: Rhythm.time(path, totalLength),
        duration: Rhythm.duration(path, totalLength) * length
      };
    };
  };

  Rhythm.useValueAsDuration = function (event) {
    return __assign({}, event, {
      duration: event.duration * event.value
    });
  };

  Rhythm.useValueAsLength = function (event) {
    return __assign({}, event, {
      length: event.value
    });
  };

  Rhythm.render = function (rhythm, length, useValueAsLength) {
    if (length === void 0) {
      length = 1;
    }

    if (useValueAsLength === void 0) {
      useValueAsLength = false;
    }

    return Rhythm.flat(rhythm).map(Rhythm.calculate(length)).filter(function (event) {
      return !!event.duration;
    });
  };

  Rhythm.spm = function (bpm, pulse) {
    return 60 / bpm * pulse;
  };
  /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
   * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */


  Rhythm.flatten = function (tree, path, divisions) {
    if (path === void 0) {
      path = [];
    }

    if (divisions === void 0) {
      divisions = [];
    }

    if (!Array.isArray(tree)) {
      // is primitive value
      return [{
        path: path,
        divisions: divisions,
        value: tree
      }];
    }

    return tree.reduce(function (flat, item, index) {
      return flat.concat(Rhythm.flatten(item, path.concat([index]), divisions.concat([tree.length])));
    }, []);
  };

  Rhythm.isValid = function (items) {
    return items.reduce(function (valid, item) {
      return valid && item.divisions && item.path && item.divisions.length === item.path.length;
    }, true);
  };

  Rhythm.nest = function (items, fill) {
    if (fill === void 0) {
      fill = 0;
    }

    return items.reduce(function (nested, item) {
      if (item.path[0] >= item.divisions[0]) {
        console.error("invalid path " + item.path[0] + " in divisions " + item.divisions[0] + " on item", item);
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
        } else if (item.value !== fill) {// console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item)
        }
      } else {
        nested[item.path[0]] = Rhythm.nest(items.filter(function (i) {
          return i.path.length > 1 && i.path[0] === item.path[0];
        }).map(function (i) {
          return __assign({}, i, {
            path: i.path.slice(1),
            divisions: i.divisions.slice(1)
          });
        }), fill);
      }

      return nested;
    }, []);
  };
  /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten. */


  Rhythm.expand = function (items) {
    console.warn('expand is deprecated');
    var lastSiblingIndex = -1;
    return items.reduce(function (expanded, item, index) {
      if (item.path.length === 1) {
        expanded[item.path[0]] = item.value;
      } else if (item.path[0] > lastSiblingIndex) {
        lastSiblingIndex = item.path[0];
        var siblings = items.filter(function (i, j) {
          return j >= index && i.path.length >= item.path.length;
        }).map(function (i) {
          return __assign({}, i, {
            path: i.path.slice(1)
          });
        });
        expanded[item.path[0]] = Rhythm.expand(siblings);
      }

      return expanded;
    }, []);
  };

  Rhythm.pathOf = function (value, tree) {
    var flat = Rhythm.flatten(tree);
    var match = flat.find(function (v) {
      return v.value === value;
    });

    if (match) {
      return match.path;
    }
  };

  Rhythm.simplePath = function (path) {
    return path.join('.').replace(/(\.0)*$/, ''); //.split('.');
  };

  Rhythm.haveSamePath = function (a, b) {
    return Rhythm.simplePath(a.path) === Rhythm.simplePath(b.path);
  };

  Rhythm.haveSameSlot = function (a, b) {
    return Rhythm.simplePath(a.path) === Rhythm.simplePath(b.path) && Rhythm.simplePath(a.divisions) === Rhythm.simplePath(b.divisions); //a.divisions.length === b.divisions.length
  };

  Rhythm.getPath = function (tree, path, withPath, flat) {
    if (withPath === void 0) {
      withPath = false;
    }

    if (typeof path === 'number') {
      path = [path];
    }

    flat = flat || Rhythm.flatten(tree);
    var match = flat.find(function (v) {
      var min = Math.min(path.length, v.path.length);
      return v.path.slice(0, min).join(',') === path.slice(0, min).join(',');
    });

    if (withPath) {
      return match;
    }

    return match ? match.value : undefined;
  };

  Rhythm.addPulse = function (rhythm, pulse, offset) {
    if (offset === void 0) {
      offset = 0;
    }

    var measures = Math.ceil(rhythm.length / pulse);
    return Rhythm.nest(Rhythm.flatten(rhythm).map(function (_a) {
      var value = _a.value,
          divisions = _a.divisions,
          path = _a.path;
      divisions = [measures].concat([pulse], divisions.slice(1));
      path = [Math.floor(path[0] / pulse)].concat([path[0] % pulse], path.slice(1));
      path = offset ? Rhythm.addPaths(path, [0, offset], divisions) : path;
      return {
        value: value,
        divisions: divisions,
        path: path
      };
    }));
  };
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


  Rhythm.removePulse = function (rhythm) {
    return Rhythm.nest(Rhythm.flatten(rhythm).map(function (_a) {
      var value = _a.value,
          divisions = _a.divisions,
          path = _a.path;
      return {
        value: value,
        divisions: [divisions[1] * divisions[0]].concat(divisions.slice(2)),
        path: [path[0] * divisions[1] + path[1]].concat(path.slice(2))
      };
    }));
  };

  Rhythm.nextItem = function (tree, path, move, withPath, flat) {
    if (move === void 0) {
      move = 1;
    }

    if (withPath === void 0) {
      withPath = false;
    }

    flat = Rhythm.flatten(tree);
    var match = Rhythm.getPath(tree, path, true, flat);

    if (match) {
      var index = (flat.indexOf(match) + move + flat.length) % flat.length;

      if (withPath) {
        return flat[index];
      }

      return flat[index] ? flat[index].value : undefined;
    }
  };

  Rhythm.nextValue = function (tree, value, move) {
    if (move === void 0) {
      move = 1;
    }

    var flat = Rhythm.flatten(tree);
    var match = flat.find(function (v) {
      return v.value === value;
    });

    if (match) {
      return Rhythm.nextItem(tree, match.path, move, false, flat);
    }
  };

  Rhythm.nextPath = function (tree, path, move) {
    if (move === void 0) {
      move = 1;
    }

    var flat = Rhythm.flatten(tree);

    if (!path) {
      return flat[0] ? flat[0].path : undefined;
    }

    var match = Rhythm.getPath(tree, path, true, flat);

    if (match) {
      var next = Rhythm.nextItem(tree, match.path, move, true, flat);
      return next ? next.path : undefined;
    }
  };

  Rhythm.getBlock = function (length, position, pulse) {
    if (pulse === void 0) {
      pulse = 4;
    }

    var blocks = {
      4: [4],
      2: position === 0 ? [2, 0] : [0, 2] // or any other 2 block

      /** ... */

    };
    Array(position).fill(0).concat(blocks[length]).concat(Array(pulse - position - length).fill(0));
    return blocks[length];
  };

  Rhythm.prototype.addGroove = function (items, pulse) {
    if (pulse === void 0) {
      pulse = 4;
    }

    var chordsPerBeat = pulse / items.length;

    if (chordsPerBeat < 0) {// need another grid... or just error??
    }

    if (Math.round(chordsPerBeat) !== chordsPerBeat) {// apply bjorklund to fill chords evenly
    }

    var rendered = Rhythm.render(items, pulse);
    var time = 0;
    return rendered.reduce(function (combined, chordEvent, index) {
      var _a; // const time = rendered.slice(0, index + 1).reduce((sum, track) => sum + track.duration, 0);


      combined = __assign({}, combined, (_a = {}, _a[chordEvent.value] = Rhythm.getBlock(chordEvent.duration, time), _a));
      time += chordEvent.duration;
      return combined;
    }, {});
  };
  /**
   * NEW SYNTAX
   */


  Rhythm.multiplyDivisions = function (divisions, factor) {
    return [divisions[0] * factor].concat(divisions.slice(1));
  };

  Rhythm.multiplyPath = function (path, divisions, factor) {
    path = path.map(function (v) {
      return factor * v;
    });
    return Rhythm.overflow(path, divisions);
  };

  Rhythm.multiplyEvents = function (rhythm, factor) {
    return Rhythm.fixTopLevel(rhythm.map(function (_a) {
      var value = _a.value,
          path = _a.path;
      return {
        value: value * factor,
        path: Rhythm.carry(path.map(function (f, i) {
          return [f[0] * factor, f[1] * (!i ? factor : 1) // f[1] * factor
          // f[1]
          ];
        }))
      };
    }));
  };

  Rhythm.divideEvents = function (rhythm, factor) {
    return Rhythm.multiplyEvents(rhythm, 1 / factor);
  };

  Rhythm.multiply = function (rhythm, factor) {
    return Rhythm.nested(Rhythm.multiplyEvents(Rhythm.flat(rhythm), factor));
  };

  Rhythm.divide = function (rhythm, divisor) {
    return Rhythm.multiply(rhythm, 1 / divisor);
  };

  Rhythm.maxArray = function (array) {
    if (!array || !array.length) {
      return;
    }

    return array.reduce(function (max, item) {
      return Math.max(max, item);
    }, array[0]);
  };
  /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
   * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */


  Rhythm.flat = function (rhythm, path) {
    if (path === void 0) {
      path = [];
    }

    return rhythm.reduce(function (flat, item, index) {
      if (!Array.isArray(item)) {
        return flat.concat([{
          value: item,
          path: path.concat([[index, rhythm.length]])
        }]);
      }

      return flat.concat(Rhythm.flat(item, path.concat([[index, rhythm.length]])));
    }, []);
  };

  Rhythm.nested = function (items, fill) {
    if (fill === void 0) {
      fill = 0;
    }

    return items.reduce(function (nested, item) {
      if (item.path[0][0] >= item.path[0][1]) {
        console.error("invalid path " + item.path[0] + " on item", item);
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
          console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item);
        }
      } else {
        nested[item.path[0][0]] = Rhythm.nested(items.filter(function (i) {
          return i.path.length > 1 && i.path[0][0] === item.path[0][0];
        }).map(function (i) {
          return __assign({}, i, {
            path: i.path.slice(1)
          });
        }), fill);
      }

      return nested;
    }, []);
  }; // aligns all paths to longest path length, filling each up with [0, 1]


  Rhythm.align = function () {
    var paths = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      paths[_i] = arguments[_i];
    }

    return paths.map(function (p) {
      return p.concat(Array(Rhythm.maxArray(paths.map(function (p) {
        return p.length;
      })) - p.length).fill([0, 1]));
    });
  }; // carries all fractions that are >=1 over to the next fraction to mimic notated rhythm behaviour


  Rhythm.carry = function (a) {
    a = [].concat(a);

    for (var i = a.length - 1; i > 0; --i) {
      a[i - 1][0] += Math.floor(a[i][0] / a[i][1]);
      a[i][0] = a[i][0] % a[i][1];
    }

    a[0][1] = Math.max(a[0][0] + 1, a[0][1]);
    return a;
  };

  Rhythm.add = function (a, b, cancel) {
    if (cancel === void 0) {
      cancel = false;
    }

    var _a;

    _a = Rhythm.align(a, b), a = _a[0], b = _a[1];
    return Rhythm.carry(a.map(function (f, i) {
      return Fractions_1.Fractions.add(f, b[i], cancel);
    }));
  };

  Rhythm.fixTopLevel = function (events) {
    // find max divisor on top level
    var max = Rhythm.maxArray(events.map(function (e) {
      return e.path[0][1];
    })); // use max divisor for all top levels

    return events.map(function (e) {
      return __assign({}, e, {
        path: e.path.map(function (f, i) {
          return !i ? [f[0], max] : f;
        })
      });
    });
  };
  /* Makes sure the top level is correct on all events + adds optional path to move the events */


  Rhythm.shiftEvents = function (events, path) {
    if (path) {
      events = events.map(function (e) {
        return __assign({}, e, {
          path: Rhythm.add(e.path, path)
        });
      });
    }

    return Rhythm.fixTopLevel(events).filter(function (e) {
      return !!e.value;
    });
  };

  Rhythm.shift = function (rhythm, path) {
    return Rhythm.nested(Rhythm.shiftEvents(Rhythm.flat(rhythm), path));
  };

  Rhythm.groupEvents = function (events, pulse, offset) {
    var wrapped = events.map(function (_a) {
      var value = _a.value,
          path = _a.path;
      path = [].concat([[Math.floor(path[0][0] / pulse), Math.ceil(path[0][1] / pulse)]], [[path[0][0] % pulse, pulse]], path.slice(1));
      return {
        value: value,
        path: path
      };
    });

    if (offset) {
      wrapped = Rhythm.shiftEvents(wrapped, [[0, 1], [offset, pulse]]);
    }

    return wrapped;
  };

  Rhythm.group = function (rhythm, pulse, offset) {
    return Rhythm.nested(Rhythm.groupEvents(Rhythm.flat(rhythm), pulse, offset));
  };

  Rhythm.ungroupEvents = function (events) {
    return events.map(function (_a) {
      var value = _a.value,
          path = _a.path;
      return {
        value: value,
        path: [[path[0][0] * path[1][1] + path[1][0], path[1][1] * path[0][1]]].concat(path.slice(2))
      };
    });
  };

  Rhythm.ungroup = function (rhythm) {
    return Rhythm.nested(Rhythm.ungroupEvents(Rhythm.flat(rhythm)));
  };

  Rhythm.combine = function (source, target) {
    var targetEvents = Rhythm.flat(target);
    var sourceEvents = Rhythm.flat(source);

    if (source.length > target.length) {
      targetEvents = Rhythm.shiftEvents(Rhythm.flat(target), [[0, source.length]]); // add empty bars
    } else if (target.length > source.length) {
      sourceEvents = Rhythm.shiftEvents(Rhythm.flat(source), [[0, target.length]]); // add empty bars
    }

    return Rhythm.nested(Rhythm.combineEvents(targetEvents, sourceEvents));
  };

  Rhythm.combineEvents = function (a, b) {
    return Rhythm.shiftEvents([].concat(a, b).filter(function (e) {
      return !!e.value;
    }));
  };

  Rhythm.isEqualPath = function (a, b) {
    var paths = Rhythm.align(a, b).map(function (p) {
      return JSON.stringify(p);
    });
    return paths[0] === paths[1];
  };

  Rhythm.insertEvents = function (sourceEvents, targetEvents, beat) {
    var pulses = targetEvents.map(function (e) {
      return e.path[1] ? e.path[1][1] : 1;
    });
    var beats = targetEvents[0].path[0][1] * pulses[0];

    if (beat === undefined) {
      beat = beats; // set to end if undefined
    } else if (beat < 0) {
      beat = beats + beat; // subtract from end
    } // handle negative offset


    sourceEvents = Rhythm.groupEvents(sourceEvents, pulses[0], beat);
    return Rhythm.combineEvents(targetEvents, sourceEvents);
  };

  Rhythm.insert = function (source, target, beat) {
    return Rhythm.nested(Rhythm.insertEvents(Rhythm.flat(source), Rhythm.flat(target), beat));
  };

  Rhythm.migratePath = function (divisions, path) {
    return divisions.map(function (d, index) {
      return [path ? path[index] : 0, d];
    });
  };

  return Rhythm;
}();

exports.Rhythm = Rhythm;
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
},{"./Fractions":"../lib/rhythmical/Fractions.js"}],"../lib/sheet/Sheet.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Measure_1 = require("./Measure");

var Rhythm_1 = require("../rhythmical/Rhythm");

var Sheet =
/** @class */
function () {
  function Sheet() {}

  Sheet.render = function (sheet, options) {
    if (options === void 0) {
      options = {};
    }

    var state = __assign({
      sheet: sheet,
      measures: [],
      forms: 1,
      nested: true,
      fallbackToZero: true,
      firstTime: true
    }, options);

    state = __assign({}, state, {
      totalForms: state.forms
    }, Sheet.newForm(state));
    var runs = 0;

    while (runs < 1000 && state.index < sheet.length) {
      runs++;
      state = Sheet.nextMeasure(state);
    }

    return state.measures;
  };

  Sheet.nextMeasure = function (state) {
    state = __assign({}, state, Sheet.nextSection(state)); // moves to the right house (if any)

    var sheet = state.sheet,
        index = state.index,
        measures = state.measures;
    state = __assign({}, state, {
      measures: measures.concat([Measure_1.Measure.render(state)])
    }, Sheet.nextIndex(state));
    return Sheet.nextForm(state);
  };

  Sheet.nextIndex = function (state) {
    var _a;

    var sheet = state.sheet,
        index = state.index,
        jumps = state.jumps,
        nested = state.nested,
        fallbackToZero = state.fallbackToZero,
        lastTime = state.lastTime;

    if (!Sheet.shouldJump({
      sheet: sheet,
      index: index,
      jumps: jumps,
      lastTime: lastTime
    })) {
      return {
        index: index + 1
      };
    }

    var braces = [Sheet.getJumpDestination({
      sheet: sheet,
      index: index,
      fallbackToZero: fallbackToZero,
      nested: nested
    }), index];
    jumps = Sheet.wipeKeys(jumps, [braces[0], braces[1] - 1]); // wipes indices inside braces

    return {
      index: braces[0],
      jumps: __assign({}, jumps, (_a = {}, _a[braces[1]] = (jumps[braces[1]] || 0) + 1, _a))
    };
  };

  Sheet.newForm = function (state) {
    return __assign({}, state, {
      index: 0,
      jumps: {},
      visits: {},
      lastTime: state.forms === 1
    });
  };

  Sheet.nextForm = function (state, force) {
    if (force === void 0) {
      force = false;
    }

    var sheet = state.sheet,
        index = state.index,
        forms = state.forms;

    if (force || index >= sheet.length && forms > 1) {
      return Sheet.newForm(__assign({}, state, {
        firstTime: false,
        forms: forms - 1
      }));
    }

    return state;
  }; // moves the index to the current house (if any)


  Sheet.nextSection = function (state) {
    var _a;

    var sheet = state.sheet,
        index = state.index,
        visits = state.visits,
        firstTime = state.firstTime,
        lastTime = state.lastTime; // skip intro when not firstTime

    if (!firstTime && Measure_1.Measure.from(sheet[index]).section === 'IN') {
      return {
        index: Sheet.getNextSectionIndex({
          sheet: sheet,
          index: index
        })
      };
    } // skip coda when not last time


    if (Measure_1.Measure.hasSign('Coda', sheet[index]) && !Sheet.readyForFineOrCoda(state, -1)) {
      return Sheet.nextForm(state, true);
    }

    if (!Measure_1.Measure.hasHouse(sheet[index], 1)) {
      return {};
    }

    var next = Sheet.getNextHouseIndex({
      sheet: sheet,
      index: index,
      visits: visits
    });

    if (next === -1) {
      next = index;
      visits = {}; // reset visits
    }

    return {
      visits: __assign({}, visits, (_a = {}, _a[next] = (visits[next] || 0) + 1, _a)),
      index: next
    };
  };
  /** Starts at a given index, stops when the pair functions returned equally often */


  Sheet.findPair = function (sheet, index, pairs, move, stack) {
    if (move === void 0) {
      move = 1;
    }

    if (stack === void 0) {
      stack = 0;
    }

    var match = -1; // start with no match

    while (match === -1 && index >= 0 && index < sheet.length) {
      if (pairs[0](sheet[index], {
        sheet: sheet,
        index: index
      })) {
        // same sign
        stack++;
      }

      if (pairs[1](sheet[index], {
        sheet: sheet,
        index: index
      })) {
        // pair sign
        stack--;
      }

      if (stack === 0) {
        // all pairs resolved > match!
        match = index;
      } else {
        index += move;
      }
    }

    return match;
  };

  Sheet.findMatch = function (sheet, index, find, move) {
    if (move === void 0) {
      move = 1;
    }

    var match = -1; // start with no match

    while (match === -1 && index >= 0 && index < sheet.length) {
      if (find(sheet[index], {
        sheet: sheet,
        index: index
      })) {
        match = index;
      } else {
        index += move;
      }
    }

    return match;
  }; // simple matching for brace start, ignores nested repeats


  Sheet.getJumpDestination = function (state) {
    var sheet = state.sheet,
        index = state.index,
        fallbackToZero = state.fallbackToZero,
        nested = state.nested;
    var sign = Measure_1.Measure.getJumpSign(sheet[index]); // if fine > jump till end

    if (sign.fine) {
      return sheet.length;
    } // if no pair given => da capo


    if (!sign.pair) {
      return 0;
    } // if nested mode on and opening brace is searched, use getBracePair..


    if (nested !== false && sign.pair === '{') {
      return Sheet.getBracePair({
        sheet: sheet,
        index: index,
        fallbackToZero: fallbackToZero
      });
    }

    var destination = Sheet.findMatch(sheet, index, function (m) {
      return Measure_1.Measure.hasSign(sign.pair, m);
    }, sign.move || -1); // default move back

    if (fallbackToZero) {
      // default to zero when searching repeat start (could be forgotten)
      return destination === -1 ? 0 : destination;
    }

    return destination;
  }; // returns the index of the repeat sign that pairs with the given index


  Sheet.getBracePair = function (_a) {
    var sheet = _a.sheet,
        index = _a.index,
        fallbackToZero = _a.fallbackToZero;

    if (fallbackToZero === undefined) {
      fallbackToZero = true;
    }

    if (Measure_1.Measure.hasSign('{', sheet[index])) {
      return Sheet.findPair(sheet, index, [function (m) {
        return Measure_1.Measure.hasSign('{', m);
      }, function (m) {
        return Measure_1.Measure.hasSign('}', m);
      }], 1);
    } else if (Measure_1.Measure.hasSign('}', sheet[index])) {
      var pair = Sheet.findPair(sheet, index, [function (m, state) {
        // this logic could be infinitely complex, having many side effects and interpretations
        // the current behaviour is similar to musescore or ireal handling braces
        if (!Measure_1.Measure.hasSign('}', m)) {
          return false;
        }

        if (index === state.index) {
          return true;
        }

        var relatedHouse = Sheet.getRelatedHouse({
          sheet: sheet,
          index: state.index
        });
        return relatedHouse === -1;
      }, function (m) {
        return Measure_1.Measure.hasSign('{', m);
      }], -1);

      if (fallbackToZero) {
        return pair === -1 ? 0 : pair; // default to zero when searching repeat start (could be forgotten)
      }

      return pair;
    }

    return -1;
  }; // returns true if the house at the given index has not been visited enough times


  Sheet.canVisitHouse = function (_a) {
    var sheet = _a.sheet,
        index = _a.index,
        visits = _a.visits;
    var houses = sheet[index].house;

    if (houses === undefined) {
      return false;
    }

    if (!Array.isArray(houses)) {
      houses = [houses];
    }

    var visited = visits[index] || 0;
    return visited < houses.length;
  }; // returns the next house that can be visited (from the given index)


  Sheet.getNextHouseIndex = function (_a, move) {
    var sheet = _a.sheet,
        index = _a.index,
        visits = _a.visits;

    if (move === void 0) {
      move = 1;
    }

    return Sheet.findMatch(sheet, index, function (m, step) {
      return Measure_1.Measure.hasHouse(m) && Sheet.canVisitHouse({
        sheet: sheet,
        index: step.index,
        visits: visits
      });
    }, move);
  };

  Sheet.getNextSectionIndex = function (_a, move) {
    var sheet = _a.sheet,
        index = _a.index;

    if (move === void 0) {
      move = 1;
    }

    return Sheet.findMatch(sheet, index + 1, function (m) {
      return Measure_1.Measure.from(m).section !== undefined;
    }, 1);
  }; // wipes all keys in the given range


  Sheet.wipeKeys = function (numberMap, range) {
    var wiped = {};
    Object.keys(numberMap).map(function (i) {
      return parseInt(i);
    }).filter(function (i) {
      return i < range[0] || i > range[1];
    }).forEach(function (i) {
      return wiped[i] = numberMap[i];
    });
    return wiped;
  };

  Sheet.getRelatedHouse = function (_a) {
    var sheet = _a.sheet,
        index = _a.index;
    var latestHouse = Sheet.findPair(sheet, index, [function (m, state) {
      return index === state.index || Measure_1.Measure.hasSign('}', m);
    }, function (m) {
      return Measure_1.Measure.hasHouse(m);
    }], -1);
    return latestHouse;
  };

  Sheet.isFirstHouse = function (_a) {
    var sheet = _a.sheet,
        index = _a.index;
    return Measure_1.Measure.hasHouse(sheet[index], 1);
  };

  Sheet.getAllowedJumps = function (_a) {
    var sheet = _a.sheet,
        index = _a.index;

    if (!Measure_1.Measure.hasJumpSign(sheet[index])) {
      return 0;
    }

    var measure = Measure_1.Measure.from(sheet[index]);

    if (measure.times !== undefined) {
      return measure.times;
    }

    return 1;
  };

  Sheet.readyForFineOrCoda = function (_a, move) {
    var sheet = _a.sheet,
        index = _a.index,
        jumps = _a.jumps,
        lastTime = _a.lastTime;

    if (move === void 0) {
      move = 1;
    }

    var signs = Object.keys(Sheet.jumpSigns).filter(function (s) {
      return s.includes('DC') || s.includes('DS');
    });
    var backJump = Sheet.findMatch(sheet, index, function (m) {
      return signs.reduce(function (match, sign) {
        return match || Measure_1.Measure.hasSign(sign, m);
      }, false);
    }, move);

    if (backJump === -1) {
      return lastTime; // last time
    }

    return jumps[backJump] > 0;
  };

  Sheet.shouldJump = function (_a) {
    var sheet = _a.sheet,
        index = _a.index,
        jumps = _a.jumps,
        lastTime = _a.lastTime;

    if (!Measure_1.Measure.hasJumpSign(sheet[index])) {
      return false;
    }

    var sign = Measure_1.Measure.getJumpSign(sheet[index]);

    if (sign.validator && !sign.validator({
      sheet: sheet,
      index: index,
      jumps: jumps,
      lastTime: lastTime
    })) {
      return false;
    }

    var allowedJumps = Sheet.getAllowedJumps({
      sheet: sheet,
      index: index
    });
    var timesJumped = jumps[index] || 0;
    return timesJumped < allowedJumps;
  };

  Sheet.stringify = function (measures) {
    return measures.map(function (measure) {
      return Measure_1.Measure.from(measure).body;
    });
  };

  Sheet.obfuscate = function (measures, keepFirst) {
    if (keepFirst === void 0) {
      keepFirst = true;
    }

    return measures.map(function (m) {
      return Measure_1.Measure.from(m);
    }).map(function (m, i) {
      m.body = Rhythm_1.Rhythm.from(m.body).map(function (c, j) {
        if (keepFirst && i === 0 && j === 0) {
          return c;
        }

        if (typeof c !== 'string') {
          console.warn('Sheet.obfuscate does not support nested Rhythms (yet)');
          return '';
        }

        return c.replace(/([A-G1-9a-z#b\-\^+])/g, '?');
      });
      return m;
    });
  };

  Sheet.jumpSigns = {
    '}': {
      pair: '{',
      move: -1
    },
    'DC': {},
    'DS': {
      pair: 'Segno',
      move: -1
    },
    'DS.Fine': {
      pair: 'Segno',
      move: -1
    },
    'DS.Coda': {
      pair: 'Segno',
      move: -1
    },
    'DC.Fine': {},
    'DC.Coda': {},
    'Fine': {
      fine: true,
      validator: function validator(state) {
        return Sheet.readyForFineOrCoda(state);
      }
    },
    'ToCoda': {
      pair: 'Coda',
      move: 1,
      validator: function validator(state) {
        return Sheet.readyForFineOrCoda(state);
      }
    }
  };
  Sheet.sequenceSigns = {
    rest: ['r', '0'],
    prolong: ['/', '-', '_'],
    repeat: ['%']
  };
  return Sheet;
}();

exports.Sheet = Sheet;
},{"./Measure":"../lib/sheet/Measure.js","../rhythmical/Rhythm":"../lib/rhythmical/Rhythm.js"}],"../lib/symbols.js":[function(require,module,exports) {
"use strict";

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Chord = __importStar(require("tonal-chord"));

var Scale = __importStar(require("tonal-scale"));

exports.chords = [{
  symbol: 'm',
  long: 'minor',
  short: '-',
  groups: ['Basic', 'Triads']
}, {
  symbol: 'M',
  long: 'major',
  short: '△',
  groups: ['Basic', 'Triads']
}, {
  symbol: 'o',
  groups: ['Basic', 'Symmetric', 'Triads'],
  long: 'Vermindert'
  /* short: 'o' */

}, {
  symbol: 'M#5',
  groups: ['Advanced', 'Symmetric', 'Triads'],
  short: '△#5'
}, {
  symbol: 'Msus4',
  groups: ['Advanced', 'Symmetric'],
  short: 'sus4'
}, {
  symbol: 'Msus2',
  groups: ['Advanced', 'Symmetric'],
  short: 'sus2'
}, // 5 4 64 m#5 Mb5  7no5  
{
  symbol: '7',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'Dominantsept'
}, {
  symbol: '7#11',
  groups: ['Advanced', 'Diatonic', 'Modes'],
  long: 'Dominant #11'
}, {
  symbol: 'M6',
  groups: ['Advanced'],
  long: 'major 6',
  short: '6'
}, {
  symbol: 'o7',
  groups: ['Advanced', 'Symmetric', 'Diatonic'],
  long: 'Vermindert 7'
}, {
  symbol: 'm7',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'minor 7',
  short: '-7'
}, {
  symbol: 'oM7',
  groups: ['Expert'],
  long: 'diminished major 7',
  short: 'o△7'
}, {
  symbol: 'm7b5',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'Halbvermindert',
  short: '-7b5'
}, {
  symbol: '7#5',
  groups: ['Advanced', 'Symmetric'],
  long: 'Dominantsept #5'
}, {
  symbol: 'Maj7',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'Major 7',
  short: '△7'
}, {
  symbol: 'mMaj7',
  short: '-△7',
  groups: ['Advanced', 'Diatonic']
}, {
  symbol: 'M7#5',
  groups: ['Advanced', 'Diatonic'],
  short: '△7#5'
}, {
  symbol: '7sus4',
  groups: ['Advanced']
}, {
  symbol: '9',
  groups: ['Advanced']
}, {
  symbol: 'M9',
  groups: ['Advanced'],
  short: '△9'
}, {
  symbol: 'M69',
  groups: ['Advanced'],
  short: '69'
  /*
  7b13 M7b5 m7#5 9no5  M7b6 7b5 Madd9 mb6b9 mb6M7 madd4 sus24 madd9 Maddb9 +add#9 M7sus4 7#5sus4 M#5add9 M7#5sus4
  11 m9 m6 9#5 7b9 7#9 M69 9b5 m69 mM9 7b6 m9b5 m9#5 7#11 M7b9 9b13 o7M7 M9b5 11b9 M9#5 7add6 M6#11 M7#11 7#5#9 13no5 9sus4 7#5b9 M9sus4 7sus4b9 m7add11 mMaj7b6 M9#5sus4
  13 m11 M13 9#11 13#9 13b5 13b9 m11b5 7b9#9 mM9b6 M9#11 9#5#11 7#9b13 7b9b13 13sus4 m11A 5 7#9#11 7b9#11 M69#11 7#11b13 M7#9#11 M7add13 7#5b9#11 7sus4b9b13
  m13 13#11 M13#11 13b9#11 9#11b13 13#9#11 7b9b13#11 7#9#11b13
  */

}];
exports.scales = [{
  symbol: 'major pentatonic',
  groups: ['Basic', 'Pentatonic']
}, {
  symbol: 'minor pentatonic',
  groups: ['Basic', 'Pentatonic']
}, {
  symbol: 'minor blues',
  groups: ['Basic']
}, // gregorian modes
{
  symbol: 'major',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'dorian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'phrygian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'lydian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'mixolydian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'aeolian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'locrian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'whole tone',
  groups: ['Advanced', 'Symmetric']
}, {
  symbol: 'diminished',
  groups: ['Advanced', 'Symmetric']
}, //HTGT ?
{
  symbol: 'augmented',
  groups: ['Advanced', 'Symmetric']
}, {
  symbol: 'chromatic',
  groups: ['Expert', 'Symmetric']
}, // harmonic minor modes
{
  symbol: 'harmonic minor',
  groups: ['Advanced', 'Diatonic']
}, // HM 2 locrian #6 !
{
  symbol: 'ionian augmented',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'dorian #4',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'spanish',
  groups: ['Advanced', 'Diatonic']
}, // HM 6 lydian #9
// HM 7 ???
// melodic minor modes
{
  symbol: 'melodic minor',
  groups: ['Advanced', 'Diatonic']
}, {
  symbol: 'melodic minor second mode',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'lydian augmented',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'lydian dominant',
  groups: ['Advanced', 'Diatonic'],
  long: 'mixolydian #11'
}, {
  symbol: 'melodic minor fifth mode',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'locrian #2',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'altered',
  groups: ['Advanced', 'Diatonic']
}, //non european
{
  symbol: 'kumoijoshi',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'iwato',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'pelog',
  groups: ['Exotic', 'Pentatonic']
}, // hyojo?
{
  symbol: 'egyptian',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'in-sen',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'scriabin',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'ritusen',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'hirajoshi',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'malkos raga',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'vietnamese 1',
  groups: ['Exotic', 'Pentatonic']
},
/* {
    symbol: 'vietnamese 2',
    groups: ['Exotic', 'Pentatonic'] // = minor pentatonic
}, */
{
  symbol: 'lydian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'mixolydian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'ionian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'locrian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'flat six pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'minor six pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'minor #7M pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'lydian #5P pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'whole tone pentatonic',
  groups: ['Pentatonic', 'Symmetric']
}, {
  symbol: 'flat three pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'super locrian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'major flat two pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'lydian dominant pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'neopolitan major pentatonic',
  groups: ['Pentatonic']
  /*
  mystery #1 piongio    prometheus major blues minor hexatonic six tone symmetric prometheus neopolitan
   persian  spanish  oriental flamenco balinese   todi raga enigmatic lydian #9 neopolitan locrian #2  lydian minor  locrian major  romanian minor harmonic major hungarian major hungarian minor lydian dominant   neopolitan minor neopolitan major lydian diminished leading whole tone augmented heptatonic double harmonic major double harmonic lydian melodic minor fifth mode melodic minor second mode
  bebop kafi raga  purvi raga ichikosucho bebop minor minor bebop bebop major bebop locrian bebop dominant spanish heptatonic minor six diminished
  composite blues
  */

}];
exports.symbols = {
  chords: exports.chords,
  scales: exports.scales
};
exports.levels = ['Basic', 'Advanced', 'Expert'];

function groupFilter(group) {
  return function (item) {
    var level = Math.max(item.groups.filter(function (group) {
      return exports.levels.indexOf(group) !== -1;
    }).map(function (group) {
      return exports.levels.indexOf(group) + 1;
    }));
    var groups = level > 0 ? Array.from(new Set(exports.levels.slice(level).concat(item.groups))) : item.groups;
    return groups.indexOf(group) !== -1;
  };
}

exports.groupFilter = groupFilter;

function scaleNames(group) {
  if (group === void 0) {
    group = 'Basic';
  }

  if (!group || group === 'All') {
    return Scale.names();
  }

  return exports.scales.filter(groupFilter(group)).map(function (scale) {
    return scale.symbol;
  });
}

exports.scaleNames = scaleNames;

function chordNames(group) {
  if (group === void 0) {
    group = 'Basic';
  }

  if (!group || group === 'All') {
    return Chord.names();
  }

  return exports.chords.filter(groupFilter(group)).map(function (scale) {
    return scale.symbol;
  });
}

exports.chordNames = chordNames;

function groupNames() {
  return Array.from(new Set(exports.levels.concat(exports.scales.concat(exports.chords).map(function (item) {
    return item.groups;
  }).reduce(function (groups, current) {
    return groups.concat(current);
  })))).concat(['All']);
}

exports.groupNames = groupNames;

function symbolName(type, symbol, long) {
  var pool = exports.symbols[type + 's'];
  var match = pool.find(function (item) {
    return item.symbol === symbol;
  });

  if (!match) {
    return symbol;
  }
  /* return symbol; */


  return (long ? match.long : match.short) || symbol;
}

exports.symbolName = symbolName;

function scaleName(symbol, long) {
  if (long === void 0) {
    long = false;
  }

  return symbolName('scale', symbol, long);
}

exports.scaleName = scaleName;

function chordName(symbol, long) {
  if (long === void 0) {
    long = false;
  }

  return symbolName('chord', symbol, long);
}

exports.chordName = chordName;

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

exports.randomItem = randomItem;

function randomScale(group) {
  return randomItem(scaleNames(group));
}

exports.randomScale = randomScale;

function randomChord(group) {
  return randomItem(chordNames(group));
}

exports.randomChord = randomChord;
},{"tonal-chord":"../node_modules/tonal-chord/build/es6.js","tonal-scale":"../node_modules/tonal-scale/build/es6.js"}],"../lib/util/util.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var tonal_1 = require("tonal");

var Synthesizer_1 = require("../instruments/Synthesizer");

var symbols_1 = require("../symbols");

var Harmony_1 = require("../harmony/Harmony");

var steps = {
  '1P': ['1', '8'],
  '2m': ['b9', 'b2'],
  '2M': ['9', '2'],
  '2A': ['#9', '#2'],
  '3m': ['b3'],
  '3M': ['3'],
  '4P': ['11', '4'],
  '4A': ['#11', '#4'],
  '5d': ['b5'],
  '5P': ['5'],
  '5A': ['#5'],
  '6m': ['b13', 'b6'],
  '6M': ['13', '6'],
  '7m': ['b7'],
  '7M': ['7', '^7', 'maj7']
};
/*
Lower Interval Limits (just guidelines):
2m: E3-F3
2M: Eb3-F3
3m: C3-Eb3
3M: Bb2-D3
4P: Bb2-Eb3
5D: B2-F3
5P: Bb1-F2
6m: F2-Db3
6M: F2-D3
7m: F2-Eb3
7m: F2-E3
8P: -

more rough: top note should be D3 or higher.
taken from https://www.youtube.com/watch?v=iW6YeDJklhQ
*/

function randomNumber(n) {
  return Math.floor(Math.random() * n);
}

exports.randomNumber = randomNumber;

function randomNumberInRange(a, b) {
  var _a;

  _a = [Math.min(a, b), Math.max(a, b)], a = _a[0], b = _a[1];
  return Math.floor(Math.random() * (Math.round(b) - Math.round(a) + 1)) + a;
}

exports.randomNumberInRange = randomNumberInRange;

function arraySum(array) {
  return array.reduce(function (s, i) {
    return s + i;
  }, 0);
}

exports.arraySum = arraySum;

function randomElement(array, weighted) {
  if (!weighted) {
    return array[randomNumber(array.length)];
  }

  var r = randomNumber(arraySum(weighted)) + 1;
  var total = weighted.reduce(function (abs, w, i) {
    return abs.concat(w + (abs.length ? abs[i - 1] : 0));
  }, []);
  return array[total.indexOf(total.find(function (s, i) {
    return s >= r;
  }))];
}

exports.randomElement = randomElement;

function shuffleArray(a) {
  var _a;

  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
  }

  return a;
}

exports.shuffleArray = shuffleArray;
/** OLD SHEET / RHYTHM STUFF */

/** Travels path along measures */

function getPath(path, measures, traveled) {
  if (traveled === void 0) {
    traveled = [];
  }

  if (!Array.isArray(measures[path[0]]) || path.length === 1) {
    return measures[Math.min(path[0], measures.length - 1)];
  }

  return this.getPath(path.slice(1), measures[path[0]], traveled.concat(path[0]));
}

exports.getPath = getPath;

function getDuration(divisions, noteLength, measureLength) {
  if (noteLength === void 0) {
    noteLength = 1;
  }

  if (measureLength === void 0) {
    measureLength = 1;
  }

  return noteLength * divisions.reduce(function (f, d) {
    return f / d;
  }, 1000) * measureLength; // fraction of one
}

exports.getDuration = getDuration;

function resolveChords(pattern, measures, path, divisions) {
  var _this = this;

  if (divisions === void 0) {
    divisions = [];
  }

  if (Array.isArray(pattern)) {
    // division: array of children lengths down the path (to calculate fraction)
    divisions = [].concat(divisions, [pattern.length]);
    return pattern.map(function (p, i) {
      return _this.resolveChords(p, measures, path.concat([i]), divisions);
    });
  }

  if (pattern === 0) {
    return 0;
  }

  var fraction = getDuration(divisions, pattern);

  if (fraction === 0) {
    console.warn('fraction is 0', pattern);
  }

  if (fraction === NaN) {
    console.warn('fraction NaN', divisions, pattern);
  }

  return {
    chord: this.getPath(path, measures),
    pattern: pattern,
    path: path,
    divisions: divisions,
    fraction: fraction
  };
}

exports.resolveChords = resolveChords;

function hasOff(pattern, division) {
  if (division === void 0) {
    division = 3;
  }

  return Array.isArray(pattern) && pattern.length === division && pattern[division - 1] !== 0;
}

exports.hasOff = hasOff; // replaces offs on last beat with next chord + erases next one

function offbeatReducer(settings) {
  var _this = this; // TODO: find out why some offbeats sound sketchy


  return function (measures, bar, index) {
    var last = index > 0 ? measures[index - 1] : null;

    if (last && _this.hasOff(last[settings.cycle - 1], settings.division)) {
      last[settings.cycle - 1][settings.division - 1] = bar[0];
      bar[0] = 0;
    }

    return measures.concat([bar]);
  };
}

exports.offbeatReducer = offbeatReducer;

function randomSynth(mix, allowed, settings) {
  if (allowed === void 0) {
    allowed = ['sine', 'triangle', 'square', 'sawtooth'];
  }

  if (settings === void 0) {
    settings = {};
  }

  var gains = {
    sine: 0.9,
    triangle: 0.8,
    square: 0.2,
    sawtooth: 0.3
  };
  var wave = randomElement(allowed);
  return new Synthesizer_1.Synthesizer(Object.assign({
    gain: gains[wave],
    type: wave,
    mix: mix
  }, settings));
}

exports.randomSynth = randomSynth;

function adsr(_a, time, param) {
  var attack = _a.attack,
      decay = _a.decay,
      sustain = _a.sustain,
      release = _a.release,
      gain = _a.gain,
      duration = _a.duration,
      endless = _a.endless; // console.log('adsr', attack, decay, sustain, release, gain, duration, time);

  param.linearRampToValueAtTime(gain, time + attack);
  param.setTargetAtTime(sustain * gain, time + Math.min(attack + decay, duration), decay);

  if (!endless) {
    param.setTargetAtTime(0, time + Math.max(duration - attack - decay, attack + decay, duration), release);
  }
}

exports.adsr = adsr;

function randomDelay(maxMs) {
  return Math.random() * maxMs * 2 / 1000;
}

exports.randomDelay = randomDelay;

function isInRange(note, range) {
  return tonal_1.Distance.semitones(note, range[0]) <= 0 && tonal_1.Distance.semitones(note, range[1]) >= 0;
}

exports.isInRange = isInRange;

function transposeNotes(notes, interval) {
  return notes.map(function (note) {
    return tonal_1.Distance.transpose(note, interval);
  });
}

exports.transposeNotes = transposeNotes;

function transposeToRange(notes, range, times) {
  if (times === void 0) {
    times = 0;
  }

  if (times > 10) {
    return notes;
  }

  if (notes.find(function (note) {
    return tonal_1.Distance.semitones(note, range[0]) > 0;
  })) {
    notes = notes.map(function (note) {
      return tonal_1.Distance.transpose(note, '8P');
    });
    console.log('tp up');
    return transposeToRange(notes, range, ++times);
  }

  if (notes.find(function (note) {
    return tonal_1.Distance.semitones(note, range[1]) < 0;
  })) {
    console.log('tp down');
    notes = notes.map(function (note) {
      return tonal_1.Distance.transpose(note, '-8P');
    });
    return transposeToRange(notes, range, ++times);
  }

  return notes;
}

exports.transposeToRange = transposeToRange;

function getAverageMidi(notes, offset) {
  return notes.reduce(function (sum, note) {
    return sum + Harmony_1.Harmony.getMidi(note, offset);
  }, 0) / notes.length;
}

exports.getAverageMidi = getAverageMidi;

function getDistancesToRangeEnds(notes, range) {
  if (notes.length > 2) {
    notes = [notes[0], notes[notes.length - 1]];
  }

  var midi = notes.map(function (n) {
    return Harmony_1.Harmony.getMidi(n);
  });
  var rangeMidi = range.map(function (n) {
    return Harmony_1.Harmony.getMidi(n);
  });
  return [midi[0] - rangeMidi[0], rangeMidi[1] - midi[1]];
}

exports.getDistancesToRangeEnds = getDistancesToRangeEnds;

function getRangePosition(note, range) {
  note = Harmony_1.Harmony.getMidi(note);
  range = range.map(function (n) {
    return Harmony_1.Harmony.getMidi(n);
  });
  var semitones = [note - range[0], range[1] - range[0]];
  return semitones[0] / semitones[1];
}

exports.getRangePosition = getRangePosition;

function getRangeDirection(note, range, defaultDirection, border) {
  if (defaultDirection === void 0) {
    defaultDirection = 'down';
  }

  if (border === void 0) {
    border = 0;
  }

  var position = getRangePosition(note, range);

  if (position <= border) {
    return {
      direction: 'up',
      force: true
    };
  }

  if (position >= 1 - border) {
    return {
      direction: 'down',
      force: true
    };
  }

  return {
    direction: defaultDirection,
    force: false
  };
}

exports.getRangeDirection = getRangeDirection; // accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval

function getStep(step) {
  if (typeof step === 'number' && step < 0) {
    step = 'b' + step * -1;
  }

  return step + ''; // to string
}

exports.getStep = getStep;

function getIntervalFromStep(step) {
  step = getStep(step);
  var interval = Object.keys(steps).find(function (i) {
    return steps[i].includes(step);
  });

  if (!interval) {// console.warn(`step ${step} has no defined inteval`);
  }

  return interval;
}

exports.getIntervalFromStep = getIntervalFromStep;

function getStepsFromDegree(degree) {
  return;
}

exports.getStepsFromDegree = getStepsFromDegree;

function getStepsInChord(notes, chord, min) {
  if (min === void 0) {
    min = false;
  }

  var root = tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord))[0];
  return notes.map(function (note) {
    var interval = tonal_1.Distance.interval(root, tonal_1.Note.pc(note));
    return getStepFromInterval(interval, min);
  });
}

exports.getStepsInChord = getStepsInChord;

function getStepInChord(note, chord, min) {
  if (min === void 0) {
    min = false;
  }

  return getStepFromInterval(tonal_1.Distance.interval(tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord))[0], tonal_1.Note.pc(note), min));
}

exports.getStepInChord = getStepInChord;

function getChordScales(chord, group, filter) {
  if (group === void 0) {
    group = 'Diatonic';
  }

  var tokens = tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord));
  /* const isSuperset = PcSet.isSupersetOf(Chord.intervals(tokens[1])); */

  return symbols_1.scaleNames(group).filter(function (name) {
    /* isSuperset(Scale.intervals(name)) */
    return (!filter || filter(name)) && tonal_1.PcSet.isSupersetOf(tonal_1.Chord.intervals(tokens[1]), tonal_1.Scale.intervals(name));
  });
}

exports.getChordScales = getChordScales;

function pickChordScale(chord, group) {
  if (group === void 0) {
    group = 'Diatonic';
  }

  var scales = getChordScales(chord);

  if (!scales.length) {
    console.warn("cannot pick chord scale: no scales found for chord " + chord + " in group " + group);
    return;
  }

  return scales[0];
}

exports.pickChordScale = pickChordScale;

function findDegree(degreeOrStep, intervalsOrSteps) {
  var intervals = intervalsOrSteps.map(function (i) {
    return isInterval(i) ? i : getIntervalFromStep(i);
  });

  if (typeof degreeOrStep === 'number') {
    // is degree
    var degree_1 = Math.abs(degreeOrStep);
    return intervals.find(function (i) {
      i = Harmony_1.Harmony.minInterval(i, 'up');

      if (!steps[i]) {
        console.error('interval', i, 'is not valid', intervals);
      }

      return !!steps[i].find(function (step) {
        return getDegreeFromStep(step) === degree_1;
      });
    });
  } // is step


  var step = getStep(degreeOrStep);
  return intervals.find(function (i) {
    return i.includes(step) || i === getIntervalFromStep(step);
  });
}

exports.findDegree = findDegree;

function hasDegree(degree, intervals) {
  return !!findDegree(degree, intervals);
}

exports.hasDegree = hasDegree;

function hasAllDegrees(degrees, intervals) {
  return degrees.reduce(function (res, d) {
    return res && hasDegree(d, intervals);
  }, true);
}

exports.hasAllDegrees = hasAllDegrees;

function getScaleDegree(degree, scale) {
  return findDegree(degree, tonal_1.Scale.intervals(scale));
}

exports.getScaleDegree = getScaleDegree;

function getScalePattern(pattern, scale) {
  return pattern.map(function (degree) {
    return getScaleDegree(degree, scale);
  });
}

exports.getScalePattern = getScalePattern;

function renderIntervals(intervals, root) {
  return intervals.map(function (i) {
    return tonal_1.Distance.transpose(root, i);
  });
}

exports.renderIntervals = renderIntervals;

function renderSteps(steps, root) {
  return renderIntervals(steps.map(function (step) {
    return getIntervalFromStep(step);
  }), root);
}

exports.renderSteps = renderSteps;

function permutateIntervals(intervals, pattern) {
  return pattern.map(function (d) {
    return findDegree(d, intervals);
  });
}

exports.permutateIntervals = permutateIntervals;

function getStepFromInterval(interval, min) {
  if (min === void 0) {
    min = false;
  }

  var step = steps[interval] || [];

  if (min) {
    return step[1] || step[0] || 0;
  }

  return step[0] || 0;
}

exports.getStepFromInterval = getStepFromInterval;

function getDegreeFromInterval(interval, simplify) {
  if (interval === void 0) {
    interval = '-1';
  }

  if (simplify === void 0) {
    simplify = false;
  }

  var fixed = Harmony_1.Harmony.fixInterval(interval + '', simplify) || '';
  var match = fixed.match(/[-]?([1-9])+/);

  if (!match) {
    return 0;
  }

  return Math.abs(parseInt(match[0], 10));
}

exports.getDegreeFromInterval = getDegreeFromInterval;

function getDegreeFromStep(step) {
  step = getStep(step);
  var match = step.match(/([1-9])+/);

  if (!match || !match.length) {
    return 0;
  }

  return parseInt(match[0], 10);
}

exports.getDegreeFromStep = getDegreeFromStep;

function getDegreeInChord(degree, chord) {
  chord = Harmony_1.Harmony.getTonalChord(chord);
  var intervals = tonal_1.Chord.intervals(chord);
  var tokens = tonal_1.Chord.tokenize(chord);
  return tonal_1.Distance.transpose(tokens[0], findDegree(degree, intervals));
}

exports.getDegreeInChord = getDegreeInChord;

function getPatternInChord(pattern, chord) {
  chord = Harmony_1.Harmony.getTonalChord(chord);
  var intervals = tonal_1.Chord.intervals(chord);
  var tokens = tonal_1.Chord.tokenize(chord);
  var permutation;

  if (hasAllDegrees(pattern, intervals)) {
    permutation = permutateIntervals(intervals, pattern);
  } else {
    // not all degrees of the pattern are in the chord > get scale
    var scale = pickChordScale(chord);
    permutation = permutateIntervals(tonal_1.Scale.intervals(scale), pattern);
  }

  if (tokens[0]) {
    return renderIntervals(permutation, tokens[0]);
  }

  return permutation;
}

exports.getPatternInChord = getPatternInChord; // TODO: other way around: find fixed interval pattern in a scale
// TODO: motives aka start pattern from same note in different scale
// TODO: motives aka start pattern from different note in same scale
// TODO: motives aka start pattern from different note in different scale

function getDigitalPattern(chord) {
  chord = Harmony_1.Harmony.getTonalChord(chord);
  var intervals = tonal_1.Chord.intervals(chord);

  if (intervals.includes('3m')) {
    return [1, 3, 4, 5];
  } else if (intervals.includes('3M')) {
    return [1, 2, 3, 5];
  } else {
    return [1, 1, 1, 1];
  }
}

exports.getDigitalPattern = getDigitalPattern;

function renderDigitalPattern(chord) {
  return getPatternInChord(getDigitalPattern(chord), chord);
}

exports.renderDigitalPattern = renderDigitalPattern;

function getGuideTones(chord) {
  chord = Harmony_1.Harmony.getTonalChord(chord);
  return getPatternInChord([3, 7], chord);
}

exports.getGuideTones = getGuideTones;

function isFirstInPath(path, index) {
  return path.slice(index).reduce(function (sum, value) {
    return sum + value;
  }, 0) === 0;
}

exports.isFirstInPath = isFirstInPath;

function isBarStart(path) {
  return isFirstInPath(path, 1);
}

exports.isBarStart = isBarStart;

function isFormStart(path) {
  return isFirstInPath(path, 0);
}

exports.isFormStart = isFormStart;

function isOffbeat(path) {
  return path[2] !== 0;
}

exports.isOffbeat = isOffbeat;

function otherDirection(direction, defaultDirection) {
  if (direction === 'up') {
    return 'down';
  } else if (direction === 'down') {
    return 'up';
  }

  return defaultDirection;
}

exports.otherDirection = otherDirection;

function totalDiff(diff) {
  var total = diff.reduce(function (weight, diff) {
    weight.added += diff.added ? diff.count : 0;
    weight.removed += diff.added ? diff.count : 0;
    weight.kept += !diff.added && !diff.removed ? diff.count : 0;
    return weight;
  }, {
    added: 0,
    removed: 0,
    kept: 0,
    balance: 0
  });
  total.balance = total.added - total.removed;
  total.changes = total.added + total.removed;
  return total;
}

exports.totalDiff = totalDiff;
/** Reorders the given notes to contain the given step as close as possible */

function sortByDegree(notes, degree) {
  degree = Math.max(degree, (degree + 8) % 8);
  /* const semitones = Interval.semitones(interval); */

  var diffDegrees = function diffDegrees(a, b) {
    return Math.abs(getDegreeFromInterval(tonal_1.Distance.interval(a, b) + '') - degree);
  };
  /* const diffTones = (a, b) => Math.abs(Distance.interval(a, b) - semitones); */


  notes = notes.slice(1).reduce(function (chain, note) {
    var closest = notes.filter(function (n) {
      return !chain.includes(n);
    }).sort(function (a, b) {
      return diffDegrees(chain[0], a) < diffDegrees(chain[0], b) ? -1 : 1;
    });
    chain.unshift(closest[0]);
    return chain;
  }, [notes[0]]).reverse();
  return notes;
}

exports.sortByDegree = sortByDegree;
/** Returns the given notes with octaves either moving bottom up or top down */

function renderAbsoluteNotes(notes, octave, direction) {
  if (octave === void 0) {
    octave = 3;
  }

  if (direction === void 0) {
    direction = 'up';
  }

  return notes.reduce(function (absolute, current, index, notes) {
    if (index === 0) {
      return [current + octave];
    }

    var interval = tonal_1.Distance.interval(notes[index - 1], current);
    interval = Harmony_1.Harmony.minInterval(interval, direction);

    if (interval === '1P') {
      interval = direction === 'down' ? '-8P' : '8P';
    }

    absolute.push(tonal_1.Distance.transpose(absolute[index - 1], interval + ''));
    return absolute;
  }, []);
}

exports.renderAbsoluteNotes = renderAbsoluteNotes;

function getIntervals(notes) {
  return notes.reduce(function (intervals, note, index, notes) {
    if (index === 0) {
      return [];
    }

    intervals.push(tonal_1.Distance.interval(notes[index - 1], note));
    return intervals;
  }, []);
}

exports.getIntervals = getIntervals;

function isInterval(interval) {
  return typeof tonal_1.Interval.semitones(interval) === 'number';
}

exports.isInterval = isInterval;

function smallestInterval(intervals) {
  return intervals.reduce(function (min, current) {
    if (!min || tonal_1.Interval.semitones(current) < tonal_1.Interval.semitones(min)) {
      return current;
    }

    return min;
  });
}

exports.smallestInterval = smallestInterval;

function sortNotes(notes, direction) {
  if (direction === void 0) {
    direction = 'up';
  }

  return notes.sort(function (a, b) {
    return Harmony_1.Harmony.getMidi(a) - Harmony_1.Harmony.getMidi(b);
  });
}

exports.sortNotes = sortNotes;

function analyzeVoicing(notes, root) {
  if (!notes || notes.length < 2) {
    throw new Error('Can only analyze Voicing with at least two notes');
  }

  notes = sortNotes(notes);
  root = root || notes[0]; // TODO: get degrees

  var intervals = getIntervals(notes);
  var sortedIntervals = intervals.sort(Harmony_1.Harmony.sortMinInterval());
  return {
    notes: notes,
    minInterval: sortedIntervals[0],
    maxInterval: sortedIntervals[sortedIntervals.length - 1],
    intervals: intervals,
    spread: tonal_1.Distance.interval(notes[0], notes[notes.length - 1])
  };
}

exports.analyzeVoicing = analyzeVoicing;

function semitoneDifference(intervals) {
  return intervals.reduce(function (semitones, interval) {
    return semitones + Math.abs(tonal_1.Interval.semitones(interval));
  }, 0);
}

exports.semitoneDifference = semitoneDifference;

function semitoneMovement(intervals) {
  return intervals.reduce(function (semitones, interval) {
    return semitones + tonal_1.Interval.semitones(interval);
  }, 0);
}

exports.semitoneMovement = semitoneMovement;

function longestChild(array) {
  return array.reduce(function (max, current) {
    return current.length > max.length ? current : max;
  }, array[0]);
}

exports.longestChild = longestChild;

function maxArray(array) {
  if (!array || !array.length) {
    return;
  }

  return array.reduce(function (max, item) {
    return Math.max(max, item);
  }, array[0]);
}

exports.maxArray = maxArray;

function avgArray(array) {
  if (!array || !array.length) {
    return;
  }

  return array.reduce(function (sum, item) {
    return sum + item;
  }, 0) / array.length;
}

exports.avgArray = avgArray;

function humanize(value, amount, offset) {
  if (amount === void 0) {
    amount = 0.01;
  }

  if (offset === void 0) {
    offset = 0;
  }

  return value + (Math.random() - 0.5) * 2 * amount + offset;
}

exports.humanize = humanize;

function isPitchClass(note) {
  return tonal_1.Note.pc(note) === note;
}

exports.isPitchClass = isPitchClass;

function mapTree(tree, modifier, simplify, path, siblings, position) {
  if (simplify === void 0) {
    simplify = false;
  }

  if (path === void 0) {
    path = [];
  }

  if (siblings === void 0) {
    siblings = [];
  }

  if (position === void 0) {
    position = 0;
  } // skip current tree if only one child


  if (simplify && Array.isArray(tree) && tree.length === 1) {
    return mapTree(tree[0], modifier, simplify, path, siblings, position);
  }

  var fraction = siblings.reduce(function (f, d) {
    return f / d;
  }, 1);

  if (!Array.isArray(tree)) {
    return modifier ? modifier(tree, {
      path: path,
      siblings: siblings,
      fraction: fraction,
      position: position
    }) : tree;
  }

  if (Array.isArray(tree)) {
    siblings = siblings.concat([tree.length]);
    fraction = fraction / tree.length;
    return tree.map(function (subtree, index) {
      return mapTree(subtree, modifier, simplify, path.concat([index]), siblings, position + index * fraction);
    });
  }
}

exports.mapTree = mapTree;

function flattenTree(tree) {
  var flat = [];
  mapTree(tree, function (value, props) {
    return flat.push(Object.assign(props, {
      value: value
    }));
  });
  return flat;
}

exports.flattenTree = flattenTree;

function expandTree(tree) {// TODO
}

exports.expandTree = expandTree;
/* Returns true if the given intervals are all present in the chords interval structure
Intervals can be appendend with "?" to indicate that those degrees could also be omitted
(but when present they should match)
*/

function chordHasIntervals(chord, intervals) {
  chord = Harmony_1.Harmony.getTonalChord(chord);
  var has = tonal_1.Chord.intervals(chord);
  return intervals.reduce(function (match, current) {
    var isOptional = current.includes('?');
    var isForbidden = current.includes('!');

    if (isOptional) {
      current = current.replace('?', '');
      return (!hasDegree(getDegreeFromInterval(current), has) || has.includes(current)) && match;
    }

    if (isForbidden) {
      current = current.replace('!', '');
      return !hasDegree(getDegreeFromInterval(current), has);
    }

    return has.includes(current) && match;
  }, true);
}

exports.chordHasIntervals = chordHasIntervals;

function isDominantChord(chord) {
  return chordHasIntervals(chord, ['3M', '7m']) || chordHasIntervals(chord, ['!3', '4P', '7m']);
}

exports.isDominantChord = isDominantChord;

function isMajorChord(chord) {
  return chordHasIntervals(chord, ['3M', '7M?']);
}

exports.isMajorChord = isMajorChord;

function isMinorChord(chord) {
  return chordHasIntervals(chord, ['3m']);
}

exports.isMinorChord = isMinorChord;

function isMinorTonic(chord) {
  return chordHasIntervals(chord, ['3m', '5P', '13M?', '7M?']);
}

exports.isMinorTonic = isMinorTonic;

function getChordType(chord) {
  if (isDominantChord(chord)) {
    return 'dominant';
  }

  if (isMajorChord(chord)) {
    return 'major';
  }

  if (isMinorTonic(chord)) {
    return 'minor-tonic';
  }

  if (isMinorChord(chord)) {
    return 'minor';
  }
}

exports.getChordType = getChordType;

function getChordNotes(chord, validate) {
  chord = Harmony_1.Harmony.getTonalChord(chord);
  var tokens = tonal_1.Chord.tokenize(chord);
  var notes = tonal_1.Chord.notes(chord);
  return notes.filter(function (note) {
    var interval = tonal_1.Distance.interval(tokens[0], note);
    return !validate || validate(note, {
      root: tokens[0],
      symbol: tokens[1],
      interval: interval,
      step: getStepFromInterval(interval),
      degree: getDegreeFromInterval(interval + '')
    });
  });
}

exports.getChordNotes = getChordNotes;

function validateWithoutRoot(note, _a) {
  var degree = _a.degree;
  return degree !== 1;
}

exports.validateWithoutRoot = validateWithoutRoot; // OLD...

function getVoicing(chord, _a) {
  var _b = _a === void 0 ? {} : _a,
      voices = _b.voices,
      previousVoicing = _b.previousVoicing,
      omitRoot = _b.omitRoot,
      quartal = _b.quartal;

  chord = Harmony_1.Harmony.getTonalChord(chord);
  var tokens = tonal_1.Chord.tokenize(chord);
  var notes = tonal_1.Chord.notes(chord);

  if (omitRoot) {
    notes = notes.filter(function (n) {
      return n !== tokens[0];
    });
  }

  if (quartal) {}

  if (previousVoicing) {}

  return notes;
}

exports.getVoicing = getVoicing;

function semitoneDistance(noteA, noteB) {
  return tonal_1.Interval.semitones(tonal_1.Distance.interval(noteA, noteB) + '');
}

exports.semitoneDistance = semitoneDistance;

function noteArray(range) {
  var slots = tonal_1.Interval.semitones(tonal_1.Distance.interval(range[0], range[1]) + '');
  return new Array(slots + 1).fill('').map(function (v, i) {
    return tonal_1.Distance.transpose(range[0], tonal_1.Interval.fromSemitones(i)) + '';
  }).map(function (n) {
    return tonal_1.Note.simplify(n);
  });
}

exports.noteArray = noteArray;

function factorial(n) {
  var value = 1;

  for (var i = 2; i <= n; ++i) {
    value *= i;
  }

  return value;
}

exports.factorial = factorial; // finds best combination following the given notes, based on minimal movement

/* export function bestCombination(notes, combinations = []) {
    return combinations.reduce((best, current) => {
        const currentMovement = voicingDifference(notes, current);
        const bestMovement = voicingDifference(notes, best);
        if (Math.abs(currentMovement) < Math.abs(bestMovement)) {
            return current;
        }
        return best;
    });
} */

/* export function sortCombinationsByMovement(notes, combinations, direction: intervalDirection = 'up', min = true) {
    const movements = combinations.map((combination) => ({
        movement: voicingMovement(notes, combination, min),
        combination
    }));
    let right = movements.filter(move => direction === 'up' ? move >= 0 : move <= 0);
    if (!right.length) {
        right = movements;
    }
    let sorted = right.sort((a, b) => a.movement - b.movement);
    if (direction === 'down') {
        sorted = sorted.reverse();
    }
    return sorted.map(movement => movement.combination);
}
 */
},{"tonal":"../node_modules/tonal/index.js","../instruments/Synthesizer":"../lib/instruments/Synthesizer.js","../symbols":"../lib/symbols.js","../harmony/Harmony":"../lib/harmony/Harmony.js"}],"../lib/harmony/Harmony.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var tonal_1 = require("tonal");

var tonal_2 = require("tonal");

var tonal_3 = require("tonal");

var tonal_4 = require("tonal");

var util_1 = require("../util/util");

var Measure_1 = require("../sheet/Measure");

var Rhythm_1 = require("../rhythmical/Rhythm");

var Harmony =
/** @class */
function () {
  function Harmony() {}

  Harmony.isBlack = function (note) {
    return tonal_1.Note.props(note)['acc'] !== '';
  };

  Harmony.hasSamePitch = function (noteA, noteB, ignoreOctave) {
    if (ignoreOctave === void 0) {
      ignoreOctave = false;
    }

    if (ignoreOctave || util_1.isPitchClass(noteA) || util_1.isPitchClass(noteB)) {
      return tonal_1.Note.props(noteA).chroma === tonal_1.Note.props(noteB).chroma;
    }

    return tonal_1.Note.midi(noteA) === tonal_1.Note.midi(noteB);
  };

  Harmony.getTonalChord = function (chord) {
    if (!chord) {
      return null;
    }

    var root = Harmony.getBassNote(chord, true) || '';
    var symbol = chord.replace(root, '');
    symbol = symbol.split('/')[0]; // ignore slash
    // check if already a proper tonal chord

    if (!!Object.keys(Harmony.irealToTonal).find(function (i) {
      return Harmony.irealToTonal[i] === symbol;
    })) {
      return root + symbol;
    }

    symbol = Harmony.irealToTonal[symbol];

    if (symbol === undefined) {
      return null;
    }

    return root + symbol;
  };

  Harmony.getBassNote = function (chord, ignoreSlash) {
    if (ignoreSlash === void 0) {
      ignoreSlash = false;
    }

    if (!chord) {
      return null;
    }

    if (!ignoreSlash && chord.includes('/')) {
      return chord.split('/')[1];
    }

    var match = chord.match(/^([A-G][b|#]?)/);

    if (!match || !match.length) {
      return '';
    }

    return match[0];
  };

  Harmony.transposeChord = function (chord, interval) {
    if (!chord) {
      return chord;
    }

    var tokens = tonal_2.Chord.tokenize(Harmony.getTonalChord(chord));
    var root = tonal_4.Distance.transpose(tokens[0], interval);
    root = tonal_1.Note.simplify(root);
    return root + tokens[1];
  };

  Harmony.getMidi = function (note, offset) {
    if (offset === void 0) {
      offset = 0;
    }

    return tonal_1.Note.midi(note) - offset;
  };

  Harmony.intervalComplement = function (interval) {
    var fix = {
      '8P': '1P',
      '8d': '1A',
      '8A': '1d',
      '1A': '8d',
      '1d': '8A'
    };
    var fixIndex = Object.keys(fix).find(function (key) {
      return interval.match(key);
    });

    if (fixIndex) {
      return fix[fixIndex];
    }

    return tonal_3.Interval.invert(interval);
  };

  Harmony.invertInterval = function (interval) {
    if (!interval) {
      return null;
    }

    var positive = interval.replace('-', '');
    var complement = Harmony.intervalComplement(positive);
    var isNegative = interval.length > positive.length;
    return (isNegative ? '' : '-') + complement;
  };
  /** Transforms interval into one octave (octave+ get octaved down) */


  Harmony.fixInterval = function (interval, simplify) {
    if (interval === void 0) {
      interval = '';
    }

    if (simplify === void 0) {
      simplify = false;
    }

    var fix = {
      '0A': '1P',
      '-0A': '1P'
    };

    if (simplify) {
      fix = __assign({}, fix, {
        '8P': '1P',
        '-8P': '1P'
      });
      interval = tonal_3.Interval.simplify(interval);
    }

    if (Object.keys(fix).includes(interval)) {
      return fix[interval];
    }

    return interval;
  };
  /** inverts the interval if it does not go to the desired direction */


  Harmony.forceDirection = function (interval, direction, noUnison) {
    if (noUnison === void 0) {
      noUnison = false;
    }

    var semitones = tonal_3.Interval.semitones(interval);

    if (direction === 'up' && semitones < 0 || direction === 'down' && semitones > 0) {
      return Harmony.invertInterval(interval);
    }

    if (interval === '1P' && noUnison) {
      return (direction === 'down' ? '-' : '') + '8P';
    }

    return interval;
  }; // use Interval.ic?


  Harmony.minInterval = function (interval, direction, noUnison) {
    interval = Harmony.fixInterval(interval, true);

    if (direction) {
      return Harmony.forceDirection(interval, direction, noUnison);
    }

    var inversion = Harmony.invertInterval(interval);

    if (Math.abs(tonal_3.Interval.semitones(inversion)) < Math.abs(tonal_3.Interval.semitones(interval))) {
      interval = inversion;
    }

    return interval;
  }; // returns array of intervals that lead the voices of chord A to chordB


  Harmony.minIntervals = function (chordA, chordB) {
    return chordA.map(function (n, i) {
      return Harmony.minInterval(tonal_4.Distance.interval(n, chordB[i]));
    });
  };

  Harmony.mapMinInterval = function (direction) {
    return function (interval) {
      return Harmony.minInterval(interval, direction);
    };
  }; // sort function


  Harmony.sortMinInterval = function (preferredDirection, accessor) {
    if (preferredDirection === void 0) {
      preferredDirection = 'up';
    }

    if (accessor === void 0) {
      accessor = function accessor(i) {
        return i;
      };
    }

    return function (a, b) {
      var diff = Math.abs(tonal_3.Interval.semitones(accessor(a))) - Math.abs(tonal_3.Interval.semitones(accessor(b)));

      if (diff === 0) {
        return preferredDirection === 'up' ? -1 : 1;
      }

      return diff;
    };
  };
  /** Returns the note with the least distance to "from" */


  Harmony.getNearestNote = function (from, to, direction) {
    var interval = Harmony.minInterval(tonal_4.Distance.interval(tonal_1.Note.pc(from), tonal_1.Note.pc(to)), direction);
    return tonal_4.Distance.transpose(from, interval) + '';
  };

  Harmony.isValidNote = function (note) {
    return !!note.match(/^[A-Ga-g][b|#]*[0-9]?$/);
  };
  /** Returns the note with the least distance to "from". TODO: add range */


  Harmony.getNearestTargets = function (from, targets, preferredDirection, flip) {
    if (preferredDirection === void 0) {
      preferredDirection = 'down';
    }

    if (flip === void 0) {
      flip = false;
    }

    var intervals = targets.map(function (target) {
      return tonal_4.Distance.interval(tonal_1.Note.pc(from), target);
    }).map(Harmony.mapMinInterval(preferredDirection)).sort(Harmony.sortMinInterval(preferredDirection));
    /* if (flip) {
        intervals = intervals.reverse();
    } */

    return intervals.map(function (i) {
      return tonal_4.Distance.transpose(from, i);
    });
  };

  Harmony.intervalMatrix = function (from, to) {
    return to.map(function (note) {
      return from.map(function (n) {
        return tonal_4.Distance.interval(n, note);
      }).map(function (d) {
        return Harmony.minInterval(d);
      });
    }
    /* .map(i => i.slice(0, 2) === '--' ? i.slice(1) : i) */
    );
  };

  Harmony.transposeSheet = function (sheet, interval) {
    if (sheet.chords) {
      sheet = __assign({}, sheet, {
        chords: sheet.chords.map(function (measure) {
          return Rhythm_1.Rhythm.from(Measure_1.Measure.from(measure).body).map(function (chord) {
            return Harmony.transposeChord(chord, interval);
          });
        })
      });
    }

    if (sheet.melody) {
      console.log('TODO: tranpose melody');
    }

    return sheet;
  }; // mapping for ireal chords to tonal symbols, see getTonalChord


  Harmony.irealToTonal = {
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
    "7sus4": "7sus",
    "M69": "M69"
  };
  Harmony.pitchRegex = /^([A-G^][b|#]?)/;
  return Harmony;
}();

exports.Harmony = Harmony;
},{"tonal":"../node_modules/tonal/index.js","../util/util":"../lib/util/util.js","../sheet/Measure":"../lib/sheet/Measure.js","../rhythmical/Rhythm":"../lib/rhythmical/Rhythm.js"}],"../lib/instruments/Instrument.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Harmony_1 = require("../harmony/Harmony");

var Instrument =
/** @class */
function () {
  function Instrument(_a) {
    var _b = _a === void 0 ? {} : _a,
        context = _b.context,
        gain = _b.gain,
        mix = _b.mix,
        onTrigger = _b.onTrigger,
        midiOffset = _b.midiOffset;

    this.midiOffset = 0;
    this.gain = 1;
    this.activeEvents = [];
    this.onTrigger = onTrigger;
    this.midiOffset = midiOffset || this.midiOffset;
    this.gain = gain || this.gain;
    this.init({
      context: context,
      mix: mix
    });
  }

  Instrument.prototype.init = function (_a) {
    var context = _a.context,
        mix = _a.mix;

    if (!context && (!mix || !mix.context)) {
      console.warn("you should pass a context or a mix (gainNode) to a new Instrument. \n            You can also Call init with {context,mix} to setup the Instrument later");
      return;
    }

    this.context = context || mix.context;
    this.mix = mix || this.context.destination;
  };

  Instrument.prototype.playNotes = function (notes, settings) {
    var _this = this;

    if (settings === void 0) {
      settings = {};
    }

    var deadline = settings.deadline || this.context.currentTime;
    settings = Object.assign({
      duration: 2000,
      gain: 1
    }, settings, {
      deadline: deadline
    });

    if (settings.interval) {
      // call recursively with single notes at interval
      return notes.map(function (note, index) {
        _this.playNotes([note], Object.assign({}, settings, {
          interval: 0,
          deadline: deadline + index * settings.interval
        }));
      });
    }

    var midi = notes.map(function (note) {
      return Harmony_1.Harmony.getMidi(note, _this.midiOffset);
    });
    var noteOff = settings.deadline + settings.duration / 1000;
    var notesOn = notes.map(function (note, index) {
      return {
        note: note,
        midi: midi[index],
        gain: settings.gain,
        noteOff: noteOff,
        deadline: settings.deadline
      };
    });

    if (settings.pulse && this.onTrigger) {
      settings.pulse.clock.callbackAtTime(function (deadline) {
        _this.activeEvents = _this.activeEvents.concat(notesOn);

        _this.onTrigger({
          on: notesOn,
          off: [],
          active: _this.activeEvents
        });
      }, settings.deadline);
    }

    if (settings.duration && settings.pulse) {
      settings.pulse.clock.callbackAtTime(function (deadline) {
        // find out which notes need to be deactivated
        var notesOff = notes.filter(function (note) {
          return !_this.activeEvents.find(function (event) {
            var keep = note === event.note && event.noteOff > deadline;

            if (keep) {
              console.log('keep', note);
            }

            return keep;
          });
        }).map(function (note) {
          return _this.activeEvents.find(function (e) {
            return e.note === note;
          });
        });
        _this.activeEvents = _this.activeEvents.filter(function (e) {
          return !notesOff.includes(e);
        });

        if (_this.onTrigger) {
          _this.onTrigger({
            on: [],
            off: notesOff,
            active: _this.activeEvents
          });
        }
      }, noteOff);
    }

    return this.playKeys(midi, settings);
  };

  Instrument.prototype.playKeys = function (keys, settings) {// TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
  };

  return Instrument;
}();

exports.Instrument = Instrument;
},{"../harmony/Harmony":"../lib/harmony/Harmony.js"}],"../lib/instruments/Synthesizer.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Instrument_1 = require("./Instrument");

var tonal_1 = require("tonal");

var util_1 = require("../util/util");

var Synthesizer =
/** @class */
function (_super) {
  __extends(Synthesizer, _super);

  function Synthesizer(props) {
    var _this = _super.call(this, props) || this;

    _this.duration = 200;
    _this.type = 'sine';
    _this.gain = 0.9;
    _this.attack = .05;
    _this.decay = .05;
    _this.sustain = .4;
    _this.release = .1;
    _this.duration = props.duration || _this.duration;
    _this.type = props.type || _this.type;
    _this.gain = props.gain || _this.gain;
    return _this;
  }

  Synthesizer.prototype.getVoice = function (type, gain, key) {
    if (type === void 0) {
      type = 'sine';
    }

    if (gain === void 0) {
      gain = 0;
    }

    var frequency = tonal_1.Note.freq(key);
    var oscNode = this.context.createOscillator();
    oscNode.type = type;
    var gainNode = this.context.createGain();
    oscNode.connect(gainNode);
    gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
    gainNode.connect(this.mix);
    oscNode.frequency.value = frequency;
    return {
      oscNode: oscNode,
      gainNode: gainNode,
      key: key,
      frequency: frequency
    };
  };

  Synthesizer.prototype.lowestGain = function (a, b) {
    return a.gain.gain.value < b.gain.gain.value ? -1 : 0;
  };

  Synthesizer.prototype.startKeys = function (keys, settings) {
    if (settings === void 0) {
      settings = {};
    }
  };

  Synthesizer.prototype.playKeys = function (keys, settings) {
    var _this = this;

    if (settings === void 0) {
      settings = {};
    }

    _super.prototype.playKeys.call(this, keys, settings); // fires callback   
    //const time = this.context.currentTime + settings.deadline / 1000;


    var time = settings.deadline || this.context.currentTime;
    var interval = settings.interval || 0;
    return keys.map(function (key, i) {
      var delay = i * interval;
      var _a = [settings.endless, settings.attack || _this.attack, settings.decay || _this.decay, settings.sustain || _this.sustain, settings.release || _this.release, (settings.duration || _this.duration) / 1000, (settings.gain || 1) * _this.gain],
          endless = _a[0],
          attack = _a[1],
          decay = _a[2],
          sustain = _a[3],
          release = _a[4],
          duration = _a[5],
          gain = _a[6];

      var voice = _this.getVoice(_this.type, 0, key);

      util_1.adsr({
        attack: attack,
        decay: decay,
        sustain: sustain,
        release: release,
        gain: gain,
        duration: duration,
        endless: endless
      }, time + delay, voice.gainNode.gain);
      voice.oscNode.start(settings.deadline + delay);
      return voice;
    });
  };

  Synthesizer.prototype.stopVoice = function (voice, settings) {
    if (settings === void 0) {
      settings = {};
    }

    if (!voice) {
      return;
    }

    var time = settings.deadline || this.context.currentTime;
    voice.gainNode.gain.setTargetAtTime(0, time, settings.release || this.release); //voice.oscNode.stop()
  };

  Synthesizer.prototype.stopVoices = function (voices, settings) {
    var _this = this;

    voices.forEach(function (voice) {
      _this.stopVoice(voice, settings);
    });
  };

  return Synthesizer;
}(Instrument_1.Instrument);

exports.Synthesizer = Synthesizer;
},{"./Instrument":"../lib/instruments/Instrument.js","tonal":"../node_modules/tonal/index.js","../util/util":"../lib/util/util.js"}],"../lib/Metronome.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Synthesizer_1 = require("./instruments/Synthesizer");

var Metronome =
/** @class */
function () {
  function Metronome(mix) {
    this.synth = new Synthesizer_1.Synthesizer({
      type: 'sine',
      gain: 1,
      mix: mix
    });
    this.ready = this.synth.ready;
  }

  Metronome.prototype.count = function (pulse, bars) {
    var _this = this;

    if (bars === void 0) {
      bars = 1;
    }

    var count = new Array(bars).fill([new Array(pulse.props.cycle).fill(1)]);
    return pulse.tickArray(count, function (_a) {
      var path = _a.path,
          deadline = _a.deadline;

      _this.synth.playKeys([path[2] === 0 ? 90 : 78], {
        deadline: deadline,
        duration: 0.01,
        attack: .01,
        release: .01,
        decay: .01,
        sustain: 1
      });
    });
  };

  return Metronome;
}();

exports.Metronome = Metronome;
},{"./instruments/Synthesizer":"../lib/instruments/Synthesizer.js"}],"../lib/util/Permutation.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Permutation =
/** @class */
function () {
  function Permutation() {}

  Permutation.permutateElements = function (array, validate, path) {
    if (path === void 0) {
      path = [];
    }

    var isValid = function isValid(next) {
      return !validate || validate(path, next, array);
    };

    if (array.length === 1) {
      return isValid(array[0]) ? array : [];
    }

    return array.filter(isValid).reduce(function (combinations, el) {
      return combinations.concat(Permutation.permutateElements(array.filter(function (e) {
        return e !== el;
      }), validate, path.concat([el])).map(function (subcombinations) {
        return [el].concat(subcombinations);
      }));
    }, []);
  };

  Permutation.permutationComplexity = function (array, validate, path) {
    if (path === void 0) {
      path = [];
    }

    var validations = 0;
    Permutation.permutateElements(array, function (path, next, array) {
      ++validations;
      return !validate || validate(path, next, array);
    }, path);
    return validations;
  };

  Permutation.permutateArray = function (array) {
    if (array.length === 1) {
      return array;
    }

    return array.reduce(function (combinations, el) {
      return combinations.concat(Permutation.permutateArray(array.filter(function (e) {
        return e !== el;
      })).map(function (subcombinations) {
        return [el].concat(subcombinations);
      }));
    }, []);
  }; // combine multiple validators


  Permutation.combineValidators = function () {
    var validators = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      validators[_i] = arguments[_i];
    }

    return function (path, next, array) {
      return validators.reduce(function (result, validator) {
        return result && validator(path, next, array);
      }, true);
    };
  }; //https://stackoverflow.com/questions/9960908/permutations-in-javascript


  Permutation.combinations = function (array) {
    var length = array.length,
        result = [array.slice()],
        c = new Array(length).fill(0),
        i = 1,
        k,
        p;

    while (i < length) {
      if (c[i] < i) {
        k = i % 2 && c[i];
        p = array[i];
        array[i] = array[k];
        array[k] = p;
        ++c[i];
        i = 1;
        result.push(array.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }

    return result;
  }; // https://gist.github.com/axelpale/3118596


  Permutation.binomial = function (set, k) {
    var i, j, combs, head, tailcombs; // There is no way to take e.g. sets of 5 elements from
    // a set of 4.

    if (k > set.length || k <= 0) {
      return [];
    } // K-sized set has only one K-sized subset.


    if (k == set.length) {
      return [set];
    } // There is N 1-sized subsets in a N-sized set.


    if (k == 1) {
      combs = [];

      for (i = 0; i < set.length; i++) {
        combs.push([set[i]]);
      }

      return combs;
    } // Assert {1 < k < set.length}
    // Algorithm description:
    // To get k-combinations of a set, we want to join each element
    // with all (k-1)-combinations of the other elements. The set of
    // these k-sized sets would be the desired result. However, as we
    // represent sets with lists, we need to take duplicates into
    // account. To avoid producing duplicates and also unnecessary
    // computing, we use the following approach: each element i
    // divides the list into three: the preceding elements, the
    // current element i, and the subsequent elements. For the first
    // element, the list of preceding elements is empty. For element i,
    // we compute the (k-1)-computations of the subsequent elements,
    // join each with the element i, and store the joined to the set of
    // computed k-combinations. We do not need to take the preceding
    // elements into account, because they have already been the i:th
    // element so they are already computed and stored. When the length
    // of the subsequent list drops below (k-1), we cannot find any
    // (k-1)-combs, hence the upper limit for the iteration:


    combs = [];

    for (i = 0; i < set.length - k + 1; i++) {
      // head is a list that includes only our current element.
      head = set.slice(i, i + 1); // We take smaller combinations from the subsequent elements

      tailcombs = Permutation.binomial(set.slice(i + 1), k - 1); // For each (k-1)-combination we join it with the current
      // and store it to the set of k-combinations.

      for (j = 0; j < tailcombs.length; j++) {
        combs.push(head.concat(tailcombs[j]));
      }
    }

    return combs;
  };

  Permutation.bjorklund = function (steps, pulses) {
    steps = Math.round(steps);
    pulses = Math.round(pulses);

    if (pulses > steps || pulses == 0 || steps == 0) {
      return new Array();
    }

    var pattern = [];
    var counts = [];
    var remainders = [];
    var divisor = steps - pulses;
    var level = 0;
    remainders.push(pulses);

    while (true) {
      counts.push(Math.floor(divisor / remainders[level]));
      remainders.push(divisor % remainders[level]);
      divisor = remainders[level];
      level += 1;

      if (remainders[level] <= 1) {
        break;
      }
    }

    counts.push(divisor);
    var r = 0;

    var build = function build(level) {
      r++;

      if (level > -1) {
        for (var i = 0; i < counts[level]; i++) {
          build(level - 1);
        }

        if (remainders[level] != 0) {
          build(level - 2);
        }
      } else if (level == -1) {
        pattern.push(0);
      } else if (level == -2) {
        pattern.push(1);
      }
    };

    build(level);
    return pattern.reverse();
  };

  return Permutation;
}();

exports.Permutation = Permutation;
},{}],"../lib/harmony/Voicing.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Permutation_1 = require("../util/Permutation");

var Logger_1 = require("../util/Logger");

var tonal_1 = require("tonal");

var tonal_2 = require("tonal");

var tonal_3 = require("tonal");

var tonal_4 = require("tonal");

var util_1 = require("../util/util");

var Harmony_1 = require("./Harmony");

var Voicing =
/** @class */
function () {
  function Voicing() {}
  /** Returns the next voicing that should follow the previously played voicing.
  */


  Voicing.getNextVoicing = function (chord, previousVoicing, options) {
    if (options === void 0) {
      options = {};
    }

    var _a = __assign({}, Voicing.defaultOptions, options),
        range = _a.range,
        forceDirection = _a.forceDirection,
        forceBestPick = _a.forceBestPick,
        rangeBorders = _a.rangeBorders,
        sortChoices = _a.sortChoices,
        filterChoices = _a.filterChoices,
        noTopDrop = _a.noTopDrop,
        noTopAdd = _a.noTopAdd,
        topNotes = _a.topNotes,
        noBottomDrop = _a.noBottomDrop,
        noBottomAdd = _a.noBottomAdd,
        idleChance = _a.idleChance,
        logIdle = _a.logIdle,
        logging = _a.logging; // make sure tonal can read the chord


    if (!chord || chord === 'r') {
      return null;
    }

    chord = Harmony_1.Harmony.getTonalChord(chord);

    var exit = function exit() {
      var pick = [];

      if (logging) {
        Logger_1.Logger.logVoicing({
          chord: chord,
          previousVoicing: previousVoicing,
          range: range,
          combinations: combinations,
          pick: pick,
          logIdle: logIdle,
          options: options
        });
      }

      return pick;
    };

    var combinations = Voicing.getAllVoicePermutations(chord, options);

    if (!combinations.length) {
      console.warn(chord, 'no combinations', options);
      return exit();
    }

    var choices = Voicing.getAllChoices(combinations, previousVoicing, options);
    var originalChoices = [].concat(choices);
    choices = choices.filter(function (choice) {
      return (!noTopDrop || !choice.topDropped) && (!noTopAdd || !choice.topAdded) && (!noBottomDrop || !choice.bottomDropped) && (!noBottomAdd || !choice.bottomAdded);
    }).filter(function (choice) {
      return (!filterChoices || filterChoices(choice)) && (!topNotes || Voicing.hasTopNotes(choice.targets, topNotes));
    }).filter(function (choice, index, filtered) {
      return choice.difference > 0 || filtered.length === 1 || Math.random() < idleChance;
    }).sort(sortChoices ? function (a, b) {
      return sortChoices(a, b);
    } : function (a, b) {
      return a.difference - b.difference;
    });

    if (!choices.length) {
      console.warn(chord, 'no choices', options, 'combinations', combinations, 'original choices', originalChoices);
      return exit();
    }

    var bestPick = choices[0].targets,
        choice;
    var direction = Voicing.getDesiredDirection(previousVoicing, range, rangeBorders) || forceDirection;

    if (direction && forceBestPick && (!util_1.isInRange(bestPick[0], range) || util_1.isInRange(bestPick[bestPick.length - 1], range))) {
      var octave = direction === 'up' ? '8P' : '-8P';
      bestPick = util_1.transposeNotes(bestPick, octave);
    }

    if (!direction || forceBestPick) {
      var pick_1 = bestPick;
      choice = choices[0];

      if (logging) {
        Logger_1.Logger.logVoicing({
          chord: chord,
          previousVoicing: previousVoicing,
          range: range,
          combinations: combinations,
          pick: pick_1,
          direction: direction,
          bestPick: bestPick,
          choice: choice,
          choices: choices,
          logIdle: logIdle,
          options: options
        });
      }

      return pick_1;
    } // sort after movement instead of difference


    choice = choices.sort(function (a, b) {
      return Math.abs(a.movement) - Math.abs(b.movement);
    }).find(function (choice) {
      if (direction === 'up') {
        return choice.movement >= 0;
      }

      return choice.movement <= 0;
    });

    if (!choice) {
      // keep hanging in the corner of the range..
      choice = choices[0];
    }

    var pick = choice.targets;

    if (logging) {
      Logger_1.Logger.logVoicing({
        chord: chord,
        previousVoicing: previousVoicing,
        range: range,
        combinations: combinations,
        pick: pick,
        direction: direction,
        bestPick: bestPick,
        choice: choice,
        choices: choices,
        logIdle: logIdle,
        options: options
      });
    }

    return pick;
  };

  Voicing.hasTopNotes = function (pick, topNotes) {
    if (topNotes === void 0) {
      topNotes = [];
    }

    return topNotes.reduce(function (match, note) {
      return match && Harmony_1.Harmony.hasSamePitch(note, pick[pick.length - 1]);
    }, true);
  };
  /** Computes all valid voice permutations for a given chord and voice number.
   * Runs getVoicePermutations for each possible selection of notes.
   */


  Voicing.getAllVoicePermutations = function (chord, voicingOptions) {
    if (voicingOptions === void 0) {
      voicingOptions = {};
    }

    var root = Harmony_1.Harmony.getBassNote(chord, true);
    return Voicing.getAllNoteSelections(chord, voicingOptions).reduce(function (combinations, combination) {
      return combinations.concat(Voicing.getVoicePermutations(combination, __assign({}, voicingOptions, {
        root: root
      })));
    }, []);
  };
  /** Get all permutations of the given notes that would make a good voicing. */


  Voicing.getVoicePermutations = function (notes, options) {
    if (options === void 0) {
      options = {};
    }

    if (notes.length === 1) {
      return [notes];
    }

    var validator = options.validatePermutation || function (path, next, array) {
      return true;
    };

    return Permutation_1.Permutation.permutateElements(notes, Permutation_1.Permutation.combineValidators(validator, Voicing.voicingValidator(options)));
  };
  /** Configurable Validator that sorts out note combinations with untasty intervals.  */


  Voicing.voicingValidator = function (options) {
    options = __assign({
      maxDistance: 6,
      minDistance: 1,
      minBottomDistance: 3,
      minTopDistance: 2
    }, options);
    return function (path, next, array) {
      var lastPosition = path.length + array.length - 1;
      return Permutation_1.Permutation.combineValidators(Voicing.notesAtPositionValidator(options.topNotes, lastPosition), Voicing.notesAtPositionValidator(options.bottomNotes, 0), Voicing.degreesAtPositionValidator(options.topDegrees, lastPosition, options.root), Voicing.degreesAtPositionValidator(options.bottomDegrees, 0, options.root), Voicing.validateInterval(function (interval) {
        return tonal_4.Interval.semitones(interval) <= options.maxDistance;
      }), Voicing.validateInterval(function (interval, _a) {
        var path = _a.path,
            array = _a.array;
        return array.length === 1 || path.length === 1 || tonal_4.Interval.semitones(interval) >= options.minDistance;
      }), Voicing.validateInterval(function (interval, _a) {
        var array = _a.array;
        return array.length !== 1 || tonal_4.Interval.semitones(interval) >= options.minTopDistance;
      }), Voicing.validateInterval(function (interval, _a) {
        var path = _a.path;
        return path.length !== 1 || tonal_4.Interval.semitones(interval) >= options.minBottomDistance;
      }))(path, next, array);
    };
  };
  /** Validates the interval to the next note. You can write your own logic inside the validate fn. */


  Voicing.validateInterval = function (validate) {
    return function (path, next, array) {
      if (!path.length) {
        return true;
      }

      var interval = tonal_3.Distance.interval(path[path.length - 1], next) + '';
      return validate(interval, {
        path: path,
        next: next,
        array: array
      });
    };
  };
  /** Returns all possible combinations of required and optional notes for a given chord and desired length.
   * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */


  Voicing.getAllNoteSelections = function (chord, options) {
    if (options === void 0) {
      options = {};
    }

    if (typeof options === 'number') {
      options = {
        maxVoices: options
      };
    }

    var _a = __assign({
      topNotes: [],
      bottomNotes: []
    }, options),
        omitNotes = _a.omitNotes,
        topNotes = _a.topNotes,
        bottomNotes = _a.bottomNotes,
        maxVoices = _a.maxVoices;

    maxVoices = maxVoices || 3;
    var required = Voicing.getRequiredNotes(chord, maxVoices);
    var extraNotes = topNotes.concat(bottomNotes).map(function (n) {
      return tonal_2.Note.pc(n);
    });

    if (extraNotes.length) {
      required = extraNotes.concat(required);
      /* .filter((n, i, a) => a.indexOf(n) === i).concat(required); */

      if (maxVoices === 1) {
        return [extraNotes];
      }
    }

    required = Voicing.withoutPitches(omitNotes, required);

    if (maxVoices === 1) {
      return required.map(function (note) {
        return [note];
      });
    }

    var fill = maxVoices - required.length;

    if (fill === 0) {
      return [required];
    }

    if (fill < 0) {
      // required notes are enough
      return Permutation_1.Permutation.binomial(required, maxVoices);
    }

    var optional = Voicing.getOptionalNotes(chord, maxVoices, required);
    optional = Voicing.withoutPitches(omitNotes, optional);

    if (fill >= optional.length) {
      return [required.concat(optional)];
    }

    return Permutation_1.Permutation.binomial(optional, Math.min(fill, optional.length)).map(function (selection) {
      return required.concat(selection);
    });
  };

  Voicing.withoutPitches = function (pitches, voicing) {
    if (pitches === void 0) {
      pitches = [];
    }

    return voicing.filter(function (r) {
      return !pitches.find(function (o) {
        return Harmony_1.Harmony.hasSamePitch(r, o);
      });
    });
  };
  /** Get available tensions for a given chord. Omits tensions that kill the chord quality */


  Voicing.getAvailableTensions = function (chord) {
    chord = Harmony_1.Harmony.getTonalChord(chord);
    var notes = tonal_1.Chord.notes(chord);

    if (util_1.isDominantChord(chord)) {
      return Voicing.getAllTensions(notes[0]) // filter out tensions that are part of the chord
      .filter(function (note) {
        return !notes.find(function (n) {
          return util_1.semitoneDistance(notes[0], note) === util_1.semitoneDistance(notes[0], n);
        });
      }) // filter out tensions that are a semitone above the 3 (if exists)
      .filter(function (note) {
        return util_1.chordHasIntervals(chord, ['3!']) || util_1.semitoneDistance(util_1.getDegreeInChord(3, chord), note) > 1;
      }) // filter out tensions that are a semitone above the 4 (if exists => sus)
      .filter(function (note) {
        return !util_1.chordHasIntervals(chord, ['4P']) || util_1.semitoneDistance(util_1.getDegreeInChord(4, chord), note) > 1;
      }) // filter out tensions that are a semitone above the 7
      .filter(function (note) {
        return util_1.semitoneDistance(util_1.getDegreeInChord(7, chord), note) > 1;
      });
    }

    return notes.slice(0, 4) // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
    .filter(function (note) {
      return note === notes[0] || util_1.semitoneDistance(note, notes[0]) > 2;
    }) // all tensions are a major second above a chord note
    .map(function (note) {
      return tonal_3.Distance.transpose(note, '2M');
    }) // tensions 2 semiontes below root are flat 7 => changes chord quality
    .filter(function (note) {
      return util_1.semitoneDistance(note, notes[0]) !== 2;
    }); // omit tensions that end up on a chord note again?
  };
  /** Returns all Tensions that could be in any chord */


  Voicing.getAllTensions = function (root) {
    return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7'].map(function (step) {
      return util_1.getIntervalFromStep(step);
    }).map(function (interval) {
      return tonal_3.Distance.transpose(root, interval);
    });
  };
  /** Returns all notes that are required to outline a chord */


  Voicing.getRequiredNotes = function (chord, voices) {
    if (voices === void 0) {
      voices = 2;
    }

    chord = Harmony_1.Harmony.getTonalChord(chord);
    var notes = tonal_1.Chord.notes(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    var requiredSteps = [3, 7, 'b5', 6].slice(0, Math.max(voices, 2)); // order is important

    if (!util_1.hasDegree(3, intervals)) {
      requiredSteps.push(4); // fixes m6 chords
    }

    var required = requiredSteps.reduce(function (req, degree) {
      if (util_1.hasDegree(degree, intervals)) {
        req.push(util_1.getDegreeInChord(degree, chord));
      }

      return req;
    }, []);

    if (voices > 3 && !required.includes(notes[notes.length - 1])) {
      required.push(notes[notes.length - 1]);
    }

    return required;
  };
  /** Returns all notes that are not required */


  Voicing.getOptionalNotes = function (chord, voices, required) {
    chord = Harmony_1.Harmony.getTonalChord(chord);
    var notes = tonal_1.Chord.notes(chord);
    required = required || Voicing.getRequiredNotes(chord, voices);
    return notes.filter(function (note) {
      return !required.includes(note);
    });
  };
  /** Returns all possible note choices for the given combinations.
   * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
   */


  Voicing.getAllChoices = function (combinations, previousVoicing, options) {
    if (previousVoicing === void 0) {
      previousVoicing = [];
    }

    if (options === void 0) {
      options = {};
    }

    var range = options.range,
        topNotes = options.topNotes;
    range = range || Voicing.defaultOptions.range;
    var choices = [];

    if (topNotes && topNotes.length) {
      var absoluteTopNotes = (topNotes || []).filter(function (n) {
        return !!tonal_2.Note.oct(n);
      });
      var choicesWithTopNotes = absoluteTopNotes.reduce(function (rendered, topNote) {
        var combinationsWithThatTopNote = combinations.filter(function (c) {
          return Harmony_1.Harmony.hasSamePitch(c[c.length - 1], topNote);
        });
        combinationsWithThatTopNote.forEach(function (combination) {
          return rendered.push(util_1.renderAbsoluteNotes(combination.reverse(), tonal_2.Note.oct(topNote), 'down').reverse());
        }); // exclude the combination from further rendering

        combinations = combinations.filter(function (c) {
          return !combinationsWithThatTopNote.includes(c);
        });
        return rendered;
      }, []);
      choices = choices.concat(choicesWithTopNotes, []);

      if (!combinations.length) {
        return choices.reduce(function (all, targets) {
          var leads = Voicing.voiceLeading(targets, previousVoicing);
          return all.concat(leads);
        }, []);
      } else {
        console.warn('not only top note choices', topNotes, choicesWithTopNotes, combinations);
      }
    }

    if (!previousVoicing || !previousVoicing.length) {
      // no previous chord
      // filter out combinations that are out of range
      combinations = combinations.filter(function (combination) {
        var firstNote = Harmony_1.Harmony.getNearestNote(range[0], combination[0], 'up');
        var pick = util_1.renderAbsoluteNotes(combination, tonal_2.Note.oct(firstNote));
        /* const highestNote = Harmony.getNearestNote(range[1], combination[combination.length - 1], 'down');
        const pick = renderAbsoluteNotes(combination.reverse(), Note.oct(highestNote), 'down').reverse(); */

        return util_1.isInRange(pick[0], range) && util_1.isInRange(pick[pick.length - 1], range);
      });

      if (!combinations.length) {
        return [];
      }

      var firstPick = combinations[0];
      var firstNoteInRange = Harmony_1.Harmony.getNearestNote(range[0], firstPick[0], 'up');
      var pick = util_1.renderAbsoluteNotes(firstPick, tonal_2.Note.oct(firstNoteInRange));

      if (topNotes && topNotes.length) {
        return Voicing.voiceLeading(pick.concat(topNotes));
      }

      return Voicing.voiceLeading(pick);
    }

    var lastPitches = previousVoicing.map(function (note) {
      return tonal_2.Note.pc(note);
    });
    return combinations.map(function (combination) {
      var bottomInterval = tonal_3.Distance.interval(lastPitches[0], combination[0]);
      var bottomNotes = [tonal_3.Distance.transpose(previousVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'down')), tonal_3.Distance.transpose(previousVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'up'))];

      if (bottomNotes[0] === bottomNotes[1]) {
        bottomNotes = [bottomNotes[0]];
      }

      return {
        combination: combination,
        bottomNotes: bottomNotes
      };
    }).reduce(function (all, _a) {
      var combination = _a.combination,
          bottomNotes = _a.bottomNotes;
      return all.concat(bottomNotes.map(function (bottomNote) {
        return util_1.renderAbsoluteNotes(combination, tonal_2.Note.oct(bottomNote));
      }));
    }, []).filter(function (targets) {
      return !range || util_1.isInRange(targets[0], range) && util_1.isInRange(targets[targets.length - 1], range);
    }).reduce(function (all, targets) {
      var leads = Voicing.voiceLeading(targets, previousVoicing);
      return all.concat(leads);
    }, []);
  };
  /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */


  Voicing.voiceLeading = function (targets, origin) {
    if (origin === void 0) {
      origin = [];
    } // if same length > dont permutate


    if (!origin || !origin.length || origin.length === targets.length) {
      return [Voicing.analyzeVoiceLeading(targets, origin)];
    }

    var _a = [origin, targets].sort(function (a, b) {
      return b.length - a.length;
    }),
        more = _a[0],
        less = _a[1];

    return Permutation_1.Permutation.binomial(more, less.length).map(function (selection) {
      var _a, _b;

      var from, to;

      if (origin.length < targets.length) {
        _a = [origin, selection], from = _a[0], to = _a[1];
      } else {
        _b = [selection, targets], from = _b[0], to = _b[1];
      }

      return Voicing.analyzeVoiceLeading(to, from, targets, origin);
    });
  };
  /** Analyzed the voice leading for the movement from > to.
   * Origin and targets needs to be passed if the voice transition over unequal lengths
   */


  Voicing.analyzeVoiceLeading = function (to, from, targets, origin) {
    if (from === void 0) {
      from = [];
    }

    if (targets === void 0) {
      targets = to;
    }

    if (origin === void 0) {
      origin = from;
    }

    var _a;

    _a = [origin || from, targets || to], origin = _a[0], targets = _a[1];

    if (!from || !from.length) {
      return {
        to: to,
        targets: targets,
        from: from,
        origin: origin,
        intervals: [],
        degrees: [],
        oblique: [],
        difference: 0,
        movement: 0,
        similar: false,
        parallel: false,
        contrary: false,
        topNotes: [0, to[to.length - 1]],
        bottomNotes: [0, to[to[0]]],
        dropped: [],
        added: []
      };
    } // console.log(to, from, targets, origin);


    var intervals = Voicing.voicingIntervals(from, to, false).map(function (interval) {
      return Harmony_1.Harmony.fixInterval(interval, false);
    });
    /** Interval qualities */

    var degrees = intervals.map(function (i) {
      return util_1.getDegreeFromInterval(i);
    });
    /** Voices that did not move */

    var oblique = from.filter(function (n, i) {
      return to.find(function (note) {
        return Harmony_1.Harmony.hasSamePitch(n, note);
      });
    });
    /** abs sum of semitones movements of voices */

    var difference = util_1.semitoneDifference(intervals);
    /** relative sum of semitone movements */

    var movement = util_1.semitoneMovement(intervals);
    /** voice differences did not cancel each other out > moved in same direction */

    var similar = Math.abs(movement) === Math.abs(difference);
    /** moves parallel if all interval qualities the same and in the same direction */

    var parallel = difference > 0 && similar && degrees.reduce(function (match, degree, index) {
      return match && (index === 0 || degrees[index - 1] === degree);
    }, true); // find out which notes have been dropped / added

    var dropped = [],
        added = [];

    if (origin.length < targets.length) {
      added = targets.filter(function (n) {
        return !to.includes(n);
      });
    } else {
      dropped = origin.filter(function (n) {
        return !from.includes(n);
      });
    }

    var bottomInterval = intervals[0];
    var topInterval = intervals[intervals.length - 1];
    var bottomNotes = [origin[0], targets[0]];
    var topNotes = [origin[origin.length - 1], targets[targets.length - 1]];
    return {
      from: from,
      to: to,
      origin: origin,
      targets: targets,
      intervals: intervals,
      difference: difference,
      movement: movement,
      bottomInterval: bottomInterval,
      topInterval: topInterval,
      topNotes: topNotes,
      bottomNotes: bottomNotes,
      similar: similar,
      contrary: !similar,
      parallel: parallel,
      oblique: oblique,
      degrees: degrees,
      added: added,
      dropped: dropped,
      topDropped: dropped.includes(topNotes[0]),
      topAdded: added.includes(topNotes[1]),
      bottomDropped: dropped.includes(bottomNotes[0]),
      bottomAdded: added.includes(bottomNotes[1])
    };
  };
  /** Returns true if the given note is contained in the given voicing. */


  Voicing.containsPitch = function (note, voicing, enharmonic) {
    if (enharmonic === void 0) {
      enharmonic = true;
    }

    if (!enharmonic) {
      return voicing.includes(note);
    }

    return !!voicing.find(function (n) {
      return Harmony_1.Harmony.hasSamePitch(note, n);
    });
  };
  /** Returns the intervals between the given chord voicings.
   * Can be passed pitch classes or absolute notes.
   * The two voicings should have the same length. */


  Voicing.voicingIntervals = function (chordA, chordB, min, direction) {
    if (min === void 0) {
      min = true;
    }

    if (chordA.length !== chordB.length) {// console.log('voicingIntervals: not the same length..');
    }

    var intervals = chordA.map(function (n, i) {
      var interval = tonal_3.Distance.interval(n, chordB[i]);

      if (min === false) {
        return interval;
      }

      if (util_1.isPitchClass(n) && util_1.isPitchClass(chordB[i])) {
        return Harmony_1.Harmony.minInterval(interval, direction);
      }

      return interval;
    });
    return intervals;
  };
  /** Validates the current permutation to have a note at a certain position (array index) */


  Voicing.notesAtPositionValidator = function (notes, position) {
    if (notes === void 0) {
      notes = [];
    }

    return function (selected, note, remaining) {
      return !notes.length || selected.length !== position || Voicing.containsPitch(note, notes)
      /*  notes.includes(note) */
      ;
    };
  };
  /** Validates the current permutation to have a note at a certain position (array index) */


  Voicing.degreesAtPositionValidator = function (degrees, position, root) {
    if (degrees === void 0) {
      degrees = [];
    }

    return function (selected, note, remaining) {
      if (!degrees.length || !root || selected.length !== position) {
        return true;
      }

      var degree = util_1.getDegreeFromInterval(tonal_3.Distance.interval(root, note));
      return degrees.includes(degree);
    };
  };
  /** Returns true if the given voicing contains its root */


  Voicing.hasTonic = function (voicing, chord) {
    var tokens = tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord));
    return voicing.map(function (n) {
      return tonal_2.Note.pc(n);
    }).includes(tokens[0]);
  };
  /** Returns the best direction to move for a given voicing in a range.
   * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
   */


  Voicing.getDesiredDirection = function (voicing, range, thresholds) {
    if (thresholds === void 0) {
      thresholds = [3, 3];
    }

    if (!voicing) {
      return;
    }

    var distances = util_1.getDistancesToRangeEnds([voicing[0], voicing[voicing.length - 1]], range);

    if (distances[0] < thresholds[0] && distances[1] < thresholds[1]) {
      console.error('range is too small to fit the comfy zone (rangeBorders)', thresholds, range);
      return;
    }

    if (distances[0] < thresholds[0]) {
      return 'up';
    }

    if (distances[1] < thresholds[1]) {
      return 'down';
    }
  };

  Voicing.defaultOptions = {
    range: ['C3', 'C5'],
    rangeBorders: [3, 3],
    maxVoices: 4,
    forceDirection: null,
    forceBestPick: false,
    maxDistance: 7,
    minBottomDistance: 3,
    minTopDistance: 2,
    noTopDrop: true,
    noTopAdd: true,
    noBottomDrop: false,
    noBottomAdd: false,
    idleChance: 1,
    logIdle: false,
    logging: true
  };
  return Voicing;
}();

exports.Voicing = Voicing;
/**
 *



    static getPossibleVoicings(chord, voices = 4) {
        const required = getRequiredNotes(chord);
        const optional = getOptionalNotes(chord);
        const tensions = getAvailableTensions(chord);
        return { required, optional, tensions };
    }
    static voicingDifference(chordA, chordB, min = true) {
        return semitoneDifference(Voicing.voicingIntervals(chordA, chordB, min));
    }

    static voicingMovement(chordA, chordB, min = true, direction?: intervalDirection) {
        return semitoneMovement(Voicing.voicingIntervals(chordA, chordB, min, direction));
    }

    static bestVoiceLeading(chordA, chordB, sortFn?) {
        sortFn = sortFn || ((a, b) => a.difference - b.difference);
        const voices = Voicing.voiceLeading(chordA, chordB)
            .sort((best, current) => {
                return sortFn(best, current);
            }, null);
        return voices[0];
    }

    static minVoiceMovement(chordA, chordB) {
        [chordA, chordB] = [chordA, chordB].sort((a, b) => b.length - a.length);
        const picks = Permutation.binomial(chordA, chordB.length);
        return picks.reduce((min, current) => {
            const diff = Voicing.voicingMovement(current, chordB, false);
            if (Math.abs(diff) < Math.abs(min)) {
                return diff;
            }
            return min;
        }, 100);
    }

    static getVoices(chord, voices = 4, rootless = false, tension = 1) {
        // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
        chord = Harmony.getTonalChord(chord);
        const tokens = Chord.tokenize(chord);
        const required = Voicing.getRequiredNotes(chord);
        let optional = Voicing.getOptionalNotes(chord, required);
        let choices = [].concat(required);
        const remaining = () => voices - choices.length;
        if (tension > 0) {
            choices = choices.concat(Voicing.getAvailableTensions(chord).slice(0, tension));
        }
        if (remaining() > 0) {
            choices = choices.concat(optional);
        }
        if (remaining() < 0 && rootless) {
            choices = choices.filter(n => n !== tokens[0]);
        }
        if (remaining() > 0) {
            // console.warn(`${remaining} notes must be doubled!!!`);
            choices = choices.concat(required, optional).slice(0, voices);
        }
        return choices.slice(0, voices);
    }
 */
},{"../util/Permutation":"../lib/util/Permutation.js","../util/Logger":"../lib/util/Logger.js","tonal":"../node_modules/tonal/index.js","../util/util":"../lib/util/util.js","./Harmony":"../lib/harmony/Harmony.js"}],"../lib/sheet/Snippet.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Measure_1 = require("./Measure");

var Sheet_1 = require("./Sheet");

var Rhythm_1 = require("../rhythmical/Rhythm");

var Snippet =
/** @class */
function () {
  function Snippet() {}

  Snippet.render = function (snippet, options) {
    var parsed = Snippet.parse(snippet);
    return Sheet_1.Sheet.render(parsed, __assign({}, options));
  };

  Snippet.wrapPipes = function (string) {
    return ("|" + string + "|").replace(/\|+/g, '|');
  };

  Snippet.formatForDiff = function (snippet) {
    return Snippet.minify(snippet).replace(/\|/g, ' | ').trim();
  };

  Snippet.format = function (snippet, linebreaks) {
    if (linebreaks === void 0) {
      linebreaks = true;
    } // replaces url chars back


    var compact = Snippet.minify(snippet, false);
    compact = Snippet.wrapPipes(compact);

    if (linebreaks) {
      compact = Snippet.parseBars(snippet).compact;
    } else {
      compact = compact.replace(/\n/g, '|');
    }

    return compact.replace(/\|+/g, '|').replace(/\|( +)\|( +)/g, ' $1 $2') // remove spacer bar pipes
    .replace(/\|( +)\|([1-9])/g, ' $1|$2').replace(/^\s+|\s+$/g, ''); // remove spaces/line breaks from start/end
  };

  Snippet.parseBars = function (snippet) {
    var compact = Snippet.minify(snippet, false);
    compact = Snippet.wrapPipes(compact); // insert spaces before first chord

    var cells = compact.split('|').slice(1, -1);
    cells = cells.map(function (bar, index) {
      if (!bar[0].match(/[1-9:]/)) {
        bar = '  ' + bar;
      } else if (bar[0] === ':') {
        bar = ': ' + bar.slice(1);
      }

      return bar;
    }); // find out indices of first houses

    var houses = cells.reduce(function (offset, bar, index) {
      if (bar[0] === '1') {
        offset.push(index);
      }

      return offset;
    }, []); // insert empty cells before additional houses

    cells = cells.reduce(function (cells, bar, index) {
      if (bar[0].match(/[2-9]/)) {
        var offset = houses.filter(function (h) {
          return h < index;
        }).reverse()[0];

        if (offset > 0) {
          cells = cells.concat(new Array(offset % 4).fill(''));
        }
      }

      cells.push(bar);
      return cells;
    }, []); // find out the maximal number of chars per column

    var chars = cells.reduce(function (max, bar, index) {
      max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
      return max;
    }, []); // fill up each bar with spaces

    compact = cells.map(function (bar, index) {
      var diff = chars[index % 4] - bar.length + 2;

      if (diff > 0) {
        bar += new Array(diff).fill(' ').join('');
      } // move double dots to end of bar


      bar = bar.replace(/:(\s+)$/, '$1:');
      return bar;
    }).join('|');
    compact = Snippet.wrapPipes(compact); // break string all 4 cells

    var pipeIndex = -1;
    compact = compact.split('').reduce(function (string, char, index) {
      if (char === '|') {
        pipeIndex++;
      }

      if (char === '|' && pipeIndex % 4 === 0 && index > 0 && index < compact.length - 1) {
        char = "|\n|";
        pipeIndex = 0;
      }

      return string + char;
    }, '');
    return {
      compact: compact,
      cells: cells,
      houses: houses,
      chars: chars
    };
  };

  Snippet.columnChars = function (snippet) {
    var bars = snippet.split('|');
    var chars = bars.reduce(function (max, bar, index) {
      max[index % 4] = Math.max(bar.length, max[index % 4] || 0);
      return max;
    }, []);
  };

  Snippet.getCellBounds = function (index, snippet) {
    var _a = Snippet.parseBars(snippet),
        chars = _a.chars,
        cells = _a.cells; // get correct index with offset (dont count empty cells)


    index = cells.map(function (cell, index) {
      return {
        cell: cell,
        index: index
      };
    }).filter(function (_a) {
      var cell = _a.cell;
      return cell !== '';
    })[index].index;
    index = index % cells.length;
    var col = index % 4;
    var row = Math.floor(index / 4);
    var rowlength = chars.reduce(function (sum, current) {
      return sum + current + 3;
    }, 0) + 2;
    var rowLeft = rowlength * row;
    var left = rowLeft + chars.slice(0, col).reduce(function (sum, current, i) {
      return sum + current + 3;
    }, 0) + 1;
    return [left, left + chars[col] + 2];
  };

  Snippet.minify = function (snippet, urlsafe) {
    if (urlsafe === void 0) {
      urlsafe = false;
    }

    var compact = ("|" + snippet + "|").replace(/\n+/g, '|') // replace line breaks with pipes
    .replace(/\s+/g, ' ') // no repeated pipes
    .replace(/\s?\|\s?/g, '|') // no pipes with spaces
    .replace(/\s?\:\s?/g, ':') // no repeat with spaces
    .replace(/\|+/g, '|'); // no repeated pipes

    if (urlsafe) {
      // replaces url unfriendly chars
      compact = compact.replace(/\|+/g, 'I').replace(/\s+/g, '_').replace(/:/g, 'R').replace(/\^/g, 'M').replace(/\#/g, 'Y').replace(/\%/g, 'X');
    } else {
      // replaces url unfriendly chars
      compact = compact.replace(/\I+/g, '|').replace(/\_+/g, ' ').replace(/R/g, ':').replace(/M/g, '^').replace(/X/g, 'x').replace(/Y/g, '#');
    }

    return compact.slice(1, -1);
  };

  Snippet.getControlSigns = function (symbols) {
    if (symbols === void 0) {
      symbols = [];
    }

    return symbols.filter(function (s) {
      return typeof s === 'string';
    }) // control should not be nested!
    .map(function (s) {
      return Snippet.controlSigns.find(function (c) {
        return [c.name, c.short].includes(s.replace('(', '').replace(')', ''));
      });
    }).filter(function (s) {
      return !!s;
    });
  };

  Snippet.parse = function (snippet, simplify) {
    if (simplify === void 0) {
      simplify = true;
    }

    var formatted = Snippet.format(snippet, false);
    return formatted.split('|') // split into measures
    .map(function (measure) {
      return measure.split(' ');
    }) // split measures by spaces
    .map(function (measure) {
      return measure.filter(function (chord) {
        return !!chord;
      });
    }) // kill empty chords
    .filter(function (measure) {
      return !measure || measure.length;
    }) // kill empty measures
    .map(function (measure) {
      return {
        symbols: measure,
        signs: []
      };
    }) // parse symbols to chords and signs
    .map(function (measure) {
      // repeat start
      if (measure.symbols[0][0] === ':') {
        if (measure.symbols[0].length === 1) {
          measure.symbols = measure.symbols.slice(1);
        }

        measure.signs.unshift('{');
      }

      var last = measure.symbols[measure.symbols.length - 1]; // repeat end

      if (last[last.length - 1] === ':') {
        if (last.length === 1) {
          measure.symbols.pop();
        }

        measure.signs.push('}');
      }

      measure.symbols = measure.symbols.map(function (s) {
        return s.replace(/:/g, '');
      });
      var house = measure.symbols.find(function (s) {
        return s.match(/^[1-9]$/);
      });

      if (house) {
        measure.house = parseInt(house);
      }

      measure.symbols = measure.symbols.filter(function (s) {
        return !s.match(/^[1-9]$/);
      });
      var controlSigns = Snippet.getControlSigns(measure.symbols);

      if (controlSigns.length) {
        measure.signs = measure.signs.concat(controlSigns.map(function (sign) {
          return sign.name;
        }));
        measure.symbols = measure.symbols.filter(function (s) {
          return !controlSigns.find(function (c) {
            return [c.name, c.short].includes(s.replace(')', '').replace('(', ''));
          });
        });
      }

      measure.body = [].concat(measure.symbols);
      delete measure.symbols;
      return measure;
    }).map(function (measure) {
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
    }) // kill empty measures
    .filter(function (measure) {
      return Object.keys(measure).length > 0;
    }) // simplify => measures with only chords will be arrays
    .map(function (measure) {
      if (!simplify) {
        return measure;
      }

      if (measure.body && Object.keys(measure).length === 1) {
        return measure.body.length === 1 ? measure.body[0] : // simplify one chord measures
        measure.body;
      }

      return measure;
    });
  };

  Snippet.nest = function (string) {
    var nested = string.split('.').map(function (group) {
      return group.trim();
    }).map(function (group) {
      return group.split(' ');
    }).map(function (group) {
      return group.filter(function (chord) {
        return !!chord;
      });
    }) // kill empty chords
    .filter(function (group) {
      return !group || group.length;
    }).map(function (group) {
      return group.length === 1 ? group[0] : group;
    });
    nested = nested.length === 1 ? nested[0] : nested;
    return nested;
  };

  Snippet.parse2 = function (snippet, simplify) {
    if (simplify === void 0) {
      simplify = true;
    }

    var formatted = Snippet.format(snippet, false);
    return formatted.split('|') // split into measures
    .filter(function (measure) {
      return measure && measure.length;
    }) // kill empty measures
    .map(function (measure) {
      return {
        symbols: measure.trim(),
        signs: []
      };
    }) // parse symbols to chords and signs
    .map(function (measure) {
      // repeat start
      if (measure.symbols[0] === ':') {
        measure.signs.unshift('{');
      }

      var last = measure.symbols[measure.symbols.length - 1]; // repeat end

      if (last === ':') {
        measure.signs.push('}');
      }

      measure.symbols = measure.symbols.replace(/:/g, '');
      var house = measure.symbols[0].match(/^[1-9]$/);

      if (house) {
        measure.house = parseInt(house);
        measure.symbols = measure.symbols.slice(1);
      }

      measure.symbols = [].concat(Snippet.nest(measure.symbols));
      var controlSigns = Snippet.getControlSigns(measure.symbols);

      if (controlSigns.length) {
        measure.signs = measure.signs.concat(controlSigns.map(function (sign) {
          return sign.name;
        }));
        measure.symbols = measure.symbols.filter(function (s) {
          return !controlSigns.find(function (c) {
            return [c.name, c.short].includes(s.replace(')', '').replace('(', ''));
          });
        });
      }

      measure.body = measure.symbols;
      delete measure.symbols;
      return measure;
    }).map(function (measure) {
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
    }) // kill empty measures
    .filter(function (measure) {
      return Object.keys(measure).length > 0;
    }) // simplify => measures with only chords will be arrays
    .map(function (measure) {
      if (!simplify) {
        return measure;
      }

      if (measure.body && Object.keys(measure).length === 1) {
        return measure.body.length === 1 ? measure.body[0] : // simplify one chord measures
        measure.body;
      }

      return measure;
    });
  };

  Snippet.testFormat = function (measures) {
    return measures.map(function (m) {
      return m.body;
    }).join(' ');
  };

  Snippet.from = function (measures, format) {
    if (format === void 0) {
      format = true;
    }

    var snippet = measures.map(function (m) {
      return Measure_1.Measure.from(m);
    }).reduce(function (snippet, _a) {
      var signs = _a.signs,
          house = _a.house,
          body = _a.body;
      var controlSigns = Snippet.getControlSigns(signs || []);
      var start = controlSigns.filter(function (c) {
        return !c.end;
      }).map(function (c) {
        return '(' + c.short + ')';
      }).join(' ');
      var end = controlSigns.filter(function (c) {
        return !!c.end;
      }).map(function (c) {
        return '(' + c.short + ')';
      }).join(' ');
      var repeatStart = signs && signs.includes('{');
      var repeatEnd = signs && signs.includes('}');
      body = Rhythm_1.Rhythm.from(body);
      return snippet + ("|" + (repeatStart ? ':' : '') + (house || '') + " " + (start ? start + ' ' : '') + (body ? body.join(' ') : '') + (end ? ' ' + end : '') + (repeatEnd ? ':' : ''));
    }, '');

    if (format) {
      return Snippet.format(snippet);
    }

    return Snippet.minify(snippet);
  };

  Snippet.expand = function (snippet, options) {
    return Snippet.from(Snippet.render(snippet, options));
  };

  Snippet.obfuscate = function (snippet, keepFirst, format) {
    if (keepFirst === void 0) {
      keepFirst = true;
    }

    if (format === void 0) {
      format = true;
    }

    var chords = Snippet.parse(snippet);
    return Snippet.from(Sheet_1.Sheet.obfuscate(chords, keepFirst), format);
  };

  Snippet.controlSigns = [{
    name: 'DC',
    short: 'DC',
    end: true
  }, {
    name: 'DS',
    short: 'DS',
    end: true
  }, {
    name: 'Segno',
    short: 'S'
  }, {
    name: 'DS.Fine',
    short: 'DS',
    end: true
  }, {
    name: 'DS.Coda',
    short: 'DS',
    end: true
  }, {
    name: 'DC.Fine',
    short: 'DC',
    end: true
  }, {
    name: 'DC.Coda',
    short: 'DC',
    end: true
  }, {
    name: 'Fine',
    short: 'Fi',
    end: true
  }, {
    name: 'ToCoda',
    short: '2Q',
    end: true
  }, {
    name: 'Coda',
    short: 'Q'
  }];
  return Snippet;
}();

exports.Snippet = Snippet;
},{"./Measure":"../lib/sheet/Measure.js","./Sheet":"../lib/sheet/Sheet.js","../rhythmical/Rhythm":"../lib/rhythmical/Rhythm.js"}],"../lib/util/Logger.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var tonal_1 = require("tonal");

var Harmony_1 = require("../harmony/Harmony");

var Voicing_1 = require("../harmony/Voicing");

var Snippet_1 = require("../sheet/Snippet");

var util_1 = require("./util");

var Rhythm_1 = require("../rhythmical/Rhythm");

var Logger =
/** @class */
function () {
  function Logger() {}

  Logger.logCustom = function (args, logFn) {
    if (logFn === void 0) {
      logFn = console.log;
    }
    /* console.clear(); */


    logFn.apply(console, args);
  };

  Logger.logLegend = function () {
    if (console.groupCollapsed) {
      console.groupCollapsed('Show Emoji Legend');
      console.table(Logger.emoji);
      console.groupEnd();
    } else {
      console.log('Emoji Legend:', Logger.emoji);
    }
  };

  Logger.logSequence = function (sequence) {
    /* sequence.forEach(event => {
        console.log({
            ...event,
            path: Sheet.simplePath(event.path),
            divisions: Sheet.simplePath(event.divisions),
            velocity: Math.round(event.velocity * 10) / 10
        })
    }); */
    sequence.reduce(function (blocks, event) {
      var alreadyParsed = !!blocks.find(function (b) {
        return Rhythm_1.Rhythm.haveSamePath(b, event);
      });

      if (alreadyParsed) {
        return blocks;
      }

      var sameTime = sequence.filter(function (e) {
        return Rhythm_1.Rhythm.haveSamePath(e, event);
      });
      var degrees;
      var chord = event.chord;

      if (!chord) {
        var latestChordBlock = [].concat(blocks).reverse().find(function (b) {
          return b.type === 'chord';
        });
        chord = (latestChordBlock || {}).chord;
      }

      degrees = util_1.getStepsInChord(sameTime.map(function (e) {
        return e.value;
      }), chord, true).map(function (step) {
        return util_1.getDegreeFromStep(step);
      }).map(function (step) {
        return step === 8 ? 1 : step;
      });
      blocks.push({
        path: event.path,
        events: sameTime,
        degrees: degrees,
        chord: chord
      });
      return blocks;
    }, []).forEach(function (block) {
      var notes = block.events.map(function (e) {
        return e.value;
      });
      var konsole = Logger.logNotes({
        notes: notes,
        active: notes,
        idle: [],
        added: [],
        range: ['C3', 'C6'],
        labels: block.degrees || notes
      });
      konsole.push(block.value);
      konsole.push(Rhythm_1.Rhythm.simplePath(block.path));
      Logger.logCustom(konsole, console.log);
    });
  };

  Logger.logSheet = function (sheet) {
    sheet = __assign({
      title: 'Untitled',
      composer: 'Unkown',
      chords: [],
      forms: 3,
      tempo: 130,
      style: 'Swing'
    }, sheet);
    var chords = Snippet_1.Snippet.from(sheet.chords || []);
    var melody = Snippet_1.Snippet.from(sheet.melody || []);
    console.log(sheet.composer + " - " + sheet.title);
    console.log(sheet.tempo + "bpm, Style: " + sheet.style);
    console.log(chords);
    console.log('---');
    console.log(melody);

    if (console.groupCollapsed) {
      console.log('Sheet', sheet);
      /* console.log('Groove', sheet.groove); */

      console.groupCollapsed("show " + sheet.forms + " rendered forms");
      console.log("expanded chords\n\n" + Snippet_1.Snippet.expand(chords, {
        forms: sheet.forms || 1
      }));
      console.log("expanded melody\n\n" + Snippet_1.Snippet.expand(melody, {
        forms: sheet.forms || 1
      }));
      console.groupEnd();
    }
  };

  Logger.logLabel = function (key) {
    if (!Logger.emoji[key]) {
      return key;
    }

    return Logger.emoji[key].icon + ' ' + key;
  };

  Logger.logChoice = function (choice) {
    var _a;

    if (!choice) {
      return;
    }

    var difference = choice.difference,
        origin = choice.origin,
        targets = choice.targets,
        from = choice.from,
        to = choice.to,
        movement = choice.movement,
        similar = choice.similar,
        added = choice.added,
        dropped = choice.dropped,
        contrary = choice.contrary,
        parallel = choice.parallel,
        topInterval = choice.topInterval,
        bottomInterval = choice.bottomInterval,
        topNotes = choice.topNotes,
        bottomNotes = choice.bottomNotes,
        intervals = choice.intervals,
        degrees = choice.degrees;
    console.table((_a = {
      difference: difference,
      movement: movement,
      origin: origin.join(' '),
      dropped: dropped.join(' '),
      added: added.join(' '),
      targets: targets.join(' '),

      /* from: from.join(' '),
      to: to.join(' '), */
      intervals: intervals.join(' '),
      degrees: degrees.join(' ')
    }, _a[Logger.logLabel('similar')] = similar, _a[Logger.logLabel('contrary')] = contrary, _a[Logger.logLabel('parallel')] = parallel, _a.topNotes = topNotes.join(' '), _a.topInterval = topInterval, _a.bottomNotes = bottomNotes.join(' '), _a.bottomInterval = bottomInterval, _a));
  };

  Logger.logNotes = function (options) {
    var _a = __assign({
      labels: []
    }, options),
        notes = _a.notes,
        active = _a.active,
        idle = _a.idle,
        added = _a.added,
        range = _a.range,
        labels = _a.labels;

    var span = [tonal_1.Distance.transpose(range[0], tonal_1.Interval.fromSemitones(-12)), tonal_1.Distance.transpose(range[1], tonal_1.Interval.fromSemitones(12))];
    var allNotes = util_1.noteArray(span);
    var keyboard = allNotes.map(function (note, index) {
      var isActive = active.find(function (n) {
        return Harmony_1.Harmony.hasSamePitch(note, n);
      });
      var isUsed = notes.find(function (n) {
        return Harmony_1.Harmony.hasSamePitch(note, n);
      });
      var i = notes.indexOf(isUsed);
      var isIdle = idle.find(function (n) {
        return Harmony_1.Harmony.hasSamePitch(note, n);
      });
      var isAdded = added.find(function (n) {
        return Harmony_1.Harmony.hasSamePitch(note, n);
      });
      var isBlack = Harmony_1.Harmony.isBlack(note);
      var css = '',
          sign = '_';

      if (isAdded && !isBlack) {
        css = 'background:green;color:white;';
        sign = labels[i] || '|';
      } else if (isAdded && isBlack) {
        css = 'background:darkgreen;color:white;';
        sign = labels[i] || '|';
      } else if (isActive && isBlack) {
        css = 'background:#a50909;color:white;';
        sign = labels[i] || '|';
      } else if (isActive && !isBlack) {
        css = 'background:#e52929;color:white;';
        sign = labels[i] || '|';
      } else if (isIdle && !isBlack) {
        css = 'background:gray;color:white;';
        sign = labels[i] || '|';
      } else if (isIdle && isBlack) {
        css = 'background:darkgray;color:white;';
        sign = labels[i] || '|'; // █
      } else {
        css = isBlack ? 'color:black;' : 'color:#eee;';
      }

      var position = util_1.getRangePosition(note, range);

      if (position < 0 || position > 1) {
        if (active || idle || added) {
          css += 'color:red;';
          sign = ' ';
        } else {
          sign = ' ';
        }
      }

      return {
        sign: sign,
        css: css
      };
    });
    var args = [keyboard.map(function (key) {
      return "%c" + key.sign;
    }).join('')].concat(keyboard.map(function (key) {
      return key.css + ";";
    }));
    /* Snippet.logCustom(args); */

    return args;
  };

  Logger.logVoicing = function (_a) {
    var chord = _a.chord,
        previousVoicing = _a.previousVoicing,
        logIdle = _a.logIdle,
        combinations = _a.combinations,
        bestPick = _a.bestPick,
        pick = _a.pick,
        range = _a.range,
        choice = _a.choice,
        direction = _a.direction,
        choices = _a.choices,
        options = _a.options;
    /* pick = pick.map(n => Note.simplify(n)); */

    pick = pick || [];
    previousVoicing = previousVoicing || [];
    var idle = previousVoicing.filter(function (n) {
      return pick.find(function (p) {
        return Harmony_1.Harmony.hasSamePitch(n, p);
      });
    });
    var isIdle = choice && choice.oblique.length === choice.targets.length;

    if (isIdle && !logIdle) {
      return;
    }

    var active = pick.filter(function (n) {
      return !previousVoicing.find(function (p) {
        return Harmony_1.Harmony.hasSamePitch(n, p);
      });
    });
    var added = choice ? choice.added : [];
    var degrees = util_1.getStepsInChord(pick, chord, true).map(function (step) {
      return util_1.getDegreeFromStep(step);
    }).map(function (step) {
      return step === 8 ? 1 : step;
    });
    var konsole = Logger.logNotes({
      notes: pick,
      active: active,
      idle: idle,
      added: added,
      range: range,
      labels: degrees
    });
    var movement = choice ? choice.movement : 0;
    var difference = choice ? choice.difference : 0;
    choices = choices || [];

    if (movement > 0) {
      konsole.push(Logger.emoji.movedUp.icon);
    } else if (movement < 0) {
      konsole.push(Logger.emoji.movedDown.icon);
    } else {
      konsole.push(Logger.emoji.equilibrium.icon);
    }

    if (!pick.length) {
      konsole.push(Logger.emoji.error.icon);
    } // TODO replace force with filter of choices after isInRange
    //      isInRange: checks if top and bottom note are inside the range


    if (!direction) {
      konsole.push(Logger.emoji.bestMatch.icon);
    } else {
      if (bestPick !== pick) {
        konsole.push(Logger.emoji.force.icon);
      } else {
        konsole.push(Logger.emoji.lucky.icon);
      } // wrong direction?


      if (direction === 'up' && movement < 0 || direction === 'down' && movement > 0) {
        konsole.push(Logger.emoji.wrong.icon);
      }
    }

    if (choice) {
      if (choice.similar) {
        konsole.push(Logger.emoji.similar.icon);
      }

      if (choice.contrary) {
        konsole.push(Logger.emoji.contrary.icon);
      }

      if (choice.parallel) {
        konsole.push(Logger.emoji.parallel.icon);
      }

      if (choice.added.length && choice.added[choice.added.length - 1] === choice.topNotes[1]) {
        konsole.push(Logger.emoji.topAdded.icon);
      }

      if (choice.dropped.length && choice.dropped[choice.dropped.length - 1] === choice.topNotes[0]) {
        konsole.push(Logger.emoji.topRemoved.icon);
      }

      if (choice.dropped.length && choice.dropped[0] === choice.origin[0]) {
        konsole.push(Logger.emoji.bottomRemoved.icon);
      }

      if (choice.added.length && choice.added[0] === choice.targets[0]) {
        konsole.push(Logger.emoji.bottomAdded.icon);
      }

      if (!Voicing_1.Voicing.hasTonic(pick, chord)) {
        konsole.push(Logger.emoji.rootless.icon);
      }

      if (!choice.parallel && choice.oblique.length === 0) {
        konsole.push(Logger.emoji.noOblique.icon);
      }

      if (isIdle) {
        konsole.push(Logger.emoji.noChange.icon);
      }
    }

    if (choices.length) {
      if (choices.length < pick.length) {
        konsole.push(Logger.emoji.fewChoices.icon);
      }
    }

    konsole.push("" + chord);

    if (console && console.table) {
      Logger.logCustom(konsole, console.groupCollapsed);
      console.log(previousVoicing.join(' ') + " > " + pick.join(' ') + " (" + (choices.indexOf(choice) + 1) + ". choice of " + choices.length + ")");
      previousVoicing = previousVoicing || [];

      if (choice) {
        console.group('Choice:');
        Logger.logChoice(choice);
        console.groupEnd();
        console.log('Options', options);
        console.groupCollapsed('All Choices:');
        choices.forEach(function (c) {
          return Logger.logChoice(c);
        });
        console.groupEnd();
        console.groupCollapsed('Combinations:');
        console.log(combinations);
        console.groupEnd();
      }

      console.groupEnd();
    } //console.log(`${ Snippet.voicing(voicing, ['G2', 'C5']) } ${ chord }: ${ voicing.join(' ') } `);
    //console.log(`#${ event.path[1] + 1 }: ${ chord }: ${ latest } > ${ voicing }.moved ${ moves } (avg | ${ avgDiff } | total ${ totalMoves })`);
    // console.log(chord, voicing);
    // G#o7 2 (5.25) (4) ["G3", "D4", "F4", "Bb4"] > (4) ["B2", "D3", "E#3", "G#3"]

    /* } */


    return pick;
  };

  Logger.emoji = {
    bestMatch: {
      icon: '🎹',
      description: 'The selected voicing had the best possible voice leading from the previous voicing'
    },
    force: {
      icon: '💪',
      description: 'Voicing had to be forced in the desired direction. The best pick would have gone in the wrong direction.'
    },
    lucky: {
      icon: '🍀',
      description: 'The best pick moved in the direction that would have been forced.'
    },
    wrong: {
      icon: '💀',
      description: 'Continued moving in the wrong direction'
    },
    similar: {
      icon: '😇',
      description: 'All voices are moving in the same direction'
    },
    parallel: {
      icon: '⛓',
      description: 'All voices are moving by parallel intervals'
    },
    contrary: {
      icon: '👹',
      description: 'Some voices were moving in opposite directions'
    },
    noOblique: {
      icon: '🥌',
      description: 'All voices changed position. (Not shown when parallel)'
    },
    noChange: {
      icon: '🛋',
      description: 'All voices remained in position.'
    },
    topAdded: {
      icon: '🌤',
      description: 'A top voice was added'
    },
    topRemoved: {
      icon: '⛅',
      description: 'A top voice was dropped'
    },
    bottomRemoved: {
      icon: '🛫',
      description: 'A bottom voice was dropped'
    },
    bottomAdded: {
      icon: '🌳',
      description: 'A bottom note was added'
    },
    movedUp: {
      icon: '↗️',
      description: 'The Voices generally moved up'
    },
    movedDown: {
      icon: '↙️',
      description: 'The Voices generally moved down'
    },
    equilibrium: {
      icon: '☯️',
      description: 'The Voices generally did not move anywhere'
    },
    fewChoices: {
      icon: '❓',
      description: 'There were very few valid combinations to choose from'
    },
    error: {
      icon: '❌',
      description: 'No notes could be selected. Some error happened.'
    },
    rootless: {
      icon: '⛵',
      description: 'The voicing does not contain its root note (tonic).' // ️️️️️➡️↘️↗️⬇️⬆️⬅️

    }
  };
  return Logger;
}();

exports.Logger = Logger;
},{"tonal":"../node_modules/tonal/index.js","../harmony/Harmony":"../lib/harmony/Harmony.js","../harmony/Voicing":"../lib/harmony/Voicing.js","../sheet/Snippet":"../lib/sheet/Snippet.js","./util":"../lib/util/util.js","../rhythmical/Rhythm":"../lib/rhythmical/Rhythm.js"}],"../lib/Band.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Pulse_1 = require("./Pulse");

var Sheet_1 = require("./sheet/Sheet");

var Metronome_1 = require("./Metronome");

var Logger_1 = require("./util/Logger");

var Snippet_1 = require("./sheet/Snippet");
/** Band */


var Band =
/** @class */
function () {
  function Band(_a) {
    var _b = _a === void 0 ? {} : _a,
        context = _b.context,
        musicians = _b.musicians,
        onMeasure = _b.onMeasure;

    this.defaults = {
      cycle: 4,
      division: 3,
      transpose: 0,
      style: 'Medium Swing'
    };
    this.context = context || new AudioContext();
    this.onMeasure = onMeasure;
    this.musicians = musicians || [];
    this.mix = this.setupMix(this.context);
    this.metronome = new Metronome_1.Metronome(this.mix);
  }

  Band.prototype.setupMix = function (context) {
    var mix = context.createGain();
    mix.gain.value = 0.9;
    mix.connect(context.destination);
    return mix;
  };

  Band.prototype.addMember = function (musician) {
    this.musicians = this.musicians.concat(musician);
  };

  Band.prototype.ready = function () {
    return Promise.all([this.resume()].concat(this.musicians.map(function (m) {
      return m.ready;
    })));
  };

  Band.prototype.resume = function () {
    var _this = this;

    return this.context.resume ? this.context.resume().then(function () {
      return _this.context;
    }) : Promise.resolve(this.context);
  };

  Band.prototype.comp = function (sheet, settings) {
    if (this.pulse) {
      this.pulse.stop();
    }

    Logger_1.Logger.logLegend();
    Logger_1.Logger.logSheet(sheet);

    if (settings.onMeasure) {
      this.onMeasure = settings.onMeasure;
    }

    console.log('sheet', sheet);
    var measures = Sheet_1.Sheet.render(sheet.chords, settings.render);
    console.log(Snippet_1.Snippet.from(measures));
    settings = Object.assign(this.defaults, settings, {
      context: this.context
    });
    this.play(measures, settings);
  };

  Band.prototype.play = function (measures, settings) {
    var _this = this;

    this.ready().then(function () {
      _this.pulse = settings.pulse || new Pulse_1.Pulse(settings);
      return _this.count(_this.pulse, settings.metronome ? null : 0);
    }).then(function (tick) {
      /* settings.deadline = tick.deadline; */
      if (_this.onMeasure) {
        // TODO: add onChord for setting tonics + circle chroma etc
        _this.pulse.tickArray(measures.map(function (measure) {
          return {
            measure: measure
          };
        }), function (tick) {
          return _this.onMeasure(tick.value.measure, tick);
        });
      }

      measures = measures.map(function (m) {
        return m.chords ? m.chords : m;
      });
      console.log('Band#play', settings);
      var musicians = settings.musicians || _this.musicians;

      if (settings.exact) {
        musicians = _this.musicians.slice(0, 2);
      }

      musicians.forEach(function (musician) {
        return musician.play({
          pulse: _this.pulse,
          measures: measures,
          settings: settings
        });
      });

      _this.pulse.start();
    });
  };

  Band.prototype.count = function (pulse, bars) {
    if (bars === void 0) {
      bars = 1;
    }

    if (pulse.getMeasureLength() < 1.5) {
      bars *= 2; //double countin bars when countin would be shorter than 1.5s
    }

    return this.metronome.count(pulse, bars);
  };

  return Band;
}();

exports.default = Band;
},{"./Pulse":"../lib/Pulse.js","./sheet/Sheet":"../lib/sheet/Sheet.js","./Metronome":"../lib/Metronome.js","./util/Logger":"../lib/util/Logger.js","./sheet/Snippet":"../lib/sheet/Snippet.js"}],"../lib/musicians/Musician.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Musician =
/** @class */
function () {
  function Musician(instrument) {
    this.name = 'Musician';
    this.gain = 1;

    if (!instrument) {
      console.warn('musician has no instrument', this);
    }

    this.instrument = instrument;
    this.ready = this.instrument ? this.instrument.ready : Promise.resolve();
  }

  Musician.prototype.play = function (_a) {
    var pulse = _a.pulse,
        measures = _a.measures,
        settings = _a.settings;
    console.log('play..', pulse, measures, settings);
  };

  Musician.prototype.getGain = function (value) {
    if (value === void 0) {
      value = 1;
    }

    return value * this.gain * this.instrument.gain;
  };

  return Musician;
}();

exports.Musician = Musician;
},{}],"../lib/grooves/swing.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("../util/util");

var off = function off() {
  return util_1.randomElement([0, [0, 0, 2]], [6, 1]);
};

var eightFour = function eightFour() {
  return util_1.randomElement([[1, 0, 1], 1, [0, 0, 1, 1]], [4, 2, 1]);
};

var eightOff = function eightOff() {
  return util_1.randomElement([[1, 0, 1], [0, 0, 1]], [4, 1]);
};

var halfTriplet = function halfTriplet() {
  return util_1.randomElement([[2, 0], [[2, 0, 2], [0, 2, 0]], [1, 1, 1, 1]], [2, 1, 1]);
};

exports.swing = {
  name: 'Swing',
  tempo: 130,
  chords: function chords(_a) {
    var measure = _a.measure,
        settings = _a.settings;
    var r = Math.random() > 0.5 ? .6 : 0;
    var t = settings.cycle + "/" + measure.length;

    if (t === '4/1') {
      return util_1.randomElement([[[1, 0], [0, 0, 7], 0, 0], [1, [0, 0, 2], 0, off()], [[0, 0, 1], 0, 2, 0], [[0, 0, 4], 0, 1, 0], [2, 0, 0, 0], [3, 0, 0, 0], [1, 0, r, off()], [[0, 0, 2], 0, r, 0], [1.5, [0, 0, 2], 0, off()]]); //, [2, 1, 1]
    }

    if (t === '4/2') {
      return util_1.randomElement([[[1, 0], [0, 0, 7], 0, 0], [1, [0, 0, 3], 0, 0], [1, 0, 2, 0], [2, 0, 1, 0], [1, 0, .7, off()], [[1, 0, 0], 0, .7, off()], [[4, 0, 0], [0, 0, 2.8], 0, off()]]);
    }

    if (t === '4/3') {
      return util_1.randomElement([[1, [0, 0, 2], [0, 0, 4], 0], [1, [2, 0, 0], 2, 0], [1, 1, 2, 0], [[2, 0, 0], 1, 2, 0], [2, 0, 1, 1]]);
    }

    if ('4/4') {
      return util_1.randomElement([[1, 1, 1, 1]]);
    }
  },
  bass: function bass() {
    return util_1.randomElement([[1, 1, 1, 1]]);
  },
  crash: function crash(_a) {
    var measures = _a.measures,
        index = _a.index;
    var fill = index !== 0 && index % measures.length === 0;

    if (fill) {
      return [4, 0, 0, 0];
    }

    return [0, 0, 0, 0];
  },
  ride: function ride(_a) {
    var measures = _a.measures,
        index = _a.index;
    return util_1.randomElement([[.6, [.9, 0, 1], .6, [.9, 0, 1]], [.6, [.4, 0, 1], .8, [0, 0, 1]], [.6, .9, [.6, 0, 1], 1], [.6, .9, .6, [.9, 0, 1]]], [3, 2, 1, 2]);
  },
  hihat: function hihat() {
    return [0, .8, 0, 1];
  },
  solo: function solo() {
    return util_1.randomElement([[eightFour(), eightFour(), eightFour(), eightFour()], [eightFour(), 2, 0, eightFour()], [0, 0, eightFour(), eightFour()], [[1, 0, 4], 0, eightFour(), eightFour()], [3, 0, 0, eightFour()], halfTriplet().concat(halfTriplet()), [eightOff(), eightOff(), eightOff(), eightOff()]]);
  }
  /* solo: () => [1, 1, 0, 1] */

};
},{"../util/util":"../lib/util/util.js"}],"../lib/musicians/Pianist.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("../util/util");

var Musician_1 = require("./Musician");

var swing_1 = require("../grooves/swing");

var Voicing_1 = require("../harmony/Voicing");

var tonal_1 = require("tonal");

var Pianist =
/** @class */
function (_super) {
  __extends(Pianist, _super);

  function Pianist(instrument, props) {
    if (props === void 0) {
      props = {};
    }

    var _this = _super.call(this, instrument) || this;

    _this.name = 'Pianist';
    _this.playedNotes = [];
    _this.playedChords = [];
    _this.defaults = {
      groove: swing_1.swing
    };
    _this.min = Math.min;
    _this.rollFactor = 1; // how much keyroll effect? controls interval between notes

    _this.voicingOptions = {};
    _this.props = Object.assign({}, _this.defaults, props || {});
    return _this;
  }

  Pianist.prototype.play = function (_a) {
    var _this = this;

    var pulse = _a.pulse,
        measures = _a.measures,
        settings = _a.settings;
    var groove = settings.groove || this.defaults.groove;
    var grooveKey = 'chords';
    this.voicingOptions = __assign({}, this.voicingOptions, settings.voicings || {}); // if no groove or groove without chords, or exact, play whats there
    // TODO: exact timing is false with metronome

    if (settings.exact || !groove || !groove[grooveKey]) {
      if (!groove[grooveKey]) {
        console.warn('Groove has no chords, Pianist will play exact.', groove);
      }

      measures = measures.map(function (pattern, i) {
        return util_1.resolveChords(pattern, measures, [i]);
      });
      return pulse.tickArray(measures, function (_a) {
        var value = _a.value,
            deadline = _a.deadline;
        var fraction = util_1.getDuration(value.divisions, 1); // TODO: find out why value fraction is NaN

        var duration = fraction * pulse.getMeasureLength();

        _this.playChord(value.chord || value, {
          deadline: deadline,
          duration: duration,
          pulse: pulse
        });
      });
    } // else, play groovy


    var pattern = groove[grooveKey];
    measures = measures // generate random patterns
    .map(function (measure) {
      return pattern({
        measures: measures,
        pulse: pulse,
        measure: measure,
        settings: settings
      }).slice(0, Math.floor(settings.cycle));
    }) // fill in chords
    .map(function (pattern, i) {
      return util_1.resolveChords(pattern, measures, [i]);
    }) // fix chords at last offbeat
    .reduce(util_1.offbeatReducer(settings), []);
    pulse.tickArray(measures, function (_a) {
      var path = _a.path,
          value = _a.value,
          deadline = _a.deadline;
      var measureLength = pulse.getMeasureLength();
      var concurrency = settings.bpm / (_this.rollFactor || 1);
      var interval = settings.arpeggio ? measureLength / settings.cycle : Math.random() / (concurrency * 20);

      if (path[0] % 2 === 0 && !path[1] && !path[2]) {
        interval = Math.random() / concurrency;
      }

      var duration = settings.arpeggio ? interval : value.fraction * measureLength;
      var slice = settings.arpeggio ? Math.ceil(value.fraction / 1000 * 4) : null;

      var gain = _this.getGain(value.gain);

      _this.playChord(value.chord, {
        deadline: deadline,
        gain: gain,
        duration: duration,
        interval: interval,
        slice: slice,
        pulse: pulse
      });
    }, settings.deadline);
  };

  Pianist.prototype.getLastVoicing = function () {
    return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
  }; // plays the given notes at the given interval


  Pianist.prototype.playNotes = function (scorenotes, _a) {
    var deadline = _a.deadline,
        interval = _a.interval,
        gain = _a.gain,
        duration = _a.duration,
        pulse = _a.pulse;
    this.playedNotes.push([].concat(scorenotes));
    this.instrument.playNotes(scorenotes, {
      deadline: deadline,
      interval: interval,
      gain: gain,
      duration: duration,
      pulse: pulse
    });
  };

  Pianist.prototype.playChord = function (chord, settings) {
    if (chord === 'x') {
      // repeat
      chord = this.playedChords[this.playedChords.length - 1];
    }

    if (!chord || chord === '0') {
      this.playedChords.push('');
      return;
    }

    this.playedChords.push(chord);
    var notes = Voicing_1.Voicing.getNextVoicing(chord, this.getLastVoicing(), settings.voicingOptions || this.voicingOptions);
    notes = notes.map(function (note) {
      return tonal_1.Note.simplify(note);
    });
    settings.deadline += 0.02 + util_1.randomDelay(5);
    this.playNotes(notes, settings);
  };

  return Pianist;
}(Musician_1.Musician);

exports.default = Pianist;
},{"../util/util":"../lib/util/util.js","./Musician":"../lib/musicians/Musician.js","../grooves/swing":"../lib/grooves/swing.js","../harmony/Voicing":"../lib/harmony/Voicing.js","tonal":"../node_modules/tonal/index.js"}],"../lib/musicians/Drummer.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Musician_1 = require("./Musician");

var swing_1 = require("../grooves/swing");

var util_1 = require("../util/util");

var Drummer =
/** @class */
function (_super) {
  __extends(Drummer, _super);

  function Drummer(instrument) {
    var _this = _super.call(this, instrument) || this;

    _this.name = 'Drummer';
    _this.set = {
      kick: 0,
      snare: 1,
      hihat: 2,
      ride: 3,
      crash: 4,
      rimshot: 5
    };
    _this.defaults = {
      groove: swing_1.swing
    };
    return _this;
  }

  Drummer.prototype.play = function (_a) {
    var _this = this;

    var measures = _a.measures,
        pulse = _a.pulse,
        settings = _a.settings;
    var groove = settings.groove || this.defaults.groove;
    Object.keys(groove).filter(function (t) {
      return Object.keys(_this.set).includes(t);
    }) // only use drum set patterns
    .forEach(function (key) {
      var patterns = measures.map(function (measure, index) {
        return groove[key]({
          measures: measures,
          index: index,
          measure: measure,
          settings: settings,
          pulse: pulse
        }).slice(0, Math.floor(settings.cycle));
      });
      pulse.tickArray(patterns, function (_a) {
        var deadline = _a.deadline,
            value = _a.value;
        deadline += util_1.randomDelay(5);

        _this.instrument.playKeys([_this.set[key]], {
          deadline: deadline,
          gain: _this.getGain(value)
        });
      }, settings.deadline);
    });
  };

  return Drummer;
}(Musician_1.Musician);

exports.default = Drummer;
},{"./Musician":"../lib/musicians/Musician.js","../grooves/swing":"../lib/grooves/swing.js","../util/util":"../lib/util/util.js"}],"../lib/musicians/Bassist.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("../util/util");

var Musician_1 = require("./Musician");

var tonal_1 = require("tonal");

var swing_1 = require("../grooves/swing");

var Harmony_1 = require("../harmony/Harmony");

var Bassist =
/** @class */
function (_super) {
  __extends(Bassist, _super);

  function Bassist(instrument) {
    var _this = _super.call(this, instrument) || this;

    _this.name = 'Bassist';
    _this.defaults = {
      groove: swing_1.swing
    };
    _this.playedChords = [];
    return _this;
  }

  Bassist.prototype.play = function (_a) {
    var _this = this;

    var measures = _a.measures,
        pulse = _a.pulse,
        settings = _a.settings;
    var groove = settings.groove || this.defaults.groove;
    var pattern = groove['bass'];

    if (!pattern) {
      console.warn('no bass pattern found in groove', groove);
      return;
    }

    measures = measures.map(function (measure) {
      /* if (Array.isArray(measure)) {
          return measure;
      } */
      return pattern({
        measures: measures,
        measure: measure,
        settings: settings,
        pulse: pulse
      }).slice(0, Math.floor(settings.cycle));
    }).map(function (pattern, i) {
      return util_1.resolveChords(pattern, measures, [i]);
    });
    pulse.tickArray(measures, function (tick) {
      _this.playBass(tick, measures, pulse);
    }, settings.deadline);
  };

  Bassist.prototype.getStep = function (step, chord, octave) {
    if (octave === void 0) {
      octave = 2;
    }

    var tokens = tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord));
    var interval = tonal_1.Chord.intervals(tokens[1]).find(function (i) {
      return parseInt(i[0]) === step;
    });
    return tonal_1.Distance.transpose(tokens[0] + octave, interval);
  };

  Bassist.prototype.playBass = function (_a, measures, pulse) {
    var value = _a.value,
        cycle = _a.cycle,
        path = _a.path,
        deadline = _a.deadline,
        interval = _a.interval,
        duration = _a.duration;
    var chord = value.chord;

    if (chord === 'N.C.') {
      return;
    }

    if (chord === 'x') {
      chord = this.playedChords[this.playedChords.length - 1];
    }

    if (!chord || chord === '0') {
      this.playedChords.push('');
      return;
    }

    this.playedChords.push(chord);
    var note;
    /* const steps = [1, randomElement([3, 5]), 1, randomElement([3, 5])]; */

    var steps = [1, 5, 1, util_1.randomElement([3, 5])];
    var octave = 2;

    if (steps[path[1]] === 1) {
      note = Harmony_1.Harmony.getBassNote(chord) + octave;
    } else {
      note = this.getStep(steps[path[1]], Harmony_1.Harmony.getTonalChord(chord), octave);
    }

    duration = duration || value.fraction * pulse.getMeasureLength();
    deadline += util_1.randomDelay(10);
    this.instrument.playNotes([note], {
      deadline: deadline,
      interval: interval,
      gain: this.getGain() * .7,
      duration: duration,
      pulse: pulse
    });
  };

  return Bassist;
}(Musician_1.Musician);

exports.default = Bassist;
},{"../util/util":"../lib/util/util.js","./Musician":"../lib/musicians/Musician.js","tonal":"../node_modules/tonal/index.js","../grooves/swing":"../lib/grooves/swing.js","../harmony/Harmony":"../lib/harmony/Harmony.js"}],"../lib/instruments/Sampler.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Instrument_1 = require("./Instrument");

var util_1 = require("../util/util");

var Sampler =
/** @class */
function (_super) {
  __extends(Sampler, _super);

  function Sampler(options) {
    if (options === void 0) {
      options = {};
    }

    var _this = _super.call(this, options) || this;

    _this.buffers = {};
    _this.duration = 10000;
    _this.type = 'sine';
    _this.gain = 1;
    _this.attack = 0;
    _this.decay = 0;
    _this.sustain = 1;
    _this.release = .2;
    _this.gain = options.gain || _this.gain;
    _this.gainNode = _this.context.createGain();

    _this.gainNode.connect(_this.context.destination);

    _this.duration = options.duration || _this.duration; // this.overlap = options.overlap;

    if (options.samples) {
      _this.sources = options.samples;
      _this.ready = _this.loadSources(options.samples);
    }

    return _this;
  } // returns buffer from buffer cache or loads buffer data from source


  Sampler.prototype.getBuffer = function (src, context) {
    var _this = this;

    if (context === void 0) {
      context = this.context;
    }

    if (this.buffers[src] && this.buffers[src].context === context) {
      // console.log('buffer already present');
      return Promise.resolve(this.buffers[src].buffer);
    }

    return fetch(src).then(function (res) {
      return res.arrayBuffer();
    }).then(function (buffer) {
      return new Promise(function (resolve, reject) {
        context.decodeAudioData(buffer, function (decodedData) {
          _this.buffers[src] = {
            buffer: decodedData,
            context: context
          };
          resolve(decodedData);
        });
      });
    });
  };

  Sampler.prototype.getSource = function (buffer, connect) {
    var source = this.context.createBufferSource();
    connect = connect || this.gainNode;
    source.buffer = buffer;
    source.connect(connect);
    return source;
  };

  Sampler.prototype.getSources = function (sources, context) {
    var _this = this;

    if (context === void 0) {
      context = this.context;
    }

    if (!this.hasLoaded(sources)) {
      console.error('not all sources loaded!!!');
      return [];
    }

    return sources.map(function (source) {
      return _this.getSource(_this.buffers[source].buffer);
    });
  }; // loads a sound file into the context


  Sampler.prototype.loadSource = function (src, context) {
    var _this = this;

    if (context === void 0) {
      context = this.context;
    }

    return this.getBuffer(src, context).then(function (decodedData) {
      return _this.getSource(decodedData);
    });
  }; // loads multiple sources into the context


  Sampler.prototype.loadSources = function (sources, context) {
    var _this = this;

    if (context === void 0) {
      context = this.context;
    }

    sources.forEach(function (source, i) {
      if (!source) {
        console.warn("note at index " + i + " cannot be played!");
      }
    });
    return Promise.all(sources.filter(function (source) {
      return !!source;
    }).map(function (source) {
      return _this.loadSource(source, context);
    }));
  };

  Sampler.prototype.hasLoaded = function (sources, context) {
    var _this = this;

    if (context === void 0) {
      context = this.context;
    }

    return sources.reduce(function (allLoaded, src) {
      return allLoaded && _this.buffers[src] && _this.buffers[src].context === context;
    }, true);
  };

  Sampler.prototype.playSounds = function (sounds, deadline, interval) {
    if (deadline === void 0) {
      deadline = this.context.currentTime;
    }

    if (interval === void 0) {
      interval = 0;
    }

    sounds.forEach(function (sound, i) {
      return sound.start(deadline + interval * i);
    });
  };

  Sampler.prototype.playSource = function (source, settings) {
    var gainNode = this.context.createGain();

    if (!this.buffers[source]) {
      console.warn('no buffer found for source', source);
      return;
    }

    var sound = this.getSource(this.buffers[source].buffer, gainNode);
    var _a = [settings.attack || this.attack, settings.decay || this.decay, settings.sustain || this.sustain, settings.release || this.release, (settings.duration || this.duration) / 1000, (settings.gain || 1) * this.gain],
        attack = _a[0],
        decay = _a[1],
        sustain = _a[2],
        release = _a[3],
        duration = _a[4],
        gain = _a[5];
    var time = settings.deadline || this.context.currentTime; //gainNode.gain.value = typeof settings.gain === 'number' ? settings.gain : this.gain;

    gainNode.connect(this.mix);
    util_1.adsr({
      attack: attack,
      decay: decay,
      sustain: sustain,
      release: release,
      gain: gain,
      duration: duration
    }, time, gainNode.gain);
    this.playSounds([sound], time); //, settings.interval
  };
  /* playSources(sources, deadline = 0, interval = 0) {
      if (this.hasLoaded(sources, this.context)) {
          this.playSounds(this.getSources(sources, this.context), deadline, interval)
      } else {
          console.warn('need to load');
          this.loadSources(sources, this.context)
              .then(sounds => this.playSounds(sounds, deadline, interval));
      }
  } */


  Sampler.prototype.playKeys = function (keys, settings) {
    var _this = this;

    _super.prototype.playKeys.call(this, keys, settings);

    keys.forEach(function (key, index) {
      if (settings.delay) {
        settings.deadline += settings.delay;
      }

      _this.playSource(_this.sources[key], settings);
    });
  };

  return Sampler;
}(Instrument_1.Instrument);

exports.Sampler = Sampler;
},{"./Instrument":"../lib/instruments/Instrument.js","../util/util":"../lib/util/util.js"}],"../lib/instruments/Kick.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Kick =
/** @class */
function () {
  function Kick(context) {
    this.context = context;
  }

  Kick.prototype.setup = function () {
    this.osc = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
  };

  Kick.prototype.trigger = function (time) {
    this.setup();
    this.osc.frequency.setValueAtTime(150, time);
    this.gain.gain.setValueAtTime(1, time);
    this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    this.osc.start(time);
    this.osc.stop(time + 0.5);
  };

  return Kick;
}();

exports.Kick = Kick;
},{}],"../lib/instruments/Snare.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Snare =
/** @class */
function () {
  function Snare(context) {
    this.context = context;
  }

  Snare.prototype.noiseBuffer = function () {
    var bufferSize = this.context.sampleRate;
    var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    var output = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  Snare.prototype.setup = function () {
    this.noise = this.context.createBufferSource();
    this.noise.buffer = this.noiseBuffer();
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    this.noise.connect(noiseFilter);
    this.noiseEnvelope = this.context.createGain();
    noiseFilter.connect(this.noiseEnvelope);
    this.noiseEnvelope.connect(this.context.destination);
    this.osc = this.context.createOscillator();
    this.osc.type = 'triangle';
    this.oscEnvelope = this.context.createGain();
    this.osc.connect(this.oscEnvelope);
    this.oscEnvelope.connect(this.context.destination);
  };

  ;

  Snare.prototype.trigger = function (time) {
    this.setup();
    this.noiseEnvelope.gain.setValueAtTime(1, time);
    this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    this.noise.start(time);
    this.osc.frequency.setValueAtTime(100, time);
    this.oscEnvelope.gain.setValueAtTime(0.7, time);
    this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    this.osc.start(time);
    this.osc.stop(time + 0.2);
    this.noise.stop(time + 0.2);
  };

  ;
  return Snare;
}();

exports.Snare = Snare;
},{}],"../lib/instruments/PlasticDrums.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Instrument_1 = require("./Instrument");

var Kick_1 = require("./Kick");

var Snare_1 = require("./Snare");

var PlasticDrums =
/** @class */
function (_super) {
  __extends(PlasticDrums, _super);

  function PlasticDrums(options) {
    var _this = _super.call(this, options) || this;

    _this.keys = [new Kick_1.Kick(_this.context), new Snare_1.Snare(_this.context)];
    return _this;
  }

  PlasticDrums.prototype.playKeys = function (keys, _a) {
    var _this = this;

    var deadline = _a.deadline,
        gain = _a.gain,
        value = _a.value;
    var sounds = keys.filter(function (key) {
      return !!_this.keys[key];
    }).map(function (key) {
      return _this.keys[key];
    });

    if (sounds.length < keys.length) {
      var missing = keys.filter(function (key) {
        return !_this.keys[key];
      }); // console.warn('PlasticDrums missing keys:', missing);
    }

    sounds.forEach(function (sound) {
      return sound.trigger(deadline);
    });
  };

  return PlasticDrums;
}(Instrument_1.Instrument);

exports.PlasticDrums = PlasticDrums;
},{"./Instrument":"../lib/instruments/Instrument.js","./Kick":"../lib/instruments/Kick.js","./Snare":"../lib/instruments/Snare.js"}],"../lib/improvisation/Improvisation.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Improvisation =
/** @class */
function () {
  function Improvisation(rules) {
    this.rules = rules;
    this.cache = {};
  }

  Improvisation.prototype.get = function (key, fromCache) {
    if (fromCache === void 0) {
      fromCache = false;
    }

    if (fromCache) {
      return this.cache[key];
    }

    var rule = this.rules[key];

    if (rule === undefined) {
      console.error('could not resolve key', key, '!');
    }

    if (typeof rule === 'function') {
      rule = rule(this.getRuleFactories(key));
    }

    this.cache[key] = rule;
    return rule;
  };

  Improvisation.prototype.enhance = function (rules) {
    return new Improvisation(Object.assign({}, this.rules, rules));
  };

  Improvisation.prototype.mutate = function (reducer) {
    this.rules = Object.assign({}, this.rules, reducer(this.getRuleFactories()));
    return this;
  };

  Improvisation.prototype.getRuleFactories = function (originKey) {
    var _this = this;

    return Object.keys(this.rules).map(function (key) {
      return {
        key: key,
        factory: function factory() {
          return _this.get(key);
        }
      };
    }).reduce(function (factories, _a) {
      var key = _a.key,
          factory = _a.factory;

      var _b, _c;

      return Object.assign({}, factories, (_b = {}, _b[key] = factory, _b), originKey ? (_c = {}, _c[originKey] = function () {
        return _this.cache[originKey];
      }, _c) : {});
    }, {});
  };

  return Improvisation;
}();

exports.Improvisation = Improvisation;
/**
 *
 * methods: { [method: string]: ImprovisationRules } = {
        guideTones: {
            pattern: [3, 7]
        },
        flippedGuideTones: {
            pattern: [3, 7],
            flip: true,
        },
        chordTones: {
            pattern: [1, 3, 7],
            variance: .5,
            variety: .5,
            drill: .5,
            flip: ({ drill }) => Math.random() * Math.abs(drill()) > .5,
        }
    }
 */
},{}],"../lib/improvisation/methods.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var swing_1 = require("../grooves/swing");

var tonal_1 = require("tonal");

var util_1 = require("../util/util");

var Improvisation_1 = require("./Improvisation");

var Harmony_1 = require("../harmony/Harmony");

exports.permutator = new Improvisation_1.Improvisation({
  groove: swing_1.swing,
  groovePattern: function groovePattern(_a) {
    var groove = _a.groove;
    return groove()['solo'] || function (m) {
      return m.measure.map(function () {
        return [1];
      });
    };
  },
  octave: 4,
  reach: 1,
  lineBreaks: false,
  direction: null,
  force: false,
  flip: false,
  playedNotes: [],
  fixRange: true,
  startRandom: false,
  range: ['Bb3', 'Bb5'],

  /* chanceCurve: () => (distance, length) => (length - distance) * 10, */
  firstNoteInPattern: function firstNoteInPattern(_a) {
    var pattern = _a.pattern,
        chord = _a.chord;
    return util_1.getPatternInChord([pattern()[0]], chord());
  },
  firstNote: function firstNote(_a) {
    var randomNote = _a.randomNote,
        firstNoteInPattern = _a.firstNoteInPattern,
        startRandom = _a.startRandom,
        octave = _a.octave;
    return startRandom() ? randomNote() : firstNoteInPattern() + octave();
  },
  lastNote: function lastNote(_a) {
    var playedNotes = _a.playedNotes;
    return playedNotes().length ? playedNotes()[0] : null;
  },
  material: function material(_a) {
    var pattern = _a.pattern,
        chord = _a.chord;
    return util_1.getPatternInChord(pattern(), chord());
  },
  randomNote: function randomNote(_a) {
    var material = _a.material,
        octave = _a.octave;
    return util_1.randomElement(material()) + octave();
  },
  nextNotes: function nextNotes(_a) {
    var fixRange = _a.fixRange,
        firstNote = _a.firstNote,
        chord = _a.chord,
        reach = _a.reach,
        lineBreaks = _a.lineBreaks,
        lastNote = _a.lastNote,
        range = _a.range,
        material = _a.material,
        direction = _a.direction,
        force = _a.force,
        flip = _a.flip;
    var note;

    if (!lastNote() || lineBreaks()) {
      note = firstNote();
    } else {
      var choices = material();

      if (!choices.length) {
        console.warn('no choice..');
        return;
      }

      var targets = Harmony_1.Harmony.getNearestTargets(lastNote(), material(), direction(), flip());
      targets = targets.slice(0, reach());
      note = util_1.randomElement(targets);
      note = tonal_1.Note.simplify(note, true);
    }

    if (fixRange()) {
      note = util_1.transposeToRange([note], range())[0];
    }

    var step = util_1.getStepInChord(note, chord());
    /* console.log(`${step} in ${chord()} = ${note}`); */

    return [note];
  }
});
/** MODIFIERS */

var getStraightBar = function getStraightBar(notes, cycle) {
  if (cycle === void 0) {
    cycle = 4;
  }

  return new Array(cycle).fill(new Array(Math.ceil(notes / cycle)).fill(1));
};

var straightNotes = function straightNotes(n, cycle) {
  if (cycle === void 0) {
    cycle = 4;
  }

  return {
    groove: null,
    groovePattern: function groovePattern() {
      return function (m) {
        return getStraightBar(n, cycle);
      };
    }
  };
};

var fixedNotesPerChord = function fixedNotesPerChord(n, cycle) {
  if (cycle === void 0) {
    cycle = 4;
  }

  return {
    groove: null,
    groovePattern: function groovePattern() {
      return function (m) {
        return m.measure.map(function () {
          return getStraightBar(n, cycle);
        });
      };
    }
  };
};

var pendulum = function pendulum(defaultDirection, softForce, comfort) {
  if (defaultDirection === void 0) {
    defaultDirection = 'up';
  }

  if (softForce === void 0) {
    softForce = false;
  }

  if (comfort === void 0) {
    comfort = .4;
  }

  return {
    exclude: 1,
    force: !softForce ? true : function (_a) {
      var lastNote = _a.lastNote,
          range = _a.range;
      var position = util_1.getRangePosition(lastNote(), range());
      return position < 0 || position > 1; // only force if out of range..    
    },
    fixRange: false,
    direction: function direction(_a) {
      var lastNote = _a.lastNote,
          range = _a.range,
          direction = _a.direction,
          barNumber = _a.barNumber,
          isBarStart = _a.isBarStart;
      var position = util_1.getRangePosition(lastNote(), range());
      var comfortSwitchBars = 1; // switch direction each x bars when in comfort zone

      var isComfortZone = position > comfort && position < 1 - comfort;

      if (position <= 0 && direction() === 'down' || position >= 1 && direction() === 'up' || isComfortZone && isBarStart() && barNumber() % comfortSwitchBars === 0) {
        /* console.log('change direction', otherDirection(direction(), defaultDirection)); */
        return util_1.otherDirection(direction(), defaultDirection);
      }

      return direction() || defaultDirection;
    }
  };
};

var beatPattern = function beatPattern(_a) {
  var pattern = _a.pattern,
      on = _a.on,
      off = _a.off,
      barStart = _a.barStart;
  return {
    beatPattern: function beatPattern(_a) {
      var isBarStart = _a.isBarStart,
          isOffbeat = _a.isOffbeat;

      if (isBarStart()) {
        return barStart || on || pattern;
      } else if (!isOffbeat()) {
        return on || pattern;
      }

      return off || pattern;
    },
    pattern: function pattern(_a) {
      var beatPattern = _a.beatPattern;
      return beatPattern();
    }
  };
};

var notesPerChord = function notesPerChord(n) {
  return __assign({}, fixedNotesPerChord(1, n));
};

var patternPractise = function patternPractise(direction, notes, _lineBreaks) {
  if (direction === void 0) {
    direction = 'up';
  }

  if (notes === void 0) {
    notes = 4;
  }

  if (_lineBreaks === void 0) {
    _lineBreaks = false;
  }

  return __assign({}, straightNotes(notes), {
    firstNoteInPattern: function firstNoteInPattern(_a) {
      var pattern = _a.pattern,
          chord = _a.chord;
      return util_1.getPatternInChord(direction === 'up' ? [pattern()[0]] : pattern().slice(-1), chord());
    },
    direction: direction,
    force: true,
    fixRange: false,
    lineBreaks: function lineBreaks(_a) {
      var isBarStart = _a.isBarStart;
      return _lineBreaks ? isBarStart() : false;
    },
    exclude: 1,
    reach: 1
  });
};
/** FORMULAS */


exports.advancedPermutator = exports.permutator.enhance({
  drill: .5,
  direction: function direction(_a) {
    var drill = _a.drill;
    return drill() > 0 ? 'up' : 'down';
  },
  force: function force(_a) {
    var drill = _a.drill;
    return Math.random() * Math.abs(drill()) > .5;
  },
  exclude: 1,
  reach: 1,
  material: function material(_a) {
    var pattern = _a.pattern,
        chord = _a.chord,
        playedNotes = _a.playedNotes,
        exclude = _a.exclude;
    var all = util_1.getPatternInChord(pattern(), chord());

    if (!playedNotes().length) {
      return all;
    }

    var excludeNotes = playedNotes().slice(0, exclude()).map(function (n) {
      return tonal_1.Note.pc(n);
    });
    return all.filter(function (n) {
      return !excludeNotes.includes(n);
    });
  }
});
exports.guideTones = exports.advancedPermutator.enhance(__assign({
  name: 'Guide Lines'
}, notesPerChord(1), pendulum('down', true), {
  pattern: [3, 7],
  exclude: 0
}));
exports.guideTonesFlipped = exports.guideTones.enhance({
  name: 'Distant Guide Tones',
  flip: true
});
exports.chordTones = exports.advancedPermutator.enhance({
  name: 'Only Chord Tones',
  pattern: [1, 3, 5, 7],
  drill: .75,
  direction: function direction(_a) {
    var drill = _a.drill;
    return drill() > 0 ? 'up' : 'down';
  }
});
/* export const digitalPattern = advancedPermutator.enhance({
    pattern: ({ chord }) => getDigitalPattern(chord()),
    ...pendulum(),
    ...straightNotes(4)
}); */

exports.fullScale = exports.advancedPermutator.enhance(__assign({
  name: 'Heptatonic'
}, beatPattern({
  on: [1, 3, 5, 7],
  off: [1, 2, 3, 4, 5, 6, 7]
}), pendulum()));
exports.scalePendulum = exports.advancedPermutator.enhance(__assign({
  name: 'Heptatonic Pendulum'
}, beatPattern({
  pattern: [1, 2, 3, 4, 5, 6, 7]
}), pendulum(), straightNotes(8)));
exports.digitalPattern = exports.advancedPermutator.enhance(__assign({
  name: 'Digital Patterns',
  pattern: function pattern(_a) {
    var chord = _a.chord;
    return util_1.getDigitalPattern(chord());
  }
}, pendulum('up', true, .2), {
  exclude: 2,
  reach: 3
}));
exports.digitalPendulum = exports.advancedPermutator.enhance(__assign({
  name: 'Digital Pendulum',
  pattern: function pattern(_a) {
    var chord = _a.chord;
    return util_1.getDigitalPattern(chord());
  }
}, pendulum('up', false, 1), straightNotes(8), {
  /* lineBreaks: ({ isBarStart }) => isBarStart(), */
  exclude: 1,
  reach: 1
}));
exports.digitalWalker = exports.advancedPermutator.enhance(__assign({
  name: 'Digital Fourths',
  pattern: function pattern(_a) {
    var chord = _a.chord;
    return util_1.getDigitalPattern(chord());
  }
}, pendulum('up', true, .4), straightNotes(4), {
  lineBreaks: false,

  /* lineBreaks: ({ isBarStart }) => isBarStart(), */
  exclude: 2,
  reach: 2
}));
exports.digitalPractiseUp = exports.advancedPermutator.enhance(__assign({
  name: 'Digital Practise Up'
}, patternPractise('up', 4, true), {
  pattern: function pattern(_a) {
    var chord = _a.chord;
    return util_1.getDigitalPattern(chord());
  }
}));
exports.digitalPractiseDown = exports.advancedPermutator.enhance(__assign({
  name: 'Digital Practise Down'
}, patternPractise('down', 4, true), {
  pattern: function pattern(_a) {
    var chord = _a.chord;
    return util_1.getDigitalPattern(chord());
  }
}));
exports.heptatonicPractise = exports.advancedPermutator.enhance(__assign({
  name: 'Heptatonic Practise'
}, patternPractise('up', 8, false), beatPattern({
  barStart: [1],
  on: [3, 5, 7],
  off: [1, 2, 3, 4, 5, 6, 7]
})));
exports.defaultMethod = exports.guideTones;
exports.improvisationMethods = {
  guideTones: exports.guideTones,
  guideTonesFlipped: exports.guideTonesFlipped,
  chordTones: exports.chordTones,
  digitalPattern: exports.digitalPattern,
  digitalPendulum: exports.digitalPendulum,
  digitalWalker: exports.digitalWalker,
  fullScale: exports.fullScale,
  scalePendulum: exports.scalePendulum,
  digitalPractiseUp: exports.digitalPractiseUp,
  digitalPractiseDown: exports.digitalPractiseDown
};
},{"../grooves/swing":"../lib/grooves/swing.js","tonal":"../node_modules/tonal/index.js","../util/util":"../lib/util/util.js","./Improvisation":"../lib/improvisation/Improvisation.js","../harmony/Harmony":"../lib/harmony/Harmony.js"}],"../lib/musicians/Improvisor.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var swing_1 = require("../grooves/swing");

var methods_1 = require("../improvisation/methods");

var util_1 = require("../util/util");

var Musician_1 = require("./Musician");

var Improvisor =
/** @class */
function (_super) {
  __extends(Improvisor, _super);

  function Improvisor(instrument, method) {
    var _this = _super.call(this, instrument) || this;

    _this.name = 'Improvisor';
    _this.defaultMethod = methods_1.defaultMethod;
    method = method || _this.defaultMethod;
    _this.method = method
    /* .enhance({
    range: ['F3', 'F5']
    }) */
    ;
    return _this;
  }

  Improvisor.prototype.useMethod = function (method) {
    this.method = method;
  };

  Improvisor.prototype.play = function (_a) {
    var _this = this;

    var measures = _a.measures,
        pulse = _a.pulse,
        settings = _a.settings;

    if (settings.method) {
      this.useMethod(settings.method);
    }

    var groove = settings.groove || swing_1.swing;
    this.method.mutate(function () {
      return {
        groove: groove,
        playedNotes: []
      };
    });
    var pattern = this.method.get('groovePattern');
    measures = measures.map(function (measure) {
      return pattern({
        measures: measures,
        measure: measure,
        settings: settings,
        pulse: pulse
      });
    }
    /*     .slice(0, Math.floor(settings.cycle)) */
    ).map(function (pattern, i) {
      return util_1.resolveChords(pattern, measures, [i]);
    });
    pulse.tickArray(measures, function (tick) {
      _this.improvise(tick, measures, pulse);
    }, settings.deadline);
  };

  Improvisor.prototype.improvise = function (_a, measures, pulse) {
    var _this = this;

    var value = _a.value,
        deadline = _a.deadline,
        interval = _a.interval;
    var chord = value.chord;

    if (chord === 'N.C.') {
      return;
    }

    this.method.mutate(function () {
      return {
        chord: chord,
        isFormStart: util_1.isFormStart(value.path),
        isBarStart: util_1.isBarStart(value.path),
        isOffbeat: util_1.isOffbeat(value.path),
        // TODO: is ChordStart
        barNumber: value.path[0]
      };
    }).mutate(function (_a) {
      var nextNotes = _a.nextNotes,
          playedNotes = _a.playedNotes;
      var pick = nextNotes();
      var duration = value.fraction * pulse.getMeasureLength();

      _this.instrument.playNotes(pick, {
        deadline: deadline,
        interval: interval,
        gain: _this.getGain(),
        duration: duration,
        pulse: pulse
      });

      return {
        playedNotes: [].concat(pick, playedNotes())
      };
    });
  };

  return Improvisor;
}(Musician_1.Musician);

exports.default = Improvisor;
},{"../grooves/swing":"../lib/grooves/swing.js","../improvisation/methods":"../lib/improvisation/methods.js","../util/util":"../lib/util/util.js","./Musician":"../lib/musicians/Musician.js"}],"../lib/Trio.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("./util/util");

var Band_1 = __importDefault(require("./Band"));

var Pianist_1 = __importDefault(require("./musicians/Pianist"));

var Bassist_1 = __importDefault(require("./musicians/Bassist"));

var Drummer_1 = __importDefault(require("./musicians/Drummer"));

var PlasticDrums_1 = require("./instruments/PlasticDrums");

var Improvisor_1 = __importDefault(require("./musicians/Improvisor"));

var Trio =
/** @class */
function (_super) {
  __extends(Trio, _super);

  function Trio(_a) {
    var context = _a.context,
        piano = _a.piano,
        bass = _a.bass,
        drums = _a.drums,
        onMeasure = _a.onMeasure,
        solo = _a.solo;

    var _this = _super.call(this, {
      context: context,
      onMeasure: onMeasure
    }) || this;

    var instruments = _this.setupInstruments({
      piano: piano,
      bass: bass,
      drums: drums
    });

    _this.pianist = new Pianist_1.default(instruments.piano);
    _this.bassist = new Bassist_1.default(instruments.bass);
    _this.drummer = new Drummer_1.default(instruments.drums);
    _this.musicians = [_this.pianist, _this.bassist, _this.drummer];

    if (solo) {
      // this.soloist = new Permutator(instruments.piano);
      _this.soloist = new Improvisor_1.default(instruments.piano);

      _this.musicians.push(_this.soloist);
    }

    return _this;
  }

  Trio.prototype.setupInstruments = function (_a) {
    var piano = _a.piano,
        bass = _a.bass,
        drums = _a.drums;
    bass = bass || util_1.randomSynth(this.mix);
    piano = piano || util_1.randomSynth(this.mix);
    drums = drums || new PlasticDrums_1.PlasticDrums({
      mix: this.mix
    });
    return {
      piano: piano,
      bass: bass,
      drums: drums
    };
  };

  return Trio;
}(Band_1.default);

exports.Trio = Trio;
},{"./util/util":"../lib/util/util.js","./Band":"../lib/Band.js","./musicians/Pianist":"../lib/musicians/Pianist.js","./musicians/Bassist":"../lib/musicians/Bassist.js","./musicians/Drummer":"../lib/musicians/Drummer.js","./instruments/PlasticDrums":"../lib/instruments/PlasticDrums.js","./musicians/Improvisor":"../lib/musicians/Improvisor.js"}],"../lib/sheet/RealParser.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Measure_1 = require("./Measure"); // extension of https://github.com/daumling/ireal-renderer/blob/master/src/ireal-renderer.js


var RealParser =
/** @class */
function () {
  function RealParser() {}

  RealParser.getChord = function (iRealChord) {
    return iRealChord.note + iRealChord.modifiers + (iRealChord.over ? '/' + this.getChord(iRealChord.over) : '');
  };

  RealParser.parseSheet = function (raw) {
    var tokens = RealParser.parse(raw);
    return RealParser.getSheet(tokens);
  };

  RealParser.getSheet = function (tokens) {
    var _this = this;

    var parsed = tokens.reduce(function (current, token, index, array) {
      var lastBarEnded = ['{', '|', '[', '||'
      /* 'Z',  */

      /* , ']' */
      ].includes(token.bars || token.token);
      var signs = token.annots || [];
      var repeatStart = (token.bars || token.token) === '{';
      var repeatEnd = (token.bars || token.token) === '}';

      if (repeatStart) {
        signs.push('{');
      }

      if (repeatEnd) {
        signs.push('}');
      } // current.measure ends


      if (lastBarEnded) {
        if (current.measure) {
          // simplify measure if no signs

          /* if (Object.keys(current.measure).find(k=>k)) {
              current.measure = current.measure.chords;
          } */
          current.measures.push(current.measure);
        }

        current.measure = {
          chords: []
        };
      }

      var sectionStart = signs.find(function (a) {
        return a.match(/^\*[a-zA-Z]/);
      });

      if (sectionStart) {
        signs = signs.filter(function (s) {
          return s !== sectionStart;
        });
        current.measure.section = sectionStart.replace('*', '');
      }

      var hasCodaSign = signs.includes('Q');

      if (hasCodaSign) {
        signs = signs.filter(function (s) {
          return s !== 'Q';
        });
        var codaSign = 'ToCoda';

        if (!!current.measures.find(function (m) {
          return Measure_1.Measure.hasSign('ToCoda', m);
        })) {
          codaSign = 'Coda';
        }

        current.measure.signs = (current.measure.signs || []).concat([codaSign]);
      }

      var houseStart = signs.find(function (s) {
        return !!s.match(/^N./);
      });

      if (houseStart) {
        signs = signs.filter(function (s) {
          return s !== houseStart;
        });
        current.measure.house = parseInt(houseStart.replace('N', ''));
      }

      var time = signs.find(function (a) {
        return a.match(/^T\d\d/);
      });

      if (time) {
        signs = signs.filter(function (s) {
          return s !== time;
        });
        current.measure.time = time.replace('T', '');
      }

      if (token.chord) {
        current.measure.chords.push(_this.getChord(token.chord));
      } else if (token.token === 'n') {
        current.measure.chords.push(0);
      }

      var last = current.measures[current.measures.length - 1];

      if (last && last.chords[0] === 'r') {
        last.chords = current.measures[current.measures.length - 3].chords;
        current.measure.chords = current.measures[current.measures.length - 2].chords;
      }

      if (last && current.measure.chords[0] === 'x') {
        current.measure.chords = [].concat(last.chords);
        current.measure.idle = true;
      }

      if (signs.length) {
        current.measure.signs = (current.measure.signs || []).concat(signs);
      }

      if (token.comments.length) {
        current.measure.comments = (current.measure.comments || []).concat(token.comments.map(function (c) {
          return c.trim();
        }));
      }

      return current;
    }, {
      measure: null,
      signs: null,
      measures: []
    });

    if (parsed.measure.chords.length) {
      parsed.measures.push(parsed.measure);
    }

    return parsed.measures.map(function (measure) {
      var chords = [].concat(measure.chords);
      delete measure.chords;
      return __assign({}, measure, {
        body: chords
      });
    });
  };

  RealParser.parse = function (raw) {
    var text = raw;
    var arr = [],
        headers = [],
        comments = [];
    var i;
    text = text.trim(); // text = text.trimRight();

    while (text) {
      var found = false;

      for (i = 0; i < RealParser.regExps.length; i++) {
        var match = RealParser.regExps[i].exec(text);

        if (match) {
          found = true;

          if (match.length <= 2) {
            var replacement = match[0];
            var repl = RealParser.replacements[replacement];
            arr = arr.concat(repl ? repl : [replacement]);
            text = text.substr(replacement.length);
          } else {
            // a chord
            arr.push(match);
            text = text.substr(match[0].length);
          }

          break;
        }
      }

      if (!found) {
        // ignore the comma separator
        if (text[0] !== ',') arr.push(text[0]);
        text = text.substr(1);
      }
    } //		console.log(arr);
    // pass 2: extract prefixes, suffixes, annotations and comments


    var out = [];
    var obj = RealParser.newToken(out);

    for (i = 0; i < arr.length; i++) {
      var token = arr[i];

      if (token instanceof Array) {
        obj.chord = RealParser.parseChord(token);
        token = " ";
      }

      switch (token[0]) {
        case ',':
          token = null;
          break;
        // separator

        case 'S': // segno

        case 'T': // time measurement

        case 'Q': // coda

        case 'N': // repeat

        case 'U': // END

        case 's': // small

        case 'l': // normal

        case 'f': // fermata

        case '*':
          obj.annots.push(token);
          token = null;
          break;

        case 'Y':
          obj.spacer++;
          token = null;
          break;

        case 'r':
        case 'x':
        case 'W':
          obj.chord = new iRealChord(token, "", null, null);
          break;

        case '<':
          token = token.substr(1, token.length - 2);
          token = token.replace(/XyQ/g, "   "); // weird; needs to be done

          obj.comments.push(token);
          token = null;
          break;

        default:
      }

      if (token) {
        if ("]}Z".indexOf(arr[i + 1]) >= 0) obj.bars += arr[++i];

        if ("{[|".indexOf(token) >= 0) {
          obj.bars += token;
          token = null;
        }
      }

      if (token && i < arr.length - 1) {
        obj.token = token;
        obj = RealParser.newToken(out);
      }
    }

    return out;
  };

  RealParser.parseChord = function (match) {
    var note = match[1] || " ";
    var modifiers = match[2] || "";
    var comment = match[3] || "";
    if (comment) modifiers += comment.substr(1, comment.length - 2).replace("XyQ", "   ");
    var over = match[4] || "";
    if (over[0] === '/') over = over.substr(1);
    var alternate = match[5] || null;

    if (alternate) {
      match = RealParser.chordRegex.exec(alternate.substr(1, alternate.length - 2));
      if (!match) alternate = null;else alternate = this.parseChord(match);
    } // empty cell?


    if (note === " " && !alternate && !over) return null;

    if (over) {
      var offset = over[1] === '#' || over[1] === 'b' ? 2 : 1;
      over = new iRealChord(over.substr(0, offset), over.substr(offset), null, null);
    } else over = null;

    return new iRealChord(note, modifiers, over, alternate);
  };

  RealParser.newToken = function (arr) {
    var obj = new iRealToken();
    arr.push(obj);
    return obj;
  };
  /**
   * The RegExp for a complete chord. The match array contains:
   * 1 - the base note
   * 2 - the modifiers (+-ohd0123456789 and su for sus)
   * 3 - any comments (may be e.g. add, sub, or private stuff)
   * 4 - the "over" part starting with a slash
   * 5 - the top chord as (chord)
   * @type RegExp
   */


  RealParser.chordRegex = /^([ A-GW][b#]?)((?:sus|[\+\-\^\dhob#])*)(\*.+?\*)*(\/[A-G][#b]?)?(\(.*?\))?/;
  RealParser.regExps = [/^\*[a-zA-Z]/, /^T\d\d/, /^N./, /^<.*?>/, /^ \(.*?\)/, RealParser.chordRegex, /^LZ/, /^XyQ/, /^Kcl/ // repeat last bar
  ];
  RealParser.replacements = {
    "LZ": [" ", "|"],
    "XyQ": [" ", " ", " "],
    "Kcl": ["|", "x", " "]
  };
  return RealParser;
}();

exports.RealParser = RealParser;

var iRealChord =
/** @class */
function () {
  function iRealChord(note, modifiers, over, alternate) {
    this.note = note;
    this.modifiers = modifiers;
    this.over = over;
    this.alternate = alternate;
  }

  return iRealChord;
}();

var iRealToken =
/** @class */
function () {
  function iRealToken() {
    this.annots = [];
    this.comments = [];
    this.bars = "";
    this.spacer = 0;
    this.chord = null;
  }

  return iRealToken;
}();
},{"./Measure":"../lib/sheet/Measure.js"}],"../lib/instruments/MidiOut.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Instrument_1 = require("./Instrument");

var MidiOut =
/** @class */
function (_super) {
  __extends(MidiOut, _super);

  function MidiOut(props) {
    var _this = _super.call(this, props) || this;

    _this.gain = 0.9;
    _this.output = 'Scarlett 6i6 USB';
    _this.gain = props.gain || _this.gain;

    if (!navigator['requestMIDIAccess']) {
      console.warn('This browser does not support WebMIDI!');
      return _this;
    }

    navigator['requestMIDIAccess']().then(function (midi) {
      return _this.midiInit(midi);
    }, _this.midiFail);
    return _this;
  }

  MidiOut.prototype.midiInit = function (midi) {
    var _this = this;

    console.log('midi init', midi);
    console.log(midi.outputs.size, 'outputs');
    console.log(midi.inputs.size, 'inputs');
    this.midi = midi;
    midi.outputs.forEach(function (output) {
      console.log('ouput', output);
    });
    midi.inputs.forEach(function (input) {
      console.log('input', input);
      input.onmidimessage = _this.getMidiMessage;
    });

    this.onTrigger = function (_a) {
      var on = _a.on,
          off = _a.off;
      on.forEach(function (_a) {
        var midi = _a.midi,
            gain = _a.gain,
            deadline = _a.deadline;

        _this.noteOn(midi, Math.round(gain * 127), deadline);
      });
      off.forEach(function (event) {
        _this.noteOff(event.midi, Math.round(event.gain * 127));
      });
    };
  };

  MidiOut.prototype.midiFail = function () {
    console.warn('could not get midi access!');
  };

  MidiOut.prototype.getMidiMessage = function (message) {
    console.log('midi data', message.data, 'message', message);
  };

  MidiOut.prototype.send = function (message, deadline) {
    var _this = this;

    if (!this.midi) {
      console.warn('tried to play keys but midi was not ready');
      return;
    }

    console.log('send', message, deadline);
    this.midi.outputs.forEach(function (output) {
      if (true || output.name === _this.output) {
        output.send(message);
      }
    });
  };

  MidiOut.prototype.noteOn = function (key, velocity, deadline) {
    if (velocity === void 0) {
      velocity = 127;
    }

    if (deadline === void 0) {
      deadline = 0;
    }

    this.send([144, key, 0x7f], deadline); //velocity
  };

  MidiOut.prototype.noteOff = function (key, velocity, deadline) {
    if (velocity === void 0) {
      velocity = 127;
    }

    if (deadline === void 0) {
      deadline = 0;
    }

    this.send([144, key, 0], deadline); //velocity
  };

  MidiOut.prototype.playKeys = function (keys, settings) {
    if (settings === void 0) {
      settings = {};
    }
    /* if (!this.midi) {
        console.warn('tried to play keys but midi was not ready');
        return;
    }
    this.midi.outputs.forEach(output => {
        console.log(keys, 'send to', output);
        keys.forEach(key => {
            output.send([144, key, 9]);
        })
    });
    } */

  };

  return MidiOut;
}(Instrument_1.Instrument);

exports.MidiOut = MidiOut;
},{"./Instrument":"../lib/instruments/Instrument.js"}],"../lib/musicians/Permutator.js":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("../util/util");

var Musician_1 = require("./Musician");

var swing_1 = require("../grooves/swing");

var Permutator =
/** @class */
function (_super) {
  __extends(Permutator, _super);

  function Permutator(instrument) {
    var _this = _super.call(this, instrument) || this;

    _this.defaults = {
      groove: swing_1.swing
    };
    _this.playedChords = [];
    return _this;
  }

  Permutator.prototype.play = function (_a) {
    var _this = this;

    var measures = _a.measures,
        pulse = _a.pulse,
        settings = _a.settings;
    var groove = settings.groove || this.defaults.groove;

    var pattern = groove['solo'] || function (m) {
      return m.measure.map(function (c) {
        return [1, 1, 1, 1];
      });
    }; // dont changes anything


    measures = measures.map(function (measure) {
      return pattern({
        measures: measures,
        measure: measure,
        settings: settings,
        pulse: pulse
      }).slice(0, Math.floor(settings.cycle));
    }).map(function (pattern, i) {
      return util_1.resolveChords(pattern, measures, [i]);
    });
    pulse.tickArray(measures, function (tick) {
      _this.playPermutations(tick, measures, pulse);
    }, settings.deadline);
  };

  Permutator.prototype.playPermutations = function (_a, measures, pulse) {
    var value = _a.value,
        cycle = _a.cycle,
        path = _a.path,
        deadline = _a.deadline,
        interval = _a.interval;
    var chord = value.chord;

    if (chord === 'N.C.') {
      return;
    }

    if (chord === 'x') {
      chord = this.playedChords[this.playedChords.length - 1];
    }

    if (!chord || chord === '0') {
      this.playedChords.push('');
      return;
    }

    this.playedChords.push(chord); // digital patterns

    var notes = util_1.renderDigitalPattern(chord);
    var note = util_1.randomElement(notes) + '5'; // all scale notes with different chances

    /* const notes = getPatternInChord([1, 2, 3, 4, 5, 6, 7], chord);
    const note = randomElement(notes, [4, 3, 6, 1, 3, 4, 6]) + '5'; */

    /* console.log('beat (starting from zero)', path[1]); */

    var duration = value.fraction * pulse.getMeasureLength();
    /* deadline += randomDelay(10); */

    this.instrument.playNotes([note], {
      deadline: deadline,
      interval: interval,
      gain: 1,
      duration: duration,
      pulse: pulse
    });
  };

  return Permutator;
}(Musician_1.Musician);

exports.default = Permutator;
},{"../util/util":"../lib/util/util.js","./Musician":"../lib/musicians/Musician.js","../grooves/swing":"../lib/grooves/swing.js"}],"../lib/index.js":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Band_1 = __importDefault(require("./Band"));

exports.Band = Band_1.default;

var Pianist_1 = __importDefault(require("./musicians/Pianist"));

exports.Pianist = Pianist_1.default;

var Drummer_1 = __importDefault(require("./musicians/Drummer"));

exports.Drummer = Drummer_1.default;

var Bassist_1 = __importDefault(require("./musicians/Bassist"));

exports.Bassist = Bassist_1.default;

var Instrument_1 = require("./instruments/Instrument");

exports.Instrument = Instrument_1.Instrument;

var Musician_1 = require("./musicians/Musician");

exports.Musician = Musician_1.Musician;

var Synthesizer_1 = require("./instruments/Synthesizer");

exports.Synthesizer = Synthesizer_1.Synthesizer;

var Sampler_1 = require("./instruments/Sampler");

exports.Sampler = Sampler_1.Sampler;

var PlasticDrums_1 = require("./instruments/PlasticDrums");

exports.PlasticDrums = PlasticDrums_1.PlasticDrums;

var Trio_1 = require("./Trio");

exports.Trio = Trio_1.Trio;

var util = __importStar(require("./util/util"));

exports.util = util;

var Pulse_1 = require("./Pulse");

exports.Pulse = Pulse_1.Pulse;

var RealParser_1 = require("./sheet/RealParser");

exports.RealParser = RealParser_1.RealParser;

var MidiOut_1 = require("./instruments/MidiOut");

exports.MidiOut = MidiOut_1.MidiOut;

var Permutator_1 = __importDefault(require("./musicians/Permutator"));

exports.Permutator = Permutator_1.default;

var Voicing_1 = require("./harmony/Voicing");

exports.Voicing = Voicing_1.Voicing;

var Permutation_1 = require("./util/Permutation");

exports.Permutation = Permutation_1.Permutation;
},{"./Band":"../lib/Band.js","./musicians/Pianist":"../lib/musicians/Pianist.js","./musicians/Drummer":"../lib/musicians/Drummer.js","./musicians/Bassist":"../lib/musicians/Bassist.js","./instruments/Instrument":"../lib/instruments/Instrument.js","./musicians/Musician":"../lib/musicians/Musician.js","./instruments/Synthesizer":"../lib/instruments/Synthesizer.js","./instruments/Sampler":"../lib/instruments/Sampler.js","./instruments/PlasticDrums":"../lib/instruments/PlasticDrums.js","./Trio":"../lib/Trio.js","./util/util":"../lib/util/util.js","./Pulse":"../lib/Pulse.js","./sheet/RealParser":"../lib/sheet/RealParser.js","./instruments/MidiOut":"../lib/instruments/MidiOut.js","./musicians/Permutator":"../lib/musicians/Permutator.js","./harmony/Voicing":"../lib/harmony/Voicing.js","./util/Permutation":"../lib/util/Permutation.js"}],"../lib/player/Leadsheet.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Leadsheet =
/** @class */
function () {
  function Leadsheet(sheet) {
    Object.assign(this, Leadsheet.from(sheet));
  }

  Leadsheet.from = function (sheet) {
    sheet.options = sheet.options || {};
    return __assign({}, sheet, {
      options: __assign({
        forms: 1,
        pedal: false,
        real: true,
        tightMelody: true,
        bpm: 120,
        swing: 0,
        fermataLength: 4,
        feel: 4,
        pulses: 4
      }, sheet.options, {
        humanize: __assign({
          velocity: 0.1,
          time: 0.002,
          duration: 0.002
        }, sheet.options.humanize || {}),
        voicings: __assign({
          minBottomDistance: 3,
          minTopDistance: 2,
          logging: false,
          maxVoices: 4,
          range: ['C3', 'C6'],
          rangeBorders: [1, 1],
          maxDistance: 7,
          idleChance: 1
        }, sheet.options.voicings || {})
      })
    });
  };

  return Leadsheet;
}();

exports.Leadsheet = Leadsheet;
},{}],"../lib/player/Sequence.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Voicing_1 = require("../harmony/Voicing");

var Sheet_1 = require("../sheet/Sheet");

var Harmony_1 = require("../harmony/Harmony");

var tonal_1 = require("tonal");

var tonal_2 = require("tonal");

var tonal_3 = require("tonal");

var util_1 = require("../util/util");

var Logger_1 = require("../util/Logger");

var __1 = require("..");

var tonal_4 = require("tonal");

var Pattern_1 = require("../util/Pattern");

var Leadsheet_1 = require("./Leadsheet");

var Rhythm_1 = require("../rhythmical/Rhythm");

var Sequence =
/** @class */
function () {
  function Sequence() {}

  Sequence.getSignType = function (symbol) {
    return Object.keys(Sheet_1.Sheet.sequenceSigns).find(function (type) {
      return Sheet_1.Sheet.sequenceSigns[type].includes(symbol);
    });
  };

  Sequence.getOptions = function (options) {
    return __assign({
      bpm: 120
    }, options);
  };

  Sequence.isBefore = function (a, b) {
    return a.time < b.time + b.duration;
  };

  Sequence.isAfter = function (a, b) {
    return a.time + a.duration > b.time;
  };

  Sequence.isOverlapping = function (a, b) {
    return this.isBefore(a, b) && this.isAfter(a, b);
  };

  Sequence.isTouching = function (a, b) {
    return a.time <= b.time + b.duration && a.time + a.duration >= b.time;
  };

  Sequence.isInside = function (a, b) {
    return a.time >= b.time && a.time + a.duration <= b.time + b.duration;
  };

  Sequence.isOff = function (event) {
    return Rhythm_1.Rhythm.oldTime(event.divisions.slice(1), event.path.slice(1), 8) % 2 === 1;
  };

  Sequence.renderGrid = function (measures, options) {
    options = this.getOptions(options);
    var renderedMeasures = Sheet_1.Sheet.render(measures, options);
    var flat = Rhythm_1.Rhythm.flatten(renderedMeasures).map(function (event) {
      return __assign({}, event, {
        measure: renderedMeasures[event.path[0]]
      });
    });
    return this.renderEvents(flat, options);
  };

  Sequence.renderMeasures = function (measures, options) {
    options = this.getOptions(options);
    var renderedMeasures = Sheet_1.Sheet.render(measures, __assign({}, options)); // TODO add measureStartTime / measureEndTime for easier access later
    // seperate chords before flattening // => "chords" also used for melody, need rename...

    var chords = renderedMeasures.map(function (e) {
      return e.body;
    });
    var flat = Rhythm_1.Rhythm.flatten(chords).map(function (event) {
      return __assign({}, event, {
        measure: renderedMeasures[event.path[0]],
        options: renderedMeasures[event.path[0]].options
      });
    });
    return this.renderEvents(flat, options);
  };

  Sequence.fillGrooves = function (groove, sourceEvents, mapFn, options) {
    var _this = this;

    if (mapFn === void 0) {
      mapFn = function mapFn(_a) {
        var target = _a.target;
        return target;
      };
    }

    var _a = Sequence.getOptions(options),
        bpm = _a.bpm,
        pulses = _a.pulses,
        offsPlayNext = _a.offsPlayNext;

    options = {
      bpm: bpm,
      pulses: pulses,
      offsPlayNext: offsPlayNext
    };
    var grooveEvents, grooveMeasures;

    if (typeof groove !== 'function') {
      grooveMeasures = groove;
      grooveEvents = Sequence.renderMeasures(grooveMeasures, options);
    }

    if (!sourceEvents.length) {
      console.error('no events given to fillGrooves');
      return sourceEvents;
    }

    var last = sourceEvents[sourceEvents.length - 1];
    var events = [];
    var bar = 0;
    var barLength = 60 / options.bpm * (options.pulses || 4);

    var _loop_1 = function _loop_1() {
      if (typeof groove === 'function') {
        grooveMeasures = groove();
        grooveEvents = Sequence.renderMeasures(grooveMeasures, options);
      }

      var time = bar * barLength;
      var insert = grooveEvents.map(function (e) {
        return __assign({}, e, {
          path: Rhythm_1.Rhythm.addPaths([bar], e.path),
          time: e.time + time
        });
      }).filter(function (e) {
        return e.value !== 0;
      }).filter(function (e) {
        return e.duration > 0;
      }).map(function (target, index) {
        var source = sourceEvents.find(function (chordEvent) {
          return _this.isOverlapping(target, chordEvent);
        });
        source = Sequence.getNextChordOff({
          target: target,
          source: source,
          sourceEvents: sourceEvents,
          options: options
        }) || source;

        if (!source) {
          console.warn('no source found for target', target, sourceEvents);
          return;
        }

        return mapFn({
          target: target,
          source: source,
          index: index,
          grooveEvents: grooveEvents,
          sourceEvents: sourceEvents,
          options: options
        });
      }).filter(function (e) {
        return !!e;
      });
      bar += grooveMeasures.length; // number of bars added

      events = events.concat(insert);
    };

    while (bar < last.path[0]) {
      _loop_1();
    }

    return events;
  };

  Sequence.insertGrooves = function (groove, sourceEvents, mergeFn, options) {
    if (mergeFn === void 0) {
      mergeFn = function mergeFn(_a) {
        var target = _a.target;
        return target;
      };
    }

    var _a = Sequence.getOptions(options),
        bpm = _a.bpm,
        pulses = _a.pulses,
        offsPlayNext = _a.offsPlayNext;

    options = {
      bpm: bpm,
      pulses: pulses,
      offsPlayNext: offsPlayNext
    };
    var grooveEvents;

    if (typeof groove !== 'function') {
      grooveEvents = Sequence.renderMeasures(groove, options);
    }

    return sourceEvents.reduce(function (events, source) {
      if (typeof groove === 'function') {
        grooveEvents = Sequence.renderMeasures(groove(source, events), options);
      }

      var insert = grooveEvents.map(function (e) {
        return __assign({}, e, {
          path: Rhythm_1.Rhythm.addPaths(source.path, e.path),
          time: e.time + source.time
        });
      }).map(function (target, index) {
        var next = Sequence.getNextChordOff({
          target: target,
          source: source,
          sourceEvents: sourceEvents,
          options: options
        });
        index = next ? 0 : index;
        return mergeFn({
          target: target,
          source: next || source,
          index: index,
          grooveEvents: grooveEvents,
          sourceEvents: sourceEvents,
          options: options
        });
      }).filter(function (e) {
        return e.value !== 0;
      }).filter(function (e) {
        return e.duration > 0;
      }) // remove all events that overlap?!?! maybe just cut the duration at the end?
      .filter(function (e) {
        return e.time + e.duration <= source.time + source.duration;
      });
      events = events.concat(insert);
      return events;
    }, []);
  };

  Sequence.melodyGroove = function () {
    return function (_a) {
      var target = _a.target,
          source = _a.source,
          index = _a.index,
          grooveEvents = _a.grooveEvents;
      var root = Harmony_1.Harmony.getBassNote(source.chord, true); // TODO use required/optional notes?!

      var scales = __1.util.getChordScales(source.chord, 'Diatonic').filter(function (s) {
        return tonal_4.Scale.notes('C', s).length === 7;
      });

      if (!scales.length) {
        console.warn('no scales for', source.chord);
      }

      var scale = root + ' ' + scales[0];
      var pattern = grooveEvents.map(function (e) {
        return e.value;
      });
      var notes = Pattern_1.Pattern.scale(scale, pattern, ['F1', 'F#3']);
      return __assign({}, target, {
        value: tonal_1.Note.simplify(notes[index]),
        degree: pattern[index]
      });
    };
  };

  Sequence.chordGroove = function () {
    return function (_a) {
      var target = _a.target,
          source = _a.source;
      return __assign({}, source, target, {
        value: source.value,
        chord: source.chord,
        type: 'chord',
        duration: target.duration * target.value
      });
    };
  };

  Sequence.renderEvents = function (events, options) {
    if (options === void 0) {
      options = {};
    }

    events = events // .reduce(Sequence.addLatestOptions(options), [])
    .reduce(Sequence.addTimeAndDuration(options), []).filter(options.filterEvents || function () {
      return true;
    }).map(options.mapEvents || function (e) {
      return e;
    }).reduce(Sequence.prolongNotes(options), []);

    if (options.reduceEvents) {
      events = events.reduce(options.reduceEvents, []);
    }

    return events;
  };

  Sequence.renderGroove = function (sequence, options) {
    if (!options.groove) {
      var voicings = sequence = sequence.reduce(Sequence.renderVoicings(options), []);
      return sequence.concat(voicings);
    }

    return Object.keys(options.groove).reduce(function (groovyEvents, current) {
      return groovyEvents.concat(options.groove[current](sequence, options));
    }, []);
  };

  Sequence.render = function (sheet) {
    sheet = Leadsheet_1.Leadsheet.from(sheet);
    var sequence = [],
        melody = [],
        bass = [],
        chords = [];

    if (sheet.chords) {
      chords = Sequence.renderMeasures(sheet.chords, sheet.options).map(function (e) {
        return __assign({}, e, {
          chord: e.value,
          type: 'chord'
        });
      });
      /* const walk = Sequence.renderGrid(sheet.chords, sheet.options).map(measure => {
        const feel = measure.options.feel === undefined ? 4 : measure.options.feel;
        return Array(feel).fill('X')
      }); */

      /* console.log('grid', Sheet.flatten(walk, true)); */

      bass = chords.reduce(Sequence.renderBass(sheet.options), []);
      /* bass = bass.map(Sequence.addFermataToEnd(sheet.options)); */
    }

    if (sheet.melody) {
      melody = Sequence.renderMeasures(sheet.melody, __assign({}, sheet.options, {
        filterEvents: Sequence.inOut() // play melody only first and last time

      })).map(function (e) {
        return __assign({}, e, {
          type: 'melody'
        });
      });
      chords = chords.map(function (e, i) {
        return Sequence.duckChordEvent(sheet.options)(e, i, melody);
      }); // sequence = sequence.map(Sequence.duckChordEvent(sheet.options));
    }
    /* const voicings = chords
    .map(Sequence.addFermataToEnd(sheet.options))
    .reduce(Sequence.renderVoicings(sheet.options), [])
    .reduce(Sequence.pedalNotes(sheet.options), []);
    sequence = sequence.concat(voicings);
    */


    sequence = sequence.concat(chords); // not voiced yet..
    //.map(Sequence.addFermataToEnd(sheet.options))
    // .reduce(Sequence.renderVoicings(sheet.options), [])
    //.reduce(Sequence.pedalNotes(sheet.options), [])

    sequence = sequence.concat(bass);

    if (melody) {
      sequence = sequence.concat(melody);
      sequence = sequence.sort(function (a, b) {
        return a.time - b.time;
      });
      sequence = sequence.filter(Sequence.removeDuplicates(sheet.options));
    }

    sequence = Sequence.renderGroove(sequence, sheet.options);
    sequence = sequence.map(function (event, index, events) {
      // const pathEvents = events.filter(e => Rhythm.haveSamePath(e, event));
      event = Sequence.humanizeEvent(sheet.options)(event, index, sequence);
      event = Sequence.addDynamicVelocity(sheet.options)(event, index, sequence);
      return event;
    });
    sequence = sequence.reduce(Sequence.addSwing(sheet.options), []);

    if (sheet.options.logging) {
      Logger_1.Logger.logSequence(sequence);
    }

    return sequence;
  };

  Sequence.testEvents = function (props) {
    return function (event) {
      return props.reduce(function (reduced, prop) {
        var _a;

        return __assign({}, reduced, (_a = {}, _a[prop] = event[prop], _a));
      }, {});
    };
  };

  Sequence.addLatestOptions = function (options) {
    if (options === void 0) {
      options = {};
    }

    return function (events, event, index) {
      var last = events.length ? events[events.length - 1] : null;

      var combinedOptions = __assign({}, options, last ? last.options : {}, event.options, event.value.options || {});

      return events.concat(__assign({}, event, {
        options: combinedOptions
      }));
    };
  };

  Sequence.addTimeAndDuration = function (options) {
    if (options === void 0) {
      options = {};
    }

    return function (events, event, index) {
      options = Sequence.getOptions(__assign({}, options, event.options || {}));
      var pulses = options.pulses || 4;
      var last = events.length ? events[events.length - 1] : null;
      var whole = 60 / options.bpm * pulses * event.divisions[0];
      return events.concat(__assign({}, event, {
        options: options,
        velocity: 1,
        duration: Rhythm_1.Rhythm.oldDuration(event.divisions, whole),
        time: last ? last.time + last.duration : 0
      }));
    };
  };

  Sequence.pedalNotes = function (options) {
    return function (reduced, event, index, events) {
      if (!options.pedal) {
        return reduced.concat([event]);
      }

      var latestEvent;
      var latest = [].concat(reduced).reverse();
      latestEvent = latest.find(function (_a) {
        var time = _a.time,
            duration = _a.duration,
            value = _a.value;
        return value === event.value && time + duration === event.time;
      });

      if (!!latestEvent) {
        latestEvent.duration += event.duration;
        return reduced;
      } else {
        return reduced.concat([event]);
      }
    };
  };

  Sequence.prolongNotes = function (options) {
    return function (reduced, event, index, events) {
      var type = Sequence.getSignType(event.value);

      if (type !== 'prolong') {
        return reduced.concat([event]);
      }

      var latest = [].concat(reduced).reverse();
      var latestRest = latest.find(function (e) {
        return Sequence.getSignType(e.value) === 'rest';
      });
      var latestEvent = latest.find(function (e) {
        return !Sequence.getSignType(e.value);
      });

      if (latestEvent && latest.indexOf(events.indexOf(latestEvent) > events.indexOf(latestRest))) {
        latestEvent.duration += event.duration;
      }

      return reduced;
    };
  };

  Sequence.renderVoicings = function (options) {
    if (options === void 0) {
      options = {};
    }

    return function (events, event, index) {
      if (event.type !== 'chord') {
        return events.concat([event]);
      }

      var previousVoicing = [];

      if (index > 0) {
        var previousEvent_1 = events[index - 1];
        previousVoicing = previousEvent_1 ? events.filter(function (e) {
          return Rhythm_1.Rhythm.haveSamePath(previousEvent_1, e);
        }) : [];
        previousVoicing = previousVoicing.map(function (e) {
          return e.value;
        });
      }

      var voicingOptions = __assign({}, options.voicings, event.options.voicings);

      var voicing = Voicing_1.Voicing.getNextVoicing(event.value, previousVoicing, voicingOptions);

      if (!voicing) {
        console.error("error getting voicing for chord \"" + event.value + "\" after voicing " + previousVoicing + ", using options " + voicingOptions);
        return events;
      }

      return events.concat(voicing.map(function (note, index) {
        return __assign({}, event, {
          value: note,
          type: 'chordnote',
          chord: event.chord
        });
      }));
    };
  };

  Sequence.addFermataToEnd = function (options) {
    return function (event, index, events) {
      var duration = event.duration;

      if (index === events.length - 1 && options.fermataLength) {
        duration *= options.fermataLength;
      }

      return __assign({}, event, {
        duration: duration
      });
    };
  };

  Sequence.renderBass = function (options) {
    return function (events, event) {
      var duration = event.duration;

      if (event.type !== 'chord') {
        return events.concat([event]);
      }

      var root = Harmony_1.Harmony.getBassNote(event.value) + '2';
      events.push(__assign({}, event, {
        value: root,
        type: 'bass',
        duration: duration
      }));
      return events;
    };
  };

  Sequence.duckChordEvent = function (options) {
    return function (event, index, events) {
      if (event.type !== 'chord') {
        return event;
      }

      var melody = events.filter(function (e) {
        return !e.chord && Harmony_1.Harmony.isValidNote(e.value);
      });
      var topNote;

      if (options.tightMelody) {
        topNote = melody.find(function (n) {
          return Rhythm_1.Rhythm.haveSamePath(n, event) && Harmony_1.Harmony.isValidNote(n.value);
        } // n => Sequence.isInside(n, event) && Harmony.isValidNote(n.value)
        );
      } // TODO: allow contained melody notes to be optional topNotes..


      var surroundingMelody = melody //.filter(n => Math.abs(event.time - n.time) <= duckTime)
      .filter(function (m) {
        return Sequence.isTouching(event, m);
      })
      /* .filter(m => Sequence.isOverlapping(event, m)) */
      .sort(function (a, b) {
        return tonal_1.Note.midi(a.value) - tonal_1.Note.midi(b.value);
      });
      var range = options.voicings.range;

      if (!topNote && surroundingMelody.length) {
        var below = tonal_2.Distance.transpose(surroundingMelody[0].value, tonal_3.Interval.fromSemitones(-options.voicings.minTopDistance));
        range = [range[0], below];
      } else {
        range = [range[0], range[1]];
      }

      return __assign({}, event, {
        options: __assign({}, event.options, {
          voicings: __assign({}, event.options.voicings || {}, topNote ? {
            topNotes: [topNote.value]
          } : {}, {
            range: range
          })
        })
      });
    };
  };

  Sequence.humanizeEvent = function (options) {
    return function (event, index, events) {
      var durationChange = event.duration * options.humanize.duration;
      return __assign({}, event, {
        velocity: util_1.humanize(event.velocity, options.humanize.velocity),
        duration: util_1.humanize(event.duration, durationChange, -durationChange),
        time: util_1.humanize(event.time, options.humanize.time, options.humanize.time)
      });
    };
  };

  Sequence.velocityFromIndex = function (options) {
    return function (event, index, events) {
      var velocitySpan = options.dynamicVelocityRange[1] - options.dynamicVelocityRange[0];
      return __assign({}, event, {
        velocity: event.velocity * index / events.length * velocitySpan + options.dynamicVelocityRange[0]
      });
    };
  };

  Sequence.velocityFromPitch = function (options) {
    return function (event, index, events) {
      var midiValues = events.map(function (e) {
        return tonal_1.Note.midi(e.value);
      });
      var maxMidi = util_1.maxArray(midiValues);
      var avgMidi = util_1.avgArray(midiValues);
      return __assign({}, event, {
        velocity: event.velocity * avgMidi / maxMidi
      });
    };
  };

  Sequence.addDynamicVelocity = function (options) {
    return function (event, index, events) {
      if (!options.dynamicVelocity) {
        return event;
      }

      event.velocity = event.velocity || 1;
      return options.dynamicVelocity(event, index, events, options);
    };
  }; // static addSwing: EventMap = (options) => (event, index, events) => {


  Sequence.addSwing = function (options) {
    return function (events, event, index) {
      if (!options.swing) {
        // return event
        return events.concat([event]);
      }

      var isOff = Sequence.isOff(event);

      if (!isOff) {
        // return event
        return events.concat([event]);
      }

      var swingOffset = options.swing / 2 * 60 / options.bpm;
      event = __assign({}, event, {
        time: event.time + swingOffset,

        /* color: 'black', */
        duration: event.duration - swingOffset,
        velocity: event.velocity + 0.1
      });
      return events.concat([event]);
      /* const eventBefore = []
        .concat(events)
        .reverse()
        .find(b => b.time < event.time);
      if (!eventBefore) {
        return events.concat([event]);
      }
      return events
        .map((e, i) => {
          if (Rhythm.haveSamePath(e, eventBefore)) {
            e.duration += swingOffset;
          }
          return e;
        })
        .concat([event]); */
    };
  };

  Sequence.inOut = function () {
    return function (event, index, events) {
      return event.measure.form === 0 || event.measure.form === event.measure.totalForms;
    };
  };

  Sequence.removeDuplicates = function (options) {
    return function (event, index, events) {
      if (!options.phantomMelody) {
        var duplicate = events.find(function (e, i) {
          return i !== index && Harmony_1.Harmony.hasSamePitch(e.value, event.value) && Rhythm_1.Rhythm.haveSamePath(e, event);
        });
        return !duplicate || !event.chord; // always choose melody note
      }

      var melody = events.filter(function (e) {
        return e.type !== 'chord';
      }).find(function (e, i) {
        return i !== index && Harmony_1.Harmony.hasSamePitch(e.value, event.value) && Rhythm_1.Rhythm.haveSamePath(e, event);
      });
      return !melody;
    };
  };

  Sequence.getNextChordOff = function (_a) {
    var target = _a.target,
        source = _a.source,
        sourceEvents = _a.sourceEvents,
        options = _a.options;

    if (options.offsPlayNext && Sequence.isOff(target)) {
      var eigth = 60 / options.bpm / 2;
      var next = sourceEvents[sourceEvents.indexOf(source) + 1];

      if (next && next.time - target.time <= eigth) {
        return next;
      }
    }
  };

  return Sequence;
}();

exports.Sequence = Sequence; // OLD bass trying bjorklund

/*
       const chordsInBar = chords.filter(e => e.path[0] === bar);
      // place events into feel grid e.g. [0, false, 1, false] for two chords in 4 feel
      const placed = Permutation.bjorklund(feel, chordsInBar.length).reduce(
        (chords, current) => {
          const index = chords.filter(chord => chord !== false).length;
          chords.push(current ? index : false);
          return chords;
        },
        []
      );

      placed.forEach((slot, i) => {
        const isFirst = slot !== false;
        if (!isFirst) {
          slot = placed
            .slice(0, i)
            .reverse()
            .find(s => s !== false);
          if (slot === undefined) {
            console.log('no slot before', i);
            return;
          }
        }
        let chord = chordsInBar[slot];
        const indexSinceLastRoot = i - placed.indexOf(slot);

        const root = Harmony.getBassNote(event.value) + '2';
        const fifth = Distance.transpose(root, '5P');
        const note = indexSinceLastRoot % 2 == 0 ? root : fifth;
        events.push({
          ...event,
          value: note,
          duration
        });
      });

      */
},{"../harmony/Voicing":"../lib/harmony/Voicing.js","../sheet/Sheet":"../lib/sheet/Sheet.js","../harmony/Harmony":"../lib/harmony/Harmony.js","tonal":"../node_modules/tonal/index.js","../util/util":"../lib/util/util.js","../util/Logger":"../lib/util/Logger.js","..":"../lib/index.js","../util/Pattern":"../lib/util/Pattern.js","./Leadsheet":"../lib/player/Leadsheet.js","../rhythmical/Rhythm":"../lib/rhythmical/Rhythm.js"}],"../lib/util/Pattern.js":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var tonal_1 = require("tonal");

var __1 = require("..");

var Harmony_1 = require("../harmony/Harmony");

var tonal_2 = require("tonal");

var Sequence_1 = require("../player/Sequence");

var Rhythm_1 = require("../rhythmical/Rhythm");

var Pattern =
/** @class */
function () {
  function Pattern() {}

  Pattern.traverse = function (size, step, offset) {
    if (offset === void 0) {
      offset = 0;
    }

    var order = [];
    var i = offset;

    while (!order.includes(i)) {
      // while (order.length < max + offset) {
      order.push(i); // i = i + step;

      i = (i + step) % size;
    }

    return order;
  };

  Pattern.traverseArray = function (array, move, start) {
    if (start === void 0) {
      start = 0;
    }

    return this.traverse(array.length, move, start).map(function (i) {
      return array[i];
    });
  }; // index starts with 1


  Pattern.getPositions = function (positions, array) {
    return positions.map(function (p) {
      return array[(p - 1) % array.length];
    });
  }; // index starts with 0

  /* static nestIndices(parent, child) {
    return parent.map(i => child.map(p => p + i));
  } */


  Pattern.flat = function (array) {
    var _this = this;

    return array.reduce(function (flat, item) {
      if (Array.isArray(item)) {
        flat = flat.concat(_this.flat(item));
      } else {
        flat.push(item);
      }

      return flat;
    }, []);
  }; // index starts with 0


  Pattern.nestIndices = function () {
    var patterns = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      patterns[_i] = arguments[_i];
    }

    var parent = patterns[0];
    var children = patterns.slice(1);

    if (children.length === 0) {
      return parent;
    }

    parent = this.flat(parent).map(function (i) {
      return children[0].map(function (p) {
        if (isNaN(p) || isNaN(i)) {
          return p + ' ' + i;
        }

        return p + i;
      });
    });
    children.shift();
    return this.nestIndices.apply(this, [parent].concat(children));
  };

  Pattern.getNested = function (array, parent, child) {
    var _this = this;

    return parent.map(function (i) {
      return _this.getPositions(child.map(function (p) {
        return p + i - 1;
      }), array);
    });
  };

  Pattern.deepNest = function (array, tree) {
    var nested = this.getNested(array, tree[0], tree[1]);
  };

  Pattern.traverseNested = function (array, pattern, move, start) {
    if (move === void 0) {
      move = 1;
    }

    if (start === void 0) {
      start = 0;
    }

    var traversed = this.traverse(array.length, move, start);
    return this.getNested(array, traversed.map(function (p) {
      return p + 1;
    }), pattern);
  };

  Pattern.testFormat = function (nestedNotes) {
    return nestedNotes.map(function (e) {
      return e.join(' ');
    }).join(' ');
  };

  Pattern.scale = function (scaleName, pattern, range) {
    if (pattern === void 0) {
      pattern = [1];
    } // get pitch classes of scale


    var scaleNotes = tonal_1.Scale.notes(scaleName);
    var scale; // use pitch classes when no range is given

    if (!range) {
      scale = scaleNotes;
    } else {
      // get all absolute notes inside range
      scale = __1.util.noteArray(range).map(function (n) {
        var pc = scaleNotes.find(function (s) {
          return Harmony_1.Harmony.hasSamePitch(n, s);
        });

        if (pc) {
          return n;
        }
      }).filter(function (n) {
        return !!n;
      });
    } // find out index of scale tonic


    var firstTonic = scale.find(function (n) {
      return tonal_2.Note.pc(n) === scaleNotes[0];
    });
    var offset = scale.indexOf(firstTonic) - 1; // -1 for non zero starting indices...
    // add offset to pattern

    pattern = pattern.map(function (n) {
      return n + offset;
    }).map(function (n) {
      return n >= scale.length ? n - scaleNotes.length : n;
    });
    return pattern.map(function (n) {
      return tonal_2.Note.simplify(scale[n]);
    });
  };

  Pattern.render = function (scaleName, patterns, range) {
    if (range === void 0) {
      range = ['G3', 'G5'];
    }

    var scaleNotes = tonal_1.Scale.notes(scaleName);

    var scale = __1.util.noteArray(range).map(function (n) {
      var pc = scaleNotes.find(function (s) {
        return Harmony_1.Harmony.hasSamePitch(n, s);
      });

      if (pc) {
        return n;
        /* console.log('pc', pc, n, Note.oct(n));
        return pc + Note.oct(n); */
      }
    }).filter(function (n) {
      return !!n;
    });

    var firstTonic = scale.find(function (n) {
      return tonal_2.Note.pc(n) === scaleNotes[0];
    });
    var start = scale.indexOf(firstTonic);
    patterns.unshift([start]);
    var nested = this.nestIndices.apply(this, patterns).map(function (p) {
      if (p.find(function (i) {
        return i >= scale.length;
      })) {
        return p.map(function (n) {
          return n - scaleNotes.length;
        });
      }

      return p;
    });
    return this.flat(nested).map(function (n) {
      return {
        note: tonal_2.Note.simplify(scale[n]),
        index: n
      };
    });
  };

  Pattern.renderEvents = function (lines, options) {
    var flat = Rhythm_1.Rhythm.flatten(lines);
    var events = Sequence_1.Sequence.renderEvents(flat, options).map(function (e) {
      return __assign({}, e, {
        note: tonal_2.Note.simplify(e.value.note)
      });
    });
    return events;
  };

  return Pattern;
}();

exports.Pattern = Pattern;
},{"tonal":"../node_modules/tonal/index.js","..":"../lib/index.js","../harmony/Harmony":"../lib/harmony/Harmony.js","../player/Sequence":"../lib/player/Sequence.js","../rhythmical/Rhythm":"../lib/rhythmical/Rhythm.js"}],"../src/symbols.ts":[function(require,module,exports) {
"use strict";

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Chord = __importStar(require("tonal-chord"));

var Scale = __importStar(require("tonal-scale"));

exports.chords = [{
  symbol: 'm',
  long: 'minor',
  short: '-',
  groups: ['Basic', 'Triads']
}, {
  symbol: 'M',
  long: 'major',
  short: '△',
  groups: ['Basic', 'Triads']
}, {
  symbol: 'o',
  groups: ['Basic', 'Symmetric', 'Triads'],
  long: 'Vermindert'
  /* short: 'o' */

}, {
  symbol: 'M#5',
  groups: ['Advanced', 'Symmetric', 'Triads'],
  short: '△#5'
}, {
  symbol: 'Msus4',
  groups: ['Advanced', 'Symmetric'],
  short: 'sus4'
}, {
  symbol: 'Msus2',
  groups: ['Advanced', 'Symmetric'],
  short: 'sus2'
}, // 5 4 64 m#5 Mb5  7no5  
{
  symbol: '7',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'Dominantsept'
}, {
  symbol: '7#11',
  groups: ['Advanced', 'Diatonic', 'Modes'],
  long: 'Dominant #11'
}, {
  symbol: 'M6',
  groups: ['Advanced'],
  long: 'major 6',
  short: '6'
}, {
  symbol: 'o7',
  groups: ['Advanced', 'Symmetric', 'Diatonic'],
  long: 'Vermindert 7'
}, {
  symbol: 'm7',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'minor 7',
  short: '-7'
}, {
  symbol: 'oM7',
  groups: ['Expert'],
  long: 'diminished major 7',
  short: 'o△7'
}, {
  symbol: 'm7b5',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'Halbvermindert',
  short: '-7b5'
}, {
  symbol: '7#5',
  groups: ['Advanced', 'Symmetric'],
  long: 'Dominantsept #5'
}, {
  symbol: 'Maj7',
  groups: ['Basic', 'Diatonic', 'Modes'],
  long: 'Major 7',
  short: '△7'
}, {
  symbol: 'mMaj7',
  short: '-△7',
  groups: ['Advanced', 'Diatonic']
}, {
  symbol: 'M7#5',
  groups: ['Advanced', 'Diatonic'],
  short: '△7#5'
}, {
  symbol: '7sus4',
  groups: ['Advanced']
}, {
  symbol: '9',
  groups: ['Advanced']
}, {
  symbol: 'M9',
  groups: ['Advanced'],
  short: '△9'
}, {
  symbol: 'M69',
  groups: ['Advanced'],
  short: '69'
  /*
  7b13 M7b5 m7#5 9no5  M7b6 7b5 Madd9 mb6b9 mb6M7 madd4 sus24 madd9 Maddb9 +add#9 M7sus4 7#5sus4 M#5add9 M7#5sus4
  11 m9 m6 9#5 7b9 7#9 M69 9b5 m69 mM9 7b6 m9b5 m9#5 7#11 M7b9 9b13 o7M7 M9b5 11b9 M9#5 7add6 M6#11 M7#11 7#5#9 13no5 9sus4 7#5b9 M9sus4 7sus4b9 m7add11 mMaj7b6 M9#5sus4
  13 m11 M13 9#11 13#9 13b5 13b9 m11b5 7b9#9 mM9b6 M9#11 9#5#11 7#9b13 7b9b13 13sus4 m11A 5 7#9#11 7b9#11 M69#11 7#11b13 M7#9#11 M7add13 7#5b9#11 7sus4b9b13
  m13 13#11 M13#11 13b9#11 9#11b13 13#9#11 7b9b13#11 7#9#11b13
  */

}];
exports.scales = [{
  symbol: 'major pentatonic',
  groups: ['Basic', 'Pentatonic']
}, {
  symbol: 'minor pentatonic',
  groups: ['Basic', 'Pentatonic']
}, {
  symbol: 'minor blues',
  groups: ['Basic']
}, // gregorian modes
{
  symbol: 'major',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'dorian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'phrygian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'lydian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'mixolydian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'aeolian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'locrian',
  groups: ['Basic', 'Diatonic', 'Modes']
}, {
  symbol: 'whole tone',
  groups: ['Advanced', 'Symmetric']
}, {
  symbol: 'diminished',
  groups: ['Advanced', 'Symmetric']
}, //HTGT ?
{
  symbol: 'augmented',
  groups: ['Advanced', 'Symmetric']
}, {
  symbol: 'chromatic',
  groups: ['Expert', 'Symmetric']
}, // harmonic minor modes
{
  symbol: 'harmonic minor',
  groups: ['Advanced', 'Diatonic']
}, // HM 2 locrian #6 !
{
  symbol: 'ionian augmented',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'dorian #4',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'spanish',
  groups: ['Advanced', 'Diatonic']
}, // HM 6 lydian #9
// HM 7 ???
// melodic minor modes
{
  symbol: 'melodic minor',
  groups: ['Advanced', 'Diatonic']
}, {
  symbol: 'melodic minor second mode',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'lydian augmented',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'lydian dominant',
  groups: ['Advanced', 'Diatonic'],
  long: 'mixolydian #11'
}, {
  symbol: 'melodic minor fifth mode',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'locrian #2',
  groups: ['Expert', 'Diatonic']
}, {
  symbol: 'altered',
  groups: ['Advanced', 'Diatonic']
}, //non european
{
  symbol: 'kumoijoshi',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'iwato',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'pelog',
  groups: ['Exotic', 'Pentatonic']
}, // hyojo?
{
  symbol: 'egyptian',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'in-sen',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'scriabin',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'ritusen',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'hirajoshi',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'malkos raga',
  groups: ['Exotic', 'Pentatonic']
}, {
  symbol: 'vietnamese 1',
  groups: ['Exotic', 'Pentatonic']
},
/* {
    symbol: 'vietnamese 2',
    groups: ['Exotic', 'Pentatonic'] // = minor pentatonic
}, */
{
  symbol: 'lydian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'mixolydian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'ionian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'locrian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'flat six pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'minor six pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'minor #7M pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'lydian #5P pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'whole tone pentatonic',
  groups: ['Pentatonic', 'Symmetric']
}, {
  symbol: 'flat three pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'super locrian pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'major flat two pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'lydian dominant pentatonic',
  groups: ['Pentatonic']
}, {
  symbol: 'neopolitan major pentatonic',
  groups: ['Pentatonic']
  /*
  mystery #1 piongio    prometheus major blues minor hexatonic six tone symmetric prometheus neopolitan
   persian  spanish  oriental flamenco balinese   todi raga enigmatic lydian #9 neopolitan locrian #2  lydian minor  locrian major  romanian minor harmonic major hungarian major hungarian minor lydian dominant   neopolitan minor neopolitan major lydian diminished leading whole tone augmented heptatonic double harmonic major double harmonic lydian melodic minor fifth mode melodic minor second mode
  bebop kafi raga  purvi raga ichikosucho bebop minor minor bebop bebop major bebop locrian bebop dominant spanish heptatonic minor six diminished
  composite blues
  */

}];
exports.symbols = {
  chords: exports.chords,
  scales: exports.scales
};
exports.levels = ['Basic', 'Advanced', 'Expert'];

function groupFilter(group) {
  return function (item) {
    var level = Math.max(item.groups.filter(function (group) {
      return exports.levels.indexOf(group) !== -1;
    }).map(function (group) {
      return exports.levels.indexOf(group) + 1;
    }));
    var groups = level > 0 ? Array.from(new Set(exports.levels.slice(level).concat(item.groups))) : item.groups;
    return groups.indexOf(group) !== -1;
  };
}

exports.groupFilter = groupFilter;

function scaleNames(group) {
  if (group === void 0) {
    group = 'Basic';
  }

  if (!group || group === 'All') {
    return Scale.names();
  }

  return exports.scales.filter(groupFilter(group)).map(function (scale) {
    return scale.symbol;
  });
}

exports.scaleNames = scaleNames;

function chordNames(group) {
  if (group === void 0) {
    group = 'Basic';
  }

  if (!group || group === 'All') {
    return Chord.names();
  }

  return exports.chords.filter(groupFilter(group)).map(function (scale) {
    return scale.symbol;
  });
}

exports.chordNames = chordNames;

function groupNames() {
  return Array.from(new Set(exports.levels.concat(exports.scales.concat(exports.chords).map(function (item) {
    return item.groups;
  }).reduce(function (groups, current) {
    return groups.concat(current);
  })))).concat(['All']);
}

exports.groupNames = groupNames;

function symbolName(type, symbol, long) {
  var pool = exports.symbols[type + 's'];
  var match = pool.find(function (item) {
    return item.symbol === symbol;
  });

  if (!match) {
    return symbol;
  }
  /* return symbol; */


  return (long ? match.long : match.short) || symbol;
}

exports.symbolName = symbolName;

function scaleName(symbol, long) {
  if (long === void 0) {
    long = false;
  }

  return symbolName('scale', symbol, long);
}

exports.scaleName = scaleName;

function chordName(symbol, long) {
  if (long === void 0) {
    long = false;
  }

  return symbolName('chord', symbol, long);
}

exports.chordName = chordName;

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

exports.randomItem = randomItem;

function randomScale(group) {
  return randomItem(scaleNames(group));
}

exports.randomScale = randomScale;

function randomChord(group) {
  return randomItem(chordNames(group));
}

exports.randomChord = randomChord;
},{"tonal-chord":"../node_modules/tonal-chord/build/es6.js","tonal-scale":"../node_modules/tonal-scale/build/es6.js"}],"demo-patterns.js":[function(require,module,exports) {
"use strict";

var _tonal = require("tonal");

var TonalArray = _interopRequireWildcard(require("tonal-array"));

var Tone = _interopRequireWildcard(require("tone"));

var _Numeric = require("../lib/util/Numeric");

var _Pattern = require("../lib/util/Pattern");

var _symbols = require("../src/symbols");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var random255 = function random255() {
  return Math.floor(Math.random() * 255);
};

window.onload = function () {
  function drawPoints(points) {
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
    var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var color = arguments.length > 3 ? arguments[3] : undefined;
    var lineWidth = arguments.length > 4 ? arguments[4] : undefined;
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var random255 = function random255() {
      return Math.floor(Math.random() * 255);
    };

    color = color || "rgb(".concat(random255(), ",").concat(random255(), ",").concat(random255(), ")");
    lineWidth = lineWidth || 1;
    points.forEach(function (p, i) {
      var getPos = function getPos(p) {
        return [p[0], canvas.height - p[1]];
      };

      var pos = getPos(p);
      var last = i === 0 ? pos : getPos(points[i - 1]);

      var drawPoint = function drawPoint() {
        context.beginPath();
        context.lineWidth = lineWidth;
        context.moveTo(last[0], last[1]);
        context.lineTo(pos[0], pos[1]);
        context.strokeStyle = color;
        context.stroke();
        context.closePath();
      };

      if (delay === 0 && duration === 0) {
        drawPoint();
      } else {
        setTimeout(function () {
          drawPoint();
        }, i * duration / points.length + delay);
      }
    });
  }

  var saw = function saw(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        min = _ref2[0],
        max = _ref2[1];

    var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return function (x) {
      var d = max - min + 1;
      return (m * x / d - Math.floor(m * x / d)) * d + min;
    };
  };

  var canvas = document.getElementById('canvas');

  var plotter = _Numeric.Numeric.range(0, canvas.width);
  /* const points = plotter
    .plot(saw([1, canvas.height / 4], 1))
    .render()
    .map((y, x) => [x, y]); */
  // let i = 0;

  /* while (i < 10) {
    const f = Math.random() * 10;
    const a = canvas.height * Math.random();
    const points = Numeric.fixed(canvas.width)
      .sequence(Numeric.triangle([1, a], f))
      .map((y, x) => [x, y]);
    console.log('i', i);
     drawPoints(points, duration, i * duration);
    ++i;
  } */


  function getPoints(pattern, width, height) {
    var flip = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var max = Math.max.apply(Math, _toConsumableArray(pattern)) + 1;
    return pattern.map(function (value, i) {
      if (!Array.isArray(value)) {
        var _ref3 = [Math.round(i / pattern.length * width), Math.round(value / max * height)],
            x = _ref3[0],
            y = _ref3[1];

        if (flip) {
          y = height - y;
        }

        return {
          x: x,
          y: y,
          value: value
        };
      }
    });
  }

  var grad = [[random255(), random255(), random255()], [random255(), random255(), random255()]];

  function drawPattern(pattern) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var active = arguments.length > 2 ? arguments[2] : undefined;
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    context.fillStyle = '#101010';
    context.fillRect(0, 0, width, height);
    pattern = _Pattern.Pattern.flat(pattern);
    pattern = TonalArray.rotate(offset, pattern);
    var points = getPoints(pattern, width, height, false);
    var max = Math.max.apply(Math, _toConsumableArray(pattern));
    var activeIndex;

    if (active !== undefined) {
      activeIndex = (active - offset + points.length) % points.length;
    }

    var gradient = function gradient(from, to, progress) {
      return to.map(function (channel, i) {
        return from[i] + progress * (channel - from[i]);
      });
    };

    points.forEach(function (p, i) {
      var pw = width / points.length;
      var ph = height / (max + 1);
      var progress = i / pattern.length;
      var strength = p.y / height;

      var scale = _tonal.Scale.notes(scaleInput.value);

      var note = p.value % scale.length / scale.length;

      var rgbString = function rgbString(rgb) {
        return "rgb(".concat(rgb[0], ",").concat(rgb[1], ",").concat(rgb[2], ")");
      };

      var hslString = function hslString(hsl) {
        return "hsl(".concat(hsl[0], ",").concat(hsl[1], "%,").concat(hsl[2], "%)");
      };

      var color;

      if (i === activeIndex) {
        context.fillStyle = rgbString([255, 0, 0]);
      } else {
        // color = gradient(grad[0], grad[1], progress * strength);
        color = hslString([Math.floor(note * 360), 50, 50]);
      }

      context.fillStyle = color;
      var h = p.y;
      context.fillRect(pw * i, height - h - ph, pw, ph);
    });
  }

  function plot(f) {
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var color = arguments.length > 3 ? arguments[3] : undefined;
    var lineWidth = arguments.length > 4 ? arguments[4] : undefined;
    var progress = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    drawPoints(_Numeric.Numeric.plot(f).range(0, canvas.width * progress).render().map(function (y, x) {
      return [x
      /* + (progress * canvas.width) / 2 */
      , y];
    }), duration, delay, color, lineWidth);
  }
  /* plot(x => Math.tan(x/200)+canvas.height/2); */


  var plotAll = function plotAll(total) {
    var rotation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var amplitude = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var colors = arguments.length > 3 ? arguments[3] : undefined;
    var time = arguments.length > 4 ? arguments[4] : undefined;

    var sin = function sin(cw, ch) {
      var a = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      return function (x) {
        return ch / 2 * a * Math.sin((x * 4 * Math.PI + cw * Math.PI * 2 * offset) / cw) + ch / 2;
      };
    };

    var totalDuration = 3000;
    var concurrency = 1;
    var i = 1;
    var context = canvas.getContext('2d');
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    var lineFactor = 20;

    while (i <= total) {
      var prg = i / total;
      /* const delay = (i - 1) * singleDuration; */

      /* const clr = `rgb(${color[0] * prg},${color[1] * prg},${color[2] * prg})`; */

      plot(sin(canvas.width, canvas.height, prg * amplitude, prg * rotation),
      /* x =>
        amplitude * prg * Math.tan(x / 10 + prg * 2 * Math.PI) + //  rotation
        (canvas.height / 2) * prg, */

      /* x => x*prg*2+prg*2, */
      0, //singleDuration,
      0, //delay / concurrency,
      colors[i], prg * lineFactor, Math.sin(prg * time));
      i++;
    }
  };

  var randomColor = function randomColor() {
    return "rgb(".concat(random255(), ",").concat(random255(), ",").concat(random255(), ")");
  };

  var start = 0;
  var total = 30;
  var colors = new Array(total + 1).fill(0).map(function (n) {
    return randomColor();
  });

  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var s = Math.sin(timestamp / 1000) + 0.5;
    var c = Math.cos(timestamp / 1000) + 0.5;
    var m = Math.sin(timestamp / 10000) + 0.5;
    /* const color = [c * 30 + s * 20, 200, c * 80 + s * 100 * m * 2]; */

    plotAll(total, -progress / 3000, m, colors, timestamp / 10000);
    /* if (progress < 20000) { */

    window.requestAnimationFrame(step);
    /* } */
  }

  document.getElementById('screensaver').addEventListener('click', function () {
    window.requestAnimationFrame(step);
  });
  document.getElementById('randomPattern').addEventListener('click', function () {
    var scaleName = (0, _symbols.randomScale)('Advanced');
    var tonic = (0, _symbols.randomItem)(_tonal.Note.names(' b'));
    var steps = new Array(_tonal.Scale.notes(tonic + ' ', scaleName).length + 1).fill(0).map(function (e, i) {
      return i + 1;
    });
    scaleInput.value = tonic + ' ' + scaleName;

    var scale = _tonal.Scale.notes(scaleInput.value);

    patternA.value = steps.map(function (n) {
      return Math.floor(Math.random() * steps.length + 1);
    }).join(' ');
    console.log('(scale.length', scale.length);
    patternB.value = [(0, _symbols.randomItem)(steps), (0, _symbols.randomItem)(steps), (0, _symbols.randomItem)(steps), (0, _symbols.randomItem)(steps)].join(' ');
    var patterns = readPatterns();
    var nestedPattern = nestPatterns(patterns);
    drawPattern(nestedPattern, 0);
  });
  document.getElementById('flipPattern').addEventListener('click', function () {
    var scale = _tonal.Scale.notes(scaleInput.value);

    var flip = function flip(pattern) {
      var flipY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return pattern.reverse().map(function (n) {
        return flipY ? scale.length - n : n;
      });
    };

    var patterns = readPatterns();
    patternA.value = flip(patterns[0]).map(function (n) {
      return n + 1;
    }).join(' ');
    patternB.value = flip(patterns[1], true).map(function (n) {
      return n + 1;
    }).join(' ');
    patterns = readPatterns();
    var nestedPattern = nestPatterns(patterns);
    drawPattern(nestedPattern);
  });
  var seq;

  function readPatterns() {
    return [(patternA.value || '1').split(' ').map(function (n) {
      return parseInt(n) - 1;
    }), (patternB.value || '1').split(' ').map(function (n) {
      return parseInt(n) - 1;
    })];
  }

  function nestPatterns(patterns) {
    return _Pattern.Pattern.flat(_Pattern.Pattern.nestIndices.apply(_Pattern.Pattern, _toConsumableArray(patterns)));
  }

  var frame;

  function pattern(lines) {
    console.log('lines', lines);
    var synth = new Tone.PolySynth(4, Tone.Synth, {
      volume: -18,
      envelope: {
        attack: 0.02
      },
      oscillator: {
        partials: [1, 2, 3]
      }
    }).toMaster();
    Tone.Transport.bpm.value = 180;

    if (seq) {
      seq.stop();
    }

    var nestedPattern = lines.reduce(function (combined, line) {
      return combined.concat(nestPatterns(line));
    }, []);
    drawPattern(nestedPattern, 0);
    var notes = lines.reduce(function (combined, line) {
      var scale = 'C major';
      line = _Pattern.Pattern.render(scale, line, ['G2', 'G5']);
      return combined.concat(line);
    }, []);
    /*
    const rendered = lines
      .reduce((combined, line) => {
        const nested = Pattern.flat(Pattern.nestIndices(...line));
        return combined.concat(nested);
      }, [])
      .map(e => {
        const tokens = e.split(' ');
        const scale = tokens[0].replace('.', ' ');
        const degree = parseInt(tokens[1]) - 1;
        console.log('scale', scale, degree);
         const line = Pattern.render(scale, [[degree]], ['G2', 'G5']);
        console.log('line', line);
         return line;
      });
    console.log('rendered', rendered);
     */
    // const patterns = readPatterns();
    // const nestedPattern = nestPatterns(patterns);
    // drawPattern(nestedPattern, 0);

    /* const notes = Pattern.render(scaleInput.value || 'C major', patterns, [
      'G2',
      'G5'
    ]); */

    var activeIndex;
    seq = new Tone.Sequence(function (time, event, index) {
      /* if (Math.random() > 0.9) {
        return;
      } */
      // /* offset + activeIndex */
      activeIndex = notes.indexOf(event);
      Tone.Draw.schedule(function () {
        drawPattern(nestedPattern, 0, activeIndex);
      }, time);
      synth.triggerAttackRelease(event.note, '4n', time);
    }, notes, '4n');
    seq.start(0);
    Tone.Transport.start('+1');

    function updatePlayhead() {
      drawPattern(nestedPattern, 0, activeIndex);
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');
      var x = seq.progress * canvas.width;
      context.beginPath();
      context.moveTo(x, 0); // End point (180,47)

      context.lineTo(x, canvas.height); // Make the line visible

      context.lineWidth = 2;
      context.strokeStyle = '#fff';
      context.stroke();
      frame = requestAnimationFrame(updatePlayhead);
    }

    frame = requestAnimationFrame(updatePlayhead);
  }

  function parsePatterns(text) {
    var lines = text.split('\n').map(function (line) {
      return line.split('>').map(function (p) {
        return p.trim().split(' ').map(function (n) {
          return isNaN(n) ? n : parseInt(n) - 1;
        });
      });
    });
    return lines;
  }

  var textarea = document.getElementById('textarea');
  textarea.value = ['1 2 5 1 > 8 7 5 3', '1 6 2 5 > 1 2 3 5'].join('\n');
  textarea.addEventListener('blur', function () {
    console.log('blur', textarea.value);

    if (seq) {
      console.log('seq', seq);
      seq.removeAll();
    }
  });
  playPattern.addEventListener('click', function () {
    var textarea = document.getElementById('textarea');
    var lines = parsePatterns(textarea.value);
    pattern(lines);
  });
  stopPattern.addEventListener('click', function () {
    /* seq.stop(); */
    cancelAnimationFrame(frame);
    Tone.Transport.stop();
  });
};
},{"tonal":"../node_modules/tonal/index.js","tonal-array":"../node_modules/tonal-array/build/es6.js","tone":"../node_modules/tone/build/Tone.js","../lib/util/Numeric":"../lib/util/Numeric.js","../lib/util/Pattern":"../lib/util/Pattern.js","../src/symbols":"../src/symbols.ts"}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63042" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","demo-patterns.js"], null)
//# sourceMappingURL=/demo-patterns.7c823888.map