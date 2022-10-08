'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model(
  {
    name: 'tour.ReadingBookEntry',
    table: 'Tour_ReadingBookEntry',
    attributes: {
      idReadingBookEntry: 'id',
      idReadingBook: 'int',
      idContract: 'int',
      entryOrder: 'int',
      measuredIndex: 'int',
      idReadingEvent: 'int',
      isClosed: 'boolean',
      isInvalidated: 'boolean',
      isFromMobile: 'boolean',
      mobileValueAccepted: 'boolean',
      mobileValueRefused: 'boolean',
      isValid: 'boolean',
      correctingIdReadingBookEntry: 'int',

      readingBook: {
        model: 'tour.ReadingBook',
        relationship: 'BelongsTo',
        localKey: 'idReadingBook'
      },
    }
  }
)
