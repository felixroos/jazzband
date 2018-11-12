"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Improvisation_1 = require("./Improvisation");
var MelodicImprovisation = /** @class */ (function (_super) {
    __extends(MelodicImprovisation, _super);
    function MelodicImprovisation(rules) {
        return _super.call(this, rules) || this;
    }
    MelodicImprovisation.prototype.nextNote = function (chord) {
        this.mutate(function () { return ({ chord: chord }); })
            .mutate(function (_a) {
            var note = _a.note, playedNotes = _a.playedNotes;
            return ({
                playedNotes: [note()].concat(playedNotes())
            });
        });
        return this.get('lastNote');
    };
    return MelodicImprovisation;
}(Improvisation_1.Improvisation));
exports.MelodicImprovisation = MelodicImprovisation;
