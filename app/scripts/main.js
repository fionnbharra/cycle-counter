/* jshint devel:true */
var Model = require('./model');
var Chart = require('./chart');

window.onload = function() {
  new Model('https://fierce-escarpment-5315.herokuapp.com/data.json', function(model){
    console.log(model.dataset[0])
    new Chart('#graph-container', model);
  });
};