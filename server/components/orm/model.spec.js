'use strict'

var should = require('should') // eslint-disable-line
var mockery = require('mockery')
var sinon = require('sinon')
var P = require('bluebird')

var Model
var Query

function getModel() {
  return new Model(
  {
    name: 'TestModel',
    table: 'table',
    attributes: {
      pk: 'id',
      c1: ['string', 100],
      c2: ['string', 50]
    }
  })
}

describe('components/orm/model', function () {
  before(function() {
    mockery.enable({ useCleanCache: true })

    Query = function() {
    }
    Query.prototype.f1 = sinon.stub().returnsThis()
    Query.prototype.f2 = sinon.stub().returnsThis()
    Query.prototype._private = sinon.stub().returnsThis()

    Query.prototype.where = function(exp, op, val) {
      this.found = !!val
      return this
    }
    Query.prototype.get = function() {
      var that = this
      return new P(function(resolve) {
        resolve(that.found ? [new that.model.Document({c1: 1})] : [])
      })
    }

    mockery.registerAllowable('bluebird')
    mockery.registerAllowable('lodash')
    mockery.registerAllowable('util')
    mockery.registerAllowable('./model')
    mockery.registerAllowable('./document')
    mockery.registerMock('./query', Query)
    mockery.warnOnUnregistered(false)
    Model = require('./model')
  })

  describe('The model constructor', function () {
    it('should determine the primary key', function () {
      var model = getModel()
      model.primary().should.equal('pk')
    })

    it('should normalize the shortcut attribute definitions', function () {
      var model = new Model(
        {
          name: 'TestModel',
          table: 'table',
          attributes: {
            pk: 'id',
            c1: 'string'
          }
        }
      )

      model.attributes.pk.type.should.equal('id')
      model.attributes.c1.type.should.equal('string')
    })

    it('should normalize the shortcut function-attribute definitions', function () {
      var model = new Model(
        {
          name: 'TestModel',
          table: 'table',
          attributes: {
            pk: 'id',
            c1: function() { return 1 }
          }
        }
      )

      model.attributes.c1.get.should.be.a.Function
    })
  })

  describe('The query methods', function () {
    it('should be mirrored', function() {
      var model = getModel()
      model.f1.should.be.a.Function
      model.f2.should.be.a.Function
      ;(typeof model._private).should.equal('undefined')
    })

    it('should instantiante a new query', function() {
      var model = getModel()
      var query = model.f1()

      query.should.be.an.instanceof(model.Query)
      query.f1.calledOnce.should.be.true
      query.model.should.be.exactly(model)
    })
  })

  describe('Validators', function () {
    it ('should work with a single validator syntax', function () {
      var model = new Model({
        name: 'TestModel',
        table: 'table',
        attributes: {
          pk: 'id',
          odd: {
            type: 'int',
            validator: a => !!(a % 2)
          }
        }
      })

      return P.all([
        model.validate({odd: 1}).then(res => res.should.be.true),
        model.validate({odd: 2}).then(res => res.should.be.false)
      ])
    })

    it ('should work with a multiple validator syntax', function () {
      var model = new Model({
        name: 'TestModel',
        table: 'table',
        attributes: {
          pk: 'id',
          fizzbuzz: {
            type: 'int',
            validators: [
              a => !(a % 3),
              a => !(a % 5)
            ]
          }
        }
      })

      return P.all([
        model.validate({fizzbuzz: 15}).then(res => res.should.be.true),
        model.validate({fizzbuzz: 3}).then(res => res.should.be.false),
        model.validate({fizzbuzz: 5}).then(res => res.should.be.false)
      ])
    })
  })

  after(function() {
    mockery.deregisterAll()
    mockery.disable()
  })
})
