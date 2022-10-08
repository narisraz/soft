'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'cst.ContractTableView',
  table: 'Cst_ContractTableView',
  attributes: {
    idContract: 'int',
    contractNumber: 'int',
    unitCode: 'string',
    idUnit: 'int',
    idCustomer: 'int',
    customerCode: 'string',
    idMeter: 'int',
    meterSerial: 'string',
    fullName: 'string',
    idContractStatus: 'int',
    contractStatusDescription: 'string',
    idBillingCategory: 'int',
    billingCategory: 'string',
    idMeterCategory: 'int',
    meterCategory: 'string',
    phone1: 'string',
    streetNumber: 'string',
    streetName: 'string',
    gpsCode: 'string',
    idSector: 'int',
    sector: 'string',
    idTour: 'int',
    tourCode: 'string',
    defaultTourOrder: 'int',
    globalBalance: 'int',
    currentAccountBalance: 'int',
    setupInstallmentAccountBalance: 'int',
    debtRefinancingAccountBalance: 'int',
    overdue: 'int',
    overdueDays: 'int',
    threeMonthOverdue: 'int',
    threeMonthRate: 'int',
  }
})
