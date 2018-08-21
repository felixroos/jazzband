"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var Instrument = /** @class */ (function () {
    function Instrument(_a) {
        var _b = _a === void 0 ? {} : _a, context = _b.context, gain = _b.gain, mix = _b.mix, onPlay = _b.onPlay, onStop = _b.onStop, midiOffset = _b.midiOffset;
        this.midiOffset = 0;
        this.gain = 1;
        this.onPlay = onPlay;
        this.midiOffset = midiOffset || this.midiOffset;
        this.onStop = onStop;
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
        this.playKeys(notes.map(function (note) { return util_1.getMidi(note, _this.midiOffset); }), settings);
    };
    Instrument.prototype.playKeys = function (keys, settings) {
        if (this.onPlay) {
            return this.onPlay(keys);
        }
        // TODO: fire callbacks after keys.map((key,i)=>i*settings.interval)?
    };
    return Instrument;
}());
exports.Instrument = Instrument;
