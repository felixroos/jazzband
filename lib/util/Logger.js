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
var util_1 = require("./util");
var tonal_1 = require("tonal");
var tonal_2 = require("tonal");
var Harmony_1 = require("../harmony/Harmony");
var Snippet_1 = require("../sheet/Snippet");
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.logCustom = function (args, logFn) {
        if (logFn === void 0) { logFn = console.log; }
        /* console.clear(); */
        logFn.apply(console, args);
    };
    Logger.logLegend = function () {
        if (console.table) {
            console.table(Logger.emoji);
        }
    };
    Logger.logSheet = function (sheet) {
        sheet = __assign({ title: 'Untitled', composer: 'Unkown', chords: [], forms: 3, tempo: 130, style: 'Swing' }, sheet);
        var snippet = Snippet_1.Snippet.from(sheet.chords);
        console.log(sheet.composer + " - " + sheet.title);
        console.log(sheet.tempo + "bpm, Style: " + sheet.style);
        console.log(snippet);
        if (console.groupCollapsed) {
            console.log('Sheet', sheet);
            /* console.log('Groove', sheet.groove); */
            console.groupCollapsed("show " + sheet.forms + " rendered forms");
            console.log("expanded view\n\n" + Snippet_1.Snippet.expand(snippet, { forms: sheet.forms || 1 }));
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
        var difference = choice.difference, targets = choice.targets, movement = choice.movement, similar = choice.similar, added = choice.added, dropped = choice.dropped, contrary = choice.contrary, parallel = choice.parallel, topInterval = choice.topInterval, bottomInterval = choice.bottomInterval;
        console.table((_a = {
                difference: difference,
                movement: movement,
                targets: targets.join(' ')
            },
            _a[Logger.logLabel('similar')] = similar,
            _a[Logger.logLabel('contrary')] = contrary,
            _a[Logger.logLabel('parallel')] = parallel,
            _a.topInterval = topInterval,
            _a.bottomInterval = bottomInterval,
            _a.added = added.join(' '),
            _a.dropped = dropped.join(' '),
            _a));
    };
    Logger.logNotes = function (activeNotes, idleNotes, addedNotes, range) {
        var span = [
            tonal_1.Distance.transpose(range[0], tonal_2.Interval.fromSemitones(-7)),
            tonal_1.Distance.transpose(range[1], tonal_2.Interval.fromSemitones(12))
        ];
        var allNotes = util_1.noteArray(span);
        var keyboard = allNotes.map(function (note, index) {
            var active = !!activeNotes.find(function (n) { return Harmony_1.Harmony.isSameNote(note, n); });
            var idle = !!idleNotes.find(function (n) { return Harmony_1.Harmony.isSameNote(note, n); });
            var added = !!addedNotes.find(function (n) { return Harmony_1.Harmony.isSameNote(note, n); });
            var black = Harmony_1.Harmony.isBlack(note);
            var css = '', sign = '_';
            if (added && !black) {
                css = 'color:green;';
                sign = '█';
            }
            else if (added && black) {
                css = 'color:darkgreen;';
                sign = '█';
            }
            else if (active && black) {
                css = 'color:#a50909;';
                sign = '█';
            }
            else if (active && !black) {
                css = 'color:#eda3a3;';
                sign = '█';
            }
            else if (idle && !black) {
                css = 'color:gray;';
                sign = '█';
            }
            else if (idle && black) {
                css = 'color:black;';
                sign = '█';
            }
            else {
                css = black ? 'color:black;' : 'color:#eee;';
            }
            var position = util_1.getRangePosition(note, range);
            if (position < 0 || position > 1) {
                if (active) {
                    css += 'color:red;';
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
        var chord = _a.chord, lastVoicing = _a.lastVoicing, bestPick = _a.bestPick, pick = _a.pick, range = _a.range, choice = _a.choice, direction = _a.direction, choices = _a.choices, force = _a.force;
        /* pick = pick.map(n => Note.simplify(n)); */
        lastVoicing = lastVoicing || [];
        var idle = lastVoicing.filter(function (n) { return pick.find(function (p) { return Harmony_1.Harmony.isSameNote(n, p); }); });
        var active = pick.filter(function (n) { return !lastVoicing.find(function (p) { return Harmony_1.Harmony.isSameNote(n, p); }); });
        var added = choice ? choice.added : [];
        var konsole = Logger.logNotes(active, idle, added, range);
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
        // TODO replace force with filter of choices after isInRange
        //      isInRange: checks if top and bottom note are inside the range
        if (!force) {
            konsole.push(Logger.emoji.bestMatch.icon);
        }
        if (direction && force) {
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
            if (!choice.parallel && choice.oblique.length === 0) {
                konsole.push(Logger.emoji.noOblique.icon);
            }
            if (choice.added.length && choice.added[choice.added.length - 1] === choice.targets[choice.targets.length - 1]) {
                konsole.push(Logger.emoji.topAdded.icon);
            }
            if (choice.dropped.length && choice.dropped[choice.dropped.length - 1] === choice.origin[choice.targets.length - 1]) {
                konsole.push(Logger.emoji.topRemoved.icon);
            }
            if (choice.dropped.length && choice.dropped[0] === choice.origin[0]) {
                konsole.push(Logger.emoji.bottomRemoved.icon);
            }
            if (choice.added.length && choice.added[0] === choice.targets[0]) {
                konsole.push(Logger.emoji.bottomAdded.icon);
            }
        }
        lastVoicing = lastVoicing || [];
        konsole.push(difference + "/" + movement + ": " + chord + " (" + (choices.indexOf(choice) + 1) + "/" + choices.length + ")");
        if (console && console.table) {
            Logger.logCustom(konsole, console.groupCollapsed);
            console.table({
                lastVoicing: lastVoicing.join(' '),
                pick: pick.join(' '),
            });
            if (choice) {
                console.group('Pick:');
                Logger.logChoice(choice);
                console.groupEnd();
                console.groupCollapsed('All Choices:');
                choices.forEach(function (c) { return Logger.logChoice(c); });
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
        topAdded: {
            icon: '🌤',
            description: 'A top voice was added',
        },
        topRemoved: {
            icon: '⛅',
            description: 'A top voice was removed'
        },
        bottomRemoved: {
            icon: '🛫',
            description: 'A bottom voice was removed'
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
    };
    return Logger;
}());
exports.Logger = Logger;
