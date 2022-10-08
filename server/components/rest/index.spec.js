'use strict'

require('should')
var sinon = require('sinon')
var P = require('bluebird')

var rest = require('./index')

function makeMockCollection(arr) {
  arr.toArray = function() {return this}
  return arr
}

function MockDocument(data) {
  this.attributes = data
}


MockDocument.prototype =  {
  save: function() {
    return P.resolve(this)
  },
  delete: function() {
    return P.resolve(this)
  },
  set: function(data) {
    this.attributes = data
  },
  toArray: function() {
    return this.attributes
  }
}

var MockQuery = function() {
}

MockQuery.prototype = {
  returnedDocument: new MockDocument({ 'test': 1 }),

  where: function() { return this },
  count: function() { return P.resolve(5) },
  offset: function(offset) { this._offset = offset; return this },
  limit: function(limit) { this._limit = limit; return this },
  get: function() {
    var that = this
    var items = [{ 'test': 1 }, { 'test': 2 }, { 'test': 3 }, { 'test': 4 }, { 'test': 5 }]
    var start = that._offset || 0
    var end = start + (that._limit || 5)
    items = items.slice(start, end)

    return P.resolve(makeMockCollection(items))
  },
  create: function() { return this },
  findOrFail: function() {
    return P.resolve(this.returnedDocument)
  }
}

describe('components/rest', function () {

  describe('index', function () {
    it('should call query.get, and res.json', function(done) {
      var query = new MockQuery()
      sinon.spy(query, 'where')
      sinon.spy(query, 'count')
      sinon.spy(query, 'offset')
      sinon.spy(query, 'limit')
      sinon.spy(query, 'get')

      var next = sinon.spy(function(err) {
        throw(err)
      })

      var req = {
        header: sinon.spy()
      }

      var res = {
        set: sinon.spy(),

        json: function() {
          res.set.calledWith('Content-Range', 'items 0-4/5').should.be.true
          next.called.should.be.false
          done()
        }
      }

      rest.index(query, req, res, next)
    })

    it('should parse the range header', function(done) {
      var query = new MockQuery()
      sinon.spy(query, 'where')
      sinon.spy(query, 'count')
      sinon.spy(query, 'offset')
      sinon.spy(query, 'limit')
      sinon.spy(query, 'get')

      var next = sinon.spy(function(err) {
        throw(err)
      })

      var req = {
        header: sinon.spy(function(header) {
          if (header === 'Range') {
            return "       items =      2   - 3     "
          }
        })
      }

      var res = {
        set: sinon.spy(),

        json: function() {
          res.set.calledWith('Content-Range', 'items 2-3/5').should.be.true
          next.called.should.be.false
          done()
        }
      }

      rest.index(query, req, res, next)
    })

    it('should return the correct range even when asked with out of range items', function(done) {
      var query = new MockQuery()
      sinon.spy(query, 'where')
      sinon.spy(query, 'count')
      sinon.spy(query, 'offset')
      sinon.spy(query, 'limit')
      sinon.spy(query, 'get')

      var next = sinon.spy(function(err) {
        throw(err)
      })

      var req = {
        header: sinon.spy(function(header) {
          if (header === 'Range') {
            return "items=2-3000"
          }
        })
      }

      var res = {
        set: sinon.spy(),

        json: function() {
          res.set.calledWith('Content-Range', 'items 2-4/5').should.be.true
          next.called.should.be.false
          done()
        }
      }

      rest.index(query, req, res, next)
    })
  })

  describe('create', function () {
  })

  describe('show', function () {
    it('should call query.findOrFail, and res.json', function(done) {
      var query = new MockQuery()
      sinon.spy(query, 'findOrFail')

      var next = sinon.spy(function(err) {
        throw(err)
      })

      var req = {
        params: {
          id: 1
        }
      }

      var res = {
        set: sinon.spy(),

        json: function() {
          query.findOrFail.calledOnce.should.be.true
          next.called.should.be.false
          done()
        }
      }

      rest.show(query, req, res, next)
    })
  })

  describe('update', function () {
    it('should call query.save, and res.json', function(done) {
      var query = new MockQuery()

      sinon.spy(query, 'findOrFail')
      sinon.spy(query.returnedDocument, 'save')

      var next = sinon.spy(function(err) {
        throw(err)
      })

      var req = {
        params: {
          id: 1
        }
      }

      var res = {
        set: sinon.spy(),

        json: function() {
          query.findOrFail.calledOnce.should.be.true
          query.returnedDocument.save.calledOnce.should.be.true
          next.called.should.be.false
          done()
        }
      }

      rest.update(query, req, res, next)
    })
  })

  describe('destroy', function () {
    it('should call query.delete, and res.json', function(done) {
      var query = new MockQuery()

      sinon.spy(query, 'findOrFail')
      sinon.spy(query.returnedDocument, 'delete')

      var next = sinon.spy(function(err) {
        throw(err)
      })

      var req = {
        params: {
          id: 1
        }
      }

      var res = {
        set: sinon.spy(),

        json: function() {
          query.findOrFail.calledOnce.should.be.true
          query.returnedDocument.delete.calledOnce.should.be.true
          next.called.should.be.false
          done()
        }
      }

      rest.destroy(query, req, res, next)
    })
  })
})
