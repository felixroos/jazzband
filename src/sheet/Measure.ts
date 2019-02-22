import { JumpSign, Sheet } from './Sheet';

export type MeasureOrString = Measure | string[] | string;

export interface Measure {
    chords?: string[],
    //voices?: string[][],
    signs?: string[],
    comments?: string[],
    house?: number | number[],
    times?: number,
    section?: string,
    idle?: true // bar is repeated
};

export class Measure implements Measure {
    static from(measure: MeasureOrString): Measure {
        if (typeof measure === 'string') {
            return {
                chords: [measure]
            }
        }
        if (Array.isArray(measure)) {
            return {
                chords: [].concat(measure)
            }
        }
        return Object.assign({}, measure);
        // return measure;
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
        const signs = (Measure.from(measure).signs || [])
            .filter(s => Object.keys(Sheet.jumpSigns).includes(s));
        if (signs.length > 1) {
            console.warn('measure cannot contain more than one repeat sign', measure);
        }
        return Sheet.jumpSigns[signs[0]];
    }

    static hasJumpSign(measure: MeasureOrString): boolean {
        return Object.keys(Sheet.jumpSigns)
            .reduce((match, current) => match || Measure.hasSign(current, measure), false);
    }
}