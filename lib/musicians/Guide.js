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
var util_1 = require("../util");
var Musician_1 = require("./Musician");
var tonal_1 = require("tonal");
var swing_1 = require("../grooves/swing");
var Improvisation_1 = require("../improvisation/Improvisation");
var Guide = /** @class */ (function (_super) {
    __extends(Guide, _super);
    function Guide(instrument) {
        var _this = _super.call(this, instrument) || this;
        _this.range = ['C3', 'C6'];
        var improvisation = new Improvisation_1.Improvisation({
            defaults: { groove: swing_1.swing },
            groove: function (_a) {
                var settings = _a.settings, defaults = _a.defaults;
                return settings().groove || defaults().groove;
            },
            octave: 5,
            direction: 'down',
            force: false,
            flip: false,
            playedNotes: [],
            lastNote: function (_a) {
                var playedNotes = _a.playedNotes;
                return playedNotes().length ? playedNotes()[0] : null;
            },
            material: function (_a) {
                var pattern = _a.pattern, chord = _a.chord;
                return util_1.getPatternInChord(pattern(), chord());
            },
            randomNote: function (_a) {
                var material = _a.material, octave = _a.octave;
                return util_1.randomElement(material()) + octave();
            },
            note: function (_a) {
                var lastNote = _a.lastNote, randomNote = _a.randomNote, material = _a.material, direction = _a.direction, force = _a.force, flip = _a.flip;
                var note;
                if (!lastNote()) {
                    note = randomNote();
                }
                else {
                    note = util_1.getNearestTargets(lastNote(), material(), direction(), force(), flip())[0];
                    note = tonal_1.Note.simplify(note, true);
                }
                note = util_1.transposeToRange([note], _this.range)[0];
                return note;
            }
        });
        var guideTones = improvisation.enhance({
            groove: function () { return (function (m) {
                return m.measure.map(function () { return [1]; });
            }); },
            pattern: [3, 7],
        });
        var guideTonesFlipped = guideTones.enhance({
            flip: true
        });
        var chordTones = improvisation.enhance({
            pattern: [1, 3, 5, 7],
            variance: .5,
            variety: .5,
            drill: .6,
            direction: function (_a) {
                var drill = _a.drill;
                return drill() > 0 ? 'up' : 'down';
            },
            force: function (_a) {
                var drill = _a.drill;
                return Math.random() * Math.abs(drill()) > .5;
            },
            exclude: function (_a) {
                var variety = _a.variety, pattern = _a.pattern;
                return Math.floor(variety() * pattern().length - 1);
            },
            targets: function (_a) {
                var variance = _a.variance, pattern = _a.pattern;
                return ((variance() * pattern().length + 1) % pattern().length);
            },
            material: function (_a) {
                var pattern = _a.pattern, chord = _a.chord, playedNotes = _a.playedNotes, exclude = _a.exclude;
                var all = util_1.getPatternInChord(pattern(), chord());
                if (!playedNotes().length) {
                    return all;
                }
                var excludeNotes = playedNotes()
                    .slice(0, exclude())
                    .map(function (n) { return tonal_1.Note.pc(n); });
                return all.filter(function (n) { return !excludeNotes.includes(n); });
            },
            note: function (_a) {
                var material = _a.material, octave = _a.octave, playedNotes = _a.playedNotes, lastNote = _a.lastNote, direction = _a.direction, force = _a.force, flip = _a.flip, targets = _a.targets;
                var note;
                if (!playedNotes().length) {
                    note = util_1.randomElement(material()) + octave();
                }
                else {
                    note = util_1.randomElement(util_1.getNearestTargets(lastNote(), material(), direction(), force(), flip())
                        .slice(0, targets()));
                    note = tonal_1.Note.simplify(note, true);
                }
                note = util_1.transposeToRange([note], _this.range)[0];
                return note;
            }
        });
        _this.methods = {
            guideTones: guideTones,
            guideTonesFlipped: guideTonesFlipped,
            chordTones: chordTones
        };
        return _this;
    }
    Guide.prototype.play = function (_a) {
        var _this = this;
        var measures = _a.measures, pulse = _a.pulse, settings = _a.settings;
        var method = this.methods.guideTones;
        method.mutate(function () { return ({ settings: settings }); });
        var groove = method.get('groove');
        measures = measures
            .map(function (measure) { return groove({ measures: measures, measure: measure, settings: settings, pulse: pulse }).slice(0, Math.floor(settings.cycle)); })
            .map(function (pattern, i) { return util_1.resolveChords(pattern, measures, [i]); });
        pulse.tickArray(measures, function (tick) {
            _this.improvise(tick, measures, pulse, method);
        }, settings.deadline);
    };
    Guide.prototype.improvise = function (_a, measures, pulse, method) {
        var _this = this;
        var value = _a.value, cycle = _a.cycle, path = _a.path, deadline = _a.deadline, interval = _a.interval;
        var chord = value.chord;
        if (chord === 'N.C.') {
            return;
        }
        method.mutate(function () { return ({ chord: chord }); })
            .mutate(function (_a) {
            var note = _a.note, playedNotes = _a.playedNotes;
            var duration = value.fraction * pulse.getMeasureLength();
            _this.instrument.playNotes([note()], { deadline: deadline, interval: interval, gain: 1, duration: duration, pulse: pulse });
            return {
                playedNotes: [note()].concat(playedNotes())
            };
        });
    };
    return Guide;
}(Musician_1.Musician));
exports.default = Guide;
