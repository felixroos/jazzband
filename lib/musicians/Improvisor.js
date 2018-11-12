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
var methods_1 = require("../improvisation/methods");
var Improvisor = /** @class */ (function (_super) {
    __extends(Improvisor, _super);
    function Improvisor(instrument, method) {
        var _this = _super.call(this, instrument) || this;
        _this.name = 'Improvisor';
        _this.defaultMethod = methods_1.defaultMethod;
        method = method || _this.defaultMethod;
        _this.method = method.enhance({
            range: ['F3', 'F5']
        });
        return _this;
    }
    Improvisor.prototype.useMethod = function (method) {
        this.method = method;
    };
    Improvisor.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures, pulse = _a.pulse, settings = _a.settings;
        if (settings.method) {
            this.useMethod(settings.method);
        }
        var groove = settings.groove || swing_1.swing;
        this.method.mutate(function () { return ({ groove: groove, playedNotes: [] }); });
        var pattern = this.method.get('groovePattern');
        measures = measures
            .map(function (measure) { return pattern({ measures: measures, measure: measure, settings: settings, pulse: pulse }); }
        /*     .slice(0, Math.floor(settings.cycle)) */
        )
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); });
        pulse.tickArray(measures, function (tick) {
            _this.improvise(tick, measures, pulse);
        }, settings.deadline);
    };
    Improvisor.prototype.improvise = function (_a, measures, pulse) {
        var _this = this;
        var value = _a.value, deadline = _a.deadline, interval = _a.interval;
        var chord = value.chord;
        if (chord === 'N.C.') {
            return;
        }
        this.method.mutate(function () { return ({
            chord: chord,
            isFormStart: util_1.isFormStart(value.path),
            isBarStart: util_1.isBarStart(value.path),
            isOffbeat: util_1.isOffbeat(value.path),
            // TODO: is ChordStart
            barNumber: value.path[0]
        }); })
            .mutate(function (_a) {
            var nextNotes = _a.nextNotes, playedNotes = _a.playedNotes;
            var pick = nextNotes();
            var duration = value.fraction * pulse.getMeasureLength();
            _this.instrument.playNotes(pick, { deadline: deadline, interval: interval, gain: 1, duration: duration, pulse: pulse });
            return {
                playedNotes: [].concat(pick, playedNotes())
            };
        });
    };
    return Improvisor;
}(Musician_1.Musician));
exports.default = Improvisor;
