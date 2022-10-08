'use strict'

const ActionBatch = require('./action_batch.model')
const Action = require('./action.model')
const Rest = requireComponent('rest')
const roam = requireComponent('roam')
const _ = require('lodash')

class ActionBatchController extends Rest {
  constructor() {
    super({
      model: ActionBatch,
      expand: ['actions'],
      createDocument(req) {
        const res = this.model.create(req.body)
        if (req.body.actions && _.isArray(req.body.actions)) {
          res.actions = req.body.actions.map(action => {
            const res = Action.create(action)
            res.payload = JSON.stringify(action.payload)
            return res
          })
        }
        return res
      }
    })
  }

  create(req, res, next) {
    const that = this
    return that.wrap(function*(req, res, next) {
      const batch = yield* that.createGenerator(req, res, next)
      yield roam.executeActions(req.user, batch.actions)
      yield batch.refresh()
      yield batch.expand('actions')
      return batch
    })(req, res, next)
  }
}

module.exports = Rest.routes(new ActionBatchController())
