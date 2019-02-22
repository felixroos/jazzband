"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Instrument_1 = require("./Instrument");
var Kick_1 = require("./Kick");
var Snare_1 = require("./Snare");
var PlasticDrums = /** @class */ (function (_super) {
    __extends(PlasticDrums, _super);
    function PlasticDrums(options) {
        var _this = _super.call(this, options) || this;
        _this.keys = [
            new Kick_1.Kick(_this.context),
            new Snare_1.Snare(_this.context)
        ];
        return _this;
    }
    PlasticDrums.prototype.playKeys = function (keys, _a) {
        var _this = this;
        var deadline = _a.deadline, gain = _a.gain, value = _a.value;
        var sounds = keys.filter(function (key) { return !!_this.keys[key]; }).map(function (key) { return _this.keys[key]; });
        if (sounds.length < keys.length) {
            var missing = keys.filter(function (key) { return !_this.keys[key]; });
            console.warn('PlasticDrums missing keys:', missing);
        }
        sounds.forEach(function (sound) { return sound.trigger(deadline); });
    };
    return PlasticDrums;
}(Instrument_1.Instrument));
exports.PlasticDrums = PlasticDrums;
