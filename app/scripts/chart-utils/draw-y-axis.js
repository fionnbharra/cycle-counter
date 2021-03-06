'use strict';
var d3 = require('./../d3-extended');

module.exports = (group, yscale, options) => {
  var yAxis = d3.svg.axis()
                  .scale(yscale)
                  .orient(options.orientation)
                  .tickFormat(function(d) { return d; })
                  .outerTickSize([0])
                  .innerTickSize([0])
                  .ticks(5);

  return group.append('g')
              .attr('class', 'axis yaxis')
              .attr('transform', `translate(${options.transform} , 00)`)
              .call(yAxis);
};
