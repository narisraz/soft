const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'ordr.Status',
  table: 'Ordr_Status',
  primaryKey: 'idOrderStatus',
  attributes: {
    idOrderStatus: 'int',
    description: { type: 'string', size: 50 }
  }
})
