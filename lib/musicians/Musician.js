"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Musician = /** @class */ (function () {
    function Musician(instrument) {
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
    return Musician;
}());
exports.Musician = Musician;
