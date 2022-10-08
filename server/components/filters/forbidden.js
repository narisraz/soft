'use strict'

function Forbidden(redirect) {
  this.status = 403
  this.name = 'Forbidden'
  this.message = 'Forbidden'
  this.redirect = redirect
  this.stack = (new Error()).stack
  return this
}

Forbidden.prototype = new Error()

module.exports = Forbidden
