import { Voicing } from '../harmony/Voicing';
import { util } from '..';
import { Chord } from 'tonal';
import { Permutation } from '../util/Permutation';
import { Harmony } from '../harmony/Harmony';
import { Distance } from 'tonal';

test('Voicing.getAllNoteSelections', () => {
    expect(Voicing.getAllNoteSelections('C', 1)).toEqual([['E']]);

    expect(Voicing.getAllNoteSelections('C7', 2)).toEqual([['E', 'Bb']])
    expect(Voicing.getAllNoteSelections('C7', 3))
        .toEqual([
            ['E', 'Bb', 'C'],
            ['E', 'Bb', 'G']
        ]);
    expect(Voicing.getAllNoteSelections('C7', 4))
        .toEqual([
            ['E', 'Bb', 'C', 'G']
        ]);
    expect(Voicing.getAllNoteSelections('C7', 5))
        .toEqual([
            ['E', 'Bb', 'C', 'G']
        ]);
});

test('Voicing.getAllVoicePermutations', () => {

    expect(Voicing.getRequiredNotes('C')).toEqual(['E']);
    expect(Voicing.getAllNoteSelections('C', 1)).toEqual([['E']]);

    expect(Voicing.getAllVoicePermutations('C', 1)).toEqual([
        ['E'],
    ]);

    expect(Voicing.getAllNoteSelections('C7', 1)).toEqual([['E'], ['Bb']])

    expect(Voicing.getVoicePermutations(['E'])).toEqual([['E']]);

    expect(Voicing.getAllVoicePermutations('C7', 1)).toEqual([
        ['E'],
        ['Bb'],
    ]);
    expect(Voicing.getAllVoicePermutations('C', 2)).toEqual([
        ['C', 'E'],
        ['E', 'G'],
    ]);
    expect(Voicing.getOptionalNotes('C')).toEqual(['C', 'G']);

    expect(Voicing.getAllVoicePermutations('C', 3)).toEqual([
        ['E', 'G', 'C'],
        ['C', 'E', 'G'],
        ['G', 'C', 'E'],
    ]);

    expect(Voicing.getAllVoicePermutations('C7', 2)).toEqual([
        ['E', 'Bb'],
        ['Bb', 'E'],
    ]);

    expect(Voicing.getAllVoicePermutations('C7', 3)).toEqual([
        ['E', 'Bb', 'C'],
        ['C', 'E', 'Bb'],
        ['E', 'G', 'Bb'],
        ['Bb', 'E', 'G'],
        ['G', 'Bb', 'E']
    ]);

    expect(Voicing.getAllVoicePermutations('C7', 4)).toEqual([
        ['E', 'G', 'Bb', 'C'],
        ['Bb', 'E', 'G', 'C'],
        ['C', 'E', 'G', 'Bb'],
        ['G', 'Bb', 'C', 'E'],
        ['G', 'C', 'E', 'Bb']
    ]);

    expect(Voicing.getAllVoicePermutations('C7', 4, { minTopDistance: 3 })).toEqual([
        ['Bb', 'E', 'G', 'C'],
        ['C', 'E', 'G', 'Bb'],
        ['G', 'Bb', 'C', 'E'],
        ['G', 'C', 'E', 'Bb']
    ]);

    expect(Voicing.getAllVoicePermutations('C7', 4, { minTopDistance: 3, maxDistance: 6 })).toEqual([
        ['Bb', 'E', 'G', 'C'],
        ['C', 'E', 'G', 'Bb'],
        ['G', 'Bb', 'C', 'E'],
        ['G', 'C', 'E', 'Bb']
    ]);

    expect(Voicing.getAllVoicePermutations('C7', 4, { maxDistance: 7 })).toEqual([
        ['E', 'Bb', 'C', 'G'],
        ['E', 'G', 'Bb', 'C'],
        ['Bb', 'E', 'G', 'C'],
        ['C', 'E', 'G', 'Bb'],
        ['C', 'G', 'Bb', 'E'],
        ['G', 'Bb', 'C', 'E'],
        ['G', 'C', 'E', 'Bb']
    ]);
});

