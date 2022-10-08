'use strict'

const Filter = require('./filter')
const dbConfig = requireComponent('db-config')

class FilterServerRelation extends Filter {
  constructor(serverRelation) {
    super()

    this.serverRelation = serverRelation
  }

  filterQuery(query, clientId) {
    query.whereRelationship(this.serverRelation, q => {
      q.whereEither([
        q => q.where('idServer', clientId),
        q => q.where('idServer', dbConfig.idServer),
        q => q.whereNull('idServer')
      ])
    })
  }

  *validateSyncableDocument(data, clientId, Model) {
    if (!clientId)
      return true
    const document = yield Promise.resolve(Model.create().import(data))
    const syncableRelationship = (yield document.expand(this.serverRelation))
      .get(this.serverRelation)
    if (syncableRelationship && (syncableRelationship.idServer === clientId))
      return true
    return false
  }
}


module.exports = FilterServerRelation
