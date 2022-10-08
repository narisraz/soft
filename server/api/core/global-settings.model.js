'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'core.GlobalSettings',
  table: 'GlobalSettings',
  attributes: {
    cityPrefix: 'string',
    cityCode: 'string',
    operator: 'string',
    address: 'string',
    phone: 'string',
    currencySymbol: 'string',
    currencyDescription: 'string',
    header: 'string',
    billingPeriodicityMonth: 'integer',
    billingYearStartingMonth: 'integer',
    readingBookPageSize: 'integer',
    defaultMonthlyEstimate: 'float',
    estimateTimelineDays: 'integer',
    estimateValidDaysRequired: 'integer',
    defaultDueDateDays: 'integer',
    largeVolume: 'integer',

    currentAccountPositiveLabel: 'string',
    currentAccountNegativeLabel: 'string',
    installmentAccountPositiveLabel: 'string',
    installmentAccountNegativeLabel: 'string',
    refinancingAccountPositiveLabel: 'string',
    refinancingAccountNegativeLabel: 'string',

    toPayPositiveLabel: 'string',
    toPayNegativeLabel: 'string',
    paymentReceiptPositiveLabel: 'string',
    paymentReceiptNegativeLabel: 'string',

    displayInstallmentAccount: 'boolean',
    displayRefinancingAccount: 'boolean',

    url: 'string',
    jwtSecret: 'string'
  }
})
