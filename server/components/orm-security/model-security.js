
const _ = require('lodash')

const Model = requireComponent('orm').Model
const orm = requireComponent('orm')

/**
 *
 */
class ModelSecurity {
  /**
   * Extends an ORM query so it only returns the elements which are readable by the user identity
   * defined in the request "req".
   *
   * @param {Object} req An express request, containing a user session
   * @param {ModelQuery} query An ORM query
   *
   */
  filterQuery(req, query) {
    return query
  }

  /**
   * Returns whether the user has a given permission on a list of documents.
   *
   * @param {Object} req An express request, containing a user session
   * @param {Document} document An optional document, containing a document already stored in
   *    the database. May be null (in the case of a "create" operation for example)
   * @param {Object} updatedDocument An object representing the updates which are intended to be
   *    applied on the document. May be null (in the case of a "read" or "destroy" operation for
   *    example)
   * @param {string} permission A string representing the permission. Standard permissions are
   *    'create', 'read', 'update', 'destroy', but can also represent domain logic permissions
   *
   * @return {boolean}
   */
  *hasPermission(req, document, updatedDocument, permission) {
    return true
  }
}

module.exports = ModelSecurity
