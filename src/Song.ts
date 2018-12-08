export type Measure = {
    chords?: string[],
    //voices?: string[][],
    signs?: string[],
    comments?: string[],
    house?: number,
    section?: string,
    idle?: true // bar is repeated
}// | string[];

export type Sheet = Array<Measure | string[] | string>;

export type Song = {
    name: string,
    composer?: string,
    style?: string,
    bpm?: number,
    repeats?: number,
    key?: string,
    sheet: Sheet
}

export function getMeasure(measure: Measure | string[] | string): Measure {
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

export function getLatestMeasure(index, sheet) {
    const m = getMeasure(sheet[index]);
    if (m.chords[0] === 'x') {
        return getLatestMeasure(index - 1, sheet);
    }
    return m;
}

export function renderSheet(sheet: Sheet, current?) { //unify = false,
    current = Object.assign({
        index: 0, // index of current sheet measure
        measures: [], // resulting measures
        openRepeats: [], // opened repeat start indices
        repeated: [], // already repeated end indices
        end: sheet.length - 1, // last index that should be rendered
        house: 0, // latest housenumber
        houseStart: 0, // where did the latest N1 start?
        houses: {} // house targets of repeatStart indices
    }, current);

    while (current.index <= current.end) {
        // const measure = sheet[current.index];
        let m = getMeasure(sheet[current.index]);
        const signs = m.signs || [];
        //console.log(`${current.index}/${current.end}`, measure['chords'], `${current.house}/${JSON.stringify(current.targets)}`);

        const repeatStart = signs.includes('{');
        if (repeatStart) {
            current.openRepeats.unshift(current.index);
        }

        if (m.house) {
            current.house = m.house;
            if (m.house === 1) { // remember where it started..
                current.houseStart = current.openRepeats[0] || 0;
            }
        }

        const skip = current.house && current.houses[current.houseStart] && current.house !== current.houses[current.houseStart];
        if (!skip) {
            current.measures.push(m);
            const repeatEnd = signs.includes('}') && !current.repeated.includes(current.index);// && !current.repeatedEnds[current.index]; // TODO: support repeat n times

            if (repeatEnd) {
                const jumpTo = current.openRepeats[0] || 0;
                current.openRepeats.shift();
                current.houses[jumpTo] = (current.houses[jumpTo] || 1) + 1;

                current.measures = current.measures.concat(
                    renderSheet(sheet, {
                        index: jumpTo,
                        repeated: [current.index],
                        end: current.index,
                        houses: {
                            [jumpTo]: current.houses[jumpTo]
                        }
                    })
                );
            }
        }
        current.index += 1;
    }
    return current.measures;
}
