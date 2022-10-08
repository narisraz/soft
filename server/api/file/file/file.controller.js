'use strict'

const P = require('bluebird')
const co = P.coroutine
const storage = requireComponent('storage')
const File = require('./file.model')
const dbConfig = requireComponent('db-config')

exports.create = function(req, res, next) {
  let files = []
  let finished = false
  let fileFinished = false

  let sendResponse = () => {
    if (finished && fileFinished) {
      res.json(files)
    }
  }

  req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    co(function*() {
      fileFinished = false
      const hash = yield* storage.setFile(file, {
        name: filename,
        type: mimetype
      })

      let fileDocument = File.create({
        name: filename,
        type: mimetype,
        hash: hash,
        idServer: dbConfig.idServer
      })
      fileDocument.complete = true
      fileDocument = yield fileDocument.save()
      files.push(fileDocument.toArray())
      fileFinished = true
      sendResponse()
    })().catch(err => next(err))
  })

  req.busboy.on('error', err => next(err))
  req.busboy.on('finish', () => {
    finished = true
    sendResponse()
  })

  req.pipe(req.busboy)
}

exports.show = function(req, res, next) {
  co(function*() {
    if (!req.params.id) return next()
    const fileQuery = File.query()
    const file = yield fileQuery.find(req.params.id)
    if (!file) return next()
    const fileStream = yield* storage.getFile(file.hash)
    if (!fileStream) return next()
    res.setHeader('Content-Type', file.type)
    fileStream.pipe(res)
  })().catch(err => next(err))
}

exports.redirect = function (req, res, next) {
  co(function*() {
    if (!req.params.id) return next()
    const fileQuery = File.query()
    const file = yield fileQuery.find(req.params.id)
    if (!file) return next()
    res.redirect(`/api/file/File/${req.params.id}/${file.name || 'file'}`)
  })().catch(err => next(err))
}
