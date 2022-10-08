'use strict'

const Period = require('./period.model')
const rest = requireComponent('rest')
const orm = requireComponent('orm')

function getPeriodInterval(idPeriod) {
  let period
  let nextPeriod

  return Period.findOrFail(idPeriod).then(function (data) {
    period = data
    return period.next()
  }).then(function (data) {
    nextPeriod = data
    return {
      period: period,
      nextPeriod: nextPeriod
    }
  })
}

exports.index = function(req, res, next) {
  getPeriodInterval(req.params.period)
    .then(function (periodInterval) {
      const query = (new orm.Query(
          orm.Table('dbo.Cf_GetRecurringPredictions', [
            periodInterval.period && periodInterval.period.date,
            periodInterval.nextPeriod && periodInterval.nextPeriod.date,
          ])
        ))

      rest.index(query, req, res, next)
    })
    .catch(function(err) {
      next(err)
    })
}
