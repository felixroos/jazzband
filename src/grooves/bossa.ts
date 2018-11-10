import { randomElement } from "../util";

const off = () => randomElement([0, [0, 1]], [6, 1]);
const eightFour = () => randomElement(
    [[1, 1], 1],
    [2, 1]
);
const eightOff = () => randomElement(
    [[1, 1], [0, 1]],
    [2, 1]
);
const halfTriplet = () => randomElement(
    [[2, 0], [[2, 0, 2], [0, 2, 0]]],
    [2, 1]
);

const one = (v = 1) => randomElement([0, v]);

export const bossa = {
    chords: ({ measure, settings }) => {
        return randomElement([
            /* [1, 1, [0, 1], [0, 3]] */
            [1, [0, 1], 0, [0, 3]],
            [one(), [0, 3], 0, [0, 1]],
            [one(), [0, 1], [0, 3], 0],
            [one(), [0, 3], [0, 1], 0]
        ])
    },
    bass: () =>
        [1, [0, 3], 0, randomElement([0, 1])],
    rimshot: ({ measure, settings }) => {
        return [0, .8, 0, 0]
    },
    ride: ({ measures, index }) => {
        return randomElement([
            [[one(.6), .9, [.4, .5], [0, .8]]],
            [[0, .9, [.4, .5], [one(.6), .8]]],
        ])
    },
    hihat: () => [0, .8, 0, 1],
    solo: () => randomElement([
        [eightFour(), eightFour(), eightFour(), eightFour()],
        [eightFour(), 2, 0, eightFour()],
        [0, 0, eightFour(), eightOff()],
        [[1, 4], 0, eightFour(), eightFour()],
        [4, 0, 0, 0],
        [...halfTriplet(), ...halfTriplet()],
        [eightOff(), eightOff(), eightOff(), eightOff()],
    ])
};