var Diogenes = require('diogenes');
var lantern = require('../src/lantern');

var registry = Diogenes.getRegistry();
registry.service('database')
.provides(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'database');
  }, 100);
});

registry.service('userdata')
.dependsOn(['database'])
.provides(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'userdata');
  }, 120);
});

registry.service('userprofile')
.dependsOn(['database', 'userdata'])
.provides(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'userprofile');
  }, 80);
});

registry.service('permissions')
.dependsOn(['userprofile', 'userdata'])
.provides(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'permissions');
  }, 180);
});

var registryInstance = registry.instance();

lantern(registryInstance, document.getElementById('canvas'), {
  onFocus: function (name) {
    console.log(name);
  }
});
