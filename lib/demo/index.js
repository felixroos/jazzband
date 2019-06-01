"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_selection_1 = require("d3-selection");
var d3_color_1 = require("d3-color");
var d3_scale_1 = require("d3-scale");
var width = 960;
var height = 500;
window.onload = function () {
    var color = d3_scale_1.scaleLinear().domain([45, 75])
        .interpolate(d3_color_1.interpolateHcl)
        .range([d3_color_1.rgb("#007AFF"), d3_color_1.rgb('#FFF500')]);
    var svg = d3_selection_1.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    var elLength = 500;
    var noteNumber = 60;
    var element = svg.append("g");
    element.append("rect")
        .attr("width", elLength)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("x", 0)
        .attr("y", (noteNumber - 45) * 12)
        .attr("fill", color(noteNumber));
    element.append("text")
        .attr("x", 3)
        .attr("y", 15 + (noteNumber - 45) * 12)
        .text('test');
};
