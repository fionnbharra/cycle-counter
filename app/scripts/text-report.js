'use strict';
var d3 = require('d3-browserify');
var PubSub = require('pubsub-js');

function TextReport(container, model) {
  var self = this;
  var yesterdaysData = this.parseData(model);
  this.writeReport(container, yesterdaysData);

  PubSub.subscribe('GRAPHCLICK', function (event, data) {
    data.date = "On " + data.date;
    self.writeReport(container, data);
  });
}

TextReport.prototype.parseData = function(model) {
  var dataset = model.dataset;
  var lastItemIndex = dataset.length - 1;

  return {
    date: "Yesterday",
    numberOfBikes: dataset[lastItemIndex].totalBikes,
    temperature: dataset[lastItemIndex].temperatureMax
  }
};

TextReport.prototype.writeReport = function(container, data) {
    var numberContainer = d3.select('#number-of-bikes', container);
    var temperatureContainer = d3.select('#temperature', container);
    var dateContainer = d3.select('#date', container);
    numberContainer.html(data.numberOfBikes);
    temperatureContainer.html(data.temperature);
    dateContainer.html(data.date);
};

module.exports = TextReport;
