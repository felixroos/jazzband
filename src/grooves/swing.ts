import { randomElement } from "../util";

export const swing = {
    chords: ({ measure, settings }) => {
        const off = () => randomElement([0, [0, 0, 2]], [6, 1]);
        const r = Math.random() > 0.5 ? .6 : 0;
        const t = `${settings.cycle}/${measure.length}`;
        if (t === '4/1') {
            return randomElement([
                [[1, 0], [0, 0, 7], 0, 0],
                [1, [0, 0, 2], 0, off()],
                [[0, 0, 1], 0, 2, 0],
                [[0, 0, 4], 0, 1, 0],
                [2, 0, 0, 0],
                [3, 0, 0, 0],
                [1, 0, r, off()],
                [[0, 0, 2], 0, r, 0],
                [1.5, [0, 0, 2], 0, off()],
            ]);//, [2, 1, 1]
        }
        if (t === '4/2') {
            return randomElement([
                [[1, 0], [0, 0, 7], 0, 0],
                [1, [0, 0, 2], 0, 0],
                [1, 0, 2, 0],
                [2, 0, 1, 0],
                [1, 0, .7, off()],
                [[1, 0, 0], 0, .7, off()],
                [[4, 0, 0], [0, 0, 2.8], 0, off()],
            ]);
        }

        if (t === '4/3') {
            return [1, [0, 0, 2], [0, 0, 4], 0];
        }
        if ('4/4') {
            return randomElement([
                [1, 1, 1, 1],
                [[1, 0, 2], [0, 0, 2], 0, 1]
            ]);
        }
    },
    bass: () => randomElement([
        [1, 1, 1, 1],
    ]),
    crash: ({ measures, index }) => {
        const fill = index !== 0 && index % measures.length === 0;
        if (fill) {
            return [4, 0, 0, 0];
        }
        return [0, 0, 0, 0];
    },
    ride: ({ measures, index }) => {
        return randomElement([
            [.6, [.9, 0, 1], .6, [.9, 0, 1]],
            [.6, [.4, 0, 1], .8, [0, 0, 1],],
            [.6, .9, [.6, 0, 1], 1],
            [.6, .9, .6, [.9, 0, 1]],
        ], [3, 2, 1, 2])
    },
    hihat: () => [0, .8, 0, 1]
};