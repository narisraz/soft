'use strict'

const _ = require('lodash')
const P = require('bluebird')
const co = P.coroutine
const emailComponent = requireComponent('email')
const orm = requireComponent('orm')
const Alert = orm.getModel('ind.Alert')
const Server = orm.getModel('prm.Server')
const SentAlert = orm.getModel('ind.SentAlert')
const SentAlertEmail = orm.getModel('ind.SentAlertEmail')
const Indicator = orm.getModel('ind.Indicator')
const moment = require('moment')
const ejs = require('ejs')
const fs = require('fs')
const dbConfig = requireComponent('db-config')
const logger = require('log4js').getLogger()

function loadView(viewName) {
  const filename = __dirname + '/views/' + viewName + '.ejs'
  return ejs.compile(fs.readFileSync(filename, 'utf-8'), { filename })
}
const views = {
  1: loadView('always'),
  2: loadView('missing-indicators'),
  3: loadView('out-of-bounds')
}

/**
 * Alert runner
 */
class Runner {
  /**
   * Returns the Nth Xday of the month
   *
   * @param {numeric} year The current year
   * @param {numeric} month 0-based month (Jan=0, Dec=11)
   * @param {numeric} weekDay The ISO week Day number (1=Mon, 7=Sun)
   * @param {numeric} weekDayNumber If negative, the nth last, if positive, the nth
   *
   * @return {date}
   *
   * Example,
   * getNthXDay(2016, 1, 3, 2) = The second wednesday of february 2016
   * getNthXDay(2016, 1, 1, -1) = The last monday of february 2016
   */
  getNthXday(year, month, weekDay, weekDayNumber) {
    if (weekDayNumber > 0) {
      let dayDelta = weekDay - moment.utc([year, month, 1]).isoWeekday()
      if (dayDelta < 0) dayDelta += 7
      return moment.utc([year, month, dayDelta + (weekDayNumber-1) * 7 + 1])
    } else if (weekDayNumber < 0) {
      let dayDelta = moment.utc([year, month, 1]).endOf('month').isoWeekday() - weekDay
      if (dayDelta < 0) dayDelta += 7
      return moment.utc([year, month,
        moment.utc([year, month, 1]).endOf('month').date() -
        dayDelta +
        (weekDayNumber + 1) * 7
      ])
    } else {
      return null
    }
  }

  /**
   * Returns a date corresponding to the given alert, for the current month.
   * @return date
   */
  getDate(dateType, monthDay, weekDay, weekDayNumber, fixedDate, addMonths) {
    const date = moment.utc().add(addMonths || 0, 'month')
    const currentYear = date.year()
    const currentMonth = date.month()

    switch (dateType) {
    case 1: // The X of each month
      return moment.utc([currentYear, currentMonth, monthDay])
    case 2: // The nth Xday of each month
      return this.getNthXday(currentYear, currentMonth, weekDay, weekDayNumber)
    case 3: // Fixed date
      return moment.utc(fixedDate).startOf('day') // Ensure it is rounded to the day
    default:
      return null
    }
  }

  getSendDate(alert) {
    return this.getDate(alert.sendDateType, alert.sendMonthDay,
      alert.sendWeekDay, alert.sendWeekDayNumber, alert.sendFixedDate)
  }

  getEventDate(alert, addMonths) {
    return this.getDate(alert.eventDateType, alert.eventMonthDay,
      alert.eventWeekDay, alert.eventWeekDayNumber, alert.eventFixedDate, addMonths)
  }

  *missingIndicators(idServer, billingPeriod) {
    let res = []
    let query = Indicator.query()
    if (idServer)
      query.where('idServer', idServer)
    const indicators = yield query.get()
    for (let indicator of indicators) {
      let value = yield indicator.relationship('values').query()
        .where('billingPeriod', billingPeriod)
        .where('manual', true)
        .first()
      if (!value) {
        res.push({ indicator })
      }
    }
    return res
  }

  /**
   * Returns an array representing all the indicators which are out of bounds.
   *
   * The array is an array of the following structures:
   *
   * {
   *   indicator, // The indicator (Ind_Indicator) document itself
   *   value,     // The value (Ind_IndicatorValue) document
   *   percent    // A percentage indicating from how much it is over or under the limit
   * }
   */
  *outOfBoundIndicators(idServer, billingPeriod) {
    let res = []
    let query = Indicator.query()
    const indicators = yield query.get()
    for (let indicator of indicators) {
      let value = yield indicator.relationship('lastValues').query()
        .where('idServer', idServer)
        .where('billingPeriod', billingPeriod).first()
      if (value && (value.value < indicator.alertMin || value.value > indicator.alertMax)) {
        let percent = null
        if (value.value > indicator.alertMax && indicator.alertMax !== 0) {
          // If value is 150 and alertMax is 100 => 50%;
          percent = 100 * (value.value - indicator.alertMax) / indicator.alertMax
        } else if (value.value < indicator.alertMin && indicator.alertMin !== 0) {
          // If value is 50 and alertMin is 100 => 50%
          percent = 100 * (indicator.alertMin - value.value) / indicator.alertMin
        }
        if (percent < 0) // When the limit is negative
          percent = -percent
        res.push({ indicator, value, percent })
      }
    }

    return res
  }

  /**
   * Returns whether the condition for said alert is met.
   *
   * @return {array} Empty array if none of the conditions are met, or an
   *   array describing the conditions that were met.
   */
  *alertConditionStatus(alert, idServer, billingPeriod) {
    /* Alert conditions:
     * 1) Always,
     * 2) Missing indicators
     * 3) Indicators out of bounds
     */
    let res
    switch (alert.alertType) {
    case 1:
      return [{}]
    case 2:
      res = yield* this.missingIndicators(idServer, billingPeriod)
      return res
    case 3:
      res = yield* this.outOfBoundIndicators(idServer, billingPeriod)
      return res
    default:
      return []
    }
  }

  *getCurrentBillingPeriod() {
    const billingPeriod = yield orm.db.exec('Tour_GetBillingPeriodForDate', [moment.utc().toDate()])
    return billingPeriod && billingPeriod.length && billingPeriod[0].billingPeriod
  }

  *getBillingPeriodDate(billingPeriod) {
    const date = yield orm.db.exec('Tour_GetBillingPeriodReferenceDate', [billingPeriod])
    return date && date.length && date[0].referenceDate
  }

  *sendAlertEmail(description, descriptionParams, alert, sentAlert, email) {
    yield SentAlertEmail.create({
      idSentAlert: sentAlert.idSentAlert,
      idUser: email.idUser,
      email: email.email,
      description
    }).save()

    if (email.email) {
      emailComponent.send({
        to: email.email,
        subject: (alert.server ? alert.server.name + ' : ' : '') + alert.title,
        html: description,
        date: descriptionParams.eventDate
      })
    }
  }

  *groupStatusByOwner(idServer, status) {
    let owners = {}
    for (let stat of status) {
      if (stat.indicator) {
        const indicatorOwners = yield stat.indicator.relationship('users').query()
          .whereEither(
            q => q.where('idServer', dbConfig.idServer),
            q => q.where('idServer', idServer)
          )
          .get()
        for (let owner of indicatorOwners) {
          if (!owners[owner.uuid]) owners[owner.uuid] = { owner, status: [] }
          owners[owner.uuid].status.push(stat)
        }
      }
    }
    return _.values(owners)
  }

  *sendAlert(alert, idServer, status, billingPeriod, sentDate) {
    let eventDate = this.getEventDate(alert)
    if (eventDate.isBefore(sentDate)) {
      eventDate = this.getEventDate(alert, 1)
    }
    eventDate = eventDate && eventDate.toDate()
    const date = yield* this.getBillingPeriodDate(billingPeriod)

    yield alert.expand(['emails', 'server'])
    const server = yield Server.findOrFail(idServer)
    const descriptionParams = {
      alert, status, billingPeriod, date, moment, sentDate, eventDate, server
    }
    let description = views[alert.alertType] && views[alert.alertType](descriptionParams)

    const sentAlert = yield SentAlert.create({
      idServer: idServer,
      idAlert: alert.idAlert,
      billingPeriod, sentDate, expiresDate: eventDate, description
    }).save()

    for (let email of alert.emails) {
      yield* this.sendAlertEmail(description, descriptionParams, alert, sentAlert, email)
    }

    if (alert.sendToIndicatorOwners) {
      const owners = yield* this.groupStatusByOwner(idServer, status)

      for (let ownerStatus of owners) {
        let indicatorOwnerDescription = _.clone(descriptionParams)
        indicatorOwnerDescription.status = ownerStatus.status
        description = views[alert.alertType] && views[alert.alertType](indicatorOwnerDescription)

        yield* this.sendAlertEmail(description, descriptionParams, alert, sentAlert, {
          email: ownerStatus.owner.email,
          idUser: ownerStatus.owner.uuid
        })
      }
    }
  }

  *processAlert(alert) {
    yield alert.expand(['servers'])

    // Resolves the alert specification as dates
    let sendDate = this.getSendDate(alert)
    sendDate = sendDate && sendDate.toDate()

    // Checks if today's the alert's date
    const today = moment.utc().startOf('day')
    if (!today.isSame(sendDate))
      return

    // Checks if the alert has already been sent today
    const sentAlert = yield SentAlert
      .where('sentDate', today)
      .where('idAlert', alert.idAlert).first()
    if (sentAlert)
      return

    // Checks if the alert condition is met
    let billingPeriod = yield* this.getCurrentBillingPeriod()
    billingPeriod += alert.period

    let serverList = alert.idServer ?
      [ alert.idServer ] :
      alert.servers.map(server => server.idServer)

    for (let idServer of serverList) {
      const conditionStatus = yield* this.alertConditionStatus(
        alert, idServer, billingPeriod)
      if (!conditionStatus.length)
        continue

      // Puts the alert in the alerts table
      yield* this.sendAlert(alert, idServer, conditionStatus,
        billingPeriod, sendDate)
    }
  }

  *updateAlertsCo() {
    const alerts = yield Alert.get()
    for (let alert of alerts) {
      yield* this.processAlert(alert)
    }
  }

  updateAlerts() {
    return co(this.updateAlertsCo.bind(this))().catch(e => {
      logger.warn('Error in processing alerts', e)
    })
  }

  *alertUpdatedCo(alert) {
    const sendDate = this.getSendDate(alert)
    const today = moment.utc().startOf('day')
    // If the alert is supposed to be sent again this month (sendDate ≥ today), remove it from
    // the list of sent alerts if appropriate. If the alert was sent in the past, do not remove
    // it.
    if (!sendDate.isSameOrAfter(today))
      return null

    const startOfMonth = moment.utc().startOf('month')
    const sentAlert = yield SentAlert
      .where('sentDate', '>=', startOfMonth)
      .where('idAlert', alert.idAlert)
      .first()

    return sentAlert
      ? yield sentAlert.delete()
      : null
  }

  alertUpdated(alert) {
    return co(this.alertUpdatedCo.bind(this))(alert).catch(e => {
      logger.warn('Error after alert update', e)
    })
  }

  run(app, interval) {
    // Registers a hook that erases the current month sent alerts when an alert is updated
    const self = this // capture the outer self
    Alert.hooks.afterUpdate.push(function() {
      // has to be function function and not arrow function  because we need 'this'
      return self.alertUpdated(this)
    })

    // Checks alerts at a fixed interval
    if (dbConfig.syncConfig.server) {
      setInterval(this.updateAlerts.bind(this), interval)
    }
  }
}

module.exports = Runner
