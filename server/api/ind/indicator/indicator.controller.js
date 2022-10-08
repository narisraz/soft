'use strict'

const _ = require('lodash')
const Indicator = require('./indicator.model')
const IndicatorSecurity = require('./indicator.security')
const moment = require('moment')
const orm = requireComponent('orm')
const P = require('bluebird')
const Rest = requireComponent('rest')
const xls = requireComponent('xls')

const co = P.coroutine

class IndicatorController extends Rest {
  constructor() {
    super({
      model: Indicator,
      modelSecurity: new IndicatorSecurity(),
      expand: ['indicatorType', 'server', 'objectives', 'users'],
      relationships: ['users'],
    })
  }

  *getQuery(req) {
    const res = yield* super.getQuery(req)
    return res.order('idServer', 'ordering')
  }

  *expandResult(req, res) {
    const document = yield* super.expandResult(req, res)
    if (req.query.startingPeriod && req.query.periodCount) {
      return yield document.expand(['lastValues', 'attachments'], query => {
        query.where('billingPeriod', '>=', +req.query.startingPeriod)
        query.where('billingPeriod', '<',
          +req.query.startingPeriod + (+req.query.periodCount)
        )
        if (req.query.idServer && req.query.idServer !== 'null') {
          query.where('idServer', req.query.idServer)
        }
      })
    } else {
      return document
    }
  }

  *moveGenerator(req, res, next) {
    if (!req.body.from || !req.body.to) {
      throw new Error('Invalid parameters')
    }

    if (Math.abs(req.body.position) !== 1)
      throw new Error('Invalid parameters')

    const from = yield (yield* this.getQuery(req)).findOrFail(req.body.from)
    const to = yield (yield* this.getQuery(req)).findOrFail(req.body.to)
    if (this.modelSecurity && !(yield* this.modelSecurity.hasPermission(req, from, null, 'read')))
      throw { status: 403, message: 'Unauthorized' }
    if (this.modelSecurity && !(yield* this.modelSecurity.hasPermission(req, to, null, 'read')))
      throw { status: 403, message: 'Unauthorized' }
    if (from.idServer !== to.idServer)
      throw new Error('Cannot order indicators from different servers')

    yield Indicator.move(req.user.uuid, from.idIndicator, to.idIndicator, +req.body.position)
    return { success: true }
  }

  move(req, res, next) {
    return this.wrap(this.moveGenerator.bind(this))(req, res, next)
  }

  xls(req, res, next) {
    var that = this

    return co(function* () {
      const query = yield* that.getQuery(req)
      if (req.query.idServer) {
        if (req.query.idServer === 'null') {
          query.whereNull('idServer')
        } else {
          query.whereEither([
            q => q.whereNull('idServer'),
            q => q.where('idServer', req.query.idServer)
          ])
        }
      }

      const collection = yield query.get()
      yield* that.expandResult(req, collection)

      const options = {
        sheetName: 'Indicateurs',
        rowHeaderField: ['name', 'unit'],
        columnCollectionField: 'lastValues',
        columnHeaderFormat: 'MMM yyyy',
        columnHeaderFormatter: value => moment.utc('1900-02-01').utc().add(value, 'month').toDate(),
        columnHeaderField: 'billingPeriod',
        columnValueField: 'value'
      }

      if (req.query.idServer && req.query.idServer === 'null') {
        options.filters = _(yield orm.getModel('prm.Server').get())
          .map(server => {return{
            field: 'idServer',
            value: server.idServer,
            header: server.name
          }})
          .value()
      }

      const wb = xls.fromCollection(collection, options)

      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      xls.toStream(wb, res)
    })().catch(err => next(err))
  }
}

module.exports = Rest.routes(new IndicatorController())