test('Voicing.getAvailableTensions', () => {
    expect(Voicing.getAvailableTensions('C')).toEqual(['D', 'F#', 'A']);
    expect(Voicing.getAvailableTensions('C^7')).toEqual(['D', 'F#', 'A']);
    expect(Voicing.getAvailableTensions('C^13')).toEqual(['D', 'F#', 'A']);
    expect(Voicing.getAvailableTensions('C-7')).toEqual(['D', 'F', 'A']);
    expect(Voicing.getAvailableTensions('D-7')).toEqual(['E', 'G', 'B']);
    expect(Voicing.getAvailableTensions('C-11')).toEqual(['D', 'F', 'A']);
    expect(Voicing.getAvailableTensions('C-7b5')).toEqual(['D', 'F', 'Ab']);
    expect(Voicing.getAvailableTensions('C-^7')).toEqual(['D', 'F', 'A']);
    expect(Voicing.getAvailableTensions('C^7#5')).toEqual(['D', 'F#']);
    expect(Voicing.getAvailableTensions('Co7')).toEqual(['D', 'F', 'Ab', 'B']);
    expect(Voicing.getAvailableTensions('C^7#5')).toEqual(['D', 'F#']);
    expect(Voicing.getAvailableTensions('C7')).toEqual(['Db', 'D', 'D#', 'F#', 'Ab', 'A']);
    expect(util.isDominantChord('C7sus')).toBe(true);
    expect(util.getDegreeInChord(4, 'C7sus')).toBe('F');
    expect(Chord.notes('C7sus')).toEqual(['C', 'F', 'G', 'Bb']);
    expect(Voicing.getAvailableTensions('C7sus4')).toEqual(['Db', 'D', 'D#', 'E', 'Ab', 'A']);
    expect(Voicing.getAvailableTensions('C7#5')).toEqual(['Db', 'D', 'D#', 'F#', 'A']);
});
test('Voicing.getRequiredNotes', () => {
    /* expect(Voicing.getRequiredNotes('C7#9#5')).toEqual(['E', 'Bb', 'D#']); */
    expect(Voicing.getRequiredNotes('C^7')).toEqual(['E', 'B']);
    expect(Voicing.getRequiredNotes('C7')).toEqual(['E', 'Bb']);
    expect(Voicing.getRequiredNotes('C7sus')).toEqual(['Bb', 'F']);
    expect(Voicing.getRequiredNotes('C')).toEqual(['E']);
    expect(Voicing.getRequiredNotes('D-')).toEqual(['F']);
    expect(Voicing.getRequiredNotes('D-7')).toEqual(['F', 'C']);
    expect(Voicing.getRequiredNotes('D-11')).toEqual(['F', 'C', 'G']);
    expect(Chord.notes('C13')).toEqual(['C', 'E', 'G', 'Bb', 'D', 'A']);
    expect(Voicing.getRequiredNotes('C13')).toEqual(['E', 'Bb', 'A']);
    expect(Voicing.getRequiredNotes('C6')).toEqual(['E', 'A']);
    expect(Voicing.getRequiredNotes('Ch7')).toEqual(['Eb', 'Bb', 'Gb']);
    expect(Voicing.getRequiredNotes('Ebo')).toEqual(['Gb', 'Bbb']);
    expect(Voicing.getRequiredNotes('G')).toEqual(['B']);
    expect(Harmony.getTonalChord('F69')).toBe('FM69');
    expect(Harmony.getTonalChord('FM69')).toBe('FM69');
    expect(Chord.intervals('FM69')).toEqual(['1P', '3M', '5P', '6M', '9M']);
    expect(util.findDegree(3, ['1P', '3M', '5P', '6M', '9M'])).toBe('3M');
    expect(Chord.tokenize('FM69')[0]).toEqual('F');
    expect(Distance.transpose('F', '3M')).toBe('A');
    expect(util.getDegreeInChord(3, 'FM69')).toBe('A');
    expect(Voicing.getRequiredNotes('F69')).toEqual(['A', 'D', 'G']);
});

test('Voicing.getOptionalNotes', () => {
    expect(Voicing.getOptionalNotes('C^7')).toEqual(['C', 'G']);
    expect(Voicing.getOptionalNotes('C7')).toEqual(['C', 'G']);
    expect(Voicing.getOptionalNotes('C7sus')).toEqual(['C', 'G']);
    expect(Voicing.getOptionalNotes('C')).toEqual(['C', 'G']);
    expect(Voicing.getOptionalNotes('D-')).toEqual(['D', 'A']);
    expect(Voicing.getOptionalNotes('G-')).toEqual(['G', 'D']);
    expect(Voicing.getOptionalNotes('D-7')).toEqual(['D', 'A']);
    expect(Voicing.getOptionalNotes('D-11')).toEqual(['D', 'A', 'E']);
    expect(Chord.notes('C13')).toEqual(['C', 'E', 'G', 'Bb', 'D', 'A']);
    expect(Voicing.getOptionalNotes('C13')).toEqual(['C', 'G', 'D']);
    expect(Voicing.getOptionalNotes('C6')).toEqual(['C', 'G']);
    expect(Voicing.getOptionalNotes('Ch7')).toEqual(['C']);

    expect(Voicing.getOptionalNotes('G')).toEqual(['G', 'D']);
});

