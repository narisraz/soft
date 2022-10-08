'use strict'

const P = require('bluebird')
const co = P.coroutine
const express = require('express')
const orm = require('../orm')
const Synchronization = orm.getModel('sync.Synchronization')
const PrmServer = orm.getModel('prm.Server')
const _ = require('lodash')
const storage = requireComponent('storage')
const dbConfig = requireComponent('db-config')
const Sync = require('./sync')

const logger = require('log4js').getLogger()

class Server extends Sync {
  constructor() {
    super()
  }

  *processRequestCo(body, f) {
    const sync = yield Synchronization.where('psk', body.psk).first()
    if (!sync) {
      throw new Error('Invalid PSK')
    }

    if (!body.idServer) {
      throw new Error('No idServer')
    }

    sync.version = body.version
    yield sync.rawSave()

    if (sync.version !== dbConfig.syncConfig.version) {
      throw new Error('Invalid synchronization protocol version')
    }

    if (f) yield* f(sync)

    if (!sync.idServer) {
      const server = yield PrmServer.find(body.idServer)
      if (server) {
        sync.idServer = body.idServer
        yield sync.rawSave()
      }
    } else {
      if (sync.idServer !== body.idServer) {
        throw new Error('Invalid server ID')
      }
    }
  }

  processRequest(req, res, next, f) {
    if (!req.body.psk) {
      next(new Error('Missing PSK'))
      return
    }
    co(this.processRequestCo.bind(this))(req.body, f).catch(err => next(err))
  }

  test(req, res, next) {
    co(this.processRequestCo.bind(this))(req.body)
    .then(sync => res.json({success: true}))
    .catch(e => res.json({success: false, error: e.name, message: e.message }))
  }

  pull(req, res, next) {
    var that = this
    this.processRequest(req, res, next, function* (sync) {
      const date = new Date()
      const data = yield* that.getSyncableValues(req.body.date, sync.idServer)
      return res.json({ date, data })
    })
  }

  last(req, res, next) {
    this.processRequest(req, res, next, function* (sync) {
      return res.json({ date: sync.lastSync })
    })
  }

  push(req, res, next) {
    var that = this
    this.processRequest(req, res, next, function* (sync) {
      if (!_.isObject(req.body.data)) {
        next(new Error('Invalid data'))
        return
      }

      yield* that.setSyncableValues(req.body.data, sync.idServer)
      sync.lastSync = req.body.date

      yield* that.processDeletion(sync.idServer)
      yield sync.rawSave()
      return res.json({ ok: true })
    })
  }

  chunkMissing(req, res, next) {
    var that = this
    this.processRequest(req, res, next, function* (sync) {
      const missingChunks = yield* that.getMissingChunks()
      return res.json({
        chunks: missingChunks
      })
    })
  }

  chunkPush(req, res, next) {
    if (req.busboy) {
      let hash
      let psk = req.get('X-PSK')
      let error = false

      req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
        if (key === 'psk') {
          psk = value
        }
        if (key === 'hash') {
          hash = value
        }
      })

      req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        co(function*() {
          if (!psk) {
            next(new Error('Invalid PSK'))
            return
          }
          const sync = yield Synchronization.where('psk', psk).first()
          if (!sync) {
            error = true
            next(new Error('Invalid PSK'))
            return
          }

          if (fieldname === 'chunk') {
            let fileHash = yield* storage.setChunk(file)
            if (fileHash !== hash) {
              logger.warn('push advertised the wrong hash!')
            }
          }
        })()
      })

      req.busboy.on('finish', () => { if (!error) res.json({ ok: true }) })
      req.pipe(req.busboy)
    }
  }

  chunkPull(req, res, next) {
    this.processRequest(req, res, next, function* (sync) {
      if (!_.isString(req.body.hash)) {
        next(new Error('Invalid data'))
        return
      }

      const chunk = yield* storage.getChunk(req.body.hash)
      if (chunk) {
        chunk.pipe(res)
      } else {
        res.status(404).end()
      }
    })
  }

  chunkEnd(req, res, next) {
    var that = this
    this.processRequest(req, res, next, function* (sync) {
      yield* that.flagCompletedFiles()
      return res.json({ ok: true })
    })
  }

  run(app) {
    const router = express.Router()
    router.post('/sync/test', this.test.bind(this))
    router.post('/sync/pull', this.pull.bind(this))
    router.post('/sync/last', this.last.bind(this))
    router.post('/sync/push', this.push.bind(this))
    router.post('/sync/chunks/missing', this.chunkMissing.bind(this))
    router.post('/sync/chunks/push', this.chunkPush.bind(this))
    router.post('/sync/chunks/pull', this.chunkPull.bind(this))
    router.post('/sync/chunks/end', this.chunkEnd.bind(this))
    app.use(router)
  }
}

module.exports = Server
