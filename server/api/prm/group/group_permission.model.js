'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'prm.GroupPermission',
  table: 'Prm_GroupPermission',
  primaryKey: 'idGroupPermission',
  attributes: {
    idGroupPermission: 'uuid',
    idGroup: 'uuid',
    idPermission: 'uuid',

    group: { model: 'prm.Group', relationship: 'BelongsTo', localKey: 'idGroup' },
    permission: { model: 'prm.Permission', relationship: 'BelongsTo', localKey: 'idPermission' },
  },

  mixins: [
    SyncableMixin
  ]
})
