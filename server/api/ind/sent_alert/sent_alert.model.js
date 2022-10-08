'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

module.exports = new Model({
  name: 'ind.SentAlert',
  table: 'Ind_SentAlert',
  primaryKey: 'idSentAlert',

  attributes: {
    idSentAlert: 'uuid',
    idAlert: 'uuid',
    alert: { model: 'ind.Alert', relationship: 'BelongsTo', localKey: 'idAlert' },
    billingPeriod: 'int',
    sentDate: 'date',
    expiresDate: 'date',
    description: 'string',

    emails: {
      model: 'ind.SentAlertEmail',
      relationship: 'HasMany',
      remoteKey: 'idSentAlert'
    },

    status: {
      model: 'ind.SentAlertStatus',
      relationship: 'HasMany',
      remoteKey: 'idSentAlert',
      autoDelete: true
    }
  },
  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
