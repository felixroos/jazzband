"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Kick = /** @class */ (function () {
    function Kick(context) {
        this.context = context;
    }
    Kick.prototype.setup = function () {
        this.osc = this.context.createOscillator();
        this.gain = this.context.createGain();
        this.osc.connect(this.gain);
        this.gain.connect(this.context.destination);
    };
    Kick.prototype.trigger = function (time) {
        this.setup();
        this.osc.frequency.setValueAtTime(150, time);
        this.gain.gain.setValueAtTime(1, time);
        this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        this.osc.start(time);
        this.osc.stop(time + 0.5);
    };
    return Kick;
}());
exports.Kick = Kick;
