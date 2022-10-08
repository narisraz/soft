'use strict'

const Syncable = require('./syncable')
const FilterServer = require('./filter-server')
const orm = requireComponent('orm')
const dbConfig = requireComponent('db-config')

const logger = require('log4js').getLogger()

class DatabaseSyncable extends Syncable {
  constructor(options) {
    super()

    this.options = options
    if (!this.options.model) throw Error('The model is mandatory')
    this.model = this.options.model
    this.Model = orm.getModel(this.model)
    this.filters = this.options.filters || [ new FilterServer() ]
  }

  getId() {
    return `db.${this.options.model}`
  }

  *getSyncableDocuments(date, clientId) {
    const query = this.Model.where('lastModificationServer', dbConfig.idServer)
    if (date)
      query.where('lastModificationDate', '>=', date)
    if (clientId)
      this.filters.forEach(f => f.filterQuery(query, clientId))

    let res = (yield query.getAll()).toArray(this.options.view)

    if (this.options.sanitize) {
      res = this.options.sanitize(res)
    }

    return res
  }

  *validateSyncableDocument(document, clientId) {
    if (clientId && document.lastModificationServer !== clientId)
      return false

    const mapf = []
    for (let f of this.filters) {
      mapf.push(yield* f.validateSyncableDocument(document, clientId, this.Model))
    }
    return mapf.reduce((a, b) => a && b, true)
  }

  *getWritableDocument(data) {
    let res

    if (this.Model.attributes[this.Model.primaryKey].type === 'id') {
      res = yield this.Model.where('uuid', data.uuid).first()
      if (res) {
        data[this.Model.primaryKey] = res.getId()
      } else {
        delete data[this.Model.primaryKey]
      }
    } else {
      res = yield this.Model.find(data[this.Model.primaryKey])
    }

    return res
  }

  *writeSyncableDocument(data) {
    let syncableDocument = yield* this.getWritableDocument(data)

    if (syncableDocument) {
      const d1 = new Date(syncableDocument.lastModificationDate); d1.setMilliseconds(0)
      const d2 = new Date(data.lastModificationDate); d2.setMilliseconds(0)
      if (d1 >= d2)
        return
      syncableDocument.import(data, false, true)
    } else {
      syncableDocument = this.Model.create()
      syncableDocument.import(data, true, true)
    }

    try {
      yield syncableDocument.rawSave()
    } catch (e) {
      logger.warn(
        `Impossible to save `+
        `${syncableDocument.model.table}[${syncableDocument.getId()}]`,
        syncableDocument.toArray(),
        e
      )
    }
  }

  matchesDeletion(deletion) {
    return this.Model.table === deletion.table
  }

  *validateDeletion(deletion, clientId) {
    const document = yield this.Model.where(deletion.key, '=', deletion.value).first()
    if (!document)
      return false
    return yield* this.validateSyncableDocument(document, clientId)
  }

  *deleteSyncableDocument(deletion) {
    yield this.Model.where(deletion.key, '=', deletion.value).delete()
  }
}

module.exports = DatabaseSyncable
