'use strict'

const Permission = require('./permission.model')
const PermissionSecurity = require('./permission.security')

const Rest = requireComponent('rest')

class PermissionController extends Rest {
  constructor() {
    super({
      model: Permission,
      modelSecurity: new PermissionSecurity(),
    })
  }
}

module.exports = Rest.routes(new PermissionController())
