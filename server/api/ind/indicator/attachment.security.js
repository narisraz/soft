'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const Attachment = require('./attachment.model')

class AttachmentSecurity extends ServerModelSecurity {
  constructor() {
    super(Attachment)
  }
}

module.exports = AttachmentSecurity
