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
var MidiOut = /** @class */ (function (_super) {
    __extends(MidiOut, _super);
    function MidiOut(props) {
        var _this = _super.call(this, props) || this;
        _this.gain = 0.9;
        _this.output = 'Scarlett 6i6 USB';
        _this.gain = props.gain || _this.gain;
        if (!navigator['requestMIDIAccess']) {
            console.warn('This browser does not support WebMIDI!');
            return _this;
        }
        navigator['requestMIDIAccess']().then(function (midi) { return _this.midiInit(midi); }, _this.midiFail);
        return _this;
    }
    MidiOut.prototype.midiInit = function (midi) {
        var _this = this;
        console.log('midi init', midi);
        console.log(midi.outputs.size, 'outputs');
        console.log(midi.inputs.size, 'inputs');
        this.midi = midi;
        midi.outputs.forEach(function (output) {
            console.log('ouput', output);
        });
        midi.inputs.forEach(function (input) {
            console.log('input', input);
            input.onmidimessage = _this.getMidiMessage;
        });
        this.onTrigger = function (_a) {
            var on = _a.on, off = _a.off;
            on.forEach(function (_a) {
                var midi = _a.midi, gain = _a.gain, deadline = _a.deadline;
                _this.noteOn(midi, Math.round(gain * 127), deadline);
            });
            off.forEach(function (event) {
                _this.noteOff(event.midi, Math.round(event.gain * 127));
            });
        };
    };
    MidiOut.prototype.midiFail = function () {
        console.warn('could not get midi access!');
    };
    MidiOut.prototype.getMidiMessage = function (message) {
        console.log('midi data', message.data, 'message', message);
    };
    MidiOut.prototype.send = function (message, deadline) {
        var _this = this;
        if (!this.midi) {
            console.warn('tried to play keys but midi was not ready');
            return;
        }
        console.log('send', message, deadline);
        this.midi.outputs.forEach(function (output) {
            if (true || output.name === _this.output) {
                output.send(message);
            }
        });
    };
    MidiOut.prototype.noteOn = function (key, velocity, deadline) {
        if (velocity === void 0) { velocity = 127; }
        if (deadline === void 0) { deadline = 0; }
        this.send([144, key, 0x7f], deadline); //velocity
    };
    MidiOut.prototype.noteOff = function (key, velocity, deadline) {
        if (velocity === void 0) { velocity = 127; }
        if (deadline === void 0) { deadline = 0; }
        this.send([144, key, 0], deadline); //velocity
    };
    MidiOut.prototype.playKeys = function (keys, settings) {
        if (settings === void 0) { settings = {}; }
        /* if (!this.midi) {
            console.warn('tried to play keys but midi was not ready');
            return;
        }
        this.midi.outputs.forEach(output => {
            console.log(keys, 'send to', output);
            keys.forEach(key => {
                output.send([144, key, 9]);
            })
        });
    } */
    };
    return MidiOut;
}(Instrument_1.Instrument));
exports.MidiOut = MidiOut;
