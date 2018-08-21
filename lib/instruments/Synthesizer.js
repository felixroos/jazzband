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
var Instrument_1 = require("./Instrument");
var tonal_1 = require("tonal");
var util_1 = require("../util");
var Synthesizer = /** @class */ (function (_super) {
    __extends(Synthesizer, _super);
    function Synthesizer(props) {
        var _this = _super.call(this, props) || this;
        _this.duration = 200;
        _this.type = 'sine';
        _this.gain = 0.9;
        _this.attack = .05;
        _this.decay = .05;
        _this.sustain = .4;
        _this.release = .1;
        _this.duration = props.duration || _this.duration;
        _this.type = props.type || _this.type;
        _this.gain = props.gain || _this.gain;
        return _this;
    }
    Synthesizer.prototype.init = function (context) {
        _super.prototype.init.call(this, context);
    };
    Synthesizer.prototype.getVoice = function (type, gain, frequency) {
        if (type === void 0) { type = 'sine'; }
        if (gain === void 0) { gain = 0; }
        if (frequency === void 0) { frequency = 440; }
        var oscNode = this.context.createOscillator();
        oscNode.type = type;
        var gainNode = this.context.createGain();
        oscNode.connect(gainNode);
        gainNode.gain.value = typeof gain === 'number' ? gain : 0.8;
        gainNode.connect(this.mix);
        oscNode.frequency.value = frequency;
        return { oscNode: oscNode, gainNode: gainNode };
    };
    Synthesizer.prototype.lowestGain = function (a, b) {
        return a.gain.gain.value < b.gain.gain.value ? -1 : 0;
    };
    Synthesizer.prototype.playKeys = function (keys, settings) {
        var _this = this;
        if (settings === void 0) { settings = {}; }
        _super.prototype.playKeys.call(this, keys, settings); // fires callback   
        //const time = this.context.currentTime + settings.deadline / 1000;
        var time = settings.deadline || this.context.currentTime;
        var interval = settings.interval || 0;
        keys.map(function (key, i) {
            var delay = i * interval;
            var _a = [
                settings.attack || _this.attack,
                settings.decay || _this.decay,
                settings.sustain || _this.sustain,
                settings.release || _this.release,
                (settings.duration || _this.duration) / 1000,
                (settings.gain || 1) * _this.gain
            ], attack = _a[0], decay = _a[1], sustain = _a[2], release = _a[3], duration = _a[4], gain = _a[5];
            var voice = _this.getVoice(_this.type, 0, tonal_1.Note.freq(key));
            util_1.adsr({ attack: attack, decay: decay, sustain: sustain, release: release, gain: gain, duration: duration, }, time + delay, voice.gainNode.gain);
            voice.oscNode.start(settings.deadline + delay);
        });
    };
    return Synthesizer;
}(Instrument_1.Instrument));
exports.Synthesizer = Synthesizer;
