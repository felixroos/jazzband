import { VoiceLeadingOptions, Voicing } from '../harmony/Voicing';
import { SheetState, Sheet, Leadsheet, Measures } from './Sheet';
import { Harmony } from '../harmony/Harmony';
import { Note } from 'tonal';
import { Distance } from 'tonal';
import { Interval } from 'tonal';
import { avgArray, humanize, maxArray } from '../util/util';
import { Logger } from '../util/Logger';
import { Measure, RenderedMeasure } from './Measure';

export interface SequenceEvent {
  path: number[];
  value: any;
  chord?: string;
  divisions?: number[];
  fraction?: number;
  duration?: number;
  velocity?: number;
  time?: number;
  // voicings?: VoiceLeadingOptions;
  options?: SequenceOptions;
  measure?: RenderedMeasure;
}

export type EventModifier = (
  event: SequenceEvent,
  index: number,
  events: SequenceEvent[],
  options: SequenceOptions
) => SequenceEvent;

export type EventMap = (
  options: SequenceOptions
) => (
    event: SequenceEvent,
    index?: number,
    events?: SequenceEvent[]
  ) => SequenceEvent;
export type EventReduce = (
  options?: SequenceOptions
) => (
    events: SequenceEvent[],
    event: SequenceEvent,
    index?: number,
    originalEvents?: SequenceEvent[]
  ) => SequenceEvent[];
export type EventFilter = (
  options?: SequenceOptions
) => (
    event: SequenceEvent,
    index?: number,
    events?: SequenceEvent[]
  ) => boolean;

export interface SequenceOptions extends SheetState {
  logging?: boolean;
  arpeggio?: boolean; // if true, all chords will be played as arpeggios
  bell?: boolean; // if true, notes of arpeggiated chords will be held
  pedal?: boolean; // if true, notes that stay will not be retriggered
  tightMelody?: boolean; // if true, the top notes of the chords will play the melody
  real?: boolean; // if true, real instruments will be used
  fermataLength?: number; // length of the last note/chord relative to normal length
  duckMeasures?: number; // time till the voicing range resets after a melody note (in measures)
  start?: number; // when to start
  swing?: number; // amount of swing
  swingSubdivision?: string;
  dynamicVelocityRange?: number[]; // if set, the velocity will vary inside the given range
  dynamicVelocity?: EventModifier; // if set, the velocity will vary inside the given range
  phantomMelody?: boolean; // if true, the voicings will be played like with melody, but without melody
  humanize?: {
    velocity?: number;
    time?: number;
    duration?: number;
  };
  voicings?: VoiceLeadingOptions;
  feel?: number;
  pulses?: number; // how many pulses/beats per bar?
  bpm?: number; // tempo
  // if set, the rendered events will be filtered with this function
  filterEvents?: (event: SequenceEvent, index: number) => boolean;
  mapEvents?: (event: SequenceEvent, index: number) => SequenceEvent;
}

export class Sequence {
  static fraction(divisions: number[], whole = 1) {
    return divisions.reduce((f, d) => f / d, whole);
  }

  static time(divisions: number[], path, whole = 1) {
    return divisions.reduce(
      ({ f, p }, d, i) => ({ f: f / d, p: p + (f / d) * path[i] }),
      { f: whole, p: 0 }
    ).p;
  }

  static simplePath(path) {
    return path.join('.').replace(/(\.0)*$/, ''); //.split('.');
  }

  static haveSamePath(a: SequenceEvent, b: SequenceEvent) {
    return Sequence.simplePath(a.path) === Sequence.simplePath(b.path);
  }

  static getSignType(symbol: string) {
    return Object.keys(Sheet.sequenceSigns).find(type =>
      Sheet.sequenceSigns[type].includes(symbol)
    );
  }

  static getOptions(options: SequenceOptions) {
    return {
      bpm: 120,
      ...options,
    };
  }

  static testEvents = (props: string[]) => (event): any =>
    props.reduce((reduced, prop) => ({ ...reduced, [prop]: event[prop] }), {});


  static addLatestOptions: EventReduce = (options = {}) =>
    (events, event, index) => {
      const last = (events.length ? events[events.length - 1] : null);
      const combinedOptions = {
        ...options,
        ...(last ? last.options : {}), // merge prev options
        ...event.options,
        ...(event.value.options || {})
      };
      return events.concat({
        ...event,
        options: combinedOptions
      });
    }

