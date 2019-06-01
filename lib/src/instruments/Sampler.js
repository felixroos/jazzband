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
var util_1 = require("../util/util");
var Sampler = /** @class */ (function (_super) {
    __extends(Sampler, _super);
    function Sampler(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.buffers = {};
        _this.duration = 10000;
        _this.type = 'sine';
        _this.gain = 1;
        _this.attack = 0;
        _this.decay = 0;
        _this.sustain = 1;
        _this.release = .2;
        _this.gain = options.gain || _this.gain;
        _this.gainNode = _this.context.createGain();
        _this.gainNode.connect(_this.context.destination);
        _this.duration = options.duration || _this.duration;
        // this.overlap = options.overlap;
        if (options.samples) {
            _this.sources = options.samples;
            _this.ready = _this.loadSources(options.samples);
        }
        return _this;
    }
    // returns buffer from buffer cache or loads buffer data from source
    Sampler.prototype.getBuffer = function (src, context) {
        var _this = this;
        if (context === void 0) { context = this.context; }
        if (this.buffers[src] && this.buffers[src].context === context) {
            // console.log('buffer already present');
            return Promise.resolve(this.buffers[src].buffer);
        }
        return fetch(src)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buffer) {
            return new Promise(function (resolve, reject) {
                context.decodeAudioData(buffer, function (decodedData) {
                    _this.buffers[src] = { buffer: decodedData, context: context };
                    resolve(decodedData);
                });
            });
        });
    };
    Sampler.prototype.getSource = function (buffer, connect) {
        var source = this.context.createBufferSource();
        connect = connect || this.gainNode;
        source.buffer = buffer;
        source.connect(connect);
        return source;
    };
    Sampler.prototype.getSources = function (sources, context) {
        var _this = this;
        if (context === void 0) { context = this.context; }
        if (!this.hasLoaded(sources)) {
            console.error('not all sources loaded!!!');
            return [];
        }
        return sources.map(function (source) { return _this.getSource(_this.buffers[source].buffer); });
    };
    // loads a sound file into the context
    Sampler.prototype.loadSource = function (src, context) {
        var _this = this;
        if (context === void 0) { context = this.context; }
        return this.getBuffer(src, context)
            .then(function (decodedData) { return _this.getSource(decodedData); });
    };
    // loads multiple sources into the context
    Sampler.prototype.loadSources = function (sources, context) {
        var _this = this;
        if (context === void 0) { context = this.context; }
        sources.forEach(function (source, i) {
            if (!source) {
                console.warn("note at index " + i + " cannot be played!");
            }
        });
        return Promise.all(sources.filter(function (source) { return !!source; }).map(function (source) { return _this.loadSource(source, context); }));
    };
    Sampler.prototype.hasLoaded = function (sources, context) {
        var _this = this;
        if (context === void 0) { context = this.context; }
        return sources.reduce(function (allLoaded, src) {
            return allLoaded && _this.buffers[src] && _this.buffers[src].context === context;
        }, true);
    };
    Sampler.prototype.playSounds = function (sounds, deadline, interval) {
        if (deadline === void 0) { deadline = this.context.currentTime; }
        if (interval === void 0) { interval = 0; }
        sounds.forEach(function (sound, i) { return sound.start(deadline + interval * i); });
    };
    Sampler.prototype.playSource = function (source, settings) {
        var gainNode = this.context.createGain();
        if (!this.buffers[source]) {
            console.warn('no buffer found for source', source);
            return;
        }
        var sound = this.getSource(this.buffers[source].buffer, gainNode);
        var _a = [
            settings.attack || this.attack,
            settings.decay || this.decay,
            settings.sustain || this.sustain,
            settings.release || this.release,
            (settings.duration || this.duration) / 1000,
            (settings.gain || 1) * this.gain
        ], attack = _a[0], decay = _a[1], sustain = _a[2], release = _a[3], duration = _a[4], gain = _a[5];
        var time = settings.deadline || this.context.currentTime;
        //gainNode.gain.value = typeof settings.gain === 'number' ? settings.gain : this.gain;
        gainNode.connect(this.mix);
        util_1.adsr({ attack: attack, decay: decay, sustain: sustain, release: release, gain: gain, duration: duration }, time, gainNode.gain);
        this.playSounds([sound], time); //, settings.interval
    };
    /* playSources(sources, deadline = 0, interval = 0) {
        if (this.hasLoaded(sources, this.context)) {
            this.playSounds(this.getSources(sources, this.context), deadline, interval)
        } else {
            console.warn('need to load');
            this.loadSources(sources, this.context)
                .then(sounds => this.playSounds(sounds, deadline, interval));
        }
    } */
    Sampler.prototype.playKeys = function (keys, settings) {
        var _this = this;
        _super.prototype.playKeys.call(this, keys, settings);
        keys.forEach(function (key, index) {
            if (settings.delay) {
                settings.deadline += settings.delay;
            }
            _this.playSource(_this.sources[key], settings);
        });
    };
    return Sampler;
}(Instrument_1.Instrument));
exports.Sampler = Sampler;
