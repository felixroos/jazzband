export declare const swing: {
    name: string;
    tempo: number;
    chords: ({ measure, settings }: {
        measure: any;
        settings: any;
    }) => any;
    bass: () => any;
    crash: ({ measures, index }: {
        measures: any;
        index: any;
    }) => number[];
    ride: ({ measures, index }: {
        measures: any;
        index: any;
    }) => any;
    hihat: () => number[];
    solo: () => any;
};
