'use strict'

const Attachment = require('./attachment.model')
const AttachmentSecurity = require('./attachment.security')
const Rest = requireComponent('rest')

class AttachmentController extends Rest {
  constructor() {
    super({
      model: Attachment,
      modelSecurity: new AttachmentSecurity(),
      expand: [ 'creatingUser', 'lastModificationUser', 'file' ],
    })
  }

  *getWhere(req) {
    const res = {
      idIndicator: req.params.indicator,
      billingPeriod:  +req.params.billingPeriod
    }
    if (req.query.idServer)
      res.idServer = req.query.idServer
    return res
  }
}

module.exports = Rest.routes(new AttachmentController())
