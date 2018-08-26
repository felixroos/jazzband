export type Measure = {
    chords?: string[],
    //voices?: string[][],
    signs?: string[],
    comments?: string[],
    house?: number,
    section?: string
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
            chords: measure
        }
    }
    return measure;
}

export function renderSheet(sheet: Sheet, unify = false, current?) {
    current = Object.assign({
        index: 0, // index of current sheet measure
        measures: [], // resulting measures
        openRepeats: [], // opened repeat start indices
        //closedRepeats: [], // closed repeat start indices
        repeated: [], // already repeated end indices
        end: sheet.length - 1, // last index that should be rendered
        house: 0, // latest housenumber
        houseStart: 0, // where did the latest N1 start?
        houses: {} // house targets of repeatStart indices
    }, current);

    while (current.index <= current.end) {
        const measure = sheet[current.index];
        const m = getMeasure(measure);
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
            if (unify) {
                current.measures.push(
                    Object.assign({ index: current.index }, getMeasure(measure))
                );
            } else {
                current.measures.push(measure);
            }
            const repeatEnd = signs.includes('}') && !current.repeated.includes(current.index);// && !current.repeatedEnds[current.index]; // TODO: support repeat n times

            if (repeatEnd) {
                const jumpTo = current.openRepeats[0] || 0;
                //current.closedRepeats.unshift(current.openRepeats[0]);
                current.openRepeats.shift();
                current.houses[jumpTo] = (current.houses[jumpTo] || 1) + 1;

                current.measures = current.measures.concat(
                    renderSheet(sheet, unify, {
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
