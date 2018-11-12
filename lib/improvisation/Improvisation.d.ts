declare type ImprovisationRuleFactory<T> = () => ImprovisationRule<T>;
declare type ImprovisationRuleFactories = {
    [key: string]: ImprovisationRuleFactory<any>;
};
declare type DynamicImprovisationRule<T> = (factories: {
    [key: string]: ImprovisationRuleFactory<any>;
}) => T;
declare type ImprovisationRule<T> = T | DynamicImprovisationRule<T>;
export declare type ImprovisationRules = {
    [key: string]: ImprovisationRule<any>;
};
declare type ImprovisationReducer = (rules: ImprovisationRules) => ImprovisationRules;
export declare class Improvisation {
    rules: ImprovisationRules;
    cache: {};
    constructor(rules: ImprovisationRules);
    get(key: string, fromCache?: boolean): any;
    enhance(rules: ImprovisationRules): Improvisation;
    mutate(reducer: ImprovisationReducer): this;
    getRuleFactories(originKey?: string): ImprovisationRuleFactories;
}
export {};
/**
 *
 * methods: { [method: string]: ImprovisationRules } = {
        guideTones: {
            pattern: [3, 7]
        },
        flippedGuideTones: {
            pattern: [3, 7],
            flip: true,
        },
        chordTones: {
            pattern: [1, 3, 7],
            variance: .5,
            variety: .5,
            drill: .5,
            flip: ({ drill }) => Math.random() * Math.abs(drill()) > .5,
        }
    }
 */ 
