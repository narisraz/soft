'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model(
  {
    name: 'tour.ReadingBook',
    table: 'Tour_ReadingBook',
    attributes: {
      idReadingBook: 'id',
      idTour: 'int',
      billingPeriod: 'int',
      revision: 'int',
      generationDate: 'date',
      lockingDate: 'date',
      isLocked: 'boolean',
      readingDate: 'date',
      billingDate: 'date',
      closingDate: 'date',
      closingUser: 'int',
      isClosed: 'boolean',

      tour: {
        model: 'tour.Tour',
        relationship: 'BelongsTo',
        localKey: 'idTour'
      },
    }
  }
)
