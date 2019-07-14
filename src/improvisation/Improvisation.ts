
declare type ImprovisationRuleFactory<T> = () => ImprovisationRule<T>;

declare type ImprovisationRuleFactories = { [key: string]: ImprovisationRuleFactory<any> };

declare type DynamicImprovisationRule<T> = (factories: { [key: string]: ImprovisationRuleFactory<any> }) => T;

declare type ImprovisationRule<T> = T | DynamicImprovisationRule<T>;
export declare type ImprovisationRules = { [key: string]: ImprovisationRule<any> };

declare type ImprovisationReducer = (rules: ImprovisationRules) => ImprovisationRules;

export class Improvisation {
  cache = {};
  constructor(public rules: ImprovisationRules) { }

  get(key: string, fromCache = false) {
    if (fromCache) {
      return this.cache[key];
    }
    let rule = this.rules[key];
    if (rule === undefined) {
      console.error('could not resolve key', key, '!');
    }
    if (typeof rule === 'function') {
      rule = rule(this.getRuleFactories(key));
    }
    this.cache[key] = rule;
    return rule;
  }

  enhance(rules: ImprovisationRules) {
    return new Improvisation(Object.assign({},
      this.rules,
      rules
    ));
  }

  mutate(reducer: ImprovisationReducer) {
    this.rules = Object.assign({},
      this.rules,
      reducer(this.getRuleFactories())
    );
    return this;
  }

  getRuleFactories(originKey?: string): ImprovisationRuleFactories {
    return Object.keys(this.rules)
      .map(key => ({ key, factory: () => this.get(key) }))
      .reduce((factories, { key, factory }) => (
        Object.assign({},
          factories,
          { [key]: factory },
          (originKey ? { [originKey]: () => this.cache[originKey] } : {})
        )
      ), {})
  }
}

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