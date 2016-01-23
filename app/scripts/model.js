'use strict';
var d3 = require('d3-browserify');
var moment = require('moment');

function Model(data_url, callback) {
  this.loadData(data_url, dataset => {
    this.dataset = this.parseData(dataset);
    callback(this);
  });
}

Model.prototype.loadData = function (file, callback) {
  d3.json(file, (error, dataset) => {
    callback.apply(this, [dataset]);
  });
};

Model.prototype.parseData = function (dataset) {
  return dataset.filter( d => d.date !== '')
                .filter( d => d.date = moment(d.date))
                .sort( (a, b) => a.date - b.date);
};

Model.prototype.getExtent = function (field) {
  return d3.extent(this.dataset, d => d[field]);
};

module.exports = Model;
