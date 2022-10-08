'use strict'

const DomainModelSecurity = requireComponent('orm-security').DomainModelSecurity
const DenyModelSecurity = requireComponent('orm-security').DenyModelSecurity
const UserTypeModelSecurity = requireComponent('orm-security').UserTypeModelSecurity

const Domain = require('./domain.model')

class DomainSecurity extends UserTypeModelSecurity {
  constructor() {
    super(
      new DomainModelSecurity(Domain),
      new DenyModelSecurity()
    )
  }
}

module.exports = DomainSecurity
