const _ = require('lodash')

const ModelSecurity = require('./model-security')
const orm = requireComponent('orm')
const dbConfig = requireComponent('db-config')

/**
 * This abstract base model security requires a get model method, which contains a model
 * with an idDomain field.
 *
 * It allows all operations provided the currently logged user has acces to the idDomain of the
 * document.
 */
class IdDomainModelSecurity extends ModelSecurity {
  constructor(model) {
    super()
    this.model = model
  }

  filterQuery(req, query) {
    const conditions = [
      q => q.whereNull(orm.Col('idDomain', this.model.table))
    ]

    if (req.user.cachedDomains.length) {
      conditions.push(
        q => q.where(
          orm.Col('idDomain', this.model.table),
          'in',
          req.user.cachedDomains
        )
      )
    }

    query.whereEither(conditions)
  }

  *hasPermission(req, document, updatedDocument, permission) {
    // No concept of domains on non-central servers
    if (!dbConfig.syncConfig.server)
      return true
    if (document && !_.includes(req.user.cachedDomains, document.idDomain))
      return false
    if (updatedDocument && !_.includes(req.user.cachedDomains, updatedDocument.idDomain))
      return false
    return true
  }
}

module.exports = IdDomainModelSecurity
