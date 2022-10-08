'use strict'

const AlertEmail = require('./alert_email.model')
const AlertEmailSecurity = require('./alert_email.security')
const Rest = requireComponent('rest')

class AlertEmailController extends Rest {
  constructor() {
    super({
      model: AlertEmail,
      modelSecurity: new AlertEmailSecurity(),
      expand: [ 'user' ]
    })
  }

  *getWhere(req) {
    return {
      idAlert: req.params.alert
    }
  }
}

module.exports = Rest.routes(new AlertEmailController())
