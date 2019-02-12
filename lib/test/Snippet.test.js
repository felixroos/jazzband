"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Snippet_1 = require("../sheet/Snippet");
var util_1 = require("../util");
var Measure_1 = require("../sheet/Measure");
test('parseChordSnippet', function () {
    expect(Snippet_1.parseChordSnippet('D-7')).toEqual(['D-7']);
    expect(Snippet_1.parseChordSnippet('D-7 G7 C^7')).toEqual([['D-7', 'G7', 'C^7']]);
    expect(Snippet_1.parseChordSnippet('D-7 | G7 | C^7')).toEqual(['D-7', 'G7', 'C^7']);
    expect(Snippet_1.parseChordSnippet('D-7 G7 | C^7')).toEqual([['D-7', 'G7'], 'C^7']);
    expect(Snippet_1.parseChordSnippet("\n    C7  | F7 | C7 | C7\n    F7  | F7 | C7 | A7\n    D-7 | G7 | C7 | G7"))
        .toEqual([
        'C7', 'F7', 'C7', 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
    expect(Snippet_1.parseChordSnippet("\n            | C7  | F7 | C7 | C7 |\n            | F7  | F7 | C7 | A7 |\n            | D-7 | G7 | C7 | G7 |"))
        .toEqual([
        'C7', 'F7', 'C7', 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
});
test('parseChordSnippet: houses', function () {
    expect(Snippet_1.parseChordSnippet("\n            |: C7  | F7 |1 C7 | C7 :|\n                        |2 C7 | C7  |\n            | F7   | F7 |  C7 | A7  |\n            | D-7  | G7 |  C7 | G7  |"))
        .toEqual([
        { chords: ['C7'], signs: ['{'] }, 'F7',
        { house: 1, chords: ['C7'] }, { chords: ['C7'], signs: ['}'] },
        { house: 2, chords: ['C7'] }, 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ]);
});
test('parseChordSnippet: houses', function () {
    expect(Snippet_1.parseChordSnippet("\n            |:C7:|"))
        .toEqual([
        { chords: ['C7'], signs: ['{', '}'] }
    ]);
});
test('minifyChordSnippet', function () {
    expect(Snippet_1.minifyChordSnippet("|C7|F7|")).toEqual('C7|F7');
    expect(Snippet_1.minifyChordSnippet("   C7    |  F7")).toEqual('C7|F7');
    expect(Snippet_1.minifyChordSnippet("RCIFSM7IX")).toEqual(':C|F#^7|x');
    expect(Snippet_1.minifyChordSnippet(':C|F#^7|%', true)).toEqual('RCIFSM7IX');
    expect(Snippet_1.minifyChordSnippet("C7\n                                F7")).toEqual('C7|F7');
    expect(Snippet_1.minifyChordSnippet("C7|||||F7")).toEqual('C7|F7');
    var urlSafe = Snippet_1.minifyChordSnippet("\n    |: E-7b5    | A7b9      | D-     | x          |\n    |  G-7      | C7        | F^7    | E-7b5 A7b9 |\n    \n    |1 D-       | G-7       | Bb7    | A7b9       |\n    |  D-       | G7#11     | E-7b5  | A7b9      :|\n    \n    |2 D-       | G-7       | Bb7    | A7b9       |\n    |  D- B7    | Bb7#11 A7 | D-     | x          |\n    ", true);
    expect(urlSafe).toBe("RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7S11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7S11_A7ID-Ix");
    expect(new RegExp(/^[a-zA-Z0-9_-]*$/).test(urlSafe)).toBe(true);
});
test('formatChordSnippet', function () {
    var urlsafe = 'RE-7b5IA7b9ID-IxIG-7IC7IFM7IE-7b5_A7b9I1_D-IG-7IBb7IA7b9ID-IG7S11IE-7b5IA7b9RI2_D-IG-7IBb7IA7b9ID-_B7IBb7S11_A7ID-Ix';
    var formatted = Snippet_1.formatChordSnippet(urlsafe);
    expect("\n" + formatted).toBe("\n|: E-7b5  |  A7b9       |  D-     |  x           |\n|  G-7    |  C7         |  F^7    |  E-7b5 A7b9  |\n|1 D-     |  G-7        |  Bb7    |  A7b9        |\n|  D-     |  G7#11      |  E-7b5  |  A7b9       :|\n|2 D-     |  G-7        |  Bb7    |  A7b9        |\n|  D- B7  |  Bb7#11 A7  |  D-     |  x           |");
    expect(Snippet_1.minifyChordSnippet(formatted, true)).toBe(urlsafe);
});
test('minifyChordSnippet', function () {
    var fakeBlues = "\n|: C7  |  F7  |  C7   |  C7   |\n|1 A7  |  D7  |  D-7  |  G7  :|\n|2 F7  |  F7  |  C7   |  G7   |";
    var miniFakeBlues = Snippet_1.minifyChordSnippet(fakeBlues);
    expect(miniFakeBlues).toBe(':C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7|F7|C7|G7');
});
test('formatChordSnippet with offset', function () {
    var withTwoBarOffset = Snippet_1.formatChordSnippet("RGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9I1_A7IA-7b5_D7b9RI2_A-7_D7IGM7ID-7IG7ICM7IXIF-7IBb7IEbM7IA-7_D7IGM7IF-7b5_B7b9IE-7_A7ID-7_G7IC7IB-7b5_E7b9IA-7_D7IGM7_D7");
    expect("\n" + withTwoBarOffset).toBe("\n|: G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |\n|  C7   |  B-7b5 E7b9  |1 A7      |  A-7b5 D7b9  :|\n                       |2 A-7 D7  |  G^7          |\n|  D-7  |  G7          |  C^7     |  x            |\n|  F-7  |  Bb7         |  Eb^7    |  A-7 D7       |\n|  G^7  |  F-7b5 B7b9  |  E-7 A7  |  D-7 G7       |\n|  C7   |  B-7b5 E7b9  |  A-7 D7  |  G^7 D7       |");
    var withThreeBarOffset = Snippet_1.formatChordSnippet('RCM7ID-7_G7ICM7I1_G7RI2_E7IA-7ID7ID-7IG7');
    expect("\n" + withThreeBarOffset).toBe("\n|: C^7  |  D-7 G7  |  C^7  |1 G7  :|\n                           |2 E7   |\n|  A-7  |  D7      |  D-7  |  G7   |");
    var withOneBarOffset = Snippet_1.formatChordSnippet('RCM7I1_D-7_G7ICM7IG7RI2_B-7b5IE7IA7IA-7ID7ID-7IG7');
    expect("\n" + withOneBarOffset).toBe("\n|: C^7  |1 D-7 G7  |  C^7  |  G7  :|\n        |2 B-7b5   |  E7   |  A7   |\n|  A-7  |  D7      |  D-7  |  G7   |");
    var withNoOffset = Snippet_1.formatChordSnippet('|:C7|F7|C7|C7|1 A7|D7|D-7|G7:|2 F7 |F7|C7|G7|');
    expect("\n" + withNoOffset).toBe("\n|: C7  |  F7  |  C7   |  C7   |\n|1 A7  |  D7  |  D-7  |  G7  :|\n|2 F7  |  F7  |  C7   |  G7   |");
});
test('chordSnippetDiff', function () {
    var snippetA = "\n    |: C7  |  F7  |  C7   |  C7   |\n    |1 A7  |  D7  |  D-7  |  G7  :|\n    |2 F7  |  F7  |  C7   |  G7   |";
    var snippetB = "\n    |: C7  |  x  |  C7   |  C7   |\n    |1 A7  |  D7  |  D-7  |  G7  :|\n    |2 F7  |  F7  |  C7   |  G7   |";
    var diff = Snippet_1.chordSnippetDiff(snippetA, snippetB);
    var total = util_1.totalDiff(diff);
    expect(total.balance).toBe(0);
    expect(total.added).toBe(1);
    expect(total.removed).toBe(1);
    expect(total.kept).toBe(52);
    expect(total.changes).toBe(2);
});
test('renderChordSnippet', function () {
    expect(Snippet_1.renderChordSnippet("\n|: C7  | F7 |1 C7 | G7 :|\n            |2 C7 | C7  |\n| F7   | F7 |  C7 | A7  |\n| D-7  | G7 |  C7 | G7  |")
        .map(function (m) { return Measure_1.Measure.from(m).chords; }))
        .toEqual([["C7"], ["F7"], ["C7"], ["G7"],
        ["C7"], ["F7"], ["C7"], ["C7"],
        ["F7"], ["F7"], ["C7"], ["A7"],
        ["D-7"], ["G7"], ["C7"], ["G7"]]);
});
test('getChordSnippet', function () {
    expect(Snippet_1.getChordSnippet([
        { chords: ['C7'], signs: ['{'] }, 'F7',
        { house: 1, chords: ['C7'] }, { chords: ['C7'], signs: ['}'] },
        { house: 2, chords: ['C7'] }, 'C7',
        'F7', 'F7', 'C7', 'A7',
        'D-7', 'G7', 'C7', 'G7'
    ])).toBe(Snippet_1.formatChordSnippet("\n|: C7   | F7 |1 C7 | C7 :|\n             |2 C7 | C7  |\n| F7    | F7 |  C7 | A7  |\n| D-7   | G7 |  C7 | G7  |"));
});
test('Beautiful Love', function () {
    expect(Snippet_1.expandSnippet("\n|: E-7b5    | A7b9      | D-     | %          |\n|  G-7      | C7        | F^7    | E-7b5 A7b9 |\n|1 D-       | G-7       | Bb7    | A7b9       |\n|  D-       | G7#11     | E-7b5  | A7b9      :|\n|2 D-       | G-7       | Bb7    | A7b9       |\n|  D- B7    | Bb7#11 A7 | D-     | %          |\n")).toEqual(Snippet_1.formatChordSnippet("\n|: E-7b5    | A7b9      | D-     | %          |\n|  G-7      | C7        | F^7    | E-7b5 A7b9 |\n|1 D-       | G-7       | Bb7    | A7b9       |\n|  D-       | G7#11     | E-7b5  | A7b9      :|\n|: E-7b5    | A7b9      | D-     | %          |\n|  G-7      | C7        | F^7    | E-7b5 A7b9 |\n|2 D-       | G-7       | Bb7    | A7b9       |\n|  D- B7    | Bb7#11 A7 | D-     | %          |\n"));
});
