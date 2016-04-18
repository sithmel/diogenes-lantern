var Diogenes = require('diogenes');
var logDecorator = require('async-deco/callback/log');
var lantern = require('../src/lantern');

var registry = Diogenes.getRegistry();
registry.service('database')
.provides([
  logDecorator(),
  function (config, deps, next) {
    next(undefined, 'database');
  }
]);

registry.service('userdata')
.dependsOn(['database'])
.provides([
  logDecorator(),
  function (config, deps, next) {
    next(undefined, 'userdata');
  }
]);

registry.service('userprofile')
.dependsOn(['database', 'userdata'])
.provides([
  logDecorator(),
  function (config, deps, next) {
    next(undefined, 'userprofile');
  }
]);

registry.service('permissions')
dependsOn(['userprofile', 'userdata'])
.provides([
  logDecorator(),
  function (config, deps, next) {
    next(undefined, 'permissions');
  }
]);

var registryInstance = registry.instance();

var lantern = new Lantern(registryInstance);

lantern.draw(document.body);
