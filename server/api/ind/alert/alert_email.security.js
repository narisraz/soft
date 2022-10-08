'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const AlertEmail = require('./alert_email.model')

class AlertEmailSecurity extends ServerModelSecurity {
  constructor() {
    super(AlertEmail, 'alert.server')
  }
}

module.exports = AlertEmailSecurity
