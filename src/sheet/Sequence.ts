import { VoiceLeadingOptions, Voicing } from '../harmony/Voicing';
import { SheetState, Sheet, Leadsheet, Measures } from './Sheet';
import { Harmony } from '../harmony/Harmony';
import { Note } from 'tonal';
import { Distance } from 'tonal';
import { Interval } from 'tonal';
import { avgArray, humanize, maxArray } from '../util/util';
import { Logger } from '../util/Logger';
import { Measure, RenderedMeasure } from './Measure';
import { util } from '..';
import { Scale } from 'tonal';
import { Pattern } from '../util/Pattern';

export interface SequenceEvent {
  path: number[];
  value: any;
  chord?: string;
  color?: string; // debug
  divisions?: number[];
  fraction?: number;
  duration?: number;
  velocity?: number;
  time?: number;
  type?: string;
  // voicings?: VoiceLeadingOptions;
  options?: SequenceOptions;
  measure?: RenderedMeasure;
}

export type Groove = {
  [name: string]: (events: SequenceEvent[], options: SequenceOptions) => SequenceEvent[]
};

export type GroovePresetOptions = {
  target?: SequenceEvent,
  source?: SequenceEvent,
  grooveEvents?: SequenceEvent[],
  sourceEvents?: SequenceEvent[],
  options?: SequenceOptions
  index?: number, // original index of target in groove
}

export type GroovePreset = (options: GroovePresetOptions) => SequenceEvent;

export type EventModifier = (
  event: SequenceEvent,
  index: number,
  events: SequenceEvent[],
  options: SequenceOptions
) => SequenceEvent;

export type EventFactory<T> = (options?: SequenceOptions) => T;

export type EventMapFn = (
  event: SequenceEvent,
  index?: number,
  events?: SequenceEvent[]
) => SequenceEvent;

export type EventMap = EventFactory<EventMapFn>;

export type EventReduceFn = (
  events: SequenceEvent[],
  event: SequenceEvent,
  index?: number,
  originalEvents?: SequenceEvent[]
) => SequenceEvent[];

export type EventReduce = EventFactory<EventReduceFn>;

export type EventFilterFn = (
  event: SequenceEvent,
  index?: number,
  events?: SequenceEvent[]
) => boolean;

export type EventFilter = EventFactory<EventFilterFn>;

export interface SequenceOptions extends SheetState {
  logging?: boolean;
  arpeggio?: boolean; // if true, all chords will be played as arpeggios
  pedal?: boolean; // if true, notes that stay will not be retriggered
  tightMelody?: boolean; // if true, the top notes of the chords will play the melody
  real?: boolean; // if true, real instruments will be used
  fermataLength?: number; // length of the last note/chord relative to normal length
  start?: number; // when to start
  swing?: number; // amount of swing
  offsPlayNext?: boolean; // if true, offs before a new chord will already play the next chord
  swingSubdivision?: string;
  dynamicVelocityRange?: number[]; // if set, the velocity will vary inside the given range
  dynamicVelocity?: EventModifier; // if set, the velocity will vary inside the given range
  phantomMelody?: boolean; // if true, the voicings will be played like with melody, but without melody
  humanize?: {
    velocity?: number;
    time?: number;
    duration?: number;
  };
  groove?: Groove;
  voicings?: VoiceLeadingOptions;
  feel?: number;
  pulses?: number; // how many pulses/beats per bar?
  bpm?: number; // tempo
  // if set, the rendered events will be filtered with this function
  filterEvents?: EventFilterFn;
  mapEvents?: EventMapFn;
  reduceEvents?: EventReduceFn;
  displaceChance?: number;
  displaceTime?: number; // in beats
  displaceDuration?: number; // in beats
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
      pulses: 4,
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

