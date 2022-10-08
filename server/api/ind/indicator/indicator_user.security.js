'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const IndicatorUser = require('./indicator_user.model')

class IndicatorUserSecurity extends ServerModelSecurity {
  constructor() {
    super(IndicatorUser, 'indicator.server')
  }
}

module.exports = IndicatorUserSecurity
