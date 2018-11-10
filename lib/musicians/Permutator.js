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
var util_1 = require("../util");
var Musician_1 = require("./Musician");
var tonal_1 = require("tonal");
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
        var pattern = groove['eights'] || [1, 1, 1, 1, 1, 1, 1, 1];
        measures = measures
            .map(function (measure) { return pattern({ measures: measures, measure: measure, settings: settings, pulse: pulse }).slice(0, Math.floor(settings.cycle)); })
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); });
        pulse.tickArray(measures, function (tick) {
            _this.playPermutations(tick, measures, pulse);
        }, settings.deadline);
    };
    Permutator.prototype.getStep = function (step, chord, octave) {
        if (octave === void 0) { octave = 2; }
        var tokens = tonal_1.Chord.tokenize(util_1.getTonalChord(chord));
        var interval = tonal_1.Chord.intervals(tokens[1]).find(function (i) { return parseInt(i[0]) === step; });
        return tonal_1.Distance.transpose(tokens[0] + octave, interval);
    };
    Permutator.prototype.getSteps = function (steps, chord) {
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
        var steps = this.getSteps([1, 2, 3, 5], chord);
        console.log('permutate chord', chord, steps);
        /* let note;
        const steps = [1, randomElement([3, 5]), 1, randomElement([3, 5])];
        const octave = 2;
        if (value.value === 1 && chord.split('/').length > 1) {
            note = chord.split('/')[1] + octave;
        } else {
            note = this.getStep(steps[path[1]], getTonalChord(chord), octave);
        }
        const duration = value.fraction * pulse.getMeasureLength();

        deadline += randomDelay(10);
        this.instrument.playNotes([note], { deadline, interval, gain: 0.7, duration, pulse }); */
    };
    return Permutator;
}(Musician_1.Musician));
exports.default = Permutator;
