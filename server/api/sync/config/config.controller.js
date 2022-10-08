'use strict'

const Config = require('./config.model')
const Rest = requireComponent('rest')

class ConfigController extends Rest {
  constructor() {
    super({ model: Config })
  }

  *getWhere(req) {
    return { idConfig: 1 }
  }

  *indexGenerator(req, res, next) {
    let result = yield* super.indexGenerator(req, res, next)
    if (result[0]) {
      result = result[0]
    }
    return result
  }
}

module.exports = Rest.routes(new ConfigController())
