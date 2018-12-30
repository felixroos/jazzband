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
var swing_1 = require("../grooves/swing");
var Pianist = /** @class */ (function (_super) {
    __extends(Pianist, _super);
    function Pianist(instrument, props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, instrument) || this;
        _this.name = 'Pianist';
        _this.playedNotes = [];
        _this.playedPatterns = [];
        _this.playedChords = [];
        _this.defaults = { intelligentVoicings: true, groove: swing_1.swing, noTonic: true };
        _this.min = Math.min;
        _this.rollFactor = 1; // how much keyroll effect? controls interval between notes
        _this.range = ['C3', 'G5'];
        _this.props = Object.assign({}, _this.defaults, props || {});
        return _this;
    }
    Pianist.prototype.play = function (_a) {
        var _this = this;
        var pulse = _a.pulse, measures = _a.measures, settings = _a.settings;
        var groove = settings.groove || this.defaults.groove;
        var grooveKey = 'chords';
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
                var fraction = util_1.getDuration(value.divisions, 1); // TODO: find out why value fraction is NaN
                var duration = fraction * pulse.getMeasureLength();
                _this.playChord(value.chord || value, { deadline: deadline, duration: duration, pulse: pulse });
            });
        }
        // else, play groovy
        var pattern = groove[grooveKey];
        measures = measures
            // generate random patterns
            .map(function (measure) { return pattern({ measures: measures, pulse: pulse, measure: measure, settings: settings }).slice(0, Math.floor(settings.cycle)); })
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
    /* getVoicing(scorenotes, before, tonic?) {
        if (!before) {
            return scorenotes;
        }
        const near = intervalMatrix(before, scorenotes)
            .map((intervals, index) => {
                const smallest = [].concat(intervals).sort(sortMinInterval())[0];
                if (!Distance.transpose(before[intervals.indexOf(smallest)], smallest)) {
                    console.warn('ALARM', before[intervals.indexOf(smallest)], smallest, intervals);
                }
                return Distance.transpose(before[intervals.indexOf(smallest)], smallest);
            }).filter(n => !!n)
            .filter(n => Note.simplify(n, true));
        return near && near.length ? near : scorenotes;
    } */
    // plays the given notes at the given interval
    Pianist.prototype.playNotes = function (scorenotes, _a) {
        var tonic = _a.tonic, deadline = _a.deadline, interval = _a.interval, gain = _a.gain, duration = _a.duration, pulse = _a.pulse;
        /* if (this.props.intelligentVoicings && this.getLastVoicing()) {
            scorenotes = this.getVoicing(scorenotes, this.getLastVoicing(), tonic);
        } */
        /* scorenotes = transposeToRange(scorenotes, this.range); */
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
        var last = this.getLastVoicing();
        /* let notes = generateVoicing(chord, this.getLastVoicing(), this.range); */
        var notes = util_1.getNextVoicing(chord, this.getLastVoicing(), this.range);
        if (last) {
            /* const movement = voicingMovement(this.getLastVoicing(), notes);
            const difference = voicingDifference(this.getLastVoicing(), notes); */
            var _a = util_1.analyzeVoiceLeading(this.playedNotes), movement = _a.movement, difference = _a.difference, averageDifference = _a.averageDifference;
            console.log(averageDifference, movement);
        }
        else {
            console.log('voicing', notes);
        }
        /* chord = Chord.tokenize(getTonalChord(chord));

        let notes = Chord.intervals(chord[1])
            .map(i => i.replace('13', '6')) // TODO: better control over octave
            .map(root => Distance.transpose(chord[0] + '3', root));
        if (notes.length > 3 && settings.noTonic) {
            notes = notes.slice(this.props.noTonic ? 1 : 0);
        }
        if (settings.slice) {
            notes = notes.slice(0, settings.slice ? settings.slice : notes.length);
        } */
        settings.deadline += 0.02 + util_1.randomDelay(5);
        this.playNotes(notes, settings);
    };
    return Pianist;
}(Musician_1.Musician));
exports.default = Pianist;
