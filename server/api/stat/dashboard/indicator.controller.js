'use strict'

const Indicator = require('./indicator.model')
const Rest = requireComponent('rest')

class IndicatorController extends Rest {
  constructor() {
    super({
      model: Indicator
    })
  }

  *getWhere(req) {
    return {
      idDashboard: req.params.dashboard
    }
  }
}

module.exports = Rest.routes(new IndicatorController())
