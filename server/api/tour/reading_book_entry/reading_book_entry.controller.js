'use strict'

const ReadingBookEntry = require('./reading_book_entry.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class ReadingBookEntryController extends Rest {
  constructor() {
    super({ model: ReadingBookEntry })
  }
}

module.exports = Rest.routes(new ReadingBookEntryController())
