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
var Rhythm = /** @class */ (function () {
    function Rhythm() {
    }
    Rhythm.from = function (body) {
        if (!Array.isArray(body)) {
            return [body];
        }
        return body;
    };
    Rhythm.duration = function (divisions, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (f, d) { return f / d; }, whole);
    };
    Rhythm.time = function (divisions, path, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (_a, d, i) {
            var f = _a.f, p = _a.p;
            return ({ f: f / d, p: p + (f / d) * path[i] });
        }, { f: whole, p: 0 }).p;
    };
    Rhythm.calculate = function (whole) {
        if (whole === void 0) { whole = 1; }
        return function (_a) {
            var path = _a.path, divisions = _a.divisions, value = _a.value;
            return {
                value: value,
                path: path,
                divisions: divisions,
                time: Rhythm.time(divisions, path, whole),
                duration: Rhythm.duration(divisions, whole * value)
            };
        };
    };
    Rhythm.render = function (rhythm, whole) {
        if (whole === void 0) { whole = 1; }
        return Rhythm.flatten(rhythm)
            .map(Rhythm.calculate(whole))
            .filter(function (event) { return !!event.duration; });
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
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * If withPath is set to true, the values are turned to objects containing the nested path (FlatEvent).
     * You can then turn FlatEvent[] back to the original nested array with Measure.expand. */
    /* static flatten<T>(tree: NestedRhythm<T>, withPath = false, path: number[] = [], divisions: number[] = []): T[] | RhythmEvent<T>[] {
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
        (flat: (any | RhythmEvent<T>)[], item: any[] | any, index: number): (any | RhythmEvent<T>)[] =>
          flat.concat(
            Rhythm.flatten(item, withPath, path.concat([index]), divisions.concat([tree.length]))
          ), []);
    } */
    /** Turns a flat FlatEvent array to a (possibly) nested Array of its values. Reverts Measure.flatten (using withPath=true). */
    Rhythm.expand = function (items) {
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
                /* expanded.push(Measure.expand(siblings)); */
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
    return Rhythm;
}());
exports.Rhythm = Rhythm;
