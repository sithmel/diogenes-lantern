var Diogenes = require('diogenes');
var logDecorator = require('async-deco/callback/log');
var Lantern = require('../src/lantern');

var registry = Diogenes.getRegistry();
registry.service('database')
.provides([
  logDecorator(),
  function (config, deps, next) {
    setTimeout(function () {
      next(undefined, 'database');
    }, 100);
  }
]);

registry.service('userdata')
.dependsOn(['database'])
.provides([
  logDecorator(),
  function (config, deps, next) {
    setTimeout(function () {
      next(undefined, 'userdata');
    }, 120);
  }
]);

registry.service('userprofile')
.dependsOn(['database', 'userdata'])
.provides([
  logDecorator(),
  function (config, deps, next) {
    setTimeout(function () {
      next(undefined, 'userprofile');
    }, 80);
  }
]);

registry.service('permissions')
.dependsOn(['userprofile', 'userdata'])
.provides([
  logDecorator(),
  function (config, deps, next) {
    setTimeout(function () {
      next(undefined, 'permissions');
    }, 180);
  }
]);

var registryInstance = registry.instance();

var lantern = new Lantern(registryInstance, document.getElementById('canvas'));


// run registryInstance

document.getElementById('run').addEventListener('click', function (evt) {
  registryInstance.run('permissions', function (err, data) {
    console.log(data);
  });
});
