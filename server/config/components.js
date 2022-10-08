'use strict'

const config = require('./environment')
const email = requireComponent('email')
const orm = requireComponent('orm')
const storage = requireComponent('storage')

module.exports = app => {
  orm.initialize(config.sql.driver, config.sql[config.sql.driver])
  email.initialize(config.email)
  storage.initialize(config.storage)
}
