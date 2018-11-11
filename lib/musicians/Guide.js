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
var Guide = /** @class */ (function (_super) {
    __extends(Guide, _super);
    function Guide(instrument) {
        var _this = _super.call(this, instrument) || this;
        _this.defaults = { groove: swing_1.swing };
        _this.playedChords = [];
        _this.playedNotes = [];
        _this.range = ['C3', 'C6'];
        return _this;
    }
    Guide.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures, pulse = _a.pulse, settings = _a.settings;
        var groove = settings.groove || this.defaults.groove;
        var pattern = groove['solo'] || (function (m) {
            return m.measure.map(function (c) { return [1]; });
        }); // dont changes anything
        measures = measures
            .map(function (measure) { return pattern({ measures: measures, measure: measure, settings: settings, pulse: pulse }).slice(0, Math.floor(settings.cycle)); })
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); });
        pulse.tickArray(measures, function (tick) {
            _this.playPermutations(tick, measures, pulse);
        }, settings.deadline);
    };
    Guide.prototype.playPermutations = function (_a, measures, pulse) {
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
        // only guide tones
        //const notes = getGuideTones(chord);
        var pattern = [1, 3, 5, 7];
        var notes = util_1.getPatternInChord([1, 3, 5, 7], chord);
        var note;
        var octave = 5;
        var variance = .5; // how many near notes can be jumped over ?
        var variety = .5; // how vertical should the solo be?
        var drill = .5; // how persistent should the current direction be followed?
        var flip = false; // if true, the voice leading will be stretched out
        if (!this.playedNotes.length) {
            note = util_1.randomElement(notes) + octave;
        }
        else {
            var excludeNotes_1 = this.playedNotes
                .slice(0, Math.floor(variety * pattern.length - 1))
                .map(function (n) { return tonal_1.Note.pc(n); });
            notes = notes.filter(function (n) { return !excludeNotes_1.includes(n); });
            var direction = drill > 0 ? 'up' : 'down';
            note = util_1.randomElement(util_1.getNearestTargets(this.playedNotes[0], notes, direction, Math.random() * Math.abs(drill) > .5, flip)
                .slice(0, ((variance * pattern.length + 1) % pattern.length)));
            note = tonal_1.Note.simplify(note, true);
        }
        note = util_1.transposeToRange([note], this.range)[0];
        this.playedNotes.unshift(note);
        var duration = value.fraction * pulse.getMeasureLength();
        // this.instrument.playNotes(notes.map(n => n + '5'), { deadline, interval, gain: 1, duration, pulse });
        this.instrument.playNotes([note], { deadline: deadline, interval: interval, gain: 1, duration: duration, pulse: pulse });
    };
    return Guide;
}(Musician_1.Musician));
exports.default = Guide;
