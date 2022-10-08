const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'ordr.Type',
  table: 'Ordr_Type',
  primaryKey: 'idOrderType',
  attributes: {
    idOrderType: 'int',
    idBillCategory: 'int',
    expenditureBillJournalEntryItemClass: 'int',
    billDescription: { type: 'string', size: 100 },
    description: { type: 'string', size: 50 },
    requiresOpeningBill: 'boolean',
    requiresPartialBill: 'boolean',
    hasClosingBill: 'boolean',
    optionalClosingBill: 'boolean',

    statusChangeEventStatus: 'int',
    meterRemoveEvent: 'boolean',
    meterChangeEvent: 'boolean',

    debtWarning: 'boolean'
  }
})
