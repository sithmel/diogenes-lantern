var assert = require('chai').assert;
var prepareLogs = require('../src/utils').prepareLogs;

var logs = [
  { evt: 'log-start', key: 1, service: 'test1', ts: 1 },
  { evt: 'log-end',   key: 1, service: 'test1', ts: 2 },
  { evt: 'log-start', key: 1, service: 'test2', ts: 3 },
  { evt: 'log-error', key: 1, service: 'test2', ts: 4 },
  { evt: 'log-start', key: 2, service: 'test3', ts: 5 },
  { evt: 'log-end',   key: 2, service: 'test3', ts: 6 }
];

describe('prepareLogs', function () {
  it('is a function', function () {
    assert.isFunction(prepareLogs);
  });

  it('prepares logs', function () {
    var data = prepareLogs(logs);
    assert.deepEqual(data, [
      {
        service: 'test1',
        start: new Date(1),
        end: new Date(2),
        logs: {
          'log-start': [{ evt: 'log-start', key: 1, service: 'test1', ts: 1 }],
          'log-end': [{ evt: 'log-end', key: 1, service: 'test1', ts: 2 }]
        }
      },
      {
        service: 'test2',
        start: new Date(3),
        end: new Date(4),
        logs: {
          'log-start': [{ evt: 'log-start', key: 1, service: 'test2', ts: 3 }],
          'log-error': [{ evt: 'log-error', key: 1, service: 'test2', ts: 4 }]
        }
      },
      {
        service: 'test3',
        start: new Date(5),
        end: new Date(6),
        logs: {
          'log-start': [{ evt: 'log-start', key: 2, service: 'test3', ts: 5 }],
          'log-end': [{ evt: 'log-end', key: 2, service: 'test3', ts: 6 }]
        }
      }
    ]);

  });

});
