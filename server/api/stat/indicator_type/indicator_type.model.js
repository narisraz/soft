'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'stat.IndicatorType',
  table: 'Stat_IndicatorType',
  attributes: {
    idIndicatorType: 'id',
    name: { type: 'string', size: 500 },
    idIndicatorUnit: 'int',
    unit: { model: 'stat.IndicatorUnit', relationship: 'BelongsTo', localKey: 'idIndicatorUnit' },
    chart: function() { return this.headerQuery !== null },
    headerQuery: { type: 'string', hidden: true },
    column: { type: 'string', hidden: true },
    query: { type: 'string', hidden: true },
  }
})
