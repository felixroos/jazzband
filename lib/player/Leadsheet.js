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
var Leadsheet = /** @class */ (function () {
    function Leadsheet(sheet) {
        Object.assign(this, Leadsheet.from(sheet));
    }
    Leadsheet.from = function (sheet) {
        sheet.options = sheet.options || {};
        return __assign({}, sheet, { options: __assign({ forms: 1, pedal: false, real: true, tightMelody: true, bpm: 120, swing: 0, fermataLength: 4, feel: 4, pulses: 4 }, sheet.options, { humanize: __assign({ velocity: 0.1, time: 0.002, duration: 0.002 }, (sheet.options.humanize || {})), voicings: __assign({ minBottomDistance: 3, minTopDistance: 2, logging: false, maxVoices: 4, range: ['C3', 'C6'], rangeBorders: [1, 1], maxDistance: 7, idleChance: 1 }, (sheet.options.voicings || {})) }) });
    };
    return Leadsheet;
}());
exports.Leadsheet = Leadsheet;
