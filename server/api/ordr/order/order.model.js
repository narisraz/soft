'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'ordr.Order',
  table: 'Ordr_Order',
  primaryKey: 'idOrder',
  attributes: {
    idOrder: 'int',
    idContract: 'int',

    idTour: 'int',
    entryOrder: 'int',

    type: 'int',
    status: 'int',

    code: { type: 'string', size: 30 },

    creationDate: 'date',
    creatingUser: 'int',

    cancellationDate: 'date',
    cancellingUser: 'int',

    idReason: 'int',
    reasonText: { type: 'string', size: 100 },

    completionDate: 'date',
    completingUser: 'int',

    plumber: { type: 'string', size: 100 },
    diggers: { type: 'string', size: 100 },
    dimension: { type: 'string', size: 100 },
    workDescription: { type: 'string', size: 200 },
    material: { type: 'string', size: 100 },
    observations: { type: 'string', size: 200 },

    durationMinutes: 'int',

    generateClosingBill: 'boolean',
    idClosingReadingEvent: 'int',
    idMeterRemovedEvent: 'int',
    idContractStatusChangeEvent: 'int',
    idMeterAssignedEvent: 'int',
    idOpeningReadingEvent: 'int',
    idReconciliationEvent: 'int',
    isValid: 'boolean'
  }
})