/* test('Voicing.getVoices', () => {

    expect(Voicing.getRequiredNotes('D-6')).toEqual(['F', 'B']);
    expect(Voicing.getOptionalNotes('D-6')).toEqual(['D', 'G', 'A']);
    expect(Voicing.getVoices('D-6', 4, true, 0)).toEqual(['F', 'B', 'G', 'A']);

    expect(Voicing.getVoices('D-7', 4, false, 0)).toEqual(['F', 'C', 'D', 'A']);
    expect(Voicing.getVoices('D-7', 4, true, 1)).toEqual(['F', 'C', 'E', 'A']);
    expect(Voicing.getVoices('C7', 4, false, 0)).toEqual(['E', 'Bb', 'C', 'G']);
    // TODO: make 13 be the first tension choice..
    expect(Voicing.getVoices('C7', 4, false, 1)).toEqual(['E', 'Bb', 'Db', 'C']);
    expect(Voicing.getVoices('C7', 4, true, 1)).toEqual(['E', 'Bb', 'Db', 'G']);
    expect(Voicing.getVoices('C7', 4, true, 0)).toEqual(['E', 'Bb', 'C', 'G']);

    expect(Voicing.getVoices('Dh7', 4, false, 1)).toEqual(['F', 'C', 'Ab', 'E']);
    expect(Voicing.getVoices('Dh7', 4, true, 1)).toEqual(['F', 'C', 'Ab', 'E']); // root stays because b5 needs root!

    expect(Voicing.getVoices('G', 4, false, 0)).toEqual(['B', 'G', 'D', 'B']);
    expect(Voicing.getVoices('D-7', 3, false, 0)).toEqual(['F', 'C', 'D']);
    expect(Voicing.getVoicePermutations(['F', 'C', 'D'])).toEqual([]);

    // C7b9#5 hat keine kombi !?!? E7#9#5 auch nicht?!
    // A7b9b5 auch nettttttt
    // Ebm6 hat auch wenig
    // D13sus hat auch wenig..
    // A9#11 auch
    // hat nur eine kombination...
    // expect(Voicing.getVoicePermutations(['C', 'E', 'Bb', 'Db'])).toEqual([['C', 'E', 'Bb', 'Db']]);

    // B7b9b5
    // A-9 ???
    // D7b9 hat nur eine kombination!? (Siehe You Won't Forget Me)

}); */


