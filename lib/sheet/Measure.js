"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sheet_1 = require("./Sheet");
var Measure = /** @class */ (function () {
    function Measure() {
    }
    Measure.from = function (measure) {
        // if (!Array.isArray(measure) && typeof measure !== 'object') {
        if (!Array.isArray(measure) && typeof measure !== 'object') {
            return {
                body: [measure]
            };
        }
        if (Array.isArray(measure)) {
            return {
                body: [].concat(measure)
            };
        }
        return measure;
    };
    Measure.render = function (state) {
        var sheet = state.sheet, index = state.index, forms = state.forms, totalForms = state.totalForms;
        var measure = Measure.from(sheet[index]);
        // TODO: options is lost here...
        return {
            body: measure.body,
            form: totalForms - forms,
            totalForms: totalForms,
            index: index
        };
    };
    Measure.hasSign = function (sign, measure) {
        measure = Measure.from(measure);
        return !!measure.signs && measure.signs.includes(sign);
    };
    Measure.hasHouse = function (measure, number) {
        measure = Measure.from(measure);
        var house = measure.house;
        if (!house) {
            return false;
        }
        else if (number === undefined) {
            return true;
        }
        if (!Array.isArray(house)) {
            house = [house];
        }
        return house.includes(number);
    };
    Measure.getJumpSign = function (measure) {
        var signs = (Measure.from(measure).signs || []).filter(function (s) {
            return Object.keys(Sheet_1.Sheet.jumpSigns).includes(s);
        });
        if (signs.length > 1) {
            console.warn('measure cannot contain more than one repeat sign', measure);
        }
        return Sheet_1.Sheet.jumpSigns[signs[0]];
    };
    Measure.hasJumpSign = function (measure) {
        return Object.keys(Sheet_1.Sheet.jumpSigns).reduce(function (match, current) { return match || Measure.hasSign(current, measure); }, false);
    };
    return Measure;
}());
exports.Measure = Measure;
