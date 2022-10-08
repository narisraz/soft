'use strict'

const ical = require('ical-generator')

let cal
let config
let driver

exports.getCalFile = options => {
  cal = ical({
    domain: config.calendarDomain,
    name: config.calendarName
  })

  cal.createEvent({
    start: options.date,
    end: options.date,
    allDay: true,
    summary: options.subject
  })

  return cal.toString()
}

exports.initialize = (configArg) => {
  config = configArg
  let driverName = config.driver
  driver = require('./drivers/' + driverName)
  driver.initialize(config[driverName])

  cal = ical({
    domain: config.calendarDomain,
    name: config.calendarName
  })
}

exports.send = options => {
  if (options.date)
    options.cal = exports.getCalFile(options)
  driver.send(options)
}