test('voicingIntervals', () => {
    expect(Voicing.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toEqual(['1P', '-1A', '1P']);
    expect(Voicing.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G'], false)).toEqual(['1P', '8d', '1P']);
    expect(Voicing.voicingIntervals(['C', 'E3', 'G'], ['C', 'Eb3', 'G'])).toEqual(['1P', '-1A', '1P']);
    expect(Voicing.voicingIntervals(['C', 'E3', 'G'], ['C', 'Eb2', 'G'])).toEqual(['1P', '-8A', '1P']);
    expect(Voicing.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G', 'Bb'])).toEqual(['1P', '-1A', '1P']);
    /* expect(Voicing.voicingIntervals(['C', 'E', 'G', 'B'], ['C', 'Eb', 'G'])).toEqual(['1P', '-2m', '1P', null]); */
});
test('Voicing.getVoicePermutations', () => {

    // this is just sugar for permutationComplexity with voicing validator
    expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'])).toEqual(
        [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A'], ['E', 'A', 'C', 'F']]
    );
    expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'], { topNotes: ['A', 'E'] })).toEqual(
        [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A']]
    );
    expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'], { bottomNotes: ['E'] }))
        .toEqual([['E', 'A', 'C', 'F']]);

    expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'], { bottomNotes: ['A'], minTopDistance: 0 }))
        .toEqual([['A', 'C', 'E', 'F']]);

    expect(Voicing.getVoicePermutations(['B', 'D', 'F', 'A'])).toEqual(
        [['B', 'D', 'F', 'A'],
        ['B', 'F', 'A', 'D'],
        ['D', 'F', 'A', 'B'],
        ['F', 'A', 'B', 'D'],
        ['A', 'D', 'F', 'B'],
        ]);

    expect(Voicing.getVoicePermutations(['E', 'G', 'C'])).toEqual(
        [['E', 'G', 'C'], ['G', 'C', 'E'], ['C', 'E', 'G']]
    );
    expect(Permutation.permutateElements(['E', 'G', 'C'],
        Voicing.voicingValidator({
            maxDistance: 6
        }))
    ).toEqual(
        [['E', 'G', 'C'], ['G', 'C', 'E'], ['C', 'E', 'G']]
    );
});



test('isRootless', () => {
    expect(Voicing.hasTonic(['E', 'G', 'Bb'], 'C7')).toBe(false);
    expect(Voicing.hasTonic(['C', 'E', 'Bb'], 'C7')).toBe(true);
    expect(Voicing.hasTonic(['D', 'F#', 'A'], 'D')).toBe(true);
    expect(Voicing.hasTonic(['D2', 'F#2', 'A2'], 'D7')).toBe(true);
    expect(Voicing.hasTonic(['D2', 'F#2', 'A2'], 'E7')).toBe(false);
});

test('getNextVoicing', () => {
    /* expect(getNextVoicing('C-7', ['D4', 'F4', 'A4', 'C5'])).toEqual(['Bb3', 'Eb4', 'G4', 'C5']); */
    /* expect(getNextVoicing('C-7', ['A3', 'C4', 'D4', 'F4'])).toEqual(['G3', 'Bb3', 'C4', 'Eb4']); */
    expect(Voicing.getNextVoicing('G', ['C4', 'E4', 'G4'])).toEqual(['B3', 'D4', 'G4']);
    /* let voicing;
    let times = 5;
    for (let i = 0; i < times; ++i) {
        Note.names(' ').concat(['C']).forEach(note => {
            voicing = getNextVoicing(note + '-7', voicing, ['F3', 'C5']);
        });
    }  */
});



/* test('bestCombination', () => {
    const c = [['C', 'E', 'G'], ['E', 'G', 'C'], ['G', 'C', 'E']];
    const g = [['G', 'B', 'D'], ['B', 'D', 'G'], ['D', 'G', 'B']];
    expect(Voicing.getVoicePermutations(['C', 'E', 'G'])).toEqual(c);
    expect(Voicing.getVoicePermutations(['G', 'B', 'D'])).toEqual(g);
    expect(bestCombination(c[0], g)).toEqual(g[1]);
    expect(bestCombination(c[1], g)).toEqual(g[2]);
    expect(bestCombination(c[2], g)).toEqual(g[0]);

    const dmin = [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A'], ['E', 'A', 'C', 'F']];
    const g7 = [['B', 'D', 'F', 'A'], ['B', 'F', 'A', 'D'], ['F', 'A', 'B', 'D'], ['A', 'D', 'F', 'B']]
    expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'])).toEqual(dmin);
    expect(Voicing.getVoicePermutations(['B', 'D', 'F', 'A'])).toEqual(g7);

    expect(bestCombination(dmin[0], g7)).toEqual(['F', 'A', 'B', 'D']);
    expect(bestCombination(dmin[1], g7)).toEqual(['B', 'D', 'F', 'A']);
    expect(bestCombination(dmin[2], g7)).toEqual(['F', 'A', 'B', 'D']);

    expect(bestCombination(dmin[0], g7)).toEqual(['F', 'A', 'B', 'D']);
}); */


/* 
test('voicingDifference', () => {
    expect(Voicing.voicingDifference(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toBe(1);
    expect(Voicing.voicingDifference(['C', 'E', 'G'], ['D', 'F#', 'A'])).toBe(6);
    expect(Voicing.voicingDifference(['C', 'E', 'G'], ['E', 'G#', 'B'])).toBe(12);
    expect(Voicing.voicingDifference(['C', 'E', 'G', 'B'], ['C', 'Eb', 'G'])).toEqual(1);
});

test('voicingMovement', () => {
    expect(Voicing.voicingMovement(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toBe(-1);
    expect(Voicing.voicingMovement(['C', 'E', 'G'], ['D', 'F#', 'A'])).toBe(6);
    expect(Voicing.voicingMovement(['C', 'E', 'G'], ['B', 'E', 'G#'])).toBe(0);
    expect(Voicing.voicingMovement(['F#', 'A#', 'C#'], ['C', 'E', 'G'])).toBe(18);
    expect(Voicing.voicingMovement(['C', 'E', 'C'], ['E', 'C', 'C'])).toBe(0);
    expect(Voicing.voicingMovement(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(-3);
    expect(Voicing.voicingMovement(['C', 'E', 'F', 'A'], ['B', 'D', 'F', 'A'])).toBe(-3);
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['A', 'D', 'F', 'B'])).toBe(21);
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['B', 'F', 'A', 'D'])).toBe(-15);

    expect(Voicing.voicingMovement(['D2', 'F2', 'A2'], ['D3', 'F3', 'A3'], false)).toBe(36);

});

test('voicingMovement #2', () => {
    expect(Voicing.voicingMovement(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(-3); // A -> E
    expect(Voicing.voicingDifference(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(3);
    expect(Voicing.voicingMovement(['C', 'E', 'F', 'A'], ['B', 'D', 'F', 'A'])).toBe(-3); // B -> D
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['A', 'D', 'F', 'B'])).toBe(21);
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['B', 'F', 'A', 'D'])).toBe(-15);
    expect(Voicing.voicingMovement(['F', 'A', 'C', 'E'], ['B', 'F', 'A', 'D'])).toBe(-3);
    expect(Voicing.voicingDifference(['F', 'A', 'C', 'E'], ['B', 'F', 'A', 'D'])).toBe(15);
});

*/
