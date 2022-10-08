'use strict'

var _ = require('lodash')
var P = require('bluebird')
var util = require('util')
var Query = require('./query')
var collection = require('./collection')
var errors = require('./errors')

var ModelQuery = module.exports = function ModelQuery() {
  Query.call(this, this.model.table)
  this._expands = []
}

util.inherits(ModelQuery, Query)

ModelQuery.prototype.expand = function expand(expands, queryFilter) {
  var expandsDescriptor

  if (_.isObject(expands) && expands.expand) {
    expandsDescriptor = expands
  } else {
    if (!_.isArray(expands)) {
      expands = [expands]
    }
    expandsDescriptor = {
      expands: expands,
      queryFilter: queryFilter
    }
  }

  this._expands.push(expandsDescriptor)
  return this
}

/*
 * We have to redefined whereEither to support the ModelQuery-specific whereX methods
 */
ModelQuery.prototype.whereEither = function whereEither(conditions) {
  var that = this
  if (!_.isArray(conditions)) {
    conditions = Array.prototype.slice.call(arguments, 0)
  }
  this._wheres.push({
    operation: 'or',
    conditions: conditions.map(function (condition) {
      var res = new that.model.Query()
      res.where(condition)
      return res
    })
  })
  return that
}

ModelQuery.prototype.whereRelationship = function whereRelationship(
  relationship, column, operation, value
) {
  if (!this.model.relationships[relationship])
    throw new errors.InvalidQueryParameters()
  this.whereSubquery(this.model.relationships[relationship].query().where(column, operation, value))
  return this
}

ModelQuery.prototype.find = function find(id) {
  return this.limit(1).where(
    this.model.primary(), '=', id
  ).get().then(function (collection) {
    if (collection.length) {
      return collection[0]
    } else {
      return null
    }
  })
}

ModelQuery.prototype.findOrFail = function findOrFail(id) {
  return this.limit(1).find(id).then(function (data) {
    if (data === null)
      throw new errors.NotFound()
    return data
  })
}

ModelQuery.prototype.scope = function scope_(scope) {
  this.model.scopes[scope](this)
  return this
}

ModelQuery.prototype.getAll = function getAll() {
  var that = this

  var res = Query.prototype.get.apply(this, arguments).then(function (rows) {
    var par = rows.map(function (row) {
      return (new that.model.Document()).import(row)
    })
    return P.all(par)
  }).then(function (rows) {
    return collection.createCollection(rows)
  })

  if (this._expands.length) {
    return res.then(function (coll) {
      return coll.expand(that._expands)
    })
  } else {
    return res
  }
}

ModelQuery.prototype.get = function get() {
  var that = this

  if (_.isObject(this.model.defaultWheres)) {
    _.forOwn(this.model.defaultWheres, function (val, field) {
      that.where(field, val)
    })
  }

  return this.getAll()
}

ModelQuery.prototype.getRaw = Query.prototype.get
ModelQuery.prototype._insert = Query.prototype.insert
ModelQuery.prototype._update= Query.prototype.update
ModelQuery.prototype._delete = Query.prototype.delete

ModelQuery.prototype.insert = function insert(data) {
  return this.model.create(data).save()
}

ModelQuery.prototype.update = function update(data) {
  var that = this
  return that.get().then(function (collection) {
    return P.all(collection.map(function (document) {
      return document.set(data).save()
    }))
  })
}

ModelQuery.prototype.delete  = function delete_(data) {
  var that = this
  return that.get().then(function (collection) {
    return P.all(collection.map(function (document) {
      return document.delete()
    }))
  })
}

ModelQuery.prototype.create = function create() {
  return this.model.create.apply(this.model, arguments)
}

ModelQuery.prototype.validate = function create() {
  return this.model.validate.apply(this.model, arguments)
}
