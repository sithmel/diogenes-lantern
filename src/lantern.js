var d3 = require('d3');

function focusNode(node, textNode) {
  var rows = ['<h3>' + node.name + '</h3>'];
  textNode.innerHTML = rows.join('\n');
}

function blurNode(node, textNode) {
  textNode.innerHTML = '';
}

function Lantern(diogenesInstance, opts) {
  this.opts = opts || {};
  this.diogenesInstance = diogenesInstance;
}

Lantern.prototype.draw = function (DOMnode) {
  var svg, textNode,
      width = this.opts.width || 400,
      height = this.opts.height || 400,
      linkDistance = this.opts.linkDistance || 100,
      charge = this.opts.charge || -40,
      refX = this.opts.refX || 15,
      refY = this.opts.refY || -1.5,
      markerWidth = this.opts.markerWidth || 6,
      markerHeight = this.opts.markerHeight || 6,
      nodeRadius = this.opts.nodeRadius || 8,
      textPositionX = this.opts.textPositionX || 12,
      textPositionY = this.opts.textPositionY || ".31em",
      onFocus = this.opts.onFocus || focusNode,
      onBlur = this.opts.onBlur || blurNode;

  var adjList = this.diogenesInstance.getAdjList();

  var nodes = Object.keys(adjList)
    .reduce(function (obj, name){
      obj[name] = {name: name};
      return obj
    }, {});

  var links = Object.keys(adjList)
    .map(function (name){
      return adjList[name]
        .map(function (target){
          return {source: nodes[name], target: nodes[target], type: "linked"}
        });
    })
    .reduce(function (accumulator, a){
      return accumulator.concat(a);
    }, []);

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(linkDistance)
      .charge(charge)
      .on("tick", tick)
      .start();

  d3.select('.diogenes-draw-canvas').remove();
  d3.select('.diogenes-draw-text').remove();

  svg = d3.select(DOMnode).append("svg")
      .attr('class', 'diogenes-draw-canvas')
      .attr("width", width)
      .attr("height", height);

  textNode = d3.select(DOMnode)
      .append("div")
      .attr('class', 'diogenes-draw-text');

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["linked"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", refX)
      .attr("refY", refY)
      .attr("markerWidth", markerWidth)
      .attr("markerHeight", markerHeight)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", nodeRadius)
      .on('focus', function (node){
        onFocus.call(this, node, textNode[0][0]);
      })
      .on('blur', function (node){
        onBlur.call(this, node, textNode[0][0]);
      })
      .call(force.drag);

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", textPositionX)
      .attr("y", textPositionY)
      .text(function(d) { return d.name; });

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }

};

module.exports = Lantern;
