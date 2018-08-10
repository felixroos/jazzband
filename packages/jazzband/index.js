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
})({"../../../../../.nvm/versions/node/v8.11.1/lib/node_modules/parcel/node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
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
    }
    // if setTimeout wasn't available but was latter defined
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
    }
    // if clearTimeout wasn't available but was latter defined
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
};

// v8 likes predictible objects
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
},{}],"../../../node_modules/waaclock/lib/WAAClock.js":[function(require,module,exports) {
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
},{"process":"../../../../../.nvm/versions/node/v8.11.1/lib/node_modules/parcel/node_modules/process/browser.js"}],"../../../node_modules/waaclock/index.js":[function(require,module,exports) {
var WAAClock = require('./lib/WAAClock')

module.exports = WAAClock
if (typeof window !== 'undefined') window.WAAClock = WAAClock

},{"./lib/WAAClock":"../../../node_modules/waaclock/lib/WAAClock.js"}],"Pulse.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
exports.__esModule = true;
var waaclock_1 = __importDefault(require("waaclock"));
var Pulse = /** @class */function () {
    function Pulse(props) {
        this.defaults = {
            bpm: 120,
            cycle: 4,
            delay: 0
        };
        this.events = [];
        this.props = Object.assign({}, this.defaults, props);
        this.context = this.props.context || new AudioContext();
        this.clock = this.props.clock || new waaclock_1["default"](this.context, { toleranceEarly: 0.1, toleranceLate: 0.1 });
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
    Pulse.prototype.arrayPulse = function (children, length, path, start, callback) {
        var _this = this;
        if (length === void 0) {
            length = 1;
        }
        if (path === void 0) {
            path = [];
        }
        if (start === void 0) {
            start = 0;
        }
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
            start += this.props.delay;
            if (this.callbackAtTime) {
                start += this.context.currentTime;
                item_1.timeout = this.clock.callbackAtTime(function (event) {
                    return callback(Object.assign(item_1, { event: event, deadline: event.deadline }));
                }, start);
            } else {
                item_1.timeout = this.clock.setTimeout(function (event) {
                    return callback(Object.assign(item_1, { event: event, deadline: event.deadline }));
                }, start);
            }
            this.events.push(item_1.timeout);
            return item_1;
        }
        var childLength = length / children.length;
        return {
            length: length,
            children: children.map(function (el, i) {
                return _this.arrayPulse(el, childLength, path.concat([i]), start + i * childLength, callback);
            })
        };
    };
    Pulse.prototype.tickArray = function (array, callback, length) {
        var l = length || this.getMeasureLength() * array.length;
        this.clock.start();
        return this.arrayPulse(array, l, [], 0, callback);
    };
    Pulse.prototype.start = function () {
        console.log('start with', this.events.length, 'events');
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
        });
        // TODO: stretch durations?!
        this.clock.timeStretch(this.context.currentTime, events, factor);
    };
    return Pulse;
}();
exports.Pulse = Pulse;
},{"waaclock":"../../../node_modules/waaclock/index.js"}],"Band.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Pulse_1 = require("./Pulse");
var Band = /** @class */function () {
    function Band(_a) {
        var _b = _a === void 0 ? {} : _a,
            context = _b.context,
            musicians = _b.musicians;
        this.defaults = {
            times: 1,
            cycle: 4,
            division: 3,
            transpose: 0,
            style: 'Medium Swing'
        };
        this.context = context || new AudioContext();
        this.musicians = musicians || [];
    }
    Band.prototype.ready = function () {
        return Promise.all([this.resume()].concat(this.musicians.map(function (m) {
            return m.ready;
        })));
    };
    Band.prototype.resume = function () {
        var _this = this;
        return this.context.resume().then(function () {
            return _this.context;
        });
    };
    Band.prototype.comp = function (measures, settings) {
        var _this = this;
        console.log('band.comp', settings);
        if (this.pulse) {
            this.pulse.stop();
        }
        settings = Object.assign(this.defaults, settings, { context: this.context });
        measures = measures.map(function (m) {
            return !Array.isArray(m) ? [m] : m;
        });
        if (settings.times > 1) {
            measures = new Array(settings.times).fill(1).reduce(function (song) {
                return song.concat(measures);
            }, []);
        }
        this.ready().then(function () {
            _this.pulse = new Pulse_1.Pulse(settings);
            _this.musicians.forEach(function (musician) {
                return musician.play({ pulse: _this.pulse, measures: measures, settings: settings });
            });
            _this.pulse.start();
        });
    };
    return Band;
}();
exports["default"] = Band;
},{"./Pulse":"Pulse.ts"}],"../../../node_modules/tonal-note/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokenize = tokenize;
exports.fromMidi = fromMidi;
/**
 * [![npm version](https://img.shields.io/npm/v/tonal-note.svg)](https://www.npmjs.com/package/tonal-note)
 * [![tonal](https://img.shields.io/badge/tonal-note-yellow.svg)](https://www.npmjs.com/browse/keyword/tonal)
 *
 * `tonal-note` is a collection of functions to manipulate musical notes in scientific notation
 *
 * This is part of [tonal](https://www.npmjs.com/package/tonal) music theory library.
 *
 * ## Usage
 *
 * ```js
 * import * as Note from "tonal-note"
 * // or const Note = require("tonal-note")
 * Note.name("bb2") // => "Bb2"
 * Note.chroma("bb2") // => 10
 * Note.midi("a4") // => 69
 * Note.freq("a4") // => 440
 * Note.oct("G3") // => 3
 *
 * // part of tonal
 * const Tonal = require("tonal")
 * // or import Note from "tonal"
 * Tonal.Note.midi("d4") // => 62
 * ```
 *
 * ## Install
 *
 * [![npm install tonal-note](https://nodei.co/npm/tonal-note.png?mini=true)](https://npmjs.org/package/tonal-note/)
 *
 * ## API Documentation
 *
 * @module Note
 */

var NAMES = "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B".split(" ");

/**
 * Get a list of note names (pitch classes) within a octave
 *
 * @param {string} accTypes - (Optional, by default " b#"). A string with the
 * accidentals types: " " means no accidental, "#" means sharps, "b" mean flats,
 * can be conbined (see examples)
 * @return {Array}
 * @example
 * Note.names(" b") // => [ "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" ]
 * Note.names(" #") // => [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ]
 */
var names = exports.names = function (accTypes) {
  return typeof accTypes !== "string" ? NAMES.slice() : NAMES.filter(function (n) {
    var acc = n[1] || " ";
    return accTypes.indexOf(acc) !== -1;
  });
};

var SHARPS = names(" #");
var FLATS = names(" b");
var REGEX = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;

/**
 * Split a string into tokens related to note parts.
 * It returns an array of strings `[letter, accidental, octave, modifier]`
 *
 * It always returns an array
 *
 * @param {String} str
 * @return {Array} an array of note tokens
 * @example
 * Note.tokenize("C#2") // => ["C", "#", "2", ""]
 * Note.tokenize("Db3 major") // => ["D", "b", "3", "major"]
 * Note.tokenize("major") // => ["", "", "", "major"]
 * Note.tokenize("##") // => ["", "##", "", ""]
 * Note.tokenize() // => ["", "", "", ""]
 */
function tokenize(str) {
  if (typeof str !== "string") {
    str = "";
  }
  var m = REGEX.exec(str);
  if (!m) {
    return null;
  }
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
  if (tokens[0] === "" || tokens[3] !== "") {
    return NO_NOTE;
  }
  var letter = tokens[0];
  var acc = tokens[1];
  var octStr = tokens[2];
  var p = { letter: letter, acc: acc, octStr: octStr };
  p.pc = p.letter + p.acc;
  p.name = p.pc + octStr;
  p.step = (p.letter.charCodeAt(0) + 3) % 7;
  p.alt = p.acc[0] === "b" ? -p.acc.length : p.acc.length;
  p.oct = octStr.length ? +octStr : null;
  p.chroma = (SEMI[p.step] + p.alt + 120) % 12;
  p.midi = p.oct !== null ? SEMI[p.step] + p.alt + 12 * (p.oct + 1) : null;
  p.freq = midiToFreq(p.midi);
  return Object.freeze(p);
};

var memo = function (fn, cache) {
  if (cache === void 0) cache = {};

  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};

/**
 * Get note properties. It returns an object with the following information:
 *
 * - name {String}: the note name. The letter is always in uppercase
 * - letter {String}: the note letter, always in uppercase
 * - acc {String}: the note accidentals
 * - octave {Number}: the octave or null if not present
 * - pc {String}: the pitch class (letter + accidentals)
 * - step {Number}: number equivalent of the note letter. 0 means C ... 6 means B.
 * - alt {Number}: number equivalent of accidentals (negative are flats, positive sharps)
 * - chroma {Number}: number equivalent of the pitch class, where 0 is C, 1 is C# or Db, 2 is D...
 * - midi {Number}: the note midi number
 * - freq {Number}: the frequency using an equal temperament at 440Hz
 *
 * This function *always* returns an object with all this properties, but if it"s
 * not a valid note all properties will be null.
 *
 * The returned object can"t be mutated.
 *
 * @param {String} note - the note name in scientific notation
 * @return {Object} an object with the properties (or an object will all properties
 * set to null if not valid note)
 * @example
 * Note.props("fx-3").name // => "F##-3"
 * Note.props("invalid").name // => null
 * Note.props("C#3").oct // => 3
 * Note.props().oct // => null
 */
