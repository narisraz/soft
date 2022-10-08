'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'ind.AlertEmail',
  table: 'Ind_AlertEmail',
  primaryKey: 'idAlertEmail',
  attributes: {
    idAlertEmail: 'uuid',
    idAlert: 'uuid',
    alert: { model: 'ind.Alert', relationship: 'BelongsTo', localKey: 'idAlert' },
    idUser: 'uuid',
    user:  { model: 'prm.User', relationship: 'BelongsTo', localKey: 'idUser', remoteKey: 'uuid' },
    email: { type: 'string', size: 100 }
  },
  mixins: [
    SyncableMixin
  ]
})
