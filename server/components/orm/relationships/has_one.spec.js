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

var HasOne = require('./has_one')

var getMockDriver = require('./common.spec').getMockDriver
var model, model2

describe('components/orm/relationships/has_one', function () {
  before(function() {
    model = new Model({
      name: 'test1',
      attributes: {
        'id': 'id'
      }
    })
    model2 = new Model({
      name: 'test2',
      attributes: {
        'id': 'id',
        'test': 'string',
        'test1_id': 'int'
      }
    })
  })

  it('should set correct default values', function() {
    Query.prototype.db = Model.prototype.db = getMockDriver()
    var model = new Model({
      name: 'test1'
    })
    var hasOne = new HasOne(model, { model: 'test2' })
    hasOne.remoteKey.should.equal('test1_id')
  })

  describe('expand', function() {
    it('should select test2 where id = test2_id', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 34}).set({})
      var hasOne = new HasOne(model, { model: 'test2' })

      hasOne.getRelationship(document)
        .expand()
        .then(function() {
          db.builder.select.calledWithMatch(
            'test2', // table
            [], // columns,
            [], // joins,
            [{
              column: 'test1_id',
              operation: '=',
              value: argument.Val(34)
            }] // conditions,
          ).should.be.true

          done()
        }).catch(function (err) {
          done(err)
        })
    })
  })

  describe('beforeSave', function() {
    it('should return a promise and do nothing else', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 78}).set({})
      var hasOne = new HasOne(model, { model: 'test2' })
      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after = (new model2.Document()).import({id: 25}).set({ test: 'after' })
      db.document = after

      var relationship = hasOne.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .beforeSave(before, after)
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

  describe('afterSave', function() {
    it('should correctly update the relationship after saving', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 78}).set({})
      var hasOne = new HasOne(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after = (new model2.Document()).import({id: 25}).set({ test: 'after' })
      db.document = after

      var relationship = hasOne.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .afterSave(before, after)
        .then(function() {
          db.builder.delete.calledWithMatch(
            'test2',
            [{
              column: 'id',
              operation: '=',
              value: 3
            }]
          )

          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test1_id: 78,
              test: 'after'
            }, // values
            [{
              column: 'id',
              operation: '=',
              value: 25
            }] // conditions,
          ).should.be.true

          after.get('test1_id').should.equal(78)

          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should work when the relationship before was NULL', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 78}).set({})
      var hasOne = new HasOne(model, { model: 'test2' })

      var before = null
      var after = (new model2.Document()).import({id: 25}).set({ test: 'after' })
      db.document = after

      var relationship = hasOne.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .afterSave(before, after)
        .then(function() {
          db.builder.delete.called.should.be.false

          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test1_id: 78,
              test: 'after'
            }, // values
            [{
              column: 'id',
              operation: '=',
              value: 25
            }] // conditions,
          ).should.be.true

          after.get('test1_id').should.equal(78)

          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should work when the relationship is set to NULL', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 78}).set({})
      var hasOne = new HasOne(model, { model: 'test2' })

      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after = null

      var relationship = hasOne.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .afterSave(before, after)
        .then(function() {
          db.builder.delete.calledWithMatch(
            'test2',
            [{
              column: 'id',
              operation: '=',
              value: 3
            }]
          ).should.be.true

          done()
        }).catch(function (err) {
          done(err)
        })
    })
  })
})
