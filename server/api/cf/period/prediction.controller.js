'use strict'

const Prediction = require('./prediction.model')
const rest = requireComponent('rest')

exports.index = function(req, res, next) {
  rest.index(
    Prediction.where('idPeriod', req.params.period)
    .expand(['delayedTo', 'delayedFrom']), req, res, next)
}

exports.create = function(req, res, next) {
  rest.create(Prediction, req, res, next)
}

exports.show = function(req, res, next) {
  rest.show(Prediction.where('idPeriod', req.params.period).expand(['delayedTo', 'delayedFrom']), req, res, next)
}

exports.update = function(req, res, next) {
  rest.update(Prediction.where('idPeriod', req.params.period).expand(['delayedTo', 'delayedFrom']), req, res, next)
}

exports.destroy = function(req, res, next) {
  rest.destroy(Prediction.where('idPeriod', req.params.period), req, res, next)
}
