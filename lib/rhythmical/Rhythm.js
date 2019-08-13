"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Fractions_1 = require("./Fractions");
var Rhythm = /** @class */ (function () {
    function Rhythm() {
    }
    Rhythm.from = function (body) {
        if (!Array.isArray(body)) {
            return [body];
        }
        return body;
    };
    Rhythm.duration = function (path, whole) {
        if (whole === void 0) { whole = 1; }
        return path.reduce(function (f, p) { return f / p[1]; }, whole);
    };
    Rhythm.time = function (path, whole) {
        if (whole === void 0) { whole = 1; }
        return path.reduce(function (_a, p, i) {
            var f = _a.f, t = _a.t;
            return ({ f: f / p[1], t: t + (f / p[1]) * path[i][0] });
        }, { f: whole, t: 0 }).t;
    };
    Rhythm.oldDuration = function (divisions, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (f, d) { return f / d; }, whole);
    };
    Rhythm.oldTime = function (divisions, path, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (_a, d, i) {
            var f = _a.f, p = _a.p;
            return ({ f: f / d, p: p + (f / d) * path[i] });
        }, { f: whole, p: 0 }).p;
    };
    Rhythm.addPaths = function (a, b, divisions) {
        var _a;
        // console.warn('addPaths is deprecated');
        _a = [a, b].sort(function (a, b) { return b.length - a.length; }), a = _a[0], b = _a[1];
        var added = a.map(function (n, i) { return n + (b[i] || 0); });
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
                path[i - 1] += rest;
                // todo what happens if rest is too much for path[i-1]
            }
        }
        return path;
    };
    Rhythm.calculate = function (totalLength) {
        if (totalLength === void 0) { totalLength = 1; }
        return function (_a) {
            var path = _a.path, value = _a.value, length = _a.length;
            if (typeof value === 'number') {
                length = value;
            }
            else {
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
        return __assign({}, event, { duration: event.duration * event.value });
    };
    Rhythm.useValueAsLength = function (event) {
        return __assign({}, event, { length: event.value });
    };
    Rhythm.render = function (rhythm, length, useValueAsLength) {
        if (length === void 0) { length = 1; }
        if (useValueAsLength === void 0) { useValueAsLength = false; }
        return Rhythm.flat(rhythm)
            .map(Rhythm.calculate(length))
            .filter(function (event) { return !!event.duration; });
    };
    Rhythm.spm = function (bpm, pulse) {
        return 60 / bpm * pulse;
    };
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
    Rhythm.flatten = function (tree, path, divisions) {
        if (path === void 0) { path = []; }
        if (divisions === void 0) { divisions = []; }
        if (!Array.isArray(tree)) { // is primitive value
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
            return valid &&
                item.divisions && item.path &&
                item.divisions.length === item.path.length;
        }, true);
    };
    Rhythm.nest = function (items, fill) {
        if (fill === void 0) { fill = 0; }
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
                }
                else if (item.value !== fill) {
                    // console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item)
                }
            }
            else {
                nested[item.path[0]] = Rhythm.nest(items
                    .filter(function (i) { return i.path.length > 1 && i.path[0] === item.path[0]; })
                    .map(function (i) { return (__assign({}, i, { path: i.path.slice(1), divisions: i.divisions.slice(1) })); }), fill);
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
            }
            else if (item.path[0] > lastSiblingIndex) {
                lastSiblingIndex = item.path[0];
                var siblings = items
                    .filter(function (i, j) { return j >= index && i.path.length >= item.path.length; })
                    .map(function (i) { return (__assign({}, i, { path: i.path.slice(1) })); });
                expanded[item.path[0]] = Rhythm.expand(siblings);
            }
            return expanded;
        }, []);
    };
    Rhythm.pathOf = function (value, tree) {
        var flat = Rhythm.flatten(tree);
        var match = flat.find(function (v) { return v.value === value; });
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
        return Rhythm.simplePath(a.path) === Rhythm.simplePath(b.path) &&
            Rhythm.simplePath(a.divisions) === Rhythm.simplePath(b.divisions);
        //a.divisions.length === b.divisions.length
    };
    Rhythm.getPath = function (tree, path, withPath, flat) {
        if (withPath === void 0) { withPath = false; }
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
        if (offset === void 0) { offset = 0; }
        var measures = Math.ceil(rhythm.length / pulse);
        return Rhythm.nest(Rhythm.flatten(rhythm).map(function (_a) {
            var value = _a.value, divisions = _a.divisions, path = _a.path;
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
            var value = _a.value, divisions = _a.divisions, path = _a.path;
            return ({
                value: value,
                divisions: [divisions[1] * divisions[0]].concat(divisions.slice(2)),
                path: [path[0] * divisions[1] + path[1]].concat(path.slice(2))
            });
        }));
    };
    Rhythm.nextItem = function (tree, path, move, withPath, flat) {
        if (move === void 0) { move = 1; }
        if (withPath === void 0) { withPath = false; }
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
        if (move === void 0) { move = 1; }
        var flat = Rhythm.flatten(tree);
        var match = flat.find(function (v) { return v.value === value; });
        if (match) {
            return Rhythm.nextItem(tree, match.path, move, false, flat);
        }
    };
    Rhythm.nextPath = function (tree, path, move) {
        if (move === void 0) { move = 1; }
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
        if (pulse === void 0) { pulse = 4; }
        var blocks = {
            4: [4],
            2: position === 0 ? [2, 0] : [0, 2] // or any other 2 block
            /** ... */
        };
        Array(position).fill(0).concat(blocks[length]).concat(Array(pulse - position - length).fill(0));
        return blocks[length];
    };
    Rhythm.prototype.addGroove = function (items, pulse) {
        if (pulse === void 0) { pulse = 4; }
        var chordsPerBeat = pulse / items.length;
        if (chordsPerBeat < 0) {
            // need another grid... or just error??
        }
        if (Math.round(chordsPerBeat) !== chordsPerBeat) {
            // apply bjorklund to fill chords evenly
        }
        var rendered = Rhythm.render(items, pulse);
        var time = 0;
        return rendered.reduce(function (combined, chordEvent, index) {
            var _a;
            // const time = rendered.slice(0, index + 1).reduce((sum, track) => sum + track.duration, 0);
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
        path = path.map(function (v) { return factor * v; });
        return Rhythm.overflow(path, divisions);
    };
    Rhythm.multiplyEvents = function (rhythm, factor) {
        return Rhythm.fixTopLevel(rhythm
            .map(function (_a) {
            var value = _a.value, path = _a.path;
            return ({
                value: value * factor,
                path: Rhythm.carry(path.map(function (f, i) { return [
                    f[0] * factor,
                    f[1] * (!i ? factor : 1)
                    // f[1] * factor
                    // f[1]
                ]; }))
            });
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
        return array.reduce(function (max, item) { return Math.max(max, item); }, array[0]);
    };
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * You can then turn RhythmEvent[] back to the original nested array with Measure.expand. */
    Rhythm.flat = function (rhythm, path) {
        if (path === void 0) { path = []; }
        return rhythm.reduce(function (flat, item, index) {
            if (!Array.isArray(item)) {
                return flat.concat([{
                        value: item,
                        path: path.concat([[index, rhythm.length]]),
                    }]);
            }
            return flat.concat(Rhythm.flat(item, path.concat([[index, rhythm.length]])));
        }, []);
    };
    Rhythm.nested = function (items, fill) {
        if (fill === void 0) { fill = 0; }
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
                }
                else if (item.value !== fill) {
                    console.warn('fractured path! value "' + item.value + '" !== "' + fill + '"', item);
                }
            }
            else {
                nested[item.path[0][0]] = Rhythm.nested(items
                    .filter(function (i) { return i.path.length > 1 && i.path[0][0] === item.path[0][0]; })
                    .map(function (i) { return (__assign({}, i, { path: i.path.slice(1) })); }), fill);
            }
            return nested;
        }, []);
    };
    // aligns all paths to longest path length, filling each up with [0, 1]
    Rhythm.align = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i] = arguments[_i];
        }
        return paths.map(function (p) { return p
            .concat(Array(Rhythm.maxArray(paths.map(function (p) { return p.length; })) - p.length).fill([0, 1])); });
    };
    // carries all fractions that are >=1 over to the next fraction to mimic notated rhythm behaviour
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
        if (cancel === void 0) { cancel = false; }
        var _a;
        _a = Rhythm.align(a, b), a = _a[0], b = _a[1];
        return Rhythm.carry(a.map(function (f, i) { return Fractions_1.Fractions.add(f, b[i], cancel); }));
    };
    Rhythm.fixTopLevel = function (events) {
        // find max divisor on top level
        var max = Rhythm.maxArray(events.map(function (e) { return e.path[0][1]; }));
        // use max divisor for all top levels
        return events.map(function (e) { return (__assign({}, e, { path: e.path.map(function (f, i) { return !i ? [f[0], max] : f; }) })); });
    };
    /* Makes sure the top level is correct on all events + adds optional path to move the events */
    Rhythm.shiftEvents = function (events, path) {
        if (path) {
            events = events.map(function (e) { return (__assign({}, e, { path: Rhythm.add(e.path, path) })); });
        }
        return Rhythm.fixTopLevel(events).filter(function (e) { return !!e.value; });
    };
    Rhythm.shift = function (rhythm, path) {
        return Rhythm.nested(Rhythm.shiftEvents(Rhythm.flat(rhythm), path));
    };
    Rhythm.groupEvents = function (events, pulse, offset) {
        var wrapped = events.map(function (_a) {
            var value = _a.value, path = _a.path;
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
            var value = _a.value, path = _a.path;
            return ({
                value: value,
                path: [
                    [
                        path[0][0] * path[1][1] + path[1][0],
                        path[1][1] * path[0][1]
                    ]
                ]
                    .concat(path.slice(2)),
            });
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
        }
        else if (target.length > source.length) {
            sourceEvents = Rhythm.shiftEvents(Rhythm.flat(source), [[0, target.length]]); // add empty bars
        }
        return Rhythm.nested(Rhythm.combineEvents(targetEvents, sourceEvents));
    };
    Rhythm.combineEvents = function (a, b) {
        return Rhythm.shiftEvents([].concat(a, b).filter(function (e) { return !!e.value; }));
    };
    Rhythm.isEqualPath = function (a, b) {
        var paths = Rhythm.align(a, b).map(function (p) { return JSON.stringify(p); });
        return paths[0] === paths[1];
    };
    Rhythm.insertEvents = function (sourceEvents, targetEvents, beat) {
        var pulses = targetEvents.map(function (e) { return e.path[1] ? e.path[1][1] : 1; });
        var beats = targetEvents[0].path[0][1] * pulses[0];
        if (beat === undefined) {
            beat = beats; // set to end if undefined
        }
        else if (beat < 0) {
            beat = beats + beat; // subtract from end
        }
        // handle negative offset
        sourceEvents = Rhythm.groupEvents(sourceEvents, pulses[0], beat);
        return Rhythm.combineEvents(targetEvents, sourceEvents);
    };
    Rhythm.insert = function (source, target, beat) {
        return Rhythm.nested(Rhythm.insertEvents(Rhythm.flat(source), Rhythm.flat(target), beat));
    };
    Rhythm.migratePath = function (divisions, path) {
        return divisions.map(function (d, index) { return [path ? path[index] : 0, d]; });
    };
    return Rhythm;
}());
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
