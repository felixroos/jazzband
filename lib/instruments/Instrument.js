"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var Instrument = /** @class */ (function () {
    function Instrument(_a) {
        var _b = _a === void 0 ? {} : _a, context = _b.context, gain = _b.gain, mix = _b.mix, onTrigger = _b.onTrigger, midiOffset = _b.midiOffset;
        this.midiOffset = 0;
        this.gain = 1;
        this.activeEvents = [];
        this.onTrigger = onTrigger;
        this.midiOffset = midiOffset || this.midiOffset;
        this.gain = gain || this.gain;
        this.init({ context: context, mix: mix });
    }
    Instrument.prototype.init = function (_a) {
        var context = _a.context, mix = _a.mix;
        if (!context && (!mix || !mix.context)) {
            console.warn("you should pass a context or a mix (gainNode) to a new Instrument. \n            You can also Call init with {context,mix} to setup the Instrument later");
            return;
        }
        this.context = context || mix.context;
        this.mix = mix || this.context.destination;
    };
    Instrument.prototype.playNotes = function (notes, settings) {
        var _this = this;
        var midi = notes.map(function (note) { return util_1.getMidi(note, _this.midiOffset); });
        this.playKeys(midi, settings);
        var noteOff = settings.deadline + settings.duration / 1000;
        var notesOn = notes.map(function (note) { return ({ note: note, gain: settings.gain, noteOff: noteOff }); });
        this.activeEvents = this.activeEvents.concat(notesOn);
        if (this.onTrigger) {
            this.onTrigger({ on: notesOn, off: [], active: this.activeEvents });
        }
        if (settings.duration) {
            settings.pulse.clock.callbackAtTime(function (deadline) {
                // find out which notes need to be deactivated
                var notesOff = notes
                    .filter(function (note) { return !_this.activeEvents
                    .find(function (event) {
                    var keep = note === event.note && event.noteOff > deadline;
                    if (keep) {
                        console.log('keep', note);
                    }
                    return keep;
                }); }).map(function (note) { return _this.activeEvents.find(function (e) { return e.note === note; }); });
                _this.activeEvents = _this.activeEvents
                    .filter(function (e) { return !notesOff.includes(e); });
                if (_this.onTrigger) {
                    _this.onTrigger({ on: [], off: notesOff, active: _this.activeEvents });
                }
            }, noteOff);
        }
    };
    Instrument.prototype.playKeys = function (keys, settings) {
        // TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
    };
    return Instrument;
}());
exports.Instrument = Instrument;
