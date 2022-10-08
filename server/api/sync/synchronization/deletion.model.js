'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'sync.Deletion',
  table: 'Sync_Deletion',
  primaryKey: 'idDeletion',
  attributes: {
    idDeletion: 'uuid',
    table: { type: 'string', size: 200 },
    key: { type: 'string', size: 200 },
    value: 'uuid',
    processed: { type: 'boolean', hidden: true },
    idServer: { type: 'uuid', computed: true }
  },
  mixins: [
    SyncableMixin
  ]
})
