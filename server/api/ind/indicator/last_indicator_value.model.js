'use strict'

const Model = requireComponent('orm').Model
const IndicatorValue = require('./indicator_value.model')

module.exports = new Model({
  name: 'ind.LastIndicatorValue',
  table: 'Ind_LastIndicatorValue',
  primaryKey: 'idIndicatorValue',
  attributes: IndicatorValue.attributes,
  hooks: IndicatorValue.hooks
})
