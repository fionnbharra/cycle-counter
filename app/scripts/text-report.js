'use strict';
var d3 = require('d3-browserify');
var PubSub = require('pubsub-js');

function TextReport(container, model) {
  this.numberContainer = d3.select('#number-of-bikes', container);
  this.temperatureContainer = d3.select('#temperature', container);
  this.dateContainer = d3.select('#date', container);
  this.writeReport(container, this.yesterdaysData(model));
  this.wireEvents(container);
}

TextReport.prototype.wireEvents = function(container) {
  PubSub.subscribe('GRAPHCLICK', (event, data) => {
    data.date = `On ${data.date}`;
    this.writeReport(container, data);
  });
};

TextReport.prototype.yesterdaysData = function(model) {
  var dataset = model.dataset;
  var lastItemIndex = dataset.length - 1;

  return {
    date: 'Yesterday',
    numberOfBikes: dataset[lastItemIndex].totalBikes,
    temperature: dataset[lastItemIndex].temperatureMax
  };
};

TextReport.prototype.writeReport = function(container, data) {
    this.numberContainer.html(data.numberOfBikes);
    this.temperatureContainer.html(data.temperature);
    this.dateContainer.html(data.date);
};

module.exports = TextReport;
