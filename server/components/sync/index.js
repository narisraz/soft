'use strict'

const Server = require('./server')
const Client = require('./client')

exports.server = new Server()
exports.client = new Client()

exports.run = app => {
  exports.server.run(app)
  exports.client.run(app)
}

exports.test = function* (sync) {
  return yield* exports.client.test(sync)
}
