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
          return { source: name, target: target };
        });
    })
    .reduce(function (accumulator, a) {
      return accumulator.concat(a);
    }, []);
}

module.exports = {
  adjList2Links: adjList2Links,
  adjList2Nodes: adjList2Nodes
};
