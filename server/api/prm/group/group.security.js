'use strict'

const PermissionBypassModelSecurity = requireComponent('orm-security').PermissionBypassModelSecurity
const UnionModelSecurity = requireComponent('orm-security').UnionModelSecurity
const RelationshipModelSecurity = requireComponent('orm-security').RelationshipModelSecurity
const IdDomainModelSecurity = requireComponent('orm-security').IdDomainModelSecurity
const IdServerModelSecurity = requireComponent('orm-security').IdServerModelSecurity
const UserTypeModelSecurity = requireComponent('orm-security').UserTypeModelSecurity

const orm = requireComponent('orm')

const Group = require('./group.model')

class GroupSecurity extends UserTypeModelSecurity {
  constructor() {
    super(
      new PermissionBypassModelSecurity(
        'prm.domains.all',
        new UnionModelSecurity([
          // Either a group which is on a server attached to the user's domain
          new RelationshipModelSecurity(
            Group,
            'server',
            new IdDomainModelSecurity(orm.getModel('prm.Server'))
          ),
          // Or a group which is directly attached to the user's server
          new IdServerModelSecurity(Group)
        ])
      ),
      new IdServerModelSecurity(Group)
    )
  }
}

module.exports = GroupSecurity
