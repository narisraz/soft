'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'ind.SentAlertStatus',
  table: 'Ind_SentAlertStatus',
  primaryKey: 'idSentAlertStatus',
  attributes: {
    idSentAlertStatus: 'uuid',
    idSentAlert: 'uuid',
    sentAlert: { model: 'ind.SentAlert', relationship: 'BelongsTo', localKey: 'idSentAlert' },
    idUser: 'uuid',
    user:  { model: 'prm.User', relationship: 'BelongsTo', localKey: 'idUser', remoteKey: 'uuid' },

    viewed: 'boolean',
    closed: 'boolean'
  },
  mixins: [
    SyncableMixin
  ]
})
