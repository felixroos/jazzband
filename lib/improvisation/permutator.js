"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var swing_1 = require("../grooves/swing");
var tonal_1 = require("tonal");
var util_1 = require("../util");
var Improvisation_1 = require("./Improvisation");
exports.permutator = new Improvisation_1.Improvisation({
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
