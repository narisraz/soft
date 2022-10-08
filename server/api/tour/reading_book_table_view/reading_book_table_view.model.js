'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model(
  {
    name: 'tour.ReadingBookTableView',
    table: 'Tour_ReadingBookTableView',
    attributes: {
      idReadingBookEntry: 'number',
      entryOrder: 'int',
      page: 'int',
      line: 'int',
      idReadingBook: 'int',
      contractNumber: 'int',
      fullName: 'string',
      gpsCode: 'string',
      shortCode: 'string',
      isClosed: 'boolean',
      isInvalidated: 'boolean',
      isFromMobile: 'boolean',
      mobileValueAccepted: 'boolean',
      mobileValueRefused: 'boolean',
      isValid: 'boolean',
      serial: 'string',
      unitSymbol: 'string',
      idMeter: 'int',
      idContractStatus: 'int',
      previousMeasuredIndex: 'float',
      previousMeasuredDate: 'date',
      isEnteringPossible: 'boolean',
      isBilled: 'boolean',
      isCancellable: 'boolean',
      entryStatus: 'string',
      isCorrection: 'boolean',
      measuredIndex: 'float',
      wasRead: 'boolean',
      predictedEstimationMode: 'int',
      predictedEstimationModeDescription: 'string',
      predictedEstimatedVolume: 'float',
      predictedBillWaterAmount: 'float',
      idAccountingDocument: 'int',
      warningDelta: 'boolean',
      warningBackwards: 'boolean',
      warningLarge: 'boolean',

      readingBook: {
        model: 'tour.ReadingBookEntry',
        relationship: 'BelongsTo',
        localKey: 'idReadingBookEntry'
      },

      readingBook: {
        model: 'tour.ReadingBook',
        relationship: 'BelongsTo',
        localKey: 'idReadingBook'
      },
    }
  }
)

