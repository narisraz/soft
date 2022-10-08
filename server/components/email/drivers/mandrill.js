'use strict'

const mandrill = require('mandrill-api/mandrill')
let mandrillClient
let config

exports.initialize = (configArg) => {
  config = configArg
  mandrillClient = new mandrill.Mandrill(config.apiKey)
}

exports.send = (options) => {
  const message = {
    /*jshint camelcase: false */
    from_name: config.fromName,
    from_email: config.fromEmail,
    to: [{
      'email': options.to
    }],
    subject: options.subject,
    html: options.html,
  }
  mandrillClient.messages.send({ message: message, async: true })
}
