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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var Band_1 = __importDefault(require("./Band"));
var Pianist_1 = __importDefault(require("./musicians/Pianist"));
var Bassist_1 = __importDefault(require("./musicians/Bassist"));
var Drummer_1 = __importDefault(require("./musicians/Drummer"));
var PlasticDrums_1 = require("./instruments/PlasticDrums");
var Metronome_1 = require("./Metronome");
var Pulse_1 = require("./Pulse");
var Guide_1 = __importDefault(require("./musicians/Guide"));
var Trio = /** @class */ (function (_super) {
    __extends(Trio, _super);
    function Trio(_a) {
        var context = _a.context, piano = _a.piano, bass = _a.bass, drums = _a.drums, onMeasure = _a.onMeasure, solo = _a.solo;
        var _this = _super.call(this, { context: context, onMeasure: onMeasure }) || this;
        _this.mix = _this.setupMix(_this.context);
        var instruments = _this.setupInstruments({ piano: piano, bass: bass, drums: drums });
        _this.pianist = new Pianist_1.default(instruments.piano);
        _this.bassist = new Bassist_1.default(instruments.bass);
        _this.drummer = new Drummer_1.default(instruments.drums);
        _this.musicians = [_this.pianist, _this.bassist, _this.drummer];
        if (solo) {
            // this.soloist = new Permutator(instruments.piano);
            _this.soloist = new Guide_1.default(instruments.piano);
            _this.musicians.push(_this.soloist);
        }
        _this.metronome = new Metronome_1.Metronome(_this.mix);
        return _this;
    }
    Trio.prototype.setupMix = function (context) {
        var mix = context.createGain();
        mix.gain.value = 0.9;
        mix.connect(context.destination);
        return mix;
    };
    Trio.prototype.setupInstruments = function (_a) {
        var piano = _a.piano, bass = _a.bass, drums = _a.drums;
        bass = bass || util_1.randomSynth(this.mix);
        piano = piano || util_1.randomSynth(this.mix);
        drums = drums || new PlasticDrums_1.PlasticDrums({ mix: this.mix });
        return { piano: piano, bass: bass, drums: drums };
    };
    Trio.prototype.play = function (measures, settings) {
        var _this = this;
        this.pulse = settings.pulse || new Pulse_1.Pulse(settings);
        return this.count(this.pulse, settings.metronome ? null : 0).then(function (tick) {
            settings.deadline = tick.deadline;
            // settings.delay = deadline - this.context.currentTime;
            _super.prototype.play.call(_this, measures, settings);
        });
    };
    Trio.prototype.count = function (pulse, bars) {
        if (bars === void 0) { bars = 1; }
        if (pulse.getMeasureLength() < 1.5) {
            bars *= 2; //double countin bars when countin would be shorter than 1.5s
        }
        return this.metronome.count(pulse, bars);
    };
    return Trio;
}(Band_1.default));
exports.Trio = Trio;
