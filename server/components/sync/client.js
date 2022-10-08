'use strict'

const P = require('bluebird')
const co = P.coroutine
const rp = require('request-promise')
const request = require('request')
const orm = require('../orm')
let Synchronization
const _ = require('lodash')
const storage = requireComponent('storage')
const dbConfig = requireComponent('db-config')
const Sync = require('./sync')
const logger = require('log4js').getLogger()

class Client extends Sync {
  constructor() {
    super()
    this.knownSyncs = {}
  }

  cred(data, sync) {
    data.psk = sync.psk
    data.idServer = dbConfig.idServer
    data.version = dbConfig.syncConfig.version
    return data
  }

  *test(sync) {
    var res

    try {
      res = yield rp.post(sync.pushUrl + '/test', {
        json: this.cred({}, sync)
      })
    } catch (e) {
      res = { success: false, error: e.name, message: e.message }
    }

    return res
  }

  *pushToServer(sync) {
    const serversLastFromMe = yield rp.post(sync.pushUrl + '/last', { json: this.cred({}, sync) })
    const date = new Date()
    const data = yield* this.getSyncableValues(serversLastFromMe.date)
    const body = this.cred({date, data}, sync)
    const response = yield rp.post(sync.pushUrl + '/push', { json: body })

    if (!response.ok) {
      throw new Error('Invalid response from the server')
    }
  }

  *pullFromServer(sync) {
    const serverData = yield rp.post(sync.pushUrl + '/pull', {
      json: this.cred({date: sync.lastSync}, sync)
    })

    yield* this.setSyncableValues(serverData.data)
    sync.lastSync = serverData.date

    yield* this.processDeletion()
    return sync.rawSave()
  }

  *pushFilesToServer(sync) {
    /*
     * Ask the server about the list of missing chunks
     *
     * Push each of those chunks ot the server
     */
    const missingChunks = yield rp.post(sync.pushUrl + '/chunks/missing', {
      json: this.cred({}, sync)
    })

    if (!_.isArray(missingChunks.chunks)) {
      throw new Error('Invalid response from the server')
    }
    for (let hash of missingChunks.chunks) {
      if (!_.isString(hash)) {
        throw new Error('Invalid response from the server')
      }
      let chunk = yield* storage.getChunk(hash)
      if (chunk) {
        request.post({
          url: sync.pushUrl + '/chunks/push',
          headers: { 'X-PSK': sync.psk },
          formData: this.cred({ hash, chunk }, sync)
        })
      }
    }
  }

  *pullFilesFromServer(sync) {
    const missingChunks = yield* this.getMissingChunks()
    for (let hash of missingChunks) {
      const chunk = request.post(sync.pushUrl + '/chunks/pull', {
        json: this.cred({ hash }, sync)
      })
      yield* storage.setChunk(chunk)
    }

    yield rp.post(sync.pushUrl + '/chunks/end', {
      json: this.cred({}, sync),
      headers: { 'X-PSK': sync.psk },
    })
  }

  *doSync(sync) {
    try {
      yield* this.pushToServer(sync)
      yield* this.pullFromServer(sync)
      yield* this.pushFilesToServer(sync)
      yield* this.pullFilesFromServer(sync)
      yield* this.flagCompletedFiles()
    } catch (e) {
      logger.error(e.message)
    }
  }

  *updateSync(sync) {
    if (!sync.push)
      return
    if (!sync.pushFrequency)
      return

    if (!this.knownSyncs[sync.id]) {
      this.knownSyncs[sync.id] = {
        counter: 0
      }
    }

    const ksync = this.knownSyncs[sync.id]
    ksync.counter ++

    if (ksync.counter >= sync.pushFrequency) {
      if (ksync.syncing)
        return
      ksync.syncing = true
      try {
        yield* this.doSync(sync)
      } finally {
        ksync.syncing = false
      }

      ksync.counter = 0
    }
  }

  *updateSyncList(syncs) {
    const res = []
    for (let sync of syncs) {
      res.push(co(this.updateSync.bind(this))(sync))
    }
    yield P.all(res)
  }

  updateSyncs() {
    var that = this
    co(function* () {
      const syncs = yield Synchronization.get()
      yield* that.updateSyncList(syncs)
    })()
    .catch(e => {
      logger.error('Client synchronization error', e)
    })
  }

  run() {
    Synchronization = orm.getModel('sync.Synchronization')
    setInterval(this.updateSyncs.bind(this), 1000)
  }
}

module.exports = Client
