'use strict'

var _ = require('lodash')
var argument = require('./argument')
var errors = require('./errors')
var Document = require('./document')
exports.Model = require('./model')
exports.Query = require('./query')
exports.createCollection = require('./collection').createCollection

exports.getModel = exports.Model.getModel
exports.Col = argument.Col
exports.Raw = argument.Raw
exports.Val = argument.Val
exports.Table = argument.Table
exports.NotFound = errors.NotFound

exports.drivers = {}
exports.drivers.mssql = require('./drivers/mssql')
exports.db = null

exports.initialize = function initialize(driver, driverConfig) {
  if (_.isString(driver)) {
    driver = exports.drivers[driver]
  }
  exports.db = driver
  exports.db.config(driverConfig || {})

  exports.Model.prototype.db = exports.db
  exports.Query.prototype.db = exports.db
  Document.prototype.db = exports.db
}
