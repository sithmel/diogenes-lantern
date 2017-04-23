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

module.exports = {
  adjList2Links: adjList2Links,
  adjList2Nodes: adjList2Nodes,
  filterNodes: filterNodes
};
