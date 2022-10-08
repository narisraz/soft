'use strict'

const Synchronization = require('./synchronization.model')
const syncComponent = requireComponent('sync')

const Rest = requireComponent('rest')

class SynchronizationController extends Rest {
  constructor() {
    super({
      model: Synchronization,
      expand: [ 'server' ]
    })
  }

  *getWhere(req) {
    if (req.query.noServer) return {
      'idServer': null
    }
    return {}
  }

  test(req, res, next) {
    this.wrap(function* (req, res, next) {
      const sync = Synchronization.create(req.body)
      return yield* syncComponent.test(sync)
    })(req, res, next)
  }
}

module.exports = Rest.routes(new SynchronizationController())
