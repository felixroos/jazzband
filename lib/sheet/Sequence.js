"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Voicing_1 = require("../harmony/Voicing");
var Sheet_1 = require("./Sheet");
var Harmony_1 = require("../harmony/Harmony");
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var tonal_3 = require("tonal");
var util_1 = require("../util/util");
var Logger_1 = require("../util/Logger");
var Sequence = /** @class */ (function () {
    function Sequence() {
    }
    Sequence.fraction = function (divisions, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (f, d) { return f / d; }, whole);
    };
    Sequence.time = function (divisions, path, whole) {
        if (whole === void 0) { whole = 1; }
        return divisions.reduce(function (_a, d, i) {
            var f = _a.f, p = _a.p;
            return ({ f: f / d, p: p + f / d * path[i] });
        }, { f: whole, p: 0 }).p;
    };
    Sequence.simplePath = function (path) {
        return path.join('.').replace(/(\.0)*$/, ''); //.split('.');
    };
    Sequence.haveSamePath = function (a, b) {
        return Sequence.simplePath(a.path) === Sequence.simplePath(b.path);
    };
    Sequence.getSignType = function (symbol) {
        return Object.keys(Sheet_1.Sheet.sequenceSigns).find(function (type) { return Sheet_1.Sheet.sequenceSigns[type].includes(symbol); });
    };
    Sequence.getEvents = function (events, whole) {
        if (whole === void 0) { whole = 1; }
        return events.map(function (event) {
            return __assign({}, event, { velocity: 1, duration: Sequence.fraction(event.divisions, whole), time: Sequence.time(event.divisions, event.path, whole) });
        });
    };
    Sequence.renderEvents = function (measures, options, inOut) {
        if (inOut === void 0) { inOut = false; }
        var rendered = Sheet_1.Sheet.render(measures, options);
        if (inOut) {
            rendered = rendered.map(function (e) {
                if (!e.firstTime && !e.lastTime) {
                    e.chords = [];
                }
                return e;
            });
        }
        var chords = rendered.map(function (e) { return e.chords; });
        var flat = Sheet_1.Sheet.flatten(chords, true);
        var multiplier = 60 / options.bpm * 4 * chords.length;
        return Sequence.getEvents(flat, multiplier).reduce(Sequence.prolongNotes(options), []);
    };
    Sequence.render = function (sheet) {
        sheet = Sheet_1.Sheet.from(sheet);
        var sequence = [], melody = [];
        if (sheet.chords) {
            sequence = Sequence.renderEvents(sheet.chords, sheet.options).map(function (e) { return (__assign({}, e, { chord: e.value })); });
        }
        if (sheet.melody) {
            melody = Sequence.renderEvents(sheet.melody, sheet.options, true);
            sequence = sequence.map(function (e, i) { return Sequence.duckChordEvent(sheet.options)(e, i, melody); });
            // sequence = sequence.map(Sequence.duckChordEvent(sheet.options));
        }
        sequence = sequence.reduce(Sequence.renderVoicings(sheet.options), []);
        if (melody) {
            sequence = sequence.concat(melody);
            sequence = sequence.sort(function (a, b) { return a.time - b.time; });
            sequence = sequence.filter(Sequence.removeDuplicates(sheet.options));
        }
        sequence = sequence.map(function (event, index, events) {
            // const pathEvents = events.filter(e => Sequence.haveSamePath(e, event));
            event = Sequence.humanizeEvent(sheet.options)(event, index, sequence);
            event = Sequence.addDynamicVelocity(sheet.options)(event, index, sequence);
            return event;
        });
        sequence = sequence.reduce(Sequence.addSwing(sheet.options), []);
        if (sheet.options.logging) {
            Logger_1.Logger.logSequence(sequence);
        }
        return sequence;
    };
    Sequence.prolongNotes = function (options) {
        return function (reduced, event, index, events) {
            var type = Sequence.getSignType(event.value);
            if (type !== 'prolong') {
                return reduced.concat([event]);
            }
            var latest = [].concat(reduced).reverse();
            var latestRest = latest.find(function (e) { return Sequence.getSignType(e.value) === 'rest'; });
            var latestEvent = latest.find(function (e) { return !Sequence.getSignType(e.value); });
            if (latestEvent && latest.indexOf(events.indexOf(latestEvent) > events.indexOf(latestRest))) {
                latestEvent.duration += event.duration;
            }
            return reduced;
        };
    };
    Sequence.renderVoicings = function (options) {
        return function (events, event, index) {
            if (!event.chord) {
                return events.concat([event]);
            }
            var previousVoicing = [];
            if (index > 0) {
                var previousEvent_1 = events[index - 1];
                previousVoicing = previousEvent_1 ? events.filter(function (e) { return Sequence.haveSamePath(previousEvent_1, e); }) : [];
                previousVoicing = previousVoicing.map(function (e) { return e.value; });
            }
            var voicingOptions = __assign({}, options.voicings, event.voicings);
            var voicing = Voicing_1.Voicing.getNextVoicing(event.value, previousVoicing, voicingOptions);
            var time = event.time, duration = event.duration;
            if (index === events.length - 1 && options.fermataLength) {
                duration *= options.fermataLength;
            }
            return events.concat(voicing.map(function (note, index) {
                return __assign({}, event, { value: note, time: time,
                    duration: duration, chord: event.value });
            }));
        };
    };
    Sequence.duckChordEvent = function (options) {
        return function (event, index, events) {
            if (!event.chord) {
                return event;
            }
            var melody = events.filter(function (e) { return !e.chord && Harmony_1.Harmony.isValidNote(e.value); });
            var topNote = melody.find(function (n) { return Sequence.haveSamePath(n, event) && Harmony_1.Harmony.isValidNote(n.value); });
            var duckTime = Math.max(event.duration, 60 / options.bpm * options.duckMeasures * 4);
            // TODO calculate active melody notes with time + duration
            var surroundingMelody = melody
                .filter(function (n) { return Math.abs(event.time - n.time) <= duckTime; })
                .sort(function (a, b) { return tonal_1.Note.midi(a.value) - tonal_1.Note.midi(b.value); });
            var range = options.voicings.range;
            if (surroundingMelody.length) {
                var below = tonal_2.Distance.transpose(surroundingMelody[0].value, tonal_3.Interval.fromSemitones(options.voicings.minTopDistance));
                range = [range[0], below];
            }
            return __assign({}, event, { voicings: topNote ?
                    {
                        topNotes: options.tightMelody ? [topNote.value] : [],
                    } : {
                    /* idleChance: .5,
                    forceDirection: 'down', */
                    range: range
                } });
        };
    };
    Sequence.humanizeEvent = function (options) {
        return function (event, index, events) {
            var durationChange = event.duration * options.humanize.duration;
            return __assign({}, event, { velocity: util_1.humanize(event.velocity, options.humanize.velocity), duration: util_1.humanize(event.duration, durationChange, -durationChange), time: util_1.humanize(event.time, options.humanize.time, options.humanize.time) });
        };
    };
    Sequence.velocityFromIndex = function (options) {
        return function (event, index, events) {
            var velocitySpan = options.dynamicVelocityRange[1] - options.dynamicVelocityRange[0];
            return __assign({}, event, { velocity: event.velocity * index / events.length * velocitySpan + options.dynamicVelocityRange[0] });
        };
    };
    Sequence.velocityFromPitch = function (options) {
        return function (event, index, events) {
            var midiValues = events.map(function (e) { return tonal_1.Note.midi(e.value); });
            var maxMidi = util_1.maxArray(midiValues);
            var avgMidi = util_1.avgArray(midiValues);
            return __assign({}, event, { velocity: event.velocity * avgMidi / maxMidi });
        };
    };
    Sequence.addDynamicVelocity = function (options) {
        return function (event, index, events) {
            if (!options.dynamicVelocity) {
                return event;
            }
            event.velocity = event.velocity || 1;
            return options.dynamicVelocity(event, index, events, options);
        };
    };
    // static addSwing: EventMap = (options) => (event, index, events) => {
    Sequence.addSwing = function (options) { return function (events, event, index) {
        if (!options.swing) {
            // return event
            return events.concat([event]);
        }
        var isOff = (Sequence.time(event.divisions.slice(1), event.path.slice(1), 8) % 2) === 1;
        if (!isOff) {
            // return event
            return events.concat([event]);
        }
        var swingOffset = options.swing / 2 * 60 / options.bpm;
        event.time += swingOffset;
        event.duration -= swingOffset;
        event.velocity += 0.1;
        var eventBefore = ([].concat(events).reverse().find(function (b) { return b.time < event.time; }));
        //const eventBefore = ([].concat(events).reverse().find(b => b.time < event.time));
        if (!eventBefore) {
            return events.concat([event]);
        }
        return events.map(function (e, i) {
            if (Sequence.haveSamePath(e, eventBefore)) {
                e.duration += swingOffset;
            }
            return e;
        }).concat([event]);
    }; };
    Sequence.removeDuplicates = function (options) { return function (event, index, events) {
        if (!options.phantomMelody) {
            var duplicate = events.find(function (e, i) {
                return i !== index
                    && Harmony_1.Harmony.hasSamePitch(e.value, event.value)
                    && Sequence.haveSamePath(e, event);
            });
            return !duplicate || !event.chord; // always choose melody note
        }
        var melody = events.filter(function (e) { return !e.chord; }).find(function (e, i) {
            return i !== index
                && Harmony_1.Harmony.hasSamePitch(e.value, event.value)
                && Sequence.haveSamePath(e, event);
        });
        return !melody;
    }; };
    return Sequence;
}());
exports.Sequence = Sequence;
