var Diogenes = require('diogenes')
var graph = require('../src/lantern')

var registry = Diogenes.getRegistry()
registry.service('database')
  .doc = 'manage the connection to the db'

registry.service('userdata')
  .dependsOn(['database'])
  .doc = 'user data'

registry.service('userprofile')
  .dependsOn(['database', 'userdata'])
  .doc = 'profile data'

registry.service('permissions')
  .dependsOn(['userprofile', 'userdata'])
  .doc = 'permissions data'

var doc = registry.map(function (service) {
  return service.doc
})

var g = graph()
g.render(registry.getAdjList(), doc)

// g.focus('userdata')
