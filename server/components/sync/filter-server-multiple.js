'use strict'

const Filter = require('./filter')
const orm = requireComponent('orm')
const Col = orm.Col

class FilterServerMultiple extends Filter {
  constructor(field, multipleServerRelation, multipleServerField) {
    super()

    this.field = field || 'idServer'
    this.multipleServerField = multipleServerField || 'idServer'
    this.multipleServerRelation = multipleServerRelation || 'servers'
  }

  filterQuery(query, clientId) {
    const remoteModelName = query.model.relationships[this.multipleServerRelation].remoteModelName
    const remoteModelTable = orm.getModel(remoteModelName).table
    query.whereEither([
      q => q.where(this.field, clientId),
      q => q.whereRelationship(
        this.multipleServerRelation,
        Col(this.multipleServerField, remoteModelTable),
        clientId
      )
    ])
  }

  *validateSyncableDocument(document, clientId, Model) {
    if (!clientId)
      return true
    if (document[this.field] === clientId)
      return true
    return false
  }
}


module.exports = FilterServerMultiple
