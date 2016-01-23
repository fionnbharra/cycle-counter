'use strict';
var drawLine = require('./chart-utils/draw-line');
var drawCircles = require('./chart-utils/draw-circles');

function BikeGroup(svg, model, xScale, yScale) {
  var group = svg.append('g')
                 .attr('class', 'bike_group data_group active');
                 console.log(group);
  var line = drawLine(model.dataset, 'totalBikes', group, xScale, yScale);
  var circles = drawCircles(model.dataset, 'totalBikes', group, xScale, yScale);
}

module.exports = BikeGroup;
