'use strict';
var d3 = require('d3-browserify');

function TextReport(container, model) {
  var yesterdaysData = this.parseData(model);
  this.writeReport(container, yesterdaysData);
}

TextReport.prototype.parseData = function(model) {
  var dataset = model.dataset;
  var lastItemIndex = dataset.length - 1;

  return {
    numberOfBikes: dataset[lastItemIndex].totalBikes,
    temperature: dataset[lastItemIndex].temperatureMax
  }
};

TextReport.prototype.writeReport = function(container, yesterdaysData) {
    var numberContainer = d3.select('#number-of-bikes', container);
    var temperatureContainer = d3.select('#temperature', container);
    numberContainer.html(yesterdaysData.numberOfBikes);
    temperatureContainer.html(yesterdaysData.temperature);
};

module.exports = TextReport;
