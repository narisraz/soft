'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

module.exports = new Model({
  name: 'ind.Attachment',
  table: 'Ind_Attachment',
  primaryKey: 'idAttachment',
  attributes: {
    idAttachment: 'uuid',
    idIndicator: 'uuid',
    indicator: { model: 'ind.Indicator', relationship: 'BelongsTo', localKey: 'idIndicator' },
    billingPeriod: 'int',

    idFile: 'uuid',
    file: { model: 'file.File', relationship: 'BelongsTo', localKey: 'idFile' },

    message: 'string',

    createdDate: { type: 'date', defaulted: true, protected: true },
    creatingUser: { type: 'int', model: 'prm.User', relationship: 'BelongsTo', protected: true }
  },
  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
