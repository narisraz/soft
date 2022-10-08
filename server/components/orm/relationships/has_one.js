'use strict'

var util = require('util')
var P = require('bluebird')
var Relationship = require('./relationship')
var RelationshipModel = require('./relationship_model')
var Document = require('../document')

var HasOne = module.exports = function HasOne(model, descriptor, name) {
  RelationshipModel.apply(this, arguments)
  this.remoteKey = descriptor.remoteKey || this.model.name + '_id'
}
util.inherits(HasOne, RelationshipModel)

HasOne.prototype.Relationship = function() {
  Relationship.apply(this, arguments)
}

// FIXME: missing
//HasOne.prototype.join = function (query) {
//};
util.inherits(HasOne.prototype.Relationship, Relationship)

HasOne.prototype.query = function query(document) {
  return this.remoteModel().where(this.remoteKey, this.queryClause(document)).limit(1)
}

HasOne.prototype.Relationship.prototype.expand = function expand(queryFilter) {
  var that = this
  that.value = that.initalValue = undefined
  return this.filter(this.query(), queryFilter)
    .first()
    .then(function (data) {
      that.value = that.initialValue = data || null
      return that
    })
}

HasOne.prototype.Relationship.prototype.save = function save() {
  var that = this

  if (!Relationship.compareDocuments(that.initialValue, that.value)) {
    return (that.initialValue instanceof Document ? that.initialValue._guardedDelete() : P.resolve())
      .then(function () {
        if (that.value instanceof Document) {
          that.value.setAttribute(that.model.remoteKey, that.document.getId())
          return that.value._guardedSave()
            .then(function () {
              return that
            })
        } else {
          return P.resolve(that)
        }
      })
      .then(function () {
        return that
      })
  } else {
    if (that.value instanceof Document) {
      return that.value._guardedSave()
        .then(function () {
          return that
        })
    } else {
      return P.resolve(that)
    }
  }
}

HasOne.prototype.Relationship.prototype.afterSave = function () {
  if (this.model.autoSave)
    return this.save()
}

HasOne.prototype.Relationship.prototype.delete = function delete_() {
  var that = this
  return (this.remoteModel())
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

HasOne.prototype.Relationship.prototype.beforeDelete = function () {
  if (this.model.autoDelete)
    return this.delete()
}
