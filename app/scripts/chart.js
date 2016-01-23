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
  // var bike_group = this.createBikeCountGroup(this.svg);

  return {
    // temp_group,
    // bike_group,
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

Chart.prototype.createBikeCountGroup = function(svg) {
  var group = svg.append('g')
                 .attr('class', 'bike_group data_group active');
  var line = this.drawLine(this.dataset, 'totalBikes',  group);
  var circles = this.drawCircles(this.dataset, group);
  var axes = this.drawYAxis(group);
  var events = this.setEvents( {target: circles.circles} );

  return {
    group,
    line,
    circles,
    axes,
    events
  };
};

Chart.prototype.createLine = function (field) {
  return d3
        .svg.line()
        .x((d) => {
          return this.getXscale()(d.date);
        })
        .y((d) => {
         return this.getYscale(field)(d[field]);
        })
        .interpolate('monotone');
};

Chart.prototype.drawLine = function (data, field, group) {
  var line = this.createLine(field);

  return group
      .append('path')
      .datum(data)
      .attr('class', 'line ' + field)
      .attr('clip-path', 'url(#clip)')
      .attr('d', line);
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

Chart.prototype.drawYAxis = function (container) {
  var yAxis1 = d3.svg.axis()
                  .scale(this.getYscale('totalBikes'))
                  .orient('right')
                  .tickFormat(function(d) { return d; })
                  .outerTickSize([0])
                  .innerTickSize([0])
                  .ticks(5);

  container.append('g')
              .attr('class', 'axis yaxis')
              .attr('transform', 'translate(-30 , 00)')
              .call(yAxis1);

  return yAxis1;
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

Chart.prototype.setEvents = function(options) {

  var self = this;
  var bisectDate = d3.bisector(function(d) { return d.date; }).left;

  options.target.on('click', function() {
    var data = self.dataset;
    var mouse = d3.mouse(this);
    var mouseDate = self.getXscale().invert(mouse[0]);
    var i = bisectDate(data, mouseDate); // returns the index to the current data item
    var d0 = data[i - 1];
    var d1 = data[i];

     // work out which date value is closest to the mouse
    var d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
    var x = self.getXscale()(d.date);
    var y = self.getYscale('totalBikes')(d.totalBikes);
    PubSub.publish('GRAPHCLICK', { date: d.date.format('dddd, MMMM Do YYYY'), numberOfBikes: d.totalBikes, temperature: d.temperatureMax });

    return {
      x,
      y
    };
  });
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
