export declare const bossa: {
    name: string;
    tempo: number;
    chords: ({ measure, settings }: {
        measure: any;
        settings: any;
    }) => any;
    bass: () => any[];
    rimshot: ({ measure, settings }: {
        measure: any;
        settings: any;
    }) => number[];
    ride: ({ measures, index }: {
        measures: any;
        index: any;
    }) => any;
    hihat: () => number[];
    solo: () => any;
};
