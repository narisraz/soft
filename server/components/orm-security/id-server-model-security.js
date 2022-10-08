const _ = require('lodash')

const ModelSecurity = require('./model-security')
const orm = requireComponent('orm')

/**
 *
 */
class IdServerModelSecurity extends ModelSecurity {
  constructor(model) {
    super()
    this.model = model
  }

  filterQuery(req, query) {
    query.where(
      orm.Col('idServer', this.model.table),
      req.user.idServer
    )
  }

  *hasPermission(req, document, updatedDocument, permission) {
    if (document && document.idServer !== req.user.idServer)
      return false
    if (updatedDocument && updatedDocument.idServer !== req.user.idServer)
      return false
    return true
  }
}

module.exports = IdServerModelSecurity
