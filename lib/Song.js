"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getMeasure(measure) {
    if (typeof measure === 'string') {
        return {
            chords: [measure]
        };
    }
    if (Array.isArray(measure)) {
        return {
            chords: [].concat(measure)
        };
    }
    return Object.assign({}, measure);
    // return measure;
}
exports.getMeasure = getMeasure;
function getLatestMeasure(index, sheet) {
    var m = getMeasure(sheet[index]);
    if (m.chords[0] === 'x') {
        return getLatestMeasure(index - 1, sheet);
    }
    return m;
}
exports.getLatestMeasure = getLatestMeasure;
function renderSheet(sheet, current) {
    var _a;
    current = Object.assign({
        index: 0,
        measures: [],
        openRepeats: [],
        repeated: [],
        end: sheet.length - 1,
        house: 0,
        houseStart: 0,
        houses: {} // house targets of repeatStart indices
    }, current);
    while (current.index <= current.end) {
        // const measure = sheet[current.index];
        var m = getMeasure(sheet[current.index]);
        var signs = m.signs || [];
        //console.log(`${current.index}/${current.end}`, measure['chords'], `${current.house}/${JSON.stringify(current.targets)}`);
        var repeatStart = signs.includes('{');
        if (repeatStart) {
            current.openRepeats.unshift(current.index);
        }
        if (m.house) {
            current.house = m.house;
            if (m.house === 1) { // remember where it started..
                current.houseStart = current.openRepeats[0] || 0;
            }
        }
        var skip = current.house && current.houses[current.houseStart] && current.house !== current.houses[current.houseStart];
        if (!skip) {
            current.measures.push(m);
            var repeatEnd = signs.includes('}') && !current.repeated.includes(current.index); // && !current.repeatedEnds[current.index]; // TODO: support repeat n times
            if (repeatEnd) {
                var jumpTo = current.openRepeats[0] || 0;
                current.openRepeats.shift();
                current.houses[jumpTo] = (current.houses[jumpTo] || 1) + 1;
                current.measures = current.measures.concat(renderSheet(sheet, {
                    index: jumpTo,
                    repeated: [current.index],
                    end: current.index,
                    houses: (_a = {},
                        _a[jumpTo] = current.houses[jumpTo],
                        _a)
                }));
            }
        }
        current.index += 1;
    }
    return current.measures;
}
exports.renderSheet = renderSheet;
