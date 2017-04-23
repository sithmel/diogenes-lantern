var d3 = require('d3');
var utils = require('./utils');

function lantern(DOMnode, opts) {
  opts = opts || {};

  var width = opts.width || 400,
    height = opts.height || 400,
    linkDistance = opts.linkDistance || 100,
    charge = opts.charge || -40,
    refX = opts.refX || 15,
    refY = opts.refY || -1.5,
    markerWidth = opts.markerWidth || 6,
    markerHeight = opts.markerHeight || 6,
    nodeRadius = opts.nodeRadius || 8,
    textPositionX = opts.textPositionX || 12,
    textPositionY = opts.textPositionY || '.31em',
    onFocus = opts.onFocus || function () {};

  var $DOMnode = d3.select(DOMnode);
  var nodes, links, adjList, circle, forceLinks, path, text;

  // var simulation;
  var simulation = d3.forceSimulation()
    // .nodes(nodes)
    .force('charge', d3.forceManyBody())
    // .force('links', forceLinks)
    .force('center', d3.forceCenter(height / 2, width / 2))
    .on('tick', tick);

    // render
  var svg = $DOMnode.append('svg')
    .attr('width', width)
    .attr('height', height)
    .classed('diogenes-lantern-vis', true);

  // Per-type markers, as they don't inherit styles.
  svg.append('defs').selectAll('marker')
      .data(['linked'])
    .enter().append('marker')
      .attr('id', function (d) { return d; })
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', refX)
      .attr('refY', refY)
      .attr('markerWidth', markerWidth)
      .attr('markerHeight', markerHeight)
      .attr('orient', 'auto')
    .append('path')
      .attr('d', 'M0,-5L10,0L0,5');

  var groupPath = svg.append('g');
  var groupCircle = svg.append('g');
  var groupText = svg.append('g');

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr('d', linkArc);
    circle.attr('transform', transform);
    text.attr('transform', transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
  }

  function transform(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function updateFocus() {
    circle
     .classed('diogenes-lantern-focus', function (d) { return !!d.focus; });
  }

  return {
    render: function (diogenesInstance) {
      // state
      adjList = diogenesInstance.getAdjList();

      // items
      nodes = utils.adjList2Nodes(adjList);
      links = utils.adjList2Links(adjList);

      // init force simulation
      forceLinks = d3.forceLink()
        .links(links)
        .distance(linkDistance)
        .id(function id(d) {
          return d.name;
        });

      // simulation = d3.forceSimulation()
      //   .nodes(nodes)
      //   .force('charge', d3.forceManyBody())
      //   .force('links', forceLinks)
      //   .force('center', d3.forceCenter(height / 2, width / 2))
      //   .on('tick', tick);

      simulation
        .nodes(nodes)
        .force('links', forceLinks);
        // .on('tick', tick);

      path = groupPath.selectAll('path')
        .data(links, function (d) { return d.id; })
        .enter().append('path')
          .classed('diogenes-lantern-link', true)
          .attr('marker-end', function (d) { return 'url(#linked)'; });


      circle = groupCircle.selectAll('circle')
        .data(nodes, function (d) { return d.name; })
        .enter().append('circle')
          .classed('diogenes-lantern-node', true)
          .attr('r', nodeRadius)
          .on('focus', function (node) {
            onFocus(node.name);
          })
          .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

      text = groupText.selectAll('text')
        .data(nodes, function (d) { return d.name; })
        .enter().append('text')
          .classed('diogenes-lantern-label', true)
          .attr('x', textPositionX)
          .attr('y', textPositionY)
          .text(function (d) { return d.name; });

      path
        .exit().remove();
      circle
        .exit().remove();
      text
        .exit().remove();

    },
    focus: function (nodeName) {
      nodes = utils.filterNodes(nodes, nodeName).map(function (n) {
        n.focus = true;
      });
      updateFocus();
    },
    blur: function (nodeName) {
      nodes = utils.filterNodes(nodes, nodeName).map(function (n) {
        n.focus = false;
      });
      updateFocus();
    }
  };
}

module.exports = lantern;
