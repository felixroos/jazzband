"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Numeric = /** @class */ (function () {
    function Numeric() {
    }
    // calculates number sequence f inside range
    Numeric.sequence = function (f, options) {
        if (options === void 0) { options = {}; }
        var value;
        var exitCase = __assign({ exitCase: function (value, numbers) { return numbers.includes(value); } }, options).exitCase;
        var numbers = [].concat(options.initialValues || []);
        while (true) {
            value = f(numbers, numbers.length - 1);
            if (exitCase(value, numbers)) {
                break;
            }
            numbers.push(value);
        }
        return numbers;
    };
    Numeric.minMax = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return values.sort();
    };
    Numeric.api = function (options) {
        var _this = this;
        var defaultApi = {
            init: function (values) {
                return _this.api(__assign({}, options, _this.init(values)));
            },
            range: function (a, b) {
                return _this.api(__assign({}, options, _this.range(a, b)));
            },
            fixed: function (length) {
                return _this.api(__assign({}, options, _this.fixed(length)));
            },
            sequence: function (f) { return _this.sequence(f, options); },
            /* plot: (f: PlotPoint) =>
              this.plot(f, options.plotRange, options.quantization) */
            plot: function (f) {
                return _this.api(__assign({}, options, { plotFunction: f }));
            },
            render: function () {
                if (options.plotFunction) {
                    return _this.plotArray(options.plotFunction, options.plotRange, options.quantization);
                }
                if (options.sequenceFunction) {
                    return _this.sequence(options.sequenceFunction, options);
                }
            }
        };
        return __assign({ inititialValues: [], plotRange: [-3, 3], quantization: 10000 }, options, defaultApi);
    };
    Numeric.init = function (initialValues) {
        if (typeof initialValues === 'number') {
            initialValues = [initialValues];
        }
        return this.api({
            initialValues: initialValues
        });
    };
    Numeric.range = function (a, b, grain) {
        if (grain === void 0) { grain = 1; }
        var _a = this.minMax(a, b), min = _a[0], max = _a[1];
        return this.api({
            exitCase: function (value, numbers) {
                return value > max || value < min;
            },
            initialValues: [a],
            plotRange: [a, b, grain]
        });
    };
    Numeric.fixed = function (length) {
        return this.api({
            exitCase: function (value, numbers) {
                return numbers.length > length - 1;
            }
        });
    };
    // calculates number sequence f inside range
    Numeric.rangeSequence = function (f, _a, initialValues) {
        var a = _a[0], b = _a[1];
        if (initialValues === void 0) { initialValues = [a]; }
        var _b = [Math.min(a, b), Math.max(a, b)], min = _b[0], max = _b[1];
        var exitCase = function (value) { return value > max || value < min; };
        return this.sequence(f, { exitCase: exitCase, initialValues: initialValues });
    };
    Numeric.fixedSequence = function (f, length, initialValues) {
        if (initialValues === void 0) { initialValues = []; }
        var exitCase = function (value, numbers) { return numbers.length > length - 1; };
        return this.sequence(f, { exitCase: exitCase, initialValues: initialValues });
    };
    Numeric.uniqueSequence = function (f, initialValues) {
        if (initialValues === void 0) { initialValues = []; }
        var exitCase = function (value, numbers) { return numbers.includes(value); };
        return this.sequence(f, { exitCase: exitCase, initialValues: initialValues });
    };
    // recursive fibonacci function
    Numeric.fibonacci = function (n) {
        if (n < 1) {
            return 0;
        }
        if (n < 3) {
            return 1;
        }
        return this.fibonacci(n - 2) + this.fibonacci(n - 1);
    };
    Numeric.modRange = function (number, _a) {
        var min = _a[0], max = _a[1];
        var value = ((number - min) % max) + min;
        if (value < min) {
            return max + value;
        }
        return value;
    };
    Numeric.saw = function (range, step) {
        var _this = this;
        if (step === void 0) { step = 1; }
        if (typeof range === 'number') {
            range = step >= 0 ? [1, range] : [range, 1];
        }
        var _a = this.minMax.apply(this, range), min = _a[0], max = _a[1];
        return function (s, i) {
            var value = !s.length
                ? range[0]
                : _this.modRange(s[i] + step, [min, max]);
            // const value = !s.length ? range[0] : ((s[i] + step - min) % max) + min;
            if (value < min) {
                return max + value;
            }
            return value;
        };
    };
    Numeric.triangle = function (_a, step) {
        var min = _a[0], max = _a[1];
        if (step === void 0) { step = 1; }
        var _b;
        _b = this.minMax(min, max), min = _b[0], max = _b[1];
        var init = step > 0 ? min : max;
        return function (s, i) {
            var direction = step / Math.abs(step); // inital direction
            if (!s.length) {
                return init;
            }
            if (s.length > 1) {
                direction = s[i] > s[i - 1] ? 1 : -1;
            }
            // are we going up or down?
            var value = s[i] + direction * Math.abs(step);
            // is the next value in that direction invalid?
            if (value < min || value > max) {
                return s[i] + direction * -1 * Math.abs(step);
            }
            return value;
        };
    };
    Numeric.square = function (_a) {
        var min = _a[0], max = _a[1];
        return function (s, i) {
            if (!s.length) {
                return min;
            }
            return s[i] === min ? max : min;
        };
    };
    Numeric.plot = function (f /*  | string */) {
        /* if (typeof f === 'string') {
          f = this.plotFunctions[f];
        } */
        return this.api({
            plotFunction: f
        });
    };
    // calculates the values of f(x) inside range with given precision
    Numeric.plotArray = function (f, range, quantization) {
        if (quantization === void 0) { quantization = 1000; }
        var values = [];
        var x = range[0];
        var grain = range[2] || 1;
        while (x <= range[1]) {
            var value = Math.round(quantization * f(x)) / quantization;
            if (value === -0) {
                value = 0;
            }
            values.push(value);
            x += grain;
        }
        return values;
    };
    // calculates line points within a modulo
    Numeric.plotSaw = function (_a, firstY, length) {
        var m = _a[0], b = _a[1], mod = _a[2];
        if (firstY === void 0) { firstY = 0; }
        if (length === void 0) { length = mod; }
        var saw = function (m, b, mod) { return function (x) {
            var y = ((m * x) % (mod - b)) + b;
            return y < b ? mod + y - b : y; // subtract values outside of [b,mod] from mod
        }; };
        var start = (firstY - b) / m; // get x value of firstY
        return this.plotArray(saw(m, b, mod), [start, start + length - 1]);
    };
    // calculates linear steps of given length within a number range
    Numeric.plotPenrose = function (_a, start, step, length) {
        var min = _a[0], max = _a[1];
        if (start === void 0) { start = min; }
        if (step === void 0) { step = 1; }
        if (length === void 0) { length = max - min + 1; }
        return this.plotSaw([step, min, max + 1], start, length);
    };
    return Numeric;
}());
exports.Numeric = Numeric;
