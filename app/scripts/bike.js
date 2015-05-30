var d3 = require('d3-browserify');

function Bike(image_file_name, container_svg, follow_path, duration) {
  var self = this;
  this.width = 0;
  this.height = 0;
  this.duration = duration;
  var svg_file_path_base = process.env.NODE_ENV === 'development' ? '../images/' : '../cycle-counter/images/';
  var svg_file_path = svg_file_path_base + image_file_name;
  this.loadBike(svg_file_path, function(xml){
    self.animateBikeOnPath(xml, container_svg, follow_path)
  });
};

Bike.prototype.loadBike = function(svg_file_path, callback) {
  var self = this;
  d3.xml(svg_file_path, 'image/svg+xml', function(error, bikeSvg) {
    callback.apply(self, [bikeSvg]);
  });
};

Bike.prototype.animateBikeOnPath = function(xml, container_svg, follow_path) {
    var self = this;
    var importedNode = document.importNode(xml.documentElement, true);
    var node = process.env.NODE_ENV === 'development' ? 1 : 0;
    var path = importedNode.childNodes[node];
    this.width = parseInt(d3.select(importedNode).attr('width').replace(/\D/g,''));
    this.height = parseInt(d3.select(importedNode).attr('height').replace(/\D/g,''));
    var startPoint = self.pathStartPoint(follow_path);
    var pos_x = 0;
    var pos_y = startPoint[1].substring(0, startPoint[1].indexOf('.')) - 39;
    var marker = container_svg.append('path')
      .attr('d', d3.select(path).attr('d'))
      .attr('class', 'bike')
      .attr('transform', 'translate(0,' + pos_y + ')')
    self.transition(marker, follow_path);
};

Bike.prototype.pathStartPoint = function(path) {
  var d = path.attr('d'),
  dsplitted = d.split(' ');
  return dsplitted[0].split(',');
};

Bike.prototype.transition = function(marker, follow_path) {
  var self = this;
  marker.transition()
    .duration(self.duration)
    .attrTween('transform', self.translateAlong(follow_path.node()))
    .each('end', function () {
      self.transition(marker, follow_path);
    }); // infinite loop
};

Bike.prototype.translateAlong = function(path) {
  var l = path.getTotalLength();
  var t0 = 0;
  var self = this;
  return function(i) {
    return function(t) {
      var p0 = path.getPointAtLength(t0 * l);//previous point
      var p = path.getPointAtLength(t * l);////current point
      var angle = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI;//angle for tangent
      t0 = t;
      var centerX = p.x - (self.width/2),
      centerY = p.y - self.height;
      return 'translate(' + centerX + ',' + centerY + ')rotate(' + angle + ' ' + (self.width/2) + '' + ' ' + (self.height) + '' +')';
    }
  }
};

module.exports = Bike;