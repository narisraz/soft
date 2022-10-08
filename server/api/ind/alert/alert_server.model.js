'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

module.exports = new Model({
  name: 'ind.AlertServer',
  table: 'Ind_AlertServer',
  primaryKey: 'idAlertServer',
  attributes: {
    idAlertServer: 'uuid',
    idAlert: 'uuid',
    alert: { model: 'ind.Alert', relationship: 'BelongsTo', localKey: 'idAlert' }
  },

  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
