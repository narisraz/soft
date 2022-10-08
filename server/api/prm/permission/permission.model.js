'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

module.exports = new Model({
  name: 'prm.Permission',
  table: 'Prm_Permission',
  primaryKey: 'idPermission',
  attributes: {
    idPermission: 'uuid',
    permissionKey: { type: 'string', size: 50 },
    description: { type: 'string', size: 100 },
    webGroup: 'boolean'
  },

  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
