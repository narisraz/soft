'use strict'

var _ = require('lodash')
var errors = require('./errors')
var argument = require('./argument')

var Where = module.exports = function Where(column, operation, value) {
  this._wheres = []

  if (arguments.length)
    this.where(column, operation, value)
}

function isUndefinedVal(value) {
  return (
    typeof value === 'undefined' ||
    (value instanceof argument.Val && typeof value.val === 'undefined')
  )
}

Where.prototype.where = function where(column, operation, value) {
  if (typeof column === 'undefined')
    throw new errors.InvalidQueryParameters()

  if (_.isFunction(column)) {
    column(this)
  } else {
    if (_.isArray(column)) {
      value = column[2]; operation = column[1]; column = column[0]
    }

    var isUnary = [ 'IS NULL', 'IS NOT NULL' ].indexOf(operation) >= 0
    if (isUndefinedVal(value) && !isUnary) {
      value = isUndefinedVal(operation) ? null : operation
      operation = _.isArray(value) ? 'in' : '='
    }

    this._wheres.push({
      column: column,
      operation: operation,
      value: value
    })
  }
  return this
}

Where.prototype.whereEither = function whereEither(conditions) {
  if (!_.isArray(conditions)) {
    conditions = Array.prototype.slice.call(arguments, 0)
  }

  this._wheres.push({
    operation: 'or',
    conditions: conditions.map(function (condition) { return new Where(condition) })
  })
  return this
}

/**
 * Subquery is subquery builder, which must have a getDbQuery method
 */
Where.prototype.whereSubquery = function whereSubquery(subquery) {
  this._wheres.push({
    operation: 'subquery',
    subquery: subquery
  })
  return this
}

Where.prototype.whereNull = function whereNull(column) {
  return this.where(column, 'IS NULL')
}

Where.prototype.whereNotNull = function whereNotNull(column) {
  return this.where(column, 'IS NOT NULL')
}

Where.prototype.conditions = function conditions() {
  return this._wheres
}
