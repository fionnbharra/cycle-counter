'use strict';
var d3 = require('./../d3-extended');
var textures = require('textures/textures');

function createArea(xScale, yScale, field) {
  var area = d3.svg
      .area()
      .interpolate('monotone')
      .x((d) => xScale(d.date))
      .y0(297) //TODO: should be dynamic
      .y1((d) => yScale(d[field]));

  return area;
}

function texture() {
  return textures
    .paths()
    .d('nylon')
    .lighter()
    .thicker()
    .stroke('#eaeae2');
}

module.exports = (data, field, group, xScale, yScale) => {
  var area = createArea(xScale, yScale, field);
  group.call(texture(group));
  return group.append('path')
          .datum(data)
          .attr('class', 'area ' + field)
          .attr('d', area);
};
