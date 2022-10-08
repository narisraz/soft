'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'ind.IndicatorUser',
  table: 'Ind_IndicatorUser',
  primaryKey: 'idIndicatorUser',
  attributes: {
    idIndicatorUser: 'uuid',
    idIndicator: 'uuid',
    indicator: { model: 'ind.Indicator', relationship: 'BelongsTo', localKey: 'idIndicator' },
    idUser: 'uuid',
    user: { model: 'prm.User', relationship: 'BelongsTo', localKey: 'idUser', remoteKey: 'uuid' }
  },
  mixins: [
    SyncableMixin
  ]
})
