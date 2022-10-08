'use strict'

var _ = require('lodash')
var argument = require('../argument')

var RelationshipModel = module.exports = function RelationshipModel(model, descriptor, name) {
  this.model = model
  this.name = name
  this.remoteModelName = descriptor.model

  this.localKey = descriptor.localKey || this.model.primary()

  this.autoSave = _.isUndefined(descriptor.autoSave) ? true : descriptor.autoSave
  this.autoDelete = _.isUndefined(descriptor.autoDelete) ? true : descriptor.autoDelete
}

RelationshipModel.prototype.remoteModel = function remoteModel() {
  return this.model.getModel(this.remoteModelName)
}

RelationshipModel.prototype.getRelationship = function(document) {
  return new this.Relationship(this, document)
}

RelationshipModel.prototype.find = function(id) {
  var remoteKey = this.remoteKey || this.remoteModel().primary()
  return this.remoteModel()
    .where(remoteKey, id)
    .first()
}

RelationshipModel.prototype.queryClause = function(document) {
  if (document) {
    return argument.Val(document.getAttribute(this.localKey))
  } else {
    return argument.Col(this.localKey, this.model.table)
  }
}
