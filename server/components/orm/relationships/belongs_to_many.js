'use strict'

var util = require('util')
var _ = require('lodash')
var P = require('bluebird')

var argument = require('../argument')
var Relationship = require('./relationship')
var RelationshipModel = require('./relationship_model')
var Query = require('../query')
var Document = require('../document')

var BelongsToMany = module.exports = function BelongsToMany(model, descriptor, name) {
  RelationshipModel.apply(this, arguments)

  this.remoteKey = descriptor.remoteKey

  this.joinLocalKey = descriptor.joinLocalKey || this.model.name + '_id'
  this.joinRemoteKey = descriptor.joinRemoteKey || this.remoteModelName + '_id'

  this.joinTable = descriptor.joinTable || null
  this.joinModel = descriptor.joinModel || null

  if (!this.joinModel && !this.joinTable) {
    this.joinTable = (
      this.model.name < this.remoteModelName ?
      this.model.name + '_' + this.remoteModelName :
      this.remoteModelName + '_' + this.model.name
    )
  }
}

util.inherits(BelongsToMany, RelationshipModel)

BelongsToMany.prototype.Relationship = function() {
  Relationship.apply(this, arguments)
}
util.inherits(BelongsToMany.prototype.Relationship, Relationship)

BelongsToMany.prototype.getJoinQuery = function getJoinQuery() {
  if (this.joinModel) {
    return this.model.getModel(this.joinModel).query()
  } else {
    return new Query(this.joinTable)
  }
}

BelongsToMany.prototype.query = function (document) {
  var remoteKey = this.remoteKey || this.remoteModel().primary()
  var joinTable = this.getJoinQuery().getTable()

  return this.remoteModel()
    .join(
      joinTable,
      argument.Col(remoteKey, this.remoteModel().table),
      argument.Col(this.joinRemoteKey, joinTable)
    )
    .select(argument.Col('*', this.remoteModel().table))
    .where(argument.Col(this.joinLocalKey, joinTable), this.queryClause(document))
}

BelongsToMany.prototype.Relationship.prototype.expand = function expand(queryFilter) {
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

BelongsToMany.prototype.Relationship.prototype.save = function save() {
  var that = this
  var value = that.value
  var returnPromise = _.isUndefined(that.initialValue) ? this.expand() : P.resolve()
  var remoteKey = that.model.remoteKey || that.model.remoteModel().primary()
  var removed, added, unchanged

  return returnPromise
    .then(function () {
      that.value = value

      removed = _.differenceWith(that.initialValue, that.value, Relationship.compareDocuments)
      added = _.differenceWith(that.value, that.initialValue, Relationship.compareDocuments)
      unchanged = _.unionWith(that.value, that.initialValue, Relationship.compareDocuments)

      return removed.length ?
        that.model.getJoinQuery()
        .where(that.model.joinLocalKey, that.document.get(that.model.localKey))
        .where(that.model.joinRemoteKey, _.map(removed, function(removed) {
          return removed instanceof Document ? removed.get(remoteKey) : removed
        }))
        .delete() :
        P.resolve()
    })
    .then(function (data) {
      return P.all(added.map(function (added) {
        return (added instanceof Document ? added._guardedSave() : P.resolve(added)).then(function () {
          var data = {}
          data[that.model.joinLocalKey] = that.document.get(that.model.localKey)
          data[that.model.joinRemoteKey] = added instanceof Document ? added.get(remoteKey) : added
          return that.model.getJoinQuery().insert(data)
        })
      }).concat(unchanged.map(function (unchanged) {
        return (unchanged instanceof Document ? unchanged._guardedSave() : P.resolve(unchanged))
      })))
    })
    .then(function () {
      that.initialValue = that.value
      return that
    })
}

BelongsToMany.prototype.Relationship.prototype.afterSave = function () {
  if (this.model.autoSave)
    return this.save()
}

BelongsToMany.prototype.Relationship.prototype.delete = function delete_() {
  var that = this

  return this.model.getJoinQuery()
    .where(this.model.joinLocalKey, this.document.get(this.model.localKey))
    .delete()
    .then(function () {
      return that
    })
}

BelongsToMany.prototype.Relationship.prototype.beforeDelete = function () {
  if (this.model.autoDelete)
    return this.delete()
}
