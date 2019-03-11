"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Musician = /** @class */ (function () {
    function Musician(instrument) {
        this.name = 'Musician';
        this.gain = 1;
        if (!instrument) {
            console.warn('musician has no instrument', this);
        }
        this.instrument = instrument;
        this.ready = this.instrument ? this.instrument.ready : Promise.resolve();
    }
    Musician.prototype.play = function (_a) {
        var pulse = _a.pulse, measures = _a.measures, settings = _a.settings;
        console.log('play..', pulse, measures, settings);
    };
    Musician.prototype.getGain = function (value) {
        if (value === void 0) { value = 1; }
        return value * this.gain * this.instrument.gain;
    };
    return Musician;
}());
exports.Musician = Musician;
