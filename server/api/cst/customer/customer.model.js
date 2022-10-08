'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'cst.Customer',
  table: 'Cst_Customer',
  attributes: {
    idCustomer: 'id',
    customerCode: { type: 'string', size: 30 },
    companyName: { type: 'string', size: 50 },
    firstName: { type: 'string', size: 50 },
    lastName: { type: 'string', size: 50 },
    fullName: { type: 'string', computed: true },
    honorific: 'int',

    idNumberType: 'int',
    idNumber: { type: 'string', size: 50 },

    street: 'int',
    streetNumber: { type: 'string', size: 10 },
    addressComplement: { type: 'string', size: 255 },

    phone1: { type: 'string', size: 20 },
    phone2: { type: 'string', size: 20 },
    phone3: { type: 'string', size: 20 },
    phone4: { type: 'string', size: 20 },

    email: { type: 'string', size: 100 },
    extra: 'string',
    isRenting: 'boolean',
    createdDate: 'date',
    creatingUser: 'int',

    lastModificationDate: 'date',
    lastModificationUser: 'int'
  }
})
