"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Sheet_1 = require("./Sheet");
var Measure = /** @class */ (function () {
    function Measure() {
    }
    Measure.from = function (measure, property) {
        if (property === void 0) { property = 'chords'; }
        var _a, _b, _c;
        if (!Array.isArray(measure) && typeof measure !== 'object') {
            return _a = {},
                _a[property] = [measure],
                _a;
        }
        if (Array.isArray(measure)) {
            return _b = {},
                _b[property] = [].concat(measure),
                _b;
        }
        return __assign({}, measure, (_c = {}, _c[property] = measure[property] || measure.chords, _c));
        // return Object.assign({}, measure);
        // return measure;
    };
    /* static render(sheet: MeasureOrString[], index: number, form?: number, property = 'chords'): RenderedMeasure { */
    Measure.render = function (state) {
        var _a;
        var sheet = state.sheet, index = state.index, forms = state.forms, firstTime = state.firstTime, lastTime = state.lastTime, totalForms = state.totalForms, property = state.property;
        var measure = Measure.from(sheet[index], property);
        return _a = {
                options: __assign({}, measure, (measure.options || {}))
            },
            _a[property] = measure[property],
            _a.form = totalForms - forms,
            _a.totalForms = totalForms,
            _a.firstTime = firstTime,
            _a.lastTime = lastTime,
            _a.index = index,
            _a;
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
