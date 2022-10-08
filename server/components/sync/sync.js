'use strict'

const _ = require('lodash')
const orm = require('../orm')
const dbConfig = requireComponent('db-config')
const File = orm.getModel('file.File')
const Deletion = orm.getModel('sync.Deletion')
const storage = requireComponent('storage')
const DatabaseSyncable = require('./database-syncable')
const FilterServer = require('./filter-server')
const FilterServerRelation = require('./filter-server-relation')
const FilterServerMultiple = require('./filter-server-multiple')
const logger = require('log4js').getLogger()

const shouldSanitizePassword =
  user => dbConfig.syncConfig.server && dbConfig.idServer === user.idServer

const sanitizeUser = user => _.defaults({
  passwordHash: shouldSanitizePassword(user) ? null : user.passwordHash,
  passwordSalt: shouldSanitizePassword(user) ? null : user.passwordSalt
}, user)

class Sync {
  constructor() {
    this.syncables = [
      new DatabaseSyncable({ model: 'prm.Server', view: 'sync' }),
      new DatabaseSyncable({
        model: 'prm.User',
        view: 'sync',
        sanitize: users => users.map(sanitizeUser)
      }),
      new DatabaseSyncable({ model: 'prm.Permission' }),
      new DatabaseSyncable({ model: 'prm.Group' }),
      new DatabaseSyncable({ model: 'prm.GroupPermission', filters: [
        new FilterServerRelation('group')
      ]}),
      new DatabaseSyncable({ model: 'prm.UserGroup', filters: [
        new FilterServerRelation('user')
      ]}),
      new DatabaseSyncable({ model: 'file.File', view: 'sync' }),
      new DatabaseSyncable({ model: 'ind.Indicator' }),
      new DatabaseSyncable({ model: 'ind.IndicatorObjective', filters: [
        new FilterServerRelation('indicator')
      ]}),
      new DatabaseSyncable({ model: 'ind.IndicatorUser', filters: [
        new FilterServerRelation('indicator')
      ]}),
      new DatabaseSyncable({ model: 'ind.IndicatorValue' }),
      new DatabaseSyncable({ model: 'ind.Attachment' }),
      new DatabaseSyncable({ model: 'ind.Alert', filters: [
        new FilterServerMultiple()
      ]}),
      new DatabaseSyncable({ model: 'ind.AlertServer', filters: [
        new FilterServer(),
        new FilterServerRelation('alert')
      ]}),
      new DatabaseSyncable({ model: 'ind.AlertEmail', filters: [
        new FilterServerRelation('alert')
      ]}),
      new DatabaseSyncable({ model: 'ind.SentAlert' }),
      new DatabaseSyncable({ model: 'ind.SentAlertEmail', filters: [
        new FilterServerRelation('sentAlert')
      ]}),
      new DatabaseSyncable({ model: 'sync.Deletion' }),
    ]
  }

  *getSyncableValues(date, clientId) {
    const customerCount = yield orm.getModel('cst.Customer').count()

    yield dbConfig.server.refresh()
    if (dbConfig.server.customers !== customerCount) {
      dbConfig.server.customers = customerCount
      dbConfig.server.lastModificationDate = new Date()
      dbConfig.server.lastModificationServer = dbConfig.idServer
      yield dbConfig.server.rawSave()
    }

    const res = {}
    for (let syncable of this.syncables) {
      res[syncable.getId()] = yield* syncable.getSyncableDocuments(date, clientId)
    }

    return res
  }

  *setSyncableValues(data, clientId) {
    clientId = clientId || null

    for (let syncable of this.syncables) {
      const syncableValues = data[syncable.getId()]

      if (!syncableValues || !_.isArray(syncableValues))
        continue

      for (let syncableValue of syncableValues) {
        if (!(yield* syncable.validateSyncableDocument(syncableValue, clientId))) {
          logger.warn(`Unauthorized syncable value ${syncable.getId()}`+
            `[${syncableValue[syncable.Model.primary()]}]`)
          continue
        }

        yield* syncable.writeSyncableDocument(syncableValue)
      }
    }
  }

  *processDeletion(clientId) {
    let deletions = yield Deletion.where('processed', '=', false).order('createdDate').get()

    for (let deletion of deletions) {
      const deletionText = `${deletion.table}[${deletion.key}=${deletion.value}]`
      try {
        const syncable = _.find(this.syncables, a => a.matchesDeletion(deletion))
        if (!syncable)
          throw new Error(`Unable to delete ${deletionText}, could not find corresponding syncable`)

        if (!(yield* syncable.validateDeletion(deletion, clientId))) {
          logger.warn(`Unauthorized deletion ${deletionText}`)
        } else {
          yield* syncable.deleteSyncableDocument(deletion)
        }

        yield deletion.set('processed', true).save()
      } catch (e) {
        logger.warn(`Impossible to delete ${deletionText}`, e)
      }
    }
  }

  *getMissingChunks() {
    const incompleteFiles = yield File.where('complete', false).get()
    let missingChunks = []
    for (let file of incompleteFiles) {
      const chunks = yield* storage.getMissingChunks(file.hash)
      missingChunks = missingChunks.concat(chunks)
    }
    return missingChunks
  }

  *flagCompletedFiles() {
    const incompleteFiles = yield File.where('complete', false).get()

    for (let file of incompleteFiles) {
      const isComplete = yield* storage.isComplete(file.hash)
      if (isComplete) {
        file.complete = true
        yield file.save()
      }
    }
  }
}

module.exports = Sync
