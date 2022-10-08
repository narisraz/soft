'use strict'

const IndicatorValue = require('./indicator_value.model')
const IndicatorValueSecurity = require('./indicator_value.security')
const Indicator = require('./indicator.model')
const Rest = requireComponent('rest')

const _ = require('lodash')

class IndicatorValueController extends Rest {
  constructor() {
    super({
      model: IndicatorValue,
      modelSecurity: new IndicatorValueSecurity(),
      expand: [ 'creatingUser', 'lastModificationUser' ],
    })
  }

  *getWhere(req) {
    const res = {
      idIndicator: req.params.indicator,
      billingPeriod:  +req.params.billingPeriod
    }
    if (req.query.idServer)
      res.idServer = req.query.idServer
    return res
  }

  *getQuery(req) {
    const query = yield* super.getQuery(req)
    if (+req.query.startingPeriod) {
      query.where('billingPeriod', '>=', +req.query.startingPeriod)
    }
    if (+req.query.periodCount) {
      query.where('billingPeriod', '<', +req.query.startingPeriod + (+req.query.periodCount))
    }
    return query
  }

  update(req, res, next) {
    var that = this
    return this.wrap(function*(req, res, next) {
      if (!req.params.indicator || !req.params.billingPeriod) {
        next(new Error('Invalid parameters'))
        return
      }
      const indicator = yield Indicator.find(req.params.indicator)
      yield indicator.expand('users')

      if (
        indicator.users.length &&
        !_(indicator.users).map('uuid').includes(req.user.uuid) &&
        !req.user.cachedPermissions['ind.indicator.all_values']
      ) {
        throw { status: 403, message: 'Unauthorized' }
      }

      const document = yield indicator.setValue(
        req.user.uuid,
        req.body.idServer,
        +req.params.billingPeriod,
        req.body.value
      )
      return yield* that.expandResult(req, document)
    })(req, res, next)
  }
}

module.exports = Rest.routes(new IndicatorValueController())
