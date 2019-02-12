/*
TODO:

more typings
special sections:
IN: only play the first time
CODA: only play last time

test standards:
- Alice in Wonderland (dc al 2nd ending)
- All or Nothing at All (dc al coda)
- Are you real (intro + coda)
- Armageddon (intro)
- The Bat (coda sign inside repeat): ireal plays coda directly first time..
- Bennys Tune (intro+coda sign inside repeat): ireal plays coda directly first time..
- Bess You Is My Woman (coda sign inside repeat): ireal plays coda directly first time..
- Blessed Relief (nested repeats, with odd behaviour)
- Blue in Green (coda)
*/

export type Measure = {
    chords?: string[],
    //voices?: string[][],
    signs?: string[],
    comments?: string[],
    house?: number | number[],
    times?: number,
    section?: string,
    idle?: true // bar is repeated
}// | string[];

export type MeasureOrString = Measure | string[] | string;

export type Sheet = Array<MeasureOrString>;

export type Song = {
    name: string,
    composer?: string,
    style?: string,
    bpm?: number,
    repeats?: number,
    key?: string,
    sheet: Sheet
}

export type JumpSign = {
    pair?: string,
    move?: number,
    fine?: boolean,
    validator?: (state) => boolean,
}

export type SheetState = {
    measures?: [],
    index?: number,
    sheet?: Sheet,
    jumps?: { [key: number]: number },
    visits?: { [key: number]: number },
    nested?: boolean,
    fallbackToZero?: boolean
}

export function getMeasure(measure: MeasureOrString): Measure {
    if (typeof measure === 'string') {
        return {
            chords: [measure]
        }
    }
    if (Array.isArray(measure)) {
        return {
            chords: [].concat(measure)
        }
    }
    return Object.assign({}, measure);
    // return measure;
}

/** renderSheet2 */

export function hasSign(sign, measure): boolean {
    measure = getMeasure(measure);
    return !!measure.signs && measure.signs.includes(sign);
}


export function hasHouse(measure, number?): boolean {
    measure = getMeasure(measure);
    let { house } = measure;
    if (!house) {
        return false;
    } else if (number === undefined) {
        return true;
    }
    if (!Array.isArray(house)) {
        house = [house];
    }
    return house.includes(number);
}

/** Starts at a given index, stops when the pair functions returned equally often */
export function findPair(
    sheet,
    index: number,
    pairs: Array<(measure?: Measure, options?: { sheet?: Sheet, index?: number }) => boolean>,
    move = 1,
    stack = 0): number {
    let match = -1; // start with no match
    while (match === -1 && index >= 0 && index < sheet.length) {
        if (pairs[0](sheet[index], { sheet, index })) { // same sign
            stack++;
        }
        if (pairs[1](sheet[index], { sheet, index })) { // pair sign
            stack--;
        }
        if (stack === 0) { // all pairs resolved > match!
            match = index;
        } else {
            index += move;
        }
    }
    return match;
}

export function getJumpSign(measure): JumpSign {
    const signs = (getMeasure(measure).signs || [])
        .filter(s => Object.keys(jumpSigns).includes(s));
    if (signs.length > 1) {
        console.warn('measure cannot contain more than one repeat sign', measure);
    }
    return jumpSigns[signs[0]];
}

// simple matching for brace start, ignores nested repeats
export function getJumpDestination(state: SheetState): number {
    let { sheet, index, fallbackToZero, nested } = state;
    const sign = getJumpSign(sheet[index]);
    // if fine > jump till end
    if (sign.fine) { return sheet.length; }
    // if no pair given => da capo
    if (!sign.pair) { return 0; }
    // if nested mode on and opening brace is searched, use getBracePair..
    if (nested !== false && sign.pair === '{') {
        return getBracePair({ sheet, index, fallbackToZero });
    }
    const destination = findPair(sheet, index,
        [
            (m, step) => step.index === index,
            (m) => hasSign(sign.pair, m),
        ]
        , sign.move || -1); // default move back
    if (fallbackToZero) {
        // default to zero when searching repeat start (could be forgotten)
        return destination === -1 ? 0 : destination;
    }
    return destination;
}

// returns the index of the repeat sign that pairs with the given index
export function getBracePair(
    { sheet, index, fallbackToZero }: { sheet: Sheet, index: number, fallbackToZero?: boolean }
): number {
    if (fallbackToZero === undefined) {
        fallbackToZero = true;
    }
    if (hasSign('{', sheet[index])) {
        return findPair(sheet, index,
            [
                (m) => hasSign('{', m),
                (m) => hasSign('}', m),
            ]
            , 1);
    } else if (hasSign('}', sheet[index])) {
        const pair = findPair(sheet, index,
            [
                (m, state) => {
                    // this logic could be infinitely complex, having many side effects and interpretations
                    // the current behaviour is similar to musescore or ireal handling braces
                    if (!hasSign('}', m)) {
                        return false;
                    }
                    if (index === state.index) {
                        return true;
                    }
                    const relatedHouse = getRelatedHouse({ sheet, index: state.index });
                    return relatedHouse === -1;
                },
                (m) => hasSign('{', m)
            ]
            , -1);
        if (fallbackToZero) {
            return pair === -1 ? 0 : pair; // default to zero when searching repeat start (could be forgotten)
        }
        return pair;
    }
    return -1;
}

