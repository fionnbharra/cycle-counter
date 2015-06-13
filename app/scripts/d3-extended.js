var d3 = require('d3-browserify');

function D3extended (argument) {
  this = d3;

}

D3extended.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};


module.exports = D3extended;