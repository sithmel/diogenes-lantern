var d3 = require('d3');
var prepareLogs = require('../src/utils').prepareLogs;
var _property = require('lodash/property');

function waterfall(DOMnode, opts) {
  opts = opts || {};

  var width = opts.width || 1000,
    height = opts.height || 800,
    barHeight = opts.barHeight || 30,
    paddingTop = opts.paddingTop || 10,
    paddingBottom = opts.paddingBottom || 10,
    paddingLeft = opts.paddingLeft || 10,
    paddingRight = opts.paddingRight || 10,
    textSpace = opts.textSpace || 150,
    onFocus = opts.onFocus || function () {};

  var $DOMnode = d3.select(DOMnode);

  var svg = $DOMnode.append('svg')
    .attr('width', width)
    .attr('height', height)
    .classed('dlantern-waterfall', true);

  return {
    render: function (logs) {
      var groupedLogs = prepareLogs(logs);
      var minTS = d3.min(logs, _property('ts'));
      var maxTS = d3.max(logs, _property('ts'));
      var tsScale = d3.scaleLinear()
        .range([paddingLeft + textSpace, width - paddingRight])
        .domain([minTS, maxTS]);

      // var verticalScale = d3.scaleLinear()
      //   .range([paddingTop, height - paddingBottom])
      //   .domain([0, groupedLogs.length]);

      var sequentialScale = d3.scaleSequential()
        .domain([0, 10])
        .interpolator(d3.interpolateRainbow);

      var bars = svg
        .selectAll('.dlantern-waterfall__bar')
        .data(groupedLogs);

      bars
        .enter()
        .append('rect')
        .classed('dlantern-waterfall__bar', true)
        .merge(bars)
        .attr('x', function (d) {
          return tsScale(d.start.getTime());
        })
        .attr('y', function (d, i) { return (i * barHeight) + paddingTop; })
        .attr('width', function (d) {
          return tsScale(d.end.getTime()) - tsScale(d.start.getTime());
        })
        .attr('height', barHeight)
        .attr('fill', function (d, i) { return sequentialScale(i); });

      bars
        .exit()
        .remove();

      var labels = svg
        .selectAll('.dlantern-waterfall__label')
        .data(groupedLogs);

      labels
        .enter()
        .append('text')
        .classed('dlantern-waterfall__label', true)
        .merge(labels)
        .attr('x', paddingLeft)
        // .attr('y', function (d, i) { return (i * barHeight) + paddingTop; })
        .attr('transform', function (d, i) {
          var spacing = (i * barHeight) + paddingTop;
          return 'translate(0, ' + spacing + ')';
        })
        .attr('font-size', barHeight / 2)
        .attr('font-family', 'verdana')
        .text(function (d) { return d.service; });

      var xAxis = d3.axisBottom(tsScale)
        .tickFormat(function (t) { return t - minTS; });

      svg.append('g')
        .attr('transform', 'translate(' + paddingLeft + ',0)')
        .call(xAxis);

      // evt:"log-start"
      // key:"c4ca4238a0b923820dcc509a6f75849b"
      // service: "userprofile"
      // ts:1493652482631

    }
  };
}

module.exports = waterfall;
