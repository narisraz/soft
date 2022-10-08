'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'mtr.Unit',
  table: 'Mtr_Unit',
  attributes: {
    idUnit: 'id',
    symbol: 'string',
    name: 'string',
    value: 'float'
  }
})
