'use strict';
var d3 = require('./d3-extended');
var BikeGroup = require('./bike-group');
var TempGroup = require('./temp-group');
var PubSub = require('pubsub-js');

function Chart(container, model){
  this.container = container;
  this.model = model;
  this.margin = {top: 20, right: 2, bottom: 90, left: 30};
  this.width =  1140 - this.margin.left - this.margin.right;
  this.height =  407 - this.margin.top - this.margin.bottom;
  this.svg = this.createSvg({container: this.container});
  this.dataset = model.dataset;
  this.drawGraph({svg: this.svg, model: this.model});
  this.attachEvents();
}

Chart.prototype.createSvg = function (options) {
  return d3.select(options.container)
          .append('svg')
          .attr('width', this.width  + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
};

Chart.prototype.getYscale = function (field) {
  return d3.scale.linear()
            .domain(this.model.getExtent(field))
            .range([this.height, 0]);
};

Chart.prototype.getXscale = function () {
  return d3.time.scale()
            .domain(this.model.getExtent('date'))
            .range([0, this.width]);
};

Chart.prototype.drawGraph = function () {
  var x_axis = this.drawXAxis();
  var temp_group = new TempGroup(this.svg, this.model, this.getXscale(), this.getYscale('apparentTemperatureMax'));
  var bike_group = new BikeGroup(this.svg, this.model, this.getXscale(), this.getYscale('totalBikes'));

  return {
    temp_group,
    bike_group,
    x_axis
  };
};

Chart.prototype.drawXAxis = function () {
  var xAxis = d3.svg.axis()
                .scale(this.getXscale())
                .orient('bottom')
                .tickFormat(d3.time.format('%x'))
                .outerTickSize([0])
                // .innerTickSize([0])
                .ticks(5);

  this.svg.append('g')
              .attr('class', 'axis xaxis')
              .attr('transform', 'translate(0,' + this.height + ')')
              .attr('stroke-width', 2)
              .call(xAxis)
              .selectAll('text')
              .attr('y', 0)
              .attr('x', 9)
              .attr('dy', '.35em')
              .attr('transform', 'rotate(90)')
              .style('text-anchor', 'start');
  return xAxis;
};

Chart.prototype.attachEvents = function () {
  PubSub.subscribe('TOGGLE', function () {
    d3.selectAll('.data_group').classed('active', function () {
      if (!d3.select(this).classed('active')) {
        d3.select(this).moveToFront();
      }
      return !d3.select(this).classed('active');
    });
  });
};

module.exports = Chart;
