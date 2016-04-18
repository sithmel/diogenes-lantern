(function (){

  var d3 = typeof exports === 'object' ? require('d3') : window.d3;

  function focusNode(node, infoObj, textNode) {
    var rows = ['<h3>' + infoObj.name + '</h3>'];
    rows.push('<p>' + infoObj.description + '</p>');

    if (infoObj.inactive) {
      rows.push('<p><strong>Not available with this configuration.</strong></p>');
    }

    if (infoObj.dependencies.length > 0) {
      rows.push('<br />');
      rows.push('<p>Dependencies:</p><ul>');
      infoObj.dependencies.forEach(function (d) {
        rows.push('<li>' + d + '</li>');
      });
      rows.push('</ul>');
    }

    if (infoObj.metadata) {
      rows.push('<br />');
      rows.push('<p>Metadata:</p>');
      rows.push('<pre>');
      rows.push(JSON.stringify(this.metadata()), null, '  ');
      rows.push('</pre>');
    }

    textNode.innerHTML = rows.join('\n');
  }

  function blurNode(node, infoObj, textNode) {
    textNode.innerHTML = '';
  }

  function DiogenesDraw(adjList, infoObj, opts) {
    this.opts = opts || {};
    this.adjList = adjList;
    this.infoObj = infoObj;
  }

  DiogenesDraw.prototype.getDocsForService = function (info) {
  }


  DiogenesDraw.prototype.draw = function (DOMnode) {
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

    var infoObj = this.infoObj;
    var adjList = this.adjList;

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
          onFocus.call(this, node, infoObj[node.name], textNode[0][0]);
        })
        .on('blur', function (node){
          onBlur.call(this, node, infoObj[node.name], textNode[0][0]);
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


  if (typeof exports === 'object') {
    module.exports = DiogenesDraw;
  }
  else if (typeof window === 'object') {
    // Expose Diogenes to the browser global object
    window.DiogenesDraw = DiogenesDraw;
  }

}())


// function debugStart(name, debugInfo) {
//   if (!(name in debugInfo)) {
//     debugInfo[name] = {};
//   }
//   debugInfo[name].start = Date.now();
// }
//
// function debugEnd(name, debugInfo) {
//   if (!(name in debugInfo)) {
//     debugInfo[name] = {};
//   }
//   debugInfo[name].end = Date.now();
//   debugInfo[name].delta = debugInfo[name].end - debugInfo[name].start;
// }


// RegistryInstance.prototype.infoObj = function registryInstance_infoObj() {
//   var config = this._config;
//   var registry = this._registry;
//
//   var out = {};
//   registry.forEach(function (service, name) {
//     out[name] = this.infoObj(config);
//   });
//   return out;
// };
//
// RegistryInstance.prototype.info = function registryInstance_info() {
//   var config = this._config;
//   var registry = this._registry;
//   var out = [];
//   registry.forEach(function (service) {
//     out.push(this.info(config));
//   });
//   return out.join('\n\n');
// };

// Service.prototype.infoObj = function service_infoObj(config) {
//   var out = {};
//   out.name = this.name;
//   out.description = this.description();
//   out.dependencies = this._getDeps(config, true).deps;
//
//   try {
//     out.executionOrder = this._registry
//     .instance(config)
//     .getExecutionOrder(this.name, true)
//     .slice(0, -1);
//   }
//   catch (e) {
//     out.inactive = true;
//     out.dependencies = [];
//   }
//
//   out.cached = this._mainCache.isOn();
//   out.manageError = !!this.onError;
//
//   out.metadata = this.metadata();
//   return out;
// };
//
// Service.prototype.info = function service_info(config) {
//   var infoObj = this.infoObj(config);
//   var rows = [infoObj.name];
//   rows.push(infoObj.name.split('').map(function () {return '=';}).join(''));
//   rows.push(infoObj.description);
//
//   if (infoObj.inactive) {
//     rows.push('Not available with this configuration.');
//   }
//
//   if (infoObj.executionOrder.length > 0) {
//     rows.push('');
//     rows.push('Execution order:');
//     infoObj.executionOrder.forEach(function (d) {
//       rows.push('* ' + d);
//     });
//   }
//
//   if (infoObj.dependencies.length > 0) {
//     rows.push('');
//     rows.push('Dependencies:');
//     infoObj.dependencies.forEach(function (d) {
//       rows.push('* ' + d);
//     });
//   }
//
//   if (infoObj.metadata) {
//     rows.push('');
//     rows.push('Metadata:');
//     rows.push('```js');
//     rows.push(JSON.stringify(infoObj.metadata, null, '  '));
//     rows.push('```');
//   }
//
//   rows.push('');
//   if (infoObj.cached) {
//     rows.push('* Cached');
//   }
//   if (infoObj.manageError) {
//     rows.push('* it doesn\'t throw exceptions');
//   }
//
//   return rows.join('\n');
// };
