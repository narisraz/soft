'use strict'

var should = require('should')
var mockery = require('mockery')
var sinon = require('sinon')
var util = require('util')
var P = require('bluebird')

var argument = require('../argument')
var Model = require('../model')
var Query = require('../query')
var ModelQuery = require('../model_query')

var BelongsTo = require('./belongs_to')

var getMockDriver = require('./common.spec').getMockDriver
var model, model2

describe('components/orm/relationships/belongs_to', function () {
  before(function() {
    model = new Model({
      name: 'test1',
      attributes: {
        'id': 'id',
        'test2_id': 'int',
        'test2': {
          model: 'test2',
          relationship: 'BelongsTo'
        }
      }
    })
    model2 = new Model({
      name: 'test2',
      attributes: {
        'id': 'id',
        'test': 'string',
        'test1': {
          model: 'test1',
          relationship: 'HasOne'
        }
      }
    })
  })

  it('should set correct default values', function() {
    Query.prototype.db = Model.prototype.db = getMockDriver()
    var model = new Model({
      name: 'test1'
    })
    var belongsTo = new BelongsTo(model, { model: 'test2' }, 'blahBlahBlah')

    belongsTo.localKey.should.equal('test2_id')
  })

  it('should set correct default values in the case the model and physical key share a name', function() {
    Query.prototype.db = Model.prototype.db = getMockDriver()
    var model = new Model({
      name: 'test1'
    })
    var belongsTo = new BelongsTo(model, { model: 'test2', type: 'int' }, 'idNonStandardKey')

    belongsTo.localKey.should.equal('idNonStandardKey')
  })

  it('should use the given value if one is given, regardless of defaults', function() {
    Query.prototype.db = Model.prototype.db = getMockDriver()
    var model = new Model({
      name: 'test1'
    })
    var belongsTo = new BelongsTo(model, {
      model: 'test2',
      type: 'int',
      localKey: 'yesThisIsTheLocalKey'
    }, 'idNonStandardKey')

    belongsTo.localKey.should.equal('yesThisIsTheLocalKey')
  })

  it('should work with cyclic relationships', function(done) {
    var db = Query.prototype.db = Model.prototype.db = getMockDriver()

    var document1 = (new model.Document()).import({id: 1}).set({})
    var document2 = (new model2.Document()).import({id: 3}).set({})

    document1.relationship('test2').set(document2)
    document2.relationship('test1').set(document1)

    document1.save().then(function() {
      db.builder.update.calledTwice.should.be.true
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  describe('expand', function() {
    it('should select test2 where id = test2_id', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({})
      document.test2_id = 2
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      belongsTo.getRelationship(document)
        .expand()
        .then(function() {
          db.builder.select.calledWithMatch(
            'test2', // table,
            [], // columns,
            [], // joins,
            [{
              column: 'id',
              operation: '=',
              value: argument.Val(2)
            }] // conditions,
          ).should.be.true

          done()
        }).catch(function (err) {
          done(err)
        })
    })
  })

  describe('afterSave', function() {
    it('should return a promise and do nothing else', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({ id: 1 })
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after = (new model2.Document()).import({id: 2}).set({ test: 'after' })
      db.document = after

      belongsTo.getRelationship(document)
        .afterSave()
        .then(function() {
          db.delete.called.should.be.false
          db.update.called.should.be.false
          db.insert.called.should.be.false
          done()
        })
        .catch(function (err) {
          done(err)
        })
    })
  })

  describe('beforeSave', function() {
    it('should correctly update the relationship before saving', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({ id: 1 })
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set( {test: 'before' })
      var after = (new model2.Document()).import({id: 2}).set( {test: 'after' })
      db.document = after

      var relationship = belongsTo.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after

      relationship
        .beforeSave()
        .then(function() {
          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test: 'after'
            }, // values
            [{
              column: 'id',
              operation: '=',
              value: 2
            }] // conditions,
          ).should.be.true
          document.get('test2_id').should.equal(2)

          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should correctly update the relationship when it is set to only an ID', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({ id: 1 })
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set( {test: 'before' })
      var after = 2
      db.document = after

      var relationship = belongsTo.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after

      relationship
        .beforeSave()
        .then(function() {
          document.get('test2_id').should.equal(2)
          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should work when the relationship before was NULL', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({ id: 1 })
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      var before = null
      var after = (new model2.Document()).import({id: 2}).set({ test: 'after' })
      db.document = after

      var relationship = belongsTo.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .beforeSave()
        .then(function() {
          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test: 'after'
            }, // values
            [{
              column: 'id',
              operation: '=',
              value: 2
            }] // conditions,
          ).should.be.true

          document.get('test2_id').should.equal(2)

          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should work when the relationship is set to NULL', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({ id: 1 })
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after = null

      var relationship = belongsTo.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .beforeSave()
        .then(function() {
          (document.get('test2_id') === null).should.be.true
          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should not do anything when the relationship is set to undefined', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = new model.Document({ id: 1 })
      var belongsTo = new BelongsTo(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after // undefined

      var relationship = belongsTo.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .beforeSave()
        .then(function() {
          (document.get('test2_id') === null).should.be.false
          done()
        }).catch(function (err) {
          done(err)
        })
    })
  })

})
