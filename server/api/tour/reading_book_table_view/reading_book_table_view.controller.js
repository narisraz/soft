'use strict'

const ReadingBookTableView = require('./reading_book_table_view.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class ReadingBookTableViewController extends Rest {
  constructor() {
    super({ model: ReadingBookTableView })
  }
}

module.exports = Rest.routes(new ReadingBookTableViewController())
