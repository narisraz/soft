'use strict'

const IndicatorType = require('./indicator_type.model')
const IndicatorValue = require('../../ind/indicator/indicator_value.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class IndicatorTypeController extends Rest {
  constructor() {
    super({
      model: IndicatorType
    })
  }

  value(req, res, next) {
    return this.wrap(function*(req, res, next) {
      if (!req.params.id || !req.params.billingPeriod)
        throw new Error('Invalid parameters')

      const value = yield orm.db.exec('Stat_GetIndicator', [
        +req.params.id,
        +req.params.billingPeriod
      ])
      if (!value.length)
        throw new Error('Indicator did not return any value')
      const extra = yield IndicatorValue.expandExtra(value[0].extra)
      return {
        value: value[0].value,
        graph: extra
      }
    })(req, res, next)
  }
}

module.exports = Rest.routes(new IndicatorTypeController())
