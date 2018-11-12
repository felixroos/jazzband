"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var permutator_1 = require("./permutator");
exports.guideTones = permutator_1.permutator.enhance({
    groove: function () { return (function (m) {
        return m.measure.map(function () { return [1]; });
    }); },
    pattern: [3, 7]
});
