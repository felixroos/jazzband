import { JumpSign, Sheet, SheetState } from './Sheet';

export type MeasureOrString = Measure | string[] | string;

export interface Measure {
  chords?: string[];
  body?: string[];
  signs?: string[];
  comments?: string[];
  house?: number | number[];
  times?: number;
  section?: string;
  idle?: true; // bar is repeated
  options?: SheetState; // options to change stuff over time
}

export interface RenderedMeasure extends Measure {
  chords?: string[]; // the content of the measure (symbols to play like chords or notes or sounds)
  index: number; // the corresponding index of the sheet measure (from where it was rendered)
  measure?: Measure;
  form?: number; // the number of the current form
  totalForms?: number; // number of total forms
  lastTime?: boolean; // if the current form is the last
  firstTime?: boolean; // if the current form is the first
}

export class Measure implements Measure {
  static from(measure: MeasureOrString, property = 'chords'): Measure {
    if (typeof measure === 'string') {
      return {
        [property]: [measure]
      };
    }
    if (Array.isArray(measure)) {
      return {
        [property]: [].concat(measure)
      };
    }
    return Object.assign({}, measure);
    // return measure;
  }

  /* static render(sheet: MeasureOrString[], index: number, form?: number, property = 'chords'): RenderedMeasure { */
  static render(state: SheetState): RenderedMeasure {
    let {
      sheet,
      index,
      forms,
      firstTime,
      lastTime,
      totalForms,
      property
    } = state;
    const measure = Measure.from(sheet[index], property);
    return {
      ...measure,
      form: totalForms - forms,
      totalForms,
      firstTime,
      lastTime,
      index
    };
  }

  static hasSign(sign: string, measure: MeasureOrString): boolean {
    measure = Measure.from(measure);
    return !!measure.signs && measure.signs.includes(sign);
  }

  static hasHouse(measure: MeasureOrString, number?: number): boolean {
    measure = Measure.from(measure);
    let { house } = measure;
    if (!house) {
      return false;
    } else if (number === undefined) {
      return true;
    }
    if (!Array.isArray(house)) {
      house = [house];
    }
    return house.includes(number);
  }

  static getJumpSign(measure): JumpSign {
    const signs = (Measure.from(measure).signs || []).filter(s =>
      Object.keys(Sheet.jumpSigns).includes(s)
    );
    if (signs.length > 1) {
      console.warn('measure cannot contain more than one repeat sign', measure);
    }
    return Sheet.jumpSigns[signs[0]];
  }

  static hasJumpSign(measure: MeasureOrString): boolean {
    return Object.keys(Sheet.jumpSigns).reduce(
      (match, current) => match || Measure.hasSign(current, measure),
      false
    );
  }
}
