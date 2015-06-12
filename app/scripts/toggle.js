'use strict';
var d3 = require('d3-browserify');
var PubSub = require('pubsub-js');

function Toggle(elem) {
  var toggle  = d3.select(elem);
  toggle.on('click', function() {
    toggle.classed('active', !toggle.classed('active'));
    PubSub.publish( 'FINBAR', 'hello world!' );
  });
}

module.exports = Toggle;
