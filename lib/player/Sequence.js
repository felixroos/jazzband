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
var Sheet_1 = require("../sheet/Sheet");
var Harmony_1 = require("../harmony/Harmony");
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var tonal_3 = require("tonal");
var util_1 = require("../util/util");
var Logger_1 = require("../util/Logger");
var __1 = require("..");
var tonal_4 = require("tonal");
var Pattern_1 = require("../util/Pattern");
var Leadsheet_1 = require("./Leadsheet");
var Rhythm_1 = require("../sheet/Rhythm");
var Sequence = /** @class */ (function () {
    function Sequence() {
    }
    Sequence.getSignType = function (symbol) {
        return Object.keys(Sheet_1.Sheet.sequenceSigns).find(function (type) {
            return Sheet_1.Sheet.sequenceSigns[type].includes(symbol);
        });
    };
    Sequence.getOptions = function (options) {
        return __assign({ bpm: 120 }, options);
    };
    Sequence.isBefore = function (a, b) {
        return a.time < b.time + b.duration;
    };
    Sequence.isAfter = function (a, b) {
        return a.time + a.duration > b.time;
    };
    Sequence.isOverlapping = function (a, b) {
        return this.isBefore(a, b) && this.isAfter(a, b);
    };
    Sequence.isTouching = function (a, b) {
        return a.time <= b.time + b.duration && a.time + a.duration >= b.time;
    };
    Sequence.isInside = function (a, b) {
        return a.time >= b.time && a.time + a.duration <= b.time + b.duration;
    };
    Sequence.isOff = function (event) {
        return Rhythm_1.Rhythm.time(event.divisions.slice(1), event.path.slice(1), 8) % 2 === 1;
    };
    Sequence.renderGrid = function (measures, options) {
        options = this.getOptions(options);
        var renderedMeasures = Sheet_1.Sheet.render(measures, options);
        var flat = Rhythm_1.Rhythm.flatten(renderedMeasures)
            .map(function (event) { return (__assign({}, event, { measure: renderedMeasures[event.path[0]] })); });
        return this.renderEvents(flat, options);
    };
    Sequence.renderMeasures = function (measures, options) {
        options = this.getOptions(options);
        var renderedMeasures = Sheet_1.Sheet.render(measures, __assign({}, options));
        // TODO add measureStartTime / measureEndTime for easier access later
        // seperate chords before flattening // => "chords" also used for melody, need rename...
        var chords = renderedMeasures.map(function (e) { return e.body; });
        var flat = Rhythm_1.Rhythm.flatten(chords)
            .map(function (event) { return (__assign({}, event, { measure: renderedMeasures[event.path[0]], options: renderedMeasures[event.path[0]].options })); });
        return this.renderEvents(flat, options);
    };
    Sequence.addPaths = function (a, b) {
        var _a;
        _a = [a, b].sort(function (a, b) { return b.length - a.length; }), a = _a[0], b = _a[1];
        return a.map(function (n, i) { return n + (b[i] || 0); });
    };
    Sequence.fillGrooves = function (groove, sourceEvents, mapFn, options) {
        var _this = this;
        if (mapFn === void 0) { mapFn = function (_a) {
            var target = _a.target;
            return target;
        }; }
        var _a = Sequence.getOptions(options), bpm = _a.bpm, pulses = _a.pulses, offsPlayNext = _a.offsPlayNext;
        options = { bpm: bpm, pulses: pulses, offsPlayNext: offsPlayNext };
        var grooveEvents, grooveMeasures;
        if (typeof groove !== 'function') {
            grooveMeasures = groove;
            grooveEvents = Sequence.renderMeasures(grooveMeasures, options);
        }
        if (!sourceEvents.length) {
            console.error('no events given to fillGrooves');
            return sourceEvents;
        }
        var last = sourceEvents[sourceEvents.length - 1];
        var events = [];
        var bar = 0;
        var barLength = 60 / options.bpm * (options.pulses || 4);
        var _loop_1 = function () {
            if (typeof groove === 'function') {
                grooveMeasures = groove();
                grooveEvents = Sequence.renderMeasures(grooveMeasures, options);
            }
            var time = bar * barLength;
            var insert = grooveEvents
                .map(function (e) { return (__assign({}, e, { path: Sequence.addPaths([bar], e.path), time: e.time + time })); })
                .filter(function (e) { return e.value !== 0; })
                .filter(function (e) { return e.duration > 0; })
                .map(function (target, index) {
                var source = sourceEvents.find(function (chordEvent) { return _this.isOverlapping(target, chordEvent); });
                source = Sequence.getNextChordOff({ target: target, source: source, sourceEvents: sourceEvents, options: options }) || source;
                if (!source) {
                    console.warn('no source found for target', target, sourceEvents);
                    return;
                }
                return mapFn({ target: target, source: source, index: index, grooveEvents: grooveEvents, sourceEvents: sourceEvents, options: options });
            }).filter(function (e) { return !!e; });
            bar += grooveMeasures.length; // number of bars added
            events = events.concat(insert);
        };
        while (bar < last.path[0]) {
            _loop_1();
        }
        return events;
    };
    Sequence.insertGrooves = function (groove, sourceEvents, mergeFn, options) {
        if (mergeFn === void 0) { mergeFn = function (_a) {
            var target = _a.target;
            return target;
        }; }
        var _a = Sequence.getOptions(options), bpm = _a.bpm, pulses = _a.pulses, offsPlayNext = _a.offsPlayNext;
        options = { bpm: bpm, pulses: pulses, offsPlayNext: offsPlayNext };
        var grooveEvents;
        if (typeof groove !== 'function') {
            grooveEvents = Sequence.renderMeasures(groove, options);
        }
        return sourceEvents.reduce(function (events, source) {
            if (typeof groove === 'function') {
                grooveEvents = Sequence.renderMeasures(groove(source, events), options);
            }
            var insert = grooveEvents
                .map(function (e) { return (__assign({}, e, { path: Sequence.addPaths(source.path, e.path), time: e.time + source.time })); })
                .map(function (target, index) {
                var next = Sequence.getNextChordOff({ target: target, source: source, sourceEvents: sourceEvents, options: options });
                index = next ? 0 : index;
                return mergeFn({ target: target, source: next || source, index: index, grooveEvents: grooveEvents, sourceEvents: sourceEvents, options: options });
            })
                .filter(function (e) { return e.value !== 0; })
                .filter(function (e) { return e.duration > 0; })
                // remove all events that overlap?!?! maybe just cut the duration at the end?
                .filter(function (e) { return (e.time + e.duration) <= source.time + source.duration; });
            events = events.concat(insert);
            return events;
        }, []);
    };
    Sequence.melodyGroove = function () {
        return function (_a) {
            var target = _a.target, source = _a.source, index = _a.index, grooveEvents = _a.grooveEvents;
            var root = Harmony_1.Harmony.getBassNote(source.chord, true);
            // TODO use required/optional notes?!
            var scales = __1.util
                .getChordScales(source.chord, 'Diatonic')
                .filter(function (s) { return tonal_4.Scale.notes('C', s).length === 7; });
            if (!scales.length) {
                console.warn('no scales for', source.chord);
            }
            var scale = root + ' ' + scales[0];
            var pattern = grooveEvents.map(function (e) { return e.value; });
            var notes = Pattern_1.Pattern.scale(scale, pattern, ['F1', 'F#3']);
            return __assign({}, target, { value: tonal_1.Note.simplify(notes[index]), degree: pattern[index] });
        };
    };
    Sequence.chordGroove = function () {
        return function (_a) {
            var target = _a.target, source = _a.source;
            return __assign({}, source, target, { value: source.value, chord: source.chord, type: 'chord', duration: target.duration * target.value });
        };
    };
    Sequence.renderEvents = function (events, options) {
        if (options === void 0) { options = {}; }
        events = events
            // .reduce(Sequence.addLatestOptions(options), [])
            .reduce(Sequence.addTimeAndDuration(options), [])
            .filter(options.filterEvents || (function () { return true; }))
            .map(options.mapEvents || (function (e) { return e; }))
            .reduce(Sequence.prolongNotes(options), []);
        if (options.reduceEvents) {
            events = events.reduce(options.reduceEvents, []);
        }
        return events;
    };
    Sequence.renderGroove = function (sequence, options) {
        if (!options.groove) {
            var voicings = sequence = sequence.reduce(Sequence.renderVoicings(options), []);
            return sequence.concat(voicings);
        }
        return Object.keys(options.groove).reduce(function (groovyEvents, current) {
            return groovyEvents.concat(options.groove[current](sequence, options));
        }, []);
    };
    Sequence.render = function (sheet) {
        sheet = Leadsheet_1.Leadsheet.from(sheet);
        var sequence = [], melody = [], bass = [], chords = [];
        if (sheet.chords) {
            chords = Sequence.renderMeasures(sheet.chords, sheet.options).map(function (e) { return (__assign({}, e, { chord: e.value, type: 'chord' })); });
            /* const walk = Sequence.renderGrid(sheet.chords, sheet.options).map(measure => {
              const feel = measure.options.feel === undefined ? 4 : measure.options.feel;
              return Array(feel).fill('X')
            }); */
            /* console.log('grid', Sheet.flatten(walk, true)); */
            bass = chords.reduce(Sequence.renderBass(sheet.options), []);
            /* bass = bass.map(Sequence.addFermataToEnd(sheet.options)); */
        }
        if (sheet.melody) {
            melody = Sequence.renderMeasures(sheet.melody, __assign({}, sheet.options, { filterEvents: Sequence.inOut() // play melody only first and last time
             })).map(function (e) { return (__assign({}, e, { type: 'melody' })); });
            chords = chords.map(function (e, i) {
                return Sequence.duckChordEvent(sheet.options)(e, i, melody);
            });
            // sequence = sequence.map(Sequence.duckChordEvent(sheet.options));
        }
        /* const voicings = chords
        .map(Sequence.addFermataToEnd(sheet.options))
        .reduce(Sequence.renderVoicings(sheet.options), [])
        .reduce(Sequence.pedalNotes(sheet.options), []);
        sequence = sequence.concat(voicings);
        */
        sequence = sequence.concat(chords); // not voiced yet..
        //.map(Sequence.addFermataToEnd(sheet.options))
        // .reduce(Sequence.renderVoicings(sheet.options), [])
        //.reduce(Sequence.pedalNotes(sheet.options), [])
        sequence = sequence.concat(bass);
        if (melody) {
            sequence = sequence.concat(melody);
            sequence = sequence.sort(function (a, b) { return a.time - b.time; });
            sequence = sequence.filter(Sequence.removeDuplicates(sheet.options));
        }
        sequence = Sequence.renderGroove(sequence, sheet.options);
        sequence = sequence.map(function (event, index, events) {
            // const pathEvents = events.filter(e => Rhythm.haveSamePath(e, event));
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
    Sequence.testEvents = function (props) { return function (event) {
        return props.reduce(function (reduced, prop) {
            var _a;
            return (__assign({}, reduced, (_a = {}, _a[prop] = event[prop], _a)));
        }, {});
    }; };
    Sequence.addLatestOptions = function (options) {
        if (options === void 0) { options = {}; }
        return function (events, event, index) {
            var last = (events.length ? events[events.length - 1] : null);
            var combinedOptions = __assign({}, options, (last ? last.options : {}), event.options, (event.value.options || {}));
            return events.concat(__assign({}, event, { options: combinedOptions }));
        };
    };
    Sequence.addTimeAndDuration = function (options) {
        if (options === void 0) { options = {}; }
        return function (events, event, index) {
            options = Sequence.getOptions(__assign({}, options, (event.options || {})));
            var pulses = options.pulses || 4;
            var last = (events.length ? events[events.length - 1] : null);
            var whole = (60 / options.bpm) * pulses * event.divisions[0];
            return events.concat(__assign({}, event, { options: options, velocity: 1, duration: Rhythm_1.Rhythm.duration(event.divisions, whole), time: last ? last.time + last.duration : 0 }));
        };
    };
    Sequence.pedalNotes = function (options) {
        return function (reduced, event, index, events) {
            if (!options.pedal) {
                return reduced.concat([event]);
            }
            var latestEvent;
            var latest = [].concat(reduced).reverse();
            latestEvent = latest.find(function (_a) {
                var time = _a.time, duration = _a.duration, value = _a.value;
                return value === event.value && (time + duration) === event.time;
            });
            if (!!latestEvent) {
                latestEvent.duration += event.duration;
                return reduced;
            }
            else {
                return reduced.concat([event]);
            }
        };
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
            if (latestEvent &&
                latest.indexOf(events.indexOf(latestEvent) > events.indexOf(latestRest))) {
                latestEvent.duration += event.duration;
            }
            return reduced;
        };
    };
    Sequence.renderVoicings = function (options) {
        if (options === void 0) { options = {}; }
        return function (events, event, index) {
            if (event.type !== 'chord') {
                return events.concat([event]);
            }
            var previousVoicing = [];
            if (index > 0) {
                var previousEvent_1 = events[index - 1];
                previousVoicing = previousEvent_1
                    ? events.filter(function (e) { return Rhythm_1.Rhythm.haveSamePath(previousEvent_1, e); })
                    : [];
                previousVoicing = previousVoicing.map(function (e) { return e.value; });
            }
            var voicingOptions = __assign({}, options.voicings, event.options.voicings);
            var voicing = Voicing_1.Voicing.getNextVoicing(event.value, previousVoicing, voicingOptions);
            if (!voicing) {
                console.error("error getting voicing for chord \"" + event.value + "\" after voicing " + previousVoicing + ", using options " + voicingOptions);
                return events;
            }
            return events.concat(voicing.map(function (note, index) {
                return __assign({}, event, { value: note, type: 'chordnote', chord: event.chord });
            }));
        };
    };
    Sequence.addFermataToEnd = function (options) {
        return function (event, index, events) {
            var duration = event.duration;
            if (index === events.length - 1 && options.fermataLength) {
                duration *= options.fermataLength;
            }
            return __assign({}, event, { duration: duration });
        };
    };
    Sequence.renderBass = function (options) {
        return function (events, event) {
            var duration = event.duration;
            if (event.type !== 'chord') {
                return events.concat([event]);
            }
            var root = Harmony_1.Harmony.getBassNote(event.value) + '2';
            events.push(__assign({}, event, { value: root, type: 'bass', duration: duration }));
            return events;
        };
    };
    Sequence.duckChordEvent = function (options) {
        return function (event, index, events) {
            if (event.type !== 'chord') {
                return event;
            }
            var melody = events.filter(function (e) { return !e.chord && Harmony_1.Harmony.isValidNote(e.value); });
            var topNote;
            if (options.tightMelody) {
                topNote = melody.find(function (n) { return Rhythm_1.Rhythm.haveSamePath(n, event) && Harmony_1.Harmony.isValidNote(n.value); }
                // n => Sequence.isInside(n, event) && Harmony.isValidNote(n.value)
                );
            }
            // TODO: allow contained melody notes to be optional topNotes..
            var surroundingMelody = melody
                //.filter(n => Math.abs(event.time - n.time) <= duckTime)
                .filter(function (m) { return Sequence.isTouching(event, m); })
                /* .filter(m => Sequence.isOverlapping(event, m)) */
                .sort(function (a, b) { return tonal_1.Note.midi(a.value) - tonal_1.Note.midi(b.value); });
            var range = options.voicings.range;
            if (!topNote && surroundingMelody.length) {
                var below = tonal_2.Distance.transpose(surroundingMelody[0].value, tonal_3.Interval.fromSemitones(-options.voicings.minTopDistance));
                range = [range[0], below];
            }
            else {
                range = [range[0], range[1]];
            }
            return __assign({}, event, { options: __assign({}, event.options, { voicings: __assign({}, (event.options.voicings || {}), (topNote ? {
                        topNotes: [topNote.value],
                    } : {}), { range: range }) }) });
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
            return __assign({}, event, { velocity: ((event.velocity * index) / events.length) * velocitySpan +
                    options.dynamicVelocityRange[0] });
        };
    };
    Sequence.velocityFromPitch = function (options) {
        return function (event, index, events) {
            var midiValues = events.map(function (e) { return tonal_1.Note.midi(e.value); });
            var maxMidi = util_1.maxArray(midiValues);
            var avgMidi = util_1.avgArray(midiValues);
            return __assign({}, event, { velocity: (event.velocity * avgMidi) / maxMidi });
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
        var isOff = Sequence.isOff(event);
        if (!isOff) {
            // return event
            return events.concat([event]);
        }
        var swingOffset = ((options.swing / 2) * 60) / options.bpm;
        event = __assign({}, event, { time: event.time + swingOffset, 
            /* color: 'black', */
            duration: event.duration - swingOffset, velocity: event.velocity + 0.1 });
        return events.concat([event]);
        /* const eventBefore = []
          .concat(events)
          .reverse()
          .find(b => b.time < event.time);
        if (!eventBefore) {
          return events.concat([event]);
        }
        return events
          .map((e, i) => {
            if (Rhythm.haveSamePath(e, eventBefore)) {
              e.duration += swingOffset;
            }
            return e;
          })
          .concat([event]); */
    }; };
    Sequence.inOut = function () { return function (event, index, events) {
        return event.measure.form === 0 || event.measure.form === event.measure.totalForms;
    }; };
    Sequence.removeDuplicates = function (options) { return function (event, index, events) {
        if (!options.phantomMelody) {
            var duplicate = events.find(function (e, i) {
                return i !== index &&
                    Harmony_1.Harmony.hasSamePitch(e.value, event.value) &&
                    Rhythm_1.Rhythm.haveSamePath(e, event);
            });
            return !duplicate || !event.chord; // always choose melody note
        }
        var melody = events
            .filter(function (e) { return e.type !== 'chord'; })
            .find(function (e, i) {
            return i !== index &&
                Harmony_1.Harmony.hasSamePitch(e.value, event.value) &&
                Rhythm_1.Rhythm.haveSamePath(e, event);
        });
        return !melody;
    }; };
    Sequence.getNextChordOff = function (_a) {
        var target = _a.target, source = _a.source, sourceEvents = _a.sourceEvents, options = _a.options;
        if (options.offsPlayNext && Sequence.isOff(target)) {
            var eigth = 60 / options.bpm / 2;
            var next = sourceEvents[sourceEvents.indexOf(source) + 1];
            if (next && next.time - target.time <= eigth) {
                return next;
            }
        }
    };
    return Sequence;
}());
exports.Sequence = Sequence;
// OLD bass trying bjorklund
/*
       const chordsInBar = chords.filter(e => e.path[0] === bar);
      // place events into feel grid e.g. [0, false, 1, false] for two chords in 4 feel
      const placed = Permutation.bjorklund(feel, chordsInBar.length).reduce(
        (chords, current) => {
          const index = chords.filter(chord => chord !== false).length;
          chords.push(current ? index : false);
          return chords;
        },
        []
      );

      placed.forEach((slot, i) => {
        const isFirst = slot !== false;
        if (!isFirst) {
          slot = placed
            .slice(0, i)
            .reverse()
            .find(s => s !== false);
          if (slot === undefined) {
            console.log('no slot before', i);
            return;
          }
        }
        let chord = chordsInBar[slot];
        const indexSinceLastRoot = i - placed.indexOf(slot);

        const root = Harmony.getBassNote(event.value) + '2';
        const fifth = Distance.transpose(root, '5P');
        const note = indexSinceLastRoot % 2 == 0 ? root : fifth;
        events.push({
          ...event,
          value: note,
          duration
        });
      });

      */ 
