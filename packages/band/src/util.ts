import * as Chord from 'tonal-chord';
import * as Scale from 'tonal-scale';
import * as PcSet from 'tonal-pcset';

export function randomNumber(n) {
    return Math.floor(Math.random() * n)
}

export function arraySum(array) {
    return array.reduce((s, i) => s + i, 0);
}

export function randomElement(array, weighted?) {
    if (!weighted) {
        return array[randomNumber(array.length)];
    }
    const r = randomNumber(arraySum(weighted)) + 1;
    const total = weighted
        .reduce((abs, w, i) => abs.concat(w + (abs.length ? abs[i - 1] : 0)), []);
    return array[total.indexOf(total.find((s, i) => s >= r))];
}


// decides if a one should be played based on last pattern
export function getOne(latest) {
    if (!latest || !latest.length) {
        return 1;
    }
    const zero = latest[latest.length - 1].length === 3 && latest[latest.length - 1][2] !== 0;
    return zero ? 0 : 1;
}



/* getAllInversion(notes) {
    return notes.map((n, i) => TonalArray.rotate(i, notes));
} 
 
getIntervals(notes) {
    return notes.reduce((intervals, note, index) => {
        if (index >= notes.length - 1) {
            return intervals;
        }
        intervals.push(Distance.interval(note, notes[index + 1]));
        return intervals;
    }, []);
}
 
invert(notes, times) {
    return TonalArray.rotate(times,
        notes.map((note, index) => index < times ? Distance.transpose(note, 'P8') : note))
}
*/

export function getTonalChord(chord) {
    chord = chord
        .replace('-', 'm')
        .replace('^', 'M')
        .replace('h7', 'm7b5')
        .replace('h', 'dim');
    /**
     * Chords that dont work:
     * slash cords are ignored
     * 7b9b5 does not work
     * 
     */
    const tokens = Chord.tokenize(chord);
    const s = tokens[1].split('/');
    return tokens[0] + (s[0] || 'M');
}

/* export const chordScales = name => {
    const isSuperset = PcSet.isSupersetOf(Chord.intervals(name));
    //return Scale.names().filter(name => isSuperset(Scale.intervals(name)));
    return Scale.names().filter(name => PcSet.isSupersetOf(Scale.intervals(name)));
};

export const scaleChords = name => {
    const isSubset = PcSet.isSubsetOf(Scale.intervals(name));
    return Chord.names().filter(name => isSubset(Chord.intervals(name)));
}; */

export function getChromas(root, scales) {
    return scales.map(scale => PcSet.chroma(Scale.notes(root, scale)));
}

/* export function matchChordScales(...chords) {
    const scales = chords
        .map(chord => getTonalChord(chord))
        .map(chord => chordScales(chord));

    const chromas = chords
        .map(chord => getTonalChord(chord))
        .map(chord => [
            ...new Set(getChromas(Chord.tokenize(chord)[0], chordScales(chord)))
        ]);
    const combined = chromas.reduce((a, current) => a.concat(current, []));
    const shared = [
        ...new Set(
            combined.filter(chroma => {
                return combined.filter(c => c === chroma).length > 1; // check if there is at least one overlap
            })
        )
    ]
        .sort()
        .filter(chroma => chroma.indexOf(0) !== -1); // omit chromatic scale:
    const colors = shared.map(chroma =>
        new Array(3)
            .fill(0)
            .map((digit, index) =>
                (parseInt(chroma.slice(index * 4, index * 4 + 4), 2) * 17).toString(16)
            )
            .join('')
    );

    const material = shared.map(chroma =>
        Note.names(' b').filter((note, index) => chroma[index] === '1')
    );
    return { chords, scales, chromas, shared, colors, material };
} */