'use strict'

const Filter = require('./filter')
const dbConfig = requireComponent('db-config')

class FilterServer extends Filter {
  constructor(field) {
    super()
    this.field = field || 'idServer'
  }

  filterQuery(query, clientId) {
    query.whereEither([
      q => q.where(this.field, clientId),
      q => q.where(this.field, dbConfig.idServer),
      q => q.whereNull(this.field)
    ])
  }

  *validateSyncableDocument(document, clientId) {
    if (!clientId)
      return true
    if (document[this.field] === clientId)
      return true
    return false
  }
}

module.exports = FilterServer
