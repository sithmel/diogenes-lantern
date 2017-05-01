var _groupBy = require('lodash/groupBy');
var _values = require('lodash/values');
var _property = require('lodash/property');
var _map = require('lodash/map');

function adjList2Nodes(adjList) {
  return Object.keys(adjList)
    .map(function (name) {
      return { name: name };
    });
}

function adjList2Links(adjList) {
  return Object.keys(adjList)
    .map(function (name) {
      return adjList[name]
        .map(function (target) {
          return { source: target, target: name, id: target + '-' + name };
        });
    })
    .reduce(function (accumulator, a) {
      return accumulator.concat(a);
    }, []);
}

function filterNodes(nodes, name) {
  return name ? nodes.filter(function (n) { return name === n.name; }) : nodes;
}

function prepareLogs(logs) {
  var grouped = _groupBy(logs, _property('key'));
  var arrays = _values(grouped)
    .map(function (group) {
      return _map(_groupBy(group, _property('service')), function (logs, service) {
        var logGroup = _groupBy(logs, _property('evt'));
        var start = tsGetter('log-start')(logGroup);
        var end = tsGetter('log-end')(logGroup) || tsGetter('log-error')(logGroup);

        return {
          service: service,
          logs: logGroup,
          start: start[0],
          end: end[0]
        };
      });
    });
  return Array.prototype.concat.apply([], arrays);
}

function tsGetter(name) {
  return function (logs) {
    if (name in logs) {
      return logs[name].map(function (l) { return new Date(l.ts); });
    }
  };
}

module.exports = {
  adjList2Links: adjList2Links,
  adjList2Nodes: adjList2Nodes,
  filterNodes: filterNodes,
  prepareLogs: prepareLogs,
  tsGetter: tsGetter
};
