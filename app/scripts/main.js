/* jshint devel:true */
var Model = require('./model');
var Chart = require('./chart');
var Toggle = require('./toggle');

window.onload = function() {
  'use strict';
  var data_path = process.env.NODE_ENV === 'development' ? '../data/data.json' : 'https://fierce-escarpment-5315.herokuapp.com/data.json';

  new Model(data_path, function(model){

    new Toggle('.toggle');
    new Chart('#graph-container', model);


  });

};
