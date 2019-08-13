"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fractions = /** @class */ (function () {
    function Fractions() {
    }
    Fractions.add = function (a, b, cancel) {
        if (cancel === void 0) { cancel = true; }
        var _a;
        var lcm = Fractions.lcm(a[1], b[1]);
        _a = [a, b].map(function (f) { return Fractions.setDivisor(f, lcm); }), a = _a[0], b = _a[1];
        var sum = [a[0] + b[0], lcm];
        if (cancel) {
            return Fractions.cancel(sum);
        }
        return sum;
    };
    Fractions.cancel = function (a) {
        return Fractions.setDivisor(a, a[1] / Fractions.gcd(a[0], a[1]));
    };
    Fractions.setDivisor = function (a, divisor) {
        return [a[0] * divisor / a[1], divisor];
    };
    Fractions.lcm = function (x, y) {
        return (!x || !y) ? 0 : Math.abs((x * y) / Fractions.gcd(x, y));
    };
    Fractions.gcd = function (x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
        while (y) {
            var t = y;
            y = x % y;
            x = t;
        }
        return x;
    };
    return Fractions;
}());
exports.Fractions = Fractions;
