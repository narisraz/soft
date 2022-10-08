const ModelSecurity = require('./model-security')
const orm = requireComponent('orm')

class DenyModelSecurity extends ModelSecurity {
  constructor() {
    super()
  }

  filterQuery(req, query) {
    query.where(
      orm.Val('1'),
      orm.Val('0')
    )
  }

  *hasPermission(req, document, updatedDocument, permission) {
    return false
  }
}

module.exports = DenyModelSecurity
