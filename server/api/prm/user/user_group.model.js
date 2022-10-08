'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'prm.UserGroup',
  table: 'Prm_UserGroup',
  primaryKey: 'idUserGroup',
  attributes: {
    idUserGroup: 'uuid',
    idUser: 'uuid',
    idGroup: 'uuid',

    user: { model: 'prm.User', relationship: 'BelongsTo', localKey: 'idUser', remoteKey: 'uuid' },
    group: { model: 'prm.Group', relationship: 'BelongsTo', localKey: 'idGroup' },
  },

  mixins: [
    SyncableMixin
  ]
})
