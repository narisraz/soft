'use strict'

const ReadingBook = require('./reading_book.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class ReadingBookController extends Rest {
  constructor() {
    super({ model: ReadingBook })
  }
}

module.exports = Rest.routes(new ReadingBookController())
