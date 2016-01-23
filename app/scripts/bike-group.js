'use strict';
var d3 = require('./d3-extended');
var PubSub = require('pubsub-js');
var drawLine = require('./chart-utils/draw-line');
var drawCircles = require('./chart-utils/draw-circles');
var drawYaxis = require('./chart-utils/draw-y-axis.js');

function BikeGroup(svg, model, xScale, yScale) {
  var group = svg.append('g')
                 .attr('class', 'bike_group data_group active');
  var line = drawLine(model.dataset, 'totalBikes', group, xScale, yScale);
  var circles = drawCircles(model.dataset, 'totalBikes', group, xScale, yScale);
  var yAxis = drawYaxis(group, yScale, 'left');
  var events = this.setEvents(circles, model.dataset, xScale, yScale);

  return {
    line,
    circles,
    yAxis,
    events
  };
}

BikeGroup.prototype.setEvents = function (circles, data, xScale, yScale) {
  var bisectDate = d3.bisector( (d) => d.date).left;
  circles[1].on('click', function() {
    var mouse = d3.mouse(this);
    var mouseDate = xScale.invert(mouse[0]);
    var i = bisectDate(data, mouseDate); // returns the index to the current data item
    var d0 = data[i - 1];
    var d1 = data[i];

     // work out which date value is closest to the mouse
    var d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
    var x = xScale(d.date);
    var y = yScale(d.totalBikes);
    PubSub.publish('GRAPHCLICK', { date: d.date.format('dddd, MMMM Do YYYY'), numberOfBikes: d.totalBikes, temperature: d.temperatureMax });

    return {
      x,
      y
    };
  });

};

module.exports = BikeGroup;
