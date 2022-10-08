'use strict'

const ServerModelSecurity = requireComponent('orm-security').ServerModelSecurity
const Permission = require('./permission.model')

class PermissionSecurity extends ServerModelSecurity {
  constructor() {
    super(Permission)
  }
}

module.exports = PermissionSecurity
