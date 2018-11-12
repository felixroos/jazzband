"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Improvisation = /** @class */ (function () {
    function Improvisation(rules) {
        this.rules = rules;
        this.cache = {};
    }
    Improvisation.prototype.get = function (key, fromCache) {
        if (fromCache === void 0) { fromCache = false; }
        if (fromCache) {
            return this.cache[key];
        }
        var rule = this.rules[key];
        if (rule === undefined) {
            console.error('could not resolve key', key, '!');
        }
        if (typeof rule === 'function') {
            rule = rule(this.getRuleFactories(key));
        }
        this.cache[key] = rule;
        return rule;
    };
    Improvisation.prototype.enhance = function (rules) {
        return new Improvisation(Object.assign({}, this.rules, rules));
    };
    Improvisation.prototype.mutate = function (reducer) {
        this.rules = Object.assign({}, this.rules, reducer(this.getRuleFactories()));
        return this;
    };
    Improvisation.prototype.getRuleFactories = function (originKey) {
        var _this = this;
        return Object.keys(this.rules)
            .map(function (key) { return ({ key: key, factory: function () { return _this.get(key); } }); })
            .reduce(function (factories, _a) {
            var key = _a.key, factory = _a.factory;
            var _b, _c;
            return (Object.assign({}, factories, (_b = {}, _b[key] = factory, _b), (originKey ? (_c = {}, _c[originKey] = function () { return _this.cache[originKey]; }, _c) : {})));
        }, {});
    };
    return Improvisation;
}());
exports.Improvisation = Improvisation;
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
