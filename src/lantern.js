var d3 = require('d3');
var or = require('occamsrazor');

function Lantern(diogenesInstance, DOMnode, opts) {
  this.opts = opts || {};
  this.diogenesInstance = diogenesInstance;

  this.diogenesInstance._registry.events.on(this.logger.bind(this));
  this.events = or();

  // state
  this.adjList = this.diogenesInstance.getAdjList();
  this.logs = {};
  this.currentLog = '';
  this.currentTime;

  // DOM
  this.$DOMnode = d3.select(DOMnode);

  this.$graphNode = this.$DOMnode
    .append('div')
    .attr('class', 'diogenes-graph');

  this.$sliderNode = this.$DOMnode
    .append('div')
    .attr('class', 'diogenes-slider');

  this.$optionsNode = this.$DOMnode
    .append('div')
    .attr('class', 'diogenes-options');

  this.$textNode = this.$DOMnode
      .append('div')
      .attr('class', 'diogenes-text');

  // attach render functions
  this.events.on('update-logs', this.renderSelectBox.bind(this));
  this.events.on('update-slider', this.renderSlider.bind(this));

  // render
  this.renderGraph();
  this.events.trigger('update-logs');
  this.events.trigger('update-slider');
}

Lantern.prototype.resetLogger = function () {
  this.logs = {};
  this.events.trigger('update-logs');
};

Lantern.prototype.renderSelectBox = function () {
  var that = this;
  var selected = this.currentLog === '' ? 'selected="selected"' : '';
  var html = '<select><option value="" ' + selected + '>all</option>';

  html += Object.keys(this.logs)
    .map(function (key) {
      var selected = key === this.currentLog ? 'selected="selected"': '';
      return '<option value="' + key + '" ' + selected + '>' + key + '</option>';
    })
    .join('');
  html += '</select>';
  this.$optionsNode.html(html);

  this.$optionsNode.select('select')
  .on('change', function (evt) {
    that.currentLog = this.value;
    that.events.trigger('update-slider');
  });
};

Lantern.prototype._getLogs = function () {
  var logs, that = this;
  if (this.currentLog) {
    logs = this.logs[this.currentLog];
  }
  else {
    logs = Object.keys(this.logs).map(function (k) {
      return that.logs[k];
    })
    .reduce(function (a, b) {
      return a.concat(b);
    }, []);
  }
  // sort
  logs = logs.sort(function (a, b) {
    if (a.ts < b.ts) {
      return -1;
    }
    else if (a.ts > b.ts) {
      return 1;
    }
    else {
      return 0;
    }
  });
  return logs;
};

Lantern.prototype.renderSlider = function () {
  var that = this;
  var logs = this._getLogs();
  if (!logs.length) {
    return this.$sliderNode.html('<p>No events yet</p>');
  }

  var min = logs[0].ts;
  var max = logs[logs.length -1].ts;

  var current = this.currentTime && this.currentTime > min && this.currentTime < max ? this.currentTime : min;
  this.$sliderNode.html('<input type="range" min="' + min + '" max="' + max + '" value="' + current + '"/>');
  this.$sliderNode.select('input')
  .on('input', function () {
    that.currentTime = parseInt(this.value);
    // console.log(new Date());
  });
};

Lantern.prototype.logger = function (name, id, ts, evt, payload, instance) {
  if (instance !== this.diogenesInstance) return;

  if (!(id in this.logs)) {
    this.logs[id] = [];
    this.events.trigger('update-logs');
  }

  this.logs[id].push({
    name: name,
    id: id,
    ts: ts,
    evt: evt,
    payload: payload
  });
};

Lantern.prototype.renderGraph = function () {
  var svg,
    $textNode = this.$textNode,
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
    textPositionY = this.opts.textPositionY || '.31em',
    onFocus = this.focusNode.bind(this),
    onBlur = this.blurNode.bind(this);

  var adjList = this.adjList;

  this.$graphNode.html('');

  var nodes = Object.keys(adjList)
    .reduce(function (obj, name) {
      obj[name] = {name: name};
      return obj;
    }, {});

  var links = Object.keys(adjList)
    .map(function (name) {
      return adjList[name]
        .map(function (target) {
          return {source: nodes[name], target: nodes[target], type: 'linked'};
        });
    })
    .reduce(function (accumulator, a) {
      return accumulator.concat(a);
    }, []);

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(linkDistance)
      .charge(charge)
      .on('tick', tick)
      .start();

  svg = this.$graphNode.append('svg')
      .attr('class', 'diogenes-draw-canvas')
      .attr('width', width)
      .attr('height', height);

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

  var path = svg.append('g').selectAll('path')
      .data(force.links())
    .enter().append('path')
      .attr('class', function (d) { return 'link ' + d.type; })
      .attr('marker-end', function (d) { return 'url(#' + d.type + ')'; });

  var circle = svg.append('g').selectAll('circle')
      .data(force.nodes())
    .enter().append('circle')
      .attr('r', nodeRadius)
      .on('focus', function (node) {
        onFocus.call(this, node, $textNode);
      })
      .on('blur', function (node) {
        onBlur.call(this, node, $textNode);
      })
      .call(force.drag);

  var text = svg.append('g').selectAll('text')
      .data(force.nodes())
    .enter().append('text')
      .attr('x', textPositionX)
      .attr('y', textPositionY)
      .text(function (d) { return d.name; });

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
};

Lantern.prototype.focusNode = function (node, $textNode) {
  var logs = this._getLogs()
  .filter(function (l) {
    return node.name === l.name;
  });

  var rows = ['<h3>' + node.name + '</h3>'];
  if (logs.length) {
    rows.push('<table><thead><tr><th>Time</th><th>Event</th><th>Payload</th></tr></thead><tbody>');
    logs.forEach(function (l) {
      rows.push('<tr><td>' + new Date(l.ts) + '</td><td>' + l.evt + '</td><td>' + JSON.stringify(l.payload) + '</td></tr>');
    });
    rows.push('</tbody></table>');
  }
  $textNode.html(rows.join('\n'));
};

Lantern.prototype.blurNode = function (node, $textNode) {
  $textNode.html('');
};

module.exports = Lantern;
