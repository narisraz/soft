'use strict'

var should = require('should')
var mockery = require('mockery')
var sinon = require('sinon')
var util = require('util')
var P = require('bluebird')
var Model = require('./model')

var Document

function getModel(attributes) {
  var model = {}
  model = {}
  model.attributes = attributes || {}
  model.hooks = {}

  model.primary = function () { return 'id' }
  model.Document = function () {
    Document.apply(this, arguments)
  }
  util.inherits(model.Document, Document)
  model.Document.prototype.model = model
  Document.createAccessors(model.Document)

  model.Query = function () {

  }
  model.Query.prototype = {
    _insert: sinon.stub().returns(P.resolve([new model.Document()])),
    _update: sinon.stub().returns(P.resolve([new model.Document()])),
    _delete: sinon.stub().returns(P.resolve([new model.Document()])),
    where: sinon.stub().returnsThis()
  }

  return model
}

describe('components/orm/document', function () {
  before(function () {
    mockery.enable({ useCleanCache: true })

    var Model = function () {
    }

    mockery.registerAllowable('lodash')
    mockery.registerAllowable('bluebird')
    mockery.registerAllowable('./document')
    mockery.registerMock('./model', Model)
    mockery.warnOnUnregistered(false)
    Document = require('./document')
  })

  describe('Initialization', function () {
    it('should create accessors', function () {

      var TestModel = getModel({
        'attr1': { type: 'val1' },
        'attr2': { type: 'val2' }
      })
      Object.getOwnPropertyDescriptor(TestModel.Document.prototype, 'attr1').get.should.be.a.Function
      Object.getOwnPropertyDescriptor(TestModel.Document.prototype, 'attr2').get.should.be.a.Function
      Object.getOwnPropertyDescriptor(TestModel.Document.prototype, 'attr1').set.should.be.a.Function
      Object.getOwnPropertyDescriptor(TestModel.Document.prototype, 'attr2').set.should.be.a.Function
    })

    it('should create accessors that work', function () {
      var TestModel = getModel({
        'attr1': { type: 'val1' },
        'attr2': { type: 'val2' }
      })
      var document = new TestModel.Document()

      document.attr1 = 1
      document.attr2 = 2

      document._attributes.attr1.should.equal(1)
      document._attributes.attr2.should.equal(2)

      document._attributes.attr1 = 10
      document.attr1.should.equal(10)
    })
  })

  describe('get', function () {
    it('should work with value attributes', function () {
      var TestModel = getModel({
        'attr1': { type: 'string' }
      })
      var document = new TestModel.Document()
      document._attributes.attr1 = 10
      document.get('attr1').should.equal(10)
    })

    it('should work with function attributes', function () {
      var TestModel = getModel(
        {
          attr1: {
            get: function () {
              return 10
            }
          }
        }
      )
      var document = new TestModel.Document()
      document.get('attr1').should.equal(10)
    })
  })

  describe('set', function () {
    it('should work with value attributes', function () {
      var TestModel = getModel({
        'attr1': { type: 'string' }
      })
      var document = new TestModel.Document()
      document.set('attr1', 10)
      document._attributes.attr1.should.equal('10')
    })

    it('should work with computed attributes', function () {
      var testVal

      var TestModel = getModel(
        {
          attr1: {
            set: function (val) {
              testVal = val
            }
          }
        }
      )
      var document = new TestModel.Document()
      document.set('attr1', 10)
      testVal.should.equal(10)
    })

    it('should work with multiple assignment', function () {
      var TestModel = getModel({
        'attr1': { type: 'id' },
        'attr2': { type: 'string' },
        'attr3': { type: 'string' },
        'attr4': {
          type: 'string',
          protected: true
        }
      })

      var document = new TestModel.Document()
      document.set({
        attr1: 10,
        attr2: 10,
        attr3: 10,
        attr4: 10,
      })

      (typeof document._attributes.attr1).should.equal('undefined')
      document._attributes.attr2.should.equal('10')
      document._attributes.attr3.should.equal('10')
      (typeof document._attributes.attr4).should.equal('undefined')
    })

    it('should properly convert types', function () {
      var TestModel = getModel({
        'attrString': { type: 'string' },
        'attrString3': {
          type: 'string',
          size: 3
        },
        'attrFloat': { type: 'float' },
        'attrInt': { type: 'int' },
        'attrBoolean': { type: 'boolean' }
      })
      var document = new TestModel.Document()
      document.set('attrString', 10.5)
      document.set('attrString3', 10.5)
      document.set('attrFloat', 10.5)
      document.set('attrInt', 10.5)
      document.set('attrBoolean', 10.5)

      document._attributes.attrString.should.equal('10.5')
      document._attributes.attrString3.should.equal('10.')
      document._attributes.attrFloat.should.equal(10.5)
      document._attributes.attrInt.should.equal(10)
      document._attributes.attrBoolean.should.equal(true)
    })

    it('should remove cached relationships when a localKey is set directly', function () {
      var TestModel = new Model({
        name: 'TestModel',
        attributes: {
          'idRelationship': { type: 'int' },
          'relationship': { model: 'TestModel2', relationship: 'BelongsTo', localKey: 'idRelationship' },
          'idRelationship2': { type: 'int' },
          'relationship2': { model: 'TestModel2', relationship: 'BelongsTo', localKey: 'idRelationship2' }
        }
      })
      var TestModel2 = new Model({ name: 'TestModel2' })

      var document = new TestModel.Document()
      document.relationship('relationship').set({ 'test': 'test' })
      document.relationship('relationship2').set({ 'test': 'test' })

      document.get('relationship').test.should.equal('test')
      (typeof document.get('relationship')).should.equal('object')
      (typeof document.get('relationship2')).should.equal('object')
      document.set('idRelationship', null)
      (typeof document.get('relationship')).should.equal('undefined')
      (typeof document.get('relationship2')).should.equal('object')
    })
  })

  describe('import', function () {
    it('should only import described attributes', function () {
      var TestModel = getModel({
        'attr1': { type: 'id' },
        'attr2': { type: 'string' }
      })
      var document = new TestModel.Document()
      document.import({
        'attr1': '10',
        'attr2': 10,
        'attr3': '10',
      })

      document._attributes.attr1.should.equal(10)
      document._attributes.attr2.should.equal('10')
      (typeof document._attributes.attr3).should.equal('undefined')
    })
  })

  describe('save', function () {
    it('should call insert when it was not initalized', function (done) {
      var TestModel = getModel({
        'id': { type: 'id' },
        'attr2': { type: 'string' }
      })

      var document = new TestModel.Document()
      document.save().then(function () {
        TestModel.Query.prototype._insert.calledOnce.should.be.true
        TestModel.Query.prototype._update.calledOnce.should.be.false
        TestModel.Query.prototype._delete.calledOnce.should.be.false
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('should call update if it was initalized', function (done) {
      var TestModel = getModel({
        'id': { type: 'id' },
        'attr2': { type: 'string' }
      })

      var document = new TestModel.Document()
      document.import({id: 1})
      document.set('attr2', 'test')

      document.save().then(function () {
        TestModel.Query.prototype._insert.calledOnce.should.be.false
        TestModel.Query.prototype._update.calledOnce.should.be.true
        TestModel.Query.prototype._delete.calledOnce.should.be.false
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('should remove id, computed, and defaulted columns on insert', function (done) {
      var TestModel = getModel({
        'id': { type: 'id' },
        'attr2': { type: 'string' },
        'attr3': { type: 'string', computed: true },
        'attr4': { type: 'string', defaulted: true },
      })

      var document = new TestModel.Document()
      document.set({
        attr2: 'test',
        attr3: 'test',
        attr4: 'test',
      })
      document.save().then(function () {
        TestModel.Query.prototype._insert.calledWith(sinon.match.has('id')).should.be.false
        TestModel.Query.prototype._insert.calledWith(sinon.match.has('attr2')).should.be.true
        TestModel.Query.prototype._insert.calledWith(sinon.match.has('attr3')).should.be.false
        TestModel.Query.prototype._insert.calledWith(sinon.match.has('attr4')).should.be.false
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('should remove id and computed columns on update', function (done) {
      var TestModel = getModel({
        'id': { type: 'id' },
        'attr2': { type: 'string' },
        'attr3': { type: 'string', computed: true },
        'attr4': { type: 'string', defaulted: true },
      })

      var document = new TestModel.Document()
      document.import({
        id: 2
      })
      document.set({
        attr2: 'test',
        attr3: 'test',
        attr4: 'test'
      })
      document.save().then(function () {
        TestModel.Query.prototype._update.calledWith(sinon.match.has('id')).should.be.false
        TestModel.Query.prototype._update.calledWith(sinon.match.has('attr2')).should.be.true
        TestModel.Query.prototype._update.calledWith(sinon.match.has('attr3')).should.be.false
        TestModel.Query.prototype._update.calledWith(sinon.match.has('attr4')).should.be.true
        done()
      }).catch(function (err) {
        done(err)
      })
    })
  })

  describe('delete', function () {
    it('should do nothing when it was not initalized', function (done) {
      var TestModel = getModel({
        'id': { type: 'id' },
        'attr2': { type: 'string' }
      })

      var document = new TestModel.Document()
      document.delete().then(function () {
        TestModel.Query.prototype._insert.calledOnce.should.be.false
        TestModel.Query.prototype._update.calledOnce.should.be.false
        TestModel.Query.prototype._delete.calledOnce.should.be.false
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('should call delete was initalized', function (done) {
      var TestModel = getModel({
        'id': { type: 'id' },
        'attr2': { type: 'string' }
      })

      var document = new TestModel.Document()
      document.import({id: 1, attr2: 'test'})
      document.delete().then(function () {
        TestModel.Query.prototype._insert.calledOnce.should.be.false
        TestModel.Query.prototype._update.calledOnce.should.be.false
        TestModel.Query.prototype._delete.calledOnce.should.be.true
        done()
      }).catch(function (err) {
        done(err)
      })
    })
  })

  after(function () {
    mockery.deregisterAll()
    mockery.disable()
  })
})
