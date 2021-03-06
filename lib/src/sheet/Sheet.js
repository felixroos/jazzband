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
var Measure_1 = require("./Measure");
var Harmony_1 = require("../harmony/Harmony");
var util_1 = require("../util/util");
var Voicing_1 = require("../harmony/Voicing");
var Sheet = /** @class */ (function () {
    function Sheet() {
    }
    Sheet.render = function (sheet, options, clear) {
        if (options === void 0) { options = {}; }
        if (clear === void 0) { clear = true; }
        var state = __assign({ sheet: sheet, measures: [], forms: 1, nested: true, fallbackToZero: true, firstTime: true }, options);
        state = __assign({}, state, Sheet.newForm(state));
        var runs = 0;
        while (runs < 1000 && state.index < sheet.length) {
            runs++;
            state = Sheet.nextMeasure(state);
        }
        if (clear) {
            return state.measures
                .map(function (m) { return Measure_1.Measure.from(m); })
                .map(function (m) {
                delete m.house;
                delete m.signs;
                return m;
            });
        }
        return state.measures;
    };
    Sheet.nextMeasure = function (state) {
        state = __assign({}, state, Sheet.nextSection(state)); // moves to the right house (if any)
        var sheet = state.sheet, index = state.index, measures = state.measures;
        state = __assign({}, state, { measures: measures.concat([__assign({}, Measure_1.Measure.from(sheet[index]), { index: index // add index for mapping
                 })]) }, Sheet.nextIndex(state));
        return Sheet.nextForm(state);
    };
    Sheet.nextIndex = function (state) {
        var _a;
        var sheet = state.sheet, index = state.index, jumps = state.jumps, nested = state.nested, fallbackToZero = state.fallbackToZero, lastTime = state.lastTime;
        if (!Sheet.shouldJump({ sheet: sheet, index: index, jumps: jumps, lastTime: lastTime })) {
            return {
                index: index + 1
            };
        }
        var braces = [Sheet.getJumpDestination({ sheet: sheet, index: index, fallbackToZero: fallbackToZero, nested: nested }), index];
        jumps = Sheet.wipeKeys(jumps, [braces[0], braces[1] - 1]); // wipes indices inside braces
        return {
            index: braces[0],
            jumps: __assign({}, jumps, (_a = {}, _a[braces[1]] = (jumps[braces[1]] || 0) + 1, _a))
        };
    };
    Sheet.newForm = function (state) {
        return __assign({}, state, { index: 0, jumps: {}, visits: {}, lastTime: state.forms === 1 });
    };
    Sheet.nextForm = function (state, force) {
        if (force === void 0) { force = false; }
        var sheet = state.sheet, index = state.index, forms = state.forms;
        if (force || (index >= sheet.length && forms > 1)) {
            return Sheet.newForm(__assign({}, state, { firstTime: false, forms: forms - 1 }));
        }
        return state;
    };
    // moves the index to the current house (if any)
    Sheet.nextSection = function (state) {
        var _a;
        var sheet = state.sheet, index = state.index, visits = state.visits, firstTime = state.firstTime, lastTime = state.lastTime;
        // skip intro when not firstTime
        if (!firstTime && Measure_1.Measure.from(sheet[index]).section === 'IN') {
            return {
                index: Sheet.getNextSectionIndex({ sheet: sheet, index: index }),
            };
        }
        // skip coda when not last time
        if (Measure_1.Measure.hasSign('Coda', sheet[index]) && !Sheet.readyForFineOrCoda(state, -1)) {
            return Sheet.nextForm(state, true);
        }
        if (!Measure_1.Measure.hasHouse(sheet[index], 1)) {
            return {};
        }
        var next = Sheet.getNextHouseIndex({ sheet: sheet, index: index, visits: visits });
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
        if (move === void 0) { move = 1; }
        if (stack === void 0) { stack = 0; }
        var match = -1; // start with no match
        while (match === -1 && index >= 0 && index < sheet.length) {
            if (pairs[0](sheet[index], { sheet: sheet, index: index })) { // same sign
                stack++;
            }
            if (pairs[1](sheet[index], { sheet: sheet, index: index })) { // pair sign
                stack--;
            }
            if (stack === 0) { // all pairs resolved > match!
                match = index;
            }
            else {
                index += move;
            }
        }
        return match;
    };
    Sheet.findMatch = function (sheet, index, find, move) {
        if (move === void 0) { move = 1; }
        var match = -1; // start with no match
        while (match === -1 && index >= 0 && index < sheet.length) {
            if (find(sheet[index], { sheet: sheet, index: index })) {
                match = index;
            }
            else {
                index += move;
            }
        }
        return match;
    };
    // simple matching for brace start, ignores nested repeats
    Sheet.getJumpDestination = function (state) {
        var sheet = state.sheet, index = state.index, fallbackToZero = state.fallbackToZero, nested = state.nested;
        var sign = Measure_1.Measure.getJumpSign(sheet[index]);
        // if fine > jump till end
        if (sign.fine) {
            return sheet.length;
        }
        // if no pair given => da capo
        if (!sign.pair) {
            return 0;
        }
        // if nested mode on and opening brace is searched, use getBracePair..
        if (nested !== false && sign.pair === '{') {
            return Sheet.getBracePair({ sheet: sheet, index: index, fallbackToZero: fallbackToZero });
        }
        var destination = Sheet.findMatch(sheet, index, function (m) { return Measure_1.Measure.hasSign(sign.pair, m); }, sign.move || -1); // default move back
        if (fallbackToZero) {
            // default to zero when searching repeat start (could be forgotten)
            return destination === -1 ? 0 : destination;
        }
        return destination;
    };
    // returns the index of the repeat sign that pairs with the given index
    Sheet.getBracePair = function (_a) {
        var sheet = _a.sheet, index = _a.index, fallbackToZero = _a.fallbackToZero;
        if (fallbackToZero === undefined) {
            fallbackToZero = true;
        }
        if (Measure_1.Measure.hasSign('{', sheet[index])) {
            return Sheet.findPair(sheet, index, [
                function (m) { return Measure_1.Measure.hasSign('{', m); },
                function (m) { return Measure_1.Measure.hasSign('}', m); },
            ], 1);
        }
        else if (Measure_1.Measure.hasSign('}', sheet[index])) {
            var pair = Sheet.findPair(sheet, index, [
                function (m, state) {
                    // this logic could be infinitely complex, having many side effects and interpretations
                    // the current behaviour is similar to musescore or ireal handling braces
                    if (!Measure_1.Measure.hasSign('}', m)) {
                        return false;
                    }
                    if (index === state.index) {
                        return true;
                    }
                    var relatedHouse = Sheet.getRelatedHouse({ sheet: sheet, index: state.index });
                    return relatedHouse === -1;
                },
                function (m) { return Measure_1.Measure.hasSign('{', m); }
            ], -1);
            if (fallbackToZero) {
                return pair === -1 ? 0 : pair; // default to zero when searching repeat start (could be forgotten)
            }
            return pair;
        }
        return -1;
    };
    // returns true if the house at the given index has not been visited enough times
    Sheet.canVisitHouse = function (_a) {
        var sheet = _a.sheet, index = _a.index, visits = _a.visits;
        var houses = sheet[index].house;
        if (houses === undefined) {
            return false;
        }
        if (!Array.isArray(houses)) {
            houses = [houses];
        }
        var visited = visits[index] || 0;
        return visited < houses.length;
    };
    // returns the next house that can be visited (from the given index)
    Sheet.getNextHouseIndex = function (_a, move) {
        var sheet = _a.sheet, index = _a.index, visits = _a.visits;
        if (move === void 0) { move = 1; }
        return Sheet.findMatch(sheet, index, function (m, step) { return Measure_1.Measure.hasHouse(m) && Sheet.canVisitHouse({ sheet: sheet, index: step.index, visits: visits }); }, move);
    };
    Sheet.getNextSectionIndex = function (_a, move) {
        var sheet = _a.sheet, index = _a.index;
        if (move === void 0) { move = 1; }
        return Sheet.findMatch(sheet, index + 1, function (m) { return Measure_1.Measure.from(m).section !== undefined; }, 1);
    };
    // wipes all keys in the given range
    Sheet.wipeKeys = function (numberMap, range) {
        var wiped = {};
        Object.keys(numberMap)
            .map(function (i) { return parseInt(i); })
            .filter(function (i) { return i < range[0] || i > range[1]; })
            .forEach(function (i) { return wiped[i] = numberMap[i]; });
        return wiped;
    };
    Sheet.getRelatedHouse = function (_a) {
        var sheet = _a.sheet, index = _a.index;
        var latestHouse = Sheet.findPair(sheet, index, [
            function (m, state) { return index === state.index || Measure_1.Measure.hasSign('}', m); },
            function (m) { return Measure_1.Measure.hasHouse(m); }
        ], -1);
        return latestHouse;
    };
    Sheet.isFirstHouse = function (_a) {
        var sheet = _a.sheet, index = _a.index;
        return Measure_1.Measure.hasHouse(sheet[index], 1);
    };
    Sheet.getAllowedJumps = function (_a) {
        var sheet = _a.sheet, index = _a.index;
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
        var sheet = _a.sheet, index = _a.index, jumps = _a.jumps, lastTime = _a.lastTime;
        if (move === void 0) { move = 1; }
        var signs = Object.keys(Sheet.jumpSigns)
            .filter(function (s) { return s.includes('DC') || s.includes('DS'); });
        var backJump = Sheet.findMatch(sheet, index, function (m) { return signs.reduce(function (match, sign) { return match || Measure_1.Measure.hasSign(sign, m); }, false); }, move);
        if (backJump === -1) {
            return lastTime; // last time
        }
        return jumps[backJump] > 0;
    };
    Sheet.shouldJump = function (_a) {
        var sheet = _a.sheet, index = _a.index, jumps = _a.jumps, lastTime = _a.lastTime;
        if (!Measure_1.Measure.hasJumpSign(sheet[index])) {
            return false;
        }
        var sign = Measure_1.Measure.getJumpSign(sheet[index]);
        if (sign.validator && !sign.validator({ sheet: sheet, index: index, jumps: jumps, lastTime: lastTime })) {
            return false;
        }
        var allowedJumps = Sheet.getAllowedJumps({ sheet: sheet, index: index });
        var timesJumped = jumps[index] || 0;
        return timesJumped < allowedJumps;
    };
    Sheet.transpose = function (sheet, interval) {
        if (sheet.chords) {
            sheet = __assign({}, sheet, { chords: sheet.chords
                    .map(function (measure) { return Measure_1.Measure.from(measure).chords
                    .map(function (chord) { return Harmony_1.Harmony.transposeChord(chord, interval); }); }) });
        }
        if (sheet.melody) {
            console.log('TODO: tranpose melody');
        }
        return sheet;
    };
    Sheet.fraction = function (divisions, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (f, d) { return f / d; }, whole);
    };
    Sheet.position = function (divisions, path, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (_a, d, i) {
            var f = _a.f, p = _a.p;
            return ({ f: f / d, p: p + f / d * path[i] });
        }, { f: whole, p: 0 }).p;
    };
    /** Flattens the given possibly nested tree array to an array containing all values in sequential order.
     * If withPath is set to true, the values are turned to objects containing the nested path (ItemWithPath).
     * You can then turn ItemWithPath[] back to the original nested array with Measure.expand. */
    Sheet.flatten = function (tree, withPath, path, divisions) {
        if (withPath === void 0) { withPath = false; }
        if (path === void 0) { path = []; }
        if (divisions === void 0) { divisions = []; }
        if (!Array.isArray(tree)) { // is primitive value
            if (withPath) {
                return [{
                        path: path,
                        divisions: divisions,
                        /* fraction: Sheet.fraction(divisions),
                        position: Sheet.position(divisions, path), */
                        value: tree
                    }];
            }
            return [tree];
        }
        return tree.reduce(function (flat, item, index) {
            return flat.concat(Sheet.flatten(item, withPath, path.concat([index]), divisions.concat([tree.length])));
        }, []);
    };
    /** Turns a flat ItemWithPath array to a (possibly) nested Array of its values. Reverts Measure.flatten (using withPath=true). */
    Sheet.expand = function (items) {
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
                expanded[item.path[0]] = Sheet.expand(siblings);
                /* expanded.push(Measure.expand(siblings)); */
            }
            return expanded;
        }, []);
    };
    Sheet.pathOf = function (value, tree) {
        var flat = Sheet.flatten(tree, true);
        var match = flat.find(function (v) { return v.value === value; });
        if (match) {
            return match.path;
        }
    };
    Sheet.getPath = function (tree, path, withPath, flat) {
        if (withPath === void 0) { withPath = false; }
        if (typeof path === 'number') {
            path = [path];
        }
        flat = flat || Sheet.flatten(tree, true);
        var match = flat.find(function (v) {
            var min = Math.min(path.length, v.path.length);
            return v.path.slice(0, min).join(',') === path.slice(0, min).join(',');
        });
        if (withPath) {
            return match;
        }
        return match ? match.value : undefined;
    };
    Sheet.nextItem = function (tree, path, move, withPath, flat) {
        if (move === void 0) { move = 1; }
        if (withPath === void 0) { withPath = false; }
        flat = Sheet.flatten(tree, true);
        var match = Sheet.getPath(tree, path, true, flat);
        if (match) {
            var index = (flat.indexOf(match) + move + flat.length) % flat.length;
            if (withPath) {
                return flat[index];
            }
            return flat[index] ? flat[index].value : undefined;
        }
    };
    Sheet.nextValue = function (tree, value, move) {
        if (move === void 0) { move = 1; }
        var flat = Sheet.flatten(tree, true);
        var match = flat.find(function (v) { return v.value === value; });
        if (match) {
            return Sheet.nextItem(tree, match.path, move, false, flat);
        }
    };
    Sheet.nextPath = function (tree, path, move) {
        if (move === void 0) { move = 1; }
        var flat = Sheet.flatten(tree, true);
        if (!path) {
            return flat[0] ? flat[0].path : undefined;
        }
        var match = Sheet.getPath(tree, path, true, flat);
        if (match) {
            var next = Sheet.nextItem(tree, match.path, move, true, flat);
            return next ? next.path : undefined;
        }
    };
    Sheet.randomItem = function (tree) {
        var flat = Sheet.flatten(tree, true);
        return util_1.randomElement(flat);
    };
    Sheet.stringify = function (measures, property) {
        if (property === void 0) { property = 'chords'; }
        return measures.map(function (measure) { return (Measure_1.Measure.from(measure)[property]); });
    };
    Sheet.obfuscate = function (measures, keepFirst) {
        if (keepFirst === void 0) { keepFirst = true; }
        return measures
            .map(function (m) { return Measure_1.Measure.from(m); })
            .map(function (m, i) {
            m.chords = m.chords.map(function (c, j) {
                if (keepFirst && i === 0 && j === 0) {
                    return c;
                }
                return c.replace(/([A-G1-9a-z#b\-\^+])/g, '?');
            });
            return m;
        });
    };
    Sheet.getSequence = function (_a, settings) {
        var melody = _a.melody, chords = _a.chords;
        if (settings === void 0) { settings = {}; }
        var _b;
        _b = [melody || [], chords || []], melody = _b[0], chords = _b[1];
        var _c = __assign({ arpeggio: false, bell: false, logging: false, pedal: false }, settings), arpeggio = _c.arpeggio, bell = _c.bell, maxVoices = _c.maxVoices, logging = _c.logging, pedal = _c.pedal;
        chords = chords.map(function (m) { return Measure_1.Measure.from(m).chords; });
        var flatChords = Sheet.flatten(chords, true)
            .map(function (chord) { return ({
            value: chord.value,
            fraction: Sheet.fraction(chord.divisions, chords.length),
            position: Sheet.position(chord.divisions, chord.path, chords.length),
        }); });
        var flatMelody = Sheet.flatten(melody, true);
        return flatChords.reduce(function (_a, chord, index) {
            var notes = _a.notes, latest = _a.latest, pedalNotes = _a.pedalNotes, attackedNotes = _a.attackedNotes;
            var voices = maxVoices || 4;
            /* if (arpeggio) {
                maxVoices = Math.floor(1 / chord.divisions[chord.divisions.length - 1] * voices);
            } */
            var voicing = Voicing_1.Voicing.getNextVoicing(chord.value, latest, __assign({}, settings, { logging: logging,
                maxVoices: maxVoices }));
            if (pedal) {
                /* pedalNotes = latest.filter(note => voicing.find(n => Harmony.hasSamePitch(note, n)))
                    .concat(pedalNotes); */
                console.log('notes', notes.length);
                pedalNotes = pedalNotes
                    // select latest attacked notes from notes list
                    .concat(attackedNotes
                    // find notes that appear again in the current voicing
                    .filter(function (n) { return voicing.find(function (note) { return Harmony_1.Harmony.hasSamePitch(note, n.value); }); })
                // filter out the ones that are already on hold
                /* .filter(n => !!pedalNotes.find(note => Harmony.hasSamePitch(note.value, n.value))) */
                // remove notes that now have been released
                ); /* .filter((n) => !voicing.find(note => Harmony.hasSamePitch(note, n.value))); */
                pedalNotes.forEach(function (note) {
                    note.fraction += chord.fraction;
                });
                // const releasedNotes = latest.filter(note => !voicing.find(n => !Harmony.hasSamePitch(note, n)));
            }
            var position = chord.position, fraction = chord.fraction;
            if (index === flatChords.length - 1) {
                fraction *= 3;
            }
            attackedNotes = voicing
                .filter(function (note) { return !pedalNotes.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n.value); }); })
                .map(function (note, index) {
                if (arpeggio) {
                    position = (chord.position + index * chord.fraction / voicing.length);
                    fraction = !bell ? (chord.fraction / voicing.length) : chord.fraction - index * chord.fraction / voicing.length;
                }
                return __assign({}, chord, { value: note, position: position,
                    fraction: fraction, chord: chord.value });
            });
            notes = notes.concat(attackedNotes);
            return { notes: notes, latest: voicing, pedalNotes: pedalNotes, attackedNotes: attackedNotes };
        }, { notes: [], latest: [], pedalNotes: [], attackedNotes: [] }).notes;
        /* .concat(flatMelody); */
    };
    Sheet.jumpSigns = {
        '}': { pair: '{', move: -1 },
        'DC': {},
        'DS': { pair: 'Segno', move: -1 },
        'DS.Fine': { pair: 'Segno', move: -1 },
        'DS.Coda': { pair: 'Segno', move: -1 },
        'DC.Fine': {},
        'DC.Coda': {},
        'Fine': {
            fine: true,
            validator: function (state) { return Sheet.readyForFineOrCoda(state); }
        },
        'ToCoda': {
            pair: 'Coda', move: 1,
            validator: function (state) { return Sheet.readyForFineOrCoda(state); }
        }
    };
    return Sheet;
}());
exports.Sheet = Sheet;
/*
TODO:

more typings
special sections:
IN: only play the first time
CODA: only play last time

test standards:
- Alice in Wonderland (dc al 2nd ending)
- All or Nothing at All (dc al coda)
- Are you real (intro + coda)
- Armageddon (intro)
- The Bat (coda sign inside repeat): ireal plays coda directly first time..
- Bennys Tune (intro+coda sign inside repeat): ireal plays coda directly first time..
- Bess You Is My Woman (coda sign inside repeat): ireal plays coda directly first time..
- Blessed Relief (nested repeats, with odd behaviour)
- Blue in Green (coda)
- Miles Ahead (coda)
*/