var props = exports.props = memo(properties);

/**
 * Given a note name, return the note name or null if not valid note.
 * The note name will ALWAYS have the letter in upercase and accidentals
 * using # or b
 *
 * Can be used to test if a string is a valid note name.
 *
 * @function
 * @param {Pitch|string}
 * @return {string}
 *
 * @example
 * Note.name("cb2") // => "Cb2"
 * ["c", "db3", "2", "g+", "gx4"].map(Note.name) // => ["C", "Db3", null, null, "G##4"]
 */
var name = exports.name = function (str) {
  return props(str).name;
};

/**
 * Get pitch class of a note. The note can be a string or a pitch array.
 *
 * @function
 * @param {string|Pitch}
 * @return {string} the pitch class
 * @example
 * Note.pc("Db3") // => "Db"
 * ["db3", "bb6", "fx2"].map(Note.pc) // => [ "Db", "Bb", "F##"]
 */
var pc = exports.pc = function (str) {
  return props(str).pc;
};

/**
 * Get the note midi number
 * (an alias of tonal-midi `toMidi` function)
 *
 * @function
 * @param {string|Number} note - the note to get the midi number from
 * @return {Integer} the midi number or null if not valid pitch
 * @example
 * Note.midi("C4") // => 60
 * Note.midi(60) // => 60
 * @see midi.toMidi
 */
var midi = exports.midi = function (note) {
  return props(note).midi || +note || null;
};

/**
 * Get the frequency from midi number
 *
 * @param {Number} midi - the note midi number
 * @param {Number} tuning - (Optional) 440 by default
 * @return {Number} the frequency or null if not valid note midi
 */
var midiToFreq = exports.midiToFreq = function (midi, tuning) {
  if (tuning === void 0) tuning = 440;

  return typeof midi === "number" ? Math.pow(2, (midi - 69) / 12) * tuning : null;
};

/**
 * Get the frequency of a note
 *
 * @function
 * @param {string|Number} note - the note name or midi note number
 * @return {Number} the frequency
 * @example
 * Note.freq("A4") // => 440
 * Note.freq(69) // => 440
 */
var freq = exports.freq = function (note) {
  return props(note).freq || midiToFreq(note);
};

var L2 = Math.log(2);
var L440 = Math.log(440);
/**
 * Get the midi number from a frequency in hertz. The midi number can
 * contain decimals (with two digits precission)
 *
 * @param {Number} frequency
 * @return {Number}
 * @example
 * Note.freqToMidi(220)); //=> 57;
 * Note.freqToMidi(261.62)); //=> 60;
 * Note.freqToMidi(261)); //=> 59.96;
 */
var freqToMidi = exports.freqToMidi = function (freq) {
  var v = 12 * (Math.log(freq) - L440) / L2 + 69;
  return Math.round(v * 100) / 100;
};

/**
 * Return the chroma of a note. The chroma is the numeric equivalent to the
 * pitch class, where 0 is C, 1 is C# or Db, 2 is D... 11 is B
 *
 * @param {string} note - the note name
 * @return {Integer} the chroma number
 * @example
 * Note.chroma("Cb") // => 11
 * ["C", "D", "E", "F"].map(Note.chroma) // => [0, 2, 4, 5]
 */
var chroma = exports.chroma = function (str) {
  return props(str).chroma;
};

/**
 * Get the octave of the given pitch
 *
 * @function
 * @param {string} note - the note
 * @return {Integer} the octave or null if doesn"t have an octave or not a valid note
 * @example
 * Note.oct("C#4") // => 4
 * Note.oct("C") // => null
 * Note.oct("blah") // => undefined
 */
var oct = exports.oct = function (str) {
  return props(str).oct;
};

var LETTERS = "CDEFGAB";
/**
 * Given a step number return it"s letter (0 = C, 1 = D, 2 = E)
 * @param {number} step
 * @return {string} the letter
 * @example
 * Note.stepToLetter(3) // => "F"
 */
var stepToLetter = exports.stepToLetter = function (step) {
  return LETTERS[step];
};

var fillStr = function (s, n) {
  return Array(n + 1).join(s);
};
var numToStr = function (num, op) {
  return typeof num !== "number" ? "" : op(num);
};

/**
 * Given an alteration number, return the accidentals
 * @param {Number} alt
 * @return {String}
 * @example
 * Note.altToAcc(-3) // => "bbb"
 */
var altToAcc = exports.altToAcc = function (alt) {
  return numToStr(alt, function (alt) {
    return alt < 0 ? fillStr("b", -alt) : fillStr("#", alt);
  });
};

/**
 * Creates a note name in scientific notation from note properties,
 * and optionally another note name.
 * It receives an object with:
 * - step: the note step (0 = C, 1 = D, ... 6 = B)
 * - alt: (optional) the alteration. Negative numbers are flats, positive sharps
 * - oct: (optional) the octave
 *
 * Optionally it receives another note as a "base", meaning that any prop not explicitly
 * received on the first parameter will be taken from that base note. That way it can be used
 * as an immutable "set" operator for a that base note
 *
 * @function
 * @param {Object} props - the note properties
 * @param {String} [baseNote] - note to build the result from. If given, it returns
 * the result of applying the given props to this note.
 * @return {String} the note name in scientific notation or null if not valid properties
 * @example
 * Note.from({ step: 5 }) // => "A"
 * Note.from({ step: 1, acc: -1 }) // => "Db"
 * Note.from({ step: 2, acc: 2, oct: 2 }) // => "E##2"
 * Note.from({ step: 7 }) // => null
 * Note.from({alt: 1, oct: 3}, "C4") // => "C#3"
 */
var from = exports.from = function (fromProps, baseNote) {
  if (fromProps === void 0) fromProps = {};
  if (baseNote === void 0) baseNote = null;

  var ref = baseNote ? Object.assign({}, props(baseNote), fromProps) : fromProps;
  var step = ref.step;
  var alt = ref.alt;
  var oct = ref.oct;
  var letter = stepToLetter(step);
  if (!letter) {
    return null;
  }
  var pc = letter + altToAcc(alt);
  return oct || oct === 0 ? pc + oct : pc;
};

/**
 * Deprecated. This is kept for backwards compatibility only.
 * Use Note.from instead
 */
var build = exports.build = from;

/**
 * Given a midi number, returns a note name. The altered notes will have
 * flats unless explicitly set with the optional `useSharps` parameter.
 *
 * @function
 * @param {number} midi - the midi note number
 * @param {boolean} useSharps - (Optional) set to true to use sharps instead of flats
 * @return {string} the note name
 * @example
 * Note.fromMidi(61) // => "Db4"
 * Note.fromMidi(61, true) // => "C#4"
 * // it rounds to nearest note
 * Note.fromMidi(61.7) // => "D4"
 */
function fromMidi(num, sharps) {
  num = Math.round(num);
  var pcs = sharps === true ? SHARPS : FLATS;
  var pc = pcs[num % 12];
  var o = Math.floor(num / 12) - 1;
  return pc + o;
}

/**
 * Simplify the note: find an enhramonic note with less accidentals.
 *
 * @param {String} note - the note to be simplified
 * @param {boolean} useSameAccType - (optional, true by default) set to true
 * to ensure the returned note has the same accidental types that the given note
 * @return {String} the simplfiied note or null if not valid note
 * @example
 * Note.simplify("C##") // => "D"
 * Note.simplify("C###") // => "D#"
 * Note.simplify("C###", false) // => "Eb"
 * Note.simplify("B#4") // => "C5"
 */
var simplify = exports.simplify = function (note, sameAcc) {
  var ref = props(note);
  var alt = ref.alt;
  var chroma = ref.chroma;
  var midi = ref.midi;
  if (chroma === null) {
    return null;
  }
  var useSharps = sameAcc === false ? alt < 0 : alt > 0;
  return midi === null ? pc(fromMidi(chroma, useSharps)) : fromMidi(midi, useSharps);
};

/**
 * Get the simplified and enhramonic note of the given one.
 *
 * @param {String} note
 * @return {String} the enhramonic note
 * @example
 * Note.enharmonic("Db") // => "C#"
 * Note.enhramonic("C") // => "C"
 */
var enharmonic = exports.enharmonic = function (note) {
  return simplify(note, false);
};
},{}],"../../../node_modules/tonal-array/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.permutations = exports.shuffle = exports.compact = undefined;
exports.range = range;
exports.rotate = rotate;
exports.sort = sort;
exports.unique = unique;

