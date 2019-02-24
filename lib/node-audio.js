"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sampler_1 = require("./src/instruments/Sampler");
var Trio_1 = require("./src/Trio");
var piano_1 = require("./samples/piano/piano");
var drumset_1 = require("./samples/drummer/drumset");
var _AudioContext = require('web-audio-api').AudioContext;
var context = new _AudioContext;
var Speaker = require('speaker');
// create keys from piano samples with correct offset
var keys = new Sampler_1.Sampler({ samples: piano_1.piano, midiOffset: 24, gain: 1, context: context });
// create drums from drum samples
var drums = new Sampler_1.Sampler({ samples: drumset_1.drumset, context: context, gain: 0.7 });
// pass samplers to trio as instruments
context.outStream = new Speaker({
    channels: context.format.numberOfChannels,
    bitDepth: context.format.bitDepth,
    sampleRate: context.sampleRate
});
var band = new Trio_1.Trio({ context: context, piano: keys, bass: keys, drums: drums });
band.comp({ chords: ['D-7', 'G7', 'C^7', 'C^7'] }, { bpm: 120 });
