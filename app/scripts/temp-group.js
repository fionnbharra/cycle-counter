'use strict';
var drawLine = require('./chart-utils/draw-line');
var drawYaxis = require('./chart-utils/draw-y-axis.js');
var drawArea = require('./chart-utils/draw-area');
var drawGrid = require('./chart-utils/draw-grid.js');
var Bike = require('./bike');

function TempGroup(svg, model, xScale, yScale) {
  var group = svg.append('g')
                 .attr('class', 'temp_group data_group ');
  var grid = drawGrid(group, xScale, yScale);
  var line = drawLine(model.dataset, 'apparentTemperatureMax', group, xScale, yScale);
  var animated_bike = new Bike('bike_2.svg', group, line, 55000);
  var area = drawArea(model.dataset, 'apparentTemperatureMax', group, xScale, yScale);
  var yAxis = drawYaxis(group, yScale, this.axisOptions());
  return {
    grid,
    area,
    line,
    yAxis,
    animated_bike
  };
}

TempGroup.prototype.axisOptions = function () {
  return {
    orientation: 'right',
    transform: '870' // TODO: this is the width of the grid and should really be dynamic
  };
};


module.exports = TempGroup;
