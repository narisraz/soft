const _ = require('lodash')

const ModelSecurity = require('./model-security')
const orm = requireComponent('orm')

/**
 * This abstract base model security requires another modelSecurity, and a permission
 *
 * It delegates security operations to the given modelSecurity, unless the user has the given
 * permission
 */
class PermissionBypassModelSecurity extends ModelSecurity {
  constructor(permission, modelSecurity) {
    super()
    this.permission = permission
    this.modelSecurity = modelSecurity
  }

  filterQuery(req, query) {
    if (req.user.cachedPermissions[this.permission])
      return
    this.modelSecurity.filterQuery(req, query)
  }

  *hasPermission(req, document, updatedDocument, permission) {
    if (req.user.cachedPermissions[this.permission])
      return true
    return yield* this.modelSecurity.hasPermission(req, document, updatedDocument, permission)
  }
}

module.exports = PermissionBypassModelSecurity
