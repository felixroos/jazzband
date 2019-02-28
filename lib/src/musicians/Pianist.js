"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var util_1 = require("../util/util");
var Musician_1 = require("./Musician");
var swing_1 = require("../grooves/swing");
var Voicing_1 = require("../harmony/Voicing");
var tonal_1 = require("tonal");
var Pianist = /** @class */ (function (_super) {
    __extends(Pianist, _super);
    function Pianist(instrument, props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, instrument) || this;
        _this.name = 'Pianist';
        _this.playedNotes = [];
        _this.playedChords = [];
        _this.defaults = { groove: swing_1.swing };
        _this.min = Math.min;
        _this.rollFactor = 1; // how much keyroll effect? controls interval between notes
        _this.voicingOptions = {};
        _this.props = Object.assign({}, _this.defaults, props || {});
        return _this;
    }
    Pianist.prototype.play = function (_a) {
        var _this = this;
        var pulse = _a.pulse, measures = _a.measures, settings = _a.settings;
        var groove = settings.groove || this.defaults.groove;
        var grooveKey = 'chords';
        this.voicingOptions = __assign({}, this.voicingOptions, settings.voicings || {});
        // if no groove or groove without chords, or exact, play whats there
        // TODO: exact timing is false with metronome
        if (settings.exact || !groove || !groove[grooveKey]) {
            if (!groove[grooveKey]) {
                console.warn('Groove has no chords, Pianist will play exact.', groove);
            }
            measures = measures
                .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); });
            return pulse.tickArray(measures, function (_a) {
                var value = _a.value, deadline = _a.deadline;
                var fraction = util_1.getDuration(value.divisions, 1);
                // TODO: find out why value fraction is NaN
                var duration = fraction * pulse.getMeasureLength();
                _this.playChord(value.chord || value, { deadline: deadline, duration: duration, pulse: pulse });
            });
        }
        // else, play groovy
        var pattern = groove[grooveKey];
        measures = measures
            // generate random patterns
            .map(function (measure) { return pattern({ measures: measures, pulse: pulse, measure: measure, settings: settings })
            .slice(0, Math.floor(settings.cycle)); })
            // fill in chords
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); })
            // fix chords at last offbeat
            .reduce(util_1.offbeatReducer(settings), []);
        pulse.tickArray(measures, function (_a) {
            var path = _a.path, value = _a.value, deadline = _a.deadline;
            var measureLength = pulse.getMeasureLength();
            var concurrency = settings.bpm / (_this.rollFactor || 1);
            var interval = settings.arpeggio ? measureLength / settings.cycle : Math.random() / (concurrency * 20);
            if (path[0] % 2 === 0 && !path[1] && !path[2]) {
                interval = Math.random() / concurrency;
            }
            var duration = settings.arpeggio ? interval : value.fraction * measureLength;
            var slice = settings.arpeggio ? Math.ceil(value.fraction / 1000 * 4) : null;
            var gain = _this.getGain(value.gain);
            _this.playChord(value.chord, { deadline: deadline, gain: gain, duration: duration, interval: interval, slice: slice, pulse: pulse });
        }, settings.deadline);
    };
    Pianist.prototype.getLastVoicing = function () {
        return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
    };
    // plays the given notes at the given interval
    Pianist.prototype.playNotes = function (scorenotes, _a) {
        var deadline = _a.deadline, interval = _a.interval, gain = _a.gain, duration = _a.duration, pulse = _a.pulse;
        this.playedNotes.push([].concat(scorenotes));
        this.instrument.playNotes(scorenotes, { deadline: deadline, interval: interval, gain: gain, duration: duration, pulse: pulse });
    };
    Pianist.prototype.playChord = function (chord, settings) {
        if (chord === 'x') { // repeat
            chord = this.playedChords[this.playedChords.length - 1];
        }
        if (!chord || chord === '0') {
            this.playedChords.push('');
            return;
        }
        this.playedChords.push(chord);
        var notes = Voicing_1.Voicing.getNextVoicing(chord, this.getLastVoicing(), this.voicingOptions);
        notes = notes.map(function (note) { return tonal_1.Note.simplify(note); });
        settings.deadline += 0.02 + util_1.randomDelay(5);
        this.playNotes(notes, settings);
    };
    return Pianist;
}(Musician_1.Musician));
exports.default = Pianist;
