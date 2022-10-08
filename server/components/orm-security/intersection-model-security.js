const ModelSecurity = require('./model-security')

/**
 * A model security which authorizes if all of the given model securities authorize it
 */
class IntersectionModelSecurity extends ModelSecurity {
  constructor(modelSecurities) {
    super()
    this.modelSecurities = modelSecurities
  }

  filterQuery(req, query) {
    this.modelSecurities.forEach(modelSecurity => modelSecurity.filterQuery(req, query))
  }

  *hasPermission(req, document, updatedDocument, permission) {
    for (let modelSecurity of this.modelSecurities) {
      if (!(yield* modelSecurity.hasPermission(req, document, updatedDocument, permission)))
        return false
    }
    return true
  }
}

module.exports = IntersectionModelSecurity
