'use strict'

var util = require('util')
var Document = require('../document')
var Relationship = require('./relationship')
var RelationshipModel = require('./relationship_model')
var P = require('bluebird')
var _ = require('lodash')

var BelongsTo = module.exports = function BelongsTo(model, descriptor, name) {
  RelationshipModel.apply(this, arguments)
  if (descriptor.localKey) {
    this.localKey = descriptor.localKey
  } else {
    this.localKey = !_.isUndefined(descriptor.type) ?
      name :
      this.remoteModelName + '_id'
  }

  if (descriptor.remoteKey) {
    this.remoteKey = descriptor.remoteKey
  }
}

util.inherits(BelongsTo, RelationshipModel)

BelongsTo.prototype.Relationship = function() {
  Relationship.apply(this, arguments)
}
util.inherits(BelongsTo.prototype.Relationship, Relationship)

BelongsTo.prototype.query = function query(document) {
  var remoteModel = this.remoteModel()
  var remoteKey = this.remoteKey || remoteModel.primary()
  return remoteModel.where(remoteKey, this.queryClause(document))
}

BelongsTo.prototype.Relationship.prototype.expand = function expand(queryFilter) {
  var that = this
  this.value = that.initialValue = undefined

  if (this.document.getAttribute(this.model.localKey) === null) {
    return P.resolve(null)
  } else {
    return this.filter(this.query(), queryFilter)
      .first()
      .then(function (data) {
        that.value = that.initialValue = data || null
        return that
      })
  }
}

BelongsTo.prototype.Relationship.prototype.save = function save() {
  var that = this

  var remoteModel = this.model.remoteModel()
  var remoteKey = this.model.remoteKey || remoteModel.primary()

  // If the value is not even defined, as compared to be set to
  // null, there is nothing to do, just trust the base attributes
  if (_.isUndefined(this.value)) {
    return P.resolve(that)
  }

  return ((this.value instanceof Document) ? this.value._guardedSave() : P.resolve())
    .then(function () {
      var key
      if (that.value instanceof Document) {
        key = that.value.get(remoteKey)
      } else {
        key = that.value
      }
      that.document.setAttribute(that.model.localKey, key)
      return that
    })
}

BelongsTo.prototype.Relationship.prototype.beforeSave = function () {
  if (this.model.autoSave)
    return this.save()
}
