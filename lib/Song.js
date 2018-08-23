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
            chords: measure
        };
    }
    return measure;
}
exports.getMeasure = getMeasure;
function renderSheet(sheet, current) {
    var _a;
    current = Object.assign({
        index: 0,
        measures: [],
        openRepeats: [],
        //closedRepeats: [], // closed repeat start indices
        repeated: [],
        end: sheet.length - 1,
        house: 0,
        houseStart: 0,
        houses: {} // house targets of repeatStart indices
    }, current);
    while (current.index <= current.end) {
        var measure = sheet[current.index];
        var signs = measure['signs'] || [];
        //console.log(`${current.index}/${current.end}`, measure['chords'], `${current.house}/${JSON.stringify(current.targets)}`);
        var repeatStart = signs.includes('{');
        if (repeatStart) {
            current.openRepeats.unshift(current.index);
        }
        var houseStart = signs.find(function (s) { return !!s.match(/^N./); });
        if (houseStart) {
            var house = parseInt(houseStart.replace('N', ''));
            current.house = house;
            if (house === 1) { // remember where it started..
                current.houseStart = current.openRepeats[0] || 0;
            }
        }
        var skip = current.house && current.houses[current.houseStart] && current.house !== current.houses[current.houseStart];
        if (!skip) {
            current.measures.push(Object.assign({ index: current.index }, getMeasure(measure)));
            // const sectionStart = (measure.signs || []).find(s => !!s.match(/^\*[a-zA-Z]/));
            var repeatEnd = signs.includes('}') && !current.repeated.includes(current.index); // && !current.repeatedEnds[current.index]; // TODO: support repeat n times
            if (repeatEnd) {
                var jumpTo = current.openRepeats[0] || 0;
                //current.closedRepeats.unshift(current.openRepeats[0]);
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
