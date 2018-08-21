"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var util_1 = require("../util");
var AudioContext = /** @class */ (function () {
    function AudioContext() {
        console.log('construct fake audio context');
    }
    return AudioContext;
}());
test('inits with default values', function () {
    var pulse = new __1.Pulse({ context: new AudioContext() });
    expect(pulse.props.bpm).toBe(120);
    expect(pulse.props.cycle).toBe(4);
});
test('inits with default values', function () {
    var pulse = new __1.Pulse({ context: new AudioContext() });
    var synth = util_1.randomSynth(pulse.context);
    /* pulse.tickArray([1, 1, 1, 1], () => {
        console.log('t');
    }); */
});
