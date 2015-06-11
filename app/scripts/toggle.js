'use strict';
var d3 = require('d3-browserify');

function Toggle(elem){
  var toggle  = d3.select(elem);
  toggle.on('click', function() {
    toggle.classed("active", !toggle.classed("active"));
  });
}

module.exports = Toggle;