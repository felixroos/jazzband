"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tonal_1 = require("tonal");
var __1 = require("..");
var Harmony_1 = require("../harmony/Harmony");
var tonal_2 = require("tonal");
var Pattern = /** @class */ (function () {
    function Pattern() {
    }
    Pattern.traverse = function (size, step, offset) {
        if (offset === void 0) { offset = 0; }
        var order = [];
        var i = offset;
        while (!order.includes(i)) {
            // while (order.length < max + offset) {
            order.push(i);
            // i = i + step;
            i = (i + step) % size;
        }
        return order;
    };
    Pattern.traverseArray = function (array, move, start) {
        if (start === void 0) { start = 0; }
        return this.traverse(array.length, move, start).map(function (i) { return array[i]; });
    };
    // index starts with 1
    Pattern.getPositions = function (positions, array) {
        return positions.map(function (p) { return array[(p - 1) % array.length]; });
    };
    // index starts with 0
    /* static nestIndices(parent, child) {
      return parent.map(i => child.map(p => p + i));
    } */
    Pattern.flat = function (array) {
        var _this = this;
        return array.reduce(function (flat, item) {
            if (Array.isArray(item)) {
                flat = flat.concat(_this.flat(item));
            }
            else {
                flat.push(item);
            }
            return flat;
        }, []);
    };
    // index starts with 0
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
        parent = this.flat(parent).map(function (i) { return children[0].map(function (p) { return p + i; }); });
        children.shift();
        return this.nestIndices.apply(this, [parent].concat(children));
    };
    Pattern.getNested = function (array, parent, child) {
        var _this = this;
        return parent.map(function (i) { return _this.getPositions(child.map(function (p) { return p + i - 1; }), array); });
    };
    Pattern.deepNest = function (array, tree) {
        var nested = this.getNested(array, tree[0], tree[1]);
    };
    Pattern.traverseNested = function (array, pattern, move, start) {
        if (move === void 0) { move = 1; }
        if (start === void 0) { start = 0; }
        var traversed = this.traverse(array.length, move, start);
        return this.getNested(array, traversed.map(function (p) { return p + 1; }), pattern);
    };
    Pattern.testFormat = function (nestedNotes) {
        return nestedNotes.map(function (e) { return e.join(' '); }).join(' ');
    };
    Pattern.scale = function (scaleName, pattern, range) {
        if (pattern === void 0) { pattern = [1]; }
        // get pitch classes of scale
        var scaleNotes = tonal_1.Scale.notes(scaleName);
        var scale;
        // use pitch classes when no range is given
        if (!range) {
            scale = scaleNotes;
        }
        else {
            // get all absolute notes inside range
            scale = __1.util
                .noteArray(range)
                .map(function (n) {
                var pc = scaleNotes.find(function (s) { return Harmony_1.Harmony.hasSamePitch(n, s); });
                if (pc) {
                    return n;
                }
            })
                .filter(function (n) { return !!n; });
        }
        // find out index of scale tonic
        var firstTonic = scale.find(function (n) { return tonal_2.Note.pc(n) === scaleNotes[0]; });
        var offset = scale.indexOf(firstTonic) - 1; // -1 for non zero starting indices...
        // add offset to pattern
        pattern = pattern
            .map(function (n) { return n + offset; })
            .map(function (n) {
            return n >= scale.length ? n - scaleNotes.length : n;
        });
        return pattern.map(function (n) { return tonal_2.Note.simplify(scale[n]); });
    };
    Pattern.render = function (scaleName, patterns, range) {
        if (range === void 0) { range = ['G3', 'G5']; }
        var scaleNotes = tonal_1.Scale.notes(scaleName);
        var scale = __1.util
            .noteArray(range)
            .map(function (n) {
            var pc = scaleNotes.find(function (s) { return Harmony_1.Harmony.hasSamePitch(n, s); });
            if (pc) {
                return n;
                /* console.log('pc', pc, n, Note.oct(n));
                return pc + Note.oct(n); */
            }
        })
            .filter(function (n) { return !!n; });
        console.log('scale', scale);
        var firstTonic = scale.find(function (n) { return tonal_2.Note.pc(n) === scaleNotes[0]; });
        var start = scale.indexOf(firstTonic);
        patterns.unshift([start]);
        var nested = this.nestIndices.apply(this, patterns).map(function (p) {
            if (p.find(function (i) { return i >= scale.length; })) {
                return p.map(function (n) { return n - scaleNotes.length; });
            }
            return p;
        });
        console.log('pattern', nested);
        return this.flat(nested).map(function (n) { return ({
            note: tonal_2.Note.simplify(scale[n]),
            index: n
        }); });
    };
    return Pattern;
}());
exports.Pattern = Pattern;
