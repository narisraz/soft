const ModelSecurity = require('./model-security')

/**
 * A model security which authorizes if any of the given model securities authorizes it
 */
class UnionModelSecurity extends ModelSecurity {
  constructor(modelSecurities) {
    super()
    this.modelSecurities = modelSecurities
  }

  filterQuery(req, query) {
    query.whereEither(
      this.modelSecurities.map(modelSecurity => q => modelSecurity.filterQuery(req, q))
    )
  }

  *hasPermission(req, document, updatedDocument, permission) {
    for (let modelSecurity of this.modelSecurities) {
      if (yield* modelSecurity.hasPermission(req, document, updatedDocument, permission))
        return true
    }

    return false
  }
}

module.exports = UnionModelSecurity
