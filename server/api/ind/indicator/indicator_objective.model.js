'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'ind.IndicatorObjective',
  table: 'Ind_IndicatorObjective',
  primaryKey: 'idIndicatorObjective',
  attributes: {
    idIndicatorObjective: 'uuid',
    idIndicator: 'uuid',
    indicator: { model: 'ind.Indicator', relationship: 'BelongsTo', localKey: 'idIndicator' },
    billingPeriod: 'int',
    value: 'float'
  },
  mixins: [
    SyncableMixin
  ]
})
