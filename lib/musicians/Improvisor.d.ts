import { Musician } from './Musician';
import { Improvisation } from '../improvisation/Improvisation';
export default class Improvisor extends Musician {
    name: string;
    defaultMethod: Improvisation;
    method: Improvisation;
    constructor(instrument: any, method?: any);
    useMethod(method: any): void;
    play({ measures, pulse, settings }: {
        measures: any;
        pulse: any;
        settings: any;
    }): void;
    improvise({ value, deadline, interval }: {
        value: any;
        deadline: any;
        interval: any;
    }, measures: any, pulse: any): void;
}
