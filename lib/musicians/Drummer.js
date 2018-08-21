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
var Musician_1 = require("./Musician");
var swing_1 = require("../grooves/swing");
var Drummer = /** @class */ (function (_super) {
    __extends(Drummer, _super);
    function Drummer(instrument) {
        var _this = _super.call(this, instrument) || this;
        _this.set = {
            kick: 0,
            snare: 1,
            hihat: 2,
            ride: 3,
            crash: 4
        };
        _this.defaults = { groove: swing_1.swing };
        return _this;
    }
    Drummer.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures, pulse = _a.pulse, settings = _a.settings;
        var groove = settings.groove || this.defaults.groove;
        Object.keys(groove)
            .filter(function (t) { return Object.keys(_this.set).includes(t); }) // only use drum set patterns
            .forEach(function (key) {
            var patterns = measures
                .map(function (measure, index) { return groove[key]({ measures: measures, index: index, measure: measure, settings: settings, pulse: pulse })
                .slice(0, Math.floor(settings.cycle)); });
            pulse.tickArray(patterns, function (_a) {
                var deadline = _a.deadline, value = _a.value;
                _this.instrument.playKeys([_this.set[key]], { deadline: deadline, gain: value });
            }, settings.deadline);
        });
    };
    return Drummer;
}(Musician_1.Musician));
exports.default = Drummer;
