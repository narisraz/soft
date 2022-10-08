'use strict'

const Storage = require('./storage')

function initialize(config) {
  const storage = new Storage(config)
  for (let fname of Object.getOwnPropertyNames(Storage.prototype)) {
    if (fname !== 'constructor')
      module.exports[fname] = storage[fname].bind(storage)
  }
}

module.exports = {
  Storage,
  initialize
}
