'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const IndicatorValue = require('./indicator_value.model')

class IndicatorValueSecurity extends ServerModelSecurity {
  constructor() {
    super(IndicatorValue)
  }
}

module.exports = IndicatorValueSecurity