var _tonalNote = require("tonal-note");

// ascending range
function ascR(b, n) {
  for (var a = []; n--; a[n] = n + b) {
    ;
  }
  return a;
}
// descending range
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
 * const Array = require("tonal-array)
 * Array.range(1, 4) // => [1, 2, 3, 4]
 *
 * @module Array
 */
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
var compact = exports.compact = function (arr) {
  return arr.filter(function (n) {
    return n === 0 || n;
  });
};

// a function that get note heights (with negative number for pitch classes)
var height = function (n) {
  var m = (0, _tonalNote.midi)(n);
  return m !== null ? m : (0, _tonalNote.midi)(n + "-100");
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
var shuffle = exports.shuffle = function (arr, rnd) {
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
var permutations = exports.permutations = function (arr) {
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
},{"tonal-note":"../../../node_modules/tonal-note/build/es6.js"}],"../../../node_modules/tonal-interval/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.props = props;
/**
 * [![npm version](https://img.shields.io/npm/v/tonal-interval.svg)](https://www.npmjs.com/package/tonal-interval)
 * [![tonal](https://img.shields.io/badge/tonal-interval-yellow.svg)](https://www.npmjs.com/browse/keyword/tonal)
 *
 * `tonal-interval` is a collection of functions to create and manipulate music intervals.
 *
 * The intervals are strings in shorthand notation. Two variations are supported:
 *
 * - standard shorthand notation: type and number, for example: "M3", "d-4"
 * - inverse shorthand notation: number and then type, for example: "3M", "-4d"
 *
 * The problem with the standard shorthand notation is that some strings can be
 * parsed as notes or intervals, for example: "A4" can be note A in 4th octave
 * or an augmented four. To remove ambiguity, the prefered notation in tonal is the
 * inverse shortand notation.
 *
 * This is part of [tonal](https://www.npmjs.com/package/tonal) music theory library.
 *
 * ## Usage
 *
 * ```js
 * // es6
 * import * as Interval from "tonal-interval"
 * // es5
 * const Interval = require("tonal-interval")
 * // part of tonal
 * import { Interval } from "tonal"
 *
 * Interval.semitones("4P") // => 5
 * Interval.invert("3m") // => "6M"
 * Interval.simplify("9m") // => "2m"
 * ```
 *
 * ## Install
 *
 * [![npm install tonal-interval](https://nodei.co/npm/tonal-interval.png?mini=true)](https://npmjs.org/package/tonal-interval/)
 *
 * ## API Documentation
 *
 * @module Interval
 */
// shorthand tonal notation (with quality after number)
var IVL_TNL = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
// standard shorthand notation (with quality before number)
var IVL_STR = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
var REGEX = new RegExp("^" + IVL_TNL + "|" + IVL_STR + "$");
var SIZES = [0, 2, 4, 5, 7, 9, 11];
var TYPES = "PMMPPMM";
var CLASSES = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
var NAMES = "1P 2m 2M 3m 3M 4P 5P 6m 6M 7m 7M 8P".split(" ");

/**
 * List basic (perfect, major, minor) interval names within a octave
 * @param {String} qualities - (Optional, default "PMm") the valid types
 * @return {Array} the interval names
 * @example
 * Interval.names() // => [ "1P", "2m", "2M", "3m", "3M", "4P", "5P", "6m", "6M", "7m", "7M", "8P" ]
 * Interval.names("P") // => [ "1P", "4P", "5P", "8P" ]
 * Interval.names("PM") // => [ "1P", "2M", "3M", "4P", "5P", "6M", "7M", "8P" ]
 * Interval.names("Pm") // => [ "1P", "2m", "3m", "4P", "5P", "6m", "7m", "8P" ]
 * Interval.names("d") // => []
 */
var names = exports.names = function (types) {
  return typeof types !== "string" ? NAMES.slice() : NAMES.filter(function (n) {
    return types.indexOf(n[1]) !== -1;
  });
};

var tokenize = exports.tokenize = function (str) {
  var m = REGEX.exec(str);
  return m === null ? null : m[1] ? [m[1], m[2]] : [m[4], m[3]];
};

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
  chroma: null
});

var fillStr = function (s, n) {
  return Array(Math.abs(n) + 1).join(s);
};

var qToAlt = function (type, q) {
  if (q === "M" && type === "M") {
    return 0;
  }
  if (q === "P" && type === "P") {
    return 0;
  }
  if (q === "m" && type === "M") {
    return -1;
  }
  if (/^A+$/.test(q)) {
    return q.length;
  }
  if (/^d+$/.test(q)) {
    return type === "P" ? -q.length : -q.length - 1;
  }
  return null;
};

var altToQ = function (type, alt) {
  if (alt === 0) {
    return type === "M" ? "M" : "P";
  } else if (alt === -1 && type === "M") {
    return "m";
  } else if (alt > 0) {
    return fillStr("A", alt);
  } else if (alt < 0) {
    return fillStr("d", type === "P" ? alt : alt + 1);
  } else {
    return null;
  }
};

var numToStep = function (num) {
  return (Math.abs(num) - 1) % 7;
};

var properties = function (str) {
  var t = tokenize(str);
  if (t === null) {
    return NO_IVL;
  }
  var p = { num: +t[0], q: t[1] };
  p.step = numToStep(p.num);
  p.type = TYPES[p.step];
  if (p.type === "M" && p.q === "P") {
    return NO_IVL;
  }

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
/**
 * Get interval properties. It returns an object with:
 *
 * - name: name
 * - num: number
 * - q: quality
 * - step: step
 * - alt: alteration
 * - dir: direction (1 ascending, -1 descending)
 * - type: "P" or "M" for perfectable or majorable
 * - simple: the simplified number
 * - semitones: the size in semitones
 * - chroma: the interval chroma
 * - ic: the interval class
 *
 * @function
 * @param {String} interval - the interval
 * @return {Object} the interval in the form [number, alt]
 */
function props(str) {
  if (typeof str !== "string") {
    return NO_IVL;
  }
  return cache[str] || (cache[str] = properties(str));
}

/**
 * Get the number of the interval
 *
 * @function
 * @param {String} interval - the interval
 * @return {Integer}
 * @example
 * Interval.num("m2") // => 2
 * Interval.num("P9") // => 9
 * Interval.num("P-4") // => -4
 */
var num = exports.num = function (str) {
  return props(str).num;
};

/**
 * Get interval name. Can be used to test if it"s an interval. It accepts intervals
 * as pitch or string in shorthand notation or tonal notation. It returns always
 * intervals in tonal notation.
 *
 * @function
 * @param {String} interval - the interval string or array
 * @return {String} the interval name or null if not valid interval
 * @example
 * Interval.name("m-3") // => "-3m"
 * Interval.name("3") // => null
 */
var name = exports.name = function (str) {
  return props(str).name;
};

/**
 * Get size in semitones of an interval
 *
 * @function
 * @param {String} ivl
 * @return {Integer} the number of semitones or null if not an interval
 * @example
 * import { semitones } from "tonal-interval"
 * semitones("P4") // => 5
 * // or using tonal
 * Tonal.Interval.semitones("P5") // => 7
 */
var semitones = exports.semitones = function (str) {
  return props(str).semitones;
};

/**
 * Get the chroma of the interval. The chroma is a number between 0 and 7
 * that represents the position within an octave (pitch set)
 *
 * @function
 * @param {String} str
 * @return {Number}
 */
var chroma = exports.chroma = function (str) {
  return props(str).chroma;
};

/**
 * Get the [interval class](https://en.wikipedia.org/wiki/Interval_class)
 * number of a given interval.
 *
 * In musical set theory, an interval class is the shortest distance in
 * pitch class space between two unordered pitch classes
 *
 * @function
 * @param {String|Integer} interval - the interval or the number of semitones
 * @return {Integer} A value between 0 and 6
 *
 * @example
 * Interval.ic("P8") // => 0
 * Interval.ic("m6") // => 4
 * Interval.ic(10) // => 2
 * ["P1", "M2", "M3", "P4", "P5", "M6", "M7"].map(ic) // => [0, 2, 4, 5, 5, 3, 1]
 */
var ic = exports.ic = function (ivl) {
  if (typeof ivl === "string") {
    ivl = props(ivl).chroma;
  }
  return typeof ivl === "number" ? CLASSES[ivl % 12] : null;
};

/**
 * Given a interval property object, get the interval name
 *
 * The properties must contain a `num` *or* `step`, and `alt`:
 *
 * - num: the interval number
 * - step: the interval step (overrides the num property)
 * - alt: the interval alteration
 * - oct: (Optional) the number of octaves
 * - dir: (Optional) the direction
 *
 * @function
 * @param {Object} props - the interval property object
 *
 * @return {String} the interval name
 * @example
 * Interval.build({ step: 1, alt: -1, oct: 0, dir: 1 }) // => "1d"
 * Interval.build({ num: 9, alt: -1 }) // => "9m"
 */
var build = exports.build = function (ref) {
  if (ref === void 0) ref = {};
  var num = ref.num;
  var step = ref.step;
  var alt = ref.alt;
  var oct = ref.oct;if (oct === void 0) oct = 1;
  var dir = ref.dir;

  if (step !== undefined) {
    num = step + 1 + 7 * oct;
  }
  if (num === undefined) {
    return null;
  }

  var d = dir < 0 ? "-" : "";
  var type = TYPES[numToStep(num)];
  return d + num + altToQ(type, alt);
};

/**
 * Get the simplified version of an interval.
 *
 * @function
 * @param {String} interval - the interval to simplify
 * @return {String} the simplified interval
 *
 * @example
 * Interval.simplify("9M") // => "2M"
 * ["8P", "9M", "10M", "11P", "12P", "13M", "14M", "15P"].map(Interval.simplify)
 * // => [ "8P", "2M", "3M", "4P", "5P", "6M", "7M", "8P" ]
 * Interval.simplify("2M") // => "2M"
 * Interval.simplify("-2M") // => "7m"
 */
var simplify = exports.simplify = function (str) {
  var p = props(str);
  if (p === NO_IVL) {
    return null;
  }
  return p.simple + p.q;
};

/**
 * Get the inversion (https://en.wikipedia.org/wiki/Inversion_(music)#Intervals)
 * of an interval.
 *
 * @function
 * @param {String} interval - the interval to invert in interval shorthand
 * notation or interval array notation
 * @return {String} the inverted interval
 *
 * @example
 * Interval.invert("3m") // => "6M"
 * Interval.invert("2M") // => "7m"
 */
var invert = exports.invert = function (str) {
  var p = props(str);
  if (p === NO_IVL) {
    return null;
  }
  var step = (7 - p.step) % 7;
  var alt = p.type === "P" ? -p.alt : -(p.alt + 1);
  return build({ step: step, alt: alt, oct: p.oct, dir: p.dir });
};

// interval numbers
var IN = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7];
// interval qualities
var IQ = "P m M m M P d P m M m M".split(" ");

