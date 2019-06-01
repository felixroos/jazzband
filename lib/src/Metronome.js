"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Synthesizer_1 = require("./instruments/Synthesizer");
var Metronome = /** @class */ (function () {
    function Metronome(mix) {
        this.synth = new Synthesizer_1.Synthesizer({ type: 'sine', gain: 1, mix: mix });
        this.ready = this.synth.ready;
    }
    Metronome.prototype.count = function (pulse, bars) {
        var _this = this;
        if (bars === void 0) { bars = 1; }
        var count = new Array(bars).fill([new Array(pulse.props.cycle).fill(1)]);
        return pulse.tickArray(count, function (_a) {
            var path = _a.path, deadline = _a.deadline;
            _this.synth.playKeys([path[2] === 0 ? 90 : 78], { deadline: deadline, duration: 0.01, attack: .01, release: .01, decay: .01, sustain: 1 });
        });
    };
    return Metronome;
}());
exports.Metronome = Metronome;