// returns true if the house at the given index has not been visited enough times
export function canVisitHouse({ sheet, index, visits }): boolean {
    let houses = sheet[index].house;
    if (houses === undefined) {
        return false;
    }
    if (!Array.isArray(houses)) {
        houses = [houses];
    }
    const visited = visits[index] || 0;
    return visited < houses.length
}

// returns the next house that can be visited (from the given index)
export function getNextHouseIndex({ sheet, index, visits }, move = 1): number {
    return findPair(sheet, index,
        [
            (m, step) => index === step.index,
            (m, step) => hasHouse(m) && canVisitHouse({ sheet, index: step.index, visits })
        ], move);
}

// moves the index to the current house (if any)
export function visitHouses({ sheet, index, visits }): SheetState {
    if (!hasHouse(sheet[index], 1)) {
        return {};
    }
    let next = getNextHouseIndex({ sheet, index, visits });
    if (next === -1) {
        next = index;
        visits = {}; // reset visits
    }
    return {
        visits: {
            ...visits,
            [next]: (visits[next] || 0) + 1
        },
        index: next
    }
}

// wipes all keys in the given range
export function wipeKeys(numberMap, range): { [key: number]: number } {
    const wiped = {};
    Object.keys(numberMap)
        .map(i => parseInt(i))
        .filter(i => i < range[0] || i > range[1])
        .forEach(i => wiped[i] = numberMap[i]);
    return wiped;
}

export function nextIndex(state): SheetState {
    let { sheet, index, jumps, nested, fallbackToZero } = state;
    if (!shouldJump({ sheet, index, jumps })) {
        return {
            index: index + 1
        };
    }
    const braces = [getJumpDestination({ sheet, index, fallbackToZero, nested }), index];
    jumps = wipeKeys(jumps, [braces[0], braces[1] - 1]); // wipes indices inside braces
    return {
        index: braces[0],
        jumps: { // count jumps up
            ...jumps,
            [braces[1]]: (jumps[braces[1]] || 0) + 1
        }
    }
}

export function getRelatedHouse({ sheet, index }): number {
    const latestHouse = findPair(sheet, index,
        [
            (m, state) => index === state.index || hasSign('}', m),
            (m) => hasHouse(m)
        ], -1);
    return latestHouse;
}

export function isFirstHouse({ sheet, index }): boolean {
    return hasHouse(sheet[index], 1);
}

export function getAllowedJumps({ sheet, index }) {
    if (!hasJumpSign(sheet[index])) {
        return 0;
    }
    const measure = getMeasure(sheet[index]);
    if (measure.times !== undefined) {
        return measure.times;
    }
    return 1;
}

export function readyForFineOrCoda({ sheet, index, jumps }): boolean {
    const signs = Object.keys(jumpSigns)
        .filter(s => s.includes('DC') || s.includes('DS'));
    const backJump = findPair(sheet, index, [
        (m, step) => step.index === index,
        (m) => signs.reduce((match, sign) => match || hasSign(sign, m), false)
    ]);
    return jumps[backJump] > 0;
}

export const jumpSigns: { [sign: string]: JumpSign } = {
    '}': { pair: '{', move: -1 },
    'DC': {},
    'DS': { pair: 'Segno', move: -1 },
    'DS.Fine': { pair: 'Segno', move: -1 },
    'DS.Coda': { pair: 'Segno', move: -1 },
    'DC.Fine': {},
    'DC.Coda': {},
    'Fine': {
        fine: true,
        validator: (state) => readyForFineOrCoda(state)
    },
    'ToCoda': {
        pair: 'Coda', move: 1,
        validator: (state) => readyForFineOrCoda(state)
    }
};

export function hasJumpSign(measure: MeasureOrString): boolean {
    return Object.keys(jumpSigns)
        .reduce((match, current) => match || hasSign(current, measure), false);
}

export function shouldJump({ sheet, index, jumps }: SheetState) {
    if (!hasJumpSign(sheet[index])) {
        return false;
    }
    const sign = getJumpSign(sheet[index]);
    if (sign.validator && !sign.validator({ sheet, index, jumps })) {
        return false;
    }
    const allowedJumps = getAllowedJumps({ sheet, index });
    const timesJumped = jumps[index] || 0;
    return timesJumped < allowedJumps;
}

export function nextMeasure(state): SheetState {
    state = {
        ...state,
        ...visitHouses(state)
    } // moves to the right house (if any)
    let { sheet, index, measures } = state;
    return {
        ...state,
        measures: measures.concat([sheet[index]]),
        ...nextIndex(state),
    }
}

export function renderSheet(sheet, options = {}): Sheet {
    let state: SheetState = {
        measures: [],
        index: 0,
        sheet,
        jumps: {},
        visits: {},
        nested: true,
        fallbackToZero: true,
        ...options
    };
    let runs = 0;
    while (runs < 100 && state.index < sheet.length) {
        runs++;
        state = nextMeasure(state);
    }
    return state.measures/* .map(m => getMeasure(m)) */;
}