  static addTimeAndDuration: EventReduce = (options = {}) => {
    return (events, event, index) => {
      options = Sequence.getOptions({ ...options, ...(event.options || {}) });
      const pulses = options.pulses || 4;
      const last = (events.length ? events[events.length - 1] : null);
      const whole = (60 / options.bpm) * pulses * event.divisions[0];
      return events.concat({
        ...event,
        options,
        velocity: 1,
        duration: Sequence.fraction(event.divisions, whole),
        time: last ? last.time + last.duration : 0,
      });
    }
  }
  static prolongNotes: EventReduce = (options?) => {
    return (reduced, event, index, events) => {
      const type = Sequence.getSignType(event.value);
      if (type !== 'prolong') {
        return reduced.concat([event]);
      }
      let latest = [].concat(reduced).reverse();

      const latestRest = latest.find(
        e => Sequence.getSignType(e.value) === 'rest'
      );
      let latestEvent = latest.find(e => !Sequence.getSignType(e.value));
      if (
        latestEvent &&
        latest.indexOf(events.indexOf(latestEvent) > events.indexOf(latestRest))
      ) {
        latestEvent.duration += event.duration;
      }
      return reduced;
    };
  };

  static renderVoicings: EventReduce = (options = {}) => {
    return (events, event, index) => {
      if (!event.chord) {
        return events.concat([event]);
      }
      let previousVoicing = [];
      if (index > 0) {
        const previousEvent = events[index - 1];
        previousVoicing = previousEvent
          ? events.filter(e => Sequence.haveSamePath(previousEvent, e))
          : [];
        previousVoicing = previousVoicing.map(e => e.value);
      }
      const voicingOptions: VoiceLeadingOptions = {
        ...options.voicings,
        ...event.options.voicings
      };
      let voicing = Voicing.getNextVoicing(
        event.chord,
        previousVoicing,
        voicingOptions
      );
      return events.concat(
        voicing.map((note, index) => {
          return {
            ...event,
            value: note,
            chord: event.chord
          };
        })
      );
    };
  };

  static addFermataToEnd: EventMap = (options?) => {
    return (event, index, events) => {
      let { duration } = event;
      if (index === events.length - 1 && options.fermataLength) {
        duration *= options.fermataLength;
      }
      return {
        ...event,
        duration,
      };
    }
  }

  static renderBass: EventReduce = options => {
    return (events, event, index, chords) => {
      let { duration } = event;

      if (!event.chord) {
        return events.concat([event]);
      }
      const root = Harmony.getBassNote(event.chord) + '2';
      events.push({
        ...event,
        value: root,
        duration
      });

      /* const chordsInBar = chords.filter(e => e.path[0] === bar);
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
   
        const root = Harmony.getBassNote(event.chord) + '2';
        const fifth = Distance.transpose(root, '5P');
        const note = indexSinceLastRoot % 2 == 0 ? root : fifth;
        events.push({
          ...event,
          value: note,
          duration
        });
      }); */

      return events;
    };
  };

  static duckChordEvent: EventMap = options => {
    return (event, index, events) => {
      if (!event.chord) {
        return event;
      }
      const melody = events.filter(
        e => !e.chord && Harmony.isValidNote(e.value)
      );
      const topNote = melody.find(
        n => Sequence.haveSamePath(n, event) && Harmony.isValidNote(n.value)
      );
      const duckTime = Math.max(
        event.duration,
        (60 / options.bpm) * options.duckMeasures * 4
      );
      // TODO calculate active melody notes with time + duration
      const surroundingMelody = melody
        .filter(n => Math.abs(event.time - n.time) <= duckTime)
        .sort((a, b) => Note.midi(a.value) - Note.midi(b.value));
      let range = options.voicings.range;
      if (surroundingMelody.length) {
        const below = Distance.transpose(
          surroundingMelody[0].value,
          Interval.fromSemitones(options.voicings.minTopDistance)
        );
        range = [range[0], below];
      }
      return {
        ...event,
        options: {
          ...event.options,
          voicings: {
            ...(event.options.voicings || {}),
            ...(topNote
              ? {
                topNotes: options.tightMelody ? [topNote.value] : []
              }
              : {
                /* idleChance: .5,
                          forceDirection: 'down', */
                range
              })
          }
        }
      };
    };
  };

