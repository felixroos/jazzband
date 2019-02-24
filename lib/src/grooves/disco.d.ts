export declare const disco: {
    name: string;
    tempo: number;
    chords: () => (number | number[])[];
    bass: () => number[][];
    kick: () => number[];
    snare: () => (number | (number | number[])[])[];
    hihat: () => (number | number[])[][];
};
