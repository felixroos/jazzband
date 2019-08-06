export const comping = {
  freddyGreen: [1, 1, 1, 1],
  four: [4, 0, 0, 0],
  two: [2, 0, 2, 0],
  charlestonOn: [[3, 0], [0, 1], 0, 0],
  charlestonOff: [[0, 3], 0, [1, 0], 0],
  eightFourEight: [[1, 0.8], [0, 1], 0, 0],
  fourEightEight: [1, [1, 0.8], 0, 0],
  twoOffFourOff: [0, [0, 1], 0, [0, 1]],
  oneOffThreeOff: [[0, 1], 0, [0, 1], 0],
  dottedQuarters1: [[3, 0], [0, 3], 0, [2, 0]],
  dottedQuarters2: [[0, 3], 0, [2, 0], [0, 3]],
  dottedQuarters3: [0, [3, 0], [0, 1], 0],
  dottedQuarters4: [[3, 0], [0, 3], 0, 0],
  twoFour: [0, 1, 0, 1],
  twoOffFour: [0, [0, 1], 0, 1],
  threeThreeTwo: [[3, 0], [0, 3], 0, [1, 0]]
};

export const walking = {
  chordUp3: [1, 3, 5, 8],
  chordUp7: [1, 5, 7, 8],
  chordDown3: [8, 5, 3, 1],
  chordDown7: [8, 7, 5, 1],
  chordUpDown3: [1, 5, 3, 1],
  /* chordDownUp7: [8, 1, 5, 7], */
  chordDownUp3: [8, 3, 5, 1]
};

export const walkingFour = [
  walking.chordUp3,
  walking.chordDown3,
  walking.chordUpDown3,
  walking.chordDownUp3
  /* walking.chordUp7,
  walking.chordDown7,
  walking.chordDownUp7, */
];

export const compingCombos = [
  /* [
    comping.freddyGreen,
    comping.freddyGreen,
    comping.freddyGreen,
    comping.freddyGreen
  ], */
  [comping.four],
  [comping.two],
  /* [comping.eightFourEight], // TODO: fix duration of notes before swing offs (gap)
  [comping.fourEightEight], */
  [comping.oneOffThreeOff],
  /* [comping.twoOffFourOff], */
  [comping.twoFour],
  [comping.charlestonOn],
  [comping.charlestonOff],
  [comping.charlestonOn, comping.charlestonOff],
  [
    comping.dottedQuarters1,
    comping.dottedQuarters2,
    comping.dottedQuarters3,
    comping.dottedQuarters4
  ],
  [comping.twoOffFourOff, comping.twoFour],
  [comping.twoOffFour, comping.twoOffFour],
  [comping.threeThreeTwo, comping.threeThreeTwo]
];
