import { Musician } from './Musician';
import { Improvisation } from '../improvisation/Improvisation';
export default class Guide extends Musician {
    styles: {
        [key: string]: any;
    };
    range: string[];
    methods: {
        [method: string]: Improvisation;
    };
    constructor(instrument: any);
    play({ measures, pulse, settings }: {
        measures: any;
        pulse: any;
        settings: any;
    }): void;
    improvise({ value, cycle, path, deadline, interval }: {
        value: any;
        cycle: any;
        path: any;
        deadline: any;
        interval: any;
    }, measures: any, pulse: any, method: any): void;
}
