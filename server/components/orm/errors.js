'use strict'

exports.NotFound = function NotFound() {
  this.status = 404
  this.name = 'NotFound'
  this.message = 'Document not found'
  Error.captureStackTrace(this)
  return this
}

exports.NotFound.prototype = new Error()

exports.InvalidModel = function InvalidModel(name) {
  this.status = 404
  this.name = 'InvalidModel'
  this.message = 'Invalid model ' + name
  Error.captureStackTrace(this)
  return this
}

exports.InvalidModel.prototype = new Error()


exports.InvalidQueryParameters = function InvalidQueryParameters() {
  this.status = 500
  this.name = 'InvalidQueryParameters'
  this.message = 'Invalid query parameters'
  Error.captureStackTrace(this)
  return this
}

exports.InvalidQueryParameters.prototype = new Error()
