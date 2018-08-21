"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var waaclock_1 = __importDefault(require("waaclock"));
var Pulse = /** @class */ (function () {
    function Pulse(props) {
        if (props === void 0) { props = {}; }
        this.defaults = {
            bpm: 120,
            cycle: 4,
            delay: 0
        };
        this.events = [];
        this.callbackAtTime = false;
        this.props = Object.assign({}, this.defaults, props);
        this.context = this.props.context || new AudioContext();
        this.clock = this.props.clock || new waaclock_1.default(this.context, { toleranceEarly: 0.1, toleranceLate: 0.1 });
    }
    Pulse.prototype.getMeasureLength = function (bpm, beatsPerMeasure) {
        if (bpm === void 0) { bpm = this.props.bpm; }
        if (beatsPerMeasure === void 0) { beatsPerMeasure = this.props.cycle; }
        return 60 / bpm * beatsPerMeasure;
    };
    Pulse.prototype.arrayPulse = function (children, length, path, start, callback, deadline) {
        var _this = this;
        if (length === void 0) { length = 1; }
        if (path === void 0) { path = []; }
        if (start === void 0) { start = 0; }
        //TODO: return promise on next one (for chaining)
        if (!Array.isArray(children)) {
            if (children === 0) {
                return 0;
            }
            var item_1 = {
                value: children,
                length: length,
                path: path,
                start: start,
                pulse: this,
                cycle: this.props.cycle,
                timeout: null
            };
            start += this.props.delay; // TODO: be able to add delay from arrayPulse fn directly
            if (this.callbackAtTime) {
                start += deadline ? deadline : this.context.currentTime;
                item_1.timeout = this.clock.callbackAtTime(function (event) {
                    return callback(Object.assign(item_1, { event: event, deadline: event.deadline }));
                }, start);
            }
            else {
                start += (deadline || this.context.currentTime) - this.context.currentTime;
                item_1.timeout = this.clock.setTimeout(function (event) {
                    return callback(Object.assign(item_1, { event: event, deadline: event.deadline }));
                }, start);
            }
            this.events.push(item_1.timeout);
            return item_1;
        }
        var childLength = length / children.length;
        return {
            length: length,
            children: children.map(function (el, i) {
                return _this.arrayPulse(el, childLength, path.concat([i]), start + i * childLength, callback, deadline);
            })
        };
    };
    Pulse.prototype.tickArray = function (array, callback, deadline, length) {
        var _this = this;
        array.push(1);
        var l = length || this.getMeasureLength() * array.length;
        this.start();
        return new Promise(function (resolve, reject) {
            _this.arrayPulse(array, l, [], 0, function (tick, start) {
                if (tick.path[0] === array.length - 1) {
                    resolve(tick);
                }
                else {
                    callback(tick, start);
                }
            }, deadline);
        });
    };
    Pulse.prototype.start = function () {
        // console.log('start with', this.events.length, 'events');
        var criticalEvents = 6000;
        if (this.events.length > criticalEvents) {
            console.warn('more than ', criticalEvents, 'events received. Consider using less "times" to keep the timing precies');
        }
        this.clock.start();
    };
    Pulse.prototype.stop = function () {
        this.clock.stop();
    };
    Pulse.prototype.changeTempo = function (newTempo, timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = 0.2; }
        var factor = this.props.bpm / newTempo;
        this.props.bpm = newTempo;
        var events = this.events.filter(function (e) {
            return e.deadline - _this.context.currentTime > timeout;
        });
        // TODO: stretch durations?!
        this.clock.timeStretch(this.context.currentTime, events, factor);
    };
    return Pulse;
}());
exports.Pulse = Pulse;
