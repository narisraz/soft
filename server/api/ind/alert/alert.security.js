'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const Alert = require('./alert.model')

class AlertSecurity extends ServerModelSecurity {
  constructor() {
    super(Alert)
  }
}

module.exports = AlertSecurity