  static humanizeEvent: EventMap = options => {
    return (event, index, events) => {
      const durationChange = event.duration * options.humanize.duration;
      return {
        ...event,
        velocity: humanize(event.velocity, options.humanize.velocity),
        duration: humanize(event.duration, durationChange, -durationChange),
        time: humanize(event.time, options.humanize.time, options.humanize.time)
      };
    };
  };

  static velocityFromIndex: EventMap = options => {
    return (event, index, events) => {
      const velocitySpan =
        options.dynamicVelocityRange[1] - options.dynamicVelocityRange[0];
      return {
        ...event,
        velocity:
          ((event.velocity * index) / events.length) * velocitySpan +
          options.dynamicVelocityRange[0]
      };
    };
  };

  static velocityFromPitch: EventMap = options => {
    return (event, index, events) => {
      const midiValues = events.map(e => Note.midi(e.value));
      const maxMidi = maxArray(midiValues);
      const avgMidi = avgArray(midiValues);
      return {
        ...event,
        velocity: (event.velocity * avgMidi) / maxMidi
      };
    };
  };

  static addDynamicVelocity: EventMap = options => {
    return (event, index, events) => {
      if (!options.dynamicVelocity) {
        return event;
      }
      event.velocity = event.velocity || 1;
      return options.dynamicVelocity(event, index, events, options);
    };
  };

  // static addSwing: EventMap = (options) => (event, index, events) => {
  static addSwing: EventReduce = options => (events, event, index) => {
    if (!options.swing) {
      // return event
      return events.concat([event]);
    }
    const isOff =
      Sequence.time(event.divisions.slice(1), event.path.slice(1), 8) % 2 === 1;
    if (!isOff) {
      // return event
      return events.concat([event]);
    }
    const swingOffset = ((options.swing / 2) * 60) / options.bpm;
    event.time += swingOffset;
    event.duration -= swingOffset;
    event.velocity += 0.1;
    const eventBefore = []
      .concat(events)
      .reverse()
      .find(b => b.time < event.time);
    //const eventBefore = ([].concat(events).reverse().find(b => b.time < event.time));
    if (!eventBefore) {
      return events.concat([event]);
    }
    return events
      .map((e, i) => {
        if (Sequence.haveSamePath(e, eventBefore)) {
          e.duration += swingOffset;
        }
        return e;
      })
      .concat([event]);
  };

  static inOut: EventFilter = () => (event, idnex, events) => {
    return event.measure.firstTime || event.measure.lastTime;
  }

  static removeDuplicates: EventFilter = options => (event, index, events) => {
    if (!options.phantomMelody) {
      const duplicate = events.find(
        (e, i) =>
          i !== index &&
          Harmony.hasSamePitch(e.value, event.value) &&
          Sequence.haveSamePath(e, event)
      );
      return !duplicate || !event.chord; // always choose melody note
    }
    const melody = events
      .filter(e => !e.chord)
      .find(
        (e, i) =>
          i !== index &&
          Harmony.hasSamePitch(e.value, event.value) &&
          Sequence.haveSamePath(e, event)
      );
    return !melody;
  };

  static renderGrid(
    measures: Measures,
    options?: SequenceOptions
  ) {
    options = this.getOptions(options);
    let renderedMeasures = Sheet.render(measures, options);
    const flat = Sheet.flatten(renderedMeasures, true)
      .map(event => ({
        ...event,
        measure: renderedMeasures[event.path[0]]
      }));
    return this.renderEvents(flat, options);
  }


  static renderMeasures(
    measures: Measures,
    options?: SequenceOptions
  ) {
    options = this.getOptions(options);
    let renderedMeasures = Sheet.render(measures, options);
    // seperate chords before flattening // => "chords" also used for melody, need rename...
    const chords = renderedMeasures.map((e) => e.chords);
    const flat = Sheet.flatten(chords, true)
      .map(event => ({
        ...event,
        measure: renderedMeasures[event.path[0]],
        options: renderedMeasures[event.path[0]].options
      }));
    return this.renderEvents(flat, options);
  }

