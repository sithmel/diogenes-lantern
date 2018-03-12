function adjList2Nodes (adjList) {
  return Object.keys(adjList)
    .map(function (name) {
      return { name: name }
    })
}

function adjList2Links (adjList) {
  return Object.keys(adjList)
    .map(function (name) {
      return adjList[name].deps
        .map(function (target) {
          return { source: target, target: name, id: target + '-' + name }
        })
    })
    .reduce(function (accumulator, a) {
      return accumulator.concat(a)
    }, [])
}

module.exports = {
  adjList2Links: adjList2Links,
  adjList2Nodes: adjList2Nodes
}
