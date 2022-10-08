'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'ordr.Reason',
  table: 'Ordr_Reason',
  primaryKey: 'idReason',
  attributes: {
    idReason: 'int',
    description: { type: 'string', size: 100 }
  }
})
