const log4js = require('log4js')
const config = require('./environment')

log4js.configure(config.log)
