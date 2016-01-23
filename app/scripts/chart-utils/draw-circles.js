'use strict';
const circles = [
  {
    cssClass: 'masker',
    width: 5,
    radius: 5
  },
  {
    cssClass: 'marker',
    width: 2,
    radius: 3
  }
];

module.exports = (dataset, field, group, xScale, yScale) => {
   return circles.map((c) => {
    return group.selectAll(`circle.${c.cssClass}`)
          .data(dataset)
          .enter()
          .append('circle')
          .attr('class', c.cssClass)
          .attr('stroke-width', c.width)
          .attr('r', c.radius)
          .attr('cy', (data) => {
            return(yScale(data[field]));
          })
          .attr('cx', (data) => {
            return(xScale(data.date));
          });
  });
};
