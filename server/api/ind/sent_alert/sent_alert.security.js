'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const SentAlert = require('./sent_alert.model')

class SentAlertSecurity extends ServerModelSecurity {
  constructor() {
    super(SentAlert)
  }
}

module.exports = SentAlertSecurity
