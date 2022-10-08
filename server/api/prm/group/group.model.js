'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

function groupPermissionsValidator(attribute, document, allAttributes) {
  return !(document && document.isAdmin && allAttributes.set_permissions)
}

module.exports = new Model({
  name: 'prm.Group',
  table: 'Prm_Group',
  primaryKey: 'idGroup',
  attributes: {
    idGroup: 'uuid',
    name: { type: 'string', size: 50 },
    isAdmin: { type: 'boolean' },
    isProtected: { type: 'boolean', protected: true },

    users: {
      model: 'prm.User',
      relationship: 'BelongsToMany',
      joinModel: 'prm.UserGroup',
      joinLocalKey: 'idGroup',
      joinRemoteKey: 'idUser',
    },
    permissions: {
      validator: groupPermissionsValidator,
      model: 'prm.Permission',
      relationship: 'BelongsToMany',
      joinModel: 'prm.GroupPermission',
      joinLocalKey: 'idGroup',
      joinRemoteKey: 'idPermission',
    },
  },
  validators: [
    (data, document) => !(!data && document && document.isAdmin)
  ],
  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
