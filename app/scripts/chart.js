'use strict';
var d3 = require('./d3-extended');
var textures = require('textures/textures');
var Bike = require('./bike');
var BikeGroup = require('./bike-group');
var PubSub = require('pubsub-js');

function Chart(container, model){
  this.container = container;
  this.model = model;
  this.margin = {top: 20, right: 40, bottom: 90, left: 30};
  this.width =  940 - this.margin.left - this.margin.right;
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
  var grid = this.drawGrid();
  var axes = this.drawAxes();
  // var temp_group = this.createTempGroup(this.svg);
  var bike_group = new BikeGroup(this.svg, this.model, this.getXscale(), this.getYscale('totalBikes'));

  return {
    // temp_group,
    bike_group,
    grid,
    axes
  };
};

Chart.prototype.createTempGroup = function(svg) {
  var group = svg.append('g')
                 .attr('class', 'temp_group data_group ');
  var line = this.drawLine(this.dataset, 'apparentTemperatureMax', group);
  var animated_bike = new Bike('bike_2.svg', group, line, 55000);
  var area = this.drawArea(this.dataset, 'apparentTemperatureMax', group);
  var axes = this.drawYAxis2(group);

  return {
    group,
    line,
    animated_bike,
    area,
    axes
  };
};

Chart.prototype.drawGrid = function () {
  var xAxis = d3.svg.axis()
                .scale(this.getXscale())
                .orient('bottom')
                .tickFormat(d3.time.format('%b %Y'))
                .ticks(10);

  var yAxis1 = d3.svg.axis()
                  .scale(this.getYscale('totalBikes'))
                  .orient('left')
                  .ticks(5);

  var y_lines = this.svg.append('g')
              .style('stroke-dasharray', ('3, 3'))
              .attr('class', 'grid')
              .attr('transform', 'translate(0 ,0)')
              .call(yAxis1
                .tickSize(-(this.width), 0, 0)
                .tickFormat('')
              );
  return {
    y_lines: y_lines,
    xAxis: xAxis
  };
};

Chart.prototype.drawAxes = function () {
  var x_axis = this.drawXAxis();

  return {
    x_axis: x_axis,
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

Chart.prototype.drawYAxis2 = function (container) {
  var yAxis2 = d3.svg.axis()
                  .scale(this.getYscale('apparentTemperatureMax'))
                  .orient('left')
                  .outerTickSize([0])
                  .tickFormat(function(d) { return d + '°'; })
                  .innerTickSize([0])
                  .ticks(5);

  container.append('g')
              .attr('class', 'axis yaxis')
              .attr('transform', 'translate(' + (this.width + 25)  + ' , 0)')
              .call(yAxis2);

  return yAxis2;
};

Chart.prototype.createArea = function(field) {
  var self = this;

  var area = d3.svg
      .area()
      .interpolate('monotone')
      .x(function(d) { return self.getXscale()(d.date); })
      .y0(this.height)
      .y1(function(d) { return self.getYscale('apparentTemperatureMax')(d[field]); });

  return area;
};

Chart.prototype.drawArea = function (data, field, group) {
  var area = this.createArea(field);
  var t = textures.paths()
    .d('nylon')
    .lighter()
    .thicker()
    .stroke('#eaeae2');
  group.call(t);
  // Add the filled area
  return group.append('path')
          .datum(data)
          // .style('fill', t.url())
          .attr('class', 'area ' + field)
          .attr('d', area);
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
