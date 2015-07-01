'use strict';
var d3 = require('d3-browserify');

function TextReport(model, container) {
  this.writeReport(model, container);
}

TextReport.prototype.writeReport = function(model, container) {
  d3.select('html').classed("loading", false);
};

module.exports = TextReport;
