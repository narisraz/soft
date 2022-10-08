'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'cst.Unit',
  table: 'Cst_Unit',
  attributes: {
    idUnit: 'id',
    idCustomer: 'int',
    idSector: 'int',
    idUnitType: 'int',

    unitCode: { type: 'string', size: 30 },

    street: 'int',
    streetNumber: { type: 'string', size: 10 },
    addressComplement: { type: 'string', size: 255 },
    createdDate: 'date',
    creatingUser: 'int',

    extra: 'string',

    customer: {
      model: 'cst.Customer',
      relationship: 'BelongsTo',
      localKey: 'idCustomer'
    }
  }
})
