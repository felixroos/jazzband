import { noteArray, getRangePosition } from './util';
import { Distance } from 'tonal';
import { Interval } from 'tonal';
import { Harmony } from '../harmony/Harmony';
import { Snippet } from '../sheet/Snippet';

export class Logger {
    static emoji = {
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
        fewCombinations: {
            icon: '💢',
            description: 'There were very few valid combinations to choose from'
        }
        // ️️️️️➡️↘️↗️⬇️⬆️⬅️
    }

    static logCustom(args, logFn = console.log) {
        /* console.clear(); */
        logFn.apply(console, args);
    }

    static logLegend() {
        if (console.table) {
            console.table(Logger.emoji);
        }
    }

    static logSheet(sheet) {
        sheet = {
            title: 'Untitled',
            composer: 'Unkown',
            chords: [],
            forms: 3,
            tempo: 130,
            style: 'Swing',
            ...sheet
        }
        const snippet = Snippet.from(sheet.chords);
        console.log(`${sheet.composer} - ${sheet.title}`);
        console.log(`${sheet.tempo}bpm, Style: ${sheet.style}`);
        console.log(snippet);
        if (console.groupCollapsed) {
            console.log('Sheet', sheet);
            /* console.log('Groove', sheet.groove); */
            console.groupCollapsed(`show ${sheet.forms} rendered forms`);
            console.log("expanded view\n\n" + Snippet.expand(snippet, { forms: sheet.forms || 1 }));
            console.groupEnd();
        }
    }

    static logLabel(key) {
        if (!Logger.emoji[key]) {
            return key;
        }
        return Logger.emoji[key].icon + ' ' + key;
    }

    static logChoice(choice) {
        if (!choice) {
            return
        }
        let { difference,
            targets,
            movement,
            similar,
            added,
            dropped,
            contrary,
            parallel,
            topInterval,
            bottomInterval
        } = choice;
        console.table({
            difference,
            movement,
            targets: targets.join(' '),
            [Logger.logLabel('similar')]: similar,
            [Logger.logLabel('contrary')]: contrary,
            [Logger.logLabel('parallel')]: parallel,
            topInterval, bottomInterval,
            added: added.join(' '),
            dropped: dropped.join(' '),
        });
    }

    static logNotes(activeNotes, idleNotes, addedNotes, range) {
        const span = [
            Distance.transpose(range[0], Interval.fromSemitones(-7)),
            Distance.transpose(range[1], Interval.fromSemitones(12))
        ];
        const allNotes = noteArray(span);
        const keyboard = allNotes.map((note, index) => {
            const active = !!activeNotes.find(n => Harmony.isSameNote(note, n));
            const idle = !!idleNotes.find(n => Harmony.isSameNote(note, n));
            const added = !!addedNotes.find(n => Harmony.isSameNote(note, n));
            const black = Harmony.isBlack(note);
            let css = '', sign = '_';
            if (added && !black) {
                css = 'color:green;';
                sign = '█';
            } else if (added && black) {
                css = 'color:darkgreen;';
                sign = '█';
            } else if (active && black) {
                css = 'color:#a50909;';
                sign = '█';
            } else if (active && !black) {
                css = 'color:#eda3a3;';
                sign = '█';
            } else if (idle && !black) {
                css = 'color:gray;';
                sign = '█';
            } else if (idle && black) {
                css = 'color:black;';
                sign = '█';
            } else {
                css = black ? 'color:black;' : 'color:#eee;';
            }
            const position = getRangePosition(note, range);
            if (position < 0 || position > 1) {
                if (active) {
                    css += 'color:red;';
                } else {
                    sign = ' ';
                }
            }

            return {
                sign,
                css
            }
        });

        const args = [
            keyboard.map(key => `%c${key.sign}`).join(''),
            ...(keyboard.map(key => `${key.css};`))
        ];
        /* Snippet.logCustom(args); */
        return args;
    }

    static logVoicing({ chord, lastVoicing, combinations, bestPick, pick, range, choice, direction, choices, force }: any) {
        /* pick = pick.map(n => Note.simplify(n)); */
        lastVoicing = lastVoicing || [];
        const idle = lastVoicing.filter(n => pick.find(p => Harmony.isSameNote(n, p)));
        const active = pick.filter(n => !lastVoicing.find(p => Harmony.isSameNote(n, p)))
        const added = choice ? choice.added : [];
        let konsole = Logger.logNotes(active, idle, added, range);
        const movement = choice ? choice.movement : 0;
        const difference = choice ? choice.difference : 0;
        choices = choices || [];
        if (movement > 0) {
            konsole.push(Logger.emoji.movedUp.icon);
        } else if (movement < 0) {
            konsole.push(Logger.emoji.movedDown.icon);
        } else {
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
            } else {
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
        lastVoicing = lastVoicing || []
        konsole.push(`${difference}/${movement}: ${chord} (${choices.indexOf(choice) + 1}/${choices.length})`);
        if (combinations) {
            if (combinations.length < 4) {
                konsole.push(Logger.emoji.fewCombinations.icon);
            }
        }
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
                console.log('Combinations', combinations);
                console.groupCollapsed('All Choices:');
                choices.forEach(c => Logger.logChoice(c));
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
    }
}
