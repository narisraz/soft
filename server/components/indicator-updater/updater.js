'use strict'

const dbConfig = requireComponent('db-config')
const moment = require('moment')
const orm = requireComponent('orm')
const P = require('bluebird')
const logger = require('log4js').getLogger()

const Indicator = orm.getModel('ind.Indicator')
const AllBillingPeriods = orm.getModel('tour.AllBillingPeriods')

const co = P.coroutine

class Updater {
  constructor() {
    this.counter = 0
  }

  *getCurrentBillingPeriod() {
    const billingPeriod = yield orm.db.exec('Tour_GetBillingPeriodForDate', [moment().toDate()])
    return billingPeriod && billingPeriod.length && billingPeriod[0].billingPeriod
  }

  *getHistoricBillingPeriod() {
    const allBillingPeriods = yield AllBillingPeriods.get()
    if (!allBillingPeriods || !allBillingPeriods.length)
      return
    const billingPeriod = allBillingPeriods[
      (this.counter / 2) % allBillingPeriods.length
    ]
    return billingPeriod.billingPeriod
  }

  *updateIndicatorsCo() {
    const indicators = yield Indicator
      .whereNotNull('idIndicatorType')
      .whereEither([
        q => q.where('idServer', dbConfig.idServer),
        q => q.whereNull('idServer')
      ])
      .get()

    let billingPeriod

    if (this.counter % 2) {
      billingPeriod = yield* this.getCurrentBillingPeriod()
    } else {
      billingPeriod = yield* this.getHistoricBillingPeriod()
    }
    this.counter++

    if (!billingPeriod)
      return

    /* For each indicator: check if the indicator has a manual value for the
     * current billing period. If so, nothing to do.
     */
    for (let indicator of indicators) {
      const manualValue = yield indicator.relationship('values').query()
        .where('idServer', dbConfig.idServer)
        .where('billingPeriod', billingPeriod)
        .where('manual', true)
        .first()

      if (manualValue)
        continue

      yield indicator.setValue(
        null,
        dbConfig.idServer,
        billingPeriod,
        0,
        false
      )
    }
  }

  updateIndicators() {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    return co(this.updateIndicatorsCo.bind(this))()
    .then(() => this.isRunning = false)
    .catch(e => {
      this.isRunning = false
      logger.warn('Error in processing indicators', e)
    })
  }

  run(app) {
    setInterval(this.updateIndicators.bind(this), 60 * 1000)
  }
}

module.exports = Updater
