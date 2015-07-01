/* jshint devel:true */
var Model = require('./model');
var Chart = require('./chart');
var Toggle = require('./toggle');
var Loader = require('./loader');
var TextReport = require('./text-report');

window.onload = function() {
  'use strict';
  var data_path = process.env.NODE_ENV === 'development' ? '../data/data.json' : 'https://fierce-escarpment-5315.herokuapp.com/data.json';
  var loader = new Loader();

  new Model(data_path, function(model){
    loader.complete();
    new Toggle('.toggle');
    new TextReport('#text-container', model);
    new Chart('#graph-container', model);
  });

};
