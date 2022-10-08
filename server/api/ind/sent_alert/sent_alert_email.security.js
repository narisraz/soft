'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const SentAlertEmail = require('./sent_alert_email.model')

class SentAlertEmailSecurity extends ServerModelSecurity {
  constructor() {
    super(SentAlertEmail, 'alert.server')
  }
}

module.exports = SentAlertEmailSecurity
