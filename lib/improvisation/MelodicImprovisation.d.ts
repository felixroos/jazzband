import { Improvisation, ImprovisationRules } from "./Improvisation";
export declare class MelodicImprovisation extends Improvisation {
    groove: any;
    constructor(rules: ImprovisationRules);
    nextNote(chord: any): any;
}
