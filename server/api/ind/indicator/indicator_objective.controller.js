'use strict'

const IndicatorObjective = require('./indicator_objective.model')
const IndicatorObjectiveSecurity = require('./indicator_objective.security')
const Rest = requireComponent('rest')

class IndicatorObjectiveController extends Rest {
  constructor() {
    super({
      model: IndicatorObjective,
      modelSecurity: new IndicatorObjectiveSecurity(),
    })
  }

  *getWhere(req) {
    return {
      idIndicator: req.params.indicator
    }
  }
}

module.exports = Rest.routes(new IndicatorObjectiveController())
