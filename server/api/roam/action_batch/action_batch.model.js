'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

module.exports = new Model({
  name: 'roam.ActionBatch',
  table: 'Roam_ActionBatch',
  primaryKey: 'idActionBatch',
  attributes: {
    idActionBatch: 'uuid',

    actions: {
      model: 'roam.Action',
      relationship: 'HasMany',
      remoteKey: 'idActionBatch'
    },

  },
  mixins: [
    SyncableMixin,
  ]
})

