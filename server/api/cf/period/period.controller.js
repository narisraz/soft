'use strict'

const P = require('bluebird')
const Period = require('./period.model')
const rest = requireComponent('rest')
const orm = requireComponent('orm')
const _ = require('lodash')

exports.index = function index(req, res, next) {
  rest.index(Period, req, res, next)
}

exports.show = function show(req, res, next) {
  rest.show(Period, req, res, next)
}

exports.close = function close(req, res, next) {
  /*
   * Conditions for closing: needs to be the last period, the date must be
   * greater than the current period date, there must be no predictions
   * before closing date that are not resolved.
   */

  if (!req.params.id || !req.body.date || !_.isNumber(req.body.balance)) {
    next(new Error('Invalid parameters'))
    return
  }

  P.resolve()
    .then(function () {
      return orm.db.exec('Cf_ClosePeriod', [
        1,
        +req.params.id,
        new Date(req.body.date),
        +req.body.balance
      ])
    })
    .then(function(data) {
      res.json(data[0])
    })
    .catch(function(err) {
      if (err instanceof orm.NotFound) {
        next()
      } else {
        next(err)
      }
    })
}

exports.reopen = function reopen(req, res, next) {
  if (!req.params.id) {
    next(new Error('Invalid parameters'))
    return
  }

  P.resolve()
    .then(function () {
      return orm.db.exec('Cf_ReopenPeriod', [
        1,
        +req.params.id
      ])
    })
    .then(function(data) {
      res.json(data[0])
    })
    .catch(function(err) {
      if (err instanceof orm.NotFound) {
        next()
      } else {
        next(err)
      }
    })
}
