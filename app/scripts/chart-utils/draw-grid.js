'use strict';
var d3 = require('./../d3-extended');

module.exports = (group, xScale, yScale) => {

  var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickFormat(d3.time.format('%b %Y'))
                .ticks(10);

  var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left')
                  .ticks(5);

  var y_lines = group.append('g')
              .style('stroke-dasharray', ('3, 3'))
              .attr('class', 'grid')
              .attr('transform', 'translate(0 ,0)')
              .call(yAxis
                .tickSize(-(1140), 0, 0)
                .tickFormat('')
              );
  return {
    y_lines: y_lines,
    xAxis: xAxis
  };

};
