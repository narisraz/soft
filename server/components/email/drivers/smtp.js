'use strict'

const nodemailer = require('nodemailer')
let config
let mailer

exports.initialize = (configArg) => {
  config = configArg
  mailer = nodemailer.createTransport(config)
}

exports.send = (options) => {
  const message = {
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html
  }

  mailer.send(message, true)
}
