'use strict'

const _ = require('lodash')

const orm = requireComponent('orm')

const PermissionBypassModelSecurity = requireComponent('orm-security').PermissionBypassModelSecurity
const RelationshipModelSecurity = requireComponent('orm-security').RelationshipModelSecurity
const IdDomainModelSecurity = requireComponent('orm-security').IdDomainModelSecurity
const UnionModelSecurity = requireComponent('orm-security').UnionModelSecurity
const UserTypeModelSecurity = requireComponent('orm-security').UserTypeModelSecurity
const IdServerModelSecurity = requireComponent('orm-security').IdServerModelSecurity

const User = require('./user.model')

class UserSecurity extends UserTypeModelSecurity   {
  constructor() {
    super(
      new PermissionBypassModelSecurity(
        'prm.domains.all',
        new UnionModelSecurity([
          // Either a user which is on a server attached to this domain
          new RelationshipModelSecurity(
            orm.getModel('prm.User'),
            'server',
            new IdDomainModelSecurity(orm.getModel('prm.Server'))
          ),
          // Or a user which is directly attached to this domain
          new RelationshipModelSecurity(
            orm.getModel('prm.User'),
            'domains',
            new IdDomainModelSecurity(orm.getModel('prm.Domain'))
          ),
        ])
      ),
      new IdServerModelSecurity(User)
    )
  }

  *hasPermission(req, document, updatedDocument, permission) {
    // LSS-69 A user can only edit another user if all of said users's domains are available to
    // the editor
    if (permission !== 'read' && document && !req.user.cachedPermissions['prm.domains.all']) {
      yield document.expand('domains')
      for (let domain of document.domains) {
        if (!_.includes(req.user.cachedDomains, domain.idDomain)) {
          return false
        }
      }
    }
    // LSS-70 A user needs the prm.group.protected permission to give a user a protected group,
    // or to edit a user that already has a protected group
    if (permission !== 'read' && document && !req.user.cachedPermissions['prm.group.protected']) {
      yield document.expand('groups')
      if (document.groups.filter(group => group.isProtected).length)
        return false
      if (updatedDocument && updatedDocument.set_groups) {
        const Group = orm.getModel('prm.Group')

        for (let groupId of updatedDocument.set_groups) {
          let group = yield* Group.find(groupId)
          if (group.isProtected)
            return false
        }
      }
    }

    return yield* super.hasPermission(req, document, updatedDocument, permission)
  }
}

module.exports = UserSecurity
