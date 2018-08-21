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
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var util_1 = require("../util");
var Musician_1 = require("./Musician");
var swing_1 = require("../grooves/swing");
var Pianist = /** @class */ (function (_super) {
    __extends(Pianist, _super);
    function Pianist(instrument, props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, instrument) || this;
        _this.playedNotes = [];
        _this.playedPatterns = [];
        _this.playedChords = [];
        _this.defaults = { intelligentVoicings: true, groove: swing_1.swing, noTonic: true };
        _this.min = Math.min;
        _this.rollFactor = 3; // how much keyroll effect? controls interval between notes
        _this.props = Object.assign({}, _this.defaults, props || {});
        return _this;
    }
    Pianist.prototype.play = function (_a) {
        var _this = this;
        var pulse = _a.pulse, measures = _a.measures, settings = _a.settings;
        var groove = settings.groove || this.defaults.groove;
        var pattern = groove['chords'];
        if (!pattern) {
            console.warn('style has no chords..');
            return;
        }
        var measureLength = pulse.getMeasureLength();
        if (settings.exact) {
            return pulse.tickArray(measures, function (t) {
                _this.playChord(t.value, { deadline: t.deadline + settings.delay });
            });
        }
        measures = measures
            // generate random patterns
            .map(function (measure) { return pattern({ measures: measures, pulse: pulse, measure: measure, settings: settings }).slice(0, Math.floor(settings.cycle)); })
            // fill in chords
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); })
            // fix chords at last offbeat
            .reduce(util_1.offbeatReducer(settings), []);
        pulse.tickArray(measures, function (_a) {
            var path = _a.path, value = _a.value, deadline = _a.deadline;
            var humanFactor = settings.bpm / (_this.rollFactor || 1);
            var interval = settings.arpeggio ? measureLength / settings.cycle : Math.random() / (humanFactor * 20);
            if (path[0] % 2 === 0 && !path[1] && !path[2]) {
                interval = Math.random() / humanFactor;
            }
            var duration = settings.arpeggio ? interval : value.fraction * measureLength;
            var slice = settings.arpeggio ? Math.ceil(value.fraction / 1000 * 4) : null;
            var gain = value.gain || _this.instrument.gain;
            _this.playChord(value.chord, { deadline: deadline, gain: gain, duration: duration, interval: interval, slice: slice });
        }, settings.deadline);
    };
    Pianist.prototype.getLastVoicing = function () {
        return this.playedNotes.length ? this.playedNotes[this.playedNotes.length - 1] : null;
    };
    Pianist.prototype.getVoicing = function (scorenotes, before, tonic) {
        if (!before) {
            return scorenotes;
        }
        var near = util_1.intervalMatrix(before, scorenotes)
            .map(function (intervals, index) {
            var smallest = [].concat(intervals)
                .sort(function (a, b) { return util_1.minInterval(a, b, false); })[0];
            if (!tonal_1.Distance.transpose(before[intervals.indexOf(smallest)], smallest)) {
                console.warn('ALARM', before[intervals.indexOf(smallest)], smallest, intervals);
            }
            return tonal_1.Distance.transpose(before[intervals.indexOf(smallest)], smallest);
        }).filter(function (n) { return !!n; });
        return near && near.length ? near : scorenotes;
    };
    // plays the given notes at the given interval
    Pianist.prototype.playNotes = function (scorenotes, _a) {
        var tonic = _a.tonic, deadline = _a.deadline, interval = _a.interval, gain = _a.gain, duration = _a.duration;
        if (this.props.intelligentVoicings && this.getLastVoicing()) {
            scorenotes = this.getVoicing(scorenotes, this.getLastVoicing(), tonic);
        }
        this.playedNotes.push([].concat(scorenotes));
        this.instrument.playNotes(scorenotes, { deadline: deadline, interval: interval, gain: gain, duration: duration });
    };
    Pianist.prototype.playChord = function (chord, settings) {
        if (chord === 'N.C.') {
            console.log('N.C.');
            return;
        }
        if (!chord || chord === 'x') { // repeat
            chord = this.playedChords[this.playedChords.length - 1];
        }
        this.playedChords.push(chord);
        chord = tonal_2.Chord.tokenize(util_1.getTonalChord(chord));
        var notes = tonal_2.Chord.intervals(chord[1])
            .map(function (i) { return i.replace('13', '6'); }) // TODO: better control over octave
            .map(function (root) { return tonal_1.Distance.transpose(chord[0] + '3', root); });
        if (notes.length > 3 && settings.noTonic) {
            notes = notes.slice(this.props.noTonic ? 1 : 0);
        }
        if (settings.slice) {
            notes = notes.slice(0, settings.slice ? settings.slice : notes.length);
        }
        this.playNotes(notes, settings);
    };
    return Pianist;
}(Musician_1.Musician));
exports.default = Pianist;