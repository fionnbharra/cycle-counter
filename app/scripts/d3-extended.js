'use strict';
var d3 = require('d3-browserify');

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

module.exports = d3;
