'use strict';
var d3 = require('d3-browserify');
var moment = require('moment');
var extend = require('extend');

function Model(data_url, callback) {
  var weather_data;
  var self = this;

  this.loadData(data_url, function(dataset){
    self.dataset = dataset;
    self.dataset = this.parseWeatherData(dataset, 'AvgTemp', 'EnergyCost');
    callback(this);
  });
}

Model.prototype.loadData = function (file, callback) {
  var self = this;

  d3.json(file, function(error, dataset) {
    callback.apply(self, [dataset]);
  });
};

Model.prototype.parseWeatherData = function (dataset, temp_field, cost_field) {
  var new_dataset = extend(true, [], dataset);
  new_dataset = new_dataset.filter(function(d){ return d.Date !== ''; });

  new_dataset.filter(function(d, i) {
    d.date = moment(d.date);
  });

  // sort by date
  new_dataset.sort(function (a, b) {
    return a.date - b.date;
  });

  return new_dataset;
}

Model.prototype.getExtent = function (field) {
  return d3.extent(this.dataset, function(d) { return d[field]; });
}

Model.prototype.getExtentTemp = function () {
  return this.getExtent('apparentTemperatureMax');
}

Model.prototype.getExtentBikes = function () {
  return this.getExtent('totalBikes');
}

Model.prototype.getExtentX = function () {
  return this.getExtent('date');
}

module.exports = Model;
