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

var BelongsToMany = require('./belongs_to_many')
var argument = require('../argument')

var getMockDriver = require('./common.spec').getMockDriver
var model, model2

describe('components/orm/relationships/belongs_to_many', function () {
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
    var belongsToMany = new BelongsToMany(model, { model: 'test2' })

    belongsToMany.joinLocalKey.should.equal('test1_id')
    belongsToMany.joinRemoteKey.should.equal('test2_id')
    belongsToMany.joinTable.should.equal('test1_test2')
  })

  describe('expand', function() {
    it('should correctly select in test2', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 34}).set({})
      var belongsToMany = new BelongsToMany(model, { model: 'test2' })

      belongsToMany.getRelationship(document)
        .expand()
        .then(function() {
          db.builder.select.calledWithMatch(
            'test2', // table
            [] // columns,
          ).should.be.true

          var joins = db.builder.select.args[0][2]
          var wheres = db.builder.select.args[0][3]

          joins.length.should.equal(1)
          joins[0].table.should.equal('test1_test2')
          joins[0].on.should.be.an.Array
          joins[0].on.length.should.equal(1)
          joins[0].on[0].column1.table.should.equal('test2')
          joins[0].on[0].column1.val.should.equal('id')
          joins[0].on[0].column2.table.should.equal('test1_test2')
          joins[0].on[0].column2.val.should.equal('test2_id')

          wheres.length.should.equal(1)
          wheres[0].column.table.should.equal('test1_test2')
          wheres[0].column.val.should.equal('test1_id')

          wheres[0].value.should.match(argument.Val(34))

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
      var belongsToMany = new BelongsToMany(model, { model: 'test2' })
      var before = (new model2.Document()).import({id: 3}).set({ test: 'before' })
      var after = (new model2.Document()).import({id: 25}).set({ test: 'after' })
      db.document = after

      belongsToMany.getRelationship(document)
        .beforeSave()
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
      var belongsToMany = new BelongsToMany(model, { model: 'test2' })

      var before = [ (new model2.Document()).import({id: 3}).set({ test: 'before' }) ]
      var after = [ (new model2.Document()).import({id: 25}).set({ test: 'after' }) ]
      db.document = after[0]

      var relationship = belongsToMany.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .afterSave()
        .then(function() {

          db.builder.delete.calledWithMatch(
            'test1_test2',
            [{
              column: 'test1_id',
              operation: '=',
              value: 78
            },
            {
              column: 'test2_id',
              operation: 'in',
              value: [ 3 ]
            }]
          )

          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test: 'after'
            },
            [{
              column: 'id',
              operation: '=',
              value: 25
            }]
          ).should.be.true

          db.builder.insert.calledWithMatch(
            'test1_test2', // table
            {
              test1_id: 78,
              test2_id: 25
            }
          ).should.be.true

          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should work when elements were added', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 78}).set({})
      var belongsToMany = new BelongsToMany(model, { model: 'test2' })

      var document1 = (new model2.Document()).import({id: 25}).set({ test: 'doc1' })
      var document2 = (new model2.Document()).import({id: 12}).set({ test: 'doc2' })

      var before = [document2]
      var after = [document1, document2]

      db.document = document1

      var relationship = belongsToMany.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .afterSave()
        .then(function() {
          db.delete.called.should.be.false

          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test: 'doc1'
            },
            [{
              column: 'id',
              operation: '=',
              value: 25
            }]
          ).should.be.true

          db.builder.update.calledWithMatch(
            'test2', // table
            {
              test: 'doc2'
            },
            [{
              column: 'id',
              operation: '=',
              value: 12
            }]
          ).should.be.true

          db.builder.insert.calledWithMatch(
            'test1_test2', // table
            {
              test1_id: 78,
              test2_id: 25
            }
          ).should.be.true

          done()
        }).catch(function (err) {
          done(err)
        })
    })

    it('should work when elements are removed', function(done) {
      var db = Query.prototype.db = Model.prototype.db = getMockDriver()
      var document = (new model.Document()).import({id: 78}).set({})
      var belongsToMany = new BelongsToMany(model, { model: 'test2' })

      var document1 = (new model2.Document()).import({id: 25}).set({ test: 'doc1' })
      var document2 = (new model2.Document()).import({id: 12}).set({ test: 'doc2' })

      var before = [document1, document2]
      var after = [document2]

      var relationship = belongsToMany.getRelationship(document)
      relationship.initialValue = before
      relationship.value = after
      relationship
        .afterSave()
        .then(function() {
          db.builder.delete.calledWithMatch(
            'test1_test2',
            [{
              column: 'test1_id',
              operation: '=',
              value: 78
            },
            {
              column: 'test2_id',
              operation: 'in',
              value: [ 25 ]
            }]
          ).should.be.true

          done()
        }).catch(function (err) {
          done(err)
        })
    })
  })
})
