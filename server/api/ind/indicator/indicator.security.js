'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const Indicator = require('./indicator.model')

class IndicatorSecurity extends ServerModelSecurity {
  constructor() {
    super(Indicator)
  }
}

module.exports = IndicatorSecurity
