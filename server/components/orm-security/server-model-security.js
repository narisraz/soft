const _ = require('lodash')
const dbConfig = requireComponent('db-config')

const ModelSecurity = require('./model-security')
const RelationshipModelSecurity = require('./relationship-model-security')
const IdDomainModelSecurity = require('./id-domain-model-security')
const PermissionBypassModelSecurity = require('./permission-bypass-model-security')
const IdServerModelSecurity = require('./id-server-model-security')
const UserTypeModelSecurity = require('./user-type-model-security')

const orm = requireComponent('orm')

/**
 * This relationship expects to have a "server" relationship, which in turns has an idDomain.
 */
class ServerModelSecurity extends UserTypeModelSecurity {
  constructor(model, path) {
    path = path || 'server'

    super(
      new PermissionBypassModelSecurity(
        'prm.domains.all',
        new RelationshipModelSecurity(
          model,
          path,
          new IdDomainModelSecurity(orm.getModel('prm.Server'))
        )
      ),
      new RelationshipModelSecurity(
        model,
        path,
        new IdServerModelSecurity(orm.getModel('prm.Server'))
      )
    )
  }
}

module.exports = ServerModelSecurity
