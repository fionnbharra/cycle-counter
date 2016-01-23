'use strict';
var d3 = require('./../d3-extended');
function createLine(xScale, yScale, field) {
  return d3
        .svg
        .line()
        .x( d => {
          return xScale(d.date); })
        .y( d => {
          return yScale(d[field]);
        })
        .interpolate('monotone');
}

module.exports = (data, field, group, xScale, yScale) => {
  var line = createLine(xScale, yScale, field);

  return group
      .append('path')
      .datum(data)
      .attr('class', 'line ' + field)
      .attr('clip-path', 'url(#clip)')
      .attr('d', line);
};
