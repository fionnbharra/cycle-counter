'use strict';
var d3 = require('d3-browserify');

function Loader(elem) {

}

Loader.prototype.complete = function() {
  d3.select('html').classed("loading", false);
};

module.exports = Loader;
