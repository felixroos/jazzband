import { Pulse } from './Pulse';
import { Musician } from './musicians/Musician';
export default class Band {
    props: any;
    pulse: Pulse;
    musicians: Musician[];
    defaults: {
        cycle: number;
        division: number;
        transpose: number;
        style: string;
    };
    context: AudioContext;
    constructor({ context, musicians }?: any);
    ready(): Promise<any[]>;
    resume(): Promise<AudioContext>;
    comp(measures: any, settings: any): void;
    play(measures: any, settings: any): void;
}
