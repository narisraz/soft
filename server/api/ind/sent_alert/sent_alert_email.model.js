'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'ind.SentAlertEmail',
  table: 'Ind_SentAlertEmail',
  primaryKey: 'idSentAlertEmail',
  attributes: {
    idSentAlertEmail: 'uuid',
    idSentAlert: 'uuid',
    sentAlert: { model: 'ind.SentAlert', relationship: 'BelongsTo', localKey: 'idSentAlert' },
    idUser: 'uuid',
    description: 'string',
    user:  { model: 'prm.User', relationship: 'BelongsTo', localKey: 'idUser', remoteKey: 'uuid' },
    email: { type: 'string', size: 100 }
  },
  mixins: [
    SyncableMixin
  ]
})
