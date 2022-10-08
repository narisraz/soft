'use strict'

const P = require('bluebird')
const co = P.coroutine
const _ = require('lodash')
const util = require('util')

class Rest {
  constructor(options) {
    _.merge(this, options)
  }

  *getWhere(req) {
    return {}
  }

  *getQuery(req) {
    const res = this.model.query()
    const where = yield* this.getWhere(req)
    for (let key in where) {
      res.where(key, where[key])
    }
    if (this.modelSecurity)
      this.modelSecurity.filterQuery(req, res)
    return res
  }

  createDocument(req) {
    return this.model.create(req.body)
  }

  getId(req) {
    return req.params.id
  }

  *getDocument(req) {
    return yield (yield* this.getQuery(req)).findOrFail(this.getId(req))
  }

  *expandResult(req, res) {
    if (this.expand)
      return yield res.expand(this.expand)
    return res
  }

  *indexGenerator(req, res, next) {
    var rangeHeader = req.header('Range')
    var start
    var limit

    if (rangeHeader) {
      var match = /^\s*items\s*=\s*(\d+)\s*-\s*(\d+)/.exec(rangeHeader)

      if (!match) {
        next(new Error("Invalid Range"))
        return
      }
      if (match && match.length === 3) {
        if (+match[2] >= +match[1]) {
          start = +match[1]
          limit = +match[2] - +match[1] + 1
        } else {
          start = 0
          limit = 0
        }
      }
    } else {
      start = 0
      limit = Infinity
    }

    const model = yield* this.getQuery(req)
    const count = yield model.count()
    const items = yield model
      .offset(start)
      .limit(limit)
      .get()

    if (items.length > 0) {
      res.set('Content-Range', 'items ' + start + '-' + (start + items.length - 1) + '/' + count)
    } else {
      res.set('Content-Range', 'items 0-0/' + count)
    }
    const docs = yield* this.expandResult(req, items)
    return docs
  }

  *validate(user, body, doc) {
    const validationMessages = {}
    const validationResult = yield this.model.validate(body, validationMessages, doc, user)
    if (!validationResult)
      throw { status: 422, message: 'Validation failed', validation: validationMessages }
  }

  *updateRelationship(req, doc, name) {
    let input = req.body[`set_${name}`]
    if (typeof input === 'undefined')
      return
    if (!_.isArray(input)) {
      input = _(input).pickBy().keys().value()
    }
    yield doc.relationship(name).set(input).save()
  }

  *updateRelationships(req, doc) {
    if (!_.isArray(this.relationships))
      return
    for (let relationship of this.relationships) {
      yield* this.updateRelationship(req, doc, relationship)
    }
  }

  *createGenerator(req, res, next) {
    yield* this.validate(req.user, req.body)
    if (
      this.modelSecurity &&
      !(yield* this.modelSecurity.hasPermission(req, null, req.body, 'create'))
    )
      throw { status: 403, message: 'Unauthorized' }
    const doc = this.createDocument(req)
    const where = yield* this.getWhere(req)
    for (let key in where) {
      doc.set(key, where[key])
    }
    if (req.user) doc.user = req.user
    yield doc.save()
    yield* this.updateRelationships(req, doc)

    return yield* this.expandResult(req, doc)
  }

  *showGenerator(req, res, next) {
    const doc = yield* this.expandResult(req, yield* this.getDocument(req))
    if (this.modelSecurity && !(yield* this.modelSecurity.hasPermission(req, doc, null, 'read')))
      throw { status: 403, message: 'Unauthorized' }
    return doc
  }

  *updateGenerator(req, res, next) {
    const doc = yield* this.getDocument(req)
    yield* this.validate(req.user, req.body, doc)
    if (
      this.modelSecurity &&
      !(yield* this.modelSecurity.hasPermission(req, doc, res.body, 'update'))
    )
      throw { status: 403, message: 'Unauthorized' }
    doc.set(req.body)
    if (req.user) doc.user = req.user
    yield* this.updateRelationships(req, doc)

    return yield* this.expandResult(req, yield doc.save())
  }

  *destroyGenerator(req, res, next) {
    const doc = yield* this.getDocument(req)
    yield* this.validate(req.user, null, doc)
    if (req.user) doc.user = req.user
    if (this.modelSecurity && !(yield* this.modelSecurity.hasPermission(req, doc, null, 'destroy')))
      throw { status: 403, message: 'Unauthorized' }
    return yield* this.expandResult(req, yield doc.delete())
  }

  wrap(generator) {
    return function(req, res, next) {
      return co(function*() {
        try {
          const data = yield* generator(req, res, next)
          if (data)
            res.json(data.toArray ? data.toArray() : data)
        } catch (err) {
          next(err)
        }
      })(req, res, next).catch(err => next(err))
    }
  }

  index(req, res, next) {
    return this.wrap(this.indexGenerator.bind(this))(req, res, next)
  }
  create(req, res, next) {
    return this.wrap(this.createGenerator.bind(this))(req, res, next)
  }
  show(req, res, next) {
    return this.wrap(this.showGenerator.bind(this))(req, res, next)
  }
  update(req, res, next) {
    return this.wrap(this.updateGenerator.bind(this))(req, res, next)
  }
  destroy(req, res, next) {
    return this.wrap(this.destroyGenerator.bind(this))(req, res, next)
  }
}

function getAllFuncs(controller) {
  var props = []

  var obj = controller
  do {
      props = props.concat(Object.getOwnPropertyNames(obj))
  } while ((obj = Object.getPrototypeOf(obj)))

  return props.sort().filter((e, i, arr) => {
    return e !== arr[i+1] &&
      typeof controller[e] === 'function' &&
      controller[e] !== controller
  })
}

Rest.routes = controller => _(getAllFuncs(controller))
  .filter(f => f[0] !== '_')
  .filter(f => controller[f].constructor.name !== 'GeneratorFunction')
  .keyBy()
  .mapValues(f => controller[f].bind(controller))
  .value()

module.exports = Rest
