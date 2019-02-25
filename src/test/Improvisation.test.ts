import { Improvisation } from "../improvisation/Improvisation";

const defaults = {
    octave: 5,
    variance: 0,
    variety: 0,
    drill: 0,
    flip: false,
};
const improvisation = new Improvisation(defaults);
const guideTones = improvisation.enhance({
    pattern: [3, 7]
});
const guideTonesFlipped = guideTones.enhance({
    flip: true
});

const chordTones = improvisation.enhance({
    pattern: [1, 3, 5, 7],
    variance: .5,
    variety: .5,
    drill: .6,
    flip: ({ drill }) => drill() > .5
})

test('Improvisation basic properties/methods', () => {
    expect(improvisation.rules).toEqual(defaults);
    expect(improvisation.get('octave')).toBe(5);
    expect(improvisation.get('flip')).toBe(false);

});

test('enhance: guideTones', () => {
    expect(guideTones.get('flip')).toEqual(false);
    expect(guideTones.get('pattern')).toEqual([3, 7]);
    expect(guideTonesFlipped.get('pattern')).toEqual([3, 7]);
    expect(guideTonesFlipped.get('flip')).toEqual(true);
});

test('dynamic rule: chordTones', () => {
    /* expect(chordTones.get('drill')).toBe(.6);
    expect(chordTones.get('flip')).toBe(true); */

    chordTones.mutate(() => ({ 'drill': .4 }));

    expect(chordTones.get('drill')).toBe(.4);
    expect(chordTones.get('flip')).toBe(false);

    /*chordTones.mutate({ 'drill': .7 });
    expect(chordTones.get('flip')).toBe(true); */
})
