'use strict'

const SentAlertEmail = require('./sent_alert_email.model')
const SentAlertEmailSecurity = require('./sent_alert_email.security')
const Rest = requireComponent('rest')

class SentAlertEmailController extends Rest {
  constructor() {
    super({
      model: SentAlertEmail,
      modelSecurity: SentAlertEmailSecurity,
    })
  }

  *getWhere(req) {
    return {
      idAlert: req.params.sentAlert

    }
  }
}

module.exports = Rest.routes(new SentAlertEmailController())
