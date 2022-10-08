'use strict'

var util = require('util')
var _ = require('lodash')
var P = require('bluebird')
var Relationship = require('./relationship')
var RelationshipModel = require('./relationship_model')
var Document = require('../document')

var HasMany = module.exports = function HasMany(model, descriptor, name) {
  RelationshipModel.apply(this, arguments)
  this.remoteKey = descriptor.remoteKey || this.model.name + '_id'
}
util.inherits(HasMany, RelationshipModel)

HasMany.prototype.Relationship = function() {
  Relationship.apply(this, arguments)
}


// FIXME: missing
//HasMany.prototype.join = function (query) {
//};

util.inherits(HasMany.prototype.Relationship, Relationship)

HasMany.prototype.query = function query(document) {
  return this.remoteModel().where(this.remoteKey, this.queryClause(document))
}

HasMany.prototype.Relationship.prototype.expand = function expand(queryFilter) {
  var that = this
  that.value = that.initialValue = undefined

  return this.filter(this.query(), queryFilter)
    .get()
    .then(function (data) {
      that.initialValue = _.clone(data || [])
      that.value = data || []
      return that
    })
}

HasMany.prototype.Relationship.prototype.save = function save() {
  var that = this
  var removed = _.differenceWith(that.initialValue, that.value, Relationship.compareDocuments)
  var added = _.differenceWith(that.value, that.initialValue, Relationship.compareDocuments)
  var unchanged = _.intersectionWith(that.initialValue, that.value, Relationship.compareDocuments)

  return P.all(removed.map(function (removed) {
      return removed instanceof Document ? removed._guardedDelete() : P.resolve(removed)
    }))
    .then(function () {
      return P.all(unchanged.map(function (unchanged) {
        return unchanged instanceof Document ? unchanged._guardedSave() : P.resolve(unchanged)
      }))
    })
    .then(function() {
      return P.all(added.map(function (added) {
        if (added instanceof Document) {
          added.setAttribute(that.model.remoteKey, that.document.getId())
          return added._guardedSave()
        } else {
          return P.resolve(added)
        }
      }))
    })
    .then(function () {
      return that
    })
}

HasMany.prototype.Relationship.prototype.afterSave = function () {
  if (this.model.autoSave)
    return this.save()
}

HasMany.prototype.Relationship.prototype.delete = function delete_() {
  var that = this

  return (this.model.remoteModel())
    .where(this.model.remoteKey, this.document.getId())
    .get()
    .then(function (documents) {
      return P.all(documents.map(function(document) {
        return document._guardedDelete()
      }))
    })
    .then(function () {
      return that
    })
}

HasMany.prototype.Relationship.prototype.beforeDelete = function () {
  if (this.model.autoDelete)
    return this.delete()
}
