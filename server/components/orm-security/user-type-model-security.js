
const ModelSecurity = require('./model-security')
const dbConfig = requireComponent('db-config')


class UserTypeModelSecurity extends ModelSecurity {
  constructor(domainSecurityForCentralUsers, domainSecurityForSiteUsers) {
    super()
    this.domainSecurityForCentralUsers = domainSecurityForCentralUsers
    this.domainSecurityForSiteUsers = domainSecurityForSiteUsers
  }

  filterQuery(req, query) {
    if (req.user.idServer === dbConfig.idServer) {
      return this.domainSecurityForCentralUsers.filterQuery(req, query)
    } else {
      return this.domainSecurityForSiteUsers.filterQuery(req, query)
    }
  }

  *hasPermission(req, document, updatedDocument, permission) {
    if (req.user.idServer === dbConfig.idServer) {
      return yield* this.domainSecurityForCentralUsers.hasPermission(
        req, document, updatedDocument, permission
      )
    } else {
      return yield* this.domainSecurityForSiteUsers.hasPermission(
        req, document, updatedDocument, permission
      )
    }
  }
}

module.exports = UserTypeModelSecurity
