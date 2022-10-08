'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'stat.Indicator',
  table: 'Stat_Indicator',
  attributes: {
    idIndicator: 'id',
    ordering: 'int',
    idIndicatorType: 'int',
    indicatorType: { model: 'stat.IndicatorType', relationship: 'BelongsTo', localKey: 'idIndicatorType' },
    perCategory: 'boolean'
  }
})
