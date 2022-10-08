'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'cst.Contract',
  table: 'Cst_Contract',
  attributes: {
    idContract: 'id',
    idUnit: 'int',
    idBillingCategory: 'int',
    idMeterCategory: 'int',
    gpsCode: { type: 'string', size: 40 },
    idCurrentAccount: 'int',
    idSetupInstallmentAccount: 'int',
    idDebtRefinancingAccount: 'int',
    contractNumber: 'int',
    defaultTour: 'int',
    defaultTourOrder: 'int',
    createdDate: 'date',
    creatingUser: 'int',

    unit: { model: 'cst.Unit', relationship: 'BelongsTo', localKey: 'idUnit' }
  }
})
