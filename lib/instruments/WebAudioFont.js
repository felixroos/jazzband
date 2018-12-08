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
var Instrument_1 = require("./Instrument");
var webaudiofont_1 = __importDefault(require("webaudiofont"));
var WebAudioFont = /** @class */ (function (_super) {
    __extends(WebAudioFont, _super);
    function WebAudioFont(props) {
        var _this = _super.call(this, props) || this;
        _this.midiOffset = 0;
        _this.player = new webaudiofont_1.default(props.context);
        console.log('player', _this.player);
        _this.player.loader.instrumentInfo(0);
        _this.cacheInstrument(props.preset);
        return _this;
    }
    WebAudioFont.prototype.cacheInstrument = function (n) {
        var _this = this;
        if (n === void 0) { n = 1; }
        var info = this.player.loader.instrumentInfo(n);
        if (window[info.variable]) {
            return;
        }
        this.player.loader.startLoad(this.context, info.url, info.variable);
        this.player.loader.waitLoad(function (preset) {
            /* this.preset = window[info.variable]; */
            console.log('cached', n, info);
            console.log('preset', window[info.variable]);
            _this.preset = window[info.variable];
        });
    };
    WebAudioFont.prototype.playKeys = function (keys, settings) {
        if (settings === void 0) { settings = {}; }
        _super.prototype.playKeys.call(this, keys, settings);
        /* const duration = settings.duration / 1000; */
        // TODO: check out https://surikov.github.io/webaudiofont/examples/ahdsr.html
        if (keys.length === 1) {
            this.player.queueWaveTable(this.context, this.context.destination, this.preset, settings.deadline, keys[0], settings.duration / 1000, settings.gain);
        }
        else {
            this.player.queueChord(this.context, this.context.destination, this.preset, settings.deadline, keys, settings.duration / 1000, settings.gain);
        }
    };
    return WebAudioFont;
}(Instrument_1.Instrument));
exports.WebAudioFont = WebAudioFont;
