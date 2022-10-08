'use strict'

const helper = require('sendgrid').mail
const Sendgrid = require('sendgrid')
const logger = require('log4js').getLogger()

let sg
let config

exports.initialize = (configArg) => {
  config = configArg
  sg = Sendgrid(config.apiKey)
}

exports.send = (options) => {
  const mail = new helper.Mail(
    new helper.Email(config.fromEmail),
    options.subject,
    new helper.Email(options.to),
    new helper.Content('text/html', options.html)
  )

  if (options.cal) {
    const attachment = new helper.Attachment()
    attachment.setContent(new Buffer(options.cal).toString('base64'))
    attachment.setType("text/calendar")
    attachment.setFilename("lysasoft.ics")
    attachment.setDisposition("attachment")
    mail.addAttachment(attachment)
  }

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  })

  sg.API(request, (error, response) => {
    logger.info('Sent message through the SendGrid API',
      response && response.body && response.body.errors,
      response)
  })
}
