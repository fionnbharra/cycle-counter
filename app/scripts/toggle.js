'use strict';
var d3 = require('d3-browserify');
var PubSub = require('pubsub-js');

function Toggle(elem) {

  var toggle  = d3.select(elem);
  var toggle_labels = d3.selectAll('.toggle-label');


  toggle.on('click', function() {
    toggle.classed('active', !toggle.classed('active'));
    toggle_labels.classed("active", function (d, i) {
      return !d3.select(this).classed("active");
    });

    PubSub.publish('TOGGLE');
  });
}

module.exports = Toggle;
