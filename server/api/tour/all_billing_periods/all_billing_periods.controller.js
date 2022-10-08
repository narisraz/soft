'use strict'

const AllBillingPeriods = require('./all_billing_periods.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class ConfigController extends Rest {
  constructor() {
    super({ model: AllBillingPeriods })
  }

  show(req, res, next) {
    return this.wrap(function* (req, res, next) {
      const data = yield orm.db.exec(
        'Tour_GetBillingPeriodReferenceDate', [
          +req.params.id
        ])
      return data && data[0]
    })(req, res, next)
  }

  last(req, res, next) {
    return this.wrap(function* (req, res, next) {
      const document = yield (yield* this.getQuery(req))
        .order('billingPeriod DESC').first()
      return yield* this.expandResult(req, document)
    }.bind(this))(req, res, next)
  }
}

module.exports = Rest.routes(new ConfigController())
