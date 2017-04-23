var Diogenes = require('diogenes');
var graph = require('../src/lantern').graph;
var addLogger = require('async-deco/utils/add-logger');
var logDecorator = require('async-deco/callback/log');
var compose = require('async-deco/utils/compose');

var logs = [];

// the log needs to associate the execution
function getLogKey(cfg) {
  return cfg.key;
}

// This decorator adds the logging to the functions
function buildLogger(serviceName) {
  return compose(
    addLogger(function (evt, payload, ts, key) {
      logs.push({
        ts: ts,
        evt: evt,
        key: key,
        service: serviceName
      });
      console.log(ts, evt, payload, key, serviceName);
    }, getLogKey),
    logDecorator()
  );
}

var registry = Diogenes.getRegistry();
registry.service('database')
.provides(buildLogger('database')(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'database');
  }, 100);
}));

registry.service('userdata')
.dependsOn(['database'])
.provides(buildLogger('userdata')(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'userdata');
  }, 120);
}));

registry.service('userprofile')
.dependsOn(['database', 'userdata'])
.provides(buildLogger('userprofile')(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'userprofile');
  }, 80);
}));

registry.service('permissions')
.dependsOn(['userprofile', 'userdata'])
.provides(buildLogger('permissions')(function (config, deps, next) {
  setTimeout(function () {
    next(undefined, 'permissions');
  }, 180);
}));

var registryInstance = registry.instance({ key: 1 });
registryInstance.run('permissions');


var g = graph(document.getElementById('canvas'), {
  onFocus: function (name) {
    console.log(name);
  }
});

g.render(registryInstance);
// g.render(registryInstance);
// g.render(registryInstance);
// g.render(registryInstance);

g.focus('userdata');


// var w = waterfall(document.getElementById('canvas'));

// w.render(logs);
