'use strict';
var d3 = require('./d3-extended');
var textures = require('textures/textures');
var Bike = require('./bike');
var PubSub = require('pubsub-js');

function Chart(container, model){
  this.container = container;
  this.model = model;
  this.margin = {top: 20, right: 40, bottom: 90, left: 30};
  this.width =  940 - this.margin.left - this.margin.right;
  this.height =  407 - this.margin.top - this.margin.bottom;
  this.svg = this.createSvg({container: this.container});
  this.dataset = model.dataset;
  this.yScaleBike = this.getBikeYscale();
  this.yScaleTemp = this.getTempYscale();
  this.xScale = this.getXscale();
  this.drawGraph({svg: this.svg, model: this.model});
  this.attachEvents();
};

Chart.prototype.createSvg = function (options) {
  var svg = d3.select(options.container)
              .append('svg')
              .attr('width', this.width  + this.margin.left + this.margin.right)
              .attr('height', this.height + this.margin.top + this.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  return svg;
};

Chart.prototype.getBikeYscale = function () {
  return d3.scale.linear()
            .domain(this.model.getExtentBikes())
            .range([this.height, 0]);
};

Chart.prototype.getTempYscale = function () {
  return d3.scale.linear()
            .domain(this.model.getExtentTemp())
            .range([this.height, 0]);
};

Chart.prototype.getXscale = function () {
  return d3.time.scale()
            .domain(this.model.getExtentX())
            .range([0, this.width]);
};

Chart.prototype.drawGraph = function () {
  var grid = this.drawGrid();
  var axes = this.drawAxes();

  var temp_group = this.createTempGroup(this.svg);
  var bike_group = this.createBikeCountGroup(this.svg);

  return {
    temp_group: temp_group,
    bike_group: bike_group,
    grid: grid,
    axes: axes
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
    group: group,
    line: line,
    animated_bike: animated_bike,
    area: area
  }
};

Chart.prototype.createBikeCountGroup = function(svg) {
  var group = svg.append('g')
                 .attr('class', 'bike_group data_group active');
  var line = this.drawLine(this.dataset, 'totalBikes',  group);
  var circles = this.drawCircles(this.dataset, group);
  var axes = this.drawYAxis(group);
  // var events = this.setEvents( {target: line} );
  // var animated_bike = new Bike('bike.svg', this.svg, line, 14000);

  return {
    group: group,
    line: line,
    circles: circles
  }
};

Chart.prototype.createLine = function (field) {
  var self = this;
  var line = d3
      .svg.line()
      .x(function(d) {
        return self.xScale(d.date); })
      .y(function(d) {
       return self.determineScaleType(field)(d[field]); })
      .interpolate('monotone');

  return line;
};

Chart.prototype.drawLine = function (data, field, group) {
  var line = this.createLine(field);

  return group
      .append('path')
      .datum(data)
      .attr('class', 'line ' + field)
      .attr('d', line);
};

Chart.prototype.determineScaleType = function (field) {
  switch (field) {
    case 'totalBikes':
      return this.yScaleBike;
    case 'apparentTemperatureMax':
      return this.yScaleTemp;
  }
};

Chart.prototype.drawGrid = function () {
  var xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient('bottom')
                .tickFormat(d3.time.format('%b %Y'))
                .ticks(10);

  var yAxis1 = d3.svg.axis()
                  .scale(this.yScaleBike)
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
                .scale(this.xScale)
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
                  .scale(this.yScaleBike)
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
                  .scale(this.yScaleTemp)
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
      .x(function(d) { return self.xScale(d.date); })
      .y0(this.height)
      .y1(function(d) { return self.yScaleTemp(d[field]); });

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

Chart.prototype.drawCircles = function (dataset, group) {
  var self = this;
  var mask_circles = group.selectAll('circle.masker')
                    .data(dataset)
                    .enter()
                    .append('circle')
                    .attr('class', 'masker')
                    .attr('stroke-width', 5)
                    .attr('r', 5)
                    .attr('cy', function(data) {
                      return(self.yScaleBike(data.totalBikes));
                    })
                    .attr('cx', function(data) {
                      return(self.xScale(data.date));
                    });
  var circles = group.selectAll('circle.marker')
                    .data(dataset)
                    .enter()
                    .append('circle')
                    .attr('stroke-width', 2)
                    .attr('r', 3)
                    .attr('class', 'marker')
                    .attr('cy', function(data) {
                      return(self.yScaleBike(data.totalBikes));
                    })
                    .attr('cx', function(data) {
                      return(self.xScale(data.date));
                    });

  return {
    circles: circles,
    mask_circles: mask_circles
  };
};

Chart.prototype.setEvents = function(options) {
  var self = this;
  var bisectDate = d3.bisector(function(d) { return d.date; }).left;
  options.target.on('click', function() {
    var data = self.dataset;
    var mouse = d3.mouse(this);
    var mouseDate = self.xScale.invert(mouse[0]);
    var i = bisectDate(data, mouseDate); // returns the index to the current data item
    var d0 = data[i - 1];
    var d1 = data[i];

     // work out which date value is closest to the mouse
    var d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
    var x = self.xScale(d.date);
    var y = self.yScaleBike(d.totalBikes);
    return {
      x: x,
      y: y
    };
  });
}

Chart.prototype.attachEvents = function () {
  PubSub.subscribe('TOGGLE', function (event, message) {
    d3.selectAll('.data_group').classed("active", function (d, i) {
      if(!d3.select(this).classed("active")) d3.select(this).moveToFront();
      return !d3.select(this).classed("active");
    });
  });
};

module.exports = Chart;
