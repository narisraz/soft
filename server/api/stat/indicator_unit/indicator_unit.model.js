'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'stat.IndicatorUnit',
  table: 'Stat_IndicatorUnit',
  attributes: {
    idIndicatorUnit: 'id',
    name: { type: 'string', size: 30 },
    useCurrency: 'boolean'
  }
})
