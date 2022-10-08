'use strict'

const Domain = require('./domain.model')
const DomainSecurity = require('./domain.security')
const Rest = requireComponent('rest')

class DomainController extends Rest {
  constructor() {
    super({
      model: Domain,
      modelSecurity: new DomainSecurity(),
      expand: [ "servers" ]
    })
  }
}

module.exports = Rest.routes(new DomainController())
