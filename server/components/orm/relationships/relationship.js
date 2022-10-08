'use strict'

var P = require('bluebird')
var _ = require('lodash')
var Document = require('../document')

const Relationship = module.exports = function(model, document) {
  this.model = model
  this.document = document
  this.value = undefined
  this.initialValue = undefined
}

Relationship.compareDocuments = function compareDocuments(a, b) {
  if (a instanceof Document) {
    a = a.getId()
  }
  if (b instanceof Document) {
    b = b.getId()
  }

  if (_.isUndefined(a) || a === null || _.isUndefined(b) || b === null)
    return false

  return (a == b)
}

Relationship.prototype.query = function () {
  return this.model.query(this.document)
}

Relationship.prototype.clearCache = function clearCache() {
  this.initialValue = undefined
  this.value = undefined
  return this
}

Relationship.prototype.get = function get() {
  return this.value
}

Relationship.prototype.set = function set(value) {
  this.value = value
  return this
}

Relationship.prototype.expand = function expand() {
  return P.resolve(this)
}

Relationship.prototype.filter = function filter(query, queryFilter) {
  if (_.isFunction(queryFilter)) {
    queryFilter(query, this.name)
  }
  return query
}

Relationship.prototype.beforeSave = function beforeSave(before, after) {
  return P.resolve(this)
}

Relationship.prototype.afterSave = function afterSave(before, after) {
  return P.resolve(this)
}

Relationship.prototype.beforeDelete = function beforeDelete(before, after) {
  return P.resolve(this)
}

Relationship.prototype.save = function save(before, after) {
  return P.resolve(this)
}

Relationship.prototype.delete = function delete_() {
  return P.resolve(this)
}
