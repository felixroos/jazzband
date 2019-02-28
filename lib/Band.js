"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pulse_1 = require("./Pulse");
var Sheet_1 = require("./sheet/Sheet");
var Metronome_1 = require("./Metronome");
var Logger_1 = require("./util/Logger");
/** Band */
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
        this.mix = this.setupMix(this.context);
        this.metronome = new Metronome_1.Metronome(this.mix);
    }
    Band.prototype.setupMix = function (context) {
        var mix = context.createGain();
        mix.gain.value = 0.9;
        mix.connect(context.destination);
        return mix;
    };
    Band.prototype.addMember = function (musician) {
        this.musicians = this.musicians.concat(musician);
    };
    Band.prototype.ready = function () {
        return Promise.all([this.resume()].concat(this.musicians.map(function (m) { return m.ready; })));
    };
    Band.prototype.resume = function () {
        var _this = this;
        return this.context.resume ? this.context.resume().then(function () { return _this.context; }) : Promise.resolve(this.context);
    };
    Band.prototype.comp = function (sheet, settings) {
        if (this.pulse) {
            this.pulse.stop();
        }
        Logger_1.Logger.logLegend();
        Logger_1.Logger.logSheet(sheet);
        if (settings.onMeasure) {
            this.onMeasure = settings.onMeasure;
        }
        var measures = Sheet_1.Sheet.render(sheet.chords, settings.render);
        measures = measures.concat(measures);
        settings = Object.assign(this.defaults, settings, { context: this.context });
        this.play(measures, settings);
    };
    Band.prototype.play = function (measures, settings) {
        var _this = this;
        this.ready().then(function () {
            _this.pulse = settings.pulse || new Pulse_1.Pulse(settings);
            return _this.count(_this.pulse, settings.metronome ? null : 0);
        }).then(function (tick) {
            /* settings.deadline = tick.deadline; */
            if (_this.onMeasure) {
                // TODO: add onChord for setting tonics + circle chroma etc
                _this.pulse.tickArray(measures.map(function (measure) { return ({ measure: measure }); }), function (tick) { return _this.onMeasure(tick.value.measure, tick); });
            }
            measures = measures.map(function (m) { return m.chords ? m.chords : m; });
            console.log('Band#play', measures, settings);
            var musicians = (settings.musicians || _this.musicians);
            musicians.forEach(function (musician) { return musician.play({ pulse: _this.pulse, measures: measures, settings: settings }); });
            _this.pulse.start();
        });
    };
    Band.prototype.count = function (pulse, bars) {
        if (bars === void 0) { bars = 1; }
        if (pulse.getMeasureLength() < 1.5) {
            bars *= 2; //double countin bars when countin would be shorter than 1.5s
        }
        return this.metronome.count(pulse, bars);
    };
    return Band;
}());
exports.default = Band;
