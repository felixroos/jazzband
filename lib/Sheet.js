"use strict";
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
*/
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
function getMeasure(measure) {
    if (typeof measure === 'string') {
        return {
            chords: [measure]
        };
    }
    if (Array.isArray(measure)) {
        return {
            chords: [].concat(measure)
        };
    }
    return Object.assign({}, measure);
    // return measure;
}
exports.getMeasure = getMeasure;
/** renderSheet2 */
function hasSign(sign, measure) {
    measure = getMeasure(measure);
    return !!measure.signs && measure.signs.includes(sign);
}
exports.hasSign = hasSign;
function hasHouse(measure, number) {
    measure = getMeasure(measure);
    var house = measure.house;
    if (!house) {
        return false;
    }
    else if (number === undefined) {
        return true;
    }
    if (!Array.isArray(house)) {
        house = [house];
    }
    return house.includes(number);
}
exports.hasHouse = hasHouse;
/** Starts at a given index, stops when the pair functions returned equally often */
function findPair(sheet, index, pairs, move, stack) {
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
}
exports.findPair = findPair;
function getJumpSign(measure) {
    var signs = (getMeasure(measure).signs || [])
        .filter(function (s) { return Object.keys(exports.jumpSigns).includes(s); });
    if (signs.length > 1) {
        console.warn('measure cannot contain more than one repeat sign', measure);
    }
    return exports.jumpSigns[signs[0]];
}
exports.getJumpSign = getJumpSign;
// simple matching for brace start, ignores nested repeats
function getJumpDestination(state) {
    var sheet = state.sheet, index = state.index, fallbackToZero = state.fallbackToZero, nested = state.nested;
    var sign = getJumpSign(sheet[index]);
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
        return getBracePair({ sheet: sheet, index: index, fallbackToZero: fallbackToZero });
    }
    var destination = findPair(sheet, index, [
        function (m, step) { return step.index === index; },
        function (m) { return hasSign(sign.pair, m); },
    ], sign.move || -1); // default move back
    if (fallbackToZero) {
        // default to zero when searching repeat start (could be forgotten)
        return destination === -1 ? 0 : destination;
    }
    return destination;
}
exports.getJumpDestination = getJumpDestination;
// returns the index of the repeat sign that pairs with the given index
function getBracePair(_a) {
    var sheet = _a.sheet, index = _a.index, fallbackToZero = _a.fallbackToZero;
    if (fallbackToZero === undefined) {
        fallbackToZero = true;
    }
    if (hasSign('{', sheet[index])) {
        return findPair(sheet, index, [
            function (m) { return hasSign('{', m); },
            function (m) { return hasSign('}', m); },
        ], 1);
    }
    else if (hasSign('}', sheet[index])) {
        var pair = findPair(sheet, index, [
            function (m, state) {
                // this logic could be infinitely complex, having many side effects and interpretations
                // the current behaviour is similar to musescore or ireal handling braces
                if (!hasSign('}', m)) {
                    return false;
                }
                if (index === state.index) {
                    return true;
                }
                var relatedHouse = getRelatedHouse({ sheet: sheet, index: state.index });
                return relatedHouse === -1;
            },
            function (m) { return hasSign('{', m); }
        ], -1);
        if (fallbackToZero) {
            return pair === -1 ? 0 : pair; // default to zero when searching repeat start (could be forgotten)
        }
        return pair;
    }
    return -1;
}
exports.getBracePair = getBracePair;
// returns true if the house at the given index has not been visited enough times
function canVisitHouse(_a) {
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
}
exports.canVisitHouse = canVisitHouse;
// returns the next house that can be visited (from the given index)
function getNextHouseIndex(_a, move) {
    var sheet = _a.sheet, index = _a.index, visits = _a.visits;
    if (move === void 0) { move = 1; }
    return findPair(sheet, index, [
        function (m, step) { return index === step.index; },
        function (m, step) { return hasHouse(m) && canVisitHouse({ sheet: sheet, index: step.index, visits: visits }); }
    ], move);
}
exports.getNextHouseIndex = getNextHouseIndex;
// moves the index to the current house (if any)
function visitHouses(_a) {
    var sheet = _a.sheet, index = _a.index, visits = _a.visits;
    var _b;
    if (!hasHouse(sheet[index], 1)) {
        return {};
    }
    var next = getNextHouseIndex({ sheet: sheet, index: index, visits: visits });
    if (next === -1) {
        next = index;
        visits = {}; // reset visits
    }
    return {
        visits: __assign({}, visits, (_b = {}, _b[next] = (visits[next] || 0) + 1, _b)),
        index: next
    };
}
exports.visitHouses = visitHouses;
// wipes all keys in the given range
function wipeKeys(numberMap, range) {
    var wiped = {};
    Object.keys(numberMap)
        .map(function (i) { return parseInt(i); })
        .filter(function (i) { return i < range[0] || i > range[1]; })
        .forEach(function (i) { return wiped[i] = numberMap[i]; });
    return wiped;
}
exports.wipeKeys = wipeKeys;
function nextIndex(state) {
    var _a;
    var sheet = state.sheet, index = state.index, jumps = state.jumps, nested = state.nested, fallbackToZero = state.fallbackToZero;
    if (!shouldJump({ sheet: sheet, index: index, jumps: jumps })) {
        return {
            index: index + 1
        };
    }
    var braces = [getJumpDestination({ sheet: sheet, index: index, fallbackToZero: fallbackToZero, nested: nested }), index];
    jumps = wipeKeys(jumps, [braces[0], braces[1] - 1]); // wipes indices inside braces
    return {
        index: braces[0],
        jumps: __assign({}, jumps, (_a = {}, _a[braces[1]] = (jumps[braces[1]] || 0) + 1, _a))
    };
}
exports.nextIndex = nextIndex;
function getRelatedHouse(_a) {
    var sheet = _a.sheet, index = _a.index;
    var latestHouse = findPair(sheet, index, [
        function (m, state) { return index === state.index || hasSign('}', m); },
        function (m) { return hasHouse(m); }
    ], -1);
    return latestHouse;
}
exports.getRelatedHouse = getRelatedHouse;
function isFirstHouse(_a) {
    var sheet = _a.sheet, index = _a.index;
    return hasHouse(sheet[index], 1);
}
exports.isFirstHouse = isFirstHouse;
function getAllowedJumps(_a) {
    var sheet = _a.sheet, index = _a.index;
    if (!hasJumpSign(sheet[index])) {
        return 0;
    }
    var measure = getMeasure(sheet[index]);
    if (measure.times !== undefined) {
        return measure.times;
    }
    return 1;
}
exports.getAllowedJumps = getAllowedJumps;
function readyForFineOrCoda(_a) {
    var sheet = _a.sheet, index = _a.index, jumps = _a.jumps;
    var signs = Object.keys(exports.jumpSigns)
        .filter(function (s) { return s.includes('DC') || s.includes('DS'); });
    var backJump = findPair(sheet, index, [
        function (m, step) { return step.index === index; },
        function (m) { return signs.reduce(function (match, sign) { return match || hasSign(sign, m); }, false); }
    ]);
    return jumps[backJump] > 0;
}
exports.readyForFineOrCoda = readyForFineOrCoda;
exports.jumpSigns = {
    '}': { pair: '{', move: -1 },
    'DC': {},
    'DS': { pair: 'Segno', move: -1 },
    'DS.Fine': { pair: 'Segno', move: -1 },
    'DS.Coda': { pair: 'Segno', move: -1 },
    'DC.Fine': {},
    'DC.Coda': {},
    'Fine': {
        fine: true,
        validator: function (state) { return readyForFineOrCoda(state); }
    },
    'ToCoda': {
        pair: 'Coda', move: 1,
        validator: function (state) { return readyForFineOrCoda(state); }
    }
};
function hasJumpSign(measure) {
    return Object.keys(exports.jumpSigns)
        .reduce(function (match, current) { return match || hasSign(current, measure); }, false);
}
exports.hasJumpSign = hasJumpSign;
function shouldJump(_a) {
    var sheet = _a.sheet, index = _a.index, jumps = _a.jumps;
    if (!hasJumpSign(sheet[index])) {
        return false;
    }
    var sign = getJumpSign(sheet[index]);
    if (sign.validator && !sign.validator({ sheet: sheet, index: index, jumps: jumps })) {
        return false;
    }
    var allowedJumps = getAllowedJumps({ sheet: sheet, index: index });
    var timesJumped = jumps[index] || 0;
    return timesJumped < allowedJumps;
}
exports.shouldJump = shouldJump;
function nextMeasure(state) {
    state = __assign({}, state, visitHouses(state)); // moves to the right house (if any)
    var sheet = state.sheet, index = state.index, measures = state.measures;
    return __assign({}, state, { measures: measures.concat([sheet[index]]) }, nextIndex(state));
}
exports.nextMeasure = nextMeasure;
function renderSheet(sheet, options) {
    if (options === void 0) { options = {}; }
    var state = __assign({ measures: [], index: 0, sheet: sheet, jumps: {}, visits: {}, nested: true, fallbackToZero: true }, options);
    var runs = 0;
    while (runs < 100 && state.index < sheet.length) {
        runs++;
        state = nextMeasure(state);
    }
    return state.measures /* .map(m => getMeasure(m)) */;
}
exports.renderSheet = renderSheet;
