var P = require('bluebird')
var sinon = require('sinon')

var getMockDriver = exports.getMockDriver = function() {
  var dumbP = P.resolve([{'test': 1}])

  var res = {
    builder: {
      select: function() { return {} },
      count: function() { return {} },
      insert: function() { return {} },
      update: function() { return {} },
      delete: function() { return {} },
      exec: function() { return {} },
    },
    runQuery: function() { return P.resolve([ this.document ? this.document._attributes : {}]) },
    select: function() { return P.resolve([ this.document ? this.document._attributes : {}]) },
    count: function() { return P.resolve(1) },
    insert: function() { return P.resolve([ this.document ? this.document._attributes : {}]) },
    update: function() { return P.resolve([ this.document ? this.document._attributes : {}]) },
    delete: function() { return P.resolve([ this.document ? this.document._attributes : {}]) },
    exec: function() { return P.resolve([ this.document ? this.document._attributes : {}]) }
  }

  sinon.spy(res.builder, 'select')
  sinon.spy(res.builder, 'count')
  sinon.spy(res.builder, 'insert')
  sinon.spy(res.builder, 'update')
  sinon.spy(res.builder, 'delete')
  sinon.spy(res.builder, 'exec')

  sinon.spy(res, 'select')
  sinon.spy(res, 'count')
  sinon.spy(res, 'insert')
  sinon.spy(res, 'update')
  sinon.spy(res, 'delete')
  sinon.spy(res, 'exec')

  return res
}
