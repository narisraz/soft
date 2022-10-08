'use strict'

const logger = require('log4js').getLogger()

exports.initialize = (configArg) => {
}

exports.send = (options) => {
  logger.info(options)
}
