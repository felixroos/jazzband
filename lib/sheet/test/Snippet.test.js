"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Snippet_1 = require("../Snippet");
var util_1 = require("../../util/util");
var JsDiff = __importStar(require("diff"));
/* test.only('Snippet.testFormat', () => {
    expect(Snippet.testFormat(['C', 'F', 'B'])).toBe('C F B');
}) */
test('Snippet.parse2', function () {
    expect(Snippet_1.Snippet.nest("f . a c . e")).toEqual(['f', ['a', 'c'], 'e']);
    expect(Snippet_1.Snippet.nest('D-7')).toEqual('D-7');
    expect(Snippet_1.Snippet.nest('D-7 G7 C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet_1.Snippet.parse2('| f . a c . e | d e f a |')).toEqual([['f', ['a', 'c'], 'e'], ['d', 'e', 'f', 'a']]);
    /* .toEqual([['f'], ['a', 'c'], ['e']]) */
});
test('Snippet.parse2 Blues for Alice', function () {
    var alice = Snippet_1.Snippet.parse2("\n    f+ . c+ a . e+ . c+ a |\n    d+ e+ b d+ db+ bb g ab |\n    a . f d . g a . f e |");
    expect(alice).toEqual([
        ['f+', ['c+', 'a'], 'e+', ['c+', 'a']],
        ['d+', 'e+', 'b', 'd+', 'db+', 'bb', 'g', 'ab'],
        ['a', ['f', 'd'], ['g', 'a'], ['f', 'e']]
    ]);
});
test('Snippet.parse2', function () {
    expect(Snippet_1.Snippet.parse2('D-7')).toEqual(['D-7']);
    expect(Snippet_1.Snippet.parse2('D-7 G7 C^7')).toEqual([['D-7', 'G7', 'C^7']]);
    expect(Snippet_1.Snippet.parse2('D-7 | G7 | C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet_1.Snippet.parse2('D-7 G7 | C^7')).toEqual([['D-7', 'G7'], 'C^7']);
    expect(Snippet_1.Snippet.parse2("\n    C7  | F7 | C7 | C7\n    F7  | F7 | C7 | A7\n    D-7 | G7 | C7 | G7"))
        .toEqual([
        'C7', 'F7', 'C7', 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
    expect(Snippet_1.Snippet.parse2("\n            | C7  | F7 | C7 | C7 |\n            | F7  | F7 | C7 | A7 |\n            | D-7 | G7 | C7 | G7 |"))
        .toEqual([
        'C7', 'F7', 'C7', 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
});
test('Snippet.parse2 control flow', function () {
    expect(Snippet_1.Snippet.parse2("| A (DC) | B |"))
        .toEqual([{ body: ['A'], signs: ['DC'] }, 'B']);
    expect(Snippet_1.Snippet.parse2("| A (Fine) | B (DC) |"))
        .toEqual([{ body: ['A'], signs: ['Fine'] }, { body: ['B'], signs: ['DC'] }]);
    expect(Snippet_1.Snippet.parse2("| A (Fi) | B (DC) |"))
        .toEqual([{ body: ['A'], signs: ['Fine'] }, { body: ['B'], signs: ['DC'] }]);
    expect(Snippet_1.Snippet.parse2("| A (ToCoda) | B (DC) | (Coda) C |"))
        .toEqual([{ body: ['A'], signs: ['ToCoda'] }, { body: ['B'], signs: ['DC'] }, { body: ['C'], signs: ['Coda'] }]);
    expect(Snippet_1.Snippet.parse2("| A (2Q) | B (DC) | (Q) C |"))
        .toEqual([{ body: ['A'], signs: ['ToCoda'] }, { body: ['B'], signs: ['DC'] }, { body: ['C'], signs: ['Coda'] }]);
});
test('Snippet.parse', function () {
    expect(Snippet_1.Snippet.parse('D-7')).toEqual(['D-7']);
    expect(Snippet_1.Snippet.parse('D-7 G7 C^7')).toEqual([['D-7', 'G7', 'C^7']]);
    expect(Snippet_1.Snippet.parse('D-7 | G7 | C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet_1.Snippet.parse('D-7 G7 | C^7')).toEqual([['D-7', 'G7'], 'C^7']);
    expect(Snippet_1.Snippet.parse("\n    C7  | F7 | C7 | C7\n    F7  | F7 | C7 | A7\n    D-7 | G7 | C7 | G7"))
        .toEqual([
        'C7', 'F7', 'C7', 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
    expect(Snippet_1.Snippet.parse("\n            | C7  | F7 | C7 | C7 |\n            | F7  | F7 | C7 | A7 |\n            | D-7 | G7 | C7 | G7 |"))
        .toEqual([
        'C7', 'F7', 'C7', 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
});
test('Snippet.parse: houses', function () {
    expect(Snippet_1.Snippet.parse("\n            |: C7  | F7 |1 C7 | C7 :|\n                        |2 C7 | C7  |\n            | F7   | F7 |  C7 | A7  |\n            | D-7  | G7 |  C7 | G7  |"))
        .toEqual([
        { body: ['C7'], signs: ['{'] }, 'F7',
        { house: 1, body: ['C7'] }, { body: ['C7'], signs: ['}'] },
        { house: 2, body: ['C7'] }, 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
});
test('Snippet.parse: houses', function () {
    expect(Snippet_1.Snippet.parse("\n            |:C7:|"))
        .toEqual([
        { body: ['C7'], signs: ['{', '}'] }
    ]);
});
test('Snippet.minify', function () {
    expect(Snippet_1.Snippet.minify("|C7|F7|")).toEqual('C7|F7');
    expect(Snippet_1.Snippet.minify("   C7    |  F7")).toEqual('C7|F7');
    expect(Snippet_1.Snippet.minify("RCIFYM7IX")).toEqual(':C|F#^7|x');
    expect(Snippet_1.Snippet.minify(':C|F#^7|%', true)).toEqual('RCIFYM7IX');
    expect(Snippet_1.Snippet.minify("C7\n                                F7")).toEqual('C7|F7');
    expect(Snippet_1.Snippet.minify("C7|||||F7")).toEqual('C7|F7');
    var minified = Snippet_1.Snippet.minify("\n    |: E-7b5    | A7b9      | D-     | x          |\n    |  G-7      | C7        | F^7    | E-7b5 A7b9 |\n    \n    |1 D-       | G-7       | Bb7    | A7b9       |\n    |  D-       | G7#11     | E-7b5  | A7b9      :|\n    \n    |2 D-       | G-7       | Bb7    | A7b9       |\n    |  D- B7    | Bb7#11 A7 | D-     | x          |\n    ", false);
    expect(minified).toBe(":E-7b5|A7b9|D-|x|G-7|C7|F^7|E-7b5 A7b9|1 D-|G-7|Bb7|A7b9|D-|G7#11|E-7b5|A7b9:|2 D-|G-7|Bb7|A7b9|D- B7|Bb7#11 A7|D-|x");
    var urlSafe = Snippet_1.Snippet.minify("\n      |: E-7b5    | A7b9      | D-     | x          |\n      |  G-7      | C7        | F^7    | E-7b5 A7b9 |\n      \n      |1 D-       | G-7       | Bb7    | A7b9       |\n      |  D-       | G7#11     | E-7b5  | A7b9      :|\n      \n      |2 D-       | G-7       | Bb7    | A7b9       |\n      |  D- B7    | Bb7#11 A7 | D-     | x          |\n      ", true);
    expect(urlSafe).toBe("RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7Y11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7Y11_A7ID-Ix");
    expect(new RegExp(/^[a-zA-Z0-9_-]*$/).test(urlSafe)).toBe(true);
});
test('Snippet.format', function () {
    var urlsafe = 'RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7Y11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7Y11_A7ID-Ix';
    var formatted = Snippet_1.Snippet.format(urlsafe);
    expect("\n" + formatted).toBe("\n|: E-7b5  |  A7b9       |  D-     |  x           |\n|  G-7    |  C7         |  F^7    |  E-7b5 A7b9  |\n|1 D-     |  G-7        |  Bb7    |  A7b9        |\n|  D-     |  G7#11      |  E-7b5  |  A7b9       :|\n|2 D-     |  G-7        |  Bb7    |  A7b9        |\n|  D- B7  |  Bb7#11 A7  |  D-     |  x           |");
    expect(Snippet_1.Snippet.minify(formatted, true)).toBe(urlsafe);
});
test('Snippet.minify', function () {
    var fakeBlues = "\n|: C7  |  F7  |  C7   |  C7   |\n|1 A7  |  D7  |  D-7  |  G7  :|\n|2 F7  |  F7  |  C7   |  G7   |";
    var miniFakeBlues = Snippet_1.Snippet.minify(fakeBlues);
    expect(miniFakeBlues).toBe(':C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7|F7|C7|G7');
});
test('Snippet.format with offset', function () {
    var withTwoBarOffset = Snippet_1.Snippet.format("RGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9I1_A7IA-7b5_D7b9RI2_A-7_D7IGM7ID-7IG7ICM7IXIF-7IBb7IEbM7IA-7_D7IGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9IA-7_D7IGM7_D7");
    expect("\n" + withTwoBarOffset).toBe("\n|: G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |\n|  C7   |  B-7b5 E7b9  |1 A7      |  A-7b5 D7b9  :|\n                       |2 A-7 D7  |  G^7          |\n|  D-7  |  G7          |  C^7     |  x            |\n|  F-7  |  Bb7         |  Eb^7    |  A-7 D7       |\n|  G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |\n|  C7   |  B-7b5 E7b9  |  A-7 D7  |  G^7 D7       |");
    var withThreeBarOffset = Snippet_1.Snippet.format('RCM7ID-7_G7ICM7I1_G7RI2_E7IA-7ID7ID-7IG7');
    expect("\n" + withThreeBarOffset).toBe("\n|: C^7  |  D-7 G7  |  C^7  |1 G7  :|\n                           |2 E7   |\n|  A-7  |  D7      |  D-7  |  G7   |");
    /* const lessThan4 = `|: A | 1 B :| 2 C |`;
    expect(Snippet.format("\n" + lessThan4)).toBe(`
  |  A  |1 B  :|2 C  |`); */
    var withOneBarOffset = Snippet_1.Snippet.format('RCM7I1_D-7_G7ICM7IG7RI2_B-7b5IE7IA7IA-7ID7ID-7IG7');
    expect("\n" + withOneBarOffset).toBe("\n|: C^7  |1 D-7 G7  |  C^7  |  G7  :|\n        |2 B-7b5   |  E7   |  A7   |\n|  A-7  |  D7      |  D-7  |  G7   |");
    var withNoOffset = Snippet_1.Snippet.format('|:C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7 |F7|C7|G7|');
    expect("\n" + withNoOffset).toBe("\n|: C7  |  F7  |  C7   |  C7   |\n|1 A7  |  D7  |  D-7  |  G7  :|\n|2 F7  |  F7  |  C7   |  G7   |");
});
test('Snippet.diff', function () {
    var snippetA = "\n    |: C7  |  F7  |  C7   |  C7   |\n    |1 A7  |  D7  |  D-7  |  G7  :|\n    |2 F7  |  F7  |  C7   |  G7   |";
    var snippetB = "\n    |: C7  |  x  |  C7   |  C7   |\n    |1 A7  |  D7  |  D-7  |  G7  :|\n    |2 F7  |  F7  |  C7   |  G7   |";
    function snippetDiff(snippetA, snippetB) {
        var diffFormat = [Snippet_1.Snippet.formatForDiff(snippetA), Snippet_1.Snippet.formatForDiff(snippetB)];
        return JsDiff.diffWords(diffFormat[0], diffFormat[1]);
    }
    var diff = snippetDiff(snippetA, snippetB);
    var total = util_1.totalDiff(diff);
    expect(total.balance).toBe(0);
    expect(total.added).toBe(1);
    expect(total.removed).toBe(1);
    expect(total.kept).toBe(52);
    expect(total.changes).toBe(2);
});
test('Snippet.render', function () {
    expect(Snippet_1.Snippet.render("\n|: C7  | F7 |1 C7 | G7 :|\n            |2 C7 | C7  |\n| F7   | F7 |  C7 | A7  |\n| D-7  | G7 |  C7 | G7  |")
        .map(function (m) { return m.body; })).toEqual([["C7"], ["F7"], ["C7"], ["G7"],
        ["C7"], ["F7"], ["C7"], ["C7"],
        ["F7"], ["F7"], ["C7"], ["A7"],
        ["D-7"], ["G7"], ["C7"], ["G7"]]);
});
test('Snippet.from', function () {
    expect(Snippet_1.Snippet.from([
        { body: ['C7'], signs: ['{'] }, 'F7',
        { house: 1, body: ['C7'] }, { body: ['C7'], signs: ['}'] },
        { house: 2, body: ['C7'] }, 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ])).toBe(Snippet_1.Snippet.format("\n|: C7   |  F7  |1 C7  |  C7  :|\n                   |2 C7  |  C7   |\n    |  F7   |  F7  |  C7  |  A7   |\n    |  D-7  |  G7  |  C7  |  G7   |"));
    expect(Snippet_1.Snippet.from([
        'A',
        { body: ['B'], signs: ['Segno', 'Fine'] },
        { body: ['C'], signs: ['DS'] }
    ])).toBe(Snippet_1.Snippet.format("| A | (S) B (Fi) | C (DS) |"));
});
test('Repeats', function () {
    expect(Snippet_1.Snippet.expand("|: A | B :| "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | B | "));
    expect(Snippet_1.Snippet.expand("| A | B :| "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | B | "));
});
test('Houses', function () {
    // Inside repeat signs. Play one house at a time, step forward sequentially each repeat:
    expect(Snippet_1.Snippet.expand("|: A | 1 B :| 2 C | "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | C | "));
});
test('getControlSigns', function () {
    expect(Snippet_1.Snippet.getControlSigns(['(DC)', 'C7', 'Q']).map(function (c) { return c.short; })).toEqual(['DC', 'Q']);
});
test('DC = Da Capo', function () {
    // Jump back to beginning:
    expect(Snippet_1.Snippet.expand("| A (DC) | B | "))
        .toBe(Snippet_1.Snippet.format("| A | A | B | "));
});
test('DC + Fine = Da Capo al Fine', function () {
    // Finishes the piece, only when a DS/DC has been hit before.
    expect(Snippet_1.Snippet.expand("| A (Fine) | B (DC) | "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | "));
    expect(Snippet_1.Snippet.expand("| A (Fi) | B (DC) | "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | "));
});
test('DC + Coda = Da Capo al Coda', function () {
    // Finishes the piece, only when a DS/DC has been hit before.
    expect(Snippet_1.Snippet.expand("| A (ToCoda) | B (DC) | (Coda) C | "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | C | "));
    expect(Snippet_1.Snippet.expand("| A (2Q) | B (DC) | (Q) C | "))
        .toBe(Snippet_1.Snippet.format("| A | B | A | C | "));
});
test('DS = Dal Segno', function () {
    // Jump back to Segno (S).
    expect(Snippet_1.Snippet.expand("| A | (Segno) B (DS) | C | "))
        .toBe(Snippet_1.Snippet.format("| A | B | B | C | "));
    expect(Snippet_1.Snippet.expand("| A | (S) B (DS) | C | "))
        .toBe(Snippet_1.Snippet.format("| A | B | B | C | "));
});
test('DS + Fine = Dal Segno al Fine', function () {
    // Jump back to Segno. Stop playing when hitting Fine:
    expect(Snippet_1.Snippet.expand("| A | (Segno) B (Fine) | C (DS) | "))
        .toBe(Snippet_1.Snippet.format("| A | B | C | B | "));
    expect(Snippet_1.Snippet.expand("| A | (S) B (Fi) | C (DS) | "))
        .toBe(Snippet_1.Snippet.format("| A | B | C | B | "));
});
test('DS + Coda = Dal Segno al Coda', function () {
    // Jump back to Segno. When hitting ToCoda sign, jump to the Bar with the Coda sign.
    expect(Snippet_1.Snippet.expand("| A | (S) B (ToCoda) | C (DS) | (Coda) D | "))
        .toBe(Snippet_1.Snippet.format("| A | B | C | B | D | "));
    expect(Snippet_1.Snippet.expand("| A | (S) B (2Q) | C (DS) | (Q) D | "))
        .toBe(Snippet_1.Snippet.format("| A | B | C | B | D | "));
});
test('Beautiful Love', function () {
    expect(Snippet_1.Snippet.expand("\n|: E-7b5    | A7b9      | D-     | %          |\n|  G-7      | C7        | F^7    | E-7b5 A7b9 |\n|1 D-       | G-7       | Bb7    | A7b9       |\n|  D-       | G7#11     | E-7b5  | A7b9      :|\n|2 D-       | G-7       | Bb7    | A7b9       |\n|  D- B7    | Bb7#11 A7 | D-     | %          |\n")).toEqual(Snippet_1.Snippet.format("\n| E-7b5    | A7b9      | D-     | %          |\n|  G-7     | C7        | F^7    | E-7b5 A7b9 |\n|  D-      | G-7       | Bb7    | A7b9       |\n|  D-      | G7#11     | E-7b5  | A7b9       |\n| E-7b5    | A7b9      | D-     | %          |\n|  G-7     | C7        | F^7    | E-7b5 A7b9 |\n|  D-      | G-7       | Bb7    | A7b9       |\n|  D- B7   | Bb7#11 A7 | D-     | %          |\n"));
});
test('Ahlert-Turk - Walkin My Baby Back Home', function () {
    expect(Snippet_1.Snippet.expand("\n|  Bb^7  |  Bo    |  C-7      |  F7     |\n|: Bb^7  |  Bb^7  |  Bb^7 G7  |  C7     |\n|  F7    |  F7    |  F7       |  Bb^7  :|\n|  D-7   |  G7    |  G-7      |  A7     |\n|  D-7   |  G7    |  C7       |  F7     |\n|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7     |\n|  F7    |  F7    |  F7       |  Bb^7   |\n")).toEqual(Snippet_1.Snippet.format("\n|  Bb^7  |  Bo    |  C-7      |  F7    |\n|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7    |\n|  F7    |  F7    |  F7       |  Bb^7  |\n|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7    |\n|  F7    |  F7    |  F7       |  Bb^7  |\n|  D-7   |  G7    |  G-7      |  A7    |\n|  D-7   |  G7    |  C7       |  F7    |\n|  Bb^7  |  Bb^7  |  Bb^7 G7  |  C7    |\n|  F7    |  F7    |  F7       |  Bb^7  |\n"));
});
test('Miller-Parish - Moonlight Serenade', function () {
    expect(Snippet_1.Snippet.expand("\n|: F6      |  Abo7     |  G-7          |  C7 C7#5      |\n|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6    |\n|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |1 F^7 G-7 C7  :|\n                                       |2 F^7 F7       |\n|  Bb^7    |  Eb7      |  A7b9#5 D7b9  |  D7b9 D7      |\n|  B-7b5   |  E7b9     |  Ah7 D7b9     |  G-7 C7b9     |\n|  F^7     |  Abo7     |  G-7          |  C7 C7#5      |\n|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6    |\n|  A-7 D7  |  Gh7 G-7  |  C7 C7#5      |  F^7          |"))
        .toEqual(Snippet_1.Snippet.format("\n|  F6      |  Abo7     |  G-7          |  C7 C7#5     |\n|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6   |\n|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |  F^7 G-7 C7  |\n|  F6      |  Abo7     |  G-7          |  C7 C7#5     |\n|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6   |\n|  A-7 D7  |  Gh7 G-7  |  C7 C7b9#5    |  F^7 F7      |\n|  Bb^7    |  Eb7      |  A7b9#5 D7b9  |  D7b9 D7     |\n|  B-7b5   |  E7b9     |  Ah7 D7b9     |  G-7 C7b9    |\n|  F^7     |  Abo7     |  G-7          |  C7 C7#5     |\n|  F^7 F6  |  F^7 F6   |  F^7 F7       |  D7b9 Bb-6   |\n|  A-7 D7  |  Gh7 G-7  |  C7 C7#5      |  F^7         |"));
});
test('Snippet.obfuscate', function () {
    expect(Snippet_1.Snippet.obfuscate('C')).toEqual('|  C  |');
    expect(Snippet_1.Snippet.obfuscate('C', false, false)).toEqual('?');
    expect(Snippet_1.Snippet.obfuscate('C', false, true)).toEqual('|  ?  |');
    expect(Snippet_1.Snippet.obfuscate('C Bb7')).toEqual('|  C ???  |');
    expect(Snippet_1.Snippet.obfuscate('C Bb7', false)).toEqual('|  ? ???  |');
    expect(Snippet_1.Snippet.obfuscate('C Bb7')).toEqual('|  C ???  |');
    expect(Snippet_1.Snippet.obfuscate('C Bb7', false)).toEqual('|  ? ???  |');
});
