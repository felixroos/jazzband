"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Improvisation_1 = require("./Improvisation");
var defaults = {
    octave: 5,
    variance: 0,
    variety: 0,
    drill: 0,
    flip: false,
};
var improvisation = new Improvisation_1.Improvisation(defaults);
var guideTones = improvisation.enhance({
    pattern: [3, 7]
});
var guideTonesFlipped = guideTones.enhance({
    flip: true
});
var chordTones = improvisation.enhance({
    pattern: [1, 3, 5, 7],
    variance: .5,
    variety: .5,
    drill: .6,
    flip: function (_a) {
        var drill = _a.drill;
        return drill() > .5;
    }
});
test('Improvisation basic properties/methods', function () {
    expect(improvisation.rules).toEqual(defaults);
    expect(improvisation.get('octave')).toBe(5);
    expect(improvisation.get('flip')).toBe(false);
});
test('enhance: guideTones', function () {
    expect(guideTones.get('flip')).toEqual(false);
    expect(guideTones.get('pattern')).toEqual([3, 7]);
    expect(guideTonesFlipped.get('pattern')).toEqual([3, 7]);
    expect(guideTonesFlipped.get('flip')).toEqual(true);
});
test.only('dynamic rule: chordTones', function () {
    /* expect(chordTones.get('drill')).toBe(.6);
    expect(chordTones.get('flip')).toBe(true); */
    chordTones.mutate(function () { return ({ 'drill': .4 }); });
    expect(chordTones.get('drill')).toBe(.4);
    expect(chordTones.get('flip')).toBe(false);
    /*chordTones.mutate({ 'drill': .7 });
    expect(chordTones.get('flip')).toBe(true); */
});
