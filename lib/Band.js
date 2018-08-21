"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pulse_1 = require("./Pulse");
var Band = /** @class */ (function () {
    function Band(_a) {
        var _b = _a === void 0 ? {} : _a, context = _b.context, musicians = _b.musicians;
        this.defaults = {
            cycle: 4,
            division: 3,
            transpose: 0,
            style: 'Medium Swing'
        };
        this.context = context || new AudioContext();
        this.musicians = musicians || [];
    }
    Band.prototype.ready = function () {
        return Promise.all([this.resume()].concat(this.musicians.map(function (m) { return m.ready; })));
    };
    Band.prototype.resume = function () {
        var _this = this;
        return this.context.resume().then(function () { return _this.context; });
    };
    Band.prototype.comp = function (measures, settings) {
        if (this.pulse) {
            this.pulse.stop();
        }
        settings = Object.assign(this.defaults, settings, { context: this.context });
        measures = measures.map(function (m) { return !Array.isArray(m) ? [m] : m; });
        this.play(measures, settings);
    };
    Band.prototype.play = function (measures, settings) {
        var _this = this;
        this.ready().then(function () {
            _this.pulse = settings.pulse || new Pulse_1.Pulse(settings);
            _this.musicians.forEach(function (musician) { return musician.play({ pulse: _this.pulse, measures: measures, settings: settings }); });
            _this.pulse.start();
        });
    };
    return Band;
}());
exports.default = Band;
