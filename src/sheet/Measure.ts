import { JumpSign, Sheet, SheetState } from './Sheet';
import { SequenceOptions } from '../player/Sequence';
import { NestedRhythm } from './Rhythm';

export type MeasureOrBody<T> = Measure<T> | T[] | T;
export type Measures<T> = Array<MeasureOrBody<T>>;

export interface RenderedMeasure<T> extends Measure<T> {
  index: number; // the corresponding index of the sheet measure (from where it was rendered)
  form?: number; // the number of the current form
  totalForms?: number; // number of total forms
}

export class Measure<T> {
  body?: T | NestedRhythm<T>;
  signs?: string[];
  comments?: string[];
  house?: number | number[];
  times?: number;
  section?: string;
  idle?: true; // bar is repeated
  options?: SequenceOptions; // options to change stuff over time

  static from<T>(measure: MeasureOrBody<T>): Measure<T> {
    // if (!Array.isArray(measure) && typeof measure !== 'object') {
    if (!Array.isArray(measure) && typeof measure !== 'object') {
      return {
        body: [measure]
      };
    }
    if (Array.isArray(measure)) {
      return {
        body: [].concat(measure)
      };
    }
    return measure;
  }

  static render<T>(state: SheetState<T>): RenderedMeasure<T> {
    let {
      sheet,
      index,
      forms,
      totalForms,
    } = state;
    const measure = Measure.from(sheet[index]);
    // TODO: options is lost here...
    return {
      body: measure.body,
      form: totalForms - forms,
      totalForms,
      index
    };
  }

  static hasSign<T>(sign: string, measure: MeasureOrBody<T>): boolean {
    measure = Measure.from(measure);
    return !!measure.signs && measure.signs.includes(sign);
  }

  static hasHouse<T>(measure: MeasureOrBody<T>, number?: number): boolean {
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

  static getJumpSign<T>(measure: MeasureOrBody<T>): JumpSign<T> {
    const signs = (Measure.from(measure).signs || []).filter(s =>
      Object.keys(Sheet.jumpSigns).includes(s)
    );
    if (signs.length > 1) {
      console.warn('measure cannot contain more than one repeat sign', measure);
    }
    return Sheet.jumpSigns[signs[0]];
  }

  static hasJumpSign<T>(measure: MeasureOrBody<T>): boolean {
    return Object.keys(Sheet.jumpSigns).reduce(
      (match, current) => match || Measure.hasSign(current, measure),
      false
    );
  }
}
