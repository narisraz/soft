'use strict'

var util = require("util")

function makeThis(Class_) {
  /*jshint validthis:true */
  return this instanceof Class_ ? this : new Class_()
}

module.exports.Argument = function Argument(val) {
  var res = makeThis.call(this, module.exports.Argument)
  res.val = val
  return res
}

module.exports.Col = function Col(val, table) {
  var res = makeThis.call(this, module.exports.Col)
  res.val = val

  if (table && table.table) {
    res.table = table.table
  } else {
    res.table = table
  }

  return res
}

util.inherits(module.exports.Col, module.exports.Argument)

module.exports.Table = function Table(val, params) {
  var res = makeThis.call(this, module.exports.Table)
  res.val = val
  res.params = params

  return res
}

util.inherits(module.exports.Table, module.exports.Argument)

module.exports.Raw = function Raw(val) {
  var res = makeThis.call(this, module.exports.Raw)
  res.val = val
  return res
}

util.inherits(module.exports.Raw, module.exports.Argument)

module.exports.Val = function Val(val) {
  var res = makeThis.call(this, module.exports.Val)
  res.val = val
  return res
}

util.inherits(module.exports.Val, module.exports.Argument)
