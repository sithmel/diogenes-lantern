var d3 = require('d3')
var utils = require('./utils')

function lantern (opts) {
  opts = opts || {}

  var SVGDOMnode = opts.SVGDOMnode || document.getElementById('lantern-graph')
  var helpDOMNode = opts.helpDOMNode || document.getElementById('lantern-help')
  var width = opts.width || 400
  var height = opts.height || 400
  var linkDistance = opts.linkDistance || 100
  var charge = opts.charge || -40
  var refX = opts.refX || 15
  var refY = opts.refY || -1.5
  var markerWidth = opts.markerWidth || 6
  var markerHeight = opts.markerHeight || 6
  var nodeRadius = opts.nodeRadius || 8
  var textPositionX = opts.textPositionX || 12
  var textPositionY = opts.textPositionY || '.31em'

  var $SVGDOMnode = d3.select(SVGDOMnode)
  var nodes, links, circle, forceLinks, path, text,
    circleUpdate, pathUpdate, textUpdate

  var simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(height / 2, width / 2))
    .alphaTarget(1)
    .on('tick', tick)

    // render
  var svg = $SVGDOMnode.append('svg')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('width', '100%')
    .attr('height', '100vh')
    .classed('dlantern-graph', true)

  // Per-type markers, as they don't inherit styles.
  svg.append('defs').selectAll('marker')
    .data(['linked'])
    .enter().append('marker')
    .attr('id', function (d) { return d })
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', refX)
    .attr('refY', refY)
    .attr('markerWidth', markerWidth)
    .attr('markerHeight', markerHeight)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')

  var groupPath = svg.append('g')
  var groupCircle = svg.append('g')
  var groupText = svg.append('g')

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick () {
    path.attr('d', linkArc)
    circle.attr('transform', transform)
    text.attr('transform', transform)
  }

  function linkArc (d) {
    var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy)
    return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y
  }

  function transform (d) {
    return 'translate(' + d.x + ',' + d.y + ')'
  }

  function dragstarted (d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged (d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragended (d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  function updateFocus () {
    circle
      .classed('dlantern-graph__node--focus', function (d) { return !!d.focus })
  }

  return {
    render: function (adjList, doc) {
      var random = function () { return Math.random().toString(36).substring(7) }

      // items
      nodes = utils.adjList2Nodes(adjList)
      links = utils.adjList2Links(adjList)

      // init force simulation
      forceLinks = d3.forceLink()
        .links(links)
        .distance(linkDistance)
        .id(function id (d) {
          return d.name
        })

      pathUpdate = groupPath.selectAll('path')
        .data(links, function (d) { return d.id })

      path = pathUpdate
        .enter().append('path')
        .classed('dlantern-graph__link', true)
        .attr('marker-end', function (d) { return 'url(#linked)' })
        .merge(pathUpdate)

      circleUpdate = groupCircle.selectAll('circle')
        .data(nodes, function (d) { return d.name })

      circle = circleUpdate
        .enter().append('circle')
        .classed('dlantern-graph__node', true)
        .attr('r', nodeRadius)
        .on('focus', function (node) {
          helpDOMNode.innerHTML = '<h3>' + node.name + '</h3>' + doc[node.name]
        })
        .on('blur', function (node) {
          helpDOMNode.innerHTML = ''
        })
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .merge(circleUpdate)

      textUpdate = groupText.selectAll('text')
        .data(nodes, function (d) { return d.name })

      text = textUpdate
        .enter().append('text')
        .classed('dlantern-graph__label', true)
        .attr('x', textPositionX)
        .attr('y', textPositionY)
        .text(function (d) { return d.name })
        .merge(textUpdate)

      pathUpdate
        .exit().remove()
      circleUpdate
        .exit().remove()
      textUpdate
        .exit().remove()

      simulation
        .nodes(nodes)
        .force('links', forceLinks)
        .alphaTarget(1)
        .restart()
    }
  }
}

module.exports = lantern
