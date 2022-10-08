'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const IndicatorObjective = require('./indicator_objective.model')

class IndicatorObjectiveSecurity extends ServerModelSecurity {
  constructor() {
    super(IndicatorObjective, 'indicator.server')
  }
}

module.exports = IndicatorObjectiveSecurity
