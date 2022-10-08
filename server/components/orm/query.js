'use strict'

var _ = require('lodash')
var errors = require('./errors')
var Where = require('./where')
var util = require('util')

var Query = module.exports = function Query(table) {
  if (!(this instanceof Query))
    return new Query(table)

  Where.call(this)

  this._table = table
  this._selects = []
  this._joins = []
  this._order = []
  this._limit = null
  this._offset = null
}

util.inherits(Query, Where)

Query.prototype.getTable = function getTable() {
  return this._table
}

Query.prototype.query = function query() {
  return this
}

Query.prototype.select = function select(selects) {
  if (!_.isArray(selects)) {
    selects = Array.prototype.slice.call(arguments, 0)
  }
  this._selects = _.union(this._selects, selects)
  return this
}

Query.prototype._join = function _join(type, table, column1, operation, column2) {
  var joinSpec
  if (_.isArray(column1)) {
    joinSpec = column1
  } else if (typeof column1 !== 'undefined') {
    if (typeof column2 === 'undefined') {
      column2 = operation
      operation = '='
    }
    joinSpec = [ { column1: column1, operation: operation, column2: column2 } ]
  } else {
    joinSpec = []
  }

  this._joins.push({
    type: type,
    table: table,
    on: joinSpec
  })

  return this
}

Query.prototype.join = Query.prototype.innerJoin = function innerJoin(table, column1, operation, column2) {
  return this._join('inner', table, column1, operation, column2)
}

Query.prototype.leftJoin = function leftJoin(table, column1, operation, column2) {
  return this._join('left', table, column1, operation, column2)
}

Query.prototype.rightJoin = function rightJoin(table, column1, operation, column2) {
  return this._join('right', table, column1, operation, column2)
}

Query.prototype.crossJoin = function crossJoin(table) {
  return this._join('cross', table)
}

Query.prototype.order = function order(columns) {
  if (!_.isArray(columns)) {
    columns = Array.prototype.slice.call(arguments, 0)
  }
  this._order = this._order.concat(columns)
  return this
}

Query.prototype.limit = function limit(count) {
  if (count !== Infinity) {
    this._limit = count || null
  }
  return this
}

Query.prototype.offset = function offset(count) {
  this._offset = count || null
  return this
}

Query.prototype.first = function first() {
  this.limit(1)
  return this.get().then(function (collection) {
    if (collection.length) {
      return collection[0]
    } else {
      return null
    }
  })
}

Query.prototype.firstOrFail = function firstOrFail() {
  return this.first().then(function (data) {
    if (data === null)
      throw new errors.NotFound()
    return data
  })
}

/**
 * @param Array|undefined params Optional existing query parameter list, in the case it is a subquery
 */
Query.prototype.getDbQuery = function getDbQuery(params) {
  return this.db.builder.select(
    this._table,
    this._selects,
    this._joins,
    this.conditions(),
    this._order,
    this._limit,
    this._offset,
    params
  )
}

Query.prototype.get = function () {
  return this.db.runQuery(this.getDbQuery())
}

Query.prototype.countDbQuery = function countDbQuery() {
  return this.db.builder.count(
    this._table,
    this._joins,
    this.conditions()
  )
}

Query.prototype.count = function () {
  return this.db.runQuery(this.countDbQuery()).then(function(rows) {
    return rows[0].c
  })
}

Query.prototype.insertDbQuery = function insertDbQuery(values) {
  return this.db.builder.insert(
    this._table,
    values
  )
}

Query.prototype.insert = function (values) {
  return this.db.runQuery(this.insertDbQuery(values))
}

Query.prototype.updateDbQuery = function updateDbQuery(values) {
  return this.db.builder.update(
    this._table,
    values,
    this.conditions()
  )
}

Query.prototype.update = function (values) {
  return this.db.runQuery(this.updateDbQuery(values))
}

Query.prototype.deleteDbQuery = function deleteDbQuery() {
  return this.db.builder.delete(
    this._table,
    this.conditions()
  )
}

Query.prototype.delete = function () {
  return this.db.runQuery(this.deleteDbQuery())
}
