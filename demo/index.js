const Diogenes = require('diogenes')
const lanternMiddleware = require('../src/server')
const express = require('express')

const app = express()

const registry = Diogenes.getRegistry()
registry.service('database')
  .provides(function () {})
  .setCache({ len: 1 })
  .doc('manage the connection to the db')

registry.service('userdata')
  .dependsOn(['database'])
  .provides(function () {})
  .doc('user data')

registry.service('userprofile')
  .dependsOn(['database', 'userdata'])
  .provides(function () {})
  .doc('profile data')

registry.service('permissions')
  .dependsOn(['userprofile', 'userdata'])
  .provides(function () {})
  .doc('permissions data')

registry.service('render')
  .dependsOn(['userprofile', 'userdata', 'permissions', 'req', 'res'])
  .provides(function () {})
  .doc('render data')

const getRegistry = (req, res) => registry

app.get('/', lanternMiddleware(getRegistry, { title: 'test' }))

app.listen(3000, () => console.log('Listening at: http://localhost:3000'))