  static pedalNotes: EventReduce = (options?) => {
    return (reduced, event, index, events) => {
      if (!options.pedal) {
        return reduced.concat([event]);
      }
      let latestEvent;
      let latest = [].concat(reduced).reverse();
      latestEvent = latest.find(({ time, duration, value }) => value === event.value && (time + duration) === event.time);
      if (!!latestEvent) {
        latestEvent.duration += event.duration;
        return reduced;
      } else {
        return reduced.concat([event]);
      }
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
      if (event.type !== 'chord') {
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
        event.value,
        previousVoicing,
        voicingOptions
      );
      if (!voicing) {
        console.error(`error getting voicing for chord "${event.value}" after voicing ${previousVoicing}, using options ${voicingOptions}`);
        return events;
      }
      return events.concat(
        voicing.map((note, index) => {
          return {
            ...event,
            value: note,
            type: 'chordnote',
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

      if (event.type !== 'chord') {
        return events.concat([event]);
      }
      const root = Harmony.getBassNote(event.value) + '2';
      events.push({
        ...event,
        value: root,
        type: 'bass',
        duration
      });
      return events;
    };
  };

  static isBefore(a: SequenceEvent, b: SequenceEvent) {
    return a.time < b.time + b.duration
  }

  static isAfter(a: SequenceEvent, b: SequenceEvent) {
    return a.time + a.duration > b.time
  }

  static isOverlapping(a: SequenceEvent, b: SequenceEvent) {
    return this.isBefore(a, b) && this.isAfter(a, b)
  }

  static isTouching(a: SequenceEvent, b: SequenceEvent) {
    return a.time <= b.time + b.duration && a.time + a.duration >= b.time;
  }

  static isInside(a: SequenceEvent, b: SequenceEvent) {
    return a.time >= b.time && a.time + a.duration <= b.time + b.duration;
  }

  static duckChordEvent: EventMap = options => {
    return (event, index, events) => {
      if (event.type !== 'chord') {
        return event;
      }
      const melody = events.filter(
        e => !e.chord && Harmony.isValidNote(e.value)
      );
      let topNote;
      if (options.tightMelody) {
        topNote = melody.find(
          n => Sequence.haveSamePath(n, event) && Harmony.isValidNote(n.value)
          // n => Sequence.isInside(n, event) && Harmony.isValidNote(n.value)
        );
      }
      // TODO: allow contained melody notes to be optional topNotes..

      const surroundingMelody = melody
        //.filter(n => Math.abs(event.time - n.time) <= duckTime)
        .filter(m => Sequence.isTouching(event, m))
        /* .filter(m => Sequence.isOverlapping(event, m)) */
        .sort((a, b) => Note.midi(a.value) - Note.midi(b.value));
      let range = options.voicings.range;
      if (!topNote && surroundingMelody.length) {
        const below = Distance.transpose(
          surroundingMelody[0].value,
          Interval.fromSemitones(-options.voicings.minTopDistance)
        );
        range = [range[0], below];
      } else {
        range = [range[0], range[1]];
      }
      return {
        ...event,
        options: {
          ...event.options,
          voicings: {
            ...(event.options.voicings || {}),
            ...(topNote ? {
              topNotes: [topNote.value],
            } : {}),
            range
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

  static isOff(event) {
    return Sequence.time(event.divisions.slice(1), event.path.slice(1), 8) % 2 === 1;
  }

  // static addSwing: EventMap = (options) => (event, index, events) => {
  static addSwing: EventReduce = options => (events, event, index) => {
    if (!options.swing) {
      // return event
      return events.concat([event]);
    }
    const isOff = Sequence.isOff(event);
    if (!isOff) {
      // return event
      return events.concat([event]);
    }
    const swingOffset = ((options.swing / 2) * 60) / options.bpm;
    event = {
      ...event,
      time: event.time + swingOffset,
      /* color: 'black', */
      duration: event.duration - swingOffset,
      velocity: event.velocity + 0.1
    }
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
        if (Sequence.haveSamePath(e, eventBefore)) {
          e.duration += swingOffset;
        }
        return e;
      })
      .concat([event]); */
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
      .filter(e => e.type !== 'chord')
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
  ): SequenceEvent[] {
    options = this.getOptions(options);
    let renderedMeasures = Sheet.render(measures, { ...options, property: 'body' });
    // TODO add measureStartTime / measureEndTime for easier access later
    // seperate chords before flattening // => "chords" also used for melody, need rename...
    const chords = renderedMeasures.map((e) => e.body);
    const flat = Sheet.flatten(chords, true)
      .map(event => ({
        ...event,
        measure: renderedMeasures[event.path[0]],
        options: renderedMeasures[event.path[0]].options
      }));
    return this.renderEvents(flat, options);
  }

  static addPaths(
    a: number[],
    b: number[]
  ) {
    [a, b] = [a, b].sort((a, b) => b.length - a.length);
    return a.map((n, i) => n + (b[i] || 0));
  }

  static getNextChordOff: GroovePreset = ({ target, source, sourceEvents, options }) => {
    if (options.offsPlayNext && Sequence.isOff(target)) {
      const eigth = 60 / options.bpm / 2;
      const next = sourceEvents[sourceEvents.indexOf(source) + 1];
      if (next && next.time - target.time <= eigth) {
        return next;
      }
    }
  }

  static fillGrooves(
    groove: Measures | ((/* source: SequenceEvent, events: SequenceEvent[] */) => Measures),
    sourceEvents: SequenceEvent[],
    mapFn: GroovePreset = ({ target }) => target,
    options?: SequenceOptions
  ): SequenceEvent[] {
    let { bpm, pulses, offsPlayNext } = Sequence.getOptions(options);
    options = { bpm, pulses, offsPlayNext };
    let grooveEvents, grooveMeasures;
    if (typeof groove !== 'function') {
      grooveMeasures = groove;
      grooveEvents = Sequence.renderMeasures(grooveMeasures, options);
    }
    if (!sourceEvents.length) {
      console.error('no events given to fillGrooves');
      return sourceEvents;
    }
    const last = sourceEvents[sourceEvents.length - 1];
    let events = [];
    let bar = 0;
    const barLength = 60 / options.bpm * (options.pulses || 4);
    while (bar < last.path[0]) {
      if (typeof groove === 'function') {
        grooveMeasures = groove();
        grooveEvents = Sequence.renderMeasures(grooveMeasures, options);
      }
      const time = bar * barLength;
      const insert = grooveEvents
        .map((e) => ({ // add path / time together
          ...e,
          path: Sequence.addPaths([bar], e.path),
          time: e.time + time,
        }))
        .filter(e => e.value !== 0)
        .filter(e => e.duration > 0)
        .map((target, index) => {
          let source = sourceEvents.find(
            chordEvent => this.isOverlapping(target, chordEvent)
          );
          source = Sequence.getNextChordOff({ target, source, sourceEvents, options }) || source;
          if (!source) {
            console.warn('no source found for target', target, sourceEvents);
            return;
          }
          return mapFn({ target, source, index, grooveEvents, sourceEvents, options })
        }).filter(e => !!e);
      bar += grooveMeasures.length; // number of bars added
      events = events.concat(insert);
    }
    return events;
  }

  static insertGrooves(
    groove: Measures | ((source: SequenceEvent, events: SequenceEvent[]) => Measures),
    sourceEvents: SequenceEvent[],
    mergeFn: GroovePreset = ({ target }) => target,
    options?: SequenceOptions
  ): SequenceEvent[] {
    let { bpm, pulses, offsPlayNext } = Sequence.getOptions(options);
    options = { bpm, pulses, offsPlayNext };
    let grooveEvents;
    if (typeof groove !== 'function') {
      grooveEvents = Sequence.renderMeasures(groove, options);
    }
    return sourceEvents.reduce((events, source) => {
      if (typeof groove === 'function') {
        grooveEvents = Sequence.renderMeasures(groove(source, events), options)
      }
      const insert = grooveEvents
        .map((e) => ({ // add path / time together
          ...e,
          path: Sequence.addPaths(source.path, e.path),
          time: e.time + source.time,
        }))
        .map((target, index) => {
          const next = Sequence.getNextChordOff({ target, source, sourceEvents, options });
          index = next ? 0 : index;
          return mergeFn({ target, source: next || source, index, grooveEvents, sourceEvents, options })
        })
        .filter(e => e.value !== 0)
        .filter(e => e.duration > 0)
        // remove all events that overlap?!?! maybe just cut the duration at the end?
        .filter(e => (e.time + e.duration) <= source.time + source.duration)
      events = events.concat(insert);
      return events;
    }, [])
  }

  static melodyGroove() {
    return ({ target, source, index, grooveEvents }) => {
      const root = Harmony.getBassNote(source.chord, true);
      // TODO use required/optional notes?!
      const scales = util
        .getChordScales(source.chord, 'Diatonic')
        .filter(s => Scale.notes('C', s).length === 7);
      if (!scales.length) {
        console.warn('no scales for', source.chord);
      }
      const scale = root + ' ' + scales[0];
      const pattern = grooveEvents.map(e => e.value);
      const notes = Pattern.scale(scale, pattern, ['F1', 'F#3']);
      return {
        /* ...source, */
        ...target,
        value: Note.simplify(notes[index]),
        degree: pattern[index]
      };
    }
  }

  static chordGroove(): GroovePreset {
    return ({ target, source }) => {
      return {
        ...source,
        ...target,
        value: source.value,
        chord: source.chord,
        type: 'chord',
        duration: target.duration * target.value,
        /* duration: Math.min(
          target.duration * target.value,
          source.time + source.duration - target.time
        ) */
      };
    };
  }

  static renderEvents(
    events: SequenceEvent[],
    options: SequenceOptions = {}
  ): SequenceEvent[] {
    events = events
      // .reduce(Sequence.addLatestOptions(options), [])
      .reduce(Sequence.addTimeAndDuration(options), [])
      .filter(options.filterEvents || (() => true))
      .map(options.mapEvents || ((e) => e))
      .reduce(Sequence.prolongNotes(options), []);
    if (options.reduceEvents) {
      events = events.reduce(options.reduceEvents, []);
    }
    return events;
  }

  static renderGroove(sequence: SequenceEvent[], options: SequenceOptions) {
    if (!options.groove) {
      const voicings = sequence = sequence.reduce(
        Sequence.renderVoicings(options),
        []
      );
      return sequence.concat(voicings);
    }
    return Object.keys(options.groove).reduce((groovyEvents, current) => {
      return groovyEvents.concat(options.groove[current](sequence, options));
    }, []);
  }

  static insertBassNote

  static render(sheet: Leadsheet): SequenceEvent[] {
    sheet = Sheet.from(sheet);
    let sequence = [],
      melody = [],
      bass = [],
      chords = [];

    if (sheet.chords) {
      chords = Sequence.renderMeasures(sheet.chords, sheet.options).map(e => ({
        ...e,
        chord: e.value, // to seperate melody from chord later
        type: 'chord'
      }));
      /* const walk = Sequence.renderGrid(sheet.chords, sheet.options).map(measure => {
        const feel = measure.options.feel === undefined ? 4 : measure.options.feel;
        return Array(feel).fill('X')
      }); */

      /* console.log('grid', Sheet.flatten(walk, true)); */

      bass = chords.reduce(Sequence.renderBass(sheet.options), []);
      /* bass = bass.map(Sequence.addFermataToEnd(sheet.options)); */
    }
    if (sheet.melody) {
      melody = Sequence.renderMeasures(sheet.melody, {
        ...sheet.options,
        filterEvents: Sequence.inOut() // play melody only first and last time
      }).map(e => ({ ...e, type: 'melody' }));

      chords = chords.map((e, i) =>
        Sequence.duckChordEvent(sheet.options)(e, i, melody)
      );

      // sequence = sequence.map(Sequence.duckChordEvent(sheet.options));
    }
    /* const voicings = chords 
    .map(Sequence.addFermataToEnd(sheet.options))
    .reduce(Sequence.renderVoicings(sheet.options), [])
    .reduce(Sequence.pedalNotes(sheet.options), []);
    sequence = sequence.concat(voicings);
    */

    sequence = sequence.concat(chords) // not voiced yet..
    //.map(Sequence.addFermataToEnd(sheet.options))
    // .reduce(Sequence.renderVoicings(sheet.options), [])
    //.reduce(Sequence.pedalNotes(sheet.options), [])

    sequence = sequence.concat(bass);

    if (melody) {
      sequence = sequence.concat(melody);
      sequence = sequence.sort((a, b) => a.time - b.time);
      sequence = sequence.filter(Sequence.removeDuplicates(sheet.options));
    }

    sequence = Sequence.renderGroove(sequence, sheet.options);

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

  /* static displaceEvent(event: SequenceEvent, time: number, duration = 0): SequenceEvent {
    return {
      ...event,
      time: event.time + time,
      duration: event.duration + duration
    };
  }
  
  static displaceEvents: EventReduce = (options = {}) => {
    let { bpm, displaceChance, displaceTime, displaceDuration } = {
      bpm: 120,
      displaceChance: 0,
      displaceTime: 0,
      displaceDuration: 0,
      ...options
    };
    return (events, event, index, sequence) => {
      if (index === 0 || Math.random() < displaceChance) {
        return events.concat([event]);
      }
      const time = displaceTime * 60 / bpm; // to seconds
      const duration = displaceDuration * 60 / bpm; // to seconds
      return events.concat([Sequence.displaceEvent(event, time, duration)]);
    }
  }
  
  static fixOverlappingEvents: EventMap = (options?) => {
    return (event, index, events) => {
      // prevent overlap
      const next = events[index + 1];
      if (next && Sequence.isOverlapping(event, next)) {
        return {
          ...event,
          duration: next.time - event.time
        };
      }
      return event;
    }
  } */
}


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