"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util/util");
var Musician_1 = require("./Musician");
var swing_1 = require("../grooves/swing");
var Permutator = /** @class */ (function (_super) {
    __extends(Permutator, _super);
    function Permutator(instrument) {
        var _this = _super.call(this, instrument) || this;
        _this.defaults = { groove: swing_1.swing };
        _this.playedChords = [];
        return _this;
    }
    Permutator.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures, pulse = _a.pulse, settings = _a.settings;
        var groove = settings.groove || this.defaults.groove;
        var pattern = groove['solo'] || (function (m) {
            return m.measure.map(function (c) { return [1, 1, 1, 1]; });
        }); // dont changes anything
        measures = measures
            .map(function (measure) { return pattern({ measures: measures, measure: measure, settings: settings, pulse: pulse }).slice(0, Math.floor(settings.cycle)); })
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); });
        pulse.tickArray(measures, function (tick) {
            _this.playPermutations(tick, measures, pulse);
        }, settings.deadline);
    };
    Permutator.prototype.playPermutations = function (_a, measures, pulse) {
        var value = _a.value, cycle = _a.cycle, path = _a.path, deadline = _a.deadline, interval = _a.interval;
        var chord = value.chord;
        if (chord === 'N.C.') {
            return;
        }
        if (chord === 'x') {
            chord = this.playedChords[this.playedChords.length - 1];
        }
        if (!chord || chord === '0') {
            this.playedChords.push('');
            return;
        }
        this.playedChords.push(chord);
        // digital patterns
        var notes = util_1.renderDigitalPattern(chord);
        var note = util_1.randomElement(notes) + '5';
        // all scale notes with different chances
        /* const notes = getPatternInChord([1, 2, 3, 4, 5, 6, 7], chord);
        const note = randomElement(notes, [4, 3, 6, 1, 3, 4, 6]) + '5'; */
        /* console.log('beat (starting from zero)', path[1]); */
        var duration = value.fraction * pulse.getMeasureLength();
        /* deadline += randomDelay(10); */
        this.instrument.playNotes([note], { deadline: deadline, interval: interval, gain: 1, duration: duration, pulse: pulse });
    };
    return Permutator;
}(Musician_1.Musician));
exports.default = Permutator;
