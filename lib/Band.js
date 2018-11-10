"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pulse_1 = require("./Pulse");
var Song_1 = require("./Song");
var Band = /** @class */ (function () {
    function Band(_a) {
        var _b = _a === void 0 ? {} : _a, context = _b.context, musicians = _b.musicians, onMeasure = _b.onMeasure;
        this.defaults = {
            cycle: 4,
            division: 3,
            transpose: 0,
            style: 'Medium Swing',
        };
        this.context = context || new AudioContext();
        this.onMeasure = onMeasure;
        this.musicians = musicians || [];
    }
    Band.prototype.addMember = function (musician) {
        this.musicians = this.musicians.concat(musician);
    };
    Band.prototype.ready = function () {
        return Promise.all([this.resume()].concat(this.musicians.map(function (m) { return m.ready; })));
    };
    Band.prototype.resume = function () {
        var _this = this;
        return this.context.resume().then(function () { return _this.context; });
    };
    Band.prototype.comp = function (sheet, settings) {
        if (this.pulse) {
            this.pulse.stop();
        }
        var measures = Song_1.renderSheet(sheet);
        measures = measures.concat(measures);
        settings = Object.assign(this.defaults, settings, { context: this.context });
        this.play(measures, settings);
    };
    Band.prototype.play = function (measures, settings) {
        var _this = this;
        this.ready().then(function () {
            _this.pulse = settings.pulse || new Pulse_1.Pulse(settings);
            if (_this.onMeasure) {
                // TODO: add onChord for setting tonics + circle chroma etc
                _this.pulse.tickArray(measures.map(function (measure) { return ({ measure: measure }); }), function (tick) { return _this.onMeasure(tick.value.measure, tick); });
            }
            measures = measures.map(function (m) { return m.chords ? m.chords : m; });
            console.log('Band#play', settings);
            _this.musicians.forEach(function (musician) { return musician.play({ pulse: _this.pulse, measures: measures, settings: settings }); });
            _this.pulse.start();
        });
    };
    return Band;
}());
exports.default = Band;
