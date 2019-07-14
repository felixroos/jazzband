import { swing } from '../grooves/swing';
import { Improvisation } from '../improvisation/Improvisation';
import { defaultMethod } from '../improvisation/methods';
import { isBarStart, isFormStart, isOffbeat, resolveChords } from '../util/util';
import { Musician } from './Musician';

export default class Improvisor extends Musician {
  name = 'Improvisor';
  defaultMethod = defaultMethod;
  method: Improvisation;

  constructor(instrument, method?) {
    super(instrument);
    method = method || this.defaultMethod;
    this.method = method/* .enhance({
            range: ['F3', 'F5']
        }) */;
  }

  useMethod(method) {
    this.method = method;
  }

  play({ measures, pulse, settings }) {
    if (settings.method) {
      this.useMethod(settings.method);
    }
    const groove = settings.groove || swing;
    this.method.mutate(() => ({ groove, playedNotes: [] }));
    const pattern = this.method.get('groovePattern');
    measures = measures
      .map(measure => pattern({ measures, measure, settings, pulse })
        /*     .slice(0, Math.floor(settings.cycle)) */
      )
      .map((pattern, i) => resolveChords(pattern, measures, [i]));
    pulse.tickArray(measures, (tick) => {
      this.improvise(tick, measures, pulse);
    }, settings.deadline);
  }

  improvise({ value, deadline, interval }, measures, pulse) {
    let chord = value.chord;
    if (chord === 'N.C.') {
      return;
    }
    this.method.mutate(() => ({
      chord,
      isFormStart: isFormStart(value.path),
      isBarStart: isBarStart(value.path),
      isOffbeat: isOffbeat(value.path),
      // TODO: is ChordStart
      barNumber: value.path[0]
    }))
      .mutate(({ nextNotes, playedNotes }) => {
        const pick = nextNotes();
        const duration = value.fraction * pulse.getMeasureLength();
        this.instrument.playNotes(pick, { deadline, interval, gain: this.getGain(), duration, pulse });
        return {
          playedNotes: [].concat(pick, playedNotes())
        }
      });


  }
}