/**
 * Get interval name from semitones number. Since there are several interval
 * names for the same number, the name it"s arbitraty, but deterministic.
 *
 * @function
 * @param {Integer} num - the number of semitones (can be negative)
 * @return {String} the interval name
 * @example
 * import { fromSemitones } from "tonal-interval"
 * fromSemitones(7) // => "5P"
 * // or using tonal
 * Tonal.Distance.fromSemitones(-7) // => "-5P"
 */
var fromSemitones = exports.fromSemitones = function (num) {
  var d = num < 0 ? -1 : 1;
  var n = Math.abs(num);
  var c = n % 12;
  var o = Math.floor(n / 12);
  return d * (IN[c] + 7 * o) + IQ[c];
};
},{}],"../../../node_modules/tonal-distance/build/es6.js":[function(require,module,exports) {
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

// Map from letter step to number of fifths starting from "C":
// { C: 0, D: 2, E: 4, F: -1, G: 1, A: 3, B: 5 }
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
var FIFTHS = [0, 2, 4, -1, 1, 3, 5];

// Given a number of fifths, return the octaves they span
var fOcts = function (f) {
  return Math.floor(f * 7 / 12);
};

// Get the number of octaves it span each step
var FIFTH_OCTS = FIFTHS.map(fOcts);

var encode = function (ref) {
  var step = ref.step;
  var alt = ref.alt;
  var oct = ref.oct;
  var dir = ref.dir;if (dir === void 0) dir = 1;

  var f = FIFTHS[step] + 7 * alt;
  if (oct === null) {
    return [dir * f];
  }
  var o = oct - FIFTH_OCTS[step] - 4 * alt;
  return [dir * f, dir * o];
};

// We need to get the steps from fifths
// Fifths for CDEFGAB are [ 0, 2, 4, -1, 1, 3, 5 ]
// We add 1 to fifths to avoid negative numbers, so:
// for ["F", "C", "G", "D", "A", "E", "B"] we have:
var STEPS = [3, 0, 4, 1, 5, 2, 6];

// Return the number of fifths as if it were unaltered
function unaltered(f) {
  var i = (f + 1) % 7;
  return i < 0 ? 7 + i : i;
}

var decode = function (f, o, dir) {
  var step = STEPS[unaltered(f)];
  var alt = Math.floor((f + 1) / 7);
  if (o === undefined) {
    return { step: step, alt: alt, dir: dir };
  }
  var oct = o + 4 * alt + FIFTH_OCTS[step];
  return { step: step, alt: alt, oct: oct, dir: dir };
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
 * @param {String} note
 * @param {String} interval
 * @return {String} the transposed note
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
 * @param {String} pitchClass - the pitch class
 * @param {Integer} fifhts - the number of fifths
 * @return {String} the transposed pitch class
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
 * @param {String} to - note or pitch class
 * @param {String} from - note or pitch class
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
 * @param {String} note
 * @param {String} interval
 * @return {String} the transposed note
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
 * @param {String} interval1
 * @param {String} interval2
 * @return {String} the resulting interval
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
 * @param {String} minuend
 * @param {String} subtrahend
 * @return {String} interval diference
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
 * @param {String} from - distance from
 * @param {String} to - distance to
 * @return {String} the interval distance
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
},{"tonal-note":"../../../node_modules/tonal-note/build/es6.js","tonal-interval":"../../../node_modules/tonal-interval/build/es6.js"}],"../../../node_modules/tonal-dictionary/build/data/scales.json":[function(require,module,exports) {
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
  "locrian #2": ["1P 2M 3m 4P 5d 6m 7m"],
  "locrian major": ["1P 2M 3M 4P 5d 6m 7m", ["arabian"]],
  "altered": [
    "1P 2m 3m 3M 5d 6m 7m",
    ["super locrian", "diminished whole tone", "pomeroy"]
  ],
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
  "harmonic minor": ["1P 2M 3m 4P 5P 6m 7M"],
  "lydian minor": ["1P 2M 3M 4A 5P 6m 7m"],
  "neopolitan": ["1P 2m 3m 4P 5P 6m 7M"],
  "neopolitan minor": ["1P 2m 3m 4P 5P 6m 7M"],
  "neopolitan major": ["1P 2m 3m 4P 5P 6M 7M", ["dorian b2"]],
  "neopolitan major pentatonic": ["1P 3M 4P 5d 7m"],
  "romanian minor": ["1P 2M 3m 5d 5P 6M 7m"],
  "double harmonic lydian": ["1P 2m 3M 4A 5P 6m 7M"],
  "diminished": ["1P 2M 3m 4P 5d 6m 6M 7M"],
  "harmonic major": ["1P 2M 3M 4P 5P 6m 7M"],
  "double harmonic major": ["1P 2m 3M 4P 5P 6m 7M", ["gypsy"]],
  "egyptian": ["1P 2M 4P 5P 7m"],
  "hungarian minor": ["1P 2M 3m 4A 5P 6m 7M"],
  "hungarian major": ["1P 2A 3M 4A 5P 6M 7m"],
  "oriental": ["1P 2m 3M 4P 5d 6M 7m"],
  "spanish": ["1P 2m 3M 4P 5P 6m 7m", ["phrygian major"]],
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
},{}],"../../../node_modules/tonal-dictionary/build/data/chords.json":[function(require,module,exports) {
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
},{}],"../../../node_modules/tonal-pcset/build/es6.js":[function(require,module,exports) {
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

var chr = function (str) {
  return (0, _tonalNote.chroma)(str) || (0, _tonalInterval.chroma)(str) || 0;
}; /**
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
 * @return {String} a binary representation of the pitch class set
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
 * @param {String} chroma - the pitch class set chroma
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
},{"tonal-note":"../../../node_modules/tonal-note/build/es6.js","tonal-interval":"../../../node_modules/tonal-interval/build/es6.js","tonal-array":"../../../node_modules/tonal-array/build/es6.js"}],"../../../node_modules/tonal-dictionary/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pcset = exports.chord = exports.scale = exports.combine = exports.dictionary = undefined;

var _scales = require("./data/scales.json");

var _scales2 = _interopRequireDefault(_scales);

var _chords = require("./data/chords.json");

var _chords2 = _interopRequireDefault(_chords);

var _tonalPcset = require("tonal-pcset");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dictionary = exports.dictionary = function (raw) {
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
}; /**
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
var combine = exports.combine = function (a, b) {
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
 * @param {String} name
 * @return {Array} intervals
 * @example
 * import { scale } from "tonal-dictionary"
 * scale("major") // => ["1P", "2M", ...]
 * scale.names(); // => ["major", ...]
 */
var scale = exports.scale = dictionary(_scales2.default);

/**
 * A dictionary of chords: a function that given a chord type
 * returns an array of intervals
 *
 * @function
 * @param {String} type
 * @return {Array} intervals
 * @example
 * import { chord } from "tonal-dictionary"
 * chord("Maj7") // => ["1P", "3M", ...]
 * chord.names(); // => ["Maj3", ...]
 */
var chord = exports.chord = dictionary(_chords2.default);
var pcset = exports.pcset = combine(scale, chord);
},{"./data/scales.json":"../../../node_modules/tonal-dictionary/build/data/scales.json","./data/chords.json":"../../../node_modules/tonal-dictionary/build/data/chords.json","tonal-pcset":"../../../node_modules/tonal-pcset/build/es6.js"}],"../../../node_modules/tonal-scale/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subsets = exports.supersets = exports.toScale = exports.chords = exports.modeNames = exports.intervals = exports.names = exports.props = undefined;
exports.notes = notes;
exports.exists = exists;
exports.tokenize = tokenize;

var _tonalNote = require("tonal-note");

var _tonalPcset = require("tonal-pcset");

var _tonalDistance = require("tonal-distance");

var _tonalDictionary = require("tonal-dictionary");

var _tonalArray = require("tonal-array");

var NO_SCALE = Object.freeze({
  name: null,
  intervals: [],
  names: [],
  chroma: null,
  setnum: null
}); /**
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


var properties = function (name) {
  var intervals = (0, _tonalDictionary.scale)(name);
  if (!intervals) {
    return NO_SCALE;
  }
  var s = { intervals: intervals, name: name };
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
 * @param {String} name - the scale name (without tonic)
 * @return {Object}
 */
var props = exports.props = memoize(properties, {});

/**
 * Return the available scale names
 *
 * @function
 * @param {boolean} aliases - true to include aliases
 * @return {Array} the scale names
 *
 * @example
 * Scale.names() // => ["maj7", ...]
 */
var names = exports.names = _tonalDictionary.scale.names;

/**
 * Given a scale name, return its intervals. The name can be the type and
 * optionally the tonic (which is ignored)
 *
 * It retruns an empty array when no scale found
 *
 * @function
 * @param {String} name - the scale name (tonic and type, tonic is optional)
 * @return {Array<String>} the scale intervals if is a known scale or an empty
 * array if no scale found
 * @example
 * Scale.intervals("major") // => [ "1P", "2M", "3M", "4P", "5P", "6M", "7M" ]
 */
var intervals = exports.intervals = function (name) {
  var p = tokenize(name);
  return props(p[1]).intervals;
};

/**
 * Get the notes (pitch classes) of a scale.
 *
 * Note that it always returns an array, and the values are only pitch classes.
 *
 * @function
 * @param {String} tonic
 * @param {String} nameOrTonic - the scale name or tonic (if 2nd param)
 * @param {String} [name] - the scale name without tonic
 * @return {Array} a pitch classes array
 *
 * @example
 * Scale.notes("C", "major") // => [ "C", "D", "E", "F", "G", "A", "B" ]
 * Scale.notes("C major") // => [ "C", "D", "E", "F", "G", "A", "B" ]
 * Scale.notes("C4", "major") // => [ "C", "D", "E", "F", "G", "A", "B" ]
 * Scale.notes("A4", "no-scale") // => []
 * Scale.notes("blah", "major") // => []
 */
function notes(nameOrTonic, name) {
  var p = tokenize(nameOrTonic);
  name = name || p[1];
  return intervals(name).map((0, _tonalDistance.transpose)(p[0]));
}

/**
 * Check if the given name is a known scale from the scales dictionary
 *
 * @function
 * @param {String} name - the scale name
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
 * @param {String} name - the scale name
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
 * @param {String} name - scale name
 */
var modeNames = exports.modeNames = function (name) {
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
 * @param {String} name
 */
var chords = exports.chords = function (name) {
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
 */
var toScale = exports.toScale = function (notes) {
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
 * @param {String} name
 * @return {Array} a list of scale names
 */
var supersets = exports.supersets = function (name) {
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
 * @param {String} name
 * @return {Array} a list of scale names
 */
var subsets = exports.subsets = function (name) {
  var isSubset = (0, _tonalPcset.isSubsetOf)(intervals(name));
  return _tonalDictionary.scale.names().filter(function (name) {
    return isSubset((0, _tonalDictionary.scale)(name));
  });
};
},{"tonal-note":"../../../node_modules/tonal-note/build/es6.js","tonal-pcset":"../../../node_modules/tonal-pcset/build/es6.js","tonal-distance":"../../../node_modules/tonal-distance/build/es6.js","tonal-dictionary":"../../../node_modules/tonal-dictionary/build/es6.js","tonal-array":"../../../node_modules/tonal-array/build/es6.js"}],"../../../node_modules/tonal-chord/build/es6.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subsets = exports.supersets = exports.exists = exports.intervals = exports.props = exports.names = undefined;
exports.notes = notes;
exports.tokenize = tokenize;

var _tonalNote = require("tonal-note");

var _tonalDistance = require("tonal-distance");

var _tonalDictionary = require("tonal-dictionary");

var _tonalPcset = require("tonal-pcset");

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
var names = exports.names = _tonalDictionary.chord.names;

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
  var s = { intervals: intervals, name: name };
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
 * @param {String} name - the chord name (without tonic)
 * @return {Object} an object with the properties or a object with all properties
 * set to null if not valid chord name
 */
var props = exports.props = memo(properties);

/**
 * Get chord intervals. It always returns an array
 *
 * @function
 * @param {String} name - the chord name (optionally a tonic and type)
 * @return {Array<String>} a list of intervals or null if the type is not known
 */
var intervals = exports.intervals = function (name) {
  return props(tokenize(name)[1]).intervals;
};

/**
 * Get the chord notes of a chord. This function accepts either a chord name
 * (for example: "Cmaj7") or a list of notes.
 *
 * It always returns an array, even if the chord is not found.
 *
 * @function
 * @param {String} nameOrTonic - name of the chord or the tonic (if the second parameter is present)
 * @param {String} [name] - (Optional) name if the first parameter is the tonic
 * @return {Array} an array of notes or an empty array
 *
 * @example
 * Chord.notes("Cmaj7") // => ["C", "E", "G", "B"]
 * Chord.notes("C", "maj7") // => ["C", "E", "G", "B"]
 */
function notes(nameOrTonic, name) {
  var p = tokenize(nameOrTonic);
  name = name || p[1];
  return props(name).intervals.map((0, _tonalDistance.transpose)(p[0]));
}

/**
 * Check if a given name correspond to a chord in the dictionary
 *
 * @function
 * @param {String} name
 * @return {Boolean}
 * @example
 * Chord.exists("CMaj7") // => true
 * Chord.exists("Maj7") // => true
 * Chord.exists("Ablah") // => false
 */
var exists = exports.exists = function (name) {
  return (0, _tonalDictionary.chord)(tokenize(name)[1]) !== undefined;
};

/**
 * Get all chords names that are a superset of the given one
 * (has the same notes and at least one more)
 *
 * @function
 * @param {String} name
 * @return {Array} a list of chord names
 */
var supersets = exports.supersets = function (name) {
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
 * @param {String} name
 * @return {Array} a list of chord names
 */
var subsets = exports.subsets = function (name) {
  var isSubset = (0, _tonalPcset.isSubsetOf)(intervals(name));
  return _tonalDictionary.chord.names().filter(function (name) {
    return isSubset((0, _tonalDictionary.chord)(name));
  });
};

// 6, 64, 7, 9, 11 and 13 are consider part of the chord
// (see https://github.com/danigb/tonal/issues/55)
var NUM_TYPES = /^(6|64|7|9|11|13)$/;
/**
 * Tokenize a chord name. It returns an array with the tonic and chord type
 * If not tonic is found, all the name is considered the chord name.
 *
 * This function does NOT check if the chord type exists or not. It only tries
 * to split the tonic and chord type.
 *
 * @function
 * @param {String} name - the chord name
 * @return {Array} an array with [type, tonic]
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
  }
  // aug is augmented (see https://github.com/danigb/tonal/issues/55)
  if (p[0] === "A" && p[3] === "ug") {
    return ["", "aug"];
  }

  if (NUM_TYPES.test(p[2])) {
    return [p[0] + p[1], p[2] + p[3]];
  } else {
    return [p[0] + p[1] + p[2], p[3]];
  }
}
},{"tonal-note":"../../../node_modules/tonal-note/build/es6.js","tonal-distance":"../../../node_modules/tonal-distance/build/es6.js","tonal-dictionary":"../../../node_modules/tonal-dictionary/build/es6.js","tonal-pcset":"../../../node_modules/tonal-pcset/build/es6.js"}],"../../../node_modules/tonal/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scale = exports.chord = exports.freq = exports.midi = exports.note = exports.interval = exports.transpose = exports.Dictionary = exports.PcSet = exports.Chord = exports.Scale = exports.Distance = exports.Interval = exports.Note = exports.Array = undefined;

var _tonalArray = require("tonal-array");

var Array = _interopRequireWildcard(_tonalArray);

var _tonalNote = require("tonal-note");

var Note = _interopRequireWildcard(_tonalNote);

var _tonalInterval = require("tonal-interval");

var Interval = _interopRequireWildcard(_tonalInterval);

var _tonalDistance = require("tonal-distance");

var Distance = _interopRequireWildcard(_tonalDistance);

var _tonalDictionary = require("tonal-dictionary");

var Dictionary = _interopRequireWildcard(_tonalDictionary);

var _tonalScale = require("tonal-scale");

var Scale = _interopRequireWildcard(_tonalScale);

var _tonalChord = require("tonal-chord");

var Chord = _interopRequireWildcard(_tonalChord);

var _tonalPcset = require("tonal-pcset");

var PcSet = _interopRequireWildcard(_tonalPcset);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
exports.Array = Array;
exports.Note = Note;
exports.Interval = Interval;
exports.Distance = Distance;
exports.Scale = Scale;
exports.Chord = Chord;
exports.PcSet = PcSet;
exports.Dictionary = Dictionary;

/**
 * Transpose a note by an interval
 * @function
 * @param {String} note
 * @param {String} interval
 * @return {String} the transported note
 * @see Distance.transpose
 */

const transpose = exports.transpose = Distance.transpose;

/**
 * Get the interval from two notes
 * @function
 * @param {String} from
 * @param {String} to
 * @return {String} the interval in reverse shorthand notation
 * @see Distance.interval
 */
const interval = exports.interval = Distance.interval;

/**
 * Get note properties
 * @function
 * @param {String} note - the note name
 * @return {Object}
 * @see Note.props
 * @example
 * Tonal.note("A4").chroma // => 9
 */
const note = exports.note = Note.props;

/**
 * Get midi note number
 * @function
 * @param {String} note
 * @return {Number}
 * @see Note.midi
 * @example
 * Tonal.midi("A4") // => 49
 */
const midi = exports.midi = Note.midi;

/**
 * Get note frequency using equal tempered tuning at 440
 * @function
 * @param {String} note
 * @return {Number}
 * @see Note.freq
 * @example
 * Tonal.freq("A4") // => 440
 */
const freq = exports.freq = Note.freq;

/**
 * Get intervals from a chord type
 * @function
 * @param {String} type - the chord type (no tonic)
 * @return {Array} an array of intervals or undefined if the chord type is not known
 * @see Dictionary.chord
 * @example
 * Tonal.chord("m7b5") // => ["1P", "3m", "5d", "7m"]
 */
const chord = exports.chord = Dictionary.chord;

/**
 * Get intervals from scale name
 * @function
 * @param {String} name - the scale name (without tonic)
 * @return {Array} an array of intervals or undefiend if the scale is not kown
 * @example
 * Tonal.scale("major") // => ["1P", "2M", "3M"...]
 */
const scale = exports.scale = Dictionary.scale;
},{"tonal-array":"../../../node_modules/tonal-array/build/es6.js","tonal-note":"../../../node_modules/tonal-note/build/es6.js","tonal-interval":"../../../node_modules/tonal-interval/build/es6.js","tonal-distance":"../../../node_modules/tonal-distance/build/es6.js","tonal-dictionary":"../../../node_modules/tonal-dictionary/build/es6.js","tonal-scale":"../../../node_modules/tonal-scale/build/es6.js","tonal-chord":"../../../node_modules/tonal-chord/build/es6.js","tonal-pcset":"../../../node_modules/tonal-pcset/build/es6.js"}],"util.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var tonal_1 = require("tonal");
function randomNumber(n) {
    return Math.floor(Math.random() * n);
}
exports.randomNumber = randomNumber;
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
function getTonalChord(chord) {
    chord = chord.replace('-', 'm').replace('^', 'M').replace('h7', 'm7b5').replace('h', 'dim');
    /**
     * Chords that dont work:
     * slash cords are ignored
     * 7b9b5 does not work
     *
     */
    var tokens = tonal_1.Chord.tokenize(chord);
    var s = tokens[1].split('/');
    return tokens[0] + (s[0] || 'M');
}
exports.getTonalChord = getTonalChord;
function getMidi(note, offset) {
    return tonal_1.Note.props(note).midi - offset;
}
exports.getMidi = getMidi;
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
    //const split = (pattern + '').split('.');
    //const gain = parseFloat('0.' + split[1]); //digit(s) after .
    //const fraction = (parseInt(split[0]) || 1) * divisions.reduce((f, d) => f / d, 1000); // fraction of one
    var fraction = pattern * divisions.reduce(function (f, d) {
        return f / d;
    }, 1000); // fraction of one
    if (fraction === 0) {
        console.warn('fraction is 0', pattern);
    }
    return { chord: this.getPath(path, measures), pattern: pattern, /* gain, */path: path, divisions: divisions, fraction: fraction };
}
exports.resolveChords = resolveChords;
function hasOff(pattern, division) {
    if (division === void 0) {
        division = 3;
    }
    return Array.isArray(pattern) && pattern.length === division && pattern[division - 1] !== 0;
}
exports.hasOff = hasOff;
// replaces offs on last beat with next chord + erases next one
function offbeatReducer(settings) {
    var _this = this;
    // TODO: find out why some offbeats sound sketchy
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
function invertInterval(interval) {
    if (tonal_1.Interval.semitones(interval) < 0) {
        return tonal_1.Interval.invert(interval.slice(1));
    }
    return '-' + tonal_1.Interval.invert(interval);
}
exports.invertInterval = invertInterval;
// use Interval.ic?
function smallestInterval(interval) {
    interval = tonal_1.Interval.simplify(interval);
    if (interval === '0A') {
        interval = '1P'; // TODO: issue for tonal-interval (0A does not support invert and is not simple)
    }
    var inversion = this.invertInterval(interval);
    if (Math.abs(tonal_1.Interval.semitones(inversion)) < Math.abs(tonal_1.Interval.semitones(interval))) {
        return inversion;
    }
    return interval || '';
}
exports.smallestInterval = smallestInterval;
function minInterval(a, b, preferRightMovement) {
    var semitones = [Math.abs(tonal_1.Interval.semitones(a)), Math.abs(tonal_1.Interval.semitones(b))];
    if (semitones[0] === semitones[1]) {
        if (preferRightMovement) {
            return semitones[0] < 0 ? -1 : 1;
        }
        return semitones[0] > 0 ? -1 : 1;
    }
    return semitones[0] < semitones[1] ? -1 : 1;
}
exports.minInterval = minInterval;
function intervalMatrix(from, to) {
    var _this = this;
    return to.map(function (note) {
        return from.map(function (n) {
            return tonal_1.Distance.interval(n, note);
        }).map(function (d) {
            return _this.smallestInterval(d);
        }).map(function (i) {
            return i.slice(0, 2) === '--' ? i.slice(1) : i;
        });
    });
}
exports.intervalMatrix = intervalMatrix;
},{"tonal":"../../../node_modules/tonal/index.js"}],"musicians/Musician.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Musician = /** @class */function () {
    function Musician(instrument) {
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
    return Musician;
}();
exports.Musician = Musician;
},{}],"grooves/funk.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var util_1 = require("../util");
exports.funk = {
    chords: function chords() {
        return util_1.randomElement([[[2, 0, 0, 1], 0, [0, .6], [0, 3.5, 0, 0]], [[1, 0, 0, 5], 0, [0, .6], [1, .5, 0, 0]], [[1, 0, 0, 5], 0, [0, .6], [.5, 0, 2, 0]], [[1, 0, 0, 5], 0, [0, .6], [0, 2, 0, 1]], [[3, 0, 0, 0], 0, 2, 0]]);
    },
    bass: function bass() {
        return util_1.randomElement([[[2, 0, 0, 1], [0, 1], 1, [0, 1]], [[2, 0, 0, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]]]);
    },
    kick: function kick(t) {
        return [[[1, .7], 0, [0, 1], 0]];
    },
    snare: function snare(t) {
        return [0, 1, [0, .2, 0, 0], [1, 0, 0, .6]];
    },
    hihat: function hihat(t) {
        return [[.5, .6], [.4, .7], [.3, .6], [.5, .7]];
    }
};
},{"../util":"util.ts"}],"grooves/swing.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var util_1 = require("../util");
exports.swing = {
    chords: function chords(_a) {
        var measure = _a.measure,
            settings = _a.settings;
        var off = function off() {
            return util_1.randomElement([0, [0, 0, 2]], [6, 1]);
        };
        var r = Math.random() > 0.5 ? .6 : 0;
        var t = settings.cycle + "/" + measure.length;
        if (t === '4/1') {
            return util_1.randomElement([[[1, 0], [0, 0, 7], 0, 0], [1, [0, 0, 2], 0, off()], [[0, 0, 1], 0, 2, 0], [[0, 0, 4], 0, 1, 0], [2, 0, 0, 0], [3, 0, 0, 0], [1, 0, r, off()], [[0, 0, 2], 0, r, 0], [1.5, [0, 0, 2], 0, off()]]); //, [2, 1, 1]
        }
        if (t === '4/2') {
            return util_1.randomElement([[[1, 0], [0, 0, 7], 0, 0], [1, [0, 0, 2], 0, 0], [1, 0, 2, 0], [2, 0, 1, 0], [1, 0, .7, off()], [[1, 0, 0], 0, .7, off()], [[4, 0, 0], [0, 0, 2.8], 0, off()]]);
        }
        if (t === '4/3') {
            return [1, [0, 0, 2], [0, 0, 4], 0];
        }
        if ('4/4') {
            return util_1.randomElement([[1, 1, 1, 1], [[1, 0, 2], [0, 0, 2], 0, 1]]);
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
    }
};
},{"../util":"util.ts"}],"musicians/Pianist.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
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
exports.__esModule = true;
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var util_1 = require("../util");
var Musician_1 = require("./Musician");
var funk_1 = require("../grooves/funk");
var swing_1 = require("../grooves/swing");
var Pianist = /** @class */function (_super) {
    __extends(Pianist, _super);
    function Pianist(instrument, props) {
        var _this = _super.call(this, instrument) || this;
        _this.playedNotes = [];
        _this.playedPatterns = [];
        _this.defaults = { intelligentVoicings: true, style: 'Medium Swing', noTonic: true };
        _this.min = Math.min;
        _this.styles = {
            'Funk': funk_1.funk.chords,
            'Medium Swing': swing_1.swing.chords
        };
        _this.props = Object.assign({}, _this.defaults, props || {});
        return _this;
    }
    Pianist.prototype.play = function (_a) {
        var _this = this;
        var pulse = _a.pulse,
            measures = _a.measures,
            settings = _a.settings;
        var pattern = this.styles[settings.style] || this.styles[this.defaults.style];
        var measureLength = pulse.getMeasureLength();
        if (settings.exact) {
            return pulse.tickArray(measures, function (t) {
                _this.playChord(t.value, { deadline: t.deadline });
            });
        }
        measures = measures
        // generate random patterns
        .map(function (measure) {
            return pattern({ measures: measures, pulse: pulse, measure: measure, settings: settings }).slice(0, Math.floor(settings.cycle));
        })
        // fill in chords
        .map(function (pattern, i) {
            return util_1.resolveChords(pattern, measures, [i]);
        })
        // fix chords at last offbeat
        .reduce(util_1.offbeatReducer(settings), []);
        pulse.tickArray(measures, function (_a) {
            var path = _a.path,
                value = _a.value,
                deadline = _a.deadline;
            var interval = settings.arpeggio ? measureLength / settings.cycle : Math.random() / 60;
            if (path[0] % 2 === 0 && !path[1] && !path[2]) {
                interval = Math.random() / (settings.bpm / 4);
            }
            var duration = settings.arpeggio ? interval : value.fraction * measureLength;
            var slice = settings.arpeggio ? Math.ceil(value.fraction / 1000 * 4) : null;
            var gain = value.gain || 0.7;
            _this.playChord(value.chord, { deadline: deadline, gain: gain, duration: duration, interval: interval, slice: slice });
        });
    };
    Pianist.prototype.getLastVoicing = function () {
        return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
    };
    Pianist.prototype.getVoicing = function (scorenotes, before, tonic) {
        if (!before) {
            return scorenotes;
        }
        var near = util_1.intervalMatrix(before, scorenotes).map(function (intervals, index) {
            var smallest = [].concat(intervals).sort(function (a, b) {
                return util_1.minInterval(a, b, false);
            })[0];
            if (!tonal_1.Distance.transpose(before[intervals.indexOf(smallest)], smallest)) {
                console.warn('ALARM', before[intervals.indexOf(smallest)], smallest, intervals);
            }
            return tonal_1.Distance.transpose(before[intervals.indexOf(smallest)], smallest);
        }).filter(function (n) {
            return !!n;
        });
        return near && near.length ? near : scorenotes;
    };
    // plays the given notes at the given interval
    Pianist.prototype.playNotes = function (scorenotes, _a) {
        var tonic = _a.tonic,
            deadline = _a.deadline,
            interval = _a.interval,
            gain = _a.gain,
            duration = _a.duration;
        if (this.props.intelligentVoicings && this.getLastVoicing()) {
            scorenotes = this.getVoicing(scorenotes, this.getLastVoicing(), tonic);
        }
        this.playedNotes.push([].concat(scorenotes));
        this.instrument.playNotes(scorenotes, { deadline: deadline, interval: interval, gain: gain, duration: duration });
    };
    Pianist.prototype.playChord = function (chord, settings) {
        chord = tonal_2.Chord.tokenize(util_1.getTonalChord(chord));
        var notes = tonal_2.Chord.intervals(chord[1]).map(function (i) {
            return i.replace('13', '6');
        }).map(function (root) {
            return tonal_1.Distance.transpose(chord[0] + '3', root);
        });
        if (notes.length > 3 && settings.noTonic) {
            notes = notes.slice(this.props.noTonic ? 1 : 0);
        }
        if (settings.slice) {
            notes = notes.slice(0, settings.slice ? settings.slice : notes.length);
        }
        this.playNotes(notes, settings);
    };
    return Pianist;
}(Musician_1.Musician);
exports["default"] = Pianist;
},{"tonal":"../../../node_modules/tonal/index.js","../util":"util.ts","./Musician":"musicians/Musician.ts","../grooves/funk":"grooves/funk.ts","../grooves/swing":"grooves/swing.ts"}],"musicians/Drummer.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
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
exports.__esModule = true;
var Musician_1 = require("./Musician");
var funk_1 = require("../grooves/funk");
var swing_1 = require("../grooves/swing");
var Drummer = /** @class */function (_super) {
    __extends(Drummer, _super);
    function Drummer(instrument) {
        var _this = _super.call(this, instrument) || this;
        _this.set = {
            kick: 0,
            snare: 1,
            hihat: 2,
            ride: 3,
            crash: 4
        };
        _this.defaults = { style: 'Medium Swing' };
        _this.styles = {
            'Funk': { kick: funk_1.funk.kick, snare: funk_1.funk.snare, hihat: funk_1.funk.hihat },
            'Medium Swing': { ride: swing_1.swing.ride, hihat: swing_1.swing.hihat }
        };
        return _this;
    }
    Drummer.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures,
            pulse = _a.pulse,
            settings = _a.settings;
        var tracks = this.styles[settings.style] || this.styles[this.defaults.style];
        Object.keys(tracks).forEach(function (key) {
            var patterns = measures.map(function (measure, index) {
                return tracks[key]({ measures: measures, index: index, measure: measure, settings: settings, pulse: pulse }).slice(0, Math.floor(settings.cycle));
            });
            pulse.tickArray(patterns, function (_a) {
                var deadline = _a.deadline,
                    value = _a.value;
                _this.instrument.playKeys([_this.set[key]], { deadline: deadline, gain: value });
            });
        });
    };
    return Drummer;
}(Musician_1.Musician);
exports["default"] = Drummer;
},{"./Musician":"musicians/Musician.ts","../grooves/funk":"grooves/funk.ts","../grooves/swing":"grooves/swing.ts"}],"musicians/Bassist.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
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
exports.__esModule = true;
var util_1 = require("../util");
var Musician_1 = require("./Musician");
var tonal_1 = require("tonal");
var funk_1 = require("../grooves/funk");
var swing_1 = require("../grooves/swing");
var Bassist = /** @class */function (_super) {
    __extends(Bassist, _super);
    function Bassist(instrument) {
        var _this = _super.call(this, instrument) || this;
        _this.defaults = { style: 'Medium Swing' };
        _this.styles = {
            'Funk': funk_1.funk.bass,
            'Medium Swing': swing_1.swing.bass
        };
        return _this;
    }
    Bassist.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures,
            pulse = _a.pulse,
            settings = _a.settings;
        var track = this.styles[settings.style] || this.styles[this.defaults.style];
        measures = measures.map(function (measure) {
            return track({ measures: measures, measure: measure, settings: settings, pulse: pulse }).slice(0, Math.floor(settings.cycle));
        }).map(function (pattern, i) {
            return util_1.resolveChords(pattern, measures, [i]);
        });
        pulse.tickArray(measures, function (current) {
            _this.playBass(current, measures, pulse);
        });
    };
    Bassist.prototype.getStep = function (step, chord, octave) {
        if (octave === void 0) {
            octave = 2;
        }
        var tokens = tonal_1.Chord.tokenize(util_1.getTonalChord(chord));
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
            interval = _a.interval;
        var note;
        var steps = [1, util_1.randomElement([3, 5]), 1, util_1.randomElement([3, 5])];
        var octave = 2;
        if (value.value === 1 && value.chord.split('/').length > 1) {
            note = value.chord.split('/')[1] + octave;
        } else {
            note = this.getStep(steps[path[1]], util_1.getTonalChord(value.chord), octave);
        }
        var duration = value.fraction * pulse.getMeasureLength();
        this.instrument.playNotes([note], { deadline: deadline, interval: interval, gain: 0.7, duration: duration });
    };
    return Bassist;
}(Musician_1.Musician);
exports["default"] = Bassist;
},{"../util":"util.ts","./Musician":"musicians/Musician.ts","tonal":"../../../node_modules/tonal/index.js","../grooves/funk":"grooves/funk.ts","../grooves/swing":"grooves/swing.ts"}],"instruments/Instrument.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var util_1 = require("../util");
var Instrument = /** @class */function () {
    function Instrument(_a) {
        var _b = _a === void 0 ? {} : _a,
            context = _b.context,
            mix = _b.mix,
            onPlay = _b.onPlay,
            onStop = _b.onStop,
            midiOffset = _b.midiOffset;
        this.midiOffset = 0;
        this.onPlay = onPlay;
        this.midiOffset = midiOffset || this.midiOffset;
        this.onStop = onStop;
        this.init({ context: context, mix: mix });
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
        this.playKeys(notes.map(function (note) {
            return util_1.getMidi(note, _this.midiOffset);
        }), settings);
    };
    Instrument.prototype.playKeys = function (keys, settings) {
        if (this.onPlay) {
            return this.onPlay(keys);
        }
        // TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
    };
    return Instrument;
}();
exports.Instrument = Instrument;
},{"../util":"util.ts"}],"instruments/Synthesizer.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
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
exports.__esModule = true;
var Instrument_1 = require("./Instrument");
var tonal_1 = require("tonal");
var Synthesizer = /** @class */function (_super) {
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
    Synthesizer.prototype.init = function (context) {
        _super.prototype.init.call(this, context);
    };
    Synthesizer.prototype.getVoice = function (type, gain, frequency) {
        if (type === void 0) {
            type = 'sine';
        }
        if (gain === void 0) {
            gain = 0;
        }
        if (frequency === void 0) {
            frequency = 440;
        }
        var oscNode = this.context.createOscillator();
        oscNode.type = type;
        var gainNode = this.context.createGain();
        oscNode.connect(gainNode);
        gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
        gainNode.connect(this.mix);
        oscNode.frequency.value = frequency;
        return { oscNode: oscNode, gainNode: gainNode };
    };
    Synthesizer.prototype.lowestGain = function (a, b) {
        return a.gain.gain.value < b.gain.gain.value ? -1 : 0;
    };
    Synthesizer.prototype.adsr = function (_a, time, param) {
        var attack = _a.attack,
            decay = _a.decay,
            sustain = _a.sustain,
            release = _a.release,
            gain = _a.gain,
            duration = _a.duration;
        param.linearRampToValueAtTime(gain, time + attack);
        param.setTargetAtTime(gain * sustain, time + Math.min(attack + decay, duration), decay);
        param.setTargetAtTime(0, time + Math.max(duration - attack - decay, attack + decay, duration), release);
    };
    Synthesizer.prototype.playKeys = function (keys, settings) {
        var _this = this;
        _super.prototype.playKeys.call(this, keys, settings); // fires callback   
        var time = this.context.currentTime + settings.deadline / 1000;
        var interval = settings.interval || 0;
        keys.map(function (key, i) {
            var delay = i * interval;
            var _a = [settings.attack || _this.attack, settings.decay || _this.decay, settings.sustain || _this.sustain, settings.release || _this.release, (settings.duration || _this.duration) / 1000, (settings.gain || 1) * _this.gain],
                attack = _a[0],
                decay = _a[1],
                sustain = _a[2],
                release = _a[3],
                duration = _a[4],
                gain = _a[5];
            var voice = _this.getVoice(_this.type, 0, tonal_1.Note.freq(key));
            _this.adsr({ attack: attack, decay: decay, sustain: sustain, release: release, gain: gain, duration: duration }, time + delay, voice.gainNode.gain);
            voice.oscNode.start(settings.deadline + delay);
        });
    };
    return Synthesizer;
}(Instrument_1.Instrument);
exports.Synthesizer = Synthesizer;
},{"./Instrument":"instruments/Instrument.ts","tonal":"../../../node_modules/tonal/index.js"}],"instruments/Sampler.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
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
exports.__esModule = true;
var Instrument_1 = require("./Instrument");
var Sampler = /** @class */function (_super) {
    __extends(Sampler, _super);
    function Sampler(options) {
        if (options === void 0) {
            options = {};
        }
        var _this = _super.call(this, options) || this;
        _this.buffers = {};
        _this.gain = _this.context.createGain();
        _this.gain.connect(_this.context.destination);
        // this.overlap = options.overlap;
        if (options.samples) {
            _this.sources = options.samples;
            _this.ready = _this.loadSources(options.samples);
        }
        return _this;
    }
    Sampler.prototype.setGain = function (value) {
        this.gain.gain.value = value;
    };
    // returns buffer from buffer cache or loads buffer data from source
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
                    _this.buffers[src] = { buffer: decodedData, context: context };
                    resolve(decodedData);
                });
            });
        });
    };
    Sampler.prototype.getSource = function (buffer, connect) {
        var source = this.context.createBufferSource();
        connect = connect || this.gain;
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
    };
    // loads a sound file into the context
    Sampler.prototype.loadSource = function (src, context) {
        var _this = this;
        if (context === void 0) {
            context = this.context;
        }
        return this.getBuffer(src, context).then(function (decodedData) {
            return _this.getSource(decodedData);
        });
    };
    // loads multiple sources into the context
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
            deadline = 0;
        }
        if (interval === void 0) {
            interval = 0;
        }
        sounds.forEach(function (sound, i) {
            return sound.start(deadline + interval * i);
        });
    };
    Sampler.prototype.playSource = function (source, _a) {
        var deadline = _a.deadline,
            interval = _a.interval,
            gain = _a.gain;
        var gainNode = this.context.createGain();
        var sound = this.getSource(this.buffers[source].buffer, gainNode);
        gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
        gainNode.connect(this.mix);
        this.playSounds([sound], deadline, interval);
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
        keys.map(function (key) {
            _this.playSource(_this.sources[key], settings);
        });
    };
    return Sampler;
}(Instrument_1.Instrument);
exports.Sampler = Sampler;
},{"./Instrument":"instruments/Instrument.ts"}],"instruments/Kick.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Kick = /** @class */function () {
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
},{}],"instruments/Snare.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Snare = /** @class */function () {
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
},{}],"instruments/PlasticDrums.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
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
exports.__esModule = true;
var Instrument_1 = require("./Instrument");
var Kick_1 = require("./Kick");
var Snare_1 = require("./Snare");
var PlasticDrums = /** @class */function (_super) {
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
            });
            console.warn('PlasticDrums missing keys:', missing);
        }
        sounds.forEach(function (sound) {
            return sound.trigger(deadline);
        });
    };
    return PlasticDrums;
}(Instrument_1.Instrument);
exports.PlasticDrums = PlasticDrums;
},{"./Instrument":"instruments/Instrument.ts","./Kick":"instruments/Kick.ts","./Snare":"instruments/Snare.ts"}],"index.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
exports.__esModule = true;
var Band_1 = __importDefault(require("./Band"));
var Pianist_1 = __importDefault(require("./musicians/Pianist"));
var Drummer_1 = __importDefault(require("./musicians/Drummer"));
var Bassist_1 = __importDefault(require("./musicians/Bassist"));
var Instrument_1 = require("./instruments/Instrument");
var Musician_1 = require("./musicians/Musician");
var Synthesizer_1 = require("./instruments/Synthesizer");
var Sampler_1 = require("./instruments/Sampler");
var PlasticDrums_1 = require("./instruments/PlasticDrums");
exports["default"] = { Band: Band_1["default"], Pianist: Pianist_1["default"], Bassist: Bassist_1["default"], Drummer: Drummer_1["default"], Instrument: Instrument_1.Instrument, Musician: Musician_1.Musician, Synthesizer: Synthesizer_1.Synthesizer, Sampler: Sampler_1.Sampler, PlasticDrums: PlasticDrums_1.PlasticDrums };
},{"./Band":"Band.ts","./musicians/Pianist":"musicians/Pianist.ts","./musicians/Drummer":"musicians/Drummer.ts","./musicians/Bassist":"musicians/Bassist.ts","./instruments/Instrument":"instruments/Instrument.ts","./musicians/Musician":"musicians/Musician.ts","./instruments/Synthesizer":"instruments/Synthesizer.ts","./instruments/Sampler":"instruments/Sampler.ts","./instruments/PlasticDrums":"instruments/PlasticDrums.ts"}],"../../../../../.nvm/versions/node/v8.11.1/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '51905' + '/');
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
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
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
},{}]},{},["../../../../../.nvm/versions/node/v8.11.1/lib/node_modules/parcel/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/index.map