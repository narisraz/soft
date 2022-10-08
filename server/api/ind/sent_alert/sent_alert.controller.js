'use strict'

const SentAlertStatus = require('./sent_alert_status.model')
const SentAlert = require('./sent_alert.model')
const SentAlertSecurity = require('./sent_alert.security')
const Rest = requireComponent('rest')
const moment = require('moment')

class SentAlertController extends Rest {
  constructor() {
    super({
      model: SentAlert,
      modelSecurity: new SentAlertSecurity(),
      expand: [ {
        expands: 'emails',
        queryFilter: q => q.expand('user')
      }, 'alert', 'server' ]
    })
  }

  *getQuery(req) {
    const query = yield* super.getQuery(req)

    if (!req.user.cachedPermissions['ind.alert.view_all']) {
      query.whereRelationship('emails', 'idUser', req.user.uuid)
    }

    if (req.query.newer && moment(req.query.newer).isValid()) {
      query.where('expiresDate', '>=', moment(req.query.newer))
    }

    return query
  }

  *expandResult(req, res) {
    const document = yield* super.expandResult(req, res)
    if (req.user) {
      yield document.expand('status', q => q.where('idUser', req.user.uuid))
    }
    return document
  }

  viewed(req, res, next) {
    const that = this
    return this.wrap(function*(req, res, next) {
      const sentAlerts = yield (yield* that.getQuery(req)).get()

      for (let sentAlert of sentAlerts) {
        yield sentAlert.expand('status', q => q.where('idUser', req.user.uuid))
        let sentAlertStatus
        if (sentAlert.status.length) {
          sentAlertStatus = sentAlert.status[0]
        } else {
          sentAlertStatus = SentAlertStatus.create({
            idSentAlert: sentAlert.idSentAlert,
            idUser: req.user.uuid
          })
        }
        sentAlertStatus.viewed = 1
        sentAlertStatus.save()
      }

      return { success: true }
    })(req, res, next)
  }
}

module.exports = Rest.routes(new SentAlertController())
