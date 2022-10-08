'use strict'

var _ = require('lodash')
var P = require('bluebird')

var toArray = function toArray(view) {
  return _.map(this, function(document) {
    return document.toArray(view)
  })
}

var expand = function(relationships, queryFilter) {
  var that = this

  return P.all(_.map(this, function(document) {
    return document.expand(relationships, queryFilter)
  })).then(function() { return that })
}

module.exports.createCollection = function createCollection(data) {
  var res = data || []
  res.toArray = toArray
  res.expand = expand
  return res
}

