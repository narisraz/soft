const _ = require('lodash')

const ModelSecurity = require('./model-security')
const orm = requireComponent('orm')

/**
 * This abstract base model security requires another modelSecurity, and a relationship path
 * given in get relationship.
 *
 * It delegates security operations to the given modelSecurity, applied on the given relationship
 */
class RelationshipModelSecurity extends ModelSecurity {

  /**
   * @param {string} relationships a relationship, or dot-separated path of relationships
   * @param {ModelSecurity} modelSecurity the modelSecurity to which to delegate
   */
  constructor(model, relationships, modelSecurity, permission) {
    super()
    this.model = model
    this.relationships = relationships
    this.modelSecurity = modelSecurity
    this.permission = this.permission || 'read'
  }

  filterQuery(req, query) {
    const queryQualifierFunction = _.reduceRight(
      this.relationships.split(/\./).filter(Boolean),
      (reducedQuery, relationship) => {
        return q => q.whereRelationship(relationship, reducedQuery)
      },
      q => this.modelSecurity.filterQuery(req, q)
    )

    queryQualifierFunction(query)
  }

  *hasPermission(req, document, updatedDocument, permission) {
    const path = this.relationships.split(/\./).filter(Boolean)
    if (document) {
      let currentDocument = document
      for (let relationship of path) {
        yield currentDocument.expand(relationship)
        if (currentDocument instanceof Array) {
          currentDocument = orm.createCollection(
            _.flatMap(currentDocument, document => document.get(relationship))
          )
        } else {
          currentDocument = currentDocument.get(relationship)
        }
      }
      if (currentDocument instanceof Array) {
        let foundMatching = false

        for (document of currentDocument) {
          if (yield* this.modelSecurity.hasPermission(
            req, document, null, this.permission
          )) {
            foundMatching = true
            break
          }
        }
        if (!foundMatching)
          return false
      } else {
        if (!(yield* this.modelSecurity.hasPermission(req, currentDocument, null, this.permission)))
          return false
      }
    }

    if (updatedDocument) {
      const shiftedPath = path.map(a => a)
      const firstRel = shiftedPath.shift()
      const relationshipModel = this.model.relationships[firstRel]

      let updatedRelIds = updatedDocument[`set_${firstRel}`]
      if (!updatedRelIds)
        updatedRelIds = []
      if (!_.isArray(updatedRelIds)) {
        updatedRelIds = _(updatedRelIds).pickBy().keys().value()
      }
      if (relationshipModel.localKey && updatedDocument[relationshipModel.localKey]) {
        updatedRelIds.push(updatedDocument[relationshipModel.localKey])
      }

      if (!updatedRelIds.length)
        return false

      for (let updatedRel of updatedRelIds) {
        let currentDocument = yield relationshipModel.find(updatedRel)
        for (let relationship of shiftedPath) {
          yield currentDocument.expand(relationship)
          currentDocument = currentDocument.get(relationship)
        }

        if (!(yield* this.modelSecurity.hasPermission(req, currentDocument, null, this.permission)))
          return false
      }
    }

    return true
  }
}

module.exports = RelationshipModelSecurity