  static renderEvents(
    events: SequenceEvent[],
    options: SequenceOptions = {}
  ) {
    return events
      .reduce(Sequence.addLatestOptions(options), [])
      .reduce(Sequence.addTimeAndDuration(options), [])
      .filter(options.filterEvents || (() => true))
      .map(options.mapEvents || ((e) => e))
      .reduce(Sequence.prolongNotes(options), []);
  }

  static render(sheet: Leadsheet) {
    sheet = Sheet.from(sheet);
    let sequence = [],
      melody = [],
      bass = [],
      chords = [];

    if (sheet.chords) {
      chords = Sequence.renderMeasures(sheet.chords, sheet.options).map(e => ({
        ...e,
        chord: e.value // to seperate melody from chord later
      }));
      console.log('chords', chords);

      /* const walk = Sequence.renderGrid(sheet.chords, sheet.options).map(measure => {
        const feel = measure.options.feel === undefined ? 4 : measure.options.feel;
        return Array(feel).fill('X')
      }); */

      /* console.log('grid', Sheet.flatten(walk, true)); */

      bass = chords.reduce(Sequence.renderBass(sheet.options), [])
        .map(Sequence.addFermataToEnd(sheet.options));
    }
    if (sheet.melody) {
      melody = Sequence.renderMeasures(sheet.melody, {
        ...sheet.options,
        filterEvents: Sequence.inOut() // play melody only first and last time
      });
      chords = chords.map((e, i) =>
        Sequence.duckChordEvent(sheet.options)(e, i, melody)
      );
      // sequence = sequence.map(Sequence.duckChordEvent(sheet.options));
    }
    const voicings = chords
      .map(Sequence.addFermataToEnd(sheet.options))
      .reduce(Sequence.renderVoicings(sheet.options), [])
    sequence = sequence.concat(voicings);

    sequence = sequence.concat(bass);

    if (melody) {
      sequence = sequence.concat(melody);
      sequence = sequence.sort((a, b) => a.time - b.time);
      sequence = sequence.filter(Sequence.removeDuplicates(sheet.options));
    }

    sequence = sequence.map((event, index, events) => {
      // const pathEvents = events.filter(e => Sequence.haveSamePath(e, event));
      event = Sequence.humanizeEvent(sheet.options)(event, index, sequence);
      event = Sequence.addDynamicVelocity(sheet.options)(
        event,
        index,
        sequence
      );
      return event;
    });
    sequence = sequence.reduce(Sequence.addSwing(sheet.options), []);

    if (sheet.options.logging) {
      Logger.logSequence(sequence);
    }
    return sequence;
  }

  /** // pedal stuff (not working)
     if (sheet.options.pedal) {
                        // pedalNotes = latest.filter(note => voicing.find(n => Harmony.hasSamePitch(note, n)))
                            // .concat(pedalNotes);
                            pedalNotes = pedalNotes
                            // select latest attacked notes from notes list
                            .concat(attackedNotes
                                // find notes that appear again in the current voicing
                                .filter(n => voicing.find(note => Harmony.hasSamePitch(note, n.value)))
                                // filter out the ones that are already on hold
                                // .filter(n => !!pedalNotes.find(note => Harmony.hasSamePitch(note.value, n.value)))
                                // remove notes that now have been released
                            )
                            //.filter((n) => !voicing.find(note => Harmony.hasSamePitch(note, n.value)));
                        pedalNotes.forEach(note => {
                            note.duration += chord.duration;
                        });
                        // const releasedNotes = latest.filter(note => !voicing.find(n => !Harmony.hasSamePitch(note, n)));
                    }

                    //attackedNotes = voicing
                    //.filter(note => !pedalNotes.find(n => Harmony.hasSamePitch(note, n.value)))
     */

  /**
     * arpeggio stuff
     * 
                    if (arpeggio) {
                       maxVoices = Math.floor(1 / chord.divisions[chord.divisions.length - 1] * voices);
                   } 
                           if (sheet.options.arpeggio) {
                               time = (chord.time + index * chord.duration / voicing.length);
                               duration = !sheet.options.bell ? chord.duration : chord.duration - index * chord.duration / voicing.length;
                           }
     */
}
