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
var tonal_1 = require("tonal");
var Harmony_1 = require("../harmony/Harmony");
var Voicing_1 = require("../harmony/Voicing");
var Snippet_1 = require("../sheet/Snippet");
var util_1 = require("./util");
var Sequence_1 = require("../player/Sequence");
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.logCustom = function (args, logFn) {
        if (logFn === void 0) { logFn = console.log; }
        /* console.clear(); */
        logFn.apply(console, args);
    };
    Logger.logLegend = function () {
        if (console.groupCollapsed) {
            console.groupCollapsed('Show Emoji Legend');
            console.table(Logger.emoji);
            console.groupEnd();
        }
        else {
            console.log('Emoji Legend:', Logger.emoji);
        }
    };
    Logger.logSequence = function (sequence) {
        /* sequence.forEach(event => {
            console.log({
                ...event,
                path: Sheet.simplePath(event.path),
                divisions: Sheet.simplePath(event.divisions),
                velocity: Math.round(event.velocity * 10) / 10
            })
        }); */
        sequence.reduce(function (blocks, event) {
            var alreadyParsed = !!blocks.find(function (b) { return Sequence_1.Sequence.haveSamePath(b, event); });
            if (alreadyParsed) {
                return blocks;
            }
            var sameTime = sequence.filter(function (e) { return Sequence_1.Sequence.haveSamePath(e, event); });
            var degrees;
            var chord = event.chord;
            if (!chord) {
                var latestChordBlock = [].concat(blocks).reverse().find(function (b) { return b.type === 'chord'; });
                chord = (latestChordBlock || {}).chord;
            }
            degrees = util_1.getStepsInChord(sameTime.map(function (e) { return e.value; }), chord, true)
                .map(function (step) { return util_1.getDegreeFromStep(step); })
                .map(function (step) { return step === 8 ? 1 : step; });
            blocks.push({ path: event.path, events: sameTime, degrees: degrees, chord: chord });
            return blocks;
        }, []).forEach(function (block) {
            var notes = block.events.map(function (e) { return e.value; });
            var konsole = Logger.logNotes({ notes: notes, active: notes, idle: [], added: [], range: ['C3', 'C6'], labels: block.degrees || notes });
            konsole.push(block.value);
            konsole.push(Sequence_1.Sequence.simplePath(block.path));
            Logger.logCustom(konsole, console.log);
        });
    };
    Logger.logSheet = function (sheet) {
        sheet = __assign({ title: 'Untitled', composer: 'Unkown', chords: [], forms: 3, tempo: 130, style: 'Swing' }, sheet);
        var chords = Snippet_1.Snippet.from(sheet.chords || []);
        var melody = Snippet_1.Snippet.from(sheet.melody || []);
        console.log(sheet.composer + " - " + sheet.title);
        console.log(sheet.tempo + "bpm, Style: " + sheet.style);
        console.log(chords);
        console.log('---');
        console.log(melody);
        if (console.groupCollapsed) {
            console.log('Sheet', sheet);
            /* console.log('Groove', sheet.groove); */
            console.groupCollapsed("show " + sheet.forms + " rendered forms");
            console.log("expanded chords\n\n" + Snippet_1.Snippet.expand(chords, { forms: sheet.forms || 1 }));
            console.log("expanded melody\n\n" + Snippet_1.Snippet.expand(melody, { forms: sheet.forms || 1 }));
            console.groupEnd();
        }
    };
    Logger.logLabel = function (key) {
        if (!Logger.emoji[key]) {
            return key;
        }
        return Logger.emoji[key].icon + ' ' + key;
    };
    Logger.logChoice = function (choice) {
        var _a;
        if (!choice) {
            return;
        }
        var difference = choice.difference, origin = choice.origin, targets = choice.targets, from = choice.from, to = choice.to, movement = choice.movement, similar = choice.similar, added = choice.added, dropped = choice.dropped, contrary = choice.contrary, parallel = choice.parallel, topInterval = choice.topInterval, bottomInterval = choice.bottomInterval, topNotes = choice.topNotes, bottomNotes = choice.bottomNotes, intervals = choice.intervals, degrees = choice.degrees;
        console.table((_a = {
                difference: difference,
                movement: movement,
                origin: origin.join(' '),
                dropped: dropped.join(' '),
                added: added.join(' '),
                targets: targets.join(' '),
                /* from: from.join(' '),
                to: to.join(' '), */
                intervals: intervals.join(' '),
                degrees: degrees.join(' ')
            },
            _a[Logger.logLabel('similar')] = similar,
            _a[Logger.logLabel('contrary')] = contrary,
            _a[Logger.logLabel('parallel')] = parallel,
            _a.topNotes = topNotes.join(' '),
            _a.topInterval = topInterval,
            _a.bottomNotes = bottomNotes.join(' '),
            _a.bottomInterval = bottomInterval,
            _a));
    };
    Logger.logNotes = function (options) {
        var _a = __assign({ labels: [] }, options), notes = _a.notes, active = _a.active, idle = _a.idle, added = _a.added, range = _a.range, labels = _a.labels;
        var span = [
            tonal_1.Distance.transpose(range[0], tonal_1.Interval.fromSemitones(-12)),
            tonal_1.Distance.transpose(range[1], tonal_1.Interval.fromSemitones(12))
        ];
        var allNotes = util_1.noteArray(span);
        var keyboard = allNotes.map(function (note, index) {
            var isActive = active.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); });
            var isUsed = notes.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); });
            var i = notes.indexOf(isUsed);
            var isIdle = idle.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); });
            var isAdded = added.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); });
            var isBlack = Harmony_1.Harmony.isBlack(note);
            var css = '', sign = '_';
            if (isAdded && !isBlack) {
                css = 'background:green;color:white;';
                sign = labels[i] || '|';
            }
            else if (isAdded && isBlack) {
                css = 'background:darkgreen;color:white;';
                sign = labels[i] || '|';
            }
            else if (isActive && isBlack) {
                css = 'background:#a50909;color:white;';
                sign = labels[i] || '|';
            }
            else if (isActive && !isBlack) {
                css = 'background:#e52929;color:white;';
                sign = labels[i] || '|';
            }
            else if (isIdle && !isBlack) {
                css = 'background:gray;color:white;';
                sign = labels[i] || '|';
            }
            else if (isIdle && isBlack) {
                css = 'background:darkgray;color:white;';
                sign = labels[i] || '|'; // █
            }
            else {
                css = isBlack ? 'color:black;' : 'color:#eee;';
            }
            var position = util_1.getRangePosition(note, range);
            if (position < 0 || position > 1) {
                if (active || idle || added) {
                    css += 'color:red;';
                    sign = ' ';
                }
                else {
                    sign = ' ';
                }
            }
            return {
                sign: sign,
                css: css
            };
        });
        var args = [
            keyboard.map(function (key) { return "%c" + key.sign; }).join('')
        ].concat((keyboard.map(function (key) { return key.css + ";"; })));
        /* Snippet.logCustom(args); */
        return args;
    };
    Logger.logVoicing = function (_a) {
        var chord = _a.chord, previousVoicing = _a.previousVoicing, logIdle = _a.logIdle, combinations = _a.combinations, bestPick = _a.bestPick, pick = _a.pick, range = _a.range, choice = _a.choice, direction = _a.direction, choices = _a.choices, options = _a.options;
        /* pick = pick.map(n => Note.simplify(n)); */
        pick = pick || [];
        previousVoicing = previousVoicing || [];
        var idle = previousVoicing.filter(function (n) { return pick.find(function (p) { return Harmony_1.Harmony.hasSamePitch(n, p); }); });
        var isIdle = choice && choice.oblique.length === choice.targets.length;
        if (isIdle && !logIdle) {
            return;
        }
        var active = pick.filter(function (n) { return !previousVoicing.find(function (p) { return Harmony_1.Harmony.hasSamePitch(n, p); }); });
        var added = choice ? choice.added : [];
        var degrees = util_1.getStepsInChord(pick, chord, true)
            .map(function (step) { return util_1.getDegreeFromStep(step); })
            .map(function (step) { return step === 8 ? 1 : step; });
        var konsole = Logger.logNotes({ notes: pick, active: active, idle: idle, added: added, range: range, labels: degrees });
        var movement = choice ? choice.movement : 0;
        var difference = choice ? choice.difference : 0;
        choices = choices || [];
        if (movement > 0) {
            konsole.push(Logger.emoji.movedUp.icon);
        }
        else if (movement < 0) {
            konsole.push(Logger.emoji.movedDown.icon);
        }
        else {
            konsole.push(Logger.emoji.equilibrium.icon);
        }
        if (!pick.length) {
            konsole.push(Logger.emoji.error.icon);
        }
        // TODO replace force with filter of choices after isInRange
        //      isInRange: checks if top and bottom note are inside the range
        if (!direction) {
            konsole.push(Logger.emoji.bestMatch.icon);
        }
        else {
            if (bestPick !== pick) {
                konsole.push(Logger.emoji.force.icon);
            }
            else {
                konsole.push(Logger.emoji.lucky.icon);
            }
            // wrong direction?
            if ((direction === 'up' && movement < 0) || (direction === 'down' && movement > 0)) {
                konsole.push(Logger.emoji.wrong.icon);
            }
        }
        if (choice) {
            if (choice.similar) {
                konsole.push(Logger.emoji.similar.icon);
            }
            if (choice.contrary) {
                konsole.push(Logger.emoji.contrary.icon);
            }
            if (choice.parallel) {
                konsole.push(Logger.emoji.parallel.icon);
            }
            if (choice.added.length && choice.added[choice.added.length - 1] === choice.topNotes[1]) {
                konsole.push(Logger.emoji.topAdded.icon);
            }
            if (choice.dropped.length && choice.dropped[choice.dropped.length - 1] === choice.topNotes[0]) {
                konsole.push(Logger.emoji.topRemoved.icon);
            }
            if (choice.dropped.length && choice.dropped[0] === choice.origin[0]) {
                konsole.push(Logger.emoji.bottomRemoved.icon);
            }
            if (choice.added.length && choice.added[0] === choice.targets[0]) {
                konsole.push(Logger.emoji.bottomAdded.icon);
            }
            if (!Voicing_1.Voicing.hasTonic(pick, chord)) {
                konsole.push(Logger.emoji.rootless.icon);
            }
            if (!choice.parallel && choice.oblique.length === 0) {
                konsole.push(Logger.emoji.noOblique.icon);
            }
            if (isIdle) {
                konsole.push(Logger.emoji.noChange.icon);
            }
        }
        if (choices.length) {
            if (choices.length < pick.length) {
                konsole.push(Logger.emoji.fewChoices.icon);
            }
        }
        konsole.push("" + chord);
        if (console && console.table) {
            Logger.logCustom(konsole, console.groupCollapsed);
            console.log(previousVoicing.join(' ') + " > " + pick.join(' ') + " (" + (choices.indexOf(choice) + 1) + ". choice of " + choices.length + ")");
            previousVoicing = previousVoicing || [];
            if (choice) {
                console.group('Choice:');
                Logger.logChoice(choice);
                console.groupEnd();
                console.log('Options', options);
                console.groupCollapsed('All Choices:');
                choices.forEach(function (c) { return Logger.logChoice(c); });
                console.groupEnd();
                console.groupCollapsed('Combinations:');
                console.log(combinations);
                console.groupEnd();
            }
            console.groupEnd();
        }
        //console.log(`${ Snippet.voicing(voicing, ['G2', 'C5']) } ${ chord }: ${ voicing.join(' ') } `);
        //console.log(`#${ event.path[1] + 1 }: ${ chord }: ${ latest } > ${ voicing }.moved ${ moves } (avg | ${ avgDiff } | total ${ totalMoves })`);
        // console.log(chord, voicing);
        // G#o7 2 (5.25) (4) ["G3", "D4", "F4", "Bb4"] > (4) ["B2", "D3", "E#3", "G#3"]
        /* } */
        return pick;
    };
    Logger.emoji = {
        bestMatch: {
            icon: '🎹',
            description: 'The selected voicing had the best possible voice leading from the previous voicing'
        },
        force: {
            icon: '💪',
            description: 'Voicing had to be forced in the desired direction. The best pick would have gone in the wrong direction.'
        },
        lucky: {
            icon: '🍀',
            description: 'The best pick moved in the direction that would have been forced.'
        },
        wrong: {
            icon: '💀',
            description: 'Continued moving in the wrong direction'
        },
        similar: {
            icon: '😇',
            description: 'All voices are moving in the same direction'
        },
        parallel: {
            icon: '⛓',
            description: 'All voices are moving by parallel intervals'
        },
        contrary: {
            icon: '👹',
            description: 'Some voices were moving in opposite directions'
        },
        noOblique: {
            icon: '🥌',
            description: 'All voices changed position. (Not shown when parallel)'
        },
        noChange: {
            icon: '🛋',
            description: 'All voices remained in position.'
        },
        topAdded: {
            icon: '🌤',
            description: 'A top voice was added',
        },
        topRemoved: {
            icon: '⛅',
            description: 'A top voice was dropped'
        },
        bottomRemoved: {
            icon: '🛫',
            description: 'A bottom voice was dropped'
        },
        bottomAdded: {
            icon: '🌳',
            description: 'A bottom note was added'
        },
        movedUp: {
            icon: '↗️',
            description: 'The Voices generally moved up'
        },
        movedDown: {
            icon: '↙️',
            description: 'The Voices generally moved down'
        },
        equilibrium: {
            icon: '☯️',
            description: 'The Voices generally did not move anywhere'
        },
        fewChoices: {
            icon: '❓',
            description: 'There were very few valid combinations to choose from'
        },
        error: {
            icon: '❌',
            description: 'No notes could be selected. Some error happened.'
        },
        rootless: {
            icon: '⛵',
            description: 'The voicing does not contain its root note (tonic).'
        }
        // ️️️️️➡️↘️↗️⬇️⬆️⬅️
    };
    return Logger;
}());
exports.Logger = Logger;
