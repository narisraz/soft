'use strict'

const Group = require('./group.model')
const GroupSecurity = require('./group.security')
const Rest = requireComponent('rest')

class GroupController extends Rest {
  constructor() {
    super({
      model: Group,
      modelSecurity: new GroupSecurity(),
      expand: [ 'server', 'permissions' ],
      relationships: [ 'permissions' ]
    })
  }
}

module.exports = Rest.routes(new GroupController())
