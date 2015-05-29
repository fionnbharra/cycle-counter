'use strict';
var d3 = require('d3-browserify');
var textures = require('textures/textures');

function Chart(container, model){
  this.container = container;
  this.model = model;
  this.margin = {top: 20, right: 10, bottom: 90, left: 5};
  this.width =  700 - this.margin.left - this.margin.right;
  this.height =  407 - this.margin.top - this.margin.bottom;
  this.svg = this.createSvg({container: this.container});
  this.dataset = model.dataset;
  this.yScaleBike = this.getBikeYscale();
  this.yScaleTemp = this.getTempYscale();
  this.xScale = this.getXscale();
  this.drawGraph({svg: this.svg, model: this.model});
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
  // var grid = this.drawGrid();
  var line2 = this.drawLine(this.dataset, 'apparentTemperatureMax');
  var line1 = this.drawLine(this.dataset, 'totalBikes');
  var area = this.drawArea(this.dataset, 'apparentTemperatureMax');
  var circles = this.drawCircles(this.dataset);
  var events = this.setEvents( {target: line1} );
  var axes = this.drawAxes();
  var self = this;
  var animated_bike = this.addAnimatedBike(line1);

  return {
    line1: line1,
    line2: line2,
    events: events,
    axes: axes
    // grid: grid
  };
};

Chart.prototype.loadBike = function (callback) {
  var self = this;
  d3.xml("../images/bike.svg", "image/svg+xml", function(error, bikeSvg) {
    callback.apply(self, [bikeSvg]);
  });
}

Chart.prototype.addAnimatedBike = function(followPath) {
    var self = this;
    this.loadBike( function(svg){
      var importedNode = document.importNode(svg.documentElement, true);
      var path = importedNode.childNodes[1];

      function pathStartPoint(path) {
        var d = path.attr("d"),
        dsplitted = d.split(" ");
        return dsplitted[0].split(",");
      };

      var startPoint = pathStartPoint(followPath);
      var pos_x = 0;
      var pos_y = startPoint[1].substring(0, startPoint[1].indexOf('.')) - 39;
      var marker = self.svg.append('path')
              .attr('d', d3.select(path).attr('d'))
              .attr('class', 'bike')
              .attr("transform", "translate(0," + pos_y + ")")
      transition();

      function transition() {
        marker.transition()
            .duration(17000)
            .attrTween("transform", translateAlong(followPath.node()))
            .each("end", transition); // infinite loop
      };

      function translateAlong(path) {
        var l = path.getTotalLength();
        var t0 = 0;
        return function(i) {
          return function(t) {
            var p0 = path.getPointAtLength(t0 * l);//previous point
            var p = path.getPointAtLength(t * l);////current point
            var angle = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI;//angle for tangent
            t0 = t;

            var centerX = p.x - 32,
            centerY = p.y - 40;
            return "translate(" + centerX + "," + centerY + ")rotate(" + angle + " 32" + " 40" +")";
          }
        }
      }
  });
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

Chart.prototype.drawLine = function (data, field) {
  var line = this.createLine(field);

  return this.svg
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
  var y_axis1 = this.drawYAxis();
  var y_axis2 = this.drawYAxis2();

  return {
    x_axis: x_axis,
    y_axis1: y_axis1,
    y_axis2: y_axis2
  };
};

Chart.prototype.drawXAxis = function () {
  var xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient('bottom')
                .tickFormat(d3.time.format('%x'))
                .outerTickSize([0])
                .innerTickSize([0])
                .ticks(5);

  this.svg.append('g')
              .attr('class', 'axis xaxis')
              .attr('transform', 'translate(0,' + this.height + ')')
              .call(xAxis
              );

  this.svg.selectAll('.axis text')
    .attr('y', -8)
    .attr('x', 9)
    .attr('dy', '.35em')
    .attr('transform', 'rotate(90)')
    .style('text-anchor', 'start');
  return xAxis;
};

Chart.prototype.drawYAxis = function () {
  var yAxis1 = d3.svg.axis()
                  .scale(this.yScaleBike)
                  .orient('right')
                  .tickFormat(function(d) { return d; })
                  .outerTickSize([0])
                  .innerTickSize([0])
                  .ticks(5);

  this.svg.append('g')
              .attr('class', 'axis yaxis')
              .attr('transform', 'translate(0 , 00)')
              .call(yAxis1);

  return yAxis1;
};

Chart.prototype.drawYAxis2 = function () {
  var yAxis2 = d3.svg.axis()
                  .scale(this.yScaleTemp)
                  .orient('left')
                  .outerTickSize([0])
                  .tickFormat(function(d) { return d + '°'; })
                  .innerTickSize([0])
                  .ticks(5);

  this.svg.append('g')
              .attr('class', 'axis yaxis1')
              .attr('transform', 'translate(' + this.width + ' , 0)')
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

Chart.prototype.drawArea = function (data, field) {
  var area = this.createArea(field);
  var t = textures.paths()
    .d("nylon")
    .lighter()
    .thicker()
    .stroke("#92573B");
  this.svg.call(t);
  // Add the filled area
  return this.svg.append('path')
          .datum(data)
          .style('fill', t.url())
          .attr('class', 'area ' + field)
          .attr('d', area);
};

Chart.prototype.drawCircles = function () {
  var self = this;
  var circles = this.svg.selectAll('circle')
                    .data(self.dataset)
                    .enter()
                    .append('circle')
                    .attr('stroke-width', 1)
                    .attr('cy', function(data) {
                      return(self.yScaleBike(data.totalBikes));
                    })
                    .attr('cx', function(data) {
                      return(self.xScale(data.date));
                    })
                    .attr('r', 3);
  return circles;
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



module.exports = Chart;
