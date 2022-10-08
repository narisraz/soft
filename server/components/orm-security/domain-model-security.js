const _ = require('lodash')

const IdDomainModelSecurity = require('./id-domain-model-security')
const PermissionBypassModelSecurity = require('./permission-bypass-model-security')

const orm = requireComponent('orm')

/**
 * This relationship expects to have a "server" relationship, which in turns has an idDomain.
 */
class DomainModelSecurity extends PermissionBypassModelSecurity {
  constructor(model) {
    super(
      'prm.domains.all',
      new IdDomainModelSecurity(model)
    )
  }
}

module.exports = DomainModelSecurity